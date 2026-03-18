import type { IStaff, IUser } from '@/types'

export function hasPermission(
  permissions: string[] | Record<string, boolean> | undefined,
  required: string | string[],
): boolean {
  if (!permissions) {
    return false
  }

  const requiredList = Array.isArray(required) ? required : [required]

  if (Array.isArray(permissions)) {
    return requiredList.every((permission) => permissions.includes(permission))
  }

  return requiredList.every((permission) => Boolean(permissions[permission]))
}

export function isUser(
  actor: IUser | IStaff | null | undefined,
): actor is IUser {
  if (!actor) {
    return false
  }

  return 'isEmailVerified' in actor || !('twoFactorEnabled' in actor)
}

export function isStaff(
  actor: IUser | IStaff | null | undefined,
): actor is IStaff {
  if (!actor) {
    return false
  }

  return 'twoFactorEnabled' in actor || 'permissions' in actor
}
