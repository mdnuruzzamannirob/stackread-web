'use client'

import AuthHeroSection from '@/components/auth/AuthHeroSection'
import InputField from '@/components/InputField'
import { Check, Home, Lock, Mail, Phone, User } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  password: string
  confirmPassword: string
  agreeTerms: boolean
}

const RegisterPage = () => {
  const [agreed, setAgreed] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthHeroSection
          backgroundImage="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&h=1600&fit=crop"
          title="Start your reading journey."
          description="Join millions of readers discovering knowledge in the world's largest digital library."
        />

        {/* Right */}
        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
          <div className="mx-auto w-full rounded-xl max-w-lg px-4 py-16 sm:px-6">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Create Account
              </h1>
              <p className=" text-slate-500">
                Start your reading journey with StackRead.
              </p>
            </div>

            <form action="">
              {/* First Name + Last Name */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InputField
                  icon={<User size={17} />}
                  type="text"
                  name="firstName"
                  label="First Name"
                  required
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  icon={<User size={17} />}
                  type="text"
                  name="lastName"
                  label="Last Name"
                  required
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="mb-4">
                <InputField
                  icon={<Mail size={17} />}
                  type="email"
                  name="email"
                  label="Email Address"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="mb-4">
                <InputField
                  icon={<Phone size={17} />}
                  type="tel"
                  name="phone"
                  label="Phone Number (optional)"
                  placeholder="+880 1XX-XXXXXXX"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="mb-4">
                <InputField
                  icon={<Home size={17} />}
                  type="text"
                  name="address"
                  label="Address (optional)"
                  placeholder="123 Main Street"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <InputField
                  icon={<Lock size={17} />}
                  type="password"
                  name="password"
                  label="Password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div className="mb-4">
                <InputField
                  icon={<Lock size={17} />}
                  type="password"
                  name="confirmPassword"
                  label="Confirm Password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Terms Checkbox */}
              <div
                className="group flex items-start gap-3 mb-5 cursor-pointer select-none w-fit"
                onClick={() => setAgreed((v) => !v)}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                    agreed
                      ? 'bg-teal-700 border-teal-700'
                      : 'bg-white border-gray-300 group-hover:border-teal-500'
                  }`}
                >
                  {agreed && (
                    <Check size={12} strokeWidth={3} className="text-white" />
                  )}
                </div>

                <span className="text-sm text-gray-500 leading-relaxed">
                  I agree to the{' '}
                  <a
                    href="#"
                    className="text-teal-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href="#"
                    className="text-teal-700 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full h-12 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] text-white text-sm font-medium rounded-lg transition-all duration-150"
              >
                Create Account
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
        </section>
      </div>
    </main>
  )
}

export default RegisterPage
