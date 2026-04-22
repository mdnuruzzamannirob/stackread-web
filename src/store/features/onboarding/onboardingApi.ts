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
  status: OnboardingStatus
  selectedPlanCode?: string
  selectedPlanName?: string
  selectedPlanPrice?: number
  selectedAt?: string
  interests?: string[]
  selectedLanguage?: string
  completedAt?: string
}

export type OnboardingInterestOption = {
  code: string
  label: string
}

export type SelectOnboardingPlanBody = {
  planCode: string
  locale?: 'en' | 'bn'
}

export type CompleteOnboardingBody = {
  agreeToTerms: true
}

export type CompleteOnboardingResponse = {
  id: string
  status: OnboardingStatus
  completedAt: string
  selectedPlanCode: string
}

export type SaveOnboardingInterestsResponse = {
  success: true
  interests: string[]
}

export type SaveOnboardingLanguageResponse = {
  success: true
  language: string
}

export type ConfirmOnboardingPaymentBody = {
  sessionId: string
  reference?: string
}

export type ConfirmOnboardingPaymentResponse = {
  status: OnboardingStatus | 'pending' | 'completed'
  selectedPlanCode?: string
  completedAt?: string
}

export type SelectOnboardingPlanResponse = {
  id: string
  plan: OnboardingPlan
  status: OnboardingStatus
  nextStep: 'redirect_to_payment' | 'onboarding_completed'
  checkout_url?: string
  redirectUrl?: string
  url?: string
  sessionId?: string
  paymentId?: string
}

export const onboardingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOnboardingPlans: builder.query<ApiEnvelope<OnboardingPlan[]>, void>({
      query: () => ({
        url: '/plans',
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
    getOnboardingInterests: builder.query<
      ApiEnvelope<OnboardingInterestOption[]>,
      void
    >({
      query: () => ({
        url: '/onboarding/interests',
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
    saveOnboardingInterests: builder.mutation<
      ApiEnvelope<SaveOnboardingInterestsResponse>,
      { interests: string[] }
    >({
      query: (body) => ({
        url: '/onboarding/interests',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Onboarding'],
    }),
    saveOnboardingLanguage: builder.mutation<
      ApiEnvelope<SaveOnboardingLanguageResponse>,
      { language: string }
    >({
      query: (body) => ({
        url: '/onboarding/language',
        method: 'PATCH',
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
    confirmOnboardingPayment: builder.mutation<
      ApiEnvelope<ConfirmOnboardingPaymentResponse>,
      ConfirmOnboardingPaymentBody
    >({
      query: (body) => ({
        url: '/onboarding/confirm-payment',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Onboarding'],
    }),
  }),
})

export const {
  useGetOnboardingPlansQuery,
  useGetOnboardingStatusQuery,
  useGetOnboardingInterestsQuery,
  useLazyGetOnboardingStatusQuery,
  useSelectOnboardingPlanMutation,
  useSaveOnboardingInterestsMutation,
  useSaveOnboardingLanguageMutation,
  useCompleteOnboardingMutation,
  useConfirmOnboardingPaymentMutation,
} = onboardingApi
