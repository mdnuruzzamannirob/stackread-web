'use client'

import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const uiPlans = [
  { code: 'free', name: 'Reader Free', billingCycle: 'No recurring billing' },
  {
    code: 'premium',
    name: 'Universal Library Premium',
    billingCycle: 'Billed monthly',
  },
  {
    code: 'pro',
    name: 'Universal Library Pro',
    billingCycle: 'Billed monthly',
  },
] as const

export default function OnboardingCompletionPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const [selectedPlanCode] = useState(() => {
    if (typeof window === 'undefined') {
      return 'premium'
    }

    return window.localStorage.getItem('stackread:onboarding-plan') ?? 'premium'
  })
  const [storedLanguage] = useState(() => {
    if (typeof window === 'undefined') {
      return 'English'
    }

    const language = window.localStorage.getItem(
      'stackread:onboarding-language',
    )

    if (language === 'bn') {
      return 'বাংলা'
    }

    return 'English'
  })
  const [storedInterests] = useState<string[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }

    const interests = window.localStorage.getItem(
      'stackread:onboarding-interests',
    )

    if (!interests) {
      return []
    }

    try {
      const parsed = JSON.parse(interests) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      window.localStorage.removeItem('stackread:onboarding-interests')
    }

    return []
  })

  const selectedPlan =
    uiPlans.find((plan) => plan.code === selectedPlanCode) ?? uiPlans[1]

  const summaryItems = [
    {
      label: 'Language',
      value: storedLanguage,
    },
    {
      label: 'Interests',
      value:
        storedInterests.length > 0
          ? storedInterests.map((item) => item.replace(/-/g, ' ')).join(', ')
          : 'Not selected',
    },
    {
      label: 'Plan',
      value: selectedPlan.name,
    },
    {
      label: 'Billing',
      value: selectedPlan.billingCycle,
    },
  ]

  const handleStartReading = () => {
    router.replace(`/${locale}/dashboard`)
  }

  const handleGoToPlans = () => {
    router.push(`/${locale}/onboarding/plan`)
  }

  return (
    <OnboardingShell
      stepLabel="Step 5 of 5"
      progress={{ current: 5, total: 5 }}
      title="You're ready to go"
      subtitle="Your onboarding setup is complete. Your reading experience is now ready."
      footer={
        <div className="mt-10">
          <button
            type="button"
            className="rounded-lg font-medium hover:bg-teal-100 px-6 py-2.5 transition-all duration-150 hover:text-teal-600"
            onClick={() => router.push(`/${locale}/onboarding/language`)}
          >
            Back
          </button>
        </div>
      }

    >
      <div className="mx-auto max-w-2xl">
        <div
          className={cn(
            'rounded-[2rem] border bg-white/90 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.2)] sm:p-8',
            'border-teal-100',
          )}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                'inline-flex size-20 items-center justify-center rounded-[1.75rem] shadow-sm',
                'bg-teal-50 text-teal-900',
              )}
            >
              <CheckCircle2 className="size-10" />
            </div>

            <p className="mt-6 text-4xl font-semibold tracking-tight text-slate-900">
              Onboarding ready
            </p>

            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
              Welcome in. We saved your preferences and prepared your profile.
            </p>
          </div>

          <div className="mt-8 rounded-[1.5rem] border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-800/80">
                  Onboarding summary
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Review the selections used to personalize your account.
                </p>
              </div>
              <BookOpen className="size-5 shrink-0 text-teal-900" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-white px-4 py-3"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-teal-50/80 px-4 py-3 text-sm leading-6 text-teal-900">
              Receipt sent to your email. Your access is active now.
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button
              type="button"
              className="h-12 rounded-full px-8 text-base shadow-[0_18px_30px_-16px_rgba(13,148,136,0.55)]"
              onClick={handleStartReading}
            >
              Start Reading
              <ChevronRight className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-full px-8 text-base"
              onClick={handleGoToPlans}
            >
              Back to plans
            </Button>
          </div>
        </div>
      </div>
    </OnboardingShell>
  )
}
