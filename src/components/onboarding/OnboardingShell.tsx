import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type OnboardingShellProps = {
  stepLabel?: string
  progress?: {
    current: number
    total: number
  }
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  centered?: boolean
  className?: string
}

export function OnboardingShell({
  stepLabel,
  progress,
  title,
  subtitle,
  children,
  footer,
  centered = false,
  className,
}: OnboardingShellProps) {
  return (
    <div className="min-h-dvh">
      <div
        className={cn(
          'mx-auto flex min-h-dvh w-full max-w-7xl flex-col justify-center px-4 py-16 sm:px-6',
          className,
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className={cn('space-y-5', centered && 'mx-auto text-center')}>
            {stepLabel ? (
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#0f5560]">
                {stepLabel}
              </p>
            ) : null}
            <div className={cn(centered && 'mx-auto max-w-2xl')}>
              <h1 className="text-3xl font-semibold tracking-tight  sm:text-4xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 max-w-2xl text-gray-500">{subtitle}</p>
              ) : null}
            </div>
          </div>

          {progress ? (
            <div className="flex items-center gap-2 pt-1">
              {Array.from({ length: progress.total }).map((_, index) => {
                const active = index < progress.current
                return (
                  <span
                    key={`progress-${progress.total}-${index}`}
                    className={cn(
                      'h-1 w-8 rounded-full transition-all',
                      active ? ' bg-teal-600' : ' bg-gray-300',
                    )}
                  />
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="my-10">{children}</div>

        {footer ? footer : null}
      </div>
    </div>
  )
}
