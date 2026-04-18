'use client'

export type TwoFactorMethodPreference = 'totp' | 'email' | 'both'

const STORAGE_KEY_PREFIX = 'stackread_2fa_pref:'

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const getKey = (email: string) =>
  `${STORAGE_KEY_PREFIX}${normalizeEmail(email)}`

const parsePreference = (
  value: string | null,
): TwoFactorMethodPreference | null => {
  if (value === 'totp' || value === 'email' || value === 'both') {
    return value
  }

  return null
}

export function getTwoFactorMethodPreference(
  email: string,
): TwoFactorMethodPreference | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!email.trim()) {
    return null
  }

  return parsePreference(window.localStorage.getItem(getKey(email)))
}

export function setTwoFactorMethodPreference(
  email: string,
  preference: TwoFactorMethodPreference,
) {
  if (typeof window === 'undefined') {
    return
  }

  if (!email.trim()) {
    return
  }

  window.localStorage.setItem(getKey(email), preference)
}

export function clearTwoFactorMethodPreference(email: string) {
  if (typeof window === 'undefined') {
    return
  }

  if (!email.trim()) {
    return
  }

  window.localStorage.removeItem(getKey(email))
}

const decodeBase64Url = (value: string): string | null => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const paddingLength = (4 - (normalized.length % 4)) % 4
  const padded = `${normalized}${'='.repeat(paddingLength)}`

  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(padded)
    }

    return Buffer.from(padded, 'base64').toString('utf8')
  } catch {
    return null
  }
}

export function extractEmailFromTempToken(tempToken: string): string | null {
  const parts = tempToken.split('.')

  if (parts.length < 2) {
    return null
  }

  const payloadRaw = decodeBase64Url(parts[1])

  if (!payloadRaw) {
    return null
  }

  try {
    const payload = JSON.parse(payloadRaw) as { email?: unknown }
    return typeof payload.email === 'string'
      ? normalizeEmail(payload.email)
      : null
  } catch {
    return null
  }
}
