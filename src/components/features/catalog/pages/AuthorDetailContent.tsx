'use client'

import { BookGrid } from '@/components/features/catalog/BookGrid'
import { useGetAuthorByIdQuery } from '@/store/features/catalog/authorsApi'
import { useGetBooksQuery } from '@/store/features/catalog/booksApi'
import Image from 'next/image'

type AuthorDetailContentProps = {
  authorId: string
}

export function AuthorDetailContent({ authorId }: AuthorDetailContentProps) {
  const { data, isLoading } = useGetAuthorByIdQuery(authorId)
  const { data: booksData } = useGetBooksQuery({
    author: authorId,
    page: 1,
    limit: 12,
  })

  const author = data?.data
  const books = booksData?.data ?? []

  if (isLoading) {
    return (
      <div className="h-56 animate-pulse rounded-xl border border-border bg-muted/40" />
    )
  }

  if (!author) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        Author not found.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center">
        <Image
          src={
            author.imageUrl ||
            'https://res.cloudinary.com/demo/image/upload/v1697000000/avatar-placeholder.png'
          }
          alt={author.name}
          width={88}
          height={88}
          className="h-20 w-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-semibold">{author.name}</h1>
          <p className="text-sm text-muted-foreground">
            {author.bio || 'No biography available yet.'}
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Books by this author</h2>
        <BookGrid
          books={books}
          emptyMessage="No books linked to this author yet."
        />
      </section>
    </div>
  )
}
