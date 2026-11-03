import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Orientation of the divider line.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical'
  /**
   * Optional centered label text (e.g. "OR" for auth forms).
   */
  label?: string
}

/**
 * @component Divider
 *
 * @description
 * Visual separator line matching Flutter `DividerThemeData`.
 * Default color is `borderSubtle` (#E5E7EB) with 1px thickness.
 *
 * @usage
 * Separating sections in checkout summaries, list items, or presenting "OR" login dividers.
 *
 * @example
 * ```tsx
 * <Divider label="OR CONTINUE WITH" />
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  label,
  className,
  ...restProps
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px bg-border-subtle self-stretch shrink-0', className)}
        {...restProps}
      />
    )
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn('relative flex items-center justify-center my-4', className)}
        {...restProps}
      >
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border-subtle" />
        </div>
        <span className="relative bg-surface-cream px-3 font-sans text-label-sm uppercase tracking-wider text-text-muted">
          {label}
        </span>
      </div>
    )
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      className={cn('w-full border-t border-border-subtle my-3', className)}
      {...restProps}
    />
  )
}
