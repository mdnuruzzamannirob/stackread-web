'use client'

import AuthShell from '@/components/AuthShell'
import InputField from '@/components/InputField'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import { useRequireTempToken } from '@/lib/auth/guards'
import { resolveAuthenticatedDestination } from '@/lib/auth/onboarding'
import type { RecoveryCodeChallengeSchema } from '@/lib/validations/auth'
import { recoveryCodeChallengeSchema } from '@/lib/validations/auth'
import type { RootState } from '@/store'
import { authApi } from '@/store/features/auth/authApi'
import { zodResolver } from '@hookform/resolvers/zod'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'

const TwoFactorAuthenticationRecovery = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useDispatch()
  useRequireTempToken(locale)

  // Get tempToken from Redux auth state
  const { tempToken } = useSelector((state: RootState) => state.auth)

  const [challengeTwoFactor, { isLoading }] =
    authApi.useChallengeTwoFactorMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecoveryCodeChallengeSchema>({
    resolver: zodResolver(recoveryCodeChallengeSchema),
  })

  const onSubmit = async (data: RecoveryCodeChallengeSchema) => {
    if (!tempToken) {
      toast.error('Unable to continue 2FA flow. Please sign in again.')
      return
    }

    try {
      const response = await challengeTwoFactor({
        tempToken,
        method: 'backup-code',
        verificationCode: data.code,
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

      const destination = await resolveAuthenticatedDestination({
        accessToken: response.data.token,
        locale,
      })

      router.push(destination)
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Verification failed. Please check your code.',
      )
      toast.error(errorMessage)
    }
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Secure Your Knowledge"
          description="One more step to protect your digital archive."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Use Backup Code
                </h1>
                <p className="text-gray-500">
                  Enter one of your backup codes to continue. Each code can only
                  be used once.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <InputField
                    icon={<Lock size={17} />}
                    type="text"
                    label="Backup Code"
                    placeholder="Enter your backup code"
                    {...register('code')}
                    error={errors.code?.message}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <p className="mt-4 text-center text-sm text-gray-500">
                  Don&apos;t have a backup code?{' '}
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

export default TwoFactorAuthenticationRecovery
