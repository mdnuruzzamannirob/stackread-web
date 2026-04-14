import { env } from '@/lib/env'
import type { AuthState } from '@/store/features/auth/types'

type OnboardingStatusResponse = {
  status?: AuthState['onboardingStatus']
}

export async function fetchOnboardingStatus(accessToken: string) {
  const response = await fetch(`${env.apiBaseUrl}/onboarding/status`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const json = (await response.json()) as { data?: OnboardingStatusResponse }
  const status = json.data?.status

  if (status === 'pending' || status === 'selected' || status === 'completed') {
    return status
  }

  return null
}

export function resolvePostAuthDestination({
  locale,
  onboardingStatus,
}: {
  locale: string
  onboardingStatus: AuthState['onboardingStatus'] | null
}) {
  if (onboardingStatus === 'pending' || onboardingStatus === 'selected') {
    return `/${locale}/onboarding/plan-selection`
  }

  return `/${locale}/dashboard`
}

export async function resolveAuthenticatedDestination({
  accessToken,
  locale,
}: {
  accessToken: string
  locale: string
}) {
  const onboardingStatus = await fetchOnboardingStatus(accessToken)
  return resolvePostAuthDestination({ locale, onboardingStatus })
}
