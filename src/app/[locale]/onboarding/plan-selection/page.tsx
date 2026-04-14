'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { AuthCard } from '@/components/layout/auth-card'
import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { fetchOnboardingStatus } from '@/lib/auth/onboarding'
import { getStoredAccessToken } from '@/lib/auth/token-storage'
import { env } from '@/lib/env'

type Plan = {
  code: string
  name: string
  price: number
  billingCycle: string
  isPaid: boolean
}

type OnboardingSelectResponse = {
  status?: string
  nextStep?: string
}

export default function OnboardingPlanSelectionPage() {
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlanCode, setSelectedPlanCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadPlans = async () => {
      const token = getStoredAccessToken()

      if (!token) {
        router.replace(`/${locale}/auth/login`)
        return
      }

      try {
        const response = await fetch(`${env.apiBaseUrl}/onboarding/plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Failed to load onboarding plans')
        }

        const json = (await response.json()) as { data?: Plan[] }
        setPlans(Array.isArray(json.data) ? json.data : [])

        const status = await fetchOnboardingStatus(token)
        if (status === 'completed') {
          router.replace(`/${locale}/dashboard`)
        }
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, 'Unable to load onboarding plans'),
        )
      } finally {
        setIsLoading(false)
      }
    }

    void loadPlans()
  }, [locale, router])

  const selectPlan = async (planCode: string) => {
    const token = getStoredAccessToken()

    if (!token) {
      router.replace(`/${locale}/auth/login`)
      return
    }

    setIsSubmitting(true)
    setSelectedPlanCode(planCode)

    try {
      const response = await fetch(`${env.apiBaseUrl}/onboarding/select`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planCode }),
      })

      if (!response.ok) {
        throw new Error('Failed to select onboarding plan')
      }

      const json = (await response.json()) as {
        data?: OnboardingSelectResponse
      }
      const nextStep = json.data?.nextStep

      toast.success('Plan selected')

      if (nextStep === 'redirect_to_payment') {
        router.push(`/${locale}/onboarding/completion?paymentRequired=1`)
        return
      }

      router.push(`/${locale}/onboarding/completion`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to select plan'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Choose a plan"
      subtitle="Select the onboarding plan that fits your account."
    >
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading plans...</p>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div
              key={plan.code}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {plan.isPaid ? 'Paid plan' : 'Free plan'} ·{' '}
                    {plan.billingCycle}
                  </p>
                </div>
                <p className="text-right text-lg font-semibold">
                  {plan.price === 0 ? 'Free' : `৳${plan.price}`}
                </p>
              </div>

              <Button
                type="button"
                className="mt-4 w-full"
                onClick={() => void selectPlan(plan.code)}
                disabled={isSubmitting && selectedPlanCode !== plan.code}
              >
                {selectedPlanCode === plan.code && isSubmitting
                  ? 'Saving...'
                  : 'Select plan'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </AuthCard>
  )
}
