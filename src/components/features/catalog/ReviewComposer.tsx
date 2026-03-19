'use client'

import { Button } from '@/components/ui/button'
import { formatApiErrorMessage } from '@/lib/utils/apiHelpers'
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} from '@/store/features/reviews/reviewsApi'
import { useState } from 'react'

type ReviewComposerProps = {
  bookId: string
  existingReview?: {
    id: string
    rating: number
    title?: string
    content?: string
  }
}

export function ReviewComposer({
  bookId,
  existingReview,
}: ReviewComposerProps) {
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation()
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation()
  const [deleteReview, { isLoading: isDeleting }] = useDeleteReviewMutation()

  const [rating, setRating] = useState(existingReview?.rating ?? 5)
  const [title, setTitle] = useState(existingReview?.title ?? '')
  const [content, setContent] = useState(existingReview?.content ?? '')
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setStatus(null)
    setError(null)

    try {
      if (existingReview) {
        await updateReview({
          bookId,
          id: existingReview.id,
          payload: { rating, title, content },
        }).unwrap()
        setStatus('Review updated successfully.')
      } else {
        await createReview({
          bookId,
          payload: { rating, title, content },
        }).unwrap()
        setStatus('Review submitted successfully.')
      }
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  const handleDelete = async () => {
    if (!existingReview) {
      return
    }

    setStatus(null)
    setError(null)

    try {
      await deleteReview({ bookId, id: existingReview.id }).unwrap()
      setStatus('Review deleted successfully.')
    } catch (submitError) {
      setError(formatApiErrorMessage(submitError))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border border-border p-4"
    >
      <h3 className="font-semibold">
        {existingReview ? 'Edit your review' : 'Write a review'}
      </h3>

      <label className="block space-y-1 text-sm">
        <span>Rating</span>
        <select
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} star{value > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1 text-sm">
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="Short headline"
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span>Review</span>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
          placeholder="Share your reading experience"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={isCreating || isUpdating}>
          {isCreating || isUpdating
            ? 'Saving...'
            : existingReview
              ? 'Update review'
              : 'Submit review'}
        </Button>
        {existingReview ? (
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? 'Deleting...' : 'Delete review'}
          </Button>
        ) : null}
      </div>

      {status ? <p className="text-sm text-primary">{status}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </form>
  )
}
