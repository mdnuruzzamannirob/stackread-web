'use client'

import { CheckCircle2, Fingerprint, KeyRound } from 'lucide-react'
import { useState } from 'react'

function SectionTitle({
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
        className={`text-xl font-semibold uppercase tracking-[3px] ${tone === 'danger' ? 'text-red-700' : 'text-slate-700'}`}
      >
        {text}
      </h2>
    </div>
  )
}

function PreferenceToggle({
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

export function ProfileIdentitySection() {
  return (
    <section>
      <SectionTitle tone="brand" text="Profile Identity" />
      <article className="rounded-xl border border-slate-200 bg-[#f9fbfc] p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Full Name
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-lg font-medium text-slate-700 outline-none transition focus:border-brand-400"
              defaultValue="Elena Rodriguez"
            />
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Phone Number
            </span>
            <input
              className="h-11 w-full rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-lg font-medium text-slate-700 outline-none transition focus:border-brand-400"
              defaultValue="+1 (555) 234-8890"
            />
          </label>
        </div>

        <label className="mt-4 block space-y-1.5 text-sm">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Email Address
          </span>
          <input
            className="h-11 w-full rounded-md border border-slate-200 bg-[#eef2f4] px-3 text-lg font-medium text-slate-700 outline-none transition focus:border-brand-400"
            defaultValue="elena.r@editorial.stackread.com"
          />
        </label>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="rounded-md bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_16px_-8px_rgba(4,63,49,0.65)]"
          >
            Save Profile Changes
          </button>
        </div>
      </article>
    </section>
  )
}

export function SecurityProtocolsSection() {
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showTwoFaSetup, setShowTwoFaSetup] = useState(false)

  return (
    <section>
      <SectionTitle tone="brand" text="Security Protocols" />
      <article className="space-y-4 rounded-xl border border-slate-200 bg-[#f9fbfc] p-5 sm:p-6">
        <div className="rounded-md border border-slate-200 bg-[#eef2f4] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#c9dcfb] p-2.5 text-[#305ea8]">
                <KeyRound className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  Password update
                </p>
                <p className="text-sm font-medium text-slate-500">
                  Last changed 4 months ago
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordForm((prev) => !prev)}
              className="self-start rounded-md border border-slate-300 bg-[#f8fafb] px-4 py-1.5 text-xs font-semibold text-brand-700 sm:self-auto"
            >
              {showPasswordForm ? 'Close' : 'Update'}
            </button>
          </div>

          {showPasswordForm ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="password"
                placeholder="Current password"
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-400"
              />
              <input
                type="password"
                placeholder="New password"
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-400"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-brand-400 sm:col-span-2"
              />
              <div className="sm:col-span-2">
                <button
                  type="button"
                  className="rounded-md bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
                >
                  Change Password
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-md border border-slate-200 bg-[#eef2f4] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-[#bfeff4] p-2.5 text-[#1b7f89]">
                <Fingerprint className="size-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-slate-700">
                  2FA setup status
                </p>
                <p className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700">
                  <CheckCircle2 className="size-3.5" />
                  Active and Protected
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTwoFaSetup((prev) => !prev)}
              className="self-start rounded-md border border-slate-300 bg-[#f8fafb] px-4 py-1.5 text-xs font-semibold text-slate-600 sm:self-auto"
            >
              {showTwoFaSetup ? 'Close' : 'Manage'}
            </button>
          </div>

          {showTwoFaSetup ? (
            <div className="mt-4 rounded-md border border-dashed border-brand-300 bg-white p-4">
              <p className="text-sm font-semibold text-slate-700">
                Authenticator App
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Scan your QR code in Google Authenticator or 1Password and use a
                one-time code to verify setup.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md bg-brand-700 px-3 py-2 text-xs font-semibold text-white"
                >
                  Regenerate QR
                </button>
                <button
                  type="button"
                  className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  Verify Code
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </article>
    </section>
  )
}

export function NotificationPreferencesSection() {
  const [emailDigest, setEmailDigest] = useState(true)
  const [pushNotification, setPushNotification] = useState(false)
  const [betaFeatures, setBetaFeatures] = useState(true)

  return (
    <section>
      <SectionTitle tone="brand" text="Preferences" />
      <article className="rounded-xl border border-slate-200 bg-[#f9fbfc] p-5 sm:p-6">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-2xl font-semibold text-slate-700">
                Email digests
              </p>
              <p className="mt-0.5 max-w-xl text-sm font-medium leading-6 text-slate-500">
                Receive weekly curated reports of your reading progress and top
                recommendations.
              </p>
            </div>
            <PreferenceToggle
              checked={emailDigest}
              onToggle={() => setEmailDigest((prev) => !prev)}
            />
          </div>

          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-2xl font-semibold text-slate-700">
                Push notifications
              </p>
              <p className="mt-0.5 max-w-xl text-sm font-medium leading-6 text-slate-500">
                Instant alerts for community highlights and direct curator
                messages.
              </p>
            </div>
            <PreferenceToggle
              checked={pushNotification}
              onToggle={() => setPushNotification((prev) => !prev)}
            />
          </div>

          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-2xl font-semibold text-slate-700">
                Beta features{' '}
                <span className="ml-1 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-500">
                  EXPERIMENTAL
                </span>
              </p>
              <p className="mt-0.5 max-w-xl text-sm font-medium leading-6 text-slate-500">
                Early access to AI-driven summary insights and advanced taxonomy
                tools.
              </p>
            </div>
            <PreferenceToggle
              checked={betaFeatures}
              onToggle={() => setBetaFeatures((prev) => !prev)}
            />
          </div>
        </div>
      </article>
    </section>
  )
}

export function DangerZoneSection() {
  const [confirmText, setConfirmText] = useState('')

  return (
    <section>
      <SectionTitle tone="danger" text="Danger Zone" />
      <article className="rounded-xl border border-red-100 bg-[#fffafb] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-2xl font-semibold text-red-700">
              Delete account
            </p>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
              Permanently delete your profile, library history, and all
              editorial notes. This action is irreversible.
            </p>

            <div className="mt-4 max-w-xs">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type DELETE to confirm
              </label>
              <input
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value)}
                className="mt-1 h-10 w-full rounded-md border border-red-200 bg-white px-3 text-sm outline-none transition focus:border-red-400"
                placeholder="DELETE"
              />
            </div>
          </div>

          <button
            type="button"
            disabled={confirmText !== 'DELETE'}
            className="rounded-md bg-red-700 px-6 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Deactivate My Account
          </button>
        </div>
      </article>
    </section>
  )
}

export function SubscriptionSection() {
  const [annualBilling, setAnnualBilling] = useState(true)

  return (
    <section>
      <SectionTitle tone="brand" text="Subscription" />
      <article className="rounded-xl border border-slate-200 bg-[#f9fbfc] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Current Plan
            </p>
            <h3 className="mt-2 text-3xl font-bold text-slate-800">
              Premium Curator
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Unlimited wishlist, exclusive reports, and priority
              recommendations.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#f3d595] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#7b5312]">
                Active
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                Renews in 21 days
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Billing
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Annual billing
              </span>
              <PreferenceToggle
                checked={annualBilling}
                onToggle={() => setAnnualBilling((prev) => !prev)}
              />
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {annualBilling ? '$96 per year (save 20%)' : '$10 per month'}
            </p>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-md bg-brand-700 px-3 py-2 text-xs font-semibold text-white"
              >
                Manage Payment Method
              </button>
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
              >
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
