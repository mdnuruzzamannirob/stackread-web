'use client'

import { useTranslations } from 'next-intl'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { AuthCard } from '@/components/layout/authCard'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useCompleteOnboardingMutation,
  useGetOnboardingPlansQuery,
  useGetOnboardingStatusQuery,
} from '@/store/features/onboarding/onboardingApi'

export default function OnboardingCompletionPage() {
  const t = useTranslations('onboarding.completion')
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentRequiredFromQuery = searchParams.get('paymentRequired') === '1'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: plansResponse } = useGetOnboardingPlansQuery()
  const { data: statusResponse } = useGetOnboardingStatusQuery()
  const [completeOnboardingMutation] = useCompleteOnboardingMutation()

  const plans = plansResponse?.data ?? []
  const selectedPlanCode = statusResponse?.data?.selectedPlanCode
  const selectedPlan = plans.find((plan) => plan.code === selectedPlanCode)
  const isPaidPlan = Boolean(selectedPlan?.isPaid)
  const paymentRequired = paymentRequiredFromQuery || isPaidPlan

  const handleCompleteOnboarding = async () => {
    if (paymentRequired) {
      toast.error(t('paymentRequiredToast'))
      return
    }

    setIsSubmitting(true)

    try {
      await completeOnboardingMutation({ agreeToTerms: true }).unwrap()

      toast.success(t('completedToast'))
      router.replace(`/${locale}/dashboard`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('unableToComplete')))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title={t('title')}
      subtitle={paymentRequired ? t('subtitlePaid') : t('subtitleFree')}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {paymentRequired ? t('paidBody') : t('freeBody')}
        </p>
        <Button
          type="button"
          className="w-full"
          onClick={() => void handleCompleteOnboarding()}
          disabled={isSubmitting || paymentRequired}
        >
          {paymentRequired
            ? t('paymentRequiredLabel')
            : isSubmitting
              ? t('completing')
              : t('completeOnboarding')}
        </Button>
      </div>
    </AuthCard>
  )
}
