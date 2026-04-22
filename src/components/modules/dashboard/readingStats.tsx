'use client'

import { BookOpen, Heart, MessageSquareText, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

interface ReadingStatsProps {
  locale: string
  booksRead?: number
  readingNow?: number
  wishlistCount?: number
  reviewsCount?: number
  planName?: string
  daysLeft?: number
  renewalDate?: string
  autoRenew?: boolean
  isLoading?: boolean
  hasError?: boolean
}

export function ReadingStats({
  locale,
  booksRead = 0,
  readingNow = 0,
  wishlistCount = 0,
  reviewsCount = 0,
  planName = 'Free plan',
  daysLeft = 0,
  renewalDate = 'Unavailable',
  autoRenew = true,
  isLoading = false,
  hasError = false,
}: ReadingStatsProps) {
  const stats = [
    {
      label: 'Books Read',
      value: booksRead,
      icon: BookOpen,
    },
    {
      label: 'Reading',
      value: readingNow,
      icon: Sparkles,
    },
    {
      label: 'Wishlist',
      value: wishlistCount,
      icon: Heart,
    },
    {
      label: 'Reviews',
      value: reviewsCount,
      icon: MessageSquareText,
    },
  ]

  const progressValue = useMemo(() => {
    const total = 30
    return Math.min(100, Math.round((daysLeft / total) * 100))
  }, [daysLeft])

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <p className="text-sm text-gray-500">Loading dashboard stats...</p>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <p className="text-sm text-red-600">
          Unable to load dashboard stats right now.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_1.25fr]">
      {stats.map((stat) => {
        const Icon = stat.icon

        return (
          <div
            key={stat.label}
            className="min-h-52 rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition duration-200 hover:border-primary/20"
          >
            <Icon className="size-5 text-gray-600" />
            <p className="mt-10 text-3xl font-semibold tracking-tight text-gray-900">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-gray-500">
              {stat.label}
            </p>
          </div>
        )
      })}

      <aside className="rounded-2xl border border-[#cfe0f8] bg-[#eaf2ff] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-gray-900">{planName}</p>
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary">
              Active
            </span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold tracking-tight text-gray-900">
              {daysLeft}
            </p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-gray-500">
              Days Left
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Renewal Date</span>
            <span className="font-medium text-gray-900">{renewalDate}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Auto-renew</span>
            <span
              className={`inline-flex h-5 w-11 items-center rounded-full px-1 ${
                autoRenew ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span
                className={`size-3.5 rounded-full bg-white shadow-sm transition ${
                  autoRenew ? 'ml-auto' : 'mr-auto'
                }`}
              />
            </span>
          </div>

          <div className="h-2 rounded-full bg-white/70">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          <Link
            href={`/${locale}/subscription`}
            className="inline-flex w-full justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(2,132,199,0.22)] transition hover:bg-primary-700"
          >
            Upgrade to Premium
          </Link>
        </div>
      </aside>
    </div>
  )
}
