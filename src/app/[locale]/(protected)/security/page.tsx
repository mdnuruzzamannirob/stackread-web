'use client'

import { Fingerprint, KeyRound } from 'lucide-react'

import { SettingsShell } from '@/components/settings/settings-shell'

export default function SecurityPage({
  params,
}: {
  params: { locale: string }
}) {
  return (
    <SettingsShell locale={params.locale}>
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-brand-700" />
          <h2 className="text-xl font-semibold uppercase tracking-[2px] text-slate-800">
            Security Protocols
          </h2>
        </div>

        <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5 text-blue-700">
                <KeyRound className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Password update
                </p>
                <p className="text-xs text-slate-500">
                  Last changed 4 months ago
                </p>
              </div>
            </div>
            <button
              type="button"
              className="self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:self-auto"
            >
              Update
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-cyan-100 p-2.5 text-cyan-700">
                <Fingerprint className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  2FA setup status
                </p>
                <p className="text-xs text-teal-700">Active and Protected</p>
              </div>
            </div>
            <button
              type="button"
              className="self-start rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 sm:self-auto"
            >
              Manage
            </button>
          </div>
        </article>
      </section>
    </SettingsShell>
  )
}
