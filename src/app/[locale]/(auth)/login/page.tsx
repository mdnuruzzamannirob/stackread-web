'use client'

import AuthShell from '@/components/AuthShell'
import InputField from '@/components/InputField'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import { persistTempToken } from '@/lib/auth/temp-token'
import type { LoginSchema } from '@/lib/validations/auth'
import { loginSchema } from '@/lib/validations/auth'
import { authApi } from '@/store/features/auth/authApi'
import {
  setEmailInFlow,
  setLoginOutcome,
  setRememberMe,
} from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

const LoginPage = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()
  const [rememberMe, setRememberMeChecked] = useState(false)

  const [login, { isLoading }] = authApi.useLoginMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginSchema) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
        rememberMe,
      }).unwrap()

      if (!response.data) {
        toast.error('An unexpected error occurred')
        return
      }

      // Check if 2FA is required
      if (response.data.requiresTwoFactor) {
        // Store temp token and redirect to 2FA method selection
        dispatch(setRememberMe(rememberMe))
        dispatch(setEmailInFlow(data.email))
        dispatch(setLoginOutcome(response.data))
        persistTempToken(response.data.tempToken)
        router.push(`/${locale}/login/2fa`)
      } else {
        applyAuthenticatedSession(dispatch, {
          token: response.data.token,
          user: response.data.user,
        })

        toast.success('Logged in successfully')
        router.push(`/${locale}/dashboard`)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Login failed. Please check your credentials.',
      )
      toast.error(errorMessage)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Reconnect with the world's wisdom."
          description="Access the universal library and uncover ideas that shape the future."
        />

        {/* Right */}
        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Welcome Back
                </h1>
                <p className="text-slate-500">
                  Sign in to continue your reading journey with StackRead.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <InputField
                    icon={<Mail size={17} />}
                    type="email"
                    label="Email Address"
                    placeholder="john@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                  />
                </div>

                <div className="mb-4">
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label className="cursor-pointer select-none text-sm font-medium text-gray-600">
                      Password<span className="ml-0.5 text-red-500">*</span>
                    </label>

                    <Link
                      href={`/${locale}/forgot-password`}
                      className="text-sm font-medium text-teal-700 hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <InputField
                    icon={<Lock size={17} />}
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    error={errors.password?.message}
                  />
                </div>

                <div
                  className="group mb-5 flex w-fit cursor-pointer select-none items-start gap-3"
                  onClick={() => setRememberMeChecked(!rememberMe)}
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
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
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
                    href={`/${locale}/register`}
                    className="font-medium text-teal-700 hover:underline"
                  >
                    Create one
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

export default LoginPage
