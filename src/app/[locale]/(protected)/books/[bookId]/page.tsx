'use client'

import { skipToken } from '@reduxjs/toolkit/query'
import { BookOpen, Heart, Play } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMemo } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import {
  useGetAuthorsQuery,
  useGetCategoriesQuery,
  useGetPublicBookByIdQuery,
  useGetPublicBookPreviewQuery,
} from '@/store/features/catalog/catalogApi'
import { useStartReadingMutation } from '@/store/features/reading/readingApi'
import { useGetBookReviewsQuery } from '@/store/features/reviews/reviewsApi'
import {
  useAddToWishlistMutation,
  useGetMyWishlistQuery,
  useRemoveFromWishlistMutation,
} from '@/store/features/wishlist/wishlistApi'

const formatDateLabel = (value: string | undefined, locale: string) => {
  if (!value) {
    return 'Unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const uniqueFormats = (formats: string[]) => Array.from(new Set(formats))

const resolveFormatSupport = (format: string) => {
  const normalized = format.toLowerCase()

  if (normalized === 'pdf' || normalized === 'epub') {
    return 'Interactive reader ready'
  }

  return 'Download fallback'
}

export default function BookDetailsPage() {
  const params = useParams<{ locale: string; bookId: string }>()
  const locale = params?.locale ?? 'en'
  const bookId = params?.bookId ?? ''
  const router = useRouter()

  const {
    data: bookResponse,
    isLoading,
    isError,
  } = useGetPublicBookByIdQuery(bookId, {
    skip: !bookId,
  })

  const { data: previewResponse } = useGetPublicBookPreviewQuery(bookId, {
    skip: !bookId,
  })

  const { data: reviewsResponse } = useGetBookReviewsQuery(
    bookId
      ? {
          bookId,
          params: {
            page: 1,
            limit: 8,
          },
        }
      : skipToken,
  )

  const { data: wishlistResponse } = useGetMyWishlistQuery({
    page: 1,
    limit: 120,
  })
  const { data: authorsResponse } = useGetAuthorsQuery({ page: 1, limit: 200 })
  const { data: categoriesResponse } = useGetCategoriesQuery({
    page: 1,
    limit: 200,
  })

  const [addToWishlist, { isLoading: isAddingToWishlist }] =
    useAddToWishlistMutation()
  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation()
  const [startReading, { isLoading: isStarting }] = useStartReadingMutation()

  const book = bookResponse?.data
  const preview = previewResponse?.data
  const reviews = reviewsResponse?.data ?? []

  const authorNameById = useMemo(
    () =>
      new Map(
        (authorsResponse?.data ?? []).map((author) => [author.id, author.name]),
      ),
    [authorsResponse?.data],
  )

  const categoryNameById = useMemo(
    () =>
      new Map(
        (categoriesResponse?.data ?? []).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [categoriesResponse?.data],
  )

  const authorNames = (book?.authorIds ?? [])
    .map((authorId) => authorNameById.get(authorId))
    .filter(Boolean)
    .join(', ')

  const categoryNames = (book?.categoryIds ?? [])
    .map((categoryId) => categoryNameById.get(categoryId))
    .filter(Boolean)
    .join(', ')

  const isWishlisted =
    (wishlistResponse?.data ?? []).findIndex(
      (item) => item.bookId === bookId,
    ) >= 0

  const availableFormats = uniqueFormats(
    (book?.files ?? []).map((file) => file.format),
  )

  const handleWishlistToggle = async () => {
    if (!bookId) {
      return
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist({ bookId }).unwrap()
        toast.success('Removed from wishlist')
        return
      }

      await addToWishlist({ bookId }).unwrap()
      toast.success('Added to wishlist')
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Unable to update wishlist status.'),
      )
    }
  }

  const handleStartReading = async () => {
    if (!bookId) {
      return
    }

    try {
      const firstFile = book?.files?.[0]

      await startReading({
        bookId,
        body: firstFile
          ? {
              currentFileId: firstFile.id,
            }
          : {},
      }).unwrap()

      toast.success('Reading session started')
      router.push(`/${locale}/reading/currently-reading`)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to start reading now.'))
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading book details...</p>
      </section>
    )
  }

  if (isError || !book) {
    return (
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-red-600">
          Unable to load this book right now.
        </p>
        <Link
          href={`/${locale}/search`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          <BookOpen className="size-4" />
          Back to search
        </Link>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <article className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div className="relative h-64 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
            {book.coverImage?.url ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${book.coverImage.url})` }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <BookOpen className="size-10" />
              </div>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
                {book.accessLevel}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {book.language.toUpperCase()}
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                {book.ratingAverage.toFixed(1)} ★ ({book.ratingCount})
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-semibold text-gray-900 sm:text-3xl">
              {book.title}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {authorNames || 'Author details unavailable'}
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-600">
              {book.description ?? book.summary}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                Published: {formatDateLabel(book.publicationDate, locale)}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                Pages: {book.pageCount ?? 'n/a'}
              </span>
              <span className="rounded-full bg-gray-100 px-2.5 py-1">
                Categories: {categoryNames || 'n/a'}
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleStartReading()}
                disabled={isStarting}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Play className="size-4 fill-current" />
                {isStarting ? 'Starting...' : 'Start reading'}
              </button>

              <button
                type="button"
                onClick={() => void handleWishlistToggle()}
                disabled={isAddingToWishlist || isRemovingFromWishlist}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-200 bg-brand-100 px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Heart
                  className={`size-4 ${isWishlisted ? 'fill-current' : ''}`}
                />
                {isWishlisted ? 'Saved in wishlist' : 'Save to wishlist'}
              </button>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
          <p className="mt-1 text-sm text-gray-500">
            Reader feedback for this title.
          </p>

          <div className="mt-4 space-y-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {review.title ?? 'Reader review'}
                  </p>
                  <span className="text-xs font-semibold text-amber-600">
                    {review.rating.toFixed(1)} ★
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {review.comment}
                </p>
              </article>
            ))}

            {!reviews.length ? (
              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
                No reviews submitted for this title yet.
              </p>
            ) : null}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
              Preview
            </h3>
            <p className="mt-3 text-sm text-gray-600">
              {preview?.summary ??
                'Preview metadata is not available right now for this book.'}
            </p>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
              Available Formats
            </h3>
            <div className="mt-3 space-y-2">
              {availableFormats.map((format) => (
                <div
                  key={format}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-gray-900">
                    {format.toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {resolveFormatSupport(format)}
                  </p>
                </div>
              ))}
              {!availableFormats.length ? (
                <p className="text-sm text-gray-500">
                  No readable files are available for this title.
                </p>
              ) : null}
            </div>
          </article>
        </aside>
      </div>
    </section>
  )
}
