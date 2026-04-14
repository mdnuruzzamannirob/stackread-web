import { redirect } from 'next/navigation'

import { env } from '@/lib/env'

export default function Page() {
  redirect(`/${env.defaultLocale}`)
}
