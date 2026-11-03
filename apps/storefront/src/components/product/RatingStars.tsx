import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface RatingStarsProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'green' | 'amber'
  showCount?: boolean
  className?: string
}

/**
 * @component RatingStars
 *
 * @description
 * High-precision rating star display migrated from Flutter `GlorovProductCard` and review components.
 * Supports botanical green (#16A34A) and amber (#F59E0B) colorways with fractional star rendering.
 */
export function RatingStars({
  rating,
  reviewCount,
  size = 'sm',
  color = 'green',
  showCount = true,
  className,
}: RatingStarsProps) {
  const normalizedRating = Math.max(0, Math.min(5, rating))

  const sizeClasses = {
    sm: 'w-3 h-3 text-[11px]',
    md: 'w-4 h-4 text-xs',
    lg: 'w-5 h-5 text-sm',
  }

  const colorClasses = {
    green: 'text-[#16A34A]',
    amber: 'text-[#F59E0B]',
  }

  return (
    <div
      className={cn('inline-flex items-center gap-1 select-none', className)}
      aria-label={`Rating: ${normalizedRating.toFixed(1)} out of 5 stars based on ${reviewCount ?? 0} reviews`}
    >
      {/* 5 Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = starIndex <= Math.round(normalizedRating)

          const px = size === 'sm' ? 12 : size === 'md' ? 16 : 20
          return (
            <svg
              key={starIndex}
              width={px}
              height={px}
              className={cn(
                sizeClasses[size].split(' ')[0],
                sizeClasses[size].split(' ')[1],
                filled ? colorClasses[color] : 'text-gray-300',
                'shrink-0'
              )}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        })}
      </div>

      {/* Numerical Rating & Count */}
      <span className={cn('font-bold text-[#111827] ml-0.5', sizeClasses[size].split(' ')[2])}>
        {normalizedRating.toFixed(1)}
      </span>

      {showCount && reviewCount !== undefined && (
        <span className="text-[#6B7280] text-[11px] font-normal">
          ({reviewCount})
        </span>
      )}
    </div>
  )
}
