import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Shape variant of the skeleton.
   * @default 'rectangular'
   */
  variant?: 'rectangular' | 'circular' | 'text' | 'card'
  /**
   * Custom width style (e.g. "100%", "200px", "4rem").
   */
  width?: string | number
  /**
   * Custom height style (e.g. "20px", "12rem").
   */
  height?: string | number
}

/**
 * @component Skeleton
 *
 * @description
 * Shimmering placeholder component used during asynchronous content loading.
 * Replaces Flutter shimmer widgets (`GlorovHeroBannerSliderSkeleton`, product card skeletons).
 *
 * @accessibility
 * Rendered with `aria-hidden="true"` to prevent screen readers from reading empty layout blocks.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" width="60%" height="20px" />
 * <Skeleton variant="card" width="100%" height="280px" />
 * ```
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className,
  style,
  ...restProps
}: SkeletonProps) {
  const variantClasses = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-xs h-4 my-1',
    card: 'rounded-md border border-border-subtle min-h-[220px]',
  }[variant]

  const customStyles: React.CSSProperties = {
    ...style,
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  }

  return (
    <div
      aria-hidden="true"
      className={cn('skeleton w-full select-none', variantClasses, className)}
      style={customStyles}
      {...restProps}
    />
  )
}
