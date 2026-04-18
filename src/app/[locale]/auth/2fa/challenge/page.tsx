'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { AuthCard } from '@/components/layout/authCard'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import { useRequireTempToken } from '@/lib/auth/guards'
import { extractSession } from '@/lib/auth/normalize-auth'
import { resolveAuthenticatedDestination } from '@/lib/auth/onboarding'
import { clearPersistedTempToken } from '@/lib/auth/temp-token'
import {
  extractEmailFromTempToken,
  getTwoFactorMethodPreference,
} from '@/lib/auth/two-factor-preferences'
import {
  useChallengeTwoFactorMutation,
  useSendTwoFactorEmailOtpMutation,
} from '@/store/features/auth/authApi'
import { clearTempToken } from '@/store/features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

type ChallengeMethod = 'authenticator' | 'email' | 'backup'

const methodMeta: Record<
  ChallengeMethod,
  { label: string; placeholder: string; helper: string }
> = {
  authenticator: {
    label: 'Authenticator',
    placeholder: '6-digit authenticator code',
    helper: 'Enter the code from your authenticator app.',
  },
  email: {
    label: 'Email OTP',
    placeholder: '6-digit email OTP',
    helper: 'Use the code we sent to your email address.',
  },
  backup: {
    label: 'Backup Code',
    placeholder: '8-10 digit backup code',
    helper: 'Use one of your saved one-time backup codes.',
  },
}

const methodPreferenceMap = {
  totp: 'authenticator',
  email: 'email',
  both: null,
} as const

const sanitizeOtp = (value: string) => value.replace(/\D/g, '').slice(0, 6)
const sanitizeBackupCode = (value: string) =>
  value.replace(/\D/g, '').slice(0, 10)

