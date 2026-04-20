export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_12%_14%,rgba(13,148,136,0.12),transparent_0_32%),linear-gradient(180deg,#ffffff_0%,#f3faf8_100%)] px-4 py-8 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col justify-center">
        <div className="animate-pulse space-y-8 rounded-[2rem] border border-slate-100 bg-white/80 p-6 shadow-[0_24px_60px_-32px_rgba(15,23,42,0.18)] sm:p-8">
          <div className="space-y-4">
            <div className="h-3 w-28 rounded-full bg-slate-100" />
            <div className="h-10 w-4/5 rounded-full bg-slate-100" />
            <div className="h-5 w-full rounded-full bg-slate-100" />
            <div className="h-5 w-5/6 rounded-full bg-slate-100" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`onboarding-loading-${index}`}
                className="h-44 rounded-[1.75rem] bg-slate-100"
              />
            ))}
          </div>

          <div className="h-12 w-40 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  )
}
