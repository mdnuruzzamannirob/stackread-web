'use client'

import { SettingsShell } from '@/components/settings/settings-shell'

export default function ProfilePage({
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
            Profile Identity
          </h2>
        </div>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="font-medium uppercase tracking-wide text-slate-500">
                Full Name
              </span>
              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-700"
                defaultValue="Elena Rodriguez"
              />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="font-medium uppercase tracking-wide text-slate-500">
                Phone Number
              </span>
              <input
                className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-700"
                defaultValue="+1 (555) 234-8890"
              />
            </label>
          </div>

          <label className="mt-4 block space-y-1.5 text-sm">
            <span className="font-medium uppercase tracking-wide text-slate-500">
              Email Address
            </span>
            <input
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-700"
              defaultValue="elena.r@editorial.stackread.com"
            />
          </label>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-lg bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-brand-800"
            >
              Save Profile Changes
            </button>
          </div>
        </article>
      </section>
    </SettingsShell>
  )
}
