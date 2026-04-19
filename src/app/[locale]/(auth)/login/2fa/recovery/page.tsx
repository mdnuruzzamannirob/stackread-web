'use client'

import AuthHeroSection from '@/components/auth/AuthHeroSection'
import InputField from '@/components/InputField'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

const TwoFactorAuthenticationRecovery = () => {
  const [code, setCode] = useState('')

  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthHeroSection
          backgroundImage="https://images.unsplash.com/photo-1620714223084-8fcabc6413cc?w=1200&h=1600&fit=crop"
          title="Secure Your Knowledge"
          description="One more step to protect your digital archive."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
          <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Use Backup Code
              </h1>
              <p className="text-slate-500">
                Enter one of your backup codes to continue. Each code can only
                be used once.
              </p>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault()
                console.log('Backup code submitted:', code)
              }}
            >
              <div className="mb-4">
                <InputField
                  icon={<Lock size={17} />}
                  type="text"
                  name="code"
                  label="Backup Code"
                  required
                  placeholder="Enter your backup code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              </div>

              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-teal-700 text-sm font-medium text-white transition-all duration-150 hover:bg-teal-800 active:scale-[0.99]"
              >
                Verify & Continue
              </button>

              <p className="mt-4 text-center text-sm text-gray-500">
                Don&apos;t have a backup code?{' '}
                <Link
                  href="/login/2fa"
                  className="font-medium text-teal-700 hover:underline"
                >
                  Try another method
                </Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TwoFactorAuthenticationRecovery
