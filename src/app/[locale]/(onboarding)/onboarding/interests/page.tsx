'use client'

import {
  BookOpen,
  Brain,
  Check,
  Feather,
  FlaskConical,
  Landmark,
  LaptopMinimal,
  Newspaper,
  Palette,
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { cn } from '@/lib/utils'

const storageKey = 'stackread:onboarding-interests'

const interestOptions = [
  { code: 'fiction', label: 'Fiction', icon: BookOpen },
  { code: 'non-fiction', label: 'Non-Fiction', icon: Newspaper },
  { code: 'poetry', label: 'Poetry', icon: Feather },
  { code: 'history', label: 'History', icon: Landmark },
  { code: 'science', label: 'Science', icon: FlaskConical },
  { code: 'philosophy', label: 'Philosophy', icon: Brain },
  { code: 'art-design', label: 'Art & Design', icon: Palette },
  { code: 'technology', label: 'Technology', icon: LaptopMinimal },
] as const

export default function OnboardingInterestsPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }

    const stored = window.localStorage.getItem(storageKey)

    if (!stored) {
      return []
    }

    try {
      const parsed = JSON.parse(stored) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      window.localStorage.removeItem(storageKey)
    }

    return []
  })

  const toggleInterest = (code: string) => {
    setSelectedInterests((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    )
  }

  const persistAndContinue = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(selectedInterests))
    router.push(`/${locale}/onboarding/language`)
  }
  const persistAndBack = () => {
    window.localStorage.setItem(storageKey, JSON.stringify(selectedInterests))
    router.push(`/${locale}/onboarding/welcome`)
  }

  return (
    <OnboardingShell
      stepLabel="Step 2 of 5"
      progress={{ current: 2, total: 5 }}
      title="What worlds are you exploring?"
      subtitle="Select your preferred genres to personalize your reading feed. Choose as many as you like to help us tailor recommendations to your unique tastes."
      footer={
        <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={persistAndBack}
            className="rounded-lg font-medium hover:bg-teal-100 px-6 py-2.5 transition-all duration-150 hover:text-teal-600"
          >
            Back
          </button>

          <button
            type="button"
            className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white transition-all duration-150 hover:bg-teal-700"
            onClick={persistAndContinue}
          >
            Continue
          </button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {interestOptions.map((interest) => {
          const Icon = interest.icon
          const isSelected = selectedInterests.includes(interest.code)

          return (
            <button
              key={interest.code}
              type="button"
              aria-pressed={isSelected}
              onClick={() => toggleInterest(interest.code)}
              className={cn(
                'group relative flex min-h-36 flex-col items-center justify-center gap-4 rounded-xl border-2 px-4 py-5 text-center transition-all duration-150',
                isSelected
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-gray-100 bg-gray-50 hover:bg-teal-50 hover:border-teal-600',
              )}
            >
              {isSelected ? (
                <span className="absolute right-4 top-4 inline-flex size-6 items-center justify-center rounded-full bg-teal-600 text-white ">
                  <Check className="size-3.5" />
                </span>
              ) : (
                <span className=" duration-150 transition-all absolute right-4 top-4 size-6 rounded-full border-gray-200 group-hover:border-teal-600 border-2 text-white "></span>
              )}

              <span
                className={cn(
                  'inline-flex size-12 items-center justify-center rounded-md group-hover:bg-teal-100 transition-all duration-150 bg-gray-200  group-hover:text-teal-600',
                  isSelected && 'bg-teal-100 text-teal-600',
                )}
              >
                <Icon className="size-6" />
              </span>

              <span
                className={cn(
                  'font-medium group-hover:text-teal-600 transition-all duration-150',
                  isSelected && 'text-teal-600',
                )}
              >
                {interest.label}
              </span>
            </button>
          )
        })}
      </div>
    </OnboardingShell>
  )
}
