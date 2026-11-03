'use client'

import React, { useState } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '../../lib/utils/cn'

export interface GlorovImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  containerClassName?: string
  fallbackTitle?: string
  showShimmer?: boolean
  onImageLoad?: () => void
  onImageError?: () => void
}

/**
 * GlorovImage
 * High-performance, zero-CLS botanical image wrapper for Next.js 15.
 * Features:
 * - Botanical sage shimmer skeleton (`#E9EFE8` base with luminous sweep) matching Flutter
 * - Watermarked seedling emblem placeholder while streaming
 * - Hardware-accelerated smooth 450ms cross-fade on load (`opacity-0 blur-sm` -> `opacity-100 blur-0`)
 * - Resilient botanical fallback container on asset error
 */
export function GlorovImage({
  src,
  alt,
  className,
  containerClassName,
  fallbackTitle = 'GLOROV Botanical',
  showShimmer = true,
  priority = false,
  fill = false,
  width,
  height,
  sizes,
  onImageLoad,
  onImageError,
  ...rest
}: GlorovImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Handlers
  const handleLoad = () => {
    setIsLoaded(true)
    onImageLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
    onImageError?.()
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#E9EFE8]/70 select-none',
        fill ? 'w-full h-full' : 'inline-block',
        containerClassName
      )}
    >
      {/* 1. Botanical Shimmer Skeleton & Watermark Placeholder */}
      {showShimmer && !isLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-1 flex items-center justify-center bg-[#E9EFE8] transition-opacity duration-300 pointer-events-none"
        >
          {/* Subtle Botanical Leaf Outline Watermark */}
          <svg
            className="w-10 h-10 text-[#2D6A4F]/20 animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9 4.97 0 9 4.03 9 9a9 9 0 0 1-9 9zm0 0v-8m0 0a4 4 0 0 1 4-4m-4 4a4 4 0 0 0-4-4"
            />
          </svg>

          {/* Shimmer Light Sweep */}
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. Error Fallback State */}
      {hasError ? (
        <div className="w-full h-full min-h-[120px] flex flex-col items-center justify-center p-4 bg-[#F2F5F2] text-[#2D6A4F] select-none">
          <svg
            className="w-8 h-8 text-[#52B788] mb-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
          <span className="text-[11px] font-semibold text-[#1B4332] tracking-wide text-center">
            {fallbackTitle}
          </span>
          <span className="text-[9.5px] text-[#6B7280] mt-0.5 text-center">
            Specimen preview unavailable
          </span>
        </div>
      ) : (
        /* 3. Next.js High-Performance Image with Smooth Fade-in */
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={width}
          height={height}
          sizes={sizes}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            !isLoaded
              ? 'opacity-0 scale-[1.02] blur-[2px]'
              : 'opacity-100 scale-100 blur-0',
            className
          )}
          {...rest}
        />
      )}
    </div>
  )
}
