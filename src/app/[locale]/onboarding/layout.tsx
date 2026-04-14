import { redirect } from 'next/navigation'

import { serverApiRequest } from '@/lib/api/server'
import { getServerAccessToken } from '@/lib/auth/server-session'

type OnboardingStatusResponse = {
  status?: 'pending' | 'selected' | 'completed'
}

export default async function OnboardingLayout({
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

  const status = await serverApiRequest<OnboardingStatusResponse>({
    path: '/onboarding/status',
    token,
  })

  if (status?.status === 'completed') {
    redirect(`/${locale}/dashboard`)
  }

  return <div className="min-h-screen bg-background px-4 py-8">{children}</div>
}
