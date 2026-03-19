import { AuthorsContent } from '@/components/features/catalog/pages/AuthorsContent'
import type { Metadata } from 'next'

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Stackread Authors',
    description:
      'Explore author profiles and their books in the Stackread catalogue.',
  }
}

export default function CatalogueAuthorsPage() {
  return <AuthorsContent />
}
