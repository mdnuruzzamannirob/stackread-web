import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type {
  AuthState,
  LoginPayload,
  UserProfile,
} from '@/store/features/auth/types'

const initialState: AuthState = {
  actorType: 'user',
  token: null,
  user: null,
  tempToken: null,
  requiresTwoFactor: false,
  onboardingStatus: 'unknown',
  isHydrated: false,
  twoFactorEnabled: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticatedSession: (
      state,
      action: PayloadAction<{ token: string; user: UserProfile }>,
    ) => {
      state.token = action.payload.token
      state.user = action.payload.user
      state.requiresTwoFactor = false
      state.tempToken = null
      state.twoFactorEnabled = Boolean(action.payload.user.twoFactorEnabled)
      state.isHydrated = true
    },
    setLoginOutcome: (state, action: PayloadAction<LoginPayload>) => {
      state.requiresTwoFactor = action.payload.requiresTwoFactor
      if (action.payload.requiresTwoFactor) {
        state.tempToken = action.payload.tempToken
      }
    },
    setOnboardingStatus: (
      state,
      action: PayloadAction<AuthState['onboardingStatus']>,
    ) => {
      state.onboardingStatus = action.payload
    },
    setHydratedToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload
      state.isHydrated = true
    },
    clearAuthState: (state) => {
      Object.assign(state, initialState)
      state.isHydrated = true
    },
  },
})

export const {
  setAuthenticatedSession,
  setLoginOutcome,
  setOnboardingStatus,
  setHydratedToken,
  clearAuthState,
} = authSlice.actions

export default authSlice.reducer
