import { ThemeToggle } from '@/components/common/ThemeToggle'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <header className="border-b border-border bg-background/80">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center justify-between px-4">
          <p className="text-sm font-semibold">Stackread Auth</p>
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl px-4 py-10">{children}</main>
    </div>
  )
}
