/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { BookOpen, Globe2, Layers } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ─── Storage keys ─────────────────────────────────────────────────────────────
const INTERESTS_KEY = 'stackread:onboarding-interests'
const LANGUAGE_KEY = 'stackread:onboarding-language'

// ─── Interest labels ──────────────────────────────────────────────────────────
const INTEREST_LABELS: Record<string, string> = {
  fiction: 'Fiction',
  'non-fiction': 'Non-Fiction',
  poetry: 'Poetry',
  history: 'History',
  science: 'Science',
  philosophy: 'Philosophy',
  'art-design': 'Art',
  technology: 'Tech',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readInterests(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(INTERESTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed))
      return parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    /* ignore */
  }
  return []
}

function readLanguage(): 'en' | 'bn' {
  if (typeof window === 'undefined') return 'en'
  const stored = window.localStorage.getItem(LANGUAGE_KEY)
  if (stored === 'en' || stored === 'bn') return stored
  return 'en'
}

function formatInterests(codes: string[]): string {
  if (codes.length === 0) return 'None selected'
  const labels = codes.map((c) => INTEREST_LABELS[c] ?? c)
  if (labels.length <= 3) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OnboardingCompletePage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const router = useRouter()

  const [interests, setInterests] = useState<string[]>([])
  const [language, setLanguage] = useState<'en' | 'bn'>('en')

  useEffect(() => {
    setInterests(readInterests())
    setLanguage(readLanguage())
  }, [])

  // const handleStart = () => {
  //   window.localStorage.removeItem(INTERESTS_KEY)
  //   window.localStorage.removeItem(LANGUAGE_KEY)
  //   router.push(`/${locale}/library`)
  // }

  const handleDashboard = () => {
    window.localStorage.removeItem(INTERESTS_KEY)
    window.localStorage.removeItem(LANGUAGE_KEY)
    router.push(`/${locale}/dashboard`)
  }

  const summary = [
    {
      icon: Globe2,
      label: 'Language',
      value: language === 'bn' ? 'বাংলা' : 'English',
    },
    {
      icon: Layers,
      label: 'Interests',
      value: formatInterests(interests),
    },
    {
      icon: BookOpen,
      label: 'Plan',
      value: 'Premium Curator',
    },
  ]

  return (
    <OnboardingShell
      stepLabel="Step 5 of 5"
      progress={5}
      title="You're all set."
      subtitle="Your personalized library is ready. Dive in whenever you are."
    >
      {/* Divider top */}
      <hr className="border-gray-200" />

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-6 py-10">
        {summary.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 text-center"
            >
              <Icon className="size-6 text-gray-400" strokeWidth={1.5} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                {item.label}
              </p>
              <p className="text-base font-medium text-gray-800">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Divider bottom */}
      <hr className="border-gray-200" />

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/onboarding/plan`)}
          className="font-medium px-6 py-2.5 text-teal-600"
        >
          Back
        </button>

        <button
          type="button"
          className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white transition-all duration-150 hover:bg-teal-700"
          onClick={handleDashboard}
        >
          Go to Dashboard
        </button>
      </div>
    </OnboardingShell>
  )
}
