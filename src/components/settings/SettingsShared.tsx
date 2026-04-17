'use client'

import { LoaderCircle, ShieldAlert, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export const COUNTRY_OPTIONS = [
  { code: 'BD', name: 'Bangladesh', dial: '+880' },
  { code: 'IN', name: 'India', dial: '+91' },
  { code: 'PK', name: 'Pakistan', dial: '+92' },
  { code: 'NP', name: 'Nepal', dial: '+977' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { code: 'GB', name: 'United Kingdom', dial: '+44' },
  { code: 'US', name: 'United States', dial: '+1' },
  { code: 'CA', name: 'Canada', dial: '+1' },
  { code: 'AU', name: 'Australia', dial: '+61' },
  { code: 'JP', name: 'Japan', dial: '+81' },
  { code: 'SG', name: 'Singapore', dial: '+65' },
]

export type ModalProps = {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

export type ProfileFormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  countryCode: string
  profilePicture: string
  address: string
}

export const createInitialProfileState = (): ProfileFormState => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  countryCode: 'BD',
  profilePicture: '',
  address: '',
})

export const asMoney = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export const bySortOrder = (
  a: { sortOrder: number; price: number },
  b: { sortOrder: number; price: number },
) => {
  if (a.sortOrder !== b.sortOrder) {
    return a.sortOrder - b.sortOrder
  }

  return a.price - b.price
}

export const formatDateLabel = (value?: string | null) => {
  if (!value) {
    return 'Not set'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Not set'
  }

  return parsed.toLocaleDateString()
}

export const formatStateLabel = (value: string) => {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const isValidUrl = (value: string) => {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export const getStatusToneClass = (status: string) => {
  switch (status) {
    case 'active':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
    case 'past_due':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-700'
    case 'pending':
      return 'border-sky-500/30 bg-sky-500/10 text-sky-700'
    case 'expired':
    case 'cancelled':
      return 'border-red-500/30 bg-red-500/10 text-red-700'
    default:
      return 'border-slate-300 bg-slate-100 text-slate-700'
  }
}

export function BusyIcon() {
  return <LoaderCircle className="size-4 animate-spin" />
}

export function SectionTitle({
  tone,
  text,
}: {
  tone: 'brand' | 'danger'
  text: string
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className={`h-1 w-8 rounded-full ${tone === 'danger' ? 'bg-red-600' : 'bg-brand-700'}`}
      />
      <h2
        className={`text-sm font-semibold uppercase tracking-[2.8px] ${tone === 'danger' ? 'text-red-700' : 'text-slate-700'}`}
      >
        {text}
      </h2>
    </div>
  )
}

export function PreferenceToggle({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-brand-700' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      <span className="sr-only">Toggle preference</span>
    </button>
  )
}

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle ? <DialogDescription>{subtitle}</DialogDescription> : null}
        </DialogHeader>
        <div className="px-5 py-4">{children}</div>
      </DialogContent>
    </Dialog>
  )
}

export function SkeletonRow() {
  return <div className="h-11 animate-pulse rounded-md bg-slate-200" />
}

export function StatusIcon({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <ShieldCheck className="size-3.5" />
  ) : (
    <ShieldAlert className="size-3.5" />
  )
}

export function SettingsPageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="space-y-2">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="max-w-3xl text-sm leading-6 text-slate-600">
        {description}
      </p>
    </header>
  )
}

export function SettingsCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <article
      className={cn(
        'rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] sm:p-6',
        className,
      )}
    >
      {children}
    </article>
  )
}
