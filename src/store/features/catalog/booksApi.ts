import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type BookListQuery = {
  search?: string
  category?: string
  categoryId?: string
  author?: string
  authorId?: string
  page?: number
  limit?: number
  sort?: string
  order?: 'asc' | 'desc'
}

type Book = {
  id: string
  title: string
  slug?: string
  summary?: string
  description?: string
  coverImageUrl?: string
  language?: string
  pageCount?: number
  ratingAverage?: number
  ratingsCount?: number
  isAvailable?: boolean
  featured?: boolean
  authors?: Array<{ id: string; name: string }>
  categories?: Array<{ id: string; name: string }>
}

export const booksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBooks: builder.query<
      ApiResponse<Array<Book>>,
      BookListQuery | undefined
    >({
      query: (params = {}) => ({
        url: '/books',
        method: 'GET',
        params,
      }),
      providesTags: ['Books'],
    }),
    getFeaturedBooks: builder.query<ApiResponse<Array<Book>>, void>({
      query: () => ({
        url: '/books/featured',
        method: 'GET',
      }),
      providesTags: ['Books'],
    }),
    getBookById: builder.query<ApiResponse<Book>, string>({
      query: (id) => ({
        url: `/books/${id}`,
        method: 'GET',
      }),
      providesTags: ['Books'],
    }),
    getBookPreview: builder.query<ApiResponse<{ url?: string }>, string>({
      query: (id) => ({
        url: `/books/${id}/preview`,
        method: 'GET',
      }),
      providesTags: ['Books'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBooksQuery,
  useGetFeaturedBooksQuery,
  useGetBookByIdQuery,
  useGetBookPreviewQuery,
} = booksApi
