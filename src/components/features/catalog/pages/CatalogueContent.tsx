'use client'

import { FilterBar } from '@/components/common/FilterBar'
import { Pagination } from '@/components/common/Pagination'
import { BookGrid } from '@/components/features/catalog/BookGrid'
import { CategoryTree } from '@/components/features/catalog/CategoryTree'
import { useGetAuthorsQuery } from '@/store/features/catalog/authorsApi'
import { useGetBooksQuery } from '@/store/features/catalog/booksApi'
import { useGetCategoriesQuery } from '@/store/features/catalog/categoriesApi'
import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export function CatalogueContent() {
  const searchParams = useSearchParams()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      author: searchParams.get('author') || undefined,
      sort: searchParams.get('sort') || undefined,
      order: (searchParams.get('order') as 'asc' | 'desc' | null) || undefined,
      page,
      limit,
    }),
    [limit, page, searchParams],
  )

  const { data: booksData, isLoading } = useGetBooksQuery(filters)
  const { data: categoriesData } = useGetCategoriesQuery()
  const { data: authorsData } = useGetAuthorsQuery({ page: 1, limit: 200 })

  const books = booksData?.data ?? []
  const categories = categoriesData?.data ?? []
  const authors = authorsData?.data ?? []

  return (
    <div className="space-y-6">
      <FilterBar categories={categories} authors={authors} />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-3">
          <h2 className="text-lg font-semibold">Categories</h2>
          <CategoryTree categories={categories} />
        </aside>

        <section className="space-y-4">
          <BookGrid books={books} isLoading={isLoading} />
          <Pagination
            page={page}
            limit={limit}
            total={Math.max(books.length, page * limit + 1)}
            onPageChange={setPage}
            onLimitChange={setLimit}
          />
        </section>
      </div>
    </div>
  )
}
