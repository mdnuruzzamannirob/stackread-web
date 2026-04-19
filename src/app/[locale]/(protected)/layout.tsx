import { redirect } from 'next/navigation'

import { DashboardShell } from '@/components/layout/dashboardShell'
import { SidebarProvider } from '@/contexts/SidebarProvider'
import { serverApiRequest } from '@/lib/api/server'
import { getServerAccessToken } from '@/lib/auth/server-session'

type OnboardingStatusResponse = {
  status?: 'pending' | 'selected' | 'completed'
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

  const onboarding = await getOnboardingStatus(token)

  if (!onboarding) {
    redirect(`/${locale}/auth/login`)
  }

  if (onboarding?.status === 'pending' || onboarding?.status === 'selected') {
    redirect(`/${locale}/onboarding/plan`)
  }

  return (
    <SidebarProvider>
      <DashboardShell locale={locale}>{children}</DashboardShell>
    </SidebarProvider>
  )
}
