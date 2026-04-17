import SettingsShell from '@/components/layout/SettingsShell'

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return <SettingsShell locale={locale}>{children}</SettingsShell>
}
