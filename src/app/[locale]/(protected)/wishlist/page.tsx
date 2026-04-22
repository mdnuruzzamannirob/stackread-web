'use client'

import { Heart, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getApiErrorMessage } from '@/lib/api/error-message'
import { useGetPublicBooksQuery } from '@/store/features/catalog/catalogApi'
import {
  useGetMyWishlistQuery,
  useRemoveFromWishlistMutation,
} from '@/store/features/wishlist/wishlistApi'

export default function WishlistPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const [pendingBookId, setPendingBookId] = useState<string | null>(null)

  const {
    data: wishlistResponse,
    isLoading: isLoadingWishlist,
    isFetching: isRefreshingWishlist,
    isError: hasWishlistError,
  } = useGetMyWishlistQuery({ page: 1, limit: 50 })

  const { data: booksResponse } = useGetPublicBooksQuery({
    page: 1,
    limit: 200,
  })

  const [removeFromWishlist] = useRemoveFromWishlistMutation()

  const booksById = useMemo(
    () => new Map((booksResponse?.data ?? []).map((book) => [book.id, book])),
    [booksResponse?.data],
  )

  const wishlistItems = wishlistResponse?.data ?? []

  const handleRemove = async (bookId: string) => {
    setPendingBookId(bookId)

    try {
      await removeFromWishlist({ bookId }).unwrap()
      toast.success('Removed from wishlist')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to remove this book.'))
    } finally {
      setPendingBookId(null)
    }
  }

  return (
    <section className="space-y-6">
      <article className="rounded-xl border border-gray-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Wishlist
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Track books you want to read next and jump to details whenever you are
          ready to start.
        </p>
      </article>

      <article className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900">Saved Books</h2>
          {isRefreshingWishlist && !isLoadingWishlist ? (
            <span className="text-xs font-medium text-brand-600">
              Refreshing...
            </span>
          ) : null}
        </div>

        {isLoadingWishlist ? (
          <p className="text-sm text-gray-500">Loading your wishlist...</p>
        ) : null}

        {hasWishlistError ? (
          <p className="text-sm text-red-600">
            Unable to load wishlist right now.
          </p>
        ) : null}

        {!isLoadingWishlist && !hasWishlistError && !wishlistItems.length ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            Wishlist is empty. Use search to save books for later.
          </p>
        ) : null}

        <div className="space-y-3">
          {wishlistItems.map((item) => {
            const book = booksById.get(item.bookId)
            const coverUrl = book?.coverImage?.url
            const label = book?.title ?? `Book ${item.bookId}`
            const ratingLabel =
              typeof book?.ratingAverage === 'number'
                ? `${book.ratingAverage.toFixed(1)} ★`
                : 'No ratings yet'

            return (
              <article
                key={item.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-14 overflow-hidden rounded-md border border-gray-200 bg-white">
                      {coverUrl ? (
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url(${coverUrl})` }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                          <Heart className="size-4" />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {label}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {ratingLabel}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/${locale}/books/${item.bookId}`}
                      className="inline-flex h-10 items-center rounded-lg border border-brand-200 bg-brand-100 px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-200"
                    >
                      Open details
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleRemove(item.bookId)}
                      disabled={pendingBookId === item.bookId}
                      className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="size-4" />
                      {pendingBookId === item.bookId ? 'Removing...' : 'Remove'}
                    </button>
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
