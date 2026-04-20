'use client'

import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { AuthSplitShell } from '@/components/auth/authSplitShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useRedirectAuthenticated } from '@/lib/auth/guards'
import { useResetPasswordMutation } from '@/store/features/auth/authApi'

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/\d/, 'Password must include at least one number.')
      .regex(/[^A-Za-z0-9]/, 'Password must include at least one symbol.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

type ResetValues = z.infer<typeof resetPasswordSchema>
type ResetErrors = Partial<Record<keyof ResetValues, string>>

export default function ResetPasswordPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  useRedirectAuthenticated(locale)
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('resetToken') ?? ''
  const email = searchParams.get('email') ?? ''
  const [values, setValues] = useState<ResetValues>({
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<ResetErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation()

  const getPasswordStrength = (value: string) => {
    let score = 0

    if (value.length >= 8) score += 1
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
    if (/\d/.test(value)) score += 1
    if (/[^A-Za-z0-9]/.test(value)) score += 1

    if (score <= 1) return { label: 'Weak', width: '25%' }
    if (score === 2) return { label: 'Fair', width: '50%' }
    if (score === 3) return { label: 'Good', width: '75%' }

    return { label: 'Strong', width: '100%' }
  }

  const validatePassword = () => {
    const validation = resetPasswordSchema.safeParse(values)

    if (validation.success) {
      setErrors({})
      return validation.data
    }

    const nextErrors: ResetErrors = {}

    validation.error.issues.forEach((issue) => {
      const path = issue.path[0]
      if (path === 'newPassword' || path === 'confirmPassword') {
        nextErrors[path] = issue.message
      }
    })

    setErrors(nextErrors)
    return null
  }

  const onResetPassword = async () => {
    if (!resetToken) {
      toast.error('Your reset session is missing. Verify OTP again.')
      return
    }

    const validatedData = validatePassword()
    if (!validatedData) {
      return
    }

    try {
      await resetPassword({
        resetToken,
        newPassword: validatedData.newPassword,
      }).unwrap()
      toast.success(
        'Password reset complete. You have been signed out on other devices.',
      )
      router.replace(`/${locale}/auth/login?reset=1`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Password reset failed'))
    }
  }

  const strength = getPasswordStrength(values.newPassword)

  return (
    <AuthSplitShell
      brandLabel="Editorial Intelligence"
      heroVariant="reset"
      heroTitle={
        <>
          Secure Your
          <br />
          Digital Archive
        </>
      }
      heroDescription=""
      heading="Reset Password"
      description="Choose a strong new password to protect your curations."
    >
      <div className="space-y-5">
        {email ? (
          <p className="text-xs text-[#4b5865]">
            Resetting password for {email}
          </p>
        ) : null}

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#10151b]">
            New Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7785]" />
            <input
              value={values.newPassword}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  newPassword: event.target.value,
                }))
                if (errors.newPassword) {
                  setErrors((previous) => ({
                    ...previous,
                    newPassword: undefined,
                  }))
                }
              }}
              className={`h-12 w-full rounded-md border border-transparent bg-[#e4e8eb] px-11 pr-11 text-[15px] text-[#11151a] placeholder:text-[#8d98a3] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#0a6f79] ${errors.newPassword ? 'bg-[#fce8e8] text-[#b42318] placeholder:text-[#d66f6f] focus:ring-[#d92d20]' : ''}`}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              aria-invalid={Boolean(errors.newPassword)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((previous) => !previous)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#567194] focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.newPassword ? (
            <p className="text-xs text-[#d92d20]">{errors.newPassword}</p>
          ) : null}
        </div>

        <div className="space-y-1">
          <div className="h-1.5 w-full rounded-full bg-[#ced4da]">
            <div
              className="h-1.5 rounded-full bg-[#0f7280] transition-all"
              style={{ width: strength.width }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-[#355475]">
            <span>Password Strength</span>
            <span>{strength.label}</span>
          </div>
          <p className="text-xs text-[#355475]">
            Must be at least 8 characters, including a number and a symbol.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-[#10151b]">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#6a7785]" />
            <input
              value={values.confirmPassword}
              onChange={(event) => {
                setValues((previous) => ({
                  ...previous,
                  confirmPassword: event.target.value,
                }))
                if (errors.confirmPassword) {
                  setErrors((previous) => ({
                    ...previous,
                    confirmPassword: undefined,
                  }))
                }
              }}
              className={`h-12 w-full rounded-md border border-transparent bg-[#e4e8eb] px-11 pr-11 text-[15px] text-[#11151a] placeholder:text-[#8d98a3] outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#0a6f79] ${errors.confirmPassword ? 'bg-[#fce8e8] text-[#b42318] placeholder:text-[#d66f6f] focus:ring-[#d92d20]' : ''}`}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((previous) => !previous)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#567194] focus:outline-none"
              aria-label={
                showConfirmPassword ? 'Hide password' : 'Show password'
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs text-[#d92d20]">{errors.confirmPassword}</p>
          ) : null}
        </div>

        <button
          type="button"
          className="h-12 w-full rounded-md bg-[#006d77] text-[17px] font-semibold text-white transition hover:bg-[#005a62] focus:outline-none focus:ring-2 focus:ring-[#0a6f79] disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onResetPassword}
          disabled={isResetting}
        >
          {isResetting ? 'Updating...' : 'Update Password'}
        </button>

        <button
          type="button"
          onClick={() => router.push(`/${locale}/auth/login`)}
          className="mx-auto flex items-center gap-2 text-sm text-[#184f79] hover:underline"
        >
          <ArrowLeft className="size-4" />
          Return to Log In
        </button>

        {!resetToken ? (
          <p className="text-xs text-[#4b5865]">
            Missing reset token.{' '}
            <Link
              href={`/${locale}/auth/verify-otp${email ? `?email=${encodeURIComponent(email)}` : ''}`}
              className="font-medium text-[#0a5369] hover:underline"
            >
              Verify OTP again
            </Link>
          </p>
        ) : null}
      </div>
    </AuthSplitShell>
  )
}
