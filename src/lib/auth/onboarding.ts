import { env } from '@/lib/env'
import type { AuthState } from '@/store/features/auth/types'

type OnboardingStatusResponse = {
  status?: AuthState['onboardingStatus']
}

type MeResponse = {
  isEmailVerified?: boolean
}

export async function fetchOnboardingStatus(accessToken?: string | null) {
  const response = await fetch(`${env.apiBaseUrl}/onboarding/status`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
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

async function fetchMe(accessToken?: string | null) {
  const response = await fetch(`${env.apiBaseUrl}/auth/me`, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  const json = (await response.json()) as { data?: MeResponse }
  return json.data ?? null
}

export function resolvePostAuthDestination({
  locale,
  onboardingStatus,
}: {
  locale: string
  onboardingStatus: AuthState['onboardingStatus'] | null
}) {
  if (onboardingStatus === 'pending' || onboardingStatus === 'selected') {
    return `/${locale}/onboarding/plan`
  }

  return `/${locale}/dashboard`
}

export async function resolveAuthenticatedDestination({
  accessToken,
  locale,
}: {
  accessToken?: string | null
  locale: string
}) {
  const onboardingStatus = await fetchOnboardingStatus(accessToken)

  if (onboardingStatus === 'pending' || onboardingStatus === 'selected') {
    return `/${locale}/onboarding/plan`
  }

  const me = await fetchMe(accessToken)

  if (me && !me.isEmailVerified) {
    return `/${locale}/auth/check-email`
  }

  return resolvePostAuthDestination({ locale, onboardingStatus })
}
