'use client'

import { ReduxProvider } from '@/components/providers/ReduxProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'

type ProvidersProps = {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ReduxProvider>{children}</ReduxProvider>
    </ThemeProvider>
  )
}
