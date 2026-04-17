import type { LoginPayload, UserProfile } from '@/store/features/auth/types'

type AnyRecord = Record<string, unknown>

export function extractLoginPayload(input: unknown): LoginPayload | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const payload = input as AnyRecord
  const requiresTwoFactor = Boolean(payload.requiresTwoFactor)

  if (requiresTwoFactor) {
    const tempToken =
      typeof payload.tempToken === 'string' ? payload.tempToken : null
    if (!tempToken) {
      return null
    }

    return {
      requiresTwoFactor: true,
      tempToken,
    }
  }

  const accessToken =
    typeof payload.accessToken === 'string' ? payload.accessToken : null
  const refreshToken =
    typeof payload.refreshToken === 'string' ? payload.refreshToken : null
  const user = parseUserFromUnknown(payload.user)

  if (!accessToken || !refreshToken || !user) {
    return null
  }

  return {
    requiresTwoFactor: false,
    accessToken,
    refreshToken,
    user,
  }
}

export function extractRegisterSession(
  input: unknown,
): { accessToken: string; refreshToken?: string; user: UserProfile } | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const payload = input as AnyRecord
  const user = parseUserFromUnknown(payload.user)
  const tokens = (payload.tokens ?? null) as {
    accessToken?: string
    refreshToken?: string
  } | null

  if (!user || !tokens?.accessToken) {
    return null
  }

  return {
    user,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  }
}

export function extractSession(
  input: unknown,
): { accessToken: string; refreshToken?: string; user: UserProfile } | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const payload = input as AnyRecord
  const accessToken =
    typeof payload.accessToken === 'string' ? payload.accessToken : null
  const user = parseUserFromUnknown(payload.user)

  if (!accessToken || !user) {
    return null
  }

  return {
    accessToken,
    refreshToken:
      typeof payload.refreshToken === 'string'
        ? payload.refreshToken
        : undefined,
    user,
  }
}

function parseBoolean(value: string | null) {
  return value === 'true' || value === '1'
}

function parseUserFromUnknown(input: unknown): UserProfile | null {
  if (!input || typeof input !== 'object') {
    return null
  }

  const candidate = input as Record<string, unknown>
  const id = typeof candidate.id === 'string' ? candidate.id : null
  const email = typeof candidate.email === 'string' ? candidate.email : null
  const firstName =
    typeof candidate.firstName === 'string' ? candidate.firstName : null

  if (!id || !email || !firstName) {
    return null
  }

  return {
    id,
    email,
    firstName,
    lastName:
      typeof candidate.lastName === 'string' ? candidate.lastName : undefined,
    address:
      typeof candidate.address === 'string' ? candidate.address : undefined,
    countryCode:
      typeof candidate.countryCode === 'string'
        ? candidate.countryCode
        : undefined,
    phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    profilePicture:
      typeof candidate.profilePicture === 'string'
        ? candidate.profilePicture
        : undefined,
    provider:
      candidate.provider === 'local' ||
      candidate.provider === 'google' ||
      candidate.provider === 'facebook'
        ? candidate.provider
        : undefined,
    isEmailVerified:
      typeof candidate.isEmailVerified === 'boolean'
        ? candidate.isEmailVerified
        : undefined,
    isSuspended:
      typeof candidate.isSuspended === 'boolean'
        ? candidate.isSuspended
        : undefined,
    twoFactorEnabled:
      typeof candidate.twoFactorEnabled === 'boolean'
        ? candidate.twoFactorEnabled
        : undefined,
    notificationPreferences:
      candidate.notificationPreferences &&
      typeof candidate.notificationPreferences === 'object'
        ? {
            email:
              typeof (
                candidate.notificationPreferences as Record<string, unknown>
              ).email === 'boolean'
                ? ((
                    candidate.notificationPreferences as Record<string, unknown>
                  ).email as boolean)
                : undefined,
            push:
              typeof (
                candidate.notificationPreferences as Record<string, unknown>
              ).push === 'boolean'
                ? ((
                    candidate.notificationPreferences as Record<string, unknown>
                  ).push as boolean)
                : undefined,
          }
        : undefined,
    lastLoginAt:
      typeof candidate.lastLoginAt === 'string'
        ? candidate.lastLoginAt
        : undefined,
    createdAt:
      typeof candidate.createdAt === 'string' ? candidate.createdAt : undefined,
    updatedAt:
      typeof candidate.updatedAt === 'string' ? candidate.updatedAt : undefined,
  }
}

function parseJsonUser(raw: string | null): UserProfile | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    return parseUserFromUnknown(parsed)
  } catch {
    return null
  }
}

export function parseOAuthCallbackParams(searchParams: URLSearchParams): {
  accessToken: string | null
  refreshToken: string | null
  tempToken: string | null
  requiresTwoFactor: boolean
  user: UserProfile | null
  error: string | null
} {
  const error = searchParams.get('error')

  const accessToken =
    searchParams.get('accessToken') ??
    searchParams.get('token') ??
    searchParams.get('jwt')

  const refreshToken =
    searchParams.get('refreshToken') ?? searchParams.get('refresh_token')

  const tempToken =
    searchParams.get('tempToken') ?? searchParams.get('temp_token')

  const requiresTwoFactor = parseBoolean(
    searchParams.get('requiresTwoFactor') ?? searchParams.get('requires_2fa'),
  )

  const jsonUser = parseJsonUser(searchParams.get('user'))

  return {
    accessToken,
    refreshToken,
    tempToken,
    requiresTwoFactor,
    user: jsonUser,
    error,
  }
}
