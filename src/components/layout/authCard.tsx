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
    <div className="relative w-full overflow-hidden rounded-3xl border border-sky-100/80 bg-white/95 p-6 shadow-[0_24px_70px_-24px_rgba(2,132,199,0.35)] backdrop-blur-sm sm:p-7">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-sky-500 via-cyan-500 to-amber-400" />

      <div className="mb-6 space-y-1">
        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.26em] text-sky-700/80">
          Stackread Auth
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle ? <p className="text-sm text-slate-600">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  )
}
