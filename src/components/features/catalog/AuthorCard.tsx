import Image from 'next/image'
import Link from 'next/link'

type AuthorCardProps = {
  author: {
    id: string
    name: string
    imageUrl?: string
    bookCount?: number
  }
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <Image
          src={
            author.imageUrl ||
            'https://res.cloudinary.com/demo/image/upload/v1697000000/avatar-placeholder.png'
          }
          alt={author.name}
          width={56}
          height={56}
          className="h-14 w-14 rounded-full object-cover"
        />
        <div>
          <h3 className="font-semibold">{author.name}</h3>
          <p className="text-sm text-muted-foreground">
            {author.bookCount ?? 0} books
          </p>
        </div>
      </div>

      <Link
        href={`/catalogue/authors/${author.id}`}
        className="mt-4 inline-block text-sm text-primary hover:underline"
      >
        View profile
      </Link>
    </article>
  )
}
