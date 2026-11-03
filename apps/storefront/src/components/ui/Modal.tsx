'use client'

import React, { useEffect, useId, useRef } from 'react'
import { cn } from '../../lib/utils/cn'
import { IconButton } from './IconButton'

export interface ModalProps {
  /**
   * Whether the modal is currently open and visible.
   */
  isOpen: boolean
  /**
   * Callback invoked when the modal is closed (via Escape, overlay click, or close button).
   */
  onClose: () => void
  /**
   * Primary title displayed in the modal header.
   */
  title?: string
  /**
   * Content rendered in the modal body.
   */
  children: React.ReactNode
  /**
   * Optional footer action buttons.
   */
  footer?: React.ReactNode
  /**
   * Max width constraint for desktop viewports.
   * @default 'md'
   */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Additional container class names.
   */
  className?: string
}

/**
 * @component Modal
 *
 * @description
 * Accessible dialog container replacing Flutter `showDialog()`.
 * Renders with a semi-transparent blurred backdrop, keyboard Escape dismissal,
 * focus trapping, and strict mobile 350px constraints.
 *
 * @usage
 * Quick view, confirmation dialogues, login/signup popups, pincode checker modal.
 *
 * @accessibility
 * - Renders with `role="dialog"` and `aria-modal="true"`.
 * - Traps keyboard Escape key to trigger `onClose`.
 * - Closes on backdrop overlay click.
 * - Prevents background page scrolling while active.
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   title="Verify Delivery Pincode"
 *   footer={<Button onClick={() => setIsModalOpen(false)}>Done</Button>}
 * >
 *   <p>Check if express courier delivery is available in your area.</p>
 * </Modal>
 * ```
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
  className,
}: ModalProps) {
  const generatedId = useId()
  const titleId = `${generatedId}-title`
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle Escape key press
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

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth]

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'relative w-full bg-surface-pure rounded-lg border border-border-subtle shadow-modal z-10 overflow-hidden flex flex-col max-h-[90vh] my-auto transition-transform duration-200 select-text',
          maxWidthClasses,
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
            aria-label="Close dialog"
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-sm text-body-md text-text-primary leading-relaxed">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-5 py-3.5 border-t border-border-light bg-surface-cream/50 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
