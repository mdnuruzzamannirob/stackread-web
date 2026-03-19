import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type Category = {
  id: string
  name: string
  slug?: string
  description?: string
  bookCount?: number
  children?: Category[]
}

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<ApiResponse<Array<Category>>, void>({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),
    getCategoryById: builder.query<ApiResponse<Category>, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'GET',
      }),
      providesTags: ['Categories'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetCategoriesQuery, useGetCategoryByIdQuery } = categoriesApi
