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
  const user = (payload.user ?? null) as UserProfile | null

  if (!accessToken || !user) {
    return null
  }

  return {
    requiresTwoFactor: false,
    accessToken,
    refreshToken:
      typeof payload.refreshToken === 'string'
        ? payload.refreshToken
        : undefined,
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
  const user = (payload.user ?? null) as UserProfile | null
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
  const user = (payload.user ?? null) as UserProfile | null

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

function parseJsonUser(raw: string | null): UserProfile | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return null
    }

    const candidate = parsed as Record<string, unknown>
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
      provider:
        candidate.provider === 'local' ||
        candidate.provider === 'google' ||
        candidate.provider === 'facebook'
          ? candidate.provider
          : undefined,
    }
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

  const user: UserProfile = jsonUser ?? {
    id: searchParams.get('id') ?? 'oauth-user',
    email: searchParams.get('email') ?? '',
    firstName:
      searchParams.get('firstName') ?? searchParams.get('name') ?? 'User',
    lastName: searchParams.get('lastName') ?? '',
    provider:
      (searchParams.get('provider') as UserProfile['provider']) ?? 'google',
  }

  return {
    accessToken,
    refreshToken,
    tempToken,
    requiresTwoFactor,
    user,
    error,
  }
}
