'use client'

import {
  AlertTriangle,
  BadgeCheck,
  Plus,
  Shield,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SettingsShellProps = {
  locale: string
  children: React.ReactNode
}

const settingsLinks = [
  {
    label: 'Profile Identity',
    href: 'profile',
    icon: User,
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
    label: 'Danger Zone',
    href: 'danger',
    icon: AlertTriangle,
    isDanger: true,
  },
]

export function SettingsShell({ locale, children }: SettingsShellProps) {
  const pathname = usePathname()

  return (
    <div className="mx-auto w-full max-w-7xl">
      <h1 className="text-3xl font-bold text-brand-700">Account Settings</h1>
      <p className="mt-2 text-sm text-slate-500">
        Manage your editorial identity and digital curator preferences.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[290px,1fr] xl:gap-8">
        <aside className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-2xl border border-slate-200 bg-linear-to-br from-slate-100 to-slate-200">
              <span className="text-3xl font-bold text-slate-600">ER</span>
            </div>

            <div className="mt-4 text-center">
              <p className="text-2xl font-semibold text-slate-900">
                Elena Rodriguez
              </p>
              <p className="text-sm text-slate-500">
                Senior Curator / Premium Member
              </p>
            </div>

            <div className="mt-3 flex justify-center">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                <BadgeCheck className="size-3.5" />
                Premium
              </span>
            </div>
          </div>

          <nav className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {settingsLinks.map((item) => {
              const Icon = item.icon
              const itemPath = `/${locale}/${item.href}`
              const isActive = pathname === itemPath

              return (
                <Link
                  key={item.href}
                  href={itemPath}
                  className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? item.isDanger
                        ? 'bg-red-50 text-red-700'
                        : 'bg-brand-50 text-brand-700'
                      : item.isDanger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-md transition hover:bg-brand-800"
          >
            <Plus className="size-4" />
            Add New Book
          </button>
        </aside>

        <section className="space-y-7">{children}</section>
      </div>
    </div>
  )
}
