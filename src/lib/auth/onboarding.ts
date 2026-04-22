import { env } from '@/lib/env'
import type { AuthState } from '@/store/features/auth/types'

type OnboardingStatusResponse = {
  status?: AuthState['onboardingStatus']
  startedAt?: string
  selectedPlanCode?: string
  selectedPlanName?: string
  selectedPlanPrice?: number
  selectedBillingCycle?: 'monthly' | 'yearly'
  selectedAt?: string
  interests?: string[]
  selectedLanguage?: string
  completedAt?: string
}

type MeResponse = {
  isEmailVerified?: boolean
}

export type OnboardingProgressStage =
  | 'welcome'
  | 'interests'
  | 'language'
  | 'plan'
  | 'complete'
  | 'dashboard'

export type OnboardingPageStep =
  | 'welcome'
  | 'interests'
  | 'language'
  | 'plan'
  | 'complete'

export type OnboardingProgressSnapshot = Pick<
  OnboardingStatusResponse,
  'status' | 'startedAt' | 'selectedPlanCode' | 'interests' | 'selectedLanguage'
>
const onboardingPageOrder: Record<OnboardingPageStep, number> = {
  welcome: 0,
  interests: 1,
  language: 2,
  plan: 3,
  complete: 4,
}

const onboardingStageOrder: Record<OnboardingProgressStage, number> = {
  welcome: 0,
  interests: 1,
  language: 2,
  plan: 3,
  complete: 4,
  dashboard: 5,
}

function hasSelectedLanguage(language?: string) {
  return language === 'en' || language === 'bn'
}

function hasSelectedInterests(interests?: string[]) {
  return Array.isArray(interests) && interests.length > 0
}

function hasSelectedPlan(snapshot?: OnboardingProgressSnapshot | null) {
  return Boolean(
    snapshot?.status === 'selected' ||
      (typeof snapshot?.selectedPlanCode === 'string' &&
        snapshot.selectedPlanCode.trim() !== ''),
  )
}

function getOnboardingProgressRoute(
  locale: string,
  stage: Exclude<OnboardingProgressStage, 'dashboard'>,
) {
  return `/${locale}/onboarding/${stage}`
}

export function resolveOnboardingProgressStage(
  snapshot?: OnboardingProgressSnapshot | null,
): OnboardingProgressStage {
  if (snapshot?.status === 'completed') {
    return 'dashboard'
  }

  const interestsSelected = hasSelectedInterests(snapshot?.interests)
  const languageSelected = hasSelectedLanguage(snapshot?.selectedLanguage)
  const planSelected = hasSelectedPlan(snapshot)
  const hasStartedOnboarding = Boolean(
    snapshot?.startedAt || interestsSelected || languageSelected || planSelected,
  )

  if (!hasStartedOnboarding) {
    return 'welcome'
  }

  if (!interestsSelected) {
    return 'interests'
  }

  if (!languageSelected) {
    return 'language'
  }

  if (!planSelected) {
    return 'plan'
  }

  return 'plan'
}

export function resolveOnboardingStepRedirect({
  locale,
  page,
  onboarding,
}: {
  locale: string
  page: OnboardingPageStep
  onboarding?: OnboardingProgressSnapshot | null
}) {
  const stage = resolveOnboardingProgressStage(onboarding)

  if (stage === 'dashboard') {
    return `/${locale}/dashboard`
  }

  if (onboardingPageOrder[page] <= onboardingStageOrder[stage]) {
    return null
  }

  return getOnboardingProgressRoute(locale, stage)
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
  return json.data ?? null
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

export async function resolveAuthenticatedDestination({
  accessToken,
  locale,
}: {
  accessToken?: string | null
  locale: string
}) {
  const onboardingStatus = await fetchOnboardingStatus(accessToken)

  if (!onboardingStatus) {
    const me = await fetchMe(accessToken)

    if (me && !me.isEmailVerified) {
      return `/${locale}/register/verify-email`
    }

    return `/${locale}/dashboard`
  }

  const stage = resolveOnboardingProgressStage(onboardingStatus)

  if (stage !== 'dashboard') {
    return getOnboardingProgressRoute(locale, stage)
  }

  const me = await fetchMe(accessToken)

  if (me && !me.isEmailVerified) {
    return `/${locale}/register/verify-email`
  }

  return `/${locale}/dashboard`
}
