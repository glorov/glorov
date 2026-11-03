'use client'

import React, { useState, useId } from 'react'
import { cn } from '../../lib/utils/cn'

export interface TooltipProps {
  /**
   * The explanatory tooltip message.
   */
  content: string
  /**
   * Interactive trigger child element that reveals the tooltip.
   */
  children: React.ReactElement<{ 'aria-describedby'?: string }>
  /**
   * Position placement of the tooltip popover.
   * @default 'top'
   */
  position?: 'top' | 'bottom'
}

/**
 * @component Tooltip
 *
 * @description
 * Accessible micro-hint popover displaying secondary contextual descriptions on hover or keyboard focus.
 *
 * @usage
 * Clarifying iconography (e.g. heirloom certification marks, delivery badges, CVV info).
 *
 * @accessibility
 * - Assigns `aria-describedby` matching the tooltip element `id`.
 * - Automatically displays on keyboard focus as well as mouse hover.
 *
 * @example
 * ```tsx
 * <Tooltip content="Heirloom seeds pass through natural open pollination">
 *   <button aria-label="Heirloom info">ℹ️</button>
 * </Tooltip>
 * ```
 */
export function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipId = useId()

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  }[position]

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {React.cloneElement(children, {
        'aria-describedby': isVisible ? tooltipId : undefined,
      })}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className={cn(
            'absolute z-tooltip whitespace-nowrap bg-tag-dark-blue text-white font-sans text-label-sm font-medium px-2.5 py-1 rounded-xs shadow-float pointer-events-none transition-all duration-150 animate-in fade-in',
            positionClasses
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
