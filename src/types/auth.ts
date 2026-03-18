export type RolePermissionMap = Record<string, boolean>

export interface IUser {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role?: string
  permissions?: string[]
  isEmailVerified?: boolean
  isOnboardingCompleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface IStaff {
  id: string
  email: string
  name: string
  avatarUrl?: string
  role: string
  permissions: string[]
  twoFactorEnabled?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface UserJwtPayload {
  sub: string
  email: string
  actorType: 'user'
  exp: number
  iat: number
}

export interface StaffJwtPayload {
  sub: string
  email: string
  actorType: 'staff'
  role: string
  permissions: string[]
  exp: number
  iat: number
}
