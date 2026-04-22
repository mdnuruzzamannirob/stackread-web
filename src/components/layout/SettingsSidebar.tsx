'use client'

import { useMeQuery } from '@/store/features/auth/authApi'
import {
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  Mail,
  Shield,
  SlidersHorizontal,
  UserRound,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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

  if (email) {
    return email.charAt(0).toUpperCase()
  }

  return 'U'
}

const SettingsSidebar = ({ locale }: { locale: string }) => {
  const pathname = usePathname()
  const { data: meResponse } = useMeQuery()

  const user = meResponse?.data

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Reader'
  const initials = resolveInitials(user?.firstName, user?.lastName, user?.email)
  const badgeLabel = 'Standard'

  const settingsLinks = [
    {
      label: 'Profile Identity',
      href: 'profile',
      icon: UserRound,
      isDanger: false,
    },
    {
      label: 'Security Protocols',
      href: 'security',
      icon: Shield,
      isDanger: false,
    },
    {
      label: 'Preferences',
      href: 'preferences',
      icon: SlidersHorizontal,
      isDanger: false,
    },
    {
      label: 'Billing',
      href: 'subscription',
      icon: CreditCard,
      isDanger: false,
    },
    {
      label: 'Danger Zone',
      href: 'danger',
      icon: AlertTriangle,
      isDanger: true,
    },
  ]

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="p-4">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-[#111827]">
          {user?.profilePicture ? (
            <Image
              src={user?.profilePicture}
              alt="Profile"
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-white">{initials}</span>
          )}
        </div>

        <div className="mt-4 space-y-1 text-center">
          <p className="text-lg font-semibold text-gray-900">{fullName}</p>
          <p className="mx-auto inline-flex max-w-full items-center gap-1.5 text-xs font-medium text-gray-500">
            <Mail className="size-3.5 shrink-0" />
            <span className="truncate">{user?.email ?? 'No email added'}</span>
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-900">
            <BadgeCheck className="size-3.5" />
            {badgeLabel}
          </span>
        </div>

        <div className="mt-3 rounded-xl border border-gray-200 bg-white px-3 py-2 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
            Subscription
          </p>
          <p className="mt-1 text-sm font-semibold text-gray-800">
            Free member
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200" />

      <nav className="p-2">
        {settingsLinks.map((item) => {
          const Icon = item.icon
          const itemPath = `/${locale}/${item.href}`
          const isActive =
            pathname === itemPath || pathname.startsWith(`${itemPath}/`)

          return (
            <Link
              key={item.href}
              href={itemPath}
              className={`mb-2 flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-semibold transition-colors last:mb-0 ${
                isActive
                  ? item.isDanger
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-teal-600'
                  : item.isDanger
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default SettingsSidebar
