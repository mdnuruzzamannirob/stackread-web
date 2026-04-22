'use client'

import { OnboardingShell } from '@/components/OnboardingShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useOnboardingStepGuard } from '@/lib/auth/onboarding-flow'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { BookOpen, Globe2, Layers } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
  const { onboarding, isLoading: isOnboardingLoading } = useOnboardingStepGuard(
    'complete',
    locale,
  )
  const [completeOnboarding, { isLoading: isCompleting }] =
    onboardingApi.useCompleteOnboardingMutation()

  const handleDashboard = () => {
    void (async () => {
      try {
        await completeOnboarding({ agreeToTerms: true }).unwrap()
        // router.push(`/${locale}/dashboard`)
      } catch (error) {
        toast.error(getApiErrorMessage(error, 'Unable to complete onboarding.'))
      }
    })()
  }

  const status = onboarding
  const interests = Array.isArray(status?.interests) ? status.interests : []
  const language = status?.selectedLanguage
  const selectedOn = status?.selectedAt
    ? new Date(status.selectedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Not available'
  const billingCycleLabel =
    status?.selectedBillingCycle === 'yearly' ? 'Annually' : 'Monthly'

  const summary = [
    {
      icon: Globe2,
      label: 'Language',
      value:
        language === 'bn'
          ? 'বাংলা'
          : language === 'en'
            ? 'English'
            : 'Not selected',
    },
    {
      icon: Layers,
      label: 'Interests',
      value: formatInterests(interests),
    },
    {
      icon: BookOpen,
      label: 'Plan',
      value: status?.selectedPlanName
        ? `${status.selectedPlanName} (${billingCycleLabel}, USD ${status.selectedPlanPrice ?? 0})`
        : 'Not selected',
    },
    {
      icon: BookOpen,
      label: 'Selected',
      value: selectedOn,
    },
  ]

  if (isOnboardingLoading) {
    return (
      <OnboardingShell
        stepLabel="Step 5 of 5"
        progress={5}
        title="You're all set."
        subtitle="Your personalized library is ready. Dive in whenever you are."
      >
        <div className="space-y-8 animate-pulse">
          <div className="h-px bg-gray-200" />

          <div className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`complete-skeleton-${index}`}
                className="space-y-3 text-center"
              >
                <div className="mx-auto size-6 rounded-full bg-gray-200" />
                <div className="mx-auto h-3 w-20 rounded-full bg-gray-100" />
                <div className="mx-auto h-4 w-28 rounded bg-gray-200" />
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-200" />

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="h-11 w-28 rounded-lg bg-gray-100" />
            <div className="h-11 w-40 rounded-lg bg-gray-200" />
          </div>
        </div>
      </OnboardingShell>
    )
  }

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
      <div className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
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
          disabled={isCompleting}
          className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white transition-all duration-150 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 disabled:cursor-not-allowed"
          onClick={handleDashboard}
        >
          {isCompleting ? 'Saving...' : 'Go to Dashboard'}
        </button>
      </div>
    </OnboardingShell>
  )
}
