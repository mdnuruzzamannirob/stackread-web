import type { RootState } from '@/store'
import type { IStaff, IUser } from '@/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ActorType = 'user' | 'staff' | null
type AuthHydrationStatus = 'idle' | 'hydrating' | 'hydrated'
type OnboardingStatus = 'unknown' | 'required' | 'completed'

export type AuthState = {
  actorType: ActorType
  accessToken: string | null
  pendingTwoFactorToken: string | null
  currentActor: IUser | IStaff | null
  roles: string[]
  permissionMap: Record<string, boolean>
  onboardingStatus: OnboardingStatus
  hydrationStatus: AuthHydrationStatus
}

const initialState: AuthState = {
  actorType: null,
  accessToken: null,
  pendingTwoFactorToken: null,
  currentActor: null,
  roles: [],
  permissionMap: {},
  onboardingStatus: 'unknown',
  hydrationStatus: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setActorType(state, action: PayloadAction<ActorType>) {
      state.actorType = action.payload
    },
    setAccessToken(state, action: PayloadAction<string | null>) {
      state.accessToken = action.payload
    },
    setPendingTwoFactorToken(state, action: PayloadAction<string | null>) {
      state.pendingTwoFactorToken = action.payload
    },
    setCurrentActor(state, action: PayloadAction<IUser | IStaff | null>) {
      state.currentActor = action.payload
    },
    setRoles(state, action: PayloadAction<string[]>) {
      state.roles = action.payload
    },
    setPermissionMap(state, action: PayloadAction<Record<string, boolean>>) {
      state.permissionMap = action.payload
    },
    setOnboardingStatus(state, action: PayloadAction<OnboardingStatus>) {
      state.onboardingStatus = action.payload
    },
    setHydrationStatus(state, action: PayloadAction<AuthHydrationStatus>) {
      state.hydrationStatus = action.payload
    },
    resetAuthState() {
      return initialState
    },
  },
})

export const {
  setActorType,
  setAccessToken,
  setPendingTwoFactorToken,
  setCurrentActor,
  setRoles,
  setPermissionMap,
  setOnboardingStatus,
  setHydrationStatus,
  resetAuthState,
} = authSlice.actions

export const authReducer = authSlice.reducer

export const selectAuthState = (state: RootState) => state.auth
export const selectActorType = (state: RootState) => state.auth.actorType
export const selectAccessToken = (state: RootState) => state.auth.accessToken
export const selectCurrentActor = (state: RootState) => state.auth.currentActor
export const selectPendingTwoFactorToken = (state: RootState) =>
  state.auth.pendingTwoFactorToken
export const selectHydrationStatus = (state: RootState) =>
  state.auth.hydrationStatus
