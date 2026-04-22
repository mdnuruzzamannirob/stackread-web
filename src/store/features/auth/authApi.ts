import type { ApiEnvelope } from '@/lib/api/types'
import { baseApi } from '@/store/baseApi'
import type {
  LoginHistoryPayload,
  RegisterResponse,
  TwoFactorBackupCodesPayload,
  TwoFactorSetupPayload,
  UserProfile,
  UserSessionPayload,
} from '@/store/features/auth/types'

type RegisterBody = {
  firstName: string
  lastName?: string
  email: string
  phone: string
  address: string
  password: string
  countryCode: string
  agreeToTerms: boolean
}

type LoginBody = {
  email: string
  password: string
  rememberMe?: boolean
}

type VerifyEmailBody = { email: string; otp: string }
type EmailBody = { email: string }
type VerifyResetOtpBody = { email: string; otp: string }
type ResetPasswordBody = {
  email: string
  resetToken: string
  newPassword: string
}
type TempTokenBody = { tempToken: string }
type UpdateMeBody = {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  profilePicture?: string
  address?: string
  countryCode?: string
  notificationPreferences?: {
    email?: boolean
    push?: boolean
  }
}

type ChangePasswordBody = {
  currentPassword: string
  newPassword: string
}

type UpdateNotificationPreferencesBody = {
  email?: boolean
  push?: boolean
}

type TwoFactorChallengeBody = {
  tempToken: string
  method: 'totp' | 'email' | 'backup-code'
  verificationCode: string
}

type RefreshResponse = { accessToken: string }
type LoginResponse =
  | {
      requiresTwoFactor: false
      token: string
      user: UserProfile
    }
  | {
      requiresTwoFactor: true
      tempToken: string
      user: UserProfile
    }

type SuccessResponse = { success: true }
type SentResponse = { sent: true }

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiEnvelope<RegisterResponse>, RegisterBody>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    login: builder.mutation<ApiEnvelope<LoginResponse>, LoginBody>({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    verifyEmail: builder.mutation<
      ApiEnvelope<UserSessionPayload>,
      VerifyEmailBody
    >({
      query: (body) => ({
        url: '/auth/verify-email',
        method: 'POST',
        body,
      }),
    }),
    resendVerification: builder.mutation<ApiEnvelope<null>, EmailBody>({
      query: (body) => ({
        url: '/auth/resend-verification',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<ApiEnvelope<SentResponse>, EmailBody>({
      query: (body) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),
    resendResetOtp: builder.mutation<ApiEnvelope<SentResponse>, EmailBody>({
      query: (body) => ({
        url: '/auth/resend-reset-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyResetOtp: builder.mutation<
      ApiEnvelope<{ resetToken: string }>,
      VerifyResetOtpBody
    >({
      query: (body) => ({
        url: '/auth/verify-reset-otp',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ApiEnvelope<SuccessResponse>,
      ResetPasswordBody
    >({
      query: (body) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),
    sendTwoFactorEmailOtp: builder.mutation<
      ApiEnvelope<SentResponse>,
      TempTokenBody
    >({
      query: (body) => ({
        url: '/auth/2fa/email/send',
        method: 'POST',
        body,
      }),
    }),
    sendTwoFactorSetupEmailOtp: builder.mutation<
      ApiEnvelope<SentResponse>,
      void
    >({
      query: () => ({
        url: '/auth/2fa/setup/email/send',
        method: 'POST',
      }),
    }),
    challengeTwoFactor: builder.mutation<
      ApiEnvelope<UserSessionPayload>,
      TwoFactorChallengeBody
    >({
      query: (body) => ({
        url: '/auth/2fa/challenge',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    enableTwoFactor: builder.mutation<
      ApiEnvelope<TwoFactorSetupPayload>,
      { currentPassword: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/enable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    verifyTwoFactor: builder.mutation<
      ApiEnvelope<SuccessResponse>,
      { currentPassword: string; otp?: string; emailOtp?: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/verify',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    disableTwoFactor: builder.mutation<
      ApiEnvelope<SuccessResponse>,
      { currentPassword: string; otp?: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/disable',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    regenerateBackupCodes: builder.mutation<
      ApiEnvelope<{ backupCodes: string[] }>,
      { currentPassword: string; otp?: string }
    >({
      query: (body) => ({
        url: '/auth/2fa/backup-codes/regenerate',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    getTwoFactorBackupCodesCount: builder.query<
      ApiEnvelope<TwoFactorBackupCodesPayload>,
      { otp: string }
    >({
      query: ({ otp }) => ({
        url: `/auth/2fa/backup-codes?otp=${encodeURIComponent(otp)}`,
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    logout: builder.mutation<
      ApiEnvelope<SuccessResponse> | ApiEnvelope<null>,
      void
    >({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
    refresh: builder.mutation<ApiEnvelope<RefreshResponse>, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
      }),
    }),
    loginHistory: builder.query<
      ApiEnvelope<LoginHistoryPayload>,
      { limit?: number; page?: number } | void
    >({
      query: (params) => ({
        url: (() => {
          if (typeof params !== 'object') {
            return '/auth/me/login-history'
          }

          const query = new URLSearchParams()

          if (typeof params.limit === 'number') {
            query.set('limit', String(params.limit))
          }

          if (typeof params.page === 'number') {
            query.set('page', String(params.page))
          }

          const suffix = query.toString()
          return suffix
            ? `/auth/me/login-history?${suffix}`
            : '/auth/me/login-history'
        })(),
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    me: builder.query<ApiEnvelope<UserProfile>, void>({
      query: () => ({
        url: '/auth/me',
        method: 'GET',
      }),
      providesTags: ['Auth'],
    }),
    updateMe: builder.mutation<ApiEnvelope<UserProfile>, UpdateMeBody>({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    updateMyProfilePicture: builder.mutation<
      ApiEnvelope<UserProfile>,
      { profilePicture?: string; fileBase64?: string; fileName?: string }
    >({
      query: (body) => ({
        url: '/auth/me/profile-picture',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    changeMyPassword: builder.mutation<ApiEnvelope<null>, ChangePasswordBody>({
      query: (body) => ({
        url: '/auth/me/password',
        method: 'PATCH',
        body,
      }),
    }),
    updateMyNotificationPreferences: builder.mutation<
      ApiEnvelope<UserProfile>,
      UpdateNotificationPreferencesBody
    >({
      query: (body) => ({
        url: '/auth/me/notification-prefs',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    deleteMyAccount: builder.mutation<
      ApiEnvelope<{ success: true }>,
      { confirmText: 'DELETE'; currentPassword?: string }
    >({
      query: (body) => ({
        url: '/auth/me',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResendResetOtpMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
  useSendTwoFactorEmailOtpMutation,
  useSendTwoFactorSetupEmailOtpMutation,
  useChallengeTwoFactorMutation,
  useEnableTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useDisableTwoFactorMutation,
  useRegenerateBackupCodesMutation,
  useGetTwoFactorBackupCodesCountQuery,
  useLazyGetTwoFactorBackupCodesCountQuery,
  useLogoutMutation,
  useRefreshMutation,
  useLoginHistoryQuery,
  useLazyMeQuery,
  useMeQuery,
  useUpdateMeMutation,
  useUpdateMyProfilePictureMutation,
  useChangeMyPasswordMutation,
  useUpdateMyNotificationPreferencesMutation,
  useDeleteMyAccountMutation,
} = authApi
