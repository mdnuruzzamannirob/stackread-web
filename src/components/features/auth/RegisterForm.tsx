'use client'

import { Button } from '@/components/ui/button'
import { COUNTRIES } from '@/constants/countries'
import { registerSchema, type RegisterSchema } from '@/lib/forms/authSchemas'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import { useRegisterMutation } from '@/store/features/auth/authApi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function RegisterForm() {
  const router = useRouter()
  const [register, { isLoading }] = useRegisterMutation()

  const [form, setForm] = useState<RegisterSchema>({
    name: '',
    email: '',
    password: '',
    countryCode: 'BD',
  })
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterSchema, string>>
  >({})
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const parsed = registerSchema.safeParse(form)

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors
      setFieldErrors({
        name: flattened.name?.[0],
        email: flattened.email?.[0],
        password: flattened.password?.[0],
        countryCode: flattened.countryCode?.[0],
      })
      return
    }

    try {
      await register(parsed.data).unwrap()

      router.replace(
        `/auth/check-email?email=${encodeURIComponent(form.email)}`,
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
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-muted-foreground">Route: /auth/register</p>
      </div>

      <label className="block space-y-1 text-sm">
        <span>Name</span>
        <input
          value={form.name}
          onChange={(event) =>
            setForm((current) => ({ ...current, name: event.target.value }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="Your name"
        />
        {fieldErrors.name ? (
          <p className="text-xs text-destructive">{fieldErrors.name}</p>
        ) : null}
      </label>

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
          placeholder="At least 8 characters"
        />
        {fieldErrors.password ? (
          <p className="text-xs text-destructive">{fieldErrors.password}</p>
        ) : null}
      </label>

      <label className="block space-y-1 text-sm">
        <span>Country</span>
        <select
          value={form.countryCode}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              countryCode: event.target.value,
            }))
          }
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          {COUNTRIES.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} ({country.code})
            </option>
          ))}
        </select>
        {fieldErrors.countryCode ? (
          <p className="text-xs text-destructive">{fieldErrors.countryCode}</p>
        ) : null}
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Register'}
      </Button>

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
