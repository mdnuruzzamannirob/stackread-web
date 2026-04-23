'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle({
  ariaLabel = 'Switch theme',
}: {
  ariaLabel?: string
}) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const darkMode = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => setTheme(darkMode ? 'light' : 'dark')}
      className="flex size-10 items-center justify-center rounded-lg font-medium border bg-white border-gray-200 hover:border-gray-300 duration-150 text-gray-500 hover:text-inherit"
    >
      {mounted ? (
        darkMode ? (
          <Sun className="size-4 shrink-0" />
        ) : (
          <Moon className="size-4 shrink-0" />
        )
      ) : (
        <span aria-hidden="true" className="inline-block size-4 shrink-0" />
      )}
    </button>
  )
}
