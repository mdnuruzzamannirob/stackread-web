export default function AuthLoading() {
  return (
    <main className="relative flex min-h-[calc(100vh-68px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_10%_10%,rgba(34,211,238,0.18),transparent_45%),radial-gradient(circle_at_90%_0%,rgba(245,158,11,0.14),transparent_38%),linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)] px-4 py-10 sm:px-6">
      <div className="w-full max-w-md animate-pulse space-y-3 rounded-3xl border border-sky-100/80 bg-white/95 p-6 shadow-[0_24px_70px_-24px_rgba(2,132,199,0.35)]">
        <div className="h-1 w-full rounded-full bg-sky-200" />
        <div className="h-5 w-2/5 rounded bg-slate-200" />
        <div className="h-4 w-4/5 rounded bg-slate-200" />
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-10 rounded-lg bg-slate-200" />
        <div className="h-10 rounded-lg bg-slate-200" />
      </div>
    </main>
  )
}
