'use client'

import { BookDetailHeader } from '@/components/features/catalog/BookDetailHeader'
import { BookGrid } from '@/components/features/catalog/BookGrid'
import { ReviewList } from '@/components/features/catalog/ReviewList'
import {
  useGetBookByIdQuery,
  useGetBooksQuery,
} from '@/store/features/catalog/booksApi'

type BookDetailContentProps = {
  bookId: string
}

export function BookDetailContent({ bookId }: BookDetailContentProps) {
  const { data, isLoading } = useGetBookByIdQuery(bookId)
  const { data: relatedData } = useGetBooksQuery({ limit: 4, page: 1 })

  const book = data?.data
  const relatedBooks = (relatedData?.data ?? [])
    .filter((item) => item.id !== bookId)
    .slice(0, 4)

  if (isLoading) {
    return (
      <div className="h-72 animate-pulse rounded-xl border border-border bg-muted/40" />
    )
  }

  if (!book) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Book not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <BookDetailHeader book={book} />
      <ReviewList bookId={bookId} />

      <section className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold">Related books</h2>
        <BookGrid
          books={relatedBooks}
          emptyMessage="No related books found yet."
        />
      </section>
    </div>
  )
}
