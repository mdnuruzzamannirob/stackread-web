'use client'

import AuthHeroSection from '@/components/auth/AuthHeroSection'
import InputField from '@/components/InputField'
import { Check, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface FormData {
  email: string
  password: string
  rememberMe: boolean
}

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    rememberMe: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthHeroSection
          backgroundImage="https://images.unsplash.com/photo-1507842872343-583f20270319?w=1200&h=1600&fit=crop"
          title="Reconnect with the world's wisdom."
          description="Access the universal library and uncover ideas that shape the future."
        />

        {/* Right */}
        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
          <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Welcome Back
              </h1>
              <p className="text-slate-500">
                Sign in to continue your reading journey with StackRead.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <InputField
                  icon={<Mail size={17} />}
                  type="email"
                  name="email"
                  label="Email Address"
                  required
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="field-password"
                    className="cursor-pointer select-none text-sm font-medium text-gray-600"
                  >
                    Password<span className="ml-0.5 text-red-500">*</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-teal-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <InputField
                  icon={<Lock size={17} />}
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              <div
                className="group mb-5 flex w-fit cursor-pointer select-none items-start gap-3"
                onClick={() => {
                  const nextValue = !rememberMe
                  setRememberMe(nextValue)
                  setFormData((prev) => ({
                    ...prev,
                    rememberMe: nextValue,
                  }))
                }}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all duration-150 ${
                    rememberMe
                      ? 'border-teal-700 bg-teal-700'
                      : 'border-gray-300 bg-white group-hover:border-teal-500'
                  }`}
                >
                  {rememberMe && (
                    <Check size={12} strokeWidth={3} className="text-white" />
                  )}
                </div>

                <span className="text-sm leading-relaxed text-gray-500">
                  Remember me
                </span>
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99]"
              >
                Sign In
              </button>

              <div className="my-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs tracking-widest text-gray-400">
                  OR CONTINUE WITH
                </span>
                <div className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="mb-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-sm transition hover:bg-gray-100"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 48 48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 text-sm transition hover:bg-gray-100"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill="#1877F2"
                      d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                    />
                  </svg>
                  Facebook
                </button>
              </div>

              <p className="text-center text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default LoginPage
