'use client'

import { BookGrid } from '@/components/features/catalog/BookGrid'
import { Button } from '@/components/ui/button'
import {
  useGetPopularTermsQuery,
  useLazyGetSuggestionsQuery,
  useSearchBooksQuery,
} from '@/store/features/search/searchApi'
import { useEffect, useMemo, useState } from 'react'

export function SearchContent() {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')

  const { data: resultsData, isLoading } = useSearchBooksQuery(
    { q: submittedQuery, page: 1, limit: 20 },
    { skip: !submittedQuery.trim() },
  )
  const { data: popularData } = useGetPopularTermsQuery(undefined)
  const [triggerSuggestions, { data: suggestionsData }] =
    useLazyGetSuggestionsQuery()

  const suggestions = suggestionsData?.data ?? []
  const popularTerms = popularData?.data ?? []
  const books = resultsData?.data ?? []

  useEffect(() => {
    if (!query.trim()) {
      return
    }

    const timer = window.setTimeout(() => {
      void triggerSuggestions({ q: query.trim(), limit: 6 }, true)
    }, 250)

    return () => window.clearTimeout(timer)
  }, [query, triggerSuggestions])

  const showSuggestions = useMemo(
    () => query.trim().length > 0 && suggestions.length > 0,
    [query, suggestions.length],
  )

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">Search the catalogue</h1>
        <div className="mt-3 flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 flex-1 rounded-md border border-input bg-background px-3"
            placeholder="Search books, authors, topics..."
          />
          <Button type="button" onClick={() => setSubmittedQuery(query)}>
            Search
          </Button>
        </div>

        {showSuggestions ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  setQuery(suggestion)
                  setSubmittedQuery(suggestion)
                }}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-muted"
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {popularTerms.length ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">Popular search terms</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {popularTerms.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => {
                  setQuery(term)
                  setSubmittedQuery(term)
                }}
                className="rounded-full bg-secondary px-3 py-1 text-xs"
              >
                {term}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <BookGrid
        books={books}
        isLoading={isLoading}
        emptyMessage={
          submittedQuery
            ? 'No results found for this search.'
            : 'Start searching to see results.'
        }
      />
    </div>
  )
}
