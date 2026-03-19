'use client'

import { Button } from '@/components/ui/button'
import { useAppSelector } from '@/store/hooks'
import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type BookCardProps = {
  book: {
    id: string
    title: string
    coverImageUrl?: string
    authors?: Array<{ id: string; name: string }>
    categories?: Array<{ id: string; name: string }>
    ratingAverage?: number
    isAvailable?: boolean
  }
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.round(rating)
    return (
      <span
        key={index}
        className={filled ? 'text-amber-500' : 'text-muted-foreground'}
      >
        ★
      </span>
    )
  })
}

export function BookCard({ book }: BookCardProps) {
  const actorType = useAppSelector((state) => state.auth.actorType)
  const [wishlisted, setWishlisted] = useState(false)

  const authorLabel = useMemo(
    () =>
      book.authors?.map((author) => author.name).join(', ') || 'Unknown author',
    [book.authors],
  )

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/catalogue/books/${book.id}`} className="block">
        <Image
          src={
            book.coverImageUrl ||
            'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
          }
          alt={book.title}
          width={320}
          height={420}
          className="h-52 w-full object-cover"
        />
      </Link>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="line-clamp-1 font-semibold">{book.title}</h3>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {authorLabel}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {book.categories?.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="rounded-full bg-secondary px-2 py-1 text-xs"
            >
              {category.name}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            {renderStars(book.ratingAverage ?? 0)}
            <span className="text-muted-foreground">
              {(book.ratingAverage ?? 0).toFixed(1)}
            </span>
          </div>
          <span
            className={
              book.isAvailable
                ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700'
                : 'rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700'
            }
          >
            {book.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Link href={`/catalogue/books/${book.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              View details
            </Button>
          </Link>
          {actorType ? (
            <Button
              type="button"
              variant={wishlisted ? 'default' : 'outline'}
              onClick={() => setWishlisted((current) => !current)}
            >
              {wishlisted ? 'Wishlisted' : 'Wishlist'}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  )
}
