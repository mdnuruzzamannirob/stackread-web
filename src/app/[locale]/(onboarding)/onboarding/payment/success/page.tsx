'use client'

import { cn } from '@/lib/utils'
import { ArrowRight } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// ------- types -------
type Stage = 'verifying' | 'activating' | 'emailing' | 'success'

type Step = {
  key: 'verifying' | 'activating' | 'emailing'
  label: string
}

// ------- replace with real Stripe session + DB data -------
const FAKE_TRANSACTION = {
  plan: 'Premium',
  amount: '$14.99',
  cycle: 'Monthly',
  currency: 'USD',
  card: ' •••• 4242',
  nextBillingDate: 'May 20, 2026',
  txId: 'LLG-8924-XYZ',
  userEmail: 'user@example.com',
}

const STEPS: Step[] = [
  { key: 'verifying', label: 'Verifying Stripe payment' },
  { key: 'activating', label: 'Activating subscription plan' },
  { key: 'emailing', label: 'Sending receipt to email' },
]

const STAGE_META: Record<
  Exclude<Stage, 'success'>,
  { title: string; sub: string; bar: string; label: string }
> = {
  verifying: {
    title: 'Verifying payment',
    sub: 'Confirming your transaction with Stripe...',
    bar: 'w-[28%]',
    label: 'Step 1 of 3',
  },
  activating: {
    title: 'Activating your plan',
    sub: 'Setting up your Premium access...',
    bar: 'w-[62%]',
    label: 'Step 2 of 3',
  },
  emailing: {
    title: 'Sending confirmation',
    sub: 'Sending your receipt and subscription details...',
    bar: 'w-[88%]',
    label: 'Step 3 of 3',
  },
}

// ------- helper: step status -------
function stepStatus(stepKey: Step['key'], stage: Stage) {
  const order: Record<Step['key'], number> = {
    verifying: 0,
    activating: 1,
    emailing: 2,
  }
  const stageOrder: Record<Stage, number> = {
    verifying: 0,
    activating: 1,
    emailing: 2,
    success: 3,
  }
  const diff = stageOrder[stage] - order[stepKey]
  if (diff > 0) return 'done'
  if (diff === 0) return 'active'
  return 'pending'
}

