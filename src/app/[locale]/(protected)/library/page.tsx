'use client'

import { BookOpen, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { useGetAuthorsQuery } from '@/store/features/catalog/catalogApi'
import { useGetMyLibraryQuery } from '@/store/features/dashboard/dashboardApi'

const formatLastAccessed = (value: string | null, locale: string) => {
  if (!value) {
    return 'No recent activity'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'No recent activity'
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const formatReadingStatus = (status: string) => {
  const normalized = status.replace(/[-_]/g, ' ').trim()

  if (!normalized) {
    return 'Unknown'
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export default function LibraryPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'

  const {
    data: libraryResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetMyLibraryQuery({
    page: 1,
    limit: 24,
  })

  const { data: authorsResponse } = useGetAuthorsQuery({ page: 1, limit: 200 })

  const authorNameById = useMemo(
    () =>
      new Map(
        (authorsResponse?.data ?? []).map((author) => [author.id, author.name]),
      ),
    [authorsResponse?.data],
  )

  const books = libraryResponse?.data ?? []

  return (
    <section className="space-y-6">
      <article className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          My Library
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Continue ongoing reads, revisit recently opened books, and jump to
          titles you have already completed.
        </p>
      </article>

      <article className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Library Books</h2>
          {isFetching && !isLoading ? (
            <span className="text-xs font-medium text-brand-600">
              Refreshing...
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading your library...</p>
        ) : null}

        {isError ? (
          <p className="text-sm text-red-600">
            Unable to load your library right now.
          </p>
        ) : null}

        {!isLoading && !isError && books.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Your library is empty for now. Explore search and start reading a
            title.
          </p>
        ) : null}

        <div className="space-y-3">
          {books.map((book) => {
            const authorLine = book.authorIds
              .map((authorId) => authorNameById.get(authorId))
              .filter(Boolean)
              .join(', ')

            return (
              <article
                key={book.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {authorLine || 'Author details unavailable'}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1">
                        <Clock3 className="size-3.5" />
                        Last opened:{' '}
                        {formatLastAccessed(book.lastAccessed, locale)}
                      </span>
                      <span className="inline-flex rounded-full bg-white px-2.5 py-1">
                        Status: {formatReadingStatus(book.readingStatus)}
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full gap-3 md:w-auto md:min-w-56 md:items-center">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Progress
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-brand-600"
                          style={{
                            width: `${Math.max(0, Math.min(100, book.progress))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/books/${book.id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-200 bg-brand-100 px-3 text-sm font-semibold text-brand-700 transition hover:bg-brand-200"
                    >
                      <BookOpen className="size-4" />
                      Open
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </article>
    </section>
  )
}
