'use client'

import { Apple, Lock, Mail } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthSplitShell } from '@/components/auth/authSplitShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { applyAuthenticatedSession } from '@/lib/auth/client-session'
import { useRedirectAuthenticated } from '@/lib/auth/guards'
import { extractLoginPayload } from '@/lib/auth/normalize-auth'
import { resolveAuthenticatedDestination } from '@/lib/auth/onboarding'
import { persistTempToken } from '@/lib/auth/temp-token'
import { env } from '@/lib/env'
import { useLoginMutation } from '@/store/features/auth/authApi'
import { setLoginOutcome } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.'),
})

type LoginValues = z.infer<typeof loginSchema>
type LoginErrors = Partial<Record<keyof LoginValues, string>>

const inputClassName =
  'h-12 w-full rounded-md border border-transparent bg-[#e4e8eb] px-11 text-[15px] text-[#11151a] placeholder:text-[#8d98a3] transition outline-none focus:border-transparent focus:ring-2 focus:ring-[#0a6f79]'

const inputErrorClassName =
  'bg-[#fce8e8] text-[#b42318] placeholder:text-[#d66f6f] focus:ring-[#d92d20]'

const primaryButtonClassName =
  'h-12 w-full rounded-md bg-[#006d77] text-[18px] font-semibold text-white transition hover:bg-[#005a62] focus:outline-none focus:ring-2 focus:ring-[#0a6f79] disabled:cursor-not-allowed disabled:opacity-70'

const socialButtonClassName =
  'flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-[#d7dde2] bg-transparent text-[15px] font-medium text-[#171b21] transition hover:bg-[#f6f8fa] focus:outline-none focus:ring-2 focus:ring-[#0a6f79]'

