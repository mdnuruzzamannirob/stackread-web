import type { IStaff, IUser } from '@/types'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type ActorType = 'user' | 'staff' | null
type AuthHydrationStatus = 'idle' | 'hydrating' | 'hydrated'
type OnboardingStatus = 'unknown' | 'required' | 'completed'

export type AuthState = {
  actorType: ActorType
  accessToken: string | null
  currentActor: IUser | IStaff | null
  roles: string[]
  permissionMap: Record<string, boolean>
  onboardingStatus: OnboardingStatus
  hydrationStatus: AuthHydrationStatus
}

const initialState: AuthState = {
  actorType: null,
  accessToken: null,
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
  setCurrentActor,
  setRoles,
  setPermissionMap,
  setOnboardingStatus,
  setHydrationStatus,
  resetAuthState,
} = authSlice.actions

export const authReducer = authSlice.reducer
