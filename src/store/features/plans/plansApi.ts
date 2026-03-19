import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type Plan = {
  id: string
  name: string
  price: number
  billingCycle?: 'monthly' | 'yearly'
  maxBooks?: number
  features?: string[]
  isActive?: boolean
}

export const plansApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlans: builder.query<ApiResponse<Array<Plan>>, void>({
      query: () => ({
        url: '/plans',
        method: 'GET',
      }),
      providesTags: ['Plans'],
    }),
    getPlanById: builder.query<ApiResponse<Plan>, string>({
      query: (id) => ({
        url: `/plans/${id}`,
        method: 'GET',
      }),
      providesTags: ['Plans'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetPlansQuery, useGetPlanByIdQuery } = plansApi
