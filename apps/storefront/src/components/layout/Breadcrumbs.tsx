'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { BreadcrumbItem } from '../../types/storefront'
import { PageContainer } from './PageContainer'
import { cn } from '../../lib/utils/cn'

export interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  showBackButton?: boolean
  backFallbackHref?: string
  className?: string
  showShareButton?: boolean
  onShare?: () => void
  rightContent?: React.ReactNode
}

/**
 * @component Breadcrumbs
 *
 * @description
 * GLOROV Storefront Breadcrumbs navigation bar migrated directly from Flutter screens.
 * Features:
 * - Back button with chevron arrow (`router.back()` or fallback link).
 * - Pipe separator `|`.
 * - Trail items with slash `/` separators.
 * - Current leaf item highlighted in primary high-contrast text.
 * - Social share pill `[ ➦ Share ]` with quick clipboard copy.
 * - Strict 350px-first overflow containment (horizontal scroll with scrollbar hidden).
 */
export function Breadcrumbs({
  items,
  showBackButton = true,
  backFallbackHref = '/',
  className,
  showShareButton = false,
  onShare,
  rightContent,
}: BreadcrumbsProps) {
  const router = useRouter()
  const [copied, setCopied] = React.useState(false)

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(backFallbackHref)
    }
  }

  const handleShare = async () => {
    if (onShare) {
      onShare()
      return
    }
    if (typeof window === 'undefined') return
    const shareUrl = window.location.href
    const currentTitle = items[items.length - 1]?.label || document.title
    const shareData = {
      title: `${currentTitle} | GLOROV`,
      text: `Discover ${currentTitle} on GLOROV:`,
      url: shareUrl,
    }

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <nav
      aria-label="Breadcrumbs"
      className={cn('w-full bg-[#F9FAF8] border-b border-[#E5E7EB] py-2 overflow-x-auto scrollbar-none no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden', className)}
    >
      <PageContainer className="flex items-center justify-between gap-2 text-xs text-[#6B7280] min-w-max select-none">
        <div className="flex items-center gap-2">
          {/* Back Button matching Flutter _buildBreadcrumbs */}
          {showBackButton && (
            <>
              <button
                type="button"
                onClick={handleBack}
                aria-label="Navigate back"
                className="flex items-center gap-1 font-semibold text-[#1B4332] hover:text-[#143427] active:scale-95 transition-transform"
              >
                <svg className="w-3 h-3 text-[#1B4332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back</span>
              </button>
              <span className="text-[#D1D5DB] px-0.5 select-none" aria-hidden="true">
                |
              </span>
            </>
          )}

          {/* Trail Items */}
          <ol className="flex items-center gap-2 list-none p-0 m-0">
            {items.map((item, index) => {
              const isLast = index === items.length - 1

              return (
                <li key={`bc-${index}`} className="flex items-center gap-2">
                  {index > 0 && (
                    <span className="text-[#9CA3AF] text-[11px] select-none" aria-hidden="true">
                      /
                    </span>
                  )}

                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="text-[#6B7280] hover:text-[#1B4332] transition-colors hover:underline"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={cn(
                        'max-w-[160px] sm:max-w-[280px] truncate',
                        isLast ? 'text-[#1B4332] font-bold' : 'text-[#6B7280]'
                      )}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>

          {/* Inline 1-Tap Share Button matching Flutter breadcrumb bar */}
          {showShareButton && (
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded-[6px] bg-[#E8F5E9] border border-[#C8E6C9] text-[11.5px] font-semibold text-[#1B4332] hover:bg-[#D8F3DC] active:scale-95 transition cursor-pointer"
              aria-label="Share product"
            >
              <svg className="w-3.5 h-3.5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          )}
        </div>

        {rightContent}
      </PageContainer>
    </nav>
  )
}
