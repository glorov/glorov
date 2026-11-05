'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import type { BannerSlideItem } from '../../types/storefront'
import { GlorovImage } from '../ui/GlorovImage'
import { MOCK_BANNERS } from '../../lib/mock-data'
import { cn } from '../../lib/utils/cn'

export interface HeroBannerSliderProps {
  banners?: BannerSlideItem[]
  autoPlayIntervalMs?: number
  className?: string
}

/**
 * Circular Floating Navigation Arrow Button for Desktop Slider
 * 1:1 migration of Flutter `_SliderArrowButton`
 */
function SliderArrowButton({
  direction,
  onClick,
  tooltip,
}: {
  direction: 'prev' | 'next'
  onClick: () => void
  tooltip: string
}) {
  const label = direction === 'prev' ? 'Previous banner slide' : 'Next banner slide'

  return (
    <button
      type="button"
      onPointerDown={(e) => {
        e.stopPropagation()
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={tooltip}
      aria-label={label}
      className={cn(
        'hidden md:flex absolute top-1/2 -translate-y-1/2 z-30 items-center justify-center',
        'w-[42px] h-[42px] rounded-full bg-[#1E3D2F] text-white',
        'shadow-[0_3px_10px_rgba(0,0,0,0.28)] cursor-pointer',
        'hover:scale-110 active:scale-90 transition-transform duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
        direction === 'prev' ? 'left-6' : 'right-6'
      )}
    >
      {direction === 'prev' ? (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </button>
  )
}

/**
 * @component HeroBannerSlider
 *
 * @description
 * Faithful 1:1 migration of Flutter `GlorovHeroBannerSlider`:
 * 1. Aspect Ratios:
 *    - Desktop & Tablet (>= 768px): 20:9 (20.0 / 9.0 ≈ 2.222:1).
 *    - Mobile (< 768px): 5:7 (5.0 / 7.0 ≈ 0.714:1 portrait).
 * 2. Multi-device Cloudinary banner assets (Desktop landscape and Mobile portrait).
 * 3. Smooth forward rightward sliding track.
 * 4. Progress Countdown Indicator Bar:
 *    - Inactive: 8px pill.
 *    - Active: 34px pill with live progress bar (0% -> 100% over 6 seconds).
 *    - Pauses smoothly on mouse hover and touch down without jumping.
 *    - Direct tap navigation on indicator pills.
 * 5. Floating Circular Navigation Arrow Buttons (42px circle, #1E3D2F, 24px chevron).
 * 6. Responsive touch swipe gestures for mobile.
 */
export function HeroBannerSlider({
  banners = MOCK_BANNERS,
  autoPlayIntervalMs = 6000,
  className,
}: HeroBannerSliderProps) {
  const slidesCount = banners.length
  // Extended circular array with head & tail clones for true infinite forward/backward scroll
  const extendedSlides = React.useMemo(() => {
    if (slidesCount <= 1) return banners
    return [banners[slidesCount - 1], ...banners, banners[0]]
  }, [banners, slidesCount])

  // Virtual index starts at 1 (real index 0) when cloned, or 0 when single slide
  const [displayIndex, setDisplayIndex] = useState(slidesCount > 1 ? 1 : 0)
  const [isTransitioning, setIsTransitioning] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)

  // Drag tracking refs with 2-axis gesture disambiguation
  const startXRef = useRef<number>(0)
  const startYRef = useRef<number>(0)
  const dragDeltaRef = useRef<number>(0)
  const isPointerDownRef = useRef<boolean>(false)
  const isLockedRef = useRef<'none' | 'horizontal' | 'vertical'>('none')
  const capturedPointerIdRef = useRef<number | null>(null)

  // Real index for indicators and screen readers (0 to slidesCount - 1)
  const activeRealIndex =
    slidesCount > 1 ? (displayIndex - 1 + slidesCount) % slidesCount : 0

  // Always smoothly advance forward to the right (never rewind across all slides)
  const handleNext = useCallback(() => {
    if (slidesCount <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev + 1)
    setProgress(0)
  }, [slidesCount])

  // Smoothly advance backward to the left
  const handlePrev = useCallback(() => {
    if (slidesCount <= 1) return
    setIsTransitioning(true)
    setDisplayIndex((prev) => prev - 1)
    setProgress(0)
  }, [slidesCount])

  // Direct dot jump navigation
  const handleGoTo = useCallback(
    (targetRealIndex: number) => {
      if (slidesCount <= 1) return
      setIsTransitioning(true)
      setDisplayIndex(targetRealIndex + 1)
      setProgress(0)
    },
    [slidesCount]
  )

  // Handle seamless teleport jump when transition ends on a clone slide
  const handleTransitionEnd = useCallback(() => {
    if (slidesCount <= 1) return
    if (displayIndex >= slidesCount + 1) {
      // Reached tail clone (clone of slide 0) -> jump silently back to real slide 0 (displayIndex 1)
      setIsTransitioning(false)
      setDisplayIndex(1)
    } else if (displayIndex <= 0) {
      // Reached head clone (clone of slide N-1) -> jump silently back to real slide N-1 (displayIndex N)
      setIsTransitioning(false)
      setDisplayIndex(slidesCount)
    }
  }, [displayIndex, slidesCount])

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

  // Auto-play timer with continuous progress countdown bar (always scrolls right)
  useEffect(() => {
    if (isPaused || isDragging || slidesCount <= 1) return

    const tickInterval = 50 // Update every 50ms for buttery smooth bar animation
    const step = tickInterval / autoPlayIntervalMs

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step
        if (next >= 1) {
          handleNext()
          return 0
        }
        return next
      })
    }, tickInterval)

    return () => clearInterval(interval)
  }, [isPaused, isDragging, slidesCount, autoPlayIntervalMs, handleNext])

  // Gesture disambiguation threshold: minimum movement before deciding direction
  const GESTURE_THRESHOLD = 8

  // Pointer drag gesture handlers for real-time mouse drag & touch swipe
  // 2-axis gesture disambiguation ensures vertical page scrolling is NEVER blocked
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (slidesCount <= 1) return
    if (e.button !== 0 && e.pointerType === 'mouse') return
    // Guard against clicks on child buttons (arrows, indicator pills)
    if ((e.target as HTMLElement).closest('button')) return

    isPointerDownRef.current = true
    isLockedRef.current = 'none'
    startXRef.current = e.clientX
    startYRef.current = e.clientY
    dragDeltaRef.current = 0
    capturedPointerIdRef.current = null
    // NOTE: Intentionally do NOT set pointer capture or setIsDragging here.
    // Leaving pointer uncaptured on touchstart lets the browser freely initiate vertical page scroll.
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current) return

    const diffX = e.clientX - startXRef.current
    const diffY = e.clientY - startYRef.current

    // If already identified as vertical scroll, do not interfere with browser scroll
    if (isLockedRef.current === 'vertical') {
      return
    }

    // Disambiguate gesture direction once threshold is crossed
    if (isLockedRef.current === 'none') {
      const absX = Math.abs(diffX)
      const absY = Math.abs(diffY)

      if (absX <= GESTURE_THRESHOLD && absY <= GESTURE_THRESHOLD) {
        return // Still inside threshold window
      }

      if (absY >= absX) {
        // Vertical gesture dominates -> release to browser for native page scrolling
        isLockedRef.current = 'vertical'
        isPointerDownRef.current = false
        return
      }

      // Horizontal gesture dominates -> lock to horizontal carousel drag
      isLockedRef.current = 'horizontal'
      setIsDragging(true)
      setIsPaused(true)
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
    const deltaX = dragDeltaRef.current
    const threshold = 40 // min pixel delta to trigger slide change

    isPointerDownRef.current = false
    isLockedRef.current = 'none'
    setIsDragging(false)
    setIsPaused(false)
    setDragOffset(0)

    if (wasHorizontal) {
      if (deltaX < -threshold) {
        handleNext()
      } else if (deltaX > threshold) {
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
    setIsPaused(false)
    setDragOffset(0)
    // Abort cleanly without changing slides
  }

  const handleSlideClick = (e: React.MouseEvent) => {
    // If user dragged more than 8 pixels, cancel link navigation
    if (Math.abs(dragDeltaRef.current) > 8) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  if (banners.length === 0) return null

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Promotional Hero Banners"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => {
        if (!isDragging) setIsPaused(false)
      }}
      className={cn(
        'relative w-full overflow-hidden select-none bg-[#1E3D2F]',
        className
      )}
    >
      {/* 
        Responsive Aspect Ratio Container:
        - Mobile (< 768px): 3:4 (0.75:1) matching 1536x2048 mobile portrait banners
        - Desktop & Tablet (>= 768px): 2048/746 (2.745:1) matching 2048x746 desktop landscape banners
        - Seamless full-bleed fit without image stretching or awkward vertical cropping
      */}
      <div
        className="relative w-full aspect-[3/4] md:aspect-[2048/746] overflow-hidden touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onDragStart={(e) => e.preventDefault()}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Horizontal Infinite Slider Track */}
        <div
          onTransitionEnd={handleTransitionEnd}
          onDragStart={(e) => e.preventDefault()}
          className="flex h-full w-full will-change-transform"
          style={{
            transform: `translateX(calc(-${displayIndex * 100}% + ${dragOffset}px))`,
            transition:
              isDragging || !isTransitioning
                ? 'none'
                : 'transform 500ms cubic-bezier(0.33, 1, 0.68, 1)',
          }}
        >
          {extendedSlides.map((slide, idx) => {
            const isClone =
              slidesCount > 1 && (idx === 0 || idx === extendedSlides.length - 1)
            return (
              <div
                key={`${slide.id}-${idx}`}
                aria-hidden={isClone ? 'true' : undefined}
                className="relative w-full h-full shrink-0 overflow-hidden"
                style={{ backgroundColor: slide.bgColor ?? '#1E3D2F' }}
              >
                <Link
                  href={slide.ctaRoute}
                  onClick={handleSlideClick}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  tabIndex={isClone ? -1 : 0}
                  aria-label={isClone ? undefined : (slide.title || slide.tag || 'Hero banner promotion')}
                  className="block w-full h-full relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white select-none"
                >
                  {/* Mobile Image (< 768px) */}
                  <div className="block md:hidden w-full h-full relative select-none">
                    <GlorovImage
                      src={slide.mobileImageUrl || slide.desktopImageUrl}
                      alt={isClone ? '' : (slide.title || 'Glorov Banner')}
                      fill
                      draggable={false}
                      priority={idx === 1}
                      sizes="100vw"
                      className="object-cover object-top select-none pointer-events-none"
                      containerClassName="w-full h-full"
                    />
                  </div>

                  {/* Desktop & Tablet Image (>= 768px) */}
                  <div className="hidden md:block w-full h-full relative select-none">
                    <GlorovImage
                      src={slide.desktopImageUrl}
                      alt={isClone ? '' : (slide.title || 'Glorov Banner')}
                      fill
                      draggable={false}
                      priority={idx === 1}
                      sizes="100vw"
                      className="object-cover object-left md:object-center select-none pointer-events-none"
                      containerClassName="w-full h-full"
                    />
                  </div>

                  {/* Accessible Screen Reader / SEO Semantic Content (only on primary slides, not animation clones) */}
                  {!isClone && (
                    <div className="sr-only">
                      {slide.title && <h2>{slide.title}</h2>}
                    </div>
                  )}
                </Link>
              </div>
            )})}
        </div>

        {/* Desktop Floating Circular Navigation Arrows (< and >) */}
        {slidesCount > 1 && (
          <>
            <SliderArrowButton
              direction="prev"
              onClick={handlePrev}
              tooltip="Previous Slide"
            />
            <SliderArrowButton
              direction="next"
              onClick={handleNext}
              tooltip="Next Slide"
            />
          </>
        )}

        {/* 
          Bottom Animated Indicator Pills with Progress Bar
          Active pill synchronized with circular activeRealIndex
        */}
        {slidesCount > 1 && (
          <div className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center pointer-events-auto">
            <div
              className="flex items-center bg-black/25 backdrop-blur-[2px] px-2 py-1 rounded-full"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {banners.map((slide, idx) => {
                const isActive = idx === activeRealIndex
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onPointerDown={(e) => {
                      e.stopPropagation()
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation()
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGoTo(idx)
                    }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className="group flex items-center justify-center p-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white cursor-pointer rounded-full"
                  >
                    <div
                      className={cn(
                        'h-[6px] rounded-[4px] bg-white/40 shadow-[0_1.5px_4px_rgba(0,0,0,0.35)]',
                        'transition-all duration-300 ease-out',
                        isActive ? 'w-[34px] overflow-hidden relative bg-white/30' : 'w-2 group-hover:bg-white/70'
                      )}
                    >
                      {isActive && (
                        <div
                          className="h-full bg-white transition-[width] duration-75 ease-linear rounded-[4px]"
                          style={{
                            width: `${Math.min(100, Math.max(0, progress * 100))}%`,
                          }}
                        />
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
