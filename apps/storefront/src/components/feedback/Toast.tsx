'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useToast } from '../../context/StorefrontContext'
import type { ToastMessage } from '../../types/storefront'
import { cn } from '../../lib/utils/cn'

/**
 * Material design icon paths matching Flutter Icons:
 * - Icons.check_circle_rounded
 * - Icons.error_rounded
 * - Icons.warning_rounded
 * - Icons.info_rounded
 * - Icons.close_rounded
 */
const ICONS = {
  success: (
    <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.6l-4.2-4.2c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L10.8 13.8l6.79-6.79c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41l-7.5 7.5c-.38.39-1.02.39-1.4 0z" />
    </svg>
  ),
  error: (
    <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" />
    </svg>
  ),
  warning: (
    <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3zM12 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-3V9c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1z" />
    </svg>
  ),
  info: (
    <svg className="w-[15px] h-[15px] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V7h2v2z" />
    </svg>
  ),
  close: (
    <svg className="w-[14px] h-[14px] shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
    </svg>
  ),
}

const TYPE_CONFIG = {
  success: {
    bg: 'bg-[#0A4C36]',
    iconColor: 'text-[#34D399]',
    icon: ICONS.success,
  },
  error: {
    bg: 'bg-[#7F1D1D]',
    iconColor: 'text-[#F87171]',
    icon: ICONS.error,
  },
  warning: {
    bg: 'bg-[#78350F]',
    iconColor: 'text-[#FBBF24]',
    icon: ICONS.warning,
  },
  info: {
    bg: 'bg-[#1E293B]',
    iconColor: 'text-[#60A5FA]',
    icon: ICONS.info,
  },
}

/**
 * Botanical Toast Pill Component
 * 100% pixel-and-behavior matched with Flutter `GlorovFeedback._showBotanicalToast`:
 * - Pill shape with border-radius 24px
 * - Exact colors: #0A4C36 (success), #7F1D1D (error), #78350F (warning), #1E293B (info)
 * - 15px icon + 8px gap + 12px font-semibold text (ellipsis) + 10px gap + action button + 6px gap + 14px close icon
 * - Centered at top (12px top on mobile, 20px top on tablet/desktop)
 * - Spring-smooth entrance and exit transitions
 */
function ToastItem({ toast }: { toast: ToastMessage }) {
  const { dismissToast } = useToast()
  const [isRendered, setIsRendered] = useState(false)
  const isExitingRef = useRef(false)

  const config = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info
  const actionLabel = toast.actionLabel ?? toast.action?.label
  const onAction = toast.onAction ?? toast.action?.onClick

  useEffect(() => {
    // Trigger smooth entrance animation on next frame
    const frame = requestAnimationFrame(() => {
      setIsRendered(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const handleDismiss = () => {
    if (isExitingRef.current) return
    isExitingRef.current = true
    setIsRendered(false)
    setTimeout(() => {
      dismissToast(toast.id)
    }, 200)
  }

  const handleAction = () => {
    handleDismiss()
    if (onAction) {
      onAction()
    }
  }

  const displayMessage = toast.title ? `${toast.title}: ${toast.message}` : toast.message

  return (
    <div
      role="alert"
      className={cn(
        'inline-flex items-center min-w-0 pointer-events-auto',
        'px-[14px] py-[8px] rounded-[24px]',
        'shadow-[0_4px_16px_rgba(0,0,0,0.20)]',
        'border border-white/10 select-none backdrop-blur-md',
        config.bg,
        // Spring slide-down + scale entrance, smooth slide-up exit
        isRendered
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-[0.96]',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]'
      )}
      style={{
        maxWidth: 'min(440px, calc(100vw - 32px))',
      }}
    >
      {/* 1. Leading Status Icon (15px) */}
      <span className={cn('shrink-0 flex items-center justify-center mr-2', config.iconColor)}>
        {config.icon}
      </span>

      {/* 2. Message Text (12px, font-semibold, letter-spacing 0.1px, maxLines 1 with ellipsis) */}
      <span
        title={displayMessage}
        className="text-white text-[12px] font-semibold tracking-[0.1px] leading-tight truncate flex-1 min-w-0 select-none"
      >
        {displayMessage}
      </span>

      {/* 3. Action Button (VIEW BAG / VIEW CART / custom action) */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={handleAction}
          className="ml-[10px] px-[9px] py-[3.5px] rounded-[12px] bg-white/[0.18] hover:bg-white/[0.28] active:bg-white/[0.35] transition-colors shrink-0 text-white text-[11px] font-[800] tracking-[0.3px] uppercase cursor-pointer"
        >
          {actionLabel}
        </button>
      )}

      {/* 4. Trailing Close Button (14px Icons.close_rounded with 2px padding) */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="ml-[6px] p-[2px] rounded-[10px] text-white/70 hover:text-white transition-colors shrink-0 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
      >
        {ICONS.close}
      </button>
    </div>
  )
}

/**
 * Fixed Floating Botanical Toast Container
 * Positioned centered at the top of the viewport matching Flutter `GlorovFeedback`:
 * - top: topPadding + (isMobile ? 12.0 : 20.0)
 * - left: 16.0, right: 16.0
 * - child: Center(child: ...)
 */
export function ToastContainer() {
  const { toasts, activeToast } = useToast()
  const toastToRender = activeToast ?? (toasts && toasts.length > 0 ? toasts[toasts.length - 1] : null)

  if (!toastToRender) return null

  return (
    <div
      className="fixed top-[calc(env(safe-area-inset-top,0px)+12px)] sm:top-5 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      <ToastItem key={toastToRender.id} toast={toastToRender} />
    </div>
  )
}
