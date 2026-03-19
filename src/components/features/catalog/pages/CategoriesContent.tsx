'use client'

import { CategoryTree } from '@/components/features/catalog/CategoryTree'
import { useGetCategoriesQuery } from '@/store/features/catalog/categoriesApi'
import { useRouter } from 'next/navigation'

export function CategoriesContent() {
  const router = useRouter()
  const { data, isLoading } = useGetCategoriesQuery()
  const categories = data?.data ?? []

  if (isLoading) {
    return (
      <div className="h-52 animate-pulse rounded-xl border border-border bg-muted/40" />
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Browse categories</h1>
      <CategoryTree
        categories={categories}
        onSelect={(categoryId) =>
          router.push(`/catalogue/categories/${categoryId}`)
        }
      />
    </div>
  )
}
