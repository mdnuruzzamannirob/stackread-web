'use client'

import { Play } from 'lucide-react'
import Link from 'next/link'

interface ReadingProgressItem {
  id: string
  bookId: string
  title: string
  author: string
  progress: number
  status: string
  coverUrl?: string | null
}

interface RecentActivityProps {
  locale: string
  items?: ReadingProgressItem[]
  isLoading?: boolean
  hasError?: boolean
}

export function RecentActivity({
  locale,
  items = [],
  isLoading = false,
  hasError = false,
}: RecentActivityProps) {
  return (
    <section id="library" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-primary/70">
            Reading Activity
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-gray-900">
            Reading Progress
          </h2>
        </div>

        <Link
          href={`/${locale}/library`}
          className="hidden text-sm font-medium text-primary transition hover:text-primary-700 md:block"
        >
          View all library
        </Link>
      </div>

      {isLoading ? (
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
          Loading reading activity...
        </p>
      ) : null}

      {hasError ? (
        <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-5 text-sm text-red-600">
          Unable to load your recent reading activity.
        </p>
      ) : null}

      {!isLoading && !hasError && !items.length ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
          No active reading progress found yet.
        </p>
      ) : null}

      <div className="space-y-4 rounded-[1.35rem] bg-transparent">
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-white px-4 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:px-5"
          >
            <div className="flex items-center gap-4 md:min-w-96">
              <div className="relative h-20 w-14 overflow-hidden rounded-sm bg-gray-100 ring-1 ring-gray-200">
                {item.coverUrl ? (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.coverUrl})` }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-linear-to-br from-[#d58a57] to-[#f2c79f]" />
                )}
                <div className="absolute inset-x-0 bottom-0 h-3 bg-white/40" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">{item.author}</p>
              </div>
            </div>

            <div className="flex flex-1 items-center gap-4">
              <div className="flex-1">
                <div className="h-1.5 rounded-full bg-gray-100">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              <div className="min-w-24 text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {item.progress}%
                </p>
                <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                  {item.status}
                </p>
              </div>

              <Link
                href={`/${locale}/books/${item.bookId}`}
                className="flex size-10 items-center justify-center rounded-2xl bg-gray-50 text-primary transition hover:bg-primary hover:text-white"
                aria-label={`Open ${item.title}`}
              >
                <Play className="size-4 fill-current" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
