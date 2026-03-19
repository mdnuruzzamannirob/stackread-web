'use client'

import { BookCard } from '@/components/features/catalog/BookCard'

type BookGridProps = {
  books: Array<{
    id: string
    title: string
    coverImageUrl?: string
    authors?: Array<{ id: string; name: string }>
    categories?: Array<{ id: string; name: string }>
    ratingAverage?: number
    isAvailable?: boolean
  }>
  isLoading?: boolean
  emptyMessage?: string
}

export function BookGrid({ books, isLoading, emptyMessage }: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-80 animate-pulse rounded-xl border border-border bg-muted/50"
          />
        ))}
      </div>
    )
  }

  if (!books.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        {emptyMessage || 'No books found for your current filters.'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
