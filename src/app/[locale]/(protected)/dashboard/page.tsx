'use client'

import {
  BookRecommendations,
  ReadingStats,
  RecentActivity,
  TopicsGrid,
} from '@/components/modules/dashboard'
import {
  useGetAuthorsQuery,
  useGetCategoriesQuery,
} from '@/store/features/catalog/catalogApi'
import {
  useGetDashboardRecommendationsQuery,
  useGetDashboardStatsQuery,
  useGetMyLibraryQuery,
} from '@/store/features/dashboard/dashboardApi'
import {
  useGetMySubscriptionQuery,
  useGetPlansQuery,
} from '@/store/features/subscriptions/subscriptionsApi'
import { useParams } from 'next/navigation'
import { useMemo } from 'react'

const formatDateLabel = (value: string | null | undefined, locale: string) => {
  if (!value) {
    return 'Unavailable'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const normalizeStatus = (status: string) => {
  if (!status) {
    return 'Unknown'
  }

  const normalized = status.replace(/[-_]/g, ' ').trim()

  return normalized.charAt(0).toUpperCase() + normalized.slice(1)
}

export default function DashboardPage() {
  const params = useParams<{ locale: string }>()
  const locale = params?.locale ?? 'en'

  const {
    data: statsResponse,
    isLoading: isStatsLoading,
    isError: hasStatsError,
  } = useGetDashboardStatsQuery()

  const {
    data: recommendationsResponse,
    isLoading: isRecommendationsLoading,
    isError: hasRecommendationsError,
  } = useGetDashboardRecommendationsQuery({ limit: 6 })

  const {
    data: libraryResponse,
    isLoading: isLibraryLoading,
    isError: hasLibraryError,
  } = useGetMyLibraryQuery({ page: 1, limit: 6 })

  const {
    data: categoriesResponse,
    isLoading: isCategoriesLoading,
    isError: hasCategoriesError,
  } = useGetCategoriesQuery({ page: 1, limit: 12 })

  const { data: authorsResponse } = useGetAuthorsQuery({ page: 1, limit: 200 })
  const { data: subscriptionResponse } = useGetMySubscriptionQuery()
  const { data: plansResponse } = useGetPlansQuery()

  const stats = statsResponse?.data
  const recommendations = recommendationsResponse?.data ?? []
  const libraryItems = libraryResponse?.data ?? []
  const categories = categoriesResponse?.data

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
        (categories ?? []).map((category) => [category.id, category.name]),
      ),
    [categories],
  )

  const resolveAuthors = (authorIds: string[]) => {
    const names = authorIds
      .map((authorId) => authorNameById.get(authorId))
      .filter(Boolean)

    if (!names.length) {
      return 'Author details unavailable'
    }

    return names.join(', ')
  }

  const recentActivityItems = libraryItems.slice(0, 4).map((item) => ({
    id: item.id,
    bookId: item.id,
    title: item.title,
    author: resolveAuthors(item.authorIds),
    progress: Math.max(0, Math.min(100, item.progress)),
    status: normalizeStatus(item.readingStatus),
    coverUrl: item.coverImage?.url,
  }))

  const recommendationCards = recommendations.slice(0, 6).map((item) => ({
    id: item.id,
    title: item.title,
    author: resolveAuthors(item.authorIds),
    coverUrl: item.coverImage?.url,
    genre:
      item.categoryIds
        .map((categoryId) => categoryNameById.get(categoryId))
        .find(Boolean) ?? 'General',
    rating: item.ratingAverage,
    description:
      item.description ?? item.reason ?? 'Recommended based on your activity.',
  }))

  const topicItems = (categories ?? []).slice(0, 8).map((category) => ({
    id: category.id,
    label: category.name,
  }))

  const currentPlanId =
    stats?.subscriptionStats.currentPlan ??
    subscriptionResponse?.data?.planId ??
    null

  const activePlanName =
    plansResponse?.data?.find((plan) => plan.id === currentPlanId)?.name ??
    (currentPlanId ? 'Active plan' : 'Free plan')

  return (
    <section id="browse" className=" w-full space-y-8">
      <ReadingStats
        locale={locale}
        booksRead={stats?.readingStats.totalBooksRead ?? 0}
        readingNow={stats?.readingStats.booksCurrentlyReading ?? 0}
        wishlistCount={stats?.libraryStats.wishlistCount ?? 0}
        reviewsCount={stats?.libraryStats.totalReviews ?? 0}
        planName={activePlanName}
        daysLeft={Math.max(0, stats?.subscriptionStats.daysRemaining ?? 0)}
        renewalDate={formatDateLabel(
          stats?.subscriptionStats.renewalDate,
          locale,
        )}
        autoRenew={subscriptionResponse?.data?.autoRenew ?? false}
        isLoading={isStatsLoading}
        hasError={hasStatsError}
      />

      <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_250px]">
        <div className="space-y-10">
          <RecentActivity
            locale={locale}
            items={recentActivityItems}
            isLoading={isLibraryLoading}
            hasError={hasLibraryError}
          />
          <BookRecommendations
            locale={locale}
            recommendations={recommendationCards}
            isLoading={isRecommendationsLoading}
            hasError={hasRecommendationsError}
          />
        </div>

        <aside id="notifications" className="space-y-8 pt-1">
          <div className="rounded-2xl border border-transparent bg-transparent px-1 py-1">
            <div className="border-l-4 border-[#a86c4e] pl-4 text-gray-700">
              <p className="text-base leading-8 italic text-gray-700">
                “A reader lives a thousand lives before he dies. The man who
                never reads lives only one.”
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.28em] text-gray-500">
                — George R.R. Martin
              </p>
            </div>
          </div>

          <TopicsGrid
            locale={locale}
            topics={topicItems}
            isLoading={isCategoriesLoading}
            hasError={hasCategoriesError}
          />
        </aside>
      </div>
    </section>
  )
}
