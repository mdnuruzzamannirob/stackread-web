import { PricingContent } from '@/components/features/catalog/pages/PricingContent'
import type { Metadata } from 'next'

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Stackread Pricing Plans',
    description:
      'Compare Stackread plans and choose the best subscription for your reading goals.',
  }
}

export default function PricingPage() {
  return <PricingContent />
}
