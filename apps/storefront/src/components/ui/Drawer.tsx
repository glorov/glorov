'use client'

import React, { useEffect, useId } from 'react'
import { cn } from '../../lib/utils/cn'
import { IconButton } from './IconButton'
import type { DrawerPlacement } from '../../types/ui'

export interface DrawerProps {
  /**
   * Whether the drawer is open.
   */
  isOpen: boolean
  /**
   * Callback invoked when closing the drawer.
   */
  onClose: () => void
  /**
   * Side or edge from which the drawer slides into view.
   * @default 'left'
   */
  placement?: DrawerPlacement
  /**
   * Header title text or element.
   */
  title?: React.ReactNode
  /**
   * Content inside the drawer.
   */
  children: React.ReactNode
  /**
   * Optional footer action slot.
   */
  footer?: React.ReactNode
  /**
   * Additional container class names.
   */
  className?: string
}

/**
 * @component Drawer
 *
 * @description
 * Slide-out panel container matching Flutter `GlorovDrawer` and `customModalBottomSheet`.
 * Slides in smoothly from left, right, or bottom with a dark blurred backdrop.
 *
 * @usage
 * Mobile site navigation drawer, catalog filter drawer on tablets/mobiles, quick cart review.
 *
 * @accessibility
 * - Traps Escape key to dismiss.
 * - Prevents background body scrolling while active.
 * - Minimum 44px close button.
 *
 * @example
 * ```tsx
 * <Drawer
 *   isOpen={isNavOpen}
 *   onClose={() => setIsNavOpen(false)}
 *   placement="left"
 *   title="Menu"
 * >
 *   <NavLinks />
 * </Drawer>
 * ```
 */
export function Drawer({
  isOpen,
  onClose,
  placement = 'left',
  title,
  children,
  footer,
  className,
}: DrawerProps) {
  const generatedId = useId()
  const titleId = `${generatedId}-drawer-title`

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    // Prevent document body and inner page container scrolling
    const scrollEl = document.getElementById('glorov-page-scroll')
    const originalBodyOverflow = document.body.style.overflow
    const originalContainerOverflow = scrollEl ? scrollEl.style.overflow : ''

    document.body.style.overflow = 'hidden'
    if (scrollEl) {
      scrollEl.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = originalBodyOverflow
      if (scrollEl) {
        scrollEl.style.overflow = originalContainerOverflow
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const placementClasses = {
    left: 'left-0 top-0 bottom-0 h-full w-[85vw] max-w-[320px] sm:max-w-[360px] border-r border-border-subtle animate-slide-left',
    right: 'right-0 top-0 bottom-0 h-full w-[85vw] max-w-[360px] sm:max-w-[420px] border-l border-border-subtle animate-slide-right',
    bottom: 'bottom-0 left-0 right-0 max-h-[85vh] w-full rounded-t-xl border-t border-border-subtle animate-slide-up',
  }[placement]

  return (
    <div role="presentation" className="fixed inset-0 z-drawer">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'fixed bg-surface-pure shadow-modal flex flex-col z-10 overflow-hidden select-text',
          placementClasses,
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-light bg-surface-pure shrink-0">
          {title ? (
            <h3 id={titleId} className="font-serif text-title-lg font-bold text-text-primary truncate">
              {title}
            </h3>
          ) : (
            <div />
          )}

          <IconButton
            aria-label="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto scrollbar-sm p-5 text-body-md text-text-primary">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="p-4 border-t border-border-light bg-surface-cream/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
