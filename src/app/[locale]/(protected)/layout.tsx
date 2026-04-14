import { redirect } from 'next/navigation'

import { serverApiRequest } from '@/lib/api/server'
import { getServerAccessToken } from '@/lib/auth/server-session'
import { env } from '@/lib/env'

type OnboardingStatusResponse = {
  status?: 'pending' | 'selected' | 'completed'
}

async function hasValidUserSession(token: string) {
  const response = await fetch(`${env.apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  return response.ok
}

async function getOnboardingStatus(token: string) {
  return serverApiRequest<OnboardingStatusResponse>({
    path: '/onboarding/status',
    token,
  })
}

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const token = await getServerAccessToken()

  if (!token) {
    redirect(`/${locale}/auth/login`)
  }

  const isValid = await hasValidUserSession(token)

  if (!isValid) {
    redirect(`/${locale}/auth/login`)
  }

  const onboarding = await getOnboardingStatus(token)

  if (onboarding?.status === 'pending' || onboarding?.status === 'selected') {
    redirect(`/${locale}/onboarding/plan-selection`)
  }

  return <div className="min-h-screen bg-background px-4 py-8">{children}</div>
}
