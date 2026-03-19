'use client'

import { BookGrid } from '@/components/features/catalog/BookGrid'
import { Button } from '@/components/ui/button'
import { useGetFeaturedBooksQuery } from '@/store/features/catalog/booksApi'
import { useGetCategoriesQuery } from '@/store/features/catalog/categoriesApi'
import { useGetPlansQuery } from '@/store/features/plans/plansApi'
import { useGetActiveFlashSalesQuery } from '@/store/features/promotions/promotionsApi'
import Link from 'next/link'

export function PublicHomeContent() {
  const { data: featuredData, isLoading: featuredLoading } =
    useGetFeaturedBooksQuery()
  const { data: flashData } = useGetActiveFlashSalesQuery()
  const { data: plansData } = useGetPlansQuery()
  const { data: categoriesData } = useGetCategoriesQuery()

  const featuredBooks = featuredData?.data ?? []
  const flashSales = flashData?.data ?? []
  const plans = plansData?.data ?? []
  const categories = categoriesData?.data ?? []

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-r from-sky-100 via-cyan-50 to-emerald-100 p-8">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-medium uppercase tracking-widest text-sky-800">
            Digital Library Platform
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            Discover, borrow, and read without waiting in line.
          </h1>
          <p className="text-sm text-slate-700">
            Stackread helps readers find the right books fast and gives
            libraries modern discovery, borrowing, and subscription journeys.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/catalogue">
              <Button>Browse catalogue</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">See plans</Button>
            </Link>
          </div>
        </div>
      </section>

      {flashSales.length ? (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-900">
            Active flash sales
          </h2>
          <div className="mt-2 flex flex-wrap gap-2 text-sm">
            {flashSales.map((sale) => (
              <span
                key={sale.id}
                className="rounded-full bg-white px-3 py-1 text-amber-800"
              >
                {sale.name} - {sale.discount}% off
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured books</h2>
          <Link
            href="/catalogue"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <BookGrid
          books={featuredBooks}
          isLoading={featuredLoading}
          emptyMessage="No featured books yet."
        />
      </section>

      <section className="space-y-3 rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold">Plans preview</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {plans.slice(0, 3).map((plan) => (
            <article
              key={plan.id}
              className="rounded-lg border border-border p-4"
            >
              <h3 className="font-semibold">{plan.name}</h3>
              <p className="text-2xl font-semibold">${plan.price}</p>
              <p className="text-sm text-muted-foreground">
                {plan.billingCycle || 'monthly'}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Popular categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 10).map((category) => (
            <Link
              key={category.id}
              href={`/catalogue/categories/${category.id}`}
              className="rounded-full border border-border px-3 py-1 text-sm hover:bg-muted"
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-2xl font-semibold">How it works</h2>
        <ol className="mt-3 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <li>1. Discover books by title, author, or category.</li>
          <li>2. Choose a plan and unlock reading access.</li>
          <li>3. Borrow, reserve, and keep progress synced.</li>
        </ol>
      </section>
    </div>
  )
}
