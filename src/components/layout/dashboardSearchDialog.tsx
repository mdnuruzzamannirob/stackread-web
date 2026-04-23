'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'

export function DashboardSearchDialog({ locale }: { locale: string }) {
  const router = useRouter()
  const t = useTranslations('dashboard.header')
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleShortcut)

    return () => {
      window.removeEventListener('keydown', handleShortcut)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    return () => cancelAnimationFrame(frame)
  }, [open])

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchTerm.trim()

    setOpen(false)

    if (!query) {
      router.push(`/${locale}/search`)
      return
    }

    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 transition duration-150 hover:text-inherit lg:hidden"
        aria-label={t('searchPlaceholder')}
      >
        <Search className="size-4 shrink-0" />
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3 h-10 focus-within:border-gray-300 hover:border-gray-300 text-gray-500 lg:flex"
        aria-label={t('searchPlaceholder')}
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 truncate text-sm">
          {t('searchPlaceholder')}
        </span>
        <span className="rounded bg-gray-100 px-1 py-0.5 text-xs font-medium text-gray-500">
          {t('searchShortcut')}
        </span>
      </button>

      <DialogPortal>
        <DialogOverlay className="bg-black/10 backdrop-blur-xs" />{' '}
        <DialogContent className="w-[min(92vw,32rem)]  border-gray-200 bg-white p-0 top-10 md:top-20 translate-y-0">
          <DialogHeader className="border-b border-gray-100 px-5 py-4">
            <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
              <Search className="size-4 text-gray-500" />
              {t('titles.search')}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4 px-5 py-5" onSubmit={handleSearchSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-gray-700">
                {t('searchPlaceholder')}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t('searchPlaceholder')}
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
              />
            </label>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                {t('searchShortcut')} · {t('searchPlaceholder')}
              </p>
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                {t('titles.search')}
              </button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
