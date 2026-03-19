import { SearchContent } from '@/components/features/catalog/pages/SearchContent'
import type { Metadata } from 'next'

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const generateMetadata = async ({
  searchParams,
}: SearchPageProps): Promise<Metadata> => {
  const resolved = await searchParams
  const query = typeof resolved.q === 'string' ? resolved.q : ''

  return {
    title: query
      ? `Search: ${query} | Stackread`
      : 'Search catalogue | Stackread',
    description: query
      ? `Search results for ${query} in Stackread.`
      : 'Search books, authors, and categories in Stackread.',
  }
}

export default function SearchPage() {
  return <SearchContent />
}
