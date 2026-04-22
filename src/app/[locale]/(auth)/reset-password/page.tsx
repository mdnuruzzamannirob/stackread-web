'use client'

import AuthShell from '@/components/AuthShell'
import InputField from '@/components/InputField'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useResetPasswordMutation } from '@/store/features/auth/authApi'
import { clearAuthFlow } from '@/store/features/auth/authSlice'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAppDispatch, useAppSelector } from '@/store/hooks'

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password is too long')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[0-9]/, 'Password must include at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must include at least one special character',
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

const ResetPasswordPage = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()
  const emailInFlow = useAppSelector((state) => state.auth.emailInFlow)
  const resetToken = useAppSelector((state) => state.auth.resetToken)

  const [resetPassword, { isLoading }] = useResetPasswordMutation()

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  })

  useEffect(() => {
    if (!emailInFlow || !resetToken) {
      router.replace(`/${locale}/forgot-password`)
    }
  }, [emailInFlow, locale, resetToken, router])

  const onSubmit = async (data: PasswordFormData) => {
    if (!emailInFlow || !resetToken) {
      toast.error('Session expired. Please start over.')
      router.push(`/${locale}/forgot-password`)
      return
    }

    try {
      await resetPassword({
        email: emailInFlow,
        resetToken,
        newPassword: data.newPassword,
      }).unwrap()

      toast.success('Password reset successfully!')
      dispatch(clearAuthFlow())
      window.setTimeout(() => {
        router.push(`/${locale}/login`)
      }, 2000)
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Failed to reset password. Please try again.',
        ),
      )
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Secure your account."
          description="Create a strong new password to protect your StackRead library."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Create New Password
                </h1>
                <p className="text-slate-500">
                  Choose a strong new password for your account.
                </p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <InputField
                    icon={<Lock size={17} />}
                    type="password"
                    label="New Password"
                    required
                    placeholder="••••••••"
                    {...passwordForm.register('newPassword')}
                    error={passwordForm.formState.errors.newPassword?.message}
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <InputField
                    icon={<Lock size={17} />}
                    type="password"
                    label="Confirm Password"
                    required
                    placeholder="••••••••"
                    {...passwordForm.register('confirmPassword')}
                    error={
                      passwordForm.formState.errors.confirmPassword?.message
                    }
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

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

export default ResetPasswordPage
