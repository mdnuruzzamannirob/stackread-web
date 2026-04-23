'use client'

import { LocaleSwitcher } from '@/components/common/localeSwitcher'
import { DashboardUserMenu } from '@/components/common/userMenuPopover'
import useSidebar from '@/hooks/useSidebar'
import { resolveDashboardTitleKey } from '@/lib/dashboard/page-map'
import { useGetUnreadNotificationsCountQuery } from '@/store/features/notifications/notificationsApi'
import { Bell, Menu, Search, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

interface DashboardHeaderProps {
  locale: string
}

export function DashboardHeader({ locale }: DashboardHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const translate = useTranslations()
  const t = useTranslations('dashboard.header')
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const { toggleSidebar } = useSidebar()
  const { data: unreadResponse } = useGetUnreadNotificationsCountQuery()
  const [searchTerm, setSearchTerm] = useState('')

  const title = translate(resolveDashboardTitleKey(pathname, locale))
  const unreadCount = unreadResponse?.data?.unreadCount ?? 0

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleShortcut)

    return () => {
      window.removeEventListener('keydown', handleShortcut)
    }
  }, [])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchTerm.trim()

    if (!query) {
      router.push(`/${locale}/search`)
      return
    }

    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
  }

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
          <form
            className="hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 focus-within:border-gray-300 hover:border-gray-300 lg:flex"
            onSubmit={handleSearchSubmit}
          >
            <Search className="size-5 text-gray-500" />

            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-64 border-none bg-transparent outline-none"
            />
            <span className="ml-auto rounded bg-black/5 px-1 py-0.5 text-xs text-muted-foreground">
              {t('searchShortcut')}
            </span>
          </form>

          <button
            className="flex size-10 items-center justify-center rounded-lg border bg-white border-gray-200 hover:border-gray-300 duration-150 text-gray-500 hover:text-inherit"
            aria-label={t('toggleTheme')}
          >
            <Sun className="size-5" />
          </button>

          <LocaleSwitcher currentLocale={locale} />

          <Link
            href={`/${locale}/notifications`}
            className="relative flex size-10 items-center justify-center rounded-lg border bg-white border-gray-200 text-gray-500 transition hover:border-gray-300 hover:text-inherit"
            aria-label={t('openNotifications')}
          >
            <Bell className="size-5" />

            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold leading-5 text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </Link>

          <DashboardUserMenu locale={locale} />
        </div>
      </div>
    </div>
  )
}
