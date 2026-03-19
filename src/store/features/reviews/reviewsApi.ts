import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type Review = {
  id: string
  rating: number
  title?: string
  content?: string
  user?: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

type ReviewPayload = {
  rating: number
  title?: string
  content?: string
}

export const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookReviews: builder.query<
      ApiResponse<Array<Review>>,
      { bookId: string; page?: number; limit?: number; sortBy?: string }
    >({
      query: ({ bookId, ...params }) => ({
        url: `/books/${bookId}/reviews`,
        method: 'GET',
        params,
      }),
      providesTags: ['Reviews'],
    }),
    createReview: builder.mutation<
      ApiResponse<Review>,
      { bookId: string; payload: ReviewPayload }
    >({
      query: ({ bookId, payload }) => ({
        url: `/books/${bookId}/reviews`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Reviews'],
    }),
    updateReview: builder.mutation<
      ApiResponse<Review>,
      { bookId: string; id: string; payload: Partial<ReviewPayload> }
    >({
      query: ({ bookId, id, payload }) => ({
        url: `/books/${bookId}/reviews/${id}`,
        method: 'PATCH',
        body: payload,
      }),
      invalidatesTags: ['Reviews'],
    }),
    deleteReview: builder.mutation<
      ApiResponse<null>,
      { bookId: string; id: string }
    >({
      query: ({ bookId, id }) => ({
        url: `/books/${bookId}/reviews/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reviews'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetBookReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi
