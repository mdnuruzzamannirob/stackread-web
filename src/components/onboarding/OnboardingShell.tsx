import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type OnboardingShellProps = {
  stepLabel?: string
  progress?: number
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  centered?: boolean
  className?: string
}

export function OnboardingShell({
  stepLabel,
  progress = 1,
  title,
  subtitle,
  children,
  className,
}: OnboardingShellProps) {
  return (
    <div className="min-h-dvh">
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-center space-y-10 px-4 py-16 sm:px-6',
          className,
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
            {stepLabel}
          </p>

          <div className="flex items-center gap-2 pt-1">
            {Array.from({ length: 6 }).map((_, index) => {
              const active = index < progress
              return (
                <span
                  key={`progress-${6}-${index}`}
                  className={cn(
                    'h-1 w-8 rounded-full transition-all',
                    active ? ' bg-teal-600' : ' bg-gray-300',
                  )}
                />
              )
            })}
          </div>
        </div>
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto justify-center">
          <h1 className="text-3xl font-semibold tracking-tight  sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4  text-gray-500">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  )
}
