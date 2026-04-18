'use client'

import { clearPersistedTempToken } from '@/lib/auth/temp-token'
import { clearSession, persistSession } from '@/lib/auth/token-storage'
import type { AppDispatch } from '@/store'
import {
  clearAuthState,
  clearTempToken,
  setAuthenticatedSession,
} from '@/store/features/auth/authSlice'
import type { UserProfile } from '@/store/features/auth/types'

type ApplySessionPayload = {
  accessToken: string
  refreshToken?: string
  user: UserProfile
}

export function applyAuthenticatedSession(
  dispatch: AppDispatch,
  payload: ApplySessionPayload,
) {
  persistSession({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  })
  clearPersistedTempToken()
  dispatch(clearTempToken())
  dispatch(
    setAuthenticatedSession({
      token: payload.accessToken,
      user: payload.user,
    }),
  )
}

export function clearClientAuthSession(dispatch: AppDispatch) {
  clearSession()
  clearPersistedTempToken()
  dispatch(clearAuthState())
}
