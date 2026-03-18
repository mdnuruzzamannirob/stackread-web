type ReaderLayoutProps = {
  children: React.ReactNode
}

export function ReaderLayout({ children }: ReaderLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">{children}</div>
  )
}
