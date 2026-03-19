'use client'

import { FilterBar } from '@/components/common/FilterBar'
import { BookGrid } from '@/components/features/catalog/BookGrid'
import { useGetAuthorsQuery } from '@/store/features/catalog/authorsApi'
import { useGetBooksQuery } from '@/store/features/catalog/booksApi'
import {
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
} from '@/store/features/catalog/categoriesApi'

type CategoryDetailContentProps = {
  categoryId: string
}

export function CategoryDetailContent({
  categoryId,
}: CategoryDetailContentProps) {
  const { data: categoryData } = useGetCategoryByIdQuery(categoryId)
  const { data: categoriesData } = useGetCategoriesQuery()
  const { data: authorsData } = useGetAuthorsQuery({ page: 1, limit: 200 })
  const { data: booksData, isLoading } = useGetBooksQuery({
    category: categoryId,
    page: 1,
    limit: 20,
  })

  const category = categoryData?.data
  const categories = categoriesData?.data ?? []
  const authors = authorsData?.data ?? []
  const books = booksData?.data ?? []

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">
          {category?.name || 'Category'}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {category?.description || 'Explore books in this category.'}
        </p>
      </section>

      <FilterBar categories={categories} authors={authors} />
      <BookGrid books={books} isLoading={isLoading} />
    </div>
  )
}
