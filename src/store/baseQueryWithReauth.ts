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

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    clearAllAccessTokens()

    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname

      if (pathname.startsWith('/admin')) {
        window.location.assign('/admin/login')
      } else {
        window.location.assign('/login')
      }
    }
  }

  return result
}
