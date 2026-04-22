'use client'

import { BookOpen, Clock3 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

import { useGetPublicBooksQuery } from '@/store/features/catalog/catalogApi'
import { useGetCurrentlyReadingQuery } from '@/store/features/reading/readingApi'

const formatDateLabel = (value: string, locale: string) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown activity'
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function CurrentlyReadingPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'

  const {
    data: currentlyReadingResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetCurrentlyReadingQuery({ page: 1, limit: 30 })

  const { data: booksResponse } = useGetPublicBooksQuery({
    page: 1,
    limit: 200,
  })

  const booksById = useMemo(
    () => new Map((booksResponse?.data ?? []).map((book) => [book.id, book])),
    [booksResponse?.data],
  )

  const items = currentlyReadingResponse?.data ?? []

  return (
    <section className="space-y-6">
      <article className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Currently Reading
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Resume active sessions and keep your reading streak moving forward.
        </p>
      </article>

      <article className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Active Reads</h2>
          {isFetching && !isLoading ? (
            <span className="text-xs font-medium text-brand-600">
              Refreshing...
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading active reads...</p>
        ) : null}

        {isError ? (
          <p className="text-sm text-red-600">
            Unable to load active reads right now.
          </p>
        ) : null}

        {!isLoading && !isError && !items.length ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            You are not reading anything at the moment.
          </p>
        ) : null}

        <div className="space-y-3">
          {items.map((item) => {
            const book = booksById.get(item.bookId)
            const title = book?.title ?? `Book ${item.bookId}`

            return (
              <article
                key={item.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1">
                        <Clock3 className="size-3.5" />
                        Last read: {formatDateLabel(item.lastReadAt, locale)}
                      </span>
                      <span className="inline-flex rounded-full bg-white px-2.5 py-1">
                        Status: Currently reading
                      </span>
                    </div>
                  </div>

                  <div className="flex w-full gap-3 md:w-auto md:min-w-60 md:items-center">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                        Progress
                      </p>
                      <div className="mt-2 h-2 rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-brand-600"
                          style={{
                            width: `${Math.max(0, Math.min(100, item.progressPercentage))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/books/${item.bookId}`}
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
