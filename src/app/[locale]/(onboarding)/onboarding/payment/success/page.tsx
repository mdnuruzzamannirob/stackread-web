
'use client'

import { useTranslations } from 'next-intl'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AuthCard } from '@/components/layout/authCard'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useConfirmOnboardingPaymentMutation,
  useLazyGetOnboardingStatusQuery,
} from '@/store/features/onboarding/onboardingApi'

export default function OnboardingPaymentSuccessPage() {
  const t = useTranslations('onboarding.success')
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statusText, setStatusText] = useState(t('waitingForStripe'))
  const [isFinalizing, setIsFinalizing] = useState(true)
  const hasStartedRef = useRef(false)
  const paymentReference = searchParams.get('ref')
  const stripeSessionId = searchParams.get('session_id')
  const [confirmOnboardingPayment] = useConfirmOnboardingPaymentMutation()
  const [fetchOnboardingStatus] = useLazyGetOnboardingStatusQuery()

  useEffect(() => {
    if (hasStartedRef.current) {
      return
    }

    hasStartedRef.current = true

    let isMounted = true
    const maxAttempts = 8

    const run = async () => {
      if (stripeSessionId) {
        try {
          setStatusText(t('confirmingPayment'))
          const confirmation = await confirmOnboardingPayment({
            sessionId: stripeSessionId,
            ...(paymentReference ? { reference: paymentReference } : {}),
          }).unwrap()

          if (confirmation.data?.status === 'completed') {
            setStatusText(t('completed'))
            toast.success(t('completedToast'))
            router.replace(`/${locale}/dashboard`)
            return
          }

          setStatusText(t('paymentConfirmed'))
        } catch (error) {
          toast.error(getApiErrorMessage(error, t('retryLater')))
        }
      }

      for (let attempt = 1; attempt <= maxAttempts && isMounted; attempt += 1) {
        setStatusText(t('checkingPayment', { attempts: attempt, maxAttempts }))

        const refreshed = await fetchOnboardingStatus()
        const onboardingStatus = refreshed.data?.data?.status ?? null

        if (onboardingStatus === 'completed') {
          setStatusText(t('completed'))
          toast.success(t('completedToast'))
          router.replace(`/${locale}/dashboard`)
          return
        }

        if (attempt < maxAttempts) {
          await new Promise((resolve) => {
            window.setTimeout(resolve, 1200)
          })
        }
      }

      if (!isMounted) {
        return
      }

      setStatusText(t('takingLonger'))
      setIsFinalizing(false)
    }

    void run()

    return () => {
      isMounted = false
    }
  }, [
    confirmOnboardingPayment,
    locale,
    paymentReference,
    fetchOnboardingStatus,
    router,
    stripeSessionId,
    t,
  ])

  useEffect(() => {
    if (!paymentReference && !stripeSessionId) {
      return
    }

    const timeout = window.setTimeout(() => {
      setStatusText(t('returnedWaiting'))
    }, 0)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [paymentReference, stripeSessionId, t])

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{statusText}</p>

        <Button
          type="button"
          className="w-full"
          onClick={() => window.location.reload()}
          disabled={isFinalizing}
        >
          {isFinalizing ? t('finalizing') : t('checkAgain')}
        </Button>
      </div>
    </AuthCard>
  )
}
