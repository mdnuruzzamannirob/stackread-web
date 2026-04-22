'use client'

import SettingsSidebar from './SettingsSidebar'

type SettingsShellProps = {
  locale: string
  children: React.ReactNode
}

const SettingsShell = ({ locale, children }: SettingsShellProps) => {
  return (
    <div className=" w-full">
      <header className="mb-6 space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-brand-700 sm:text-4xl">
          Account Settings
        </h1>
        <p className="text-sm font-medium text-gray-500">
          Manage your editorial identity and digital curator preferences.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
        <aside className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
          <SettingsSidebar locale={locale} />
        </aside>
        <main className="min-h-[60vh] lg:col-span-8 xl:col-span-9">
          {children}
        </main>
      </div>
    </div>
  )
}

export default SettingsShell
