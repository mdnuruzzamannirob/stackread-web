'use client'

import { Bell } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useGetUnreadNotificationsCountQuery } from '@/store/features/notifications/notificationsApi'

export function DashboardNotifications({ locale }: { locale: string }) {
  const t = useTranslations('dashboard.header')
  const { data: unreadResponse } = useGetUnreadNotificationsCountQuery()
  const unreadCount = unreadResponse?.data?.unreadCount ?? 0

  return (
    <Link
      href={`/${locale}/notifications`}
      className="relative flex size-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition duration-150 hover:border-gray-300 hover:text-inherit"
      aria-label={t('openNotifications')}
    >
      <Bell className="size-5" />

      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold leading-5 text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
