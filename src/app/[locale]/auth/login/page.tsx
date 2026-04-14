'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthCard } from '@/components/layout/auth-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useRedirectAuthenticated } from '@/lib/auth/guards'
import { extractLoginPayload } from '@/lib/auth/normalize-auth'
import { resolveAuthenticatedDestination } from '@/lib/auth/onboarding'
import { persistSession } from '@/lib/auth/token-storage'
import { env } from '@/lib/env'
import { cn } from '@/lib/utils'
import { useLoginMutation } from '@/store/features/auth/authApi'
import {
  setAuthenticatedSession,
  setLoginOutcome,
} from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  useRedirectAuthenticated(locale)

  const [login, { isLoading }] = useLoginMutation()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      toast.error(error)
    }
  }, [searchParams])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const response = await login(values).unwrap()
      const loginPayload = extractLoginPayload(response.data)

      if (!loginPayload) {
        throw new Error('Unexpected login response')
      }

      if (loginPayload.requiresTwoFactor) {
        dispatch(setLoginOutcome(loginPayload))
        toast.success('Two-factor verification required')
        router.push(`/${locale}/auth/2fa/challenge`)
        return
      }

      persistSession({
        accessToken: loginPayload.accessToken,
        refreshToken: loginPayload.refreshToken,
      })

      dispatch(
        setAuthenticatedSession({
          token: loginPayload.accessToken,
          user: loginPayload.user,
        }),
      )

      toast.success('Logged in')
      const destination = await resolveAuthenticatedDestination({
        accessToken: loginPayload.accessToken,
        locale,
      })
      router.push(destination)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed'))
    }
  })

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Use your Stackread account to continue."
    >
      <form className="space-y-3" onSubmit={onSubmit}>
        <div className="space-y-1">
          <label className="text-sm font-medium">Email</label>
          <input
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            type="email"
            autoComplete="email"
            {...form.register('email')}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Password</label>
          <input
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
            type="password"
            autoComplete="current-password"
            {...form.register('password')}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

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

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href={`/${locale}/auth/forgot-password`}
        >
          Forgot password?
        </Link>
        <Link
          className="text-primary underline-offset-4 hover:underline"
          href={`/${locale}/auth/register`}
        >
          Create account
        </Link>
      </div>
    </AuthCard>
  )
}