export default function TwoFactorChallengePage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const dispatch = useAppDispatch()
  useRequireTempToken(locale)

  const tempToken =
    useAppSelector((state) => state.auth.tempToken)?.trim() || null

  const tempTokenEmail = useMemo(() => {
    if (!tempToken) {
      return null
    }

    return extractEmailFromTempToken(tempToken)
  }, [tempToken])

  const preferredMethod = useMemo(() => {
    if (!tempTokenEmail) {
      return null
    }

    return getTwoFactorMethodPreference(tempTokenEmail)
  }, [tempTokenEmail])

  const availableMethods = useMemo<ChallengeMethod[]>(() => {
    if (!preferredMethod || preferredMethod === 'both') {
      return ['authenticator', 'email', 'backup']
    }

    const mapped = methodPreferenceMap[preferredMethod]

    if (!mapped) {
      return ['authenticator', 'email', 'backup']
    }

    return [mapped, 'backup']
  }, [preferredMethod])

  const [selectedMethod, setSelectedMethod] = useState<ChallengeMethod>(
    availableMethods[0] ?? 'authenticator',
  )
  const method = availableMethods.includes(selectedMethod)
    ? selectedMethod
    : (availableMethods[0] ?? 'authenticator')
  const [authenticatorOtp, setAuthenticatorOtp] = useState('')
  const [emailOtp, setEmailOtp] = useState('')
  const [backupCode, setBackupCode] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [emailCooldown, setEmailCooldown] = useState(0)

  const [challengeTwoFactor, { isLoading }] = useChallengeTwoFactorMutation()
  const [sendEmailOtp, { isLoading: isSending }] =
    useSendTwoFactorEmailOtpMutation()

  useEffect(() => {
    if (emailCooldown <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setEmailCooldown((current) => Math.max(0, current - 1))
    }, 1000)

    return () => {
      window.clearInterval(interval)
    }
  }, [emailCooldown])

  const getActiveValue = () => {
    if (method === 'authenticator') {
      return authenticatorOtp.trim()
    }

    if (method === 'email') {
      return emailOtp.trim()
    }

    return backupCode.trim()
  }

  const getChallengePayload = () => {
    const value = getActiveValue()

    if (method === 'backup') {
      if (!/^\d{8,10}$/.test(value)) {
        throw new Error('Backup code must be 8 to 10 digits.')
      }

      return { backupCode: value }
    }

    if (!/^\d{6}$/.test(value)) {
      throw new Error(
        method === 'email'
          ? 'Email OTP must be 6 digits.'
          : 'Authenticator OTP must be 6 digits.',
      )
    }

    return method === 'email' ? { emailOtp: value } : { otp: value }
  }

  const onSendOtp = async () => {
    if (!tempToken) {
      toast.error('Missing temporary token')
      return
    }

    if (emailCooldown > 0) {
      return
    }

    try {
      await sendEmailOtp({ tempToken }).unwrap()
      setEmailCooldown(60)
      toast.success('OTP sent to your email')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send OTP'))
    }
  }

  const onSubmit = async () => {
    if (!tempToken) {
      toast.error('Missing temporary token')
      return
    }

    setSubmitError(null)

    try {
      const challengePayload = getChallengePayload()
      const response = await challengeTwoFactor({
        tempToken,
        ...challengePayload,
      }).unwrap()
      const session = extractSession(response.data)

      if (!session) {
        toast.error('Invalid challenge response')
        return
      }

      applyAuthenticatedSession(dispatch, {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      })

      toast.success('Two-factor challenge passed')
      const destination = await resolveAuthenticatedDestination({
        accessToken: session.accessToken,
        locale,
      })
      router.push(destination)
    } catch (error) {
      if (error instanceof Error && error.message.includes('digits')) {
        setSubmitError(error.message)
        return
      }

      setSubmitError(getApiErrorMessage(error, 'Challenge failed'))
    }
  }

  const onBackToLogin = () => {
    clearPersistedTempToken()
    dispatch(clearTempToken())
    router.replace(`/${locale}/auth/login`)
  }

  const activeMethod = methodMeta[method]

  const otpValue = method === 'authenticator' ? authenticatorOtp : emailOtp

  return (
    <AuthCard
      title="Verify with 2FA"
      subtitle="Choose a method to complete sign-in."
    >
      <div className="space-y-3">
        <div
          className={`grid gap-2 ${availableMethods.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
        >
          {availableMethods.map((item) => (
            <Button
              key={item}
              type="button"
              variant={method === item ? 'default' : 'outline'}
              onClick={() => setSelectedMethod(item)}
            >
              {methodMeta[item].label}
            </Button>
          ))}
        </div>

        {preferredMethod && preferredMethod !== 'both' ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Preferred method from your last setup:{' '}
            {
              methodMeta[
                methodPreferenceMap[preferredMethod] ?? 'authenticator'
              ].label
            }
            . Backup codes are always available.
          </p>
        ) : null}

        <p className="text-xs text-muted-foreground">{activeMethod.helper}</p>

        {method === 'authenticator' || method === 'email' ? (
          <div className="space-y-2">
            <input
              value={otpValue}
              onChange={(event) => {
                const value = sanitizeOtp(event.target.value)

                if (method === 'authenticator') {
                  setAuthenticatorOtp(value)
                } else {
                  setEmailOtp(value)
                }

                if (submitError) {
                  setSubmitError(null)
                }
              }}
              inputMode="numeric"
              className="h-10 w-full rounded-lg border border-input px-3 text-center text-sm tracking-[0.3em]"
              placeholder={activeMethod.placeholder}
            />

            {method === 'email' ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onSendOtp}
                disabled={isSending || emailCooldown > 0}
              >
                {isSending
                  ? 'Sending...'
                  : emailCooldown > 0
                    ? `Resend in ${emailCooldown}s`
                    : 'Send OTP'}
              </Button>
            ) : null}
          </div>
        ) : null}

        {method === 'backup' ? (
          <input
            value={backupCode}
            onChange={(event) => {
              setBackupCode(sanitizeBackupCode(event.target.value))
              if (submitError) {
                setSubmitError(null)
              }
            }}
            inputMode="numeric"
            className="h-10 w-full rounded-lg border border-input px-3 text-center text-sm tracking-[0.2em]"
            placeholder={activeMethod.placeholder}
          />
        ) : null}

        {submitError ? (
          <p className="text-xs text-destructive">{submitError}</p>
        ) : null}

        <Button
          type="button"
          className="w-full"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Verifying...' : 'Verify and continue'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBackToLogin}
        >
          Back to login
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Trouble signing in?{' '}
          <Link
            href={`/${locale}/auth/login`}
            className="text-primary underline-offset-4 hover:underline"
          >
            Return to login
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
