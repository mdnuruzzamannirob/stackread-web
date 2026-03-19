import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type Author = {
  id: string
  name: string
  bio?: string
  imageUrl?: string
  bookCount?: number
  books?: Array<{ id: string; title: string; coverImageUrl?: string }>
}

type ListAuthorsQuery = {
  search?: string
  page?: number
  limit?: number
}

export const authorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuthors: builder.query<
      ApiResponse<Array<Author>>,
      ListAuthorsQuery | undefined
    >({
      query: (params = {}) => ({
        url: '/authors',
        method: 'GET',
        params,
      }),
      providesTags: ['Authors'],
    }),
    getAuthorById: builder.query<ApiResponse<Author>, string>({
      query: (id) => ({
        url: `/authors/${id}`,
        method: 'GET',
      }),
      providesTags: ['Authors'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetAuthorsQuery, useGetAuthorByIdQuery } = authorsApi
