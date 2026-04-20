'use client'

import AuthShell from '@/components/AuthShell'
import InputField from '@/components/InputField'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Recover your account."
          description="We'll help you regain access to your StackRead library securely."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Forgot Password
                </h1>
                <p className="text-slate-500">
                  Enter your email address and we will send you a password reset
                  link.
                </p>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  console.log('Forgot password request:', email)
                }}
              >
                <div className="mb-4">
                  <InputField
                    icon={<Mail size={17} />}
                    type="email"
                    name="email"
                    label="Email Address"
                    required
                    placeholder="john@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99]"
                >
                  Send Reset Link
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          </div>{' '}
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

export default ForgotPasswordPage
