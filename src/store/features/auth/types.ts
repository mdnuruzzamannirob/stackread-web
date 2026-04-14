export type UserProfile = {
  id: string
  firstName: string
  lastName?: string
  email: string
  countryCode?: string
  phone?: string
  profilePicture?: string
  provider?: 'local' | 'google' | 'facebook'
  isEmailVerified?: boolean
  isSuspended?: boolean
  twoFactorEnabled?: boolean
  notificationPreferences?: {
    email?: boolean
    push?: boolean
  }
  lastLoginAt?: string
  createdAt?: string
  updatedAt?: string
}

export type AuthState = {
  actorType: 'user'
  token: string | null
  user: UserProfile | null
  tempToken: string | null
  requiresTwoFactor: boolean
  onboardingStatus: 'unknown' | 'completed' | 'pending' | 'selected'
  isHydrated: boolean
  twoFactorEnabled: boolean
}

export type LoginSuccessPayload = {
  requiresTwoFactor: false
  accessToken: string
  refreshToken?: string
  user: UserProfile
}

export type LoginTwoFactorPayload = {
  requiresTwoFactor: true
  tempToken: string
}

export type LoginPayload = LoginSuccessPayload | LoginTwoFactorPayload
