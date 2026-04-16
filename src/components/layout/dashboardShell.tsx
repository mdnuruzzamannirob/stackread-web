'use client'

import useSidebar from '@/hooks/useSidebar'
import { usePathname } from 'next/navigation'
import { DashboardHeader } from './dashboardHeader'
import { DashboardSidebar } from './dashboardSidebar'

interface DashboardShellProps {
  locale: string
  children: React.ReactNode
}

export function DashboardShell({ locale, children }: DashboardShellProps) {
  const { isSidebarOpen, closeSidebar } = useSidebar()
  const pathname = usePathname()

  const title = pathname.startsWith(`/${locale}/notifications`)
    ? 'Notifications'
    : pathname.startsWith(`/${locale}/settings`)
      ? 'Settings'
      : pathname.startsWith(`/${locale}/profile`)
        ? 'Account Settings'
        : pathname.startsWith(`/${locale}/security`)
          ? 'Account Settings'
          : pathname.startsWith(`/${locale}/preferences`)
            ? 'Account Settings'
            : pathname.startsWith(`/${locale}/danger`)
              ? 'Account Settings'
              : 'My Account'

  return (
    <div className="min-h-dvh bg-brand-50 text-brand-900">
      <aside className="fixed bg-brand-50 inset-y-0 left-0 z-30 hidden w-60 md:block">
        <DashboardSidebar locale={locale} />
      </aside>

      <div
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-brand-50 shadow-xl transition-transform duration-300 md:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <DashboardSidebar locale={locale} />
      </div>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-40 md:hidden"
          aria-label="Close sidebar overlay"
          onClick={closeSidebar}
        />
      ) : null}

      <DashboardHeader locale={locale} title={title} />

      <main className="min-h-dvh px-4 md:ml-60 pb-8 pt-24 md:px-6 md:pt-28 lg:pt-28">
        {children}
      </main>
    </div>
  )
}
