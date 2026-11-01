'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

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
      className={styles.paginationNav}
    >
      {/* Prev */}
      <Link
        href={buildPageUrl(currentPage - 1)}
        aria-label="Previous Page"
        aria-disabled={currentPage <= 1 ? 'true' : undefined}
        tabIndex={currentPage <= 1 ? -1 : undefined}
        className={`${styles.navButton} ${currentPage <= 1 ? styles.disabled : ''}`}
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </Link>

      {/* Page Numbers */}
      <div className={styles.pageList}>
        {pages.map((p, idx) => {
          if (p === '...') {
            return (
              <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
                ...
              </span>
            )
          }

          const pageNum = p as number
          const isCurrent = pageNum === currentPage

          return (
            <Link
              key={pageNum}
              href={buildPageUrl(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={isCurrent ? 'page' : undefined}
              className={`${styles.pageNumber} ${isCurrent ? styles.currentPage : ''}`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next */}
      <Link
        href={buildPageUrl(currentPage + 1)}
        aria-label="Next Page"
        aria-disabled={currentPage >= totalPages ? 'true' : undefined}
        tabIndex={currentPage >= totalPages ? -1 : undefined}
        className={`${styles.navButton} ${currentPage >= totalPages ? styles.disabled : ''}`}
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </Link>
    </nav>
  )
}
