import { AuthorDetailContent } from '@/components/features/catalog/pages/AuthorDetailContent'
import { fetchPublicResource } from '@/lib/utils/metadataFetch'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ authorId: string }>
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { authorId } = await params
  const author = await fetchPublicResource<{ name?: string; bio?: string }>(
    `/authors/${authorId}`,
  )

  return {
    title: author?.name
      ? `${author.name} | Stackread`
      : 'Author details | Stackread',
    description:
      author?.bio || 'Explore this author profile and books in Stackread.',
  }
}

export default async function CatalogueAuthorDetailsPage({
  params,
}: PageProps) {
  const { authorId } = await params
  return <AuthorDetailContent authorId={authorId} />
}
