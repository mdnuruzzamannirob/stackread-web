'use client'

import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

type BookDetailHeaderProps = {
  book: {
    id: string
    title: string
    description?: string
    summary?: string
    coverImageUrl?: string
    language?: string
    pageCount?: number
    ratingAverage?: number
    ratingsCount?: number
    isAvailable?: boolean
    authors?: Array<{ id: string; name: string }>
    categories?: Array<{ id: string; name: string }>
  }
}

export function BookDetailHeader({ book }: BookDetailHeaderProps) {
  const actorType = useAppSelector((state) => state.auth.actorType)
  const onboardingStatus = useAppSelector(
    (state) => state.auth.onboardingStatus,
  )
  const [wishlisted, setWishlisted] = useState(false)

  const hasSubscription =
    actorType === 'user' && onboardingStatus === 'completed'

  return (
    <section className="grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[280px_1fr]">
      <div className="overflow-hidden rounded-lg border border-border">
        <Image
          src={
            book.coverImageUrl ||
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
          }
          alt={book.title}
          width={560}
          height={760}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">{book.title}</h1>
          <p className="text-sm text-muted-foreground">
            {book.authors?.map((author) => author.name).join(', ') ||
              'Unknown author'}
          </p>
          <div className="flex flex-wrap gap-1">
            {book.categories?.map((category) => (
              <span
                key={category.id}
                className="rounded-full bg-secondary px-2 py-1 text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm leading-6 text-muted-foreground">
          {book.description || book.summary || 'No description available.'}
        </p>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Language</dt>
            <dd className="font-medium">{book.language || 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Pages</dt>
            <dd className="font-medium">{book.pageCount ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Rating</dt>
            <dd className="font-medium">
              {(book.ratingAverage ?? 0).toFixed(1)} ({book.ratingsCount ?? 0}{' '}
              reviews)
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Availability</dt>
            <dd className="font-medium">
              {book.isAvailable ? 'Available' : 'Unavailable'}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          {!actorType ? (
            <Link href="/auth/login">
              <Button>Login to read</Button>
            </Link>
          ) : null}

          {actorType === 'user' && !hasSubscription ? (
            <Link href="/pricing">
              <Button>Subscribe</Button>
            </Link>
          ) : null}

          {hasSubscription ? (
            <>
              <Button>Read</Button>
              <Button variant="outline">Borrow</Button>
              <Button variant="outline">Reserve</Button>
            </>
          ) : null}

          {actorType === 'user' ? (
            <Button
              variant={wishlisted ? 'default' : 'outline'}
              onClick={() => setWishlisted((current) => !current)}
            >
              {wishlisted ? 'Wishlisted' : 'Add to wishlist'}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
