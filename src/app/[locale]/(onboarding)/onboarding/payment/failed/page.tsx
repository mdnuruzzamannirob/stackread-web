'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { AuthCard } from '@/components/layout/authCard'
import { Button } from '@/components/ui/button'

export default function OnboardingPaymentFailedPage() {
  const t = useTranslations('onboarding.cancel')
  const params = useParams<{ locale: string }>()
  const locale = params.locale ?? 'en'

  return (
    <AuthCard title={t('title')} subtitle={t('subtitle')}>
      <div className="space-y-3">
        <Link href={`/${locale}/onboarding/plan-selection`} className="block">
          <Button className="w-full">{t('chooseAgain')}</Button>
        </Link>
        <Link href={`/${locale}/dashboard`} className="block">
          <Button variant="outline" className="w-full">
            {t('returnDashboard')}
          </Button>
        </Link>
      </div>
    </AuthCard>
  )
}
