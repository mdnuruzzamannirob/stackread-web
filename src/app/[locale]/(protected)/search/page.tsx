'use client'

import { BookOpen, Clock3, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState, type FormEvent } from 'react'

import {
  useGetAuthorsQuery,
  useGetCategoriesQuery,
} from '@/store/features/catalog/catalogApi'
import {
  useGetPopularSearchTermsQuery,
  useGetSearchHistoryQuery,
  useGetSearchSuggestionsQuery,
  useLogSearchClickMutation,
  useSearchBooksQuery,
} from '@/store/features/search/searchApi'

const resolvePublishedLabel = (publishedYear: number | null) => {
  if (!publishedYear) {
    return 'Publication year unavailable'
  }

  return `Published in ${publishedYear}`
}

export default function SearchPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = (searchParams.get('q') ?? '').trim()
  const [searchInput, setSearchInput] = useState(initialQuery)

  const submittedQuery = (searchParams.get('q') ?? '').trim()
  const shouldSearch = submittedQuery.length > 0

  const {
    data: searchResponse,
    isLoading,
    isFetching,
    isError,
  } = useSearchBooksQuery(
    {
      q: submittedQuery,
      page: 1,
      limit: 20,
    },
    {
      skip: !shouldSearch,
    },
  )

  const { data: suggestionsResponse } = useGetSearchSuggestionsQuery(
    {
      q: searchInput,
      limit: 6,
    },
    {
      skip: searchInput.trim().length < 2,
    },
  )

  const { data: popularResponse } = useGetPopularSearchTermsQuery({ limit: 8 })
  const { data: historyResponse } = useGetSearchHistoryQuery({ limit: 8 })
  const { data: authorsResponse } = useGetAuthorsQuery({ page: 1, limit: 200 })
  const { data: categoriesResponse } = useGetCategoriesQuery({
    page: 1,
    limit: 200,
  })

  const [logSearchClick] = useLogSearchClickMutation()

  const searchResults = searchResponse?.data ?? []
  const suggestions = suggestionsResponse?.data ?? []
  const popularTerms = popularResponse?.data ?? []
  const searchHistory = historyResponse?.data ?? []

  const authorNameById = useMemo(
    () =>
      new Map(
        (authorsResponse?.data ?? []).map((author) => [author.id, author.name]),
      ),
    [authorsResponse?.data],
  )

  const categoryNameById = useMemo(
    () =>
      new Map(
        (categoriesResponse?.data ?? []).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [categoriesResponse?.data],
  )

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const query = searchInput.trim()

    if (!query) {
      router.push(`/${locale}/search`)
      return
    }

    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
  }

  const applyQuery = (query: string) => {
    setSearchInput(query)
    router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
  }

  const handleSearchResultClick = (bookId: string) => {
    if (!submittedQuery) {
      return
    }

    void logSearchClick({
      query: submittedQuery,
      bookId,
    })
  }

  return (
    <section className="space-y-8">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <article className="rounded-xl border border-gray-200 bg-white p-6">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Find your next read
          </h1>
          <p className="mt-2 max-w-xl text-sm text-gray-600">
            Search by title, author, category, or mood. Results are powered by
            the same backend discovery endpoints used across StackRead.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <label
              htmlFor="search-query"
              className="flex flex-1 items-center gap-3 rounded-lg border border-gray-200 bg-white px-3"
            >
              <Search className="size-4 text-gray-500" />
              <input
                id="search-query"
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Try: Rabindranath, philosophy, modern poetry"
                className="h-11 w-full border-none bg-transparent text-sm outline-none"
              />
            </label>
            <button
              type="submit"
              className="h-11 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Search
            </button>
          </form>

          {suggestions.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.text}
                  type="button"
                  onClick={() => applyQuery(suggestion.text)}
                  className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-brand-300 hover:text-brand-700"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          ) : null}
        </article>

        <aside className="space-y-4">
          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-brand-600" />
              <p className="text-sm font-semibold text-gray-900">Trending</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularTerms.map((term) => (
                <button
                  key={term.term}
                  type="button"
                  onClick={() => applyQuery(term.term)}
                  className="rounded-full border border-brand-200 bg-brand-100 px-3 py-1.5 text-xs font-medium text-brand-700"
                >
                  {term.term}
                </button>
              ))}
              {!popularTerms.length ? (
                <p className="text-xs text-gray-500">
                  Popular terms are still building up.
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="size-4 text-gray-500" />
              <p className="text-sm font-semibold text-gray-900">Recent</p>
            </div>
            <div className="mt-4 space-y-2">
              {searchHistory.map((item) => (
                <button
                  key={`${item.query}-${item.timestamp ?? 'n/a'}`}
                  type="button"
                  onClick={() => applyQuery(item.query)}
                  className="flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-left text-xs text-gray-600 transition hover:bg-gray-100"
                >
                  <span>{item.query}</span>
                </button>
              ))}
              {!searchHistory.length ? (
                <p className="text-xs text-gray-500">
                  Search history will appear after your first query.
                </p>
              ) : null}
            </div>
          </article>
        </aside>
      </div>

      <article className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {submittedQuery
                ? `Showing matches for "${submittedQuery}".`
                : 'Enter a query to search across the public catalog.'}
            </p>
          </div>
          {isFetching && !isLoading ? (
            <span className="text-xs font-medium text-brand-600">
              Updating...
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <p className="text-sm text-gray-500">Searching books...</p>
        ) : null}

        {isError ? (
          <p className="text-sm text-red-600">
            Unable to search right now. Please try again.
          </p>
        ) : null}

        {!isLoading && shouldSearch && !searchResults.length && !isError ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-5 text-sm text-gray-500">
            No books matched this query. Try a broader title or author name.
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {searchResults.map((book) => {
            const authors = book.authorIds
              .map((authorId) => authorNameById.get(authorId))
              .filter(Boolean)
              .join(', ')
            const categories = book.categoryIds
              .map((categoryId) => categoryNameById.get(categoryId))
              .filter(Boolean)
              .join(', ')

            return (
              <article
                key={book.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {authors || 'Unknown author'}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold text-amber-600">
                    {book.ratingAverage.toFixed(1)}
                    <span>★</span>
                  </span>
                </div>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  {book.description ??
                    'No description available for this title.'}
                </p>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-gray-500">
                  <span className="rounded bg-white px-2 py-1">
                    {resolvePublishedLabel(book.publishedYear)}
                  </span>
                  <span className="rounded bg-white px-2 py-1">
                    {categories || 'Category details unavailable'}
                  </span>
                </div>

                <Link
                  href={`/${locale}/books/${book.id}`}
                  onClick={() => handleSearchResultClick(book.id)}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-800"
                >
                  <BookOpen className="size-4" />
                  Open details
                </Link>
              </article>
            )
          })}
        </div>
      </article>
    </section>
  )
}
