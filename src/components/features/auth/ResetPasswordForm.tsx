'use client'

import { Button } from '@/components/ui/button'
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '@/lib/forms/authSchemas'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useResetPasswordMutation } from '@/store/features/auth/authApi'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialToken = useMemo(
    () => searchParams.get('token') ?? '',
    [searchParams],
  )

  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const [form, setForm] = useState<ResetPasswordSchema>({
    token: initialToken,
    newPassword: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordSchema, string>>
  >({})
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialToken) {
      router.replace('/auth/forgot-password')
    }
  }, [initialToken, router])

  useEffect(() => {
    if (!status) {
      return
    }

    const timer = window.setTimeout(() => {
      router.replace('/auth/login')
    }, 3000)

    return () => window.clearTimeout(timer)
  }, [router, status])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors({})
    setStatus(null)
    setError(null)

    const parsed = resetPasswordSchema.safeParse(form)

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors({
        token: flattened.token?.[0],
        newPassword: flattened.newPassword?.[0],
        confirmPassword: flattened.confirmPassword?.[0],
      })
      return
    }

    try {
      const response = await resetPassword({
        token: parsed.data.token,
        newPassword: parsed.data.newPassword,
      }).unwrap()
      setStatus(response.message ?? 'Password reset complete.')
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
        <h1 className="text-2xl font-semibold">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Route: /auth/reset-password
        </p>
      </div>

      <label className="block space-y-1 text-sm">
        <span>Reset token</span>
        <input
          value={form.token}
          onChange={(event) =>
            setForm((current) => ({ ...current, token: event.target.value }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="Paste token"
        />
        {fieldErrors.token ? (
          <p className="text-xs text-destructive">{fieldErrors.token}</p>
        ) : null}
      </label>

      <label className="block space-y-1 text-sm">
        <span>New password</span>
        <input
          type="password"
          value={form.newPassword}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              newPassword: event.target.value,
            }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="At least 8 characters"
        />
        {fieldErrors.newPassword ? (
          <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>
        ) : null}
      </label>

      <label className="block space-y-1 text-sm">
        <span>Confirm password</span>
        <input
          type="password"
          value={form.confirmPassword}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              confirmPassword: event.target.value,
            }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="Re-enter password"
        />
        {fieldErrors.confirmPassword ? (
          <p className="text-xs text-destructive">
            {fieldErrors.confirmPassword}
          </p>
        ) : null}
      </label>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset password'}
      </Button>

      {status ? (
        <p className="text-sm text-primary">
          {status} Redirecting to login in 3 seconds.
        </p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <p className="text-sm text-muted-foreground">
        Back to{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          login
        </Link>
      </p>
    </form>
  )
}
