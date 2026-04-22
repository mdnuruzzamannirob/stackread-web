'use client'

import { Check, Globe2, Languages } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { OnboardingShell } from '@/components/OnboardingShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useOnboardingStepGuard } from '@/lib/auth/onboarding-flow'
import { cn } from '@/lib/utils'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'

const languageOptions = [
  {
    code: 'en',
    label: 'English',
    description:
      'Curated recommendations, onboarding copy, and reading cues in English.',
    icon: Languages,
  },
  {
    code: 'bn',
    label: 'বাংলা',
    description: 'A Bengali-first reading preference for local discovery.',
    icon: Globe2,
  },
] as const

export default function OnboardingLanguagePage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const { onboarding } = useOnboardingStepGuard('language', locale)
  const [saveLanguage, { isLoading }] =
    onboardingApi.useSaveOnboardingLanguageMutation()
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn'>(() => {
    if (typeof window === 'undefined') return 'en'
    const browserLanguage = window.navigator.language.toLowerCase()
    return browserLanguage.startsWith('bn') ? 'bn' : 'en'
  })

  useEffect(() => {
    const language = onboarding?.selectedLanguage
    if (language === 'en' || language === 'bn') {
      setSelectedLanguage(language)
    }
  }, [onboarding])

  const continueToNextStep = () => {
    void (async () => {
      try {
        await saveLanguage({ language: selectedLanguage }).unwrap()
        router.push(`/${locale}/onboarding/plan`)
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            'Unable to save language. Please try again.',
          ),
        )
      }
    })()
  }
  const persistAndBack = () => {
    router.push(`/${locale}/onboarding/interests`)
  }

  return (
    <OnboardingShell
      stepLabel="Step 3 of 5"
      progress={3}
      title="Pick your reading language"
      subtitle="Choose the language that feels most natural for your reading journey. You can revisit this later in settings."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {languageOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedLanguage === option.code

          return (
            <button
              key={option.code}
              type="button"
              onClick={() => setSelectedLanguage(option.code)}
              className={cn(
                'group relative min-h-36 flex flex-col text-start gap-4 rounded-xl border-2 px-4 py-5 transition-all duration-150',
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

              <div className="space-y-2">
                <h2
                  className={cn(
                    'font-medium group-hover:text-teal-600 transition-all duration-150',
                    isSelected && 'text-teal-600',
                  )}
                >
                  {option.label}
                </h2>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-10 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={persistAndBack}
          className="font-medium px-6 py-2.5 text-teal-600"
        >
          Back
        </button>

        <button
          type="button"
          disabled={isLoading}
          className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white transition-all duration-150 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 disabled:cursor-not-allowed"
          onClick={continueToNextStep}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  )
}