export default function LoginPage() {
  const router = useRouter()
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  useRedirectAuthenticated(locale)

  const [login, { isLoading }] = useLoginMutation()
  const [values, setValues] = useState<LoginValues>({ email: '', password: '' })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [rememberMe, setRememberMe] = useState(false)

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors])

  useEffect(() => {
    const error = searchParams.get('error')
    const reset = searchParams.get('reset')
    const verified = searchParams.get('verified')

    if (reset === '1') {
      toast.success(
        'Password reset successful. Please login with your new password.',
      )
    }

    if (verified === '1') {
      toast.success('Email verified successfully. Please login.')
    }

    if (error) {
      toast.error(error)
    }
  }, [searchParams])

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validation = loginSchema.safeParse(values)

    if (!validation.success) {
      const fieldErrors: LoginErrors = {}
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (path === 'email' || path === 'password') {
          fieldErrors[path] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    setErrors({})

    try {
      const response = await login({
        email: validation.data.email.trim().toLowerCase(),
        password: validation.data.password,
      }).unwrap()
      const loginPayload = extractLoginPayload(response.data)

      if (!loginPayload) {
        throw new Error('Unexpected login response')
      }

      if (loginPayload.requiresTwoFactor) {
        persistTempToken(loginPayload.tempToken)
        dispatch(setLoginOutcome(loginPayload))
        toast.success('Two-factor verification required')
        router.push(`/${locale}/auth/2fa/challenge`)
        return
      }

      applyAuthenticatedSession(dispatch, {
        accessToken: loginPayload.accessToken,
        refreshToken: loginPayload.refreshToken,
        user: loginPayload.user,
      })

      toast.success('Logged in')
      const destination = await resolveAuthenticatedDestination({
        accessToken: loginPayload.accessToken,
        locale,
      })

      if (rememberMe) {
        localStorage.setItem(
          'stackread:last-email',
          validation.data.email.trim(),
        )
      }

      router.push(destination)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Login failed'))
    }
  }

  useEffect(() => {
    const savedEmail = localStorage.getItem('stackread:last-email')
    if (savedEmail) {
      setValues((previous) => ({ ...previous, email: savedEmail }))
    }
  }, [])

  return (
    <AuthSplitShell
      brandLabel="StackRead"
      heroVariant="login"
      heroTitle={
        <>
          Reconnect with
          <br />
          the world&apos;s
          <br />
          wisdom.
        </>
      }
      heroDescription="Access the universal library and uncover ideas that shape the future."
      heading="Welcome Back"
      description="Access your curated library and personalized bookmarks."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold tracking-[0.14em] text-[#2f3c4a] uppercase">
            Email Address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7785]" />
            <input
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
                if (errors.email) {
                  setErrors((previous) => ({ ...previous, email: undefined }))
                }
              }}
              className={`${inputClassName} ${errors.email ? inputErrorClassName : ''}`}
              placeholder="curator@stackread.com"
              aria-invalid={Boolean(errors.email)}
            />
          </div>
          {errors.email ? (
            <p className="text-xs text-[#d92d20]">{errors.email}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold tracking-[0.14em] text-[#2f3c4a] uppercase">
              Password
            </label>
            <Link
              href={`/${locale}/auth/forgot-password`}
              className="text-xs font-medium text-[#0a5369] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7785]" />
            <input
              type="password"
              autoComplete="current-password"
              value={values.password}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
                if (errors.password) {
                  setErrors((previous) => ({
                    ...previous,
                    password: undefined,
                  }))
                }
              }}
              className={`${inputClassName} ${errors.password ? inputErrorClassName : ''}`}
              placeholder="........"
              aria-invalid={Boolean(errors.password)}
            />
          </div>
          {errors.password ? (
            <p className="text-xs text-[#d92d20]">{errors.password}</p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm text-[#3f4b57]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.target.checked)}
            className="size-4 rounded-sm border border-[#bcc7d1] bg-transparent accent-[#006d77]"
          />
          Remember me for 30 days
        </label>

        <button
          type="submit"
          className={primaryButtonClassName}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[#d5dce2]" />
          <p className="text-[11px] tracking-[0.16em] text-[#788390] uppercase">
            Or continue with
          </p>
          <div className="h-px flex-1 bg-[#d5dce2]" />
        </div>

        <div className="flex gap-3">
          <a
            className={socialButtonClassName}
            href={`${env.apiBaseUrl}/auth/google`}
            aria-label="Continue with Google"
          >
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-1.9 3v2.5h3.1c1.8-1.6 2.8-4 2.8-6.8 0-.6-.1-1.1-.2-1.7H12z"
              />
              <path
                fill="#34A853"
                d="M12 22c2.5 0 4.5-.8 6-2.2l-3.1-2.5c-.9.6-2 .9-3 .9-2.3 0-4.2-1.5-4.9-3.6H3.8v2.6C5.3 20 8.4 22 12 22z"
              />
              <path
                fill="#4A90E2"
                d="M7.1 14.5c-.2-.6-.3-1.1-.3-1.7 0-.6.1-1.2.3-1.7V8.5H3.8C3.3 9.6 3 10.8 3 12s.3 2.4.8 3.5l3.3-1z"
              />
              <path
                fill="#FBBC05"
                d="M12 6.1c1.3 0 2.5.4 3.4 1.3l2.6-2.6C16.5 3.3 14.5 2.5 12 2.5 8.4 2.5 5.3 4.5 3.8 7.6l3.3 2.6C7.8 7.6 9.7 6.1 12 6.1z"
              />
            </svg>
            Google
          </a>
          <button
            type="button"
            className={socialButtonClassName}
            onClick={() => toast.info('Apple login is coming soon.')}
          >
            <Apple className="size-4" />
            Apple
          </button>
        </div>

        <p className="pt-3 text-center text-sm text-[#404c57]">
          New to StackRead?{' '}
          <Link
            className="font-medium text-[#06556e] hover:underline"
            href={`/${locale}/auth/register`}
          >
            Create a account
          </Link>
        </p>
      </form>

      {hasErrors ? (
        <div className="sr-only">Form has validation errors</div>
      ) : null}
    </AuthSplitShell>
  )
}
