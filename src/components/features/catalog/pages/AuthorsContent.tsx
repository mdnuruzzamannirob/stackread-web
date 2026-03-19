'use client'

import { Pagination } from '@/components/common/Pagination'
import { AuthorCard } from '@/components/features/catalog/AuthorCard'
import { useGetAuthorsQuery } from '@/store/features/catalog/authorsApi'
import { useState } from 'react'

export function AuthorsContent() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)

  const { data, isLoading } = useGetAuthorsQuery({ search, page, limit })
  const authors = data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <label className="space-y-1 text-sm">
          <span>Search authors</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
            placeholder="Author name"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((author) => (
            <AuthorCard key={author.id} author={author} />
          ))}
        </div>
      )}

      <Pagination
        page={page}
        limit={limit}
        total={Math.max(authors.length, page * limit + 1)}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  )
}
