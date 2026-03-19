'use client'

import { Button } from '@/components/ui/button'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useResendVerificationMutation } from '@/store/features/auth/authApi'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

const RESEND_WAIT_SECONDS = 60

export default function EmailCheckPanel() {
  const searchParams = useSearchParams()
  const [resendVerification, { isLoading }] = useResendVerificationMutation()

  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])
  const [secondsRemaining, setSecondsRemaining] = useState(RESEND_WAIT_SECONDS)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return
    }

    const timer = window.setTimeout(() => {
      setSecondsRemaining((current) => current - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [secondsRemaining])

  const handleResend = async () => {
    if (!email || secondsRemaining > 0) {
      return
    }

    setStatus(null)
    setError(null)

    try {
      const response = await resendVerification({ email }).unwrap()
      setStatus(response.message ?? 'Verification email sent.')
      setSecondsRemaining(RESEND_WAIT_SECONDS)
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent instructions to continue your authentication flow.
        </p>
      </div>

      <div className="mt-4 rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p className="text-muted-foreground">Email address</p>
        <p className="font-medium">{email || 'No email provided'}</p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          type="button"
          onClick={handleResend}
          disabled={isLoading || !email || secondsRemaining > 0}
        >
          {isLoading
            ? 'Sending...'
            : secondsRemaining > 0
              ? `Resend in ${secondsRemaining}s`
              : 'Resend email'}
        </Button>

        <Link
          href="/auth/login"
          className="text-sm text-primary hover:underline"
        >
          Back to login
        </Link>
      </div>

      {status ? <p className="mt-4 text-sm text-primary">{status}</p> : null}
      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </section>
  )
}
