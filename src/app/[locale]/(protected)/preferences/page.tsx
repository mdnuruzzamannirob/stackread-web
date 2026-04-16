'use client'

import { useState } from 'react'

import { SettingsShell } from '@/components/settings/settings-shell'

function Toggle({
  checked,
  onClick,
}: {
  checked: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
        checked ? 'bg-brand-700' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function PreferencesPage({
  params,
}: {
  params: { locale: string }
}) {
  const [emailDigests, setEmailDigests] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(false)
  const [betaFeatures, setBetaFeatures] = useState(true)

  return (
    <SettingsShell locale={params.locale}>
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-brand-700" />
          <h2 className="text-xl font-semibold uppercase tracking-[2px] text-slate-800">
            Preferences
          </h2>
        </div>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Email digests
                </p>
                <p className="text-xs text-slate-500">
                  Receive weekly curated reports of your reading progress and
                  top recommendations.
                </p>
              </div>
              <Toggle
                checked={emailDigests}
                onClick={() => setEmailDigests((value) => !value)}
              />
            </div>

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Push notifications
                </p>
                <p className="text-xs text-slate-500">
                  Instant alerts for community highlights and direct curator
                  messages.
                </p>
              </div>
              <Toggle
                checked={pushNotifications}
                onClick={() => setPushNotifications((value) => !value)}
              />
            </div>

            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Beta features{' '}
                  <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px]">
                    EXPERIMENTAL
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Early access to AI-driven summary insights and advanced
                  taxonomy tools.
                </p>
              </div>
              <Toggle
                checked={betaFeatures}
                onClick={() => setBetaFeatures((value) => !value)}
              />
            </div>
          </div>
        </article>
      </section>
    </SettingsShell>
  )
}
