'use client'

import AuthShell from '@/components/AuthShell'
import InputField from '@/components/InputField'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '@/lib/validations/auth'
import { useForgotPasswordMutation } from '@/store/features/auth/authApi'
import { setEmailInFlow } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'

const ForgotPasswordPage = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordSchema) => {
    try {
      await forgotPassword({ email: data.email }).unwrap()
      dispatch(setEmailInFlow(data.email))
      toast.success('Reset code sent to your email')
      router.push(`/${locale}/verify-email`)
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Failed to send reset code. Please try again.',
      )
      toast.error(errorMessage)
    }
  }

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
                <p className="text-gray-500">
                  Enter your email address and we&apos;ll send you a code to
                  reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <InputField
                    icon={<Mail size={17} />}
                    type="email"
                    label="Email Address"
                    required
                    placeholder="john@example.com"
                    {...register('email')}
                    error={errors.email?.message}
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Code'}
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Remember your password?{' '}
                  <Link
                    href={`/${locale}/login`}
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

export default ForgotPasswordPage
