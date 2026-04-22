'use client'

import AuthShell from '@/components/AuthShell'
import OtpInputField from '@/components/OtpInputField'
import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useResendResetOtpMutation,
  useVerifyResetOtpMutation,
} from '@/store/features/auth/authApi'
import { setResetToken } from '@/store/features/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

const RESEND_SECONDS = 30

const VerifyResetEmailPage = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()
  const emailInFlow = useAppSelector((state) => state.auth.emailInFlow)

  const [verifyResetOtp, { isLoading: isVerifying }] =
    useVerifyResetOtpMutation()
  const [resendResetOtp, { isLoading: isResending }] =
    useResendResetOtpMutation()

  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)
  console.log(otp)
  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!emailInFlow) {
      toast.error('Email not found. Please start forgot password again.')
      router.replace(`/${locale}/forgot-password`)
      return
    }

    try {
      const response = await verifyResetOtp({
        email: emailInFlow,
        otp,
      }).unwrap()

      if (response.data?.resetToken) {
        dispatch(setResetToken(response.data.resetToken))
        toast.success('Code verified successfully.')
        router.push(`/${locale}/reset-password`)
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Verification failed. Please try again.'),
      )
    }
  }

  const handleResend = async () => {
    if (!emailInFlow) {
      toast.error('Email not found. Please start forgot password again.')
      router.replace(`/${locale}/forgot-password`)
      return
    }

    try {
      await resendResetOtp({ email: emailInFlow }).unwrap()
      setSent(true)
      setSecondsLeft(RESEND_SECONDS)
      setOtp('')
      toast.success('Code resent to your email')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to resend reset code.'))
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Verify your identity."
          description="Confirm the code we sent before choosing a new password."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Verify Reset Code
                </h1>
                <p className="text-gray-500">
                  Enter the 6-digit code sent to{' '}
                  <span className="font-medium text-gray-900">
                    {emailInFlow}
                  </span>
                </p>
              </div>

              <form onSubmit={handleVerify}>
                <div className="mb-5">
                  <OtpInputField
                    length={6}
                    onChange={setOtp}
                    value={otp}
                    disabled={isVerifying}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || otp.length !== 6}
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Code'}
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  {secondsLeft > 0 ? (
                    <span>Resend available in {secondsLeft}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      {isResending
                        ? 'Sending...'
                        : sent
                          ? 'Resend code again'
                          : 'Resend code'}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link
                    href={`/${locale}/login`}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Sign in
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

export default VerifyResetEmailPage