// ------- icon components -------
function Spinner({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      className="animate-spin"
      style={{ animationDuration: '0.75s' }}
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        fill="none"
        stroke="#9FE1CB"
        strokeWidth="2"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        fill="none"
        stroke="#0F6E56"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function CheckMini() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2.5 6l2.5 2.5 4.5-5"
        stroke="#0F6E56"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ------- main component -------
export default function OnboardingPaymentSuccessPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const router = useRouter()

  const [stage, setStage] = useState<Stage>('verifying')
  const [countdown, setCountdown] = useState(5)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Sequential activation
  useEffect(() => {
    const t1 = setTimeout(() => setStage('activating'), 1600)
    const t2 = setTimeout(() => setStage('emailing'), 3200)
    const t3 = setTimeout(() => setStage('success'), 4800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  // Auto-redirect countdown after success
  useEffect(() => {
    if (stage !== 'success') return

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!)
          router.push(`/${locale}/onboarding/complete`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [stage, locale, router])

  const handleContinue = () => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    router.push(`/${locale}/onboarding/complete`)
  }

  const isSuccess = stage === 'success'
  const meta = !isSuccess ? STAGE_META[stage] : null

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-sm text-center">
        {/* ── LOADING STAGES ── */}
        {!isSuccess && meta && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Icon */}
            <div className="inline-flex items-center justify-center relative mb-6">
              <span className="absolute inset-0 rounded-full border-2 border-teal-200 animate-ping opacity-60" />
              <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center relative z-10">
                {stage === 'verifying' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="5"
                      width="20"
                      height="14"
                      rx="2"
                      stroke="#0F6E56"
                      strokeWidth="1.5"
                    />
                    <path d="M2 10h20" stroke="#0F6E56" strokeWidth="1.5" />
                    <rect
                      x="5"
                      y="14"
                      width="4"
                      height="2"
                      rx="1"
                      fill="#0F6E56"
                    />
                  </svg>
                )}
                {stage === 'activating' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L2 7l10 5 10-5-10-5z"
                      stroke="#0F6E56"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 17l10 5 10-5"
                      stroke="#0F6E56"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M2 12l10 5 10-5"
                      stroke="#0F6E56"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {stage === 'emailing' && (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2"
                      stroke="#0F6E56"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M2 7l10 7 10-7"
                      stroke="#0F6E56"
                      strokeWidth="1.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </div>

            <h1 className="text-lg font-semibold text-slate-900 mb-1.5 transition-all duration-500 ease-in-out">
              {meta.title}
            </h1>
            <p className="text-sm text-slate-500 mb-7 leading-relaxed transition-all duration-500 ease-in-out">
              {meta.sub}
            </p>

            {/* Step list */}
            <div className="bg-slate-50 rounded-xl px-5 py-3 text-left mb-6 space-y-1">
              {STEPS.map((step) => {
                const status = stepStatus(step.key, stage)
                return (
                  <div key={step.key} className="flex items-center gap-3 py-2">
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full shrink-0 flex items-center justify-center transition-all duration-500 ease-in-out',
                        status === 'done' && 'bg-teal-50',
                        status === 'active' && 'bg-teal-50',
                        status === 'pending' && 'bg-slate-200',
                      )}
                    >
                      {status === 'done' && <CheckMini />}
                      {status === 'active' && <Spinner />}
                    </div>
                    <span
                      className={cn(
                        'text-sm transition-all duration-500 ease-in-out',
                        status === 'done' && 'text-slate-400',
                        status === 'active' && 'text-slate-900 font-medium',
                        status === 'pending' && 'text-slate-400 opacity-50',
                      )}
                    >
                      {step.label}
                    </span>
                    <span
                      className={cn(
                        'ml-auto text-[11px] px-2 py-0.5 rounded-full transition-all duration-500 ease-in-out',
                        status === 'done'
                          ? 'text-teal-700 bg-teal-50 opacity-100'
                          : 'opacity-0 pointer-events-none',
                      )}
                    >
                      Done
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden mb-1.5">
              <div
                className={cn(
                  'h-full bg-teal-600 rounded-full transition-all duration-700 ease-in-out',
                  meta.bar,
                )}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right transition-all duration-300">
              {meta.label}
            </p>
          </div>
        )}

        {/* ── SUCCESS STATE ── */}
        {isSuccess && (
          <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
            {/* Check icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 mb-5">
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <path
                  d="M7 15.5l5.5 5.5L23 9"
                  stroke="#0F6E56"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h1 className="text-[22px] font-semibold text-slate-900 mb-2">
              Subscription activated!
            </h1>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Your premium access is now active and ready to use.
            </p>

            {/* Transaction summary */}
            <div className="border border-teal-100 rounded-xl p-5 text-left mb-4 animate-in slide-in-from-bottom-2 duration-500 delay-100">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-700 mb-3.5">
                Transaction summary
              </p>
              {[
                { label: 'Plan', value: FAKE_TRANSACTION.plan },
                {
                  label: 'Billing cycle',
                  value: FAKE_TRANSACTION.cycle,
                },
                {
                  label: 'Amount paid',
                  value:
                    FAKE_TRANSACTION.amount + ' ' + FAKE_TRANSACTION.currency,
                  green: true,
                },
                {
                  label: 'Card',
                  value: FAKE_TRANSACTION.card,
                },
                {
                  label: 'Transaction ID',
                  value: FAKE_TRANSACTION.txId,
                  mono: true,
                },
                {
                  label: 'Next billing date',
                  value: FAKE_TRANSACTION.nextBillingDate,
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
                      row.green ? 'text-teal-700' : 'text-slate-800',
                      row.mono && 'font-mono text-xs',
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Email notice */}
            <div className="flex items-center gap-2.5 bg-slate-50 rounded-lg px-4 py-3 mb-5 text-left animate-in slide-in-from-bottom-2 duration-500 delay-150">
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                className="shrink-0"
              >
                <rect
                  x="1"
                  y="2.5"
                  width="13"
                  height="10"
                  rx="1.5"
                  stroke="#0F6E56"
                  strokeWidth="1.2"
                />
                <path d="M1 6h13" stroke="#0F6E56" strokeWidth="1.2" />
                <path
                  d="M4 9.5h4"
                  stroke="#0F6E56"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <p className="text-xs text-slate-500">
                Receipt sent to{' '}
                <span className="font-medium text-slate-700">
                  {FAKE_TRANSACTION.userEmail}
                </span>
              </p>
            </div>

            {/* CTA — single mandatory button */}
            <div className="animate-in slide-in-from-bottom-2 duration-500 delay-200">
              <button
                type="button"
                onClick={handleContinue}
                className="relative flex items-center justify-center gap-2 w-full h-11 bg-teal-700 hover:bg-teal-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 overflow-hidden"
              >
                Continue onboarding
                <ArrowRight className="w-4 h-4" />
                {/* countdown shrink bar */}
                <span
                  className="absolute bottom-0 left-0 h-0.75 bg-white/30 transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 5) * 100}%` }}
                />
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Redirecting automatically in{' '}
                <span className="font-medium text-slate-600">{countdown}s</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
