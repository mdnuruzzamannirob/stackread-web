'use client'

import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { AuthCard } from '@/components/layout/auth-card'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { getStoredAccessToken } from '@/lib/auth/token-storage'
import { env } from '@/lib/env'

export default function OnboardingCompletionPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentRequired = searchParams.get('paymentRequired') === '1'
  const [isSubmitting, setIsSubmitting] = useState(false)

  const completeOnboarding = async () => {
    const token = getStoredAccessToken()

    if (!token) {
      router.replace(`/${locale}/auth/login`)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${env.apiBaseUrl}/onboarding/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agreeToTerms: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

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
          onClick={() => void completeOnboarding()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Completing...' : 'Complete onboarding'}
        </Button>
      </div>
    </AuthCard>
  )
}
