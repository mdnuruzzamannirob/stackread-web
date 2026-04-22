'use client'

import { skipToken } from '@reduxjs/toolkit/query'
import { Bookmark, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import {
  useGetBookmarksQuery,
  useGetCurrentlyReadingQuery,
} from '@/store/features/reading/readingApi'

export default function ReadingBookmarksPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()

  const bookIdFromQuery = (searchParams.get('bookId') ?? '').trim()
  const [bookIdInput, setBookIdInput] = useState(bookIdFromQuery)

  const {
    data: currentResponse,
    isLoading: isLoadingCurrent,
    isError: hasCurrentError,
  } = useGetCurrentlyReadingQuery({ page: 1, limit: 15 })

  const {
    data: bookmarksResponse,
    isLoading,
    isError,
  } = useGetBookmarksQuery(
    bookIdFromQuery
      ? {
          bookId: bookIdFromQuery,
        }
      : skipToken,
  )

  const currentBookIds = Array.from(
    new Set((currentResponse?.data ?? []).map((item) => item.bookId)),
  )

  const bookmarks = bookmarksResponse?.data ?? []

  const handleLoadBookmarks = () => {
    const nextBookId = bookIdInput.trim()

    if (!nextBookId) {
      router.push(`/${locale}/reading/bookmarks`)
      return
    }

    router.push(
      `/${locale}/reading/bookmarks?bookId=${encodeURIComponent(nextBookId)}`,
    )
  }

  return (
    <section className="space-y-6">
      <article className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Bookmarks
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Inspect bookmarks for a specific book. Select from your active reads
          or paste a book id directly.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label
            htmlFor="bookmark-book-id"
            className="flex h-11 flex-1 items-center rounded-lg border border-gray-200 bg-white px-3"
          >
            <input
              id="bookmark-book-id"
              type="text"
              value={bookIdInput}
              onChange={(event) => setBookIdInput(event.target.value)}
              placeholder="Book id"
              className="w-full border-none bg-transparent text-sm outline-none"
            />
          </label>
          <button
            type="button"
            onClick={handleLoadBookmarks}
            className="h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Load bookmarks
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {currentBookIds.map((bookId) => (
            <button
              key={bookId}
              type="button"
              onClick={() => {
                setBookIdInput(bookId)
                router.push(
                  `/${locale}/reading/bookmarks?bookId=${encodeURIComponent(bookId)}`,
                )
              }}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              {bookId}
            </button>
          ))}
          {!isLoadingCurrent && !hasCurrentError && !currentBookIds.length ? (
            <p className="text-xs text-gray-500">
              No active reading entries found yet.
            </p>
          ) : null}
        </div>
      </article>

      <article className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Bookmark Entries
          </h2>
          {bookIdFromQuery ? (
            <Link
              href={`/${locale}/books/${bookIdFromQuery}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
            >
              <BookOpen className="size-4" />
              Open book
            </Link>
          ) : null}
        </div>

        {!bookIdFromQuery ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Select a book id first to load bookmarks.
          </p>
        ) : null}

        {bookIdFromQuery && isLoading ? (
          <p className="text-sm text-gray-500">Loading bookmarks...</p>
        ) : null}

        {bookIdFromQuery && isError ? (
          <p className="text-sm text-red-600">
            Unable to load bookmarks for this book.
          </p>
        ) : null}

        {bookIdFromQuery && !isLoading && !isError && !bookmarks.length ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            No bookmarks found for this book yet.
          </p>
        ) : null}

        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <article
              key={bookmark.id}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-2 text-brand-700">
                <Bookmark className="size-4" />
                <p className="text-sm font-semibold">{bookmark.location}</p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Page: {bookmark.page ?? 'n/a'}
              </p>
              {bookmark.note ? (
                <p className="mt-2 text-sm text-gray-600">{bookmark.note}</p>
              ) : null}
            </article>
          ))}
        </div>
      </article>
    </section>
  )
}
