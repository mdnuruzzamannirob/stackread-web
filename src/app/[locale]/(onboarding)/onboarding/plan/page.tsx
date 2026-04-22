'use client'

import { OnboardingShell } from '@/components/OnboardingShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useOnboardingStepGuard } from '@/lib/auth/onboarding-flow'
import { cn } from '@/lib/utils'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { useGetPlansQuery } from '@/store/features/subscriptions/subscriptionsApi'
import { Loader2, Star } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type BillingCycle = 'monthly' | 'yearly'

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
  yearlyPrice: number | null
  recommended: boolean
  sortOrder: number
  currency: string
  cta: string
  features: Feature[]
}

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: '৳',
  USD: '$',
  EUR: '€',
}

const formatCurrencyAmount = (amount: number, currency: string) => {
  const symbol =
    CURRENCY_SYMBOLS[currency.toUpperCase()] ?? currency.toUpperCase()
  return `${symbol}${amount.toFixed(2)}`
}

const getBillingCyclePrice = (plan: UiPlan, billingCycle: BillingCycle) => {
  if (plan.free) return 0
  if (billingCycle === 'yearly') {
    return (
      plan.yearlyPrice ??
      Number(((plan.monthlyPrice ?? 0) * 12 * 0.75).toFixed(2))
    )
  }
  return plan.monthlyPrice ?? 0
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

  const { onboarding, isLoading: isOnboardingLoading } = useOnboardingStepGuard(
    'plan',
    locale,
  )
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [processingPlanCode, setProcessingPlanCode] = useState<string | null>(
    null,
  )
  const [selectPlan] = onboardingApi.useSelectOnboardingPlanMutation()

  const { data: plansResponse, isLoading: isPlansLoading } = useGetPlansQuery()

  const selectedPlanCode = onboarding?.selectedPlanCode?.toUpperCase() ?? null
  const selectedBillingCycle = onboarding?.selectedBillingCycle ?? 'monthly'

  useEffect(() => {
    if (
      onboarding?.selectedBillingCycle === 'monthly' ||
      onboarding?.selectedBillingCycle === 'yearly'
    ) {
      setBillingCycle(onboarding.selectedBillingCycle)
    }
  }, [onboarding?.selectedBillingCycle])

  const isAnnual = billingCycle === 'yearly'

  const uiPlans = useMemo<UiPlan[]>(() => {
    const plans = plansResponse?.data ?? []
    return plans
      .map((plan) => ({
        id: plan.id,
        code: plan.code,
        name: plan.name,
        desc: plan.description,
        free: plan.isFree,
        featured: plan.recommended ?? plan.code === 'PREMIUM',
        monthlyPrice: plan.monthlyPrice ?? plan.price,
        yearlyPrice:
          plan.yearlyPrice ??
          Number(((plan.monthlyPrice ?? plan.price) * 12 * 0.75).toFixed(2)),
        recommended: plan.recommended,
        sortOrder: plan.sortOrder,
        currency: plan.currency,
        cta: plan.isFree ? 'Get started free' : 'Select plan',
        features: getFeaturesByAccessLevel(plan.accessLevel, plan.features),
      }))
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        const priceA = a.monthlyPrice ?? Number.POSITIVE_INFINITY
        const priceB = b.monthlyPrice ?? Number.POSITIVE_INFINITY
        if (priceA !== priceB) return priceA - priceB
        return a.name.localeCompare(b.name)
      })
  }, [plansResponse])

  const getPrice = (plan: UiPlan) => getBillingCyclePrice(plan, billingCycle)

  const getBilledNote = (plan: UiPlan) => {
    if (plan.free) return 'No credit card required'
    if (selectedPlanCode === plan.code) {
      return `Selected ${selectedBillingCycle === 'yearly' ? 'yearly' : 'monthly'} billing. Select this plan again to retry payment.`
    }
    return isAnnual
      ? `$${(getPrice(plan) * 12).toFixed(2)} billed annually`
      : 'Billed month to month'
  }

  const handlePlanClick = async (plan: UiPlan) => {
    setProcessingPlanCode(plan.code)
    try {
      const response = await selectPlan({
        planCode: plan.code.toUpperCase(),
        locale,
        billingCycle,
      }).unwrap()

      const data = response.data
      if (!data) throw new Error('Plan selection response is empty.')

      const isCompletedStep =
        data.nextStep === 'onboarding_completed' ||
        data.status === 'completed' ||
        plan.free

      if (isCompletedStep) {
        router.push(`/${locale}/onboarding/complete`)
        return
      }

      const checkoutUrl = data.checkout_url ?? data.redirectUrl ?? data.url
      if (!checkoutUrl) throw new Error('Checkout URL is missing in response.')

      window.location.href = checkoutUrl
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to continue with selected plan.'),
      )
    } finally {
      setProcessingPlanCode(null)
    }
  }

  const isPageLoading = isOnboardingLoading || isPlansLoading

  return (
    <OnboardingShell
      stepLabel="Step 4 of 5"
      progress={4}
      title="Choose your plan"
      subtitle="Select the plan that fits your reading habits."
    >
      {/* Billing Toggle — pasted 1 design */}
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
          onClick={() => setBillingCycle(isAnnual ? 'monthly' : 'yearly')}
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
      {isPageLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`plan-skeleton-${index}`}
              className="flex h-full flex-col rounded-xl border border-gray-100 bg-white p-5 animate-pulse"
            >
              <div className="mb-2 h-5 w-24 rounded bg-gray-200" />
              <div className="mb-4 h-4 w-48 rounded bg-gray-100" />
              <div className="mb-1 h-8 w-28 rounded bg-gray-200" />
              <div className="mb-4 h-3 w-32 rounded bg-gray-100" />
              <hr className="border-gray-100 mb-4" />
              <div className="mb-3 h-3 w-28 rounded bg-gray-100" />
              <div className="flex-1 space-y-3">
                {Array.from({ length: 6 }).map((__, featureIndex) => (
                  <div
                    key={`plan-skeleton-feature-${index}-${featureIndex}`}
                    className="flex items-start gap-2"
                  >
                    <div className="mt-0.5 size-4 rounded-full bg-gray-200" />
                    <div className="h-4 flex-1 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
              <div className="mt-5 h-10 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {uiPlans.map((plan) => {
            const isFeatured = plan.featured
            const price = getPrice(plan)
            const isSelectedPlan = selectedPlanCode === plan.code
            const isProcessingThisPlan = processingPlanCode === plan.code

            return (
              <div
                key={plan.code}
                className={cn(
                  'relative flex h-full flex-col border-2 p-5',
                  isSelectedPlan
                    ? 'rounded-xl border-teal-600 bg-teal-50/25'
                    : isFeatured
                      ? 'rounded-x-xl rounded-b-xl border-teal-600 border-t-transparent'
                      : 'rounded-xl border-gray-100',
                )}
              >
                {/* Featured banner */}
                {isFeatured && !isSelectedPlan ? (
                  <div className="absolute flex items-center gap-1 border-none justify-center -top-9 left-0 right-0 text-sm p-1 py-2 ring-2 text-center rounded-t-xl uppercase font-medium bg-teal-600 text-white ring-teal-600">
                    <Star size={14} /> Recommended
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{plan.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5 mb-4">
                      {plan.desc}
                    </p>
                  </div>
                  {isSelectedPlan ? (
                    <span className="rounded-full bg-teal-600 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shrink-0">
                      Selected
                    </span>
                  ) : null}
                </div>

                <div className="flex items-baseline gap-1 mb-1">
                  {plan.free ? (
                    <span className="text-3xl font-semibold text-gray-900">
                      Free
                    </span>
                  ) : (
                    <>
                      <span className="text-3xl font-semibold text-gray-900">
                        {formatCurrencyAmount(price, plan.currency)}
                      </span>
                      <span className="text-xs text-gray-500">
                        /{isAnnual ? 'yr' : 'mo'}
                      </span>
                      {isAnnual && (
                        <span className="text-xs text-gray-500 line-through ml-1">
                          {formatCurrencyAmount(
                            plan.monthlyPrice ?? 0,
                            plan.currency,
                          )}
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
                  disabled={Boolean(processingPlanCode)}
                  className={cn(
                    'h-10 w-full rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2',
                    isProcessingThisPlan
                      ? 'opacity-50 cursor-not-allowed'
                      : isFeatured || isSelectedPlan
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
                  )}
                >
                  {isProcessingThisPlan ? (
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

      {/* Back + Continue */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="font-medium px-6 py-2.5 text-teal-600"
          onClick={() => router.push(`/${locale}/onboarding/language`)}
        >
          Back
        </button>

        <button
          type="button"
          disabled={!selectedPlanCode || Boolean(processingPlanCode)}
          className="rounded-lg bg-teal-600 font-medium px-6 py-2.5 text-white transition-all duration-150 hover:bg-teal-700 disabled:opacity-50 disabled:hover:bg-teal-600 disabled:cursor-not-allowed"
          onClick={() => {
            const plan = uiPlans.find((p) => p.code === selectedPlanCode)
            if (plan) handlePlanClick(plan)
          }}
        >
          {processingPlanCode ? 'Processing...' : 'Continue'}
        </button>
      </div>
    </OnboardingShell>
  )
}
