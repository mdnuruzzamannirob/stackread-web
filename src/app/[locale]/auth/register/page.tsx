'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthCard } from '@/components/layout/authCard'
import { Button, buttonVariants } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import { useRedirectAuthenticated } from '@/lib/auth/guards'
import { extractRegisterSession } from '@/lib/auth/normalize-auth'
import { resolveAuthenticatedDestination } from '@/lib/auth/onboarding'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'
import { useRegisterMutation } from '@/store/features/auth/authApi'
import { useAppDispatch } from '@/store/hooks'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().optional(),
  email: z.email('Enter a valid email address'),
  countryCode: z.string().min(1, 'Country code is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type RegisterValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const dispatch = useAppDispatch()
  useRedirectAuthenticated(locale)
  const [register, { isLoading }] = useRegisterMutation()

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: 'BD',
      password: '',
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName?.trim() || undefined,
        email: values.email.trim().toLowerCase(),
        countryCode: values.countryCode.trim().toUpperCase(),
        password: values.password,
      }).unwrap()
      const session = extractRegisterSession(response.data)

      if (!session) {
        toast.success('Registration complete. Please verify your email.')
        router.push(
          `/${locale}/auth/check-email?email=${encodeURIComponent(values.email)}`,
        )
        return
      }

      applyAuthenticatedSession(dispatch, {
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        user: session.user,
      })

      toast.success('Account created')
      const destination = await resolveAuthenticatedDestination({
        accessToken: session.accessToken,
        locale,
      })
      router.push(destination)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registration failed'))
    }
  })

  return (
    <AuthCard
      title="Create your account"
      subtitle="Phase 2 registration via /auth/register."
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium">First name</label>
          <input
            className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            {...form.register('firstName')}
          />
          {form.formState.errors.firstName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Last name</label>
          <input
            className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            {...form.register('lastName')}
          />
          {form.formState.errors.lastName ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            className="h-10 w-full rounded-lg border border-input px-3 text-sm"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Country code</label>
            <input
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
              {...form.register('countryCode')}
            />
            {form.formState.errors.countryCode ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.countryCode.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              className="h-10 w-full rounded-lg border border-input px-3 text-sm"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.password.message}
              </p>
            ) : null}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{' '}
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href={`/${locale}/auth/login`}
        >
          Sign in
        </Link>
      </p>

      <div className="mt-4 grid gap-2">
        <a
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          href={`${env.apiBaseUrl}/auth/google`}
        >
          Continue with Google
        </a>
        <a
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
          href={`${env.apiBaseUrl}/auth/facebook`}
        >
          Continue with Facebook
        </a>
      </div>
    </AuthCard>
  )
}
