'use client'

import { ArrowLeft, Bell, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from '@/store/features/notifications/notificationsApi'

import { toNotificationItem } from '../data'

export default function NotificationDetailsPage() {
  const params = useParams<{ locale: string; id: string }>()
  const locale = params?.locale ?? 'en'
  const id = params?.id ?? ''

  const { data: notificationsResponse, isLoading } = useGetMyNotificationsQuery(
    {
      page: 1,
      limit: 100,
    },
  )
  const [markNotificationAsReadMutation] = useMarkNotificationAsReadMutation()

  const notification = useMemo(() => {
    const match = notificationsResponse?.data?.find((item) => item.id === id)

    if (!match) {
      return null
    }

    return toNotificationItem(match)
  }, [notificationsResponse, id])

  useEffect(() => {
    if (notification && !notification.read) {
      void markNotificationAsReadMutation(notification.id)
    }
  }, [notification, markNotificationAsReadMutation])

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading notification...</p>
      </section>
    )
  }

  if (!notification) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Notification not found.</p>
        <Link
          href={`/${locale}/notifications`}
          className="mt-3 inline-flex items-center text-sm font-semibold text-[#0e7178]"
        >
          <ArrowLeft className="mr-1 size-4" />
          Back to notifications
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <Link
        href={`/${locale}/notifications`}
        className="inline-flex items-center text-sm font-semibold text-[#0e7178] hover:text-[#0a666b]"
      >
        <ArrowLeft className="mr-1 size-4" />
        Back to notifications
      </Link>

      <article className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6">
        <div className="pointer-events-none absolute -right-3 top-5 text-gray-200">
          <Bell className="size-14" />
        </div>

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                notification.badge === 'New Release'
                  ? 'bg-amber-100 text-amber-700'
                  : notification.badge === 'System'
                    ? 'bg-blue-100 text-blue-700'
                    : notification.badge === 'Reminder'
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-amber-100 text-amber-700'
              }`}
            >
              {notification.badge}
            </span>
            <span className="inline-flex items-center text-xs text-gray-500">
              <Clock3 className="mr-1 size-3.5" />
              {notification.timestamp}
            </span>
          </div>

          <h1 className="max-w-4xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            {notification.detailTitle}
          </h1>

          <p className="max-w-3xl text-sm leading-7 text-gray-600 sm:text-base">
            {notification.detailBody}
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button className="h-9 rounded-md bg-[#0c7378] px-4 text-xs font-semibold text-white hover:bg-[#0a666b]">
              {notification.primaryAction}
            </Button>
            <Button
              variant="outline"
              className="h-9 rounded-md border-gray-200 bg-gray-50 px-4 text-xs font-semibold text-gray-600 hover:bg-gray-100"
            >
              {notification.secondaryAction}
            </Button>
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-gray-500">
          Notification Metadata
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Type
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {notification.filter}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Group
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-800">
              {notification.group}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">
              Summary
            </p>
            <p className="mt-1 text-sm text-gray-700">
              {notification.description}
            </p>
          </div>
        </div>
      </article>
    </section>
  )
}
