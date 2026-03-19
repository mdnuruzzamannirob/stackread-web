import { CatalogueContent } from '@/components/features/catalog/pages/CatalogueContent'
import type { Metadata } from 'next'
import { Suspense } from 'react'

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Stackread Catalogue',
    description:
      'Browse books by title, author, and category with advanced filters.',
  }
}

export default function CataloguePage() {
  return (
    <Suspense
      fallback={
        <div className="h-32 animate-pulse rounded-xl border border-border bg-muted/40" />
      }
    >
      <CatalogueContent />
    </Suspense>
  )
}
