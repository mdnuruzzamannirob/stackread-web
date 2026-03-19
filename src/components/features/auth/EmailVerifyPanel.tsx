'use client'

import { Button } from '@/components/ui/button'
import {
  resendVerificationSchema,
  verifyEmailSchema,
} from '@/lib/forms/authSchemas'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from '@/store/features/auth/authApi'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export function EmailVerifyPanel() {
  const searchParams = useSearchParams()
  const initialToken = useMemo(
    () => searchParams.get('token') ?? '',
    [searchParams],
  )
  const initialEmail = useMemo(
    () => searchParams.get('email') ?? '',
    [searchParams],
  )

  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation()
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation()

  const [token, setToken] = useState(initialToken)
  const [email, setEmail] = useState(initialEmail)
  const [fieldErrors, setFieldErrors] = useState<{
    token?: string
    email?: string
  }>({})
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors((current) => ({ ...current, token: undefined }))
    setStatus(null)
    setError(null)

    const parsed = verifyEmailSchema.safeParse({ token })

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors((current) => ({ ...current, token: flattened.token?.[0] }))
      return
    }

    try {
      const response = await verifyEmail({ token: parsed.data.token }).unwrap()
      setStatus(response.message ?? 'Email verified successfully.')
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  const submitResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFieldErrors((current) => ({ ...current, email: undefined }))
    setStatus(null)
    setError(null)

    const parsed = resendVerificationSchema.safeParse({ email })

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors((current) => ({ ...current, email: flattened.email?.[0] }))
      return
    }

    try {
      const response = await resendVerification({
        email: parsed.data.email,
      }).unwrap()
      setStatus(response.message ?? 'Verification email sent.')
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Verify email</h1>
        <p className="text-sm text-muted-foreground">
          Route: /auth/verify-email
        </p>
      </div>

      <form onSubmit={submitVerify} className="space-y-3">
        <label className="block space-y-1 text-sm">
          <span>Verification token</span>
          <input
            required
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            placeholder="Paste token"
          />
          {fieldErrors.token ? (
            <p className="text-xs text-destructive">{fieldErrors.token}</p>
          ) : null}
        </label>
        <Button type="submit" className="w-full" disabled={isVerifying}>
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>
      </form>

      <form
        onSubmit={submitResend}
        className="space-y-3 border-t border-border pt-3"
      >
        <label className="block space-y-1 text-sm">
          <span>Resend to email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            placeholder="you@example.com"
          />
          {fieldErrors.email ? (
            <p className="text-xs text-destructive">{fieldErrors.email}</p>
          ) : null}
        </label>
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={isResending}
        >
          {isResending ? 'Sending...' : 'Resend verification'}
        </Button>
      </form>

      {status ? <p className="text-sm text-primary">{status}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
