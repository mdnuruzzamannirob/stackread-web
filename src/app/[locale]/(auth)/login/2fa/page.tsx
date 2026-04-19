'use client'

import AuthHeroSection from '@/components/auth/AuthHeroSection'
import { Circle, CircleDot, Lock, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

const TwoFactorAuthentication = () => {
  return (
    <main className="min-h-dvh flex flex-col">
      <div className="flex flex-1 min-h-dvh">
        <AuthHeroSection
          backgroundImage="https://images.unsplash.com/photo-1614064641938-3bbee52b8d25?w=1200&h=1600&fit=crop"
          title="Security Layer"
          description="Protecting Your Universal Library."
        />

        <section className="w-full lg:w-1/2 lg:ml-[50%] min-h-dvh flex items-center justify-center bg-white overflow-y-auto">
          <div className="mx-auto w-full max-w-lg rounded-xl px-4 py-16 sm:px-6">
            <div className="mb-8 space-y-2">
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Choose Verification Method
              </h1>
              <p className="text-slate-500">
                Choose a secondary verification method to maintain the integrity
                of your curated collection.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login/2fa/totp"
                className="relative group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-150 hover:border-teal-600 hover:bg-white hover:ring-[2.5px] hover:ring-teal-600/10 cursor-pointer"
              >
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 transition-colors duration-150 group-hover:bg-teal-600">
                  <Shield
                    size={20}
                    className="group-hover:text-white duration-150 transition-colors"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                    Authenticator App
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700">
                    Generate codes via Google or Microsoft
                  </p>
                </div>

                {/* Radio Indicator */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <Circle
                    size={18}
                    className="text-gray-400 transition-all duration-150 group-hover:opacity-0"
                  />
                  <CircleDot
                    size={18}
                    className="absolute inset-0 text-teal-600 opacity-0 transition-all duration-150 group-hover:opacity-100"
                  />
                </div>
              </Link>

              <Link
                href="/login/2fa/email"
                className="relative group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-150 hover:border-teal-600 hover:bg-white hover:ring-[2.5px] hover:ring-teal-600/10 cursor-pointer"
              >
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 transition-colors duration-150 group-hover:bg-teal-600">
                  <Mail
                    size={20}
                    className="group-hover:text-white duration-150 transition-colors"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                    Email OTP
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700">
                    One-time code sent to your inbox
                  </p>
                </div>

                {/* Radio Indicator */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <Circle
                    size={18}
                    className="text-gray-400 transition-all duration-150 group-hover:opacity-0"
                  />
                  <CircleDot
                    size={18}
                    className="absolute inset-0 text-teal-600 opacity-0 transition-all duration-150 group-hover:opacity-100"
                  />
                </div>
              </Link>

              <Link
                href="/login/2fa/recovery"
                className="relative group flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all duration-150 hover:border-teal-600 hover:bg-white hover:ring-[2.5px] hover:ring-teal-600/10 cursor-pointer"
              >
                <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 transition-colors duration-150 group-hover:bg-teal-600">
                  <Lock
                    size={20}
                    className="group-hover:text-white duration-150 transition-colors"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                    Backup Codes
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700">
                    Use a pre-generated offline code
                  </p>
                </div>

                {/* Radio Indicator */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <Circle
                    size={18}
                    className="text-gray-400 transition-all duration-150 group-hover:opacity-0"
                  />
                  <CircleDot
                    size={18}
                    className="absolute inset-0 text-teal-600 opacity-0 transition-all duration-150 group-hover:opacity-100"
                  />
                </div>
              </Link>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              <Link
                href="/login"
                className="font-medium text-teal-700 hover:underline"
              >
                Back to login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}

export default TwoFactorAuthentication
