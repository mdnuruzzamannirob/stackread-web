'use client'

import InputField from '@/components/InputField'
import { Check, Home, Lock, Mail, Phone, User } from 'lucide-react'
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
        {/* Left - fixed */}
        <section className="w-1/2 fixed top-0 left-0 min-h-dvh bg-red-50">
          Left
        </section>

        {/* Right - scrollable */}
        <section className="w-1/2 ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
          <div className="mx-auto w-full rounded-xl max-w-lg px-4 py-10 sm:px-6">
            <div className="mb-10 space-y-4">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Create Account
              </h1>
              <p>Start your reading journey with StackRead.</p>
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
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                />
                <InputField
                  icon={<User size={17} />}
                  type="text"
                  name="lastName"
                  label="Last Name"
                  required
                  placeholder="Last Name"
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
                  placeholder="Email Address"
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
                className="flex items-start gap-3 mb-5 cursor-pointer select-none"
                onClick={() => setAgreed((v) => !v)}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                    agreed
                      ? 'bg-teal-700 border-teal-700'
                      : 'bg-white border-gray-300 hover:border-teal-500'
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
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default RegisterPage
