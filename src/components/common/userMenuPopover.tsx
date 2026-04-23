'use client'

import {
  ChevronDown,
  CreditCard,
  LogOut,
  Shield,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getApiErrorMessage } from '@/lib/api/error-message'
import { clearClientAuthSession } from '@/lib/auth/client-session'
import { useLogoutMutation, useMeQuery } from '@/store/features/auth/authApi'
import { useAppDispatch } from '@/store/hooks'

const resolveInitials = (
  firstName?: string,
  lastName?: string,
  email?: string,
) => {
  const first = firstName?.charAt(0) ?? ''
  const second = lastName?.charAt(0) ?? ''
  const combined = `${first}${second}`.trim().toUpperCase()

  if (combined) {
    return combined
  }

  return (email?.charAt(0) ?? 'U').toUpperCase()
}

type DashboardUserMenuProps = {
  locale: string
}

export function DashboardUserMenu({ locale }: DashboardUserMenuProps) {
  const t = useTranslations('dashboard.userMenu')
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { data: meResponse } = useMeQuery()
  const [logout, { isLoading }] = useLogoutMutation()

  const user = meResponse?.data
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || t('guest')
  const email = user?.email ?? t('noEmail')
  const initials = resolveInitials(user?.firstName, user?.lastName, user?.email)

  const menuLinks = [
    {
      label: t('links.profile'),
      href: `/${locale}/profile`,
      icon: UserRound,
    },
    {
      label: t('links.security'),
      href: `/${locale}/security`,
      icon: Shield,
    },
    {
      label: t('links.preferences'),
      href: `/${locale}/preferences`,
      icon: SlidersHorizontal,
    },
    {
      label: t('links.subscription'),
      href: `/${locale}/subscription`,
      icon: CreditCard,
    },
  ]

  const handleLogout = async () => {
    try {
      await logout()
        .unwrap()
        .catch(() => null)
      toast.success(t('logoutSuccess'))
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('logoutFailed')))
    } finally {
      clearClientAuthSession(dispatch)
      router.replace(`/${locale}/login`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger>
        <button
          type="button"
          className="inline-flex h-10 max-w-56 items-center gap-2 rounded-lg border border-gray-200 bg-white px-1.5 text-left text-gray-500 transition duration-150 hover:border-gray-300 hover:text-inherit"
          aria-label={t('open')}
        >
          <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-sm bg-teal-600 text-xs font-semibold text-white">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={fullName}
                width={28}
                height={28}
                className="size-7 object-cover"
              />
            ) : (
              initials
            )}
          </span>
          <span className="hidden truncate text-sm font-medium md:block">
            {fullName}
          </span>
          <ChevronDown className="size-4 shrink-0 text-gray-500" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-60 p-0" align="end">
        <div className="border-b border-gray-100 flex items-center gap-3 p-3">
          <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-teal-600  font-semibold text-white">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={fullName}
                width={48}
                height={48}
                className="size-12 object-cover"
              />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">
              {fullName}
            </p>
            <p className="truncate text-xs text-gray-500">{email}</p>
          </div>
        </div>

        <div className="px-2">
          {menuLinks.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-teal-100 hover:text-teal-600"
              >
                <Icon className="size-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="border-t border-gray-100 p-2">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogOut className="size-4" />
            <span>{isLoading ? t('loggingOut') : t('logout')}</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
