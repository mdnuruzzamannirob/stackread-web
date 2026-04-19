'use client'

import AuthHeroSection from '@/components/auth/AuthHeroSection'
import OtpInputField from '@/components/OtpInputField'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const RESEND_SECONDS = 30

const TwoFactorAuthenticationEmail = () => {
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
        <AuthHeroSection
          backgroundImage="https://images.unsplash.com/photo-1563552671-12d1a8e1e4ba?w=1200&h=1600&fit=crop"
          title="Verify Your Identity"
          description="A security code has been sent to your email."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
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

            <form
              onSubmit={(event) => {
                event.preventDefault()
                console.log('Email 2FA OTP submitted:', otp)
              }}
            >
              <div className="mb-5">
                <OtpInputField
                  length={6}
                  onChange={setOtp}
                  onComplete={(value) =>
                    console.log('Email 2FA OTP complete:', value)
                  }
                />
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99]"
              >
                Verify & Continue
              </button>

              <div className="mt-4 text-center text-sm text-gray-500">
                {secondsLeft > 0 ? (
                  <span>Resend available in {secondsLeft}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSecondsLeft(RESEND_SECONDS)
                    }}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Resend code
                  </button>
                )}
              </div>

              <p className="mt-4 text-center text-sm text-gray-500">
                Didn&apos;t receive the email?{' '}
                <Link
                  href="/login/2fa"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Try another method
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TwoFactorAuthenticationEmail
