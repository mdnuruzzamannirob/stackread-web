'use client'

import { OnboardingShell } from '@/components/OnboardingShell'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { onboardingApi } from '@/store/features/onboarding/onboardingApi'
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

type VerificationState = 'loading' | 'confirmed' | 'failed'

export default function OnboardingPaymentSuccessPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [verificationState, setVerificationState] =
    useState<VerificationState>('loading')
  const [countdown, setCountdown] = useState(5)

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
    if (billingCycle === 'annually') {
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

  const summary = useMemo(() => {
    return [
      { label: 'Plan', value: planName },
      { label: 'Plan code', value: planId },
      { label: 'Billing cycle', value: billingCycle },
      { label: 'Amount', value: `${currency} ${price}` },
      { label: 'Next billing', value: nextBillingDate },
      { label: 'Card', value: `•••• ${cardLast4}` },
    ]
  }, [
    billingCycle,
    cardLast4,
    currency,
    nextBillingDate,
    planId,
    planName,
    price,
  ])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      try {
        if (sessionId) {
          await confirmPayment({ sessionId, reference }).unwrap()
        }

        if (!cancelled) {
          setVerificationState('confirmed')
        }
      } catch (error) {
        if (!cancelled) {
          setVerificationState('failed')
        }
        toast.error(
          getApiErrorMessage(error, 'Unable to confirm payment right now.'),
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [confirmPayment, reference, sessionId])

  useEffect(() => {
    if (verificationState !== 'confirmed') {
      return
    }

    const timer = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(timer)
          router.push(`/${locale}/onboarding/complete`)
          return 0
        }
        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [locale, router, verificationState])

  const handleContinue = () => {
    router.push(`/${locale}/onboarding/complete`)
  }

  const handleChangePlan = () => {
    router.push(`/${locale}/onboarding/plan`)
  }

  return (
    <OnboardingShell
      stepLabel="Step 4 of 5"
      progress={4}
      title={
        verificationState === 'confirmed'
          ? 'Payment confirmed'
          : verificationState === 'failed'
            ? 'Payment verification failed'
            : 'Confirming your payment'
      }
      subtitle={
        verificationState === 'confirmed'
          ? 'Your subscription is ready. Review the summary below.'
          : verificationState === 'failed'
            ? 'We could not verify the payment. Please try again or choose another plan.'
            : 'Please wait while we verify your payment with the backend.'
      }
    >
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          {verificationState === 'confirmed' ? (
            <CheckCircle2 className="size-7 text-teal-600" />
          ) : (
            <Loader2 className="size-7 animate-spin text-teal-600" />
          )}
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {verificationState === 'confirmed'
                ? 'Subscription active'
                : verificationState === 'failed'
                  ? 'Verification needed'
                  : 'Verifying payment'}
            </p>
            <p className="text-sm text-gray-500">
              {verificationState === 'confirmed'
                ? `Auto-redirecting in ${countdown}s`
                : verificationState === 'failed'
                  ? 'Please retry payment or pick a different plan.'
                  : 'This usually takes a few seconds.'}
            </p>
          </div>
        </div>

        {verificationState === 'loading' ? (
          <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-teal-100 bg-teal-50/40">
            <div className="text-center">
              <Loader2 className="mx-auto size-10 animate-spin text-teal-600" />
              <p className="mt-4 text-sm font-medium text-gray-700">
                Verifying payment and activating your plan...
              </p>
              <p className="mt-1 text-sm text-gray-500">
                You will be redirected automatically once this is done.
              </p>
            </div>
          </div>
        ) : verificationState === 'failed' ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              Payment was not confirmed. If you already paid, please wait a
              moment and retry from here.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {summary.map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleChangePlan}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <RefreshCw className="size-4" />
                Choose another plan
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.map((item) => (
                <div key={item.label} className="rounded-xl bg-gray-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleContinue}
                className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-700"
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </OnboardingShell>
  )
}
