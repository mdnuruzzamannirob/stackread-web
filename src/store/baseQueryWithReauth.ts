import { clearAllAccessTokens, getAccessToken } from '@/lib/auth/tokenStorage'
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  prepareHeaders: (headers) => {
    const userToken = getAccessToken('user')
    const staffToken = getAccessToken('staff')
    const token = staffToken ?? userToken

    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }

    return headers
  },
})

let refreshInFlight: Promise<boolean> | null = null

function getRequestUrl(args: string | FetchArgs): string {
  if (typeof args === 'string') {
    return args
  }

  return args.url
}

function isStaffRequest(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args)
  return url.startsWith('/staff') || url.startsWith('/admin')
}

function resolveRedirectPath(pathname: string) {
  return pathname.startsWith('/admin') ? '/admin/login' : '/auth/login'
}

function buildRedirectUrl(pathname: string) {
  const loginPath = resolveRedirectPath(pathname)

  if (pathname === '/auth/login' || pathname === '/admin/login') {
    return loginPath
  }

  const encoded = encodeURIComponent(pathname)
  return `${loginPath}?redirect=${encoded}`
}

async function attemptRefresh(
  args: string | FetchArgs,
  api: Parameters<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >[1],
  extraOptions: Parameters<
    BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
  >[2],
): Promise<boolean> {
  const shouldAttemptRefresh =
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_ENABLE_REFRESH === 'true'

  if (!shouldAttemptRefresh) {
    return false
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refreshRoute = isStaffRequest(args)
        ? '/staff/refresh'
        : '/auth/refresh'
      const refreshResult = await rawBaseQuery(
        {
          url: refreshRoute,
          method: 'POST',
        },
        api,
        extraOptions,
      )

      if (refreshResult.error) {
        return false
      }

      return true
    })()
  }

  const success = await refreshInFlight
  refreshInFlight = null
  return success
}

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshed = await attemptRefresh(args, api, extraOptions)

    if (refreshed) {
      result = await rawBaseQuery(args, api, extraOptions)
    }

    if (result.error?.status === 401) {
      const requestIsStaff =
        isStaffRequest(args) || Boolean(getAccessToken('staff'))
      clearAllAccessTokens()

      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname
        const redirectTarget = requestIsStaff
          ? `/admin/login?redirect=${encodeURIComponent(pathname)}`
          : buildRedirectUrl(pathname)
        window.location.assign(redirectTarget)
      }
    }
  }

  if (result.error?.status === 403 && typeof window !== 'undefined') {
    const pathname = window.location.pathname

    if (pathname.startsWith('/admin')) {
      window.location.assign('/admin')
    } else if (pathname.startsWith('/dashboard')) {
      window.location.assign('/dashboard')
    }
  }

  return result
}
