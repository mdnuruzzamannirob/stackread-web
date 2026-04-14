import type { ApiEnvelope } from '@/lib/api/types'
import { baseApi } from '@/store/baseApi'

export type OnboardingPlan = {
  code: string
  name: string
  price: number
  billingCycle?: string
  isPaid?: boolean
}

export type OnboardingStatus = 'pending' | 'selected' | 'completed'

export type OnboardingStatusResponse = {
  status?: OnboardingStatus
  selectedPlanCode?: string
  selectedPlanName?: string
  selectedPlanPrice?: number
}

export type SelectOnboardingPlanBody = {
  planCode: string
}

export type CompleteOnboardingBody = {
  agreeToTerms?: boolean
}

export type CompleteOnboardingResponse = {
  status?: OnboardingStatus
}

export type SelectOnboardingPlanResponse = {
  status?: OnboardingStatus
  nextStep?: 'redirect_to_payment' | 'complete_onboarding'
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOnboardingPlans: builder.query<ApiEnvelope<OnboardingPlan[]>, void>({
      query: () => ({
        url: '/onboarding/plans',
        method: 'GET',
      }),
      providesTags: ['Onboarding'],
    }),
    getOnboardingStatus: builder.query<
      ApiEnvelope<OnboardingStatusResponse>,
      void
    >({
      query: () => ({
        url: '/onboarding/status',
        method: 'GET',
      }),
      providesTags: ['Onboarding'],
    }),
    selectOnboardingPlan: builder.mutation<
      ApiEnvelope<SelectOnboardingPlanResponse>,
      SelectOnboardingPlanBody
    >({
      query: (body) => ({
        url: '/onboarding/select',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    completeOnboarding: builder.mutation<
      ApiEnvelope<CompleteOnboardingResponse>,
      CompleteOnboardingBody
    >({
      query: (body) => ({
        url: '/onboarding/complete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Onboarding', 'Auth'],
    }),
  }),
})

export const {
  useGetOnboardingPlansQuery,
  useGetOnboardingStatusQuery,
  useSelectOnboardingPlanMutation,
  useCompleteOnboardingMutation,
} = onboardingApi
