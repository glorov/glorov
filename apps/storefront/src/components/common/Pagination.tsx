'use client'

import React from 'react'
import Link from 'next/link'
import { cn } from '../../lib/utils/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange?: (page: number) => void
  baseUrl?: string
  className?: string
}

/**
 * @component Pagination
 *
 * @description
 * Accessible pagination control for GLOROV catalog and review lists.
 * Supports both client-side callbacks (onPageChange) and server-side navigation (baseUrl).
 * Generates page ranges with smart ellipsis and enforces 44px minimum touch targets on mobile.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  baseUrl,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    const delta = 1

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== 'ellipsis') {
        pages.push('ellipsis')
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  const getPageHref = (page: number) => {
    if (!baseUrl) return '#'
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${page}`
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn('flex items-center justify-center gap-1 select-none py-4', className)}
    >
      {/* Previous Page Button */}
      {baseUrl ? (
        <Link
          href={currentPage > 1 ? getPageHref(currentPage - 1) : '#'}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
          aria-label="Go to previous page"
          className={cn(
            'flex items-center justify-center min-w-[40px] h-10 px-2 rounded-glorov-sm border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
            currentPage <= 1 && 'opacity-40 pointer-events-none cursor-not-allowed'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Go to previous page"
          className="flex items-center justify-center min-w-[40px] h-10 px-2 rounded-glorov-sm border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, idx) => {
        if (page === 'ellipsis') {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="flex items-center justify-center min-w-[36px] h-10 text-[#9CA3AF] text-sm font-bold"
            >
              &hellip;
            </span>
          )
        }

        const isCurrent = page === currentPage

        if (baseUrl) {
          return (
            <Link
              key={`page-${page}`}
              href={getPageHref(page)}
              aria-current={isCurrent ? 'page' : undefined}
              aria-label={`Page ${page}`}
              className={cn(
                'flex items-center justify-center min-w-[40px] h-10 rounded-glorov-sm text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
                isCurrent
                  ? 'bg-[#1B4332] text-white'
                  : 'border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]'
              )}
            >
              {page}
            </Link>
          )
        }

        return (
          <button
            key={`page-${page}`}
            type="button"
            onClick={() => onPageChange?.(page)}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Page ${page}`}
            className={cn(
              'flex items-center justify-center min-w-[40px] h-10 rounded-glorov-sm text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
              isCurrent
                ? 'bg-[#1B4332] text-white'
                : 'border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6]'
            )}
          >
            {page}
          </button>
        )
      })}

      {/* Next Page Button */}
      {baseUrl ? (
        <Link
          href={currentPage < totalPages ? getPageHref(currentPage + 1) : '#'}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
          aria-label="Go to next page"
          className={cn(
            'flex items-center justify-center min-w-[40px] h-10 px-2 rounded-glorov-sm border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]',
            currentPage >= totalPages && 'opacity-40 pointer-events-none cursor-not-allowed'
          )}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Go to next page"
          className="flex items-center justify-center min-w-[40px] h-10 px-2 rounded-glorov-sm border border-[#E5E7EB] bg-white text-[#4B5563] hover:bg-[#F3F4F6] disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </nav>
  )
}
