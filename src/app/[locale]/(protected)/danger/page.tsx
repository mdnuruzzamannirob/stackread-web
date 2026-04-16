'use client'

import { SettingsShell } from '@/components/settings/settings-shell'

export default function DangerPage({ params }: { params: { locale: string } }) {
  return (
    <SettingsShell locale={params.locale}>
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-1.5 w-10 rounded-full bg-red-600" />
          <h2 className="text-xl font-semibold uppercase tracking-[2px] text-red-700">
            Danger Zone
          </h2>
        </div>

        <article className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-lg font-semibold text-red-700">
                Delete account
              </p>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">
                Permanently delete your profile, library history, and all
                editorial notes. This action is irreversible.
              </p>
            </div>

            <button
              type="button"
              className="rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-red-800"
            >
              Deactivate My Account
            </button>
          </div>
        </article>
      </section>
    </SettingsShell>
  )
}
