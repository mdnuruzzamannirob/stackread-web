'use client'

import useSidebar from '@/hooks/useSidebar'
import {
  dashboardPageSections,
  isDashboardPathActive,
  withLocalePath,
  type DashboardPageNode,
} from '@/lib/dashboard/page-map'
import { LogOut, Settings, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '../Logo'

interface DashboardSidebarProps {
  locale: string
}

export function DashboardSidebar({ locale }: DashboardSidebarProps) {
  const pathname = usePathname()
  const translate = useTranslations()
  const t = useTranslations('dashboard.sidebar')
  const { closeSidebar } = useSidebar()

  const renderNode = (node: DashboardPageNode, depth = 0) => {
    const Icon = node.icon
    const hasChildren = Boolean(node.children?.length)
    const isPathActive = node.path
      ? isDashboardPathActive(pathname, locale, node.path)
      : false
    const hasActiveChild =
      hasChildren &&
      node.children!.some(
        (child) =>
          child.path && isDashboardPathActive(pathname, locale, child.path),
      )
    const isActive = isPathActive || hasActiveChild
    const isPlanned = node.availability === 'planned'

    if (node.path) {
      return (
        <Link
          key={node.id}
          href={withLocalePath(locale, node.path)}
          onClick={closeSidebar}
          className={`flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm font-medium ${
            isActive
              ? 'bg-teal-100 text-teal-600'
              : 'text-gray-500 hover:bg-teal-100 hover:text-teal-600'
          }`}
          style={{ paddingLeft: `${14 + depth * 16}px` }}
        >
          <Icon className="size-4" />
          <span className="truncate">{translate(node.labelKey)}</span>
          {isPlanned ? (
            <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600">
              {t('badges.planned')}
            </span>
          ) : null}
        </Link>
      )
    }

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex items-center gap-3 rounded-lg py-2.5 pr-3 text-sm font-medium ${
            isActive ? 'text-brand-600' : 'text-gray-600'
          }`}
          style={{ paddingLeft: `${14 + depth * 16}px` }}
        >
          <Icon className="size-4" />
          <span className="truncate">{translate(node.labelKey)}</span>
        </div>
        {node.children?.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-6 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <Logo />

        <button
          type="button"
          onClick={closeSidebar}
          className="rounded-xl border border-border bg-background p-2 text-gray-500 transition hover:border-primary/30 hover:text-primary md:hidden"
          aria-label={t('closeSidebar')}
        >
          <X className="size-4" />
        </button>
      </div>
      <nav className="flex flex-col gap-4 overflow-y-auto pr-1">
        {dashboardPageSections.map((section) => (
          <section key={section.id} className="space-y-1.5">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gray-400">
              {translate(section.labelKey)}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => renderNode(item))}
            </div>
          </section>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-lg bg-teal-100 p-4">
          <p className="text-sm font-semibold text-teal-900">
            {t('upgrade.title')}
          </p>
          <p className="mt-1 text-xs leading-5 text-teal-800">
            {t('upgrade.description')}
          </p>
          <Link
            href={`/${locale}/subscription`}
            onClick={closeSidebar}
            className="mt-4 inline-flex rounded-md bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            {t('upgrade.action')}
          </Link>
        </div>

        <div className="space-y-1.5 border-t border-border pt-4">
          <Link
            href={`/${locale}/profile`}
            onClick={closeSidebar}
            className="flex items-center w-full gap-3 rounded-lg px-3 py-2.5 pr-3 text-sm font-medium text-gray-500 duration-150 transition hover:bg-teal-100 hover:text-teal-600"
          >
            <Settings className="size-4" /> <span>{t('items.settings')}</span>
          </Link>
          <Link
            href={`/${locale}/logout`}
            onClick={closeSidebar}
            className="flex items-center w-full gap-3 rounded-lg px-3 py-2.5 pr-3 text-sm font-medium text-gray-500 duration-150 transition hover:bg-red-100 hover:text-red-600"
          >
            <LogOut className="size-4" /> <span>Logout</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
