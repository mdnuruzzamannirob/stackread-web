'use client'

import Link from 'next/link'

interface TopicItem {
  id: string
  label: string
}

interface TopicsGridProps {
  locale: string
  topics?: TopicItem[]
  isLoading?: boolean
  hasError?: boolean
}

export function TopicsGrid({
  locale,
  topics = [],
  isLoading = false,
  hasError = false,
}: TopicsGridProps) {
  return (
    <section id="genres" aria-label={`Popular genres in ${locale}`}>
      <h3 className="text-lg font-semibold text-gray-900">Popular Genres</h3>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading genres...</p>
      ) : null}

      {hasError ? (
        <p className="mt-4 text-sm text-red-600">
          Unable to load genres right now.
        </p>
      ) : null}

      {!isLoading && !hasError && !topics.length ? (
        <p className="mt-4 text-sm text-gray-500">
          Genre recommendations will appear soon.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/${locale}/search?q=${encodeURIComponent(topic.label)}`}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:border-primary/25 hover:text-primary"
          >
            {topic.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
