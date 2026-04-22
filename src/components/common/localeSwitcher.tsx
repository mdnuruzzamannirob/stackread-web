'use client'

import { usePathname, useRouter } from 'next/navigation'

import { routing } from '@/i18n/routing'

export function LocaleSwitcher({ currentLocale }: { currentLocale: string }) {
  const router = useRouter()
  const pathname = usePathname()

  const switchLocale = () => {
    const nextLocale = currentLocale === 'en' ? 'bn' : 'en'

    if (!routing.locales.includes(nextLocale)) {
      return
    }

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length === 0) {
      router.push(`/${nextLocale}`)
      return
    }

    if (routing.locales.includes(segments[0])) {
      segments[0] = nextLocale
      router.push(`/${segments.join('/')}`)
      return
    }

    router.push(`/${nextLocale}/${segments.join('/')}`)
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="flex size-10 items-center justify-center rounded-lg font-medium border bg-white border-gray-200 hover:border-gray-300 duration-150 text-gray-500 hover:text-inherit"
    >
      {currentLocale === 'en' ? 'BN' : 'EN'}
    </button>
  )
}
