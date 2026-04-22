'use client'

import AuthShell from '@/components/AuthShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useRequireTempToken } from '@/lib/auth/guards'
import {
  extractEmailFromTempToken,
  getTwoFactorMethodPreference,
  type TwoFactorMethodPreference,
} from '@/lib/auth/two-factor-preferences'
import { Circle, CircleDot, Lock, Mail, Shield } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { authApi } from '@/store/features/auth/authApi'
import { setSelectedTwoFactorMethod } from '@/store/features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

const TwoFactorAuthentication = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()
  const { tempToken, emailInFlow } = useAppSelector((state) => state.auth)

  const [sendTwoFactorEmailOtp, { isLoading: isSendingEmailOtp }] =
    authApi.useSendTwoFactorEmailOtpMutation()
  const [methodPreference, setMethodPreference] = useState<
    TwoFactorMethodPreference | null | undefined
  >(undefined)

  useRequireTempToken(locale)

  useEffect(() => {
    const resolvedEmail =
      emailInFlow ?? (tempToken ? extractEmailFromTempToken(tempToken) : null)

    if (!resolvedEmail) {
      return
    }

    setMethodPreference(getTwoFactorMethodPreference(resolvedEmail))
  }, [emailInFlow, tempToken])

  const visibleMethods = useMemo<
    Array<'totp' | 'email' | 'backup-code'>
  >(() => {
    if (methodPreference === undefined) {
      return []
    }

    if (methodPreference === 'email') {
      return ['email', 'backup-code']
    }

    if (methodPreference === 'totp') {
      return ['totp', 'backup-code']
    }

    return ['totp', 'email', 'backup-code']
  }, [methodPreference])

  const handleEmailMethod = async () => {
    if (!tempToken) {
      toast.error('Unable to continue 2FA flow. Please sign in again.')
      return
    }

    dispatch(setSelectedTwoFactorMethod('email'))

    try {
      await sendTwoFactorEmailOtp({ tempToken }).unwrap()
      toast.success('Verification code sent to your email.')
      router.push(`/${locale}/login/2fa/email`)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Failed to send the email verification code.',
        ),
      )
    }
  }

  const handleTotpMethod = () => {
    dispatch(setSelectedTwoFactorMethod('totp'))
    router.push(`/${locale}/login/2fa/totp`)
  }

  const handleBackupCodeMethod = () => {
    dispatch(setSelectedTwoFactorMethod('backup-code'))
    router.push(`/${locale}/login/2fa/recovery`)
  }

  const isMethodsLoading = methodPreference === undefined

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Security Layer"
          description="Protecting Your Universal Library."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Choose Verification Method
                </h1>
                <p className="text-gray-500">
                  Choose a secondary verification method to maintain the
                  integrity of your curated collection.
                </p>
              </div>

              <div className="space-y-3">
                {isMethodsLoading ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                    Loading available verification methods...
                  </div>
                ) : (
                  <>
                    {visibleMethods.includes('totp') && (
                      <button
                        type="button"
                        onClick={handleTotpMethod}
                        className="relative group flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-all duration-150 hover:border-teal-600 hover:bg-white hover:ring-[2.5px] hover:ring-teal-600/10 cursor-pointer"
                      >
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 transition-colors duration-150 group-hover:bg-teal-600">
                          <Shield
                            size={20}
                            className="group-hover:text-white duration-150 transition-colors"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                            Authenticator App
                          </h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700">
                            Generate codes via Google or Microsoft
                          </p>
                        </div>

                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <Circle
                            size={18}
                            className="text-gray-400 transition-all duration-150 group-hover:opacity-0"
                          />
                          <CircleDot
                            size={18}
                            className="absolute inset-0 text-teal-600 opacity-0 transition-all duration-150 group-hover:opacity-100"
                          />
                        </div>
                      </button>
                    )}

                    {visibleMethods.includes('email') && (
                      <button
                        type="button"
                        onClick={handleEmailMethod}
                        disabled={isSendingEmailOtp}
                        className="relative group flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-all duration-150 hover:border-teal-600 hover:bg-white hover:ring-[2.5px] hover:ring-teal-600/10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 transition-colors duration-150 group-hover:bg-teal-600">
                          <Mail
                            size={20}
                            className="group-hover:text-white duration-150 transition-colors"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                            Email OTP
                          </h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700">
                            One-time code sent to your inbox
                          </p>
                        </div>

                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <Circle
                            size={18}
                            className="text-gray-400 transition-all duration-150 group-hover:opacity-0"
                          />
                          <CircleDot
                            size={18}
                            className="absolute inset-0 text-teal-600 opacity-0 transition-all duration-150 group-hover:opacity-100"
                          />
                        </div>
                      </button>
                    )}

                    {visibleMethods.includes('backup-code') && (
                      <button
                        type="button"
                        onClick={handleBackupCodeMethod}
                        className="relative group flex w-full items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left transition-all duration-150 hover:border-teal-600 hover:bg-white hover:ring-[2.5px] hover:ring-teal-600/10 cursor-pointer"
                      >
                        <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 transition-colors duration-150 group-hover:bg-teal-600">
                          <Lock
                            size={20}
                            className="group-hover:text-white duration-150 transition-colors"
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                            Backup Codes
                          </h3>
                          <p className="text-sm text-gray-600 group-hover:text-gray-700">
                            Use a pre-generated offline code
                          </p>
                        </div>

                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                          <Circle
                            size={18}
                            className="text-gray-400 transition-all duration-150 group-hover:opacity-0"
                          />
                          <CircleDot
                            size={18}
                            className="absolute inset-0 text-teal-600 opacity-0 transition-all duration-150 group-hover:opacity-100"
                          />
                        </div>
                      </button>
                    )}
                  </>
                )}
              </div>

              <p className="mt-8 text-center text-sm text-gray-500">
                <Link
                  href={`/${locale}/login`}
                  className="font-medium text-teal-700 hover:underline"
                >
                  Back to login
                </Link>
              </p>
            </div>
          </div>
          <div className="px-6 pb-6 flex sm:flex-row flex-col-reverse items-center justify-between flex-wrap text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} StackRead. All rights reserved.
            </p>
            <div className="">
              <Link
                href="/support"
                className="font-medium text-teal-700 hover:underline"
              >
                Support
              </Link>{' '}
              |{' '}
              <Link
                href="/terms"
                className="font-medium text-teal-700 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              |{' '}
              <Link
                href="/privacy"
                className="font-medium text-teal-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TwoFactorAuthentication
