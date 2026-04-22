'use client'

import { getApiErrorMessage } from '@/lib/api/error-message'
import { cn } from '@/lib/utils'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { ArrowRight, CheckCircle2, LayoutGrid, RefreshCw } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// ------- types -------
type VerificationState = 'loading' | 'confirmed' | 'failed'

type SummaryRow = {
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}

const COUNTDOWN_DURATION = 10 // seconds

// ------- main component -------
export default function OnboardingPaymentSuccessPage() {
  const params = useParams<{ locale: string }>()
  const locale = (params?.locale === 'bn' ? 'bn' : 'en') as 'en' | 'bn'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationState, setVerificationState] =
    useState<VerificationState>('loading')
  const [loadingMsg, setLoadingMsg] = useState('Verifying your payment')
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION)

  const [confirmPayment] = onboardingApi.useConfirmOnboardingPaymentMutation()

  const sessionId =
    searchParams.get('session_id') ?? searchParams.get('sessionId') ?? ''
  const reference = searchParams.get('reference') ?? undefined
  const planId = searchParams.get('plan_id') ?? 'FREE'
  const planName = searchParams.get('plan_name') ?? 'Plan'
  const billingCycle = searchParams.get('billing_cycle') ?? 'monthly'
  const price = searchParams.get('price') ?? '0.00'
  const currency = searchParams.get('currency') ?? 'USD'
  const cardLast4 = searchParams.get('card_last4') ?? '4242'

  const nextBillingDate = useMemo(() => {
    const now = new Date()
    if (billingCycle === 'yearly') {
      now.setFullYear(now.getFullYear() + 1)
    } else {
      now.setMonth(now.getMonth() + 1)
    }

    return now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [billingCycle])

  const summary = useMemo<SummaryRow[]>(
    () => [
      { label: 'Plan', value: planName, highlight: true },
      { label: 'Plan code', value: planId, mono: true },
      {
        label: 'Billing cycle',
        value: billingCycle === 'yearly' ? 'Annually' : 'Monthly',
      },
      {
        label: 'Amount charged',
        value: `${currency} ${price}`,
        highlight: true,
      },
      { label: 'Next billing', value: nextBillingDate },
      { label: 'Card', value: `•••• ${cardLast4}` },
    ],
    [
      billingCycle,
      cardLast4,
      currency,
      nextBillingDate,
      planId,
      planName,
      price,
    ],
  )

  const verifyPayment = useCallback(async () => {
    try {
      setLoadingMsg('Verifying payment and activating subscription')
      if (sessionId) {
        await confirmPayment({ sessionId, reference }).unwrap()
      }
      setVerificationState('confirmed')
      setCountdown(COUNTDOWN_DURATION)
    } catch (error) {
      setVerificationState('failed')
      toast.error(
        getApiErrorMessage(error, 'Unable to confirm payment right now.'),
      )
    }
  }, [confirmPayment, reference, sessionId])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      if (!cancelled) await verifyPayment()
    })()
    return () => {
      cancelled = true
    }
  }, [verifyPayment])

  // Auto-redirect countdown after confirmed
  useEffect(() => {
    if (verificationState !== 'confirmed') return
    const timer = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(timer)
          router.push(`/${locale}/onboarding/complete`)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [locale, router, verificationState])

  const handleContinue = () => router.push(`/${locale}/onboarding/complete`)

  const handleRetryVerification = () => {
    setVerificationState('loading')
    setLoadingMsg('Retrying payment verification')
    void verifyPayment()
  }

  const handleChangePlan = () => {
    router.push(`/${locale}/onboarding/plan`)
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-md text-center">
        {/* ── LOADING STATE ── */}
        {verificationState === 'loading' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="inline-flex items-center justify-center size-14 rounded-full bg-teal-50 mb-6">
              <RefreshCw
                className="size-6 text-teal-700 animate-spin"
                style={{ animationDuration: '0.8s' }}
              />
            </div>
            <h1 className="text-lg font-semibold text-slate-900 mb-1.5">
              {loadingMsg}
            </h1>
            <p className="text-sm text-slate-500">
              Please wait while we verify your payment and activate your plan.
            </p>
          </div>
        )}

        {/* ── FAILED STATE ── */}
        {verificationState === 'failed' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
              Verification failed
            </h1>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              We could not confirm your checkout session. If payment was already
              captured, retry after a moment.
            </p>

            {/* Overview card — same style as failed page error detail */}
            <div className="border border-red-100 rounded-xl bg-white p-5 text-left mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-red-700 mb-3.5">
                Plan Overview
              </p>
              {summary.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-baseline py-2.5 border-b border-slate-100 text-sm last:border-none"
                >
                  <span className="text-slate-500">{row.label}</span>
                  <span
                    className={cn(
                      'font-medium text-slate-800',
                      row.mono ? 'font-mono text-xs' : '',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleRetryVerification}
                className="flex items-center justify-center gap-2 w-full h-11 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Retry verification
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

        {/* ── CONFIRMED STATE ── */}
        {verificationState === 'confirmed' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Icon */}
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-teal-50 mb-5">
              <CheckCircle2 className="size-7 text-teal-600" />
            </div>

            <h1 className="text-[22px] font-semibold text-slate-900 mb-2">
              Payment confirmed
            </h1>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Your subscription is now active and ready to use.
            </p>

            {/* Plan overview card — mirrors failed page error detail card */}
            <div className="border border-teal-100 rounded-xl bg-white p-5 text-left mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-700 mb-3.5">
                Plan overview
              </p>
              {summary.map((row) => (
                <div
                  key={row.label}
                  className="flex justify-between items-baseline py-2.5 border-b border-slate-100 text-sm last:border-none"
                >
                  <span className="text-slate-500">{row.label}</span>
                  <span
                    className={cn(
                      'font-medium',
                      row.highlight ? 'text-teal-700' : 'text-slate-800',
                      row.mono ? 'font-mono text-xs' : '',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA + countdown */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleContinue}
                className="relative flex items-center justify-center gap-2 w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 overflow-hidden"
              >
                Continue onboarding
                <ArrowRight className="w-4 h-4" />
                {/* countdown shrink bar */}
                <span
                  className="absolute bottom-0 left-0 h-0.75 bg-teal-500 transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(countdown / COUNTDOWN_DURATION) * 100}%`,
                  }}
                />
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Redirecting automatically in {countdown}s
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
