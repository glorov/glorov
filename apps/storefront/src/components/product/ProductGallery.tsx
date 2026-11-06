'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { GlorovImage } from '../ui/GlorovImage'
import { Lightbox } from '../ui/Lightbox'
import { getOptimizedImageUrl } from '../../lib/utils/image'

export interface ProductGalleryProps {
  title: string
  images: string[]
  primaryImage: string
  badges?: string[]
}

/**
 * GLOROV ProductGallery
 * High-craft gallery matching Flutter `GlorovProductGallery`:
 * - Interactive horizontal drag / touch swipe sliding track with real-time translation
 * - 1.05 aspect ratio primary container with max-height: 520px desktop fit
 * - Docked promotional badge at top-left (`bg-[#0c2340]` with yellow bolt `⚡`)
 * - Floating circular zoom / fullscreen button (`Icons.fullscreen`)
 * - Bottom quick sow / sowing advice pill overlay (`How to sow: ...`)
 * - Carousel dot indicators
 * - Horizontal thumbnail selector strip with active mint/emerald border (`#52B788`)
 * - Interactive fullscreen preview modal with counter, navigation, and thumbnail jump strip
 */
export const ProductGallery: React.FC<ProductGalleryProps> = ({
  title,
  images,
  primaryImage,
  badges = [],
}) => {
  const primaryImageRef = useRef<HTMLDivElement>(null)
  const thumbnailScrollRef = useRef<HTMLDivElement>(null)

  const displayImages = useMemo(() => {
    return images.length > 0 ? images : [primaryImage]
  }, [images, primaryImage])
  const totalImages = displayImages.length

  // Extended circular array with head & tail clones for true infinite forward/backward scroll
  const extendedImages = useMemo(() => {
    if (totalImages <= 1) return displayImages
    return [displayImages[totalImages - 1], ...displayImages, displayImages[0]]
  }, [displayImages, totalImages])

  // Virtual index starts at 1 (real index 0) when cloned
  const [displayIndex, setDisplayIndex] = useState<number>(totalImages > 1 ? 1 : 0)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true)
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false)

  // Real-time Drag / Swipe state with 2-axis gesture disambiguation
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const dragDeltaRef = useRef<number>(0)
  const isPointerDownRef = useRef<boolean>(false)
  const isLockedRef = useRef<'none' | 'horizontal' | 'vertical'>('none')
  const capturedPointerIdRef = useRef<number | null>(null)
  const GESTURE_THRESHOLD = 8

  // Active real index for indicators, badges, and modal (0 to totalImages - 1)
  const activeRealIndex =
    totalImages > 1 ? (displayIndex - 1 + totalImages) % totalImages : 0
  const currentImage = displayImages[activeRealIndex] || primaryImage

  // Always smoothly advance forward to the right (never rewind across all slides)
  const handleNext = useCallback((): void => {
    if (totalImages <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev + 1)
  }, [totalImages])

  // Smoothly advance backward to the left
  const handlePrev = useCallback((): void => {
    if (totalImages <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev - 1)
  }, [totalImages])

  // Direct thumbnail / dot jump navigation
  const handleGoTo = useCallback(
    (targetRealIndex: number) => {
      if (totalImages <= 1) return
      setIsTransitioning(true)
      setDisplayIndex(targetRealIndex + 1)
    },
    [totalImages]
  )

  // Handle seamless teleport jump when transition ends on a clone slide
  const handleTransitionEnd = useCallback(() => {
    if (totalImages <= 1) return
    if (displayIndex >= totalImages + 1) {
      // Reached tail clone (clone of image 0) -> jump silently back to real image 0 (displayIndex 1)
      setIsTransitioning(false)
      setDisplayIndex(1)
    } else if (displayIndex <= 0) {
      // Reached head clone (clone of image N-1) -> jump silently back to real image N-1 (displayIndex N)
      setIsTransitioning(false)
      setDisplayIndex(totalImages)
    }
  }, [displayIndex, totalImages])

  // Re-enable CSS transitions on the next tick following an invisible teleport
  useEffect(() => {
    if (!isTransitioning) {
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true)
        })
      })
      return () => cancelAnimationFrame(raf)
    }
  }, [isTransitioning])

  // Pointer drag gesture handlers for real-time mouse drag & touch swipe
  // 2-axis gesture disambiguation ensures vertical page scrolling is NEVER blocked
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (totalImages <= 1) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    if ((e.target as HTMLElement).closest('button')) return

    isPointerDownRef.current = true
    isLockedRef.current = 'none'
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    dragDeltaRef.current = 0
    capturedPointerIdRef.current = null
    // Yield on pointerdown so vertical scrolling starts unhindered
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return

    const diffX = e.clientX - startXRef.current
    const diffY = e.clientY - startYRef.current

    if (isLockedRef.current === 'vertical') {
      return
    }

    if (isLockedRef.current === 'none') {
      const absX = Math.abs(diffX)
      const absY = Math.abs(diffY)

      if (absX <= GESTURE_THRESHOLD && absY <= GESTURE_THRESHOLD) {
        return
      }

      if (absY >= absX) {
        // Vertical gesture dominates -> let browser scroll page smoothly
        isLockedRef.current = 'vertical'
        isPointerDownRef.current = false
        return
      }

      // Horizontal gesture dominates -> lock to gallery slide drag
      isLockedRef.current = 'horizontal'
      setIsDragging(true)
      setDragOffset(0)
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
        capturedPointerIdRef.current = e.pointerId
      } catch {}
    }

    if (isLockedRef.current === 'horizontal') {
      dragDeltaRef.current = diffX
      setDragOffset(diffX)
    }
  }

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current && isLockedRef.current !== 'horizontal') return

    if (capturedPointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(capturedPointerIdRef.current)
      } catch {}
      capturedPointerIdRef.current = null
    }

    const wasHorizontal = isLockedRef.current === 'horizontal'
    const delta = dragDeltaRef.current
    const threshold = 45 // min pixel delta to trigger slide change

    isPointerDownRef.current = false
    isLockedRef.current = 'none'
    setIsDragging(false)
    setDragOffset(0)

    if (wasHorizontal) {
      if (delta < -threshold) {
        handleNext()
      } else if (delta > threshold) {
        handlePrev()
      }
    }
  }

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    if (capturedPointerIdRef.current !== null) {
      try {
        e.currentTarget.releasePointerCapture(capturedPointerIdRef.current)
      } catch {}
      capturedPointerIdRef.current = null
    }

    isPointerDownRef.current = false
    isLockedRef.current = 'none'
    setIsDragging(false)
    setDragOffset(0)
  }

  const primaryBadge = badges.length > 0 && badges[0].trim().length > 0 ? badges[0].trim().toUpperCase() : null

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Primary Image Frame with 3:4 Aspect Ratio and Automatic Boundary Containment */}
      <div
        ref={primaryImageRef}
        className="relative aspect-[3/4] max-h-[580px] sm:max-h-[620px] w-full rounded-2xl overflow-hidden bg-[#F8FAF7] border border-[#E5E7EB] group select-none touch-pan-y flex items-center justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Real-Time Sliding Infinite Carousel Track */}
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex h-full w-full will-change-transform"
          style={{
            transform: `translateX(calc(-${displayIndex * 100}% + ${dragOffset}px))`,
            transition:
              isDragging || !isTransitioning
                ? 'none'
                : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
          }}
        >
          {extendedImages.map((img, idx) => (
            <div
              key={`slide-${img}-${idx}`}
              className="relative min-w-full w-full h-full flex-shrink-0 flex items-center justify-center p-2 sm:p-3"
              onClick={() => {
                // If practically no drag occurred, treat as click to zoom
                if (Math.abs(dragDeltaRef.current) < 5) {
                  setIsZoomModalOpen(true)
                }
              }}
            >
              <GlorovImage
                src={img}
                alt={`${title} - view ${idx + 1}`}
                fill
                draggable={false}
                priority={idx === 1}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 620px"
                className="object-contain object-center pointer-events-none select-none max-w-full max-h-full"
                containerClassName="w-full h-full bg-transparent flex items-center justify-center"
                fallbackTitle={title}
              />
            </div>
          ))}
        </div>

        {/* Top-Left Docked Promotional Badge */}
        {primaryBadge && (
          <div className="absolute top-0 left-0 z-10 pointer-events-none">
            <div className="bg-[#0c2340] text-white px-3 py-1.5 rounded-tl-2xl rounded-br-xl rounded-tr-xl flex items-center gap-1">
              <svg width={14} height={14} className="w-3.5 h-3.5 text-[#FACC15] fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M13 2L3 14h7v8l11-14h-8l0-6z" />
              </svg>
              <span className="text-[10.5px] font-extrabold tracking-wider uppercase">
                {primaryBadge}
              </span>
            </div>
          </div>
        )}

        {/* Top-Right Floating Zoom Button: Clean solid lightweight */}
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            setIsZoomModalOpen(true)
          }}
          className="absolute top-2.5 right-2.5 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white border border-stone-200 text-[#1B4332] active:scale-90 transition flex items-center justify-center cursor-pointer"
          aria-label="Zoom image"
        >
          <svg width={15} height={15} className="w-[15px] h-[15px] shrink-0 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M4 8V5a1 1 0 011-1h3m8 0h3a1 1 0 011 1v3M4 16v3a1 1 0 001 1h3m8 0h3a1 1 0 001-1v-3" />
          </svg>
        </button>

        {/* Previous / Next Arrow Controls */}
        {totalImages > 1 && (
          <>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handlePrev()
              }}
              className="absolute left-2 sm:left-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white border border-stone-200 text-[#1B4332] transition-colors hover:scale-105 active:scale-90 cursor-pointer flex items-center justify-center"
              aria-label="Previous product image"
            >
              <svg width={16} height={16} className="w-4 h-4 shrink-0 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onPointerUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleNext()
              }}
              className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white border border-stone-200 text-[#1B4332] transition-colors hover:scale-105 active:scale-90 cursor-pointer flex items-center justify-center"
              aria-label="Next product image"
            >
              <svg width={16} height={16} className="w-4 h-4 shrink-0 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* 2. Carousel Dot Indicators matching Flutter _buildGallery */}
      {totalImages > 1 && (
        <div className="flex items-center justify-center gap-2 py-1">
          {displayImages.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              type="button"
              onClick={() => handleGoTo(idx)}
              aria-label={`Jump to image ${idx + 1}`}
              className={`transition-all rounded-full cursor-pointer ${
                idx === activeRealIndex
                  ? 'w-6 h-2 bg-[#1B4332]'
                  : 'w-2 h-2 bg-[#D1D5DB] hover:bg-[#9CA3AF]'
              }`}
            />
          ))}
        </div>
      )}

      {/* 3. Horizontal Thumbnail Selector Strip with non-blocking vertical page scroll */}
      {totalImages > 1 && (
        <div
          ref={thumbnailScrollRef}
          role="region"
          aria-label="Thumbnail previews"
          className="flex items-center gap-2.5 overflow-x-auto py-1 scrollbar-none no-scrollbar touch-pan-y select-none overscroll-x-contain"
        >
          {displayImages.map((img, idx) => {
            const isSelected = idx === activeRealIndex
            return (
              <button
                key={`thumb-${img}-${idx}`}
                type="button"
                onClick={() => handleGoTo(idx)}
                className={`relative flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-[10px] overflow-hidden border-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#1B4332] scale-102'
                    : 'border-[#E5E7EB] opacity-75 hover:opacity-100 hover:border-[#9CA3AF]'
                }`}
                aria-label={`View image ${idx + 1} of ${totalImages}`}
                aria-current={isSelected ? 'true' : undefined}
              >
                <GlorovImage
                  src={getOptimizedImageUrl(img, { width: 128, height: 128, crop: 'fill', quality: 'auto' })}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover object-center select-none pointer-events-none"
                  containerClassName="w-full h-full"
                  draggable={false}
                />
              </button>
            )
          })}
        </div>
      )}

      {/* 4. Interactive Spring-Powered Lightbox Modal with Pan, Zoom & Arrow Navigation */}
      <Lightbox
        open={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
        src={currentImage}
        alt={title}
        caption={title}
        images={displayImages}
        currentIndex={activeRealIndex}
        onIndexChange={handleGoTo}
        onPrev={handlePrev}
        onNext={handleNext}
        originRef={primaryImageRef}
      />
    </div>
  )
}
