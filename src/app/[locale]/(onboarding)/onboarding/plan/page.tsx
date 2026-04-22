'use client'

import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { cn } from '@/lib/utils'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { useGetPlansQuery } from '@/store/features/subscriptions/subscriptionsApi'
import { Loader2, Star } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

type BillingCycle = 'monthly' | 'annually'

type Feature = {
  label: string
  available: boolean
}

type UiPlan = {
  id: string
  code: string
  name: string
  desc: string
  free: boolean
  featured?: boolean
  monthlyPrice: number | null
  annualPrice: number | null
  cta: string
  features: Feature[]
}

// Feature mapping based on plan access level
const getFeaturesByAccessLevel = (
  accessLevel: string,
  features: string[],
): Feature[] => {
  const allFeatures = [
    'Access free books only',
    'Web reader access',
    'Reading progress sync',
    'Highlights & annotations',
    'Multi-device access',
    'AI tools',
    'Audiobook access',
  ]

  if (accessLevel === 'free') {
    return [
      { label: 'Access free books only', available: true },
      { label: 'Web reader access', available: true },
      { label: 'Reading progress sync', available: false },
      { label: 'Highlights & annotations', available: false },
      { label: 'Multi-device access', available: false },
      { label: 'AI tools', available: false },
      { label: 'Audiobook access', available: false },
    ]
  }

  if (accessLevel === 'basic') {
    return [
      { label: 'Access free + pro books', available: true },
      { label: 'Web reader access', available: true },
      { label: 'Reading progress sync', available: true },
      { label: 'Highlights & annotations', available: true },
      {
        label: `Multi-device access (up to ${features.find((f) => f.includes('devices')) || '3'})`,
        available: true,
      },
      { label: 'AI tools (limited access)', available: true },
      { label: 'Audiobook access', available: false },
    ]
  }

  if (accessLevel === 'premium') {
    return [
      { label: 'Access all books (free + pro + premium)', available: true },
      { label: 'Web reader access', available: true },
      { label: 'Reading progress sync', available: true },
      { label: 'Highlights & annotations', available: true },
      {
        label: `Multi-device access (up to ${features.find((f) => f.includes('devices')) || '5'})`,
        available: true,
      },
      { label: 'AI tools (full access)', available: true },
      { label: 'Audiobook access', available: true },
    ]
  }

  return allFeatures.map((f) => ({ label: f, available: true }))
}

