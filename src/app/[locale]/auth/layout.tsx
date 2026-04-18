export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.14),transparent_38%),linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-cyan-300/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(2,132,199,0.05)_0%,transparent_34%,rgba(2,132,199,0.04)_100%)]" />

      <div className="relative w-full max-w-md">{children}</div>
    </main>
  )
}
