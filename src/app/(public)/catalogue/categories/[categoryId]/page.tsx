import { CategoryDetailContent } from '@/components/features/catalog/pages/CategoryDetailContent'
import { fetchPublicResource } from '@/lib/utils/metadataFetch'
import type { Metadata } from 'next'

type PageProps = {
  params: Promise<{ categoryId: string }>
}

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { categoryId } = await params
  const category = await fetchPublicResource<{
    name?: string
    description?: string
  }>(`/categories/${categoryId}`)

  return {
    title: category?.name
      ? `${category.name} | Stackread`
      : 'Category details | Stackread',
    description: category?.description || 'Browse books in this category.',
  }
}

export default async function CatalogueCategoryDetailsPage({
  params,
}: PageProps) {
  const { categoryId } = await params
  return <CategoryDetailContent categoryId={categoryId} />
}
