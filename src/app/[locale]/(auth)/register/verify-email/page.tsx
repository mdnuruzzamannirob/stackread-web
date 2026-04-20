'use client'

import AuthShell from '@/components/AuthShell'
import OtpInputField from '@/components/OtpInputField'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const RESEND_SECONDS = 30

const VerifyEmail = () => {
  const [sent, setSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [secondsLeft])

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Verify your email."
          description="Confirm your email address to activate your StackRead account."
        />

        {/* Right */}
        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Verify Your Email
                </h1>
                <p className="text-slate-500">
                  Enter the 6-digit code we sent to your email address to finish
                  creating your account.
                </p>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  console.log('Email verification OTP:', otp)
                }}
              >
                <div className="mb-5">
                  <OtpInputField
                    length={6}
                    onChange={setOtp}
                    onComplete={(value) =>
                      console.log('Email OTP complete:', value)
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Verify Email
                </button>

                <div className="mt-4 text-center text-sm text-gray-500">
                  {secondsLeft > 0 ? (
                    <span>Resend available in {secondsLeft}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSent(true)
                        setSecondsLeft(RESEND_SECONDS)
                      }}
                      className="font-medium text-teal-700 hover:underline"
                    >
                      {sent ? 'Resend code again' : 'Resend code'}
                    </button>
                  )}
                </div>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Log in
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

export default VerifyEmail
