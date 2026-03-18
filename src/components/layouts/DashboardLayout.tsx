import { ThemeToggle } from '@/components/common/ThemeToggle'

type DashboardLayoutProps = {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4">
          <p className="text-sm font-semibold">Stackread Dashboard</p>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8">{children}</main>
    </div>
  )
}
