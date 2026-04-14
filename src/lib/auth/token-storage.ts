'use client'

import { env } from '@/lib/env'

type PersistSessionInput = {
  accessToken: string
  refreshToken?: string
}

export function persistSession({ accessToken }: PersistSessionInput) {
  document.cookie = `${env.sessionCookieName}=${accessToken}; Path=/; SameSite=Lax`
}

export function clearSession() {
  document.cookie = `${env.sessionCookieName}=; Path=/; Max-Age=0; SameSite=Lax`
}

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const encodedName = encodeURIComponent(name)
  const cookiePart = document.cookie
    .split('; ')
    .find((cookieItem) => cookieItem.startsWith(`${encodedName}=`))

  if (!cookiePart) {
    return null
  }

  const rawValue = cookiePart.slice(encodedName.length + 1)

  try {
    return decodeURIComponent(rawValue)
  } catch {
    return rawValue
  }
}

export function getStoredAccessToken() {
  return readCookieValue(env.sessionCookieName)
}

export function getStoredRefreshToken() {
  return null
}
