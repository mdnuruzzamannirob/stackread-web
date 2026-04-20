'use client'

import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { Book, BookOpen, Layers, Smile, Users, WifiOff } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'

const welcomeOptions = [
  { title: '50k+', description: 'Books available', icon: Book },
  { title: '120+', description: 'Genres & topics', icon: Layers },
  { title: 'Free', description: 'Always a free tier', icon: Smile },
  { title: 'Offline', description: 'Download & read offline', icon: WifiOff },
  { title: '200k+', description: 'Active readers', icon: Users },
  { title: '15+', description: 'Languages supported', icon: BookOpen },
]
const OnboardingWelcomePage = () => {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()

  const persistAndContinue = () => {
    router.push(`/${locale}/onboarding/interests`)
  }

  return (
    <OnboardingShell
      stepLabel="Step 1 of 5"
      progress={1}
      title="Your library, your world."
      subtitle="Discover books, build your reading list, and track every page of your journey. Setup takes under 2 minutes."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {welcomeOptions.map((option, index) => {
          const Icon = option.icon
          return (
            <div
              key={option.title + index}
              className="group flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="mb-0.5 flex size-10 items-center justify-center rounded-md bg-gray-100 text-gray-600 group-hover:bg-gray-100">
                <Icon size={18} strokeWidth={1.75} />
              </div>
              <span className="text-2xl font-normal tracking-tight ">
                {option.title}
              </span>
              <span className="text-sm text-gray-500">
                {option.description}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white"
          onClick={persistAndContinue}
        >
          Continue
        </button>
      </div>
    </OnboardingShell>
  )
}

export default OnboardingWelcomePage
