'use client'

import { useMemo, useState } from 'react'

type CategoryNode = {
  id: string
  name: string
  bookCount?: number
  children?: CategoryNode[]
}

type CategoryTreeProps = {
  categories: CategoryNode[]
  onSelect?: (categoryId: string) => void
}

function TreeNode({
  node,
  depth,
  onSelect,
}: {
  node: CategoryNode
  depth: number
  onSelect?: (categoryId: string) => void
}) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = Boolean(node.children?.length)

  return (
    <li className="space-y-2">
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
        <button
          type="button"
          className="flex-1 text-left font-medium"
          onClick={() => onSelect?.(node.id)}
        >
          {node.name}
        </button>
        <span className="text-xs text-muted-foreground">
          {node.bookCount ?? 0}
        </span>
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="text-xs text-primary"
          >
            {expanded ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </div>

      {hasChildren && expanded ? (
        <ul className="space-y-2 pl-4">
          {node.children?.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export function CategoryTree({ categories, onSelect }: CategoryTreeProps) {
  const safeCategories = useMemo(() => categories || [], [categories])

  if (!safeCategories.length) {
    return (
      <div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
        No categories found.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {safeCategories.map((category) => (
        <TreeNode
          key={category.id}
          node={category}
          depth={0}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
