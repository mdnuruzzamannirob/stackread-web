import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react'

import { routing } from '@/i18n/routing'
import {
  clearSession,
  getStoredAccessToken,
  persistSession,
} from '@/lib/auth/token-storage'
import { env } from '@/lib/env'
import {
  clearAuthState,
  setHydratedToken,
} from '@/store/features/auth/authSlice'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const state = getState() as { auth?: { token?: string | null } }
    const token = state.auth?.token ?? getStoredAccessToken()

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    headers.set('Content-Type', 'application/json')
    return headers
  },
})

function getLocaleFromPath(pathname: string | null) {
  if (!pathname) {
    return env.defaultLocale
  }

  const [firstSegment] = pathname.split('/').filter(Boolean)

  if (
    firstSegment &&
    routing.locales.includes(firstSegment as (typeof routing.locales)[number])
  ) {
    return firstSegment
  }

  return env.defaultLocale
}

function hardRedirectToLogin() {
  if (typeof window === 'undefined') {
    return
  }

  const locale = getLocaleFromPath(window.location.pathname)
  window.location.replace(`/${locale}/auth/login`)
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status !== 401) {
    return result
  }

  const refreshResult = await rawBaseQuery(
    {
      url: '/auth/refresh',
      method: 'POST',
    },
    api,
    extraOptions,
  )

  if (refreshResult.error) {
    clearSession()
    api.dispatch(clearAuthState())
    hardRedirectToLogin()
    return result
  }

  const accessToken =
    (refreshResult.data as { data?: { accessToken?: string } } | undefined)
      ?.data?.accessToken ?? null

  if (!accessToken) {
    clearSession()
    api.dispatch(clearAuthState())
    hardRedirectToLogin()
    return result
  }

  persistSession({ accessToken })
  api.dispatch(setHydratedToken(accessToken))

  result = await rawBaseQuery(args, api, extraOptions)
  return result
}
