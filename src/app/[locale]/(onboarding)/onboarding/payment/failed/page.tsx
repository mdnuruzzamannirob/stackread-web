'use client'

import { getApiErrorMessage } from '@/lib/api/error-message'
import { cn } from '@/lib/utils'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { CreditCard, Globe, LayoutGrid, RefreshCw } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// ------- types -------
type Stage = 'failed' | 'redirecting'

type StripeErrorInfo = {
  code: string
  reason: string
  cardLast4: string | null
  planName: string
  planPrice: string
  billingCycle: 'monthly' | 'yearly'
  sessionId: string
}

// ------- Stripe decline code → human readable -------
const DECLINE_REASONS: Record<string, string> = {
  card_declined: 'Card declined',
  insufficient_funds: 'Insufficient funds',
  lost_card: 'Card reported lost',
  stolen_card: 'Card reported stolen',
  expired_card: 'Card expired',
  incorrect_cvc: 'Incorrect CVC',
  do_not_honor: 'Card issuer declined',
  transaction_not_allowed: 'Transaction not allowed',
  card_velocity_exceeded: 'Too many attempts — try later',
}

const TIPS = [
  {
    message: 'Check your card balance or available credit limit',
    icon: CreditCard,
  },
  {
    message: 'Make sure online transactions are enabled for your card',
    icon: Globe,
  },
  {
    message: 'Try a different card or alternative payment method',
    icon: RefreshCw,
  },
]

function readableReason(code: string): string {
  return DECLINE_REASONS[code] ?? 'Unknown error'
}

// ------- main component -------
export default function OnboardingPaymentFailedPage() {
  const params = useParams<{ locale: string }>()
  const locale = (params?.locale === 'bn' ? 'bn' : 'en') as 'en' | 'bn'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectPlan] = onboardingApi.useSelectOnboardingPlanMutation()

  const [stage, setStage] = useState<Stage>('failed')
  const [error, setError] = useState<StripeErrorInfo | null>(null)
  const [loadingMsg, setLoadingMsg] = useState('')

  // Read error context from URL query params
  // Stripe passes ?session_id=xxx on redirect; you can attach extra params
  // from your success/cancel URLs when creating the checkout session, e.g.:
  // cancel_url: `${origin}/${locale}/onboarding/payment-failed?plan_id=premium&price=14.99`
  useEffect(() => {
    const sessionId = searchParams.get('session_id') ?? ''
    const planName = searchParams.get('plan_name') ?? 'Premium'
    const price = searchParams.get('price') ?? '14.99'
    const billingCycle =
      searchParams.get('billing_cycle') === 'yearly' ? 'yearly' : 'monthly'
    const code = searchParams.get('error_code') ?? 'card_declined'

    // Fetch full session details from your API if you need card info
    // For now we build what we can from query params
    setError({
      sessionId,
      code,
      reason: readableReason(code),
      cardLast4: searchParams.get('card_last4'),
      planName,
      billingCycle,
      planPrice: `$${price}/${billingCycle === 'yearly' ? 'yr' : 'mo'}`,
    })
  }, [searchParams])

  // Retry: create a new Stripe Checkout session for the same plan
  const handleRetry = async () => {
    if (!error) return
    setLoadingMsg('Creating new checkout session...')
    setStage('redirecting')

    try {
      const planCode = (searchParams.get('plan_id') ?? '').toUpperCase()

      if (!planCode) {
        throw new Error('Plan code not found')
      }

      const response = await selectPlan({
        planCode,
        locale,
        billingCycle: error.billingCycle,
      }).unwrap()

      const data = response.data
      const url = data?.checkout_url || data?.redirectUrl || data?.url

      if (!url) {
        if (data?.nextStep === 'onboarding_completed') {
          router.push(`/${locale}/onboarding/complete`)
          return
        }
        throw new Error('No checkout URL returned')
      }

      window.location.href = url
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Failed to create a new checkout session.'),
      )
      setStage('failed')
    }
  }

  // Change plan: go back to the plan selection step in onboarding
  const handleChangePlan = () => {
    setLoadingMsg('Going back to plan selection...')
    setStage('redirecting')
    router.push(`/${locale}/onboarding/plan`)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-md text-center">
        {/* ── REDIRECTING STATE ── */}
        {stage === 'redirecting' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-red-50 mb-6">
              <RefreshCw
                className="size-6 text-red-700 animate-spin"
                style={{ animationDuration: '0.8s' }}
              />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-1.5">
              {loadingMsg}
            </h1>
            <p className="text-sm text-slate-500">
              Please wait while we retry the checkout verification{' '}
            </p>
          </div>
        )}

        {/* ── FAILED STATE ── */}
        {stage === 'failed' && (
          <div className="">
            {/* Icon */}
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-red-50 mb-5">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M7 7l14 14M21 7L7 21"
                  stroke="#A32D2D"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <h1 className="text-[22px] font-semibold text-slate-900 mb-2">
              Payment failed
            </h1>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              No charge was made to your card.
            </p>

            {/* Error detail card */}
            {error && (
              <div className="border border-red-100 rounded-xl bg-white p-5 text-left mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-3.5">
                  Error details
                </p>
                {[
                  { label: 'Code', value: error.code, mono: true },
                  { label: 'Reason', value: error.reason, red: true },
                  ...(error.cardLast4
                    ? [{ label: 'Card', value: `•••• ${error.cardLast4}` }]
                    : []),
                  {
                    label: 'Plan tried',
                    value: `${error.planName} · ${error.planPrice}`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between items-baseline py-2.5 border-b border-slate-100 text-sm last:border-none"
                  >
                    <span className="text-slate-500">{row.label}</span>
                    <span
                      className={cn(
                        'font-medium',
                        row.red ? 'text-red-700' : 'text-slate-800',
                        row.mono ? 'font-mono text-xs' : '',
                      )}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            <div className="text-left mb-4 bg-white">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
                Things to try
              </p>

              <div className="flex flex-col">
                {TIPS.map((tip, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-3 py-3">
                      <div className="shrink-0 flex size-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                        <tip.icon
                          size={14}
                          strokeWidth={1.75}
                          className="text-slate-700"
                        />
                      </div>
                      <span className="text-xs text-slate-700 leading-snug">
                        {tip.message}
                      </span>
                    </div>
                    {i < TIPS.length - 1 && (
                      <div className="h-px bg-slate-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 w-full h-11 bg-red-700 hover:bg-red-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Retry with same plan
              </button>

              <button
                type="button"
                onClick={handleChangePlan}
                className="flex items-center justify-center gap-2 w-full h-11 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <LayoutGrid className="w-4 h-4" />
                Choose a different plan
              </button>
            </div>

            {/* Support */}
            <p className="text-[11px] text-slate-400 text-center mt-4 leading-relaxed">
              Still having trouble?{' '}
              <a
                href={`/${locale}/support`}
                className="text-slate-500 underline underline-offset-2 hover:text-slate-700 transition-colors"
              >
                Contact support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
