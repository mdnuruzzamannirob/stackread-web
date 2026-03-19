'use client'

import { Button } from '@/components/ui/button'
import { applyStaffSession } from '@/lib/auth/session'
import { getAccessToken } from '@/lib/auth/tokenStorage'
import {
  twoFactorDisableSchema,
  twoFactorVerifySchema,
} from '@/lib/forms/authSchemas'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import {
  useDisableTwoFactorMutation,
  useEnableTwoFactorMutation,
  useLazyGetStaffMeQuery,
  useVerifyTwoFactorMutation,
} from '@/store/features/staffAuth/staffAuthApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export function TwoFactorPanel() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verifyTwoFactor, { isLoading }] = useVerifyTwoFactorMutation()
  const [enableTwoFactor, { isLoading: isEnabling }] =
    useEnableTwoFactorMutation()
  const [disableTwoFactor, { isLoading: isDisabling }] =
    useDisableTwoFactorMutation()
  const [getStaffMe] = useLazyGetStaffMeQuery()
  const pendingToken = useAppSelector(
    (state) => state.auth.pendingTwoFactorToken,
  )
  const actorType = useAppSelector((state) => state.auth.actorType)

  const redirectPath = useMemo(
    () => searchParams.get('redirect') || '/admin',
    [searchParams],
  )

  const [code, setCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [setupSecret, setSetupSecret] = useState<string | null>(null)
  const [otpAuthUrl, setOtpAuthUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    code?: string
    disablePassword?: string
    disableCode?: string
  }>({})
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors((current) => ({ ...current, code: undefined }))
    setStatus(null)
    setError(null)

    const parsed = twoFactorVerifySchema.safeParse({ code })

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors((current) => ({ ...current, code: flattened.code?.[0] }))
      return
    }

    try {
      const response = await verifyTwoFactor({
        code: parsed.data.code,
      }).unwrap()
      const token = response.data.accessToken
      const meResponse = await getStaffMe(undefined, true).unwrap()

      applyStaffSession(dispatch, {
        token,
        staff: meResponse.data,
      })

      router.replace(redirectPath)
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  const handleEnableSetup = async () => {
    setError(null)
    setStatus(null)

    try {
      const response = await enableTwoFactor().unwrap()
      setSetupSecret(response.data.secret)
      setOtpAuthUrl(response.data.otpauthUrl ?? null)
      setStatus(
        '2FA setup started. Add this secret to your authenticator app, then verify with a code below.',
      )
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  const handleDisable = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors((current) => ({
      ...current,
      disablePassword: undefined,
      disableCode: undefined,
    }))
    setError(null)
    setStatus(null)

    const parsed = twoFactorDisableSchema.safeParse({
      password: disablePassword,
      code: disableCode,
    })

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors((current) => ({
        ...current,
        disablePassword: flattened.password?.[0],
        disableCode: flattened.code?.[0],
      }))
      return
    }

    try {
      await disableTwoFactor(parsed.data).unwrap()
      setDisablePassword('')
      setDisableCode('')
      setSetupSecret(null)
      setOtpAuthUrl(null)
      setStatus('Two-factor authentication has been disabled.')
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  const hasChallengeToken = Boolean(pendingToken || getAccessToken('staff'))
  const isLoggedInStaff = actorType === 'staff'

  if (!hasChallengeToken) {
    return (
      <div className="space-y-2 rounded-lg border border-border p-6">
        <h1 className="text-2xl font-semibold">Two-factor verification</h1>
        <p className="text-sm text-muted-foreground">
          No pending 2FA session found.
        </p>
        <a href="/admin/login">
          <Button type="button" variant="outline">
            Back to staff login
          </Button>
        </a>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-border p-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Two-factor verification</h1>
        <p className="text-sm text-muted-foreground">Route: /admin/2fa</p>
      </div>

      <label className="block space-y-1 text-sm">
        <span>6-digit code</span>
        <input
          required
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={code}
          onChange={(event) =>
            setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="123456"
        />
        {fieldErrors.code ? (
          <p className="text-xs text-destructive">{fieldErrors.code}</p>
        ) : null}
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {status ? <p className="text-sm text-primary">{status}</p> : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify code'}
      </Button>

      {isLoggedInStaff ? (
        <div className="space-y-4 border-t border-border pt-4">
          <div className="space-y-2">
            <h2 className="text-base font-semibold">Manage 2FA</h2>
            <Button
              type="button"
              variant="outline"
              onClick={handleEnableSetup}
              disabled={isEnabling}
            >
              {isEnabling ? 'Generating setup...' : 'Enable / Reset setup'}
            </Button>
            {setupSecret ? (
              <div className="rounded-md border border-border p-3 text-sm">
                <p className="font-medium">Authenticator secret</p>
                <p className="break-all font-mono text-xs text-muted-foreground">
                  {setupSecret}
                </p>
                {otpAuthUrl ? (
                  <p className="mt-1 break-all text-xs text-muted-foreground">
                    {otpAuthUrl}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <form
            onSubmit={handleDisable}
            className="space-y-3 rounded-md border border-border p-3"
          >
            <h3 className="text-sm font-semibold">Disable 2FA</h3>
            <label className="block space-y-1 text-sm">
              <span>Password</span>
              <input
                type="password"
                value={disablePassword}
                onChange={(event) => setDisablePassword(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3"
                placeholder="Current password"
              />
              {fieldErrors.disablePassword ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.disablePassword}
                </p>
              ) : null}
            </label>
            <label className="block space-y-1 text-sm">
              <span>6-digit code</span>
              <input
                value={disableCode}
                onChange={(event) =>
                  setDisableCode(
                    event.target.value.replace(/[^0-9]/g, '').slice(0, 6),
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3"
                placeholder="123456"
              />
              {fieldErrors.disableCode ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.disableCode}
                </p>
              ) : null}
            </label>
            <Button type="submit" variant="outline" disabled={isDisabling}>
              {isDisabling ? 'Disabling...' : 'Disable 2FA'}
            </Button>
          </form>
        </div>
      ) : null}
    </form>
  )
}
