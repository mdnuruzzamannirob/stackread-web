'use client'

import AuthShell from '@/components/AuthShell'
import OtpInputField from '@/components/OtpInputField'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import type { TwoFactorChallengeSchema } from '@/lib/validations/auth'
import { twoFactorChallengeSchema } from '@/lib/validations/auth'
import type { RootState } from '@/store'
import { authApi } from '@/store/features/auth/authApi'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const RESEND_SECONDS = 30

const TwoFactorAuthenticationEmail = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useDispatch()

  // Get tempToken from Redux auth state
  const { tempToken } = useSelector((state: RootState) => state.auth)

  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  const [challengeTwoFactor, { isLoading }] =
    authApi.useChallengeTwoFactorMutation()
  const [sendTwoFactorEmailOtp, { isLoading: isSendingOtp }] =
    authApi.useSendTwoFactorEmailOtpMutation()

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<TwoFactorChallengeSchema>({
    resolver: zodResolver(twoFactorChallengeSchema),
  })

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  // Redirect if no tempToken
  if (!tempToken) {
    router.push(`/${locale}/login`)
    return null
  }

  const onSubmit = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    try {
      const response = await challengeTwoFactor({
        tempToken,
        method: 'email',
        verificationCode: otp,
      }).unwrap()

      if (!response.data) {
        toast.error('An unexpected error occurred')
        return
      }

      // Successful 2FA
      applyAuthenticatedSession(dispatch, {
        token: response.data.token,
        user: response.data.user,
      })

      toast.success('Verification successful')
      router.push(`/${locale}/dashboard`)
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Verification failed. Please check your code.',
      )
      toast.error(errorMessage)
    }
  }

  const handleResendOtp = async () => {
    try {
      await sendTwoFactorEmailOtp({ tempToken }).unwrap()
      setSecondsLeft(RESEND_SECONDS)
      toast.success('Code resent to your email')
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Failed to resend code. Please try again.',
      )
      toast.error(errorMessage)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Verify Your Identity"
          description="A security code has been sent to your email."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Verify with Email
                </h1>
                <p className="text-slate-500">
                  Enter the 6-digit code we sent to your email address to
                  continue.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-5">
                  <OtpInputField length={6} onChange={setOtp} value={otp} />
                  {errors.otp && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  {secondsLeft > 0 ? (
                    <span>Resend available in {secondsLeft}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSendingOtp}
                      className="font-medium text-teal-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingOtp ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Didn&apos;t receive the email?{' '}
                  <Link
                    href={`/${locale}/login/2fa`}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Try another method
                  </Link>
                </p>
              </form>
            </div>
          </div>
          <div className="px-6 pb-6 flex sm:flex-row flex-col-reverse items-center justify-between flex-wrap text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} StackRead. All rights reserved.
            </p>
            <div className="">
              <Link
                href={`/${locale}/support`}
                className="font-medium text-teal-700 hover:underline"
              >
                Support
              </Link>{' '}
              |{' '}
              <Link
                href={`/${locale}/terms`}
                className="font-medium text-teal-700 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              |{' '}
              <Link
                href={`/${locale}/privacy`}
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

export default TwoFactorAuthenticationEmail
