'use client'

import { Button } from '@/components/ui/button'
import { forgotPasswordSchema } from '@/lib/forms/authSchemas'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useForgotPasswordMutation } from '@/store/features/auth/authApi'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ForgotPasswordForm() {
  const router = useRouter()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldError(null)
    setError(null)

    const parsed = forgotPasswordSchema.safeParse({ email })

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldError(flattened.email?.[0] ?? 'Enter a valid email address.')
      return
    }

    try {
      await forgotPassword({ email: parsed.data.email }).unwrap()
      router.replace(
        `/auth/check-email?email=${encodeURIComponent(parsed.data.email)}`,
      )
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
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Route: /auth/forgot-password
        </p>
      </div>

      <label className="block space-y-1 text-sm">
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="you@example.com"
        />
        {fieldError ? (
          <p className="text-xs text-destructive">{fieldError}</p>
        ) : null}
      </label>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Submitting...' : 'Send reset instructions'}
      </Button>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  )
}
