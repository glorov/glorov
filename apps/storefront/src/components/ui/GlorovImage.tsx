'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '../../lib/utils/cn'
import { getLowQualityImageUrl } from '../../lib/utils/image'

export interface GlorovImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  containerClassName?: string
  fallbackTitle?: string
  showShimmer?: boolean
  lowQualitySrc?: string
  progressive?: boolean
  onImageLoad?: () => void
  onImageError?: () => void
}

/**
 * GlorovImage
 * Next.js progressive dual-tier image loader designed for maximum perceived performance.
 *
 * How it delivers ultra-fast page opens:
 * 1. Tier 1 (Instant Micro-Thumbnail): First loads an ultra-compact ~600-byte small size image.
 *    Because the small image is tiny, it transfers across the wire in ~10-20ms.
 *    The page appears visually complete immediately with rich botanical colors and soft blur.
 * 2. Tier 2 (Slow High-Quality Replacement): In the background, Next.js streams the high-resolution image.
 *    Once loaded, the high-quality image slowly and smoothly cross-fades into view (700ms cubic-bezier),
 *    crisply replacing the low-res thumbnail with zero Cumulative Layout Shift (CLS = 0).
 * 3. Resilient Error State: Botanical specimen placeholder fallback if an asset is unavailable.
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
  lowQualitySrc,
  progressive = true,
  onImageLoad,
  onImageError,
  ...rest
}: GlorovImageProps) {
  const [isHighResLoaded, setIsHighResLoaded] = useState(false)
  const [isLowResLoaded, setIsLowResLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  const rawSrc = typeof src === 'string' ? src : typeof src === 'object' && src !== null && 'src' in src ? (src as { src: string }).src : ''
  const isSvg = rawSrc.endsWith('.svg') || rawSrc.includes('.svg?')
  const shouldProgressive = progressive && !isSvg && Boolean(rawSrc)

  // Compute micro-thumbnail URL (reduces ~200KB down to ~600 bytes)
  const resolvedLowResSrc = lowQualitySrc || (shouldProgressive ? getLowQualityImageUrl(rawSrc) : '')
  const hasLowRes = Boolean(resolvedLowResSrc && resolvedLowResSrc !== rawSrc)

  // Handlers
  const handleHighResLoad = () => {
    setIsHighResLoaded(true)
    onImageLoad?.()
  }

  const handleLowResLoad = () => {
    setIsLowResLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsHighResLoaded(true)
    onImageError?.()
  }

  // Reset states if src changes and synchronize with cached image state
  useEffect(() => {
    setIsHighResLoaded(false)
    setIsLowResLoaded(false)
    setHasError(false)

    // Check if image was already completed from browser disk/memory cache
    if (imgRef.current?.complete) {
      if (imgRef.current.naturalWidth > 0) {
        setIsHighResLoaded(true)
        onImageLoad?.()
      } else if (imgRef.current.naturalWidth === 0 && rawSrc) {
        setHasError(true)
        onImageError?.()
      }
    }
  }, [rawSrc, onImageLoad, onImageError])

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-[#E9EFE8]/60 select-none isolate',
        fill ? 'w-full h-full' : 'inline-block',
        containerClassName
      )}
    >
      {/* 1. Botanical Shimmer Skeleton Placeholder (Active only until initial preview loads) */}
      {showShimmer && !isHighResLoaded && !isLowResLoaded && !hasError && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 flex items-center justify-center bg-[#E9EFE8] pointer-events-none transition-opacity duration-300"
        >
          {/* Subtle Botanical Leaf Watermark */}
          <svg
            className="w-8 h-8 text-[#02411a]/20 animate-pulse"
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

          {/* Shimmer Ambient Sweep */}
          <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 2. Error Fallback State */}
      {hasError ? (
        <div className="w-full h-full min-h-[100px] flex flex-col items-center justify-center p-3 bg-[#F2F5F2] text-[#02411a] select-none">
          <svg
            className="w-7 h-7 text-[#71b109] mb-1"
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
          <span className="text-[11px] font-semibold text-[#02411a] tracking-wide text-center">
            {fallbackTitle}
          </span>
          <span className="text-[9.5px] text-[#6B7280] mt-0.5 text-center">
            Specimen preview unavailable
          </span>
        </div>
      ) : (
        <>
          {/* 3. Tier 1: Micro-Size Low-Res Thumbnail (Loads within milliseconds, covers layout immediately) */}
          {hasLowRes && !isHighResLoaded && (
            <div
              aria-hidden="true"
              className={cn(
                'absolute inset-0 z-[1] overflow-hidden pointer-events-none transition-opacity duration-500 ease-out',
                isLowResLoaded ? 'opacity-100' : 'opacity-0'
              )}
            >
              <Image
                src={resolvedLowResSrc}
                alt=""
                fill={fill || !width || !height}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                sizes={sizes}
                priority={priority}
                unoptimized
                onLoad={handleLowResLoad}
                className={cn(
                  'w-full h-full scale-[1.02]',
                  className?.includes('object-contain') ? 'object-contain' : 'object-cover',
                  className
                )}
              />
            </div>
          )}

          {/* 4. Tier 2: Full High-Quality Image (Smoothly cross-fades into view once loaded) */}
          <Image
            ref={imgRef}
            src={src}
            alt={alt}
            fill={fill}
            width={width}
            height={height}
            sizes={sizes}
            priority={priority}
            onLoad={handleHighResLoad}
            onError={handleError}
            className={cn(
              'relative z-[2] transition-opacity duration-500 ease-out',
              !isHighResLoaded ? 'opacity-0' : 'opacity-100',
              className
            )}
            {...rest}
          />
        </>
      )}
    </div>
  )
}
