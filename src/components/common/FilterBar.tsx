'use client'

import { useQueryState } from 'nuqs'

type FilterBarProps = {
  categories?: Array<{ id: string; name: string }>
  authors?: Array<{ id: string; name: string }>
}

export function FilterBar({ categories = [], authors = [] }: FilterBarProps) {
  const [search, setSearch] = useQueryState('search', { defaultValue: '' })
  const [category, setCategory] = useQueryState('category', {
    defaultValue: '',
  })
  const [author, setAuthor] = useQueryState('author', { defaultValue: '' })
  const [sort, setSort] = useQueryState('sort', { defaultValue: 'createdAt' })
  const [order, setOrder] = useQueryState('order', { defaultValue: 'desc' })

  return (
    <div className="grid gap-3 rounded-xl border border-border bg-card p-4 md:grid-cols-2 lg:grid-cols-5">
      <label className="space-y-1 text-sm lg:col-span-2">
        <span>Search</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value || null)}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
          placeholder="Search books"
        />
      </label>

      <label className="space-y-1 text-sm">
        <span>Category</span>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value || null)}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span>Author</span>
        <select
          value={author}
          onChange={(event) => setAuthor(event.target.value || null)}
          className="h-10 w-full rounded-md border border-input bg-background px-3"
        >
          <option value="">All authors</option>
          {authors.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 text-sm">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value || null)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
          >
            <option value="createdAt">Newest</option>
            <option value="title">Title</option>
            <option value="ratingAverage">Rating</option>
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span>Order</span>
          <select
            value={order}
            onChange={(event) => setOrder(event.target.value || null)}
            className="h-10 w-full rounded-md border border-input bg-background px-3"
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
      </div>
    </div>
  )
}
