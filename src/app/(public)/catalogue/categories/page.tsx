import { CategoriesContent } from '@/components/features/catalog/pages/CategoriesContent'
import type { Metadata } from 'next'

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Stackread Categories',
    description: 'Browse book categories and explore what to read next.',
  }
}

export default function CatalogueCategoriesPage() {
  return <CategoriesContent />
}
