'use client'

import AuthShell from '@/components/AuthShell'
import InputField from '@/components/InputField'
import { redirectToOAuth } from '@/lib/auth/social-oauth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Home, Lock, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import { registerSchema, type RegisterSchema } from '@/lib/validations/auth'
import { useRegisterMutation } from '@/store/features/auth/authApi'
import { setEmailInFlow } from '@/store/features/auth/authSlice'
import { useAppDispatch } from '@/store/hooks'

const RegisterPage = () => {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string
  const dispatch = useAppDispatch()

  const [register, { isLoading }] = useRegisterMutation()
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      countryCode: 'BD',
      agreeTerms: false,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  })

  const agreeTerms = useWatch({
    control,
    name: 'agreeTerms',
    defaultValue: false,
  })

  const onSubmit = async (data: RegisterSchema) => {
    try {
      const response = await register({
        firstName: data.firstName,
        lastName: data.lastName || undefined,
        email: data.email,
        phone: data.phone ?? '',
        address: data.address ?? '',
        password: data.password,
        countryCode: data.countryCode,
        agreeToTerms: data.agreeTerms,
      }).unwrap()

      if (response.data) {
        dispatch(setEmailInFlow(data.email))
        toast.success('Registration successful! Verify your email.')
        router.push(`/${locale}/register/verify-email`)
      }
    } catch (error) {
      const errorMessage = getApiErrorMessage(
        error,
        'Registration failed. Please try again.',
      )
      toast.error(errorMessage)
    }
  }

  const startOAuthSignup = (provider: 'google' | 'facebook') => {
    redirectToOAuth(provider, locale)
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthShell
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Start your reading journey."
          description="Join millions of readers discovering knowledge in the world's largest digital library."
        />

        {/* Right */}
        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex flex-col bg-white overflow-y-auto">
          <div className="flex flex-1 items-center justify-center">
            <div className="mx-auto w-full rounded-xl max-w-lg px-4 py-16 sm:px-6">
              <div className="mb-8 space-y-2">
                <h1 className="text-2xl font-semibold sm:text-3xl">
                  Create Account
                </h1>
                <p className=" text-gray-500">
                  Start your reading journey with StackRead.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* First Name + Last Name */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <InputField
                    icon={<User size={17} />}
                    type="text"
                    label="First Name"
                    required
                    placeholder="John"
                    {...registerField('firstName')}
                    error={errors.firstName?.message}
                    disabled={isLoading}
                  />
                  <InputField
                    icon={<User size={17} />}
                    type="text"
                    label="Last Name"
                    required
                    placeholder="Doe"
                    {...registerField('lastName')}
                    error={errors.lastName?.message}
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">
                    Country Code<span className="ml-0.5 text-red-500">*</span>
                  </label>
                  <select
                    {...registerField('countryCode')}
                    disabled={isLoading}
                    className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-[2.5px] focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="BD">Bangladesh (BD)</option>
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="IN">India (IN)</option>
                  </select>
                  {errors.countryCode && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.countryCode.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="mb-4">
                  <InputField
                    icon={<Mail size={17} />}
                    type="email"
                    label="Email Address"
                    required
                    placeholder="john@example.com"
                    {...registerField('email')}
                    error={errors.email?.message}
                    disabled={isLoading}
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <InputField
                    icon={<Phone size={17} />}
                    type="tel"
                    label="Phone Number"
                    placeholder="+880 1XX-XXXXXXX"
                    {...registerField('phone')}
                    error={errors.phone?.message}
                    disabled={isLoading}
                  />
                </div>

                {/* Address */}
                <div className="mb-4">
                  <InputField
                    icon={<Home size={17} />}
                    type="text"
                    label="Address"
                    placeholder="123 Main Street"
                    {...registerField('address')}
                    error={errors.address?.message}
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <InputField
                    icon={<Lock size={17} />}
                    type="password"
                    label="Password"
                    required
                    placeholder="••••••••"
                    {...registerField('password')}
                    error={errors.password?.message}
                    disabled={isLoading}
                  />
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <InputField
                    icon={<Lock size={17} />}
                    type="password"
                    label="Confirm Password"
                    required
                    placeholder="••••••••"
                    {...registerField('confirmPassword')}
                    error={errors.confirmPassword?.message}
                    disabled={isLoading}
                  />
                </div>

                {/* Terms Checkbox */}
                <div
                  className="group flex items-start gap-3 mb-5 cursor-pointer select-none w-fit"
                  onClick={() => {
                    // This will be handled by the form, just styling
                  }}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                      agreeTerms
                        ? 'bg-teal-700 border-teal-700'
                        : 'bg-white border-gray-300 group-hover:border-teal-500'
                    }`}
                  >
                    {agreeTerms && (
                      <Check size={12} strokeWidth={3} className="text-white" />
                    )}
                  </div>

                  <label className="text-sm text-gray-500 leading-relaxed cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      hidden
                      {...registerField('agreeTerms')}
                    />
                    I agree to the{' '}
                    <a
                      href="#"
                      className="text-teal-700 hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="#"
                      className="text-teal-700 hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>
                {errors.agreeTerms && (
                  <p className="text-sm text-red-600 mb-4">
                    {errors.agreeTerms.message}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-sm font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Divider */}
                <div className="my-8 flex items-center gap-4">
                  <div className="h-px flex-1 bg-gray-200" />
                  <span className="text-xs tracking-widest text-gray-400">
                    OR CONTINUE WITH
                  </span>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>

                {/* Social Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => startOAuthSignup('google')}
                    className="flex items-center justify-center gap-2 h-11 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition text-sm"
                  >
                    {/* Google official SVG */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                    </svg>
                    Google
                  </button>

                  <button
                    type="button"
                    onClick={() => startOAuthSignup('facebook')}
                    className="flex items-center border border-gray-200 justify-center gap-2 h-11 rounded-lg bg-gray-50 hover:bg-gray-100 transition text-sm"
                  >
                    {/* Facebook official SVG */}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#1877F2"
                        d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
                      />
                    </svg>
                    Facebook
                  </button>
                </div>

                {/* Login */}
                <p className="text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-teal-700 hover:underline font-medium"
                  >
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          </div>
          <div className="px-6 pb-6 flex sm:flex-row flex-col-reverse items-center justify-between flex-wrap text-sm text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} StackRead. All rights reserved.
            </p>
            <div className="">
              <Link
                href="/support"
                className="font-medium text-teal-700 hover:underline"
              >
                Support
              </Link>{' '}
              |{' '}
              <Link
                href="/terms"
                className="font-medium text-teal-700 hover:underline"
              >
                Terms of Service
              </Link>{' '}
              |{' '}
              <Link
                href="/privacy"
                className="font-medium text-teal-700 hover:underline"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default RegisterPage
