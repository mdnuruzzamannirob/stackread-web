export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-md animate-pulse space-y-3 rounded-xl border border-border bg-card p-6">
        <div className="h-6 w-2/3 rounded bg-muted" />
        <div className="h-4 w-5/6 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
        <div className="h-20 rounded bg-muted" />
      </div>
    </div>
  )
}
