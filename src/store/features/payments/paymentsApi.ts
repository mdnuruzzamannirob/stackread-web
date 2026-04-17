import type { ApiEnvelope } from '@/lib/api/types'
import { baseApi } from '@/store/baseApi'

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'success'
  | 'failed'
  | 'refunded'

export type PaymentGateway = 'bkash' | 'nagad' | 'stripe' | 'paypal'

export type MyPaymentSummary = {
  id: string
  userId: string
  subscriptionId: string
  provider: string
  gateway: PaymentGateway
  status: PaymentStatus
  amount: number
  currency: string
  discountAmount: number
  payableAmount: number
  providerPaymentId?: string
  gatewayTransactionId?: string
  reference: string
  metadata: Record<string, unknown>
  verifiedAt?: string
  refundedAt?: string
  refundReason?: string
  createdAt: string
  updatedAt: string
}

export type PaymentMethodSummary = {
  gateway: PaymentGateway | 'none'
  label: string
  status: 'ok' | 'expired' | 'missing'
  brand?: string
  last4?: string
  expMonth?: number
  expYear?: number
  holderName?: string
  expiresAt?: string
}

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyPayments: builder.query<ApiEnvelope<MyPaymentSummary[]>, void>({
      query: () => ({
        url: '/payments/my',
        method: 'GET',
      }),
    }),
    getMyPaymentMethod: builder.query<ApiEnvelope<PaymentMethodSummary>, void>({
      query: () => ({
        url: '/payments/my/method',
        method: 'GET',
      }),
    }),
    createMyPaymentMethodPortalSession: builder.mutation<
      ApiEnvelope<{ url: string }>,
      { returnUrl?: string }
    >({
      query: (body) => ({
        url: '/payments/my/method/portal',
        method: 'POST',
        body,
      }),
    }),
  }),
})

export const {
  useGetMyPaymentsQuery,
  useGetMyPaymentMethodQuery,
  useCreateMyPaymentMethodPortalSessionMutation,
} = paymentsApi
