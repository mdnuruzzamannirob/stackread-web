'use client'

import { DashboardUserMenu } from '@/components/common/userMenuPopover'
import { DashboardNotifications } from '@/components/layout/dashboardNotifications'
import { DashboardSearchDialog } from '@/components/layout/dashboardSearchDialog'
import useSidebar from '@/hooks/useSidebar'
import { resolveDashboardTitleKey } from '@/lib/dashboard/page-map'
import { Menu } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { LocaleSwitcher, ThemeToggle } from '../common'

interface DashboardHeaderProps {
  locale: string
}

export function DashboardHeader({ locale }: DashboardHeaderProps) {
  const pathname = usePathname()
  const translate = useTranslations()
  const t = useTranslations('dashboard.header')
  const { toggleSidebar } = useSidebar()

  const title = translate(resolveDashboardTitleKey(pathname, locale))

  return (
    <div className="fixed left-0 right-0 bg-white top-0 z-40 md:left-60">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3.75 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex size-10 items-center justify-center rounded-2xl border border-border bg-white text-gray-500 shadow-sm transition hover:border-primary/25 hover:text-primary md:hidden"
            aria-label={t('openSidebar')}
          >
            <Menu className="size-5" />
          </button>

          <div>
            <h1 className="text-xl font-medium text-gray-900 md:text-2xl">
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <DashboardSearchDialog locale={locale} />
          <ThemeToggle ariaLabel={t('toggleTheme')} />
          <LocaleSwitcher currentLocale={locale} />
          <DashboardNotifications locale={locale} />

          <DashboardUserMenu locale={locale} />
        </div>
      </div>
    </div>
  )
}
