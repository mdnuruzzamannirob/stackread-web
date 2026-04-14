'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { AuthCard } from '@/components/layout/auth-card'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { useCompleteOnboardingMutation } from '@/store/features/onboarding/onboardingApi'

export default function OnboardingCompletionPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentRequired = searchParams.get('paymentRequired') === '1'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completeOnboardingMutation] = useCompleteOnboardingMutation()

  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true)

    try {
      await completeOnboardingMutation({ agreeToTerms: true }).unwrap()

      toast.success('Onboarding completed')
      router.replace(`/${locale}/dashboard`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to complete onboarding'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Complete onboarding"
      subtitle={
        paymentRequired
          ? 'Your selected plan requires payment handling in the next phase.'
          : 'Confirm your selection to finish setup.'
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This final step stores your onboarding state and unlocks the
          dashboard.
        </p>
        <Button
          type="button"
          className="w-full"
          onClick={() => void handleCompleteOnboarding()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Completing...' : 'Complete onboarding'}
        </Button>
      </div>
    </AuthCard>
  )
}
