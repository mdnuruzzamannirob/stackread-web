import { PublicHomeContent } from '@/components/features/catalog/pages/PublicHomeContent'
import type { Metadata } from 'next'

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Stackread | Read Smarter, Borrow Faster',
    description:
      'Discover books, compare plans, and start reading with Stackread.',
  }
}

export default function HomePage() {
  return <PublicHomeContent />
}
