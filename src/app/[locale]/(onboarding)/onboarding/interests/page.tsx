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
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { OnboardingShell } from '@/components/OnboardingShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { cn } from '@/lib/utils'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'

const iconByInterestCode = {
  fiction: BookOpen,
  'non-fiction': Newspaper,
  poetry: Feather,
  history: Landmark,
  science: FlaskConical,
  philosophy: Brain,
  'art-design': Palette,
  technology: LaptopMinimal,
} as const

export default function OnboardingInterestsPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const {
    data: interestsResponse,
    isLoading: isLoadingInterests,
    isError: isInterestsError,
    refetch,
  } = onboardingApi.useGetOnboardingInterestsQuery()
  const { data: statusResponse } = onboardingApi.useGetOnboardingStatusQuery()
  const [saveInterests, { isLoading }] =
    onboardingApi.useSaveOnboardingInterestsMutation()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const interestOptions = useMemo(
    () => interestsResponse?.data ?? [],
    [interestsResponse],
  )

  useEffect(() => {
    const nextInterests = statusResponse?.data?.interests
    if (Array.isArray(nextInterests)) {
      setSelectedInterests(nextInterests)
    }
  }, [statusResponse])

  const toggleInterest = (code: string) => {
    setSelectedInterests((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    )
  }

  const persistAndContinue = () => {
    void (async () => {
      try {
        await saveInterests({ interests: selectedInterests }).unwrap()
        router.push(`/${locale}/onboarding/language`)
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            'Unable to save interests. Please try again.',
          ),
        )
      }
    })()
  }
  const persistAndBack = () => {
    router.push(`/${locale}/onboarding/welcome`)
  }

  return (
    <OnboardingShell
      stepLabel="Step 2 of 5"
      progress={2}
      title="What worlds are you exploring?"
      subtitle="Select your preferred genres to personalize your reading feed. Choose as many as you like to help us tailor recommendations to your unique tastes."
    >
      {isLoadingInterests ? (
        <p className="text-sm text-slate-500">Loading interests...</p>
      ) : isInterestsError ? (
        <div className="space-y-3">
          <p className="text-sm text-red-600">
            Unable to load interests right now.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {interestOptions.map((interest) => {
            const Icon =
              iconByInterestCode[
                interest.code as keyof typeof iconByInterestCode
              ] ?? BookOpen
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
      )}

      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={persistAndBack}
          className="font-medium px-6 p-2.5 text-teal-600"
        >
          Back
        </button>

        <button
          type="button"
          disabled={
            selectedInterests.length === 0 ||
            isLoading ||
            isLoadingInterests ||
            isInterestsError
          }
          className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white transition-all duration-150 hover:bg-teal-700"
          onClick={persistAndContinue}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  )
}
