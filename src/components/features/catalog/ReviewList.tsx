'use client'

import { Pagination } from '@/components/common/Pagination'
import { ReviewComposer } from '@/components/features/catalog/ReviewComposer'
import { useGetBookReviewsQuery } from '@/store/features/reviews/reviewsApi'
import { useAppSelector } from '@/store/hooks'
import { useState } from 'react'

type ReviewListProps = {
  bookId: string
}

export function ReviewList({ bookId }: ReviewListProps) {
  const actorType = useAppSelector((state) => state.auth.actorType)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)

  const { data, isLoading } = useGetBookReviewsQuery({ bookId, page, limit })
  const reviews = data?.data ?? []

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reviews</h2>
        <p className="text-sm text-muted-foreground">{reviews.length} shown</p>
      </div>

      {actorType === 'user' ? <ReviewComposer bookId={bookId} /> : null}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-md border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !reviews.length ? (
        <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          No reviews yet.
        </div>
      ) : null}

      <div className="space-y-3">
        {reviews.map((review) => (
          <article
            key={review.id}
            className="rounded-md border border-border p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{review.user?.name || 'Reader'}</p>
              <p className="text-amber-500">
                {'★'.repeat(Math.round(review.rating))}
              </p>
            </div>
            {review.title ? (
              <p className="mt-1 text-sm font-medium">{review.title}</p>
            ) : null}
            {review.content ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {review.content}
              </p>
            ) : null}
          </article>
        ))}
      </div>

      <Pagination
        page={page}
        limit={limit}
        total={Math.max(reviews.length, page * limit + 1)}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </section>
  )
}