function CheckIcon() {
  return (
    <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6.5" stroke="#0F6E56" />
      <path
        d="M4.5 7l2 2L9.5 5"
        stroke="#0F6E56"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 opacity-35"
      viewBox="0 0 14 14"
      fill="none"
    >
      <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
      <path
        d="M5 5l4 4M9 5l-4 4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function OnboardingPlanSelectionPage() {
  const params = useParams<{ locale: string }>()
  const locale = (params.locale === 'bn' ? 'bn' : 'en') as 'en' | 'bn'
  const router = useRouter()
  const [billing, setBilling] = useState<BillingCycle>('monthly')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectPlan] = onboardingApi.useSelectOnboardingPlanMutation()

  // Fetch plans from backend
  const { data: plansResponse, isLoading: isPlansLoading } = useGetPlansQuery()

  const isAnnual = billing === 'annually'

  // Convert backend plans to UI format
  const uiPlans = useMemo<UiPlan[]>(() => {
    const plans = plansResponse?.data ?? []
    return plans
      .map((plan) => ({
        id: plan.id,
        code: plan.code,
        name: plan.name,
        desc: plan.description,
        free: plan.isFree,
        featured: plan.code === 'PREMIUM', // Mark Premium as featured
        monthlyPrice: plan.price,
        annualPrice: plan.price * 0.75, // Assume 25% discount for annual
        cta: plan.isFree
          ? 'Get started free'
          : plan.code === 'FREE'
            ? 'Get started free'
            : 'Select Plan',
        features: getFeaturesByAccessLevel(plan.accessLevel, plan.features),
      }))
      .sort((a, b) => {
        // Sort by featured status first
        if (a.featured) return -1
        if (b.featured) return 1
        return 0
      })
  }, [plansResponse])

  const getPrice = (plan: UiPlan) =>
    isAnnual && !plan.free ? plan.annualPrice : plan.monthlyPrice

  const getBilledNote = (plan: UiPlan) => {
    if (plan.free) return 'No credit card required'
    if (isAnnual)
      return `$${((plan.annualPrice ?? 0) * 12).toFixed(2)} billed annually`
    return 'Billed month to month'
  }

  const handlePlanClick = async (plan: UiPlan) => {
    setIsProcessing(true)

    try {
      const response = await selectPlan({
        planCode: plan.code,
        locale,
      }).unwrap()

      const data = response.data

      if (!data) {
        throw new Error('Plan selection response is empty.')
      }

      if (data.nextStep === 'onboarding_completed') {
        router.push(`/${locale}/onboarding/complete`)
        return
      }

      const checkoutUrl = data.checkout_url ?? data.url

      if (!checkoutUrl) {
        throw new Error('Checkout URL is missing in response.')
      }

      window.location.href = checkoutUrl
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to continue with selected plan.'),
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <OnboardingShell
      stepLabel="Step 4 of 5"
      progress={4}
      title="Choose your plan"
      subtitle="Select the plan that fits your reading habits."
    >
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-3 mb-16">
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            !isAnnual ? 'text-gray-900' : 'text-gray-400',
          )}
        >
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setBilling(isAnnual ? 'monthly' : 'annually')}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
            isAnnual ? 'bg-teal-600' : 'bg-gray-200',
          )}
        >
          <span
            className={cn(
              'inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200',
              isAnnual ? 'translate-x-5.5' : 'translate-x-0.5',
            )}
          />
        </button>
        <span
          className={cn(
            'text-sm font-medium transition-colors',
            isAnnual ? 'text-gray-900' : 'text-gray-400',
          )}
        >
          Annually
        </span>
        <span className="text-xs font-medium bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
          Save 25%
        </span>
      </div>

      {/* Plan Cards */}
      {isPlansLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-teal-600" size={32} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {uiPlans.map((plan) => {
            const isFeatured = plan.featured
            const price = getPrice(plan)

            return (
              <div
                key={plan.code}
                className={cn(
                  'relative flex h-full flex-col border-2 p-5',
                  isFeatured
                    ? 'rounded-x-xl rounded-b-xl border-teal-600 border-t-transparent'
                    : 'rounded-xl border-gray-100',
                )}
              >
                {isFeatured ? (
                  <div className="absolute flex items-center gap-1 border-none justify-center -top-9 left-0 right-0 text-sm p-1 py-2 ring-2 text-center rounded-t-xl uppercase font-medium bg-teal-600 text-white ring-teal-600">
                    <Star size={14} /> Recommended
                  </div>
                ) : null}

                <p className="text-xl font-semibold">{plan.name}</p>
                <p className="text-sm text-gray-500 mt-0.5 mb-4">{plan.desc}</p>

                <div className="flex items-baseline gap-1 mb-1">
                  {plan.free ? (
                    <span className="text-3xl font-semibold text-gray-900">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold text-gray-900">
                        ${price?.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-500">/mo</span>
                      {isAnnual && (
                        <span className="text-xs text-gray-500 line-through ml-1">
                          ${plan.monthlyPrice?.toFixed(2)}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  {getBilledNote(plan)}
                </p>

                <hr className="border-gray-100 mb-4" />

                <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">
                  What&apos;s included
                </p>

                <ul className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map((feat, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-start gap-2 text-sm leading-relaxed',
                        feat.available ? 'text-gray-600' : 'text-gray-500',
                      )}
                    >
                      {feat.available ? <CheckIcon /> : <CrossIcon />}
                      <span>{feat.label}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handlePlanClick(plan)}
                  disabled={isProcessing}
                  className={cn(
                    'h-10 w-full rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2',
                    isProcessing
                      ? 'opacity-50 cursor-not-allowed'
                      : isFeatured
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          className="font-medium px-6 py-2.5 text-teal-600"
          onClick={() => router.push(`/${locale}/onboarding/language`)}
        >
          Back
        </button>
      </div>
    </OnboardingShell>
  )
}
