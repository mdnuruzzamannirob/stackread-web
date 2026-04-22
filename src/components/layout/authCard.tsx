export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.14),transparent_38%),linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)] px-4 py-10 sm:px-6">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-sky-100/80 bg-white/95 p-6 shadow-[0_24px_70px_-24px_rgba(2,132,199,0.35)] backdrop-blur-sm sm:p-7">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-500 via-cyan-500 to-amber-400" />

        <div className="mb-6 space-y-1">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-sky-700/80">
            Stackread Auth
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm text-gray-600">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  )
}
