export type UserProfile = {
  id: string
  firstName: string
  lastName?: string
  email: string
  address?: string
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

export type UserNotificationPreferences = {
  email?: boolean
  push?: boolean
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

export type AuthTokens = {
  accessToken: string
  refreshToken: string
}

export type RegisterResponse = {
  user: UserProfile
  requiresEmailVerification: true
}

export type LoginSuccessPayload = {
  requiresTwoFactor: false
  accessToken: string
  refreshToken: string
  user: UserProfile
}

export type LoginTwoFactorPayload = {
  requiresTwoFactor: true
  tempToken: string
}

export type LoginPayload = LoginSuccessPayload | LoginTwoFactorPayload

export type UserSessionPayload = {
  accessToken: string
  refreshToken?: string
  user: UserProfile
}

export type TwoFactorSetupPayload = {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export type TwoFactorBackupCodesPayload = {
  remainingBackupCodes: number
}

export type LoginHistoryRow = {
  id: string
  ipAddress?: string
  userAgent?: string
  browser?: string
  device?: string
  location?: string
  status: 'current' | 'successful'
  createdAt: string
}
