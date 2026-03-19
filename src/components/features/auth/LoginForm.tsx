'use client'

import { OAuthButtons } from '@/components/features/auth/OAuthButtons'
import { Button } from '@/components/ui/button'
import { applyUserSession } from '@/lib/auth/session'
import { loginSchema, type LoginSchema } from '@/lib/forms/authSchemas'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useLoginMutation } from '@/store/features/auth/authApi'
import { useLazyGetOnboardingStatusQuery } from '@/store/features/onboarding/onboardingApi'
import { useAppDispatch } from '@/store/hooks'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export function LoginForm() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [login, { isLoading }] = useLoginMutation()
  const [getOnboardingStatus] = useLazyGetOnboardingStatusQuery()

  const redirectPath = useMemo(
    () => searchParams.get('redirect') || '/dashboard',
    [searchParams],
  )

  const [form, setForm] = useState<LoginSchema>({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof LoginSchema, string>>
  >({})
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = loginSchema.safeParse(form)

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors({
        email: flattened.email?.[0],
        password: flattened.password?.[0],
      })
      return
    }

    try {
      const response = await login(form).unwrap()
      const result = response.data

      let onboardingStatus: 'required' | 'completed' = 'completed'

      try {
        const onboardingResponse = await getOnboardingStatus(
          undefined,
          true,
        ).unwrap()
        onboardingStatus = onboardingResponse.data.isOnboardingCompleted
          ? 'completed'
          : 'required'
      } catch {
        if (result.user.isOnboardingCompleted === false) {
          onboardingStatus = 'required'
        }
      }

      applyUserSession(dispatch, {
        token: result.tokens.accessToken,
        user: result.user,
        onboardingStatus,
      })

      if (onboardingStatus === 'required') {
        router.replace('/dashboard/onboarding/plans')
        return
      }

      router.replace(redirectPath)
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-lg border border-border p-6"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">User Login</h1>
        <p className="text-sm text-muted-foreground">Route: /auth/login</p>
      </div>

      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({ ...current, email: event.target.value }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="you@example.com"
        />
        {fieldErrors.email ? (
          <p className="text-xs text-destructive">{fieldErrors.email}</p>
        ) : null}
      </label>

      <label className="block space-y-1 text-sm">
        <span>Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) =>
            setForm((current) => ({ ...current, password: event.target.value }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="••••••••"
        />
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : null}
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>

      <OAuthButtons />

      <div className="flex items-center justify-between text-sm">
        <Link
          href="/auth/forgot-password"
          className="text-primary hover:underline"
        >
          Forgot password?
        </Link>
        <Link href="/auth/register" className="text-primary hover:underline">
          Create account
        </Link>
      </div>
    </form>
  )
}
