import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type SearchResultBook = {
  id: string
  title: string
  coverImageUrl?: string
  summary?: string
  ratingAverage?: number
}

type SearchQueryParams = {
  q: string
  page?: number
  limit?: number
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchBooks: builder.query<
      ApiResponse<Array<SearchResultBook>>,
      SearchQueryParams
    >({
      query: (params) => ({
        url: '/search',
        method: 'GET',
        params,
      }),
      providesTags: ['Books'],
    }),
    getSuggestions: builder.query<
      ApiResponse<string[]>,
      { q: string; limit?: number }
    >({
      query: (params) => ({
        url: '/search/suggestions',
        method: 'GET',
        params,
      }),
    }),
    getPopularTerms: builder.query<
      ApiResponse<string[]>,
      { limit?: number } | undefined
    >({
      query: (params = {}) => ({
        url: '/search/popular-terms',
        method: 'GET',
        params,
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useSearchBooksQuery,
  useLazySearchBooksQuery,
  useGetSuggestionsQuery,
  useLazyGetSuggestionsQuery,
  useGetPopularTermsQuery,
} = searchApi
