'use client'

import { Button } from '@/components/ui/button'
import { useMemo } from 'react'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export function OAuthButtons() {
  const callbackUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return ''
    }

    return `${window.location.origin}/auth/callback`
  }, [])

  const encodedCallback = encodeURIComponent(callbackUrl)
  const googleHref = `${apiBaseUrl}/auth/google?redirect=${encodedCallback}`
  const facebookHref = `${apiBaseUrl}/auth/facebook?redirect=${encodedCallback}`

  return (
    <div className="flex gap-2">
      <a href={googleHref} className="flex-1">
        <Button type="button" variant="outline" className="w-full">
          Continue with Google
        </Button>
      </a>
      <a href={facebookHref} className="flex-1">
        <Button type="button" variant="outline" className="w-full">
          Continue with Facebook
        </Button>
      </a>
    </div>
  )
}
