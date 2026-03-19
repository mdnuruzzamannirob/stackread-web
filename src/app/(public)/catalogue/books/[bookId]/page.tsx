import { BookDetailContent } from '@/components/features/catalog/pages/BookDetailContent'
import { fetchPublicResource } from '@/lib/utils/metadataFetch'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ bookId: string }>
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { bookId } = await params
  const book = await fetchPublicResource<{
    title?: string
    description?: string
    summary?: string
  }>(`/books/${bookId}`)

  return {
    title: book?.title
      ? `${book.title} | Stackread`
      : 'Book details | Stackread',
    description:
      book?.description ||
      book?.summary ||
      'Read details, reviews, and availability for this book.',
  }
}

export default async function CatalogueBookDetailsPage({ params }: PageProps) {
  const { bookId } = await params
  return <BookDetailContent bookId={bookId} />
}
