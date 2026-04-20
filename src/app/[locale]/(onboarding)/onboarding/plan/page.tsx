/* eslint-disable react-hooks/purity */
'use client'

import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'

type BillingCycle = 'monthly' | 'annually'

type Feature = {
  label: string
  available: boolean
}

type UiPlan = {
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

const uiPlans: UiPlan[] = [
  {
    code: 'FREE',
    name: 'Free',
    desc: 'Start reading with free books.',
    free: true,
    monthlyPrice: null,
    annualPrice: null,
    cta: 'Get started free',
    features: [
      { label: 'Access free books only', available: true },
      { label: 'Web reader access', available: true },
      { label: 'Reading progress sync', available: false },
      { label: 'Highlights & annotations', available: false },
      { label: 'Multi-device access', available: false },
      { label: 'AI tools ', available: false },
      { label: 'Audiobook access', available: false },
    ],
  },
  {
    code: 'PREMIUM',
    name: 'Premium',
    desc: 'For regular readers.',
    free: false,
    featured: true,
    monthlyPrice: 9.99,
    annualPrice: 7.49,
    cta: 'Go Premium',
    features: [
      { label: 'Access free + pro books', available: true },
      { label: 'Web reader access', available: true },
      { label: 'Reading progress sync', available: true },
      { label: 'Highlights & annotations', available: true },
      { label: 'Multi-device access (up to 3)', available: true },
      { label: 'AI tools (limited access)', available: true },
      { label: 'Audiobook access', available: false },
    ],
  },
  {
    code: 'pro',
    name: 'Pro',
    desc: 'Full reading experience.',
    free: false,
    monthlyPrice: 18.99,
    annualPrice: 14.24,
    cta: 'Go Pro',
    features: [
      { label: 'Access all books (free + pro + premium)', available: true },
      { label: 'Web reader access', available: true },
      { label: 'Reading progress sync', available: true },
      { label: 'Highlights & annotations', available: true },
      { label: 'Multi-device access (up to 5)', available: true },
      { label: 'AI tools (full access)', available: true },
      { label: 'Audiobook access', available: true },
    ],
  },
]

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
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const [billing, setBilling] = useState<BillingCycle>('monthly')

  const isAnnual = billing === 'annually'

  const getPrice = (plan: UiPlan) =>
    isAnnual ? plan.annualPrice : plan.monthlyPrice

  const getBilledNote = (plan: UiPlan) => {
    if (plan.free) return 'No credit card required'
    if (isAnnual)
      return `$${((plan.annualPrice ?? 0) * 12).toFixed(2)} billed annually`
    return 'Billed month to month'
  }

  const handlePlanClick = (plan: UiPlan) => {
    const outcome = Math.random() < 0.5 ? 'success' : 'failed'
    const price = getPrice(plan)
    const searchParams = new URLSearchParams({
      plan_id: plan.code,
      plan_name: plan.name,
      billing_cycle: billing,
      price: price?.toFixed(2) ?? '0.00',
      currency: 'USD',
    })

    if (plan.free) {
      searchParams.set('is_free', 'true')
    }

    if (outcome === 'failed') {
      searchParams.set('error_code', 'card_declined')
      searchParams.set('card_last4', '4242')
    }

    router.push(
      `/${locale}/onboarding/payment/${outcome}?${searchParams.toString()}`,
    )
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
                className={cn(
                  'h-10 w-full rounded-lg text-sm font-medium transition-all duration-150',
                  isFeatured
                    ? 'bg-teal-600 text-white hover:bg-teal-700'
                    : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
                )}
              >
                {plan.cta}
              </button>
            </div>
          )
        })}
      </div>

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
