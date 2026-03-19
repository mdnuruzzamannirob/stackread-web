import { COUNTRY_CODE_SET } from '@/constants/countries'
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72),
  countryCode: z
    .string()
    .trim()
    .length(2, 'Select a valid country.')
    .transform((value) => value.toUpperCase())
    .refine((value) => COUNTRY_CODE_SET.has(value), 'Select a valid country.'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(10, 'Token must be at least 10 characters.'),
})

export const resendVerificationSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
})

export const staffLoginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const twoFactorVerifySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Code must be 6 digits.'),
})

export const twoFactorDisableSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Code must be 6 digits.'),
})

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(10, 'Token must be at least 10 characters.'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(72),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>
export type ResendVerificationSchema = z.infer<typeof resendVerificationSchema>
export type StaffLoginSchema = z.infer<typeof staffLoginSchema>
export type TwoFactorVerifySchema = z.infer<typeof twoFactorVerifySchema>
export type TwoFactorDisableSchema = z.infer<typeof twoFactorDisableSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
