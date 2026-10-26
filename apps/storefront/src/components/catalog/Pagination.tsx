'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | undefined>
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, val]) => {
      if (val && key !== 'page') params.set(key, val)
    })
    if (page > 1) {
      params.set('page', page.toString())
    }
    const query = params.toString()
    return query ? `${baseUrl}?${query}` : baseUrl
  }

  const pages: (number | string)[] = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - 1 && i <= currentPage + 1)
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-center gap-2 py-8"
    >
      {/* Prev */}
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
      >
        <Link
          href={buildPageUrl(currentPage - 1)}
          aria-label="Previous Page"
          aria-disabled={currentPage <= 1 ? 'true' : undefined}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Previous</span>
        </Link>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-xs text-muted-foreground">
                ...
              </span>
            )
          }

          const pageNum = p as number
          const isCurrent = pageNum === currentPage

          return (
            <Button
              key={pageNum}
              asChild
              variant={isCurrent ? 'botanical' : 'ghost'}
              size="sm"
              className={`h-9 w-9 p-0 text-xs font-semibold ${
                isCurrent ? 'pointer-events-none' : ''
              }`}
            >
              <Link
                href={buildPageUrl(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {pageNum}
              </Link>
            </Button>
          )
        })}
      </div>

      {/* Next */}
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
      >
        <Link
          href={buildPageUrl(currentPage + 1)}
          aria-label="Next Page"
          aria-disabled={currentPage >= totalPages ? 'true' : undefined}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Link>
      </Button>
    </nav>
  )
}
