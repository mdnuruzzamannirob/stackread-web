'use client'

import {
  ArrowRight,
  BellRing,
  BookOpen,
  Clock3,
  Dot,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useBulkMarkNotificationsAsReadMutation,
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from '@/store/features/notifications/notificationsApi'
import {
  buildNotificationFilters,
  type NotificationFilter,
  type NotificationItem,
  toNotificationItem,
} from './data'

function NotificationGlyph({ icon }: { icon: NotificationItem['icon'] }) {
  const iconClassName = 'size-5'

  switch (icon) {
    case 'book':
      return <BookOpen className={iconClassName} />
    case 'shield':
      return <ShieldAlert className={iconClassName} />
    case 'clock':
      return <Clock3 className={iconClassName} />
    default:
      return <Sparkles className={iconClassName} />
  }
}

export default function NotificationsPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('All')
  const { data: notificationsResponse, isLoading } = useGetMyNotificationsQuery(
    {
      page: 1,
      limit: 50,
    },
  )
  const [markNotificationAsReadMutation] = useMarkNotificationAsReadMutation()
  const [bulkMarkNotificationsAsReadMutation, { isLoading: isMarkingAll }] =
    useBulkMarkNotificationsAsReadMutation()

  const rawNotifications = notificationsResponse?.data ?? []

  const notifications = useMemo(
    () =>
      rawNotifications.map((notification) => toNotificationItem(notification)),
    [rawNotifications],
  )

  const notificationFilters = useMemo(
    () => buildNotificationFilters(notifications),
    [notifications],
  )

  const unreadCount = notifications.filter((item) => !item.read).length

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'All') {
      return notifications
    }

    return notifications.filter((item) => item.filter === activeFilter)
  }, [activeFilter, notifications])

  const notificationsByGroup = useMemo(() => {
    const grouped = new Map<'Today' | 'Earlier', NotificationItem[]>()

    for (const notification of filteredNotifications) {
      const currentGroup = grouped.get(notification.group) ?? []
      grouped.set(notification.group, [...currentGroup, notification])
    }

    return grouped
  }, [filteredNotifications])

  const markAllAsRead = async () => {
    const unreadIds = rawNotifications
      .filter((notification) => !notification.read)
      .map((notification) => notification.id)

    if (unreadIds.length === 0) {
      toast.message('No unread notifications found.')
      return
    }

    try {
      await bulkMarkNotificationsAsReadMutation({
        notificationIds: unreadIds,
      }).unwrap()

      toast.success('All notifications marked as read')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to mark all as read.'))
    }
  }

  const markNotificationAsRead = async (id: string) => {
    try {
      await markNotificationAsReadMutation(id).unwrap()
    } catch {
      // Intentionally silent to avoid noisy toasts for quick inbox interactions.
    }
  }

  const loadOlderNotifications = () => {
    toast.success('Pagination support will be enabled in the next iteration.')
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading notifications...</p>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <article className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6">
          <div className="pointer-events-none absolute right-16 top-8 text-gray-200">
            <BellRing className="size-20" />
          </div>

          <div className="relative max-w-2xl space-y-4">
            <h1 className="text-2xl font-semibold text-brand-600 sm:text-3xl">
              Inbox Overview
            </h1>
            <p className="max-w-sm text-sm text-gray-600">
              You have {unreadCount} unread updates across your curated library
              and system alerts from the backend.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={isMarkingAll || unreadCount === 0}
                className="h-10 rounded-md bg-brand-600 px-4 text-xs font-semibold text-white hover:bg-brand-700"
              >
                {isMarkingAll ? 'Updating...' : 'Mark all as read'}
              </button>
              <button
                type="button"
                onClick={() =>
                  toast.message(
                    'Notification preferences are in Settings > Preferences.',
                  )
                }
                className="h-10 rounded-md hover:bg-brand-200 px-4 text-xs font-semibold text-gray-600 hover:text-brand-600"
              >
                Preferences
              </button>
            </div>
          </div>
        </article>

        <aside className="rounded-xl border border-brand-200 bg-brand-100 p-5">
          <p className="text-[10px] font-semibold uppercase text-brand-600">
            Quick Filter
          </p>
          <div className="mt-5 space-y-2">
            {notificationFilters.map((filter) => {
              const isActive = activeFilter === filter.label
              return (
                <button
                  key={filter.label}
                  type="button"
                  onClick={() => setActiveFilter(filter.label)}
                  className={`flex w-full items-center justify-between rounded-md px-4 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? 'text-brand-600 bg-white'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  <span>{filter.label}</span>
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] leading-5 ${
                      isActive ? 'bg-brand-600  text-white' : 'text-gray-500'
                    }`}
                  >
                    {filter.count}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>
      </div>

      <div className="space-y-9">
        {(['Today', 'Earlier'] as const).map((group) => {
          const items = notificationsByGroup.get(group) ?? []

          if (!items.length) {
            return null
          }

          return (
            <section key={group} className="space-y-4">
              <div className="border-t border-gray-200 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                  {group}
                </p>
              </div>

              <div className="space-y-3">
                {items.map((notification) => {
                  const detailsHref = `/${locale}/notifications/${notification.id}`

                  return (
                    <article
                      key={notification.id}
                      className={`rounded-xl border border-gray-200 bg-white px-4 py-4 ${
                        notification.read ? 'opacity-70' : ''
                      }`}
                    >
                      <div className="grid gap-4 md:grid-cols-[54px_minmax(0,1fr)_18px] md:items-start">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-md ${
                            notification.icon === 'book'
                              ? 'bg-[#0f7f86] text-white'
                              : notification.icon === 'shield'
                                ? 'bg-[#dbeafe] text-sky-700'
                                : notification.icon === 'clock'
                                  ? 'bg-gray-200 text-gray-500'
                                  : 'bg-amber-200 text-amber-700'
                          }`}
                        >
                          <NotificationGlyph icon={notification.icon} />
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span
                              className={`rounded-full px-2 py-0.5 font-semibold ${
                                notification.badge === 'New Release'
                                  ? 'bg-amber-100 text-amber-700'
                                  : notification.badge === 'System'
                                    ? 'bg-blue-100 text-blue-700'
                                    : notification.badge === 'Reminder'
                                      ? 'bg-gray-200 text-gray-500'
                                      : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {notification.badge}
                            </span>
                            <span className="text-gray-400">
                              {notification.timestamp}
                            </span>
                          </div>

                          <Link href={detailsHref} className="block">
                            <h2 className="text-[17px] font-semibold leading-snug text-gray-900 hover:text-[#0e7178]">
                              {notification.title}
                            </h2>
                          </Link>

                          <p className="text-sm text-gray-500">
                            {notification.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                            <Link
                              href={detailsHref}
                              onClick={() =>
                                void markNotificationAsRead(notification.id)
                              }
                              className="inline-flex items-center gap-1 text-[#0e7178] hover:text-[#0a666b]"
                            >
                              {notification.primaryAction}
                              <ArrowRight className="size-3.5" />
                            </Link>
                            <button
                              type="button"
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() =>
                                toast.message(notification.secondaryAction)
                              }
                            >
                              {notification.secondaryAction}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-start justify-end pt-1">
                          {!notification.read ? (
                            <Dot className="size-5 text-[#0e7178]" />
                          ) : (
                            <Dot className="size-5 text-gray-300" />
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}

        {!notifications.length ? (
          <section className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">
              Your inbox is empty right now.
            </p>
          </section>
        ) : null}
      </div>

      <div className="flex justify-center pt-1">
        <Button
          type="button"
          variant="outline"
          className="h-10 rounded-xl border-gray-200 bg-gray-100 px-6 text-xs font-semibold uppercase tracking-[0.12em] text-[#0e7178] hover:bg-gray-200"
          onClick={loadOlderNotifications}
        >
          Load older notifications
        </Button>
      </div>
    </section>
  )
}
