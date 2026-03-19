'use client'

import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Toaster } from 'sonner'

import { AuthHydrator } from '@/components/providers/AuthHydrator'
import { ReduxProvider } from '@/components/providers/ReduxProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <NuqsAdapter>
      <ThemeProvider>
        <ReduxProvider>
          <AuthHydrator />

          {children}

          <Toaster
            position="top-center"
            richColors
            expand
            toastOptions={{
              className:
                'rounded-xl border border-border bg-background text-foreground shadow-lg',
            }}
          />
        </ReduxProvider>
      </ThemeProvider>
    </NuqsAdapter>
  )
}
