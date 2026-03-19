import { baseApi } from '@/store/baseApi'
import type { ApiResponse } from '@/types'

type FlashSale = {
  id: string
  name: string
  description?: string
  discount: number
  startDate: string
  endDate: string
}

type CouponValidation = {
  valid: boolean
  code: string
  discount?: number
  discountType?: 'percentage' | 'fixed'
  message?: string
}

export const promotionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveFlashSales: builder.query<ApiResponse<Array<FlashSale>>, void>({
      query: () => ({
        url: '/promotions/flash-sales/active',
        method: 'GET',
      }),
      providesTags: ['Promotions'],
    }),
    validateCoupon: builder.mutation<
      ApiResponse<CouponValidation>,
      { code: string }
    >({
      query: (body) => ({
        url: '/promotions/coupons/validate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Promotions'],
    }),
  }),
  overrideExisting: false,
})

export const { useGetActiveFlashSalesQuery, useValidateCouponMutation } =
  promotionsApi
