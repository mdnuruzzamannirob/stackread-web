'use client'

import AuthHeroSection from '@/components/auth/AuthHeroSection'
import InputField from '@/components/InputField'
import { Lock } from 'lucide-react'
import { useState } from 'react'

interface FormData {
  password: string
  confirmPassword: string
}

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthHeroSection
          backgroundImage="https://images.unsplash.com/photo-1620714223084-8fcabc6413cc?w=1200&h=1600&fit=crop"
          title="Secure your account."
          description="Create a strong new password to protect your StackRead library."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
          <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Reset Password
              </h1>
              <p className="text-slate-500">
                Choose a strong new password to secure your StackRead account.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                console.log('Reset password request:', formData)
              }}
            >
              <div className="mb-4">
                <InputField
                  icon={<Lock size={17} />}
                  type="password"
                  name="password"
                  label="New Password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

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

              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99]"
              >
                Update Password
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default ResetPasswordPage
