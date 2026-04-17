import {
  AlertTriangle,
  BadgeCheck,
  CreditCard,
  Pencil,
  Shield,
  SlidersHorizontal,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const SettingsSidebar = ({ locale }: { locale: string }) => {
  const pathname = usePathname()

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
      label: 'Subscription',
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
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-[#f5f8fa] p-5">
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-[#111827]">
          <span className="text-4xl font-bold text-white">ER</span>
          <button
            type="button"
            aria-label="Edit profile"
            className="absolute bottom-1 right-1 rounded-full bg-brand-700 p-1.5 text-white"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-2xl font-semibold text-slate-800">
            Elena Rodriguez
          </p>
          <p className="text-sm font-medium text-slate-500">
            Senior Curator / Premium Member
          </p>
        </div>

        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#f3d595] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7b5312]">
            <BadgeCheck className="size-3" />
            Premium
          </span>
        </div>
      </div>
      <nav className="rounded-xl border border-slate-200 bg-[#f5f8fa] p-2">
        {settingsLinks.map((item) => {
          const Icon = item.icon
          const itemPath = `/${locale}/${item.href}`
          const isActive =
            pathname === itemPath || pathname.startsWith(`${itemPath}/`)

          return (
            <Link
              key={item.href}
              href={itemPath}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? item.isDanger
                    ? 'bg-[#ffecec] text-red-700'
                    : 'bg-white text-brand-700'
                  : item.isDanger
                    ? 'text-red-600 hover:bg-[#ffecec]'
                    : 'text-slate-600 hover:bg-white'
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
