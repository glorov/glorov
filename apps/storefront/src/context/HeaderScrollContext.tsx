'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react'

export interface HeaderScrollState {
  isTopNavVisible: boolean
  isBottomNavVisible: boolean
  showIcons: boolean
  showAnnouncement: boolean
  isAtTop: boolean
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  reset: () => void
}

export const HeaderScrollContext = createContext<HeaderScrollState | undefined>(undefined)

// Exact thresholds migrated directly from Flutter `GlorovHeaderScrollNotifier`
const TOP_THRESHOLD = 12.0
const STICKY_ACTIVATION_THRESHOLD = 180.0
const DOWN_TOLERANCE = 14.0
const UP_TOLERANCE = 8.0
const BOTTOM_THRESHOLD = 240.0

export function HeaderScrollProvider({ children }: { children: React.ReactNode }) {
  const [isTopNavVisible, setIsTopNavVisible] = useState(true)
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(false)
  const [showIcons, setShowIcons] = useState(true)
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  const [isAtTop, setIsAtTop] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')

  const lastPixelsRef = useRef(0)
  const accumulatedDeltaRef = useRef(0)

  const reset = useCallback(() => {
    setIsTopNavVisible(true)
    setIsBottomNavVisible(false)
    setShowIcons(true)
    setShowAnnouncement(true)
    setIsAtTop(true)
    lastPixelsRef.current = 0
    accumulatedDeltaRef.current = 0
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollEl = typeof document !== 'undefined' ? document.getElementById('glorov-page-scroll') : null
      const pixels =
        typeof window !== 'undefined' && window.scrollY > 0
          ? window.scrollY
          : scrollEl
            ? scrollEl.scrollTop
            : 0
      const doc = typeof document !== 'undefined' ? document.documentElement : null
      const maxScroll =
        doc && typeof window !== 'undefined'
          ? Math.max(0, doc.scrollHeight - window.innerHeight)
          : scrollEl
            ? Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
            : 0

      // 1. Zone 1: Maximum Top of the page (pixels <= 12):
      // Full header open with announcement bar and centered category icons.
      // Mobile bottom navigation is hidden so top hero stays clean.
      if (pixels <= TOP_THRESHOLD) {
        accumulatedDeltaRef.current = 0
        setIsTopNavVisible(true)
        setShowAnnouncement(true)
        setShowIcons(true)
        setIsBottomNavVisible(false)
        setIsAtTop(true)
        lastPixelsRef.current = pixels
        return
      }

      setIsAtTop(false)

      // 2. Zone 2: Initial Page Scroll / "No-Hide Zone" (12px < pixels <= 180px):
      // Header remains sticky & VISIBLE at top.
      // Announcement bar and category icons tuck away into sleek compact mode.
      // Header DOES NOT hide prematurely on initial scroll down.
      // Mobile bottom nav remains hidden so hero section stays clean.
      if (pixels <= STICKY_ACTIVATION_THRESHOLD) {
        accumulatedDeltaRef.current = 0
        setIsTopNavVisible(true)
        setShowAnnouncement(false)
        setShowIcons(false)
        setIsBottomNavVisible(false)
        lastPixelsRef.current = pixels
        return
      }

      // 3. Zone 3: Bottom of Page / Footer Zone (within 240px of bottom):
      // Mobile bottom nav MUST remain docked and visible near the footer.
      if (maxScroll > STICKY_ACTIVATION_THRESHOLD && pixels >= maxScroll - BOTTOM_THRESHOLD) {
        accumulatedDeltaRef.current = 0
        setIsBottomNavVisible(true)
        lastPixelsRef.current = pixels
        return
      }

      // 4. Zone 4: Content Browsing / Dynamic Sticky (pixels > 180px):
      // When scrolling down past tolerance -> header slides up, mobile bottom nav slides up into view.
      // When scrolling up past tolerance -> header slides down in compact mode, mobile bottom nav hides.
      const effectiveDelta = pixels - lastPixelsRef.current

      if (
        (effectiveDelta > 0 && accumulatedDeltaRef.current < 0) ||
        (effectiveDelta < 0 && accumulatedDeltaRef.current > 0)
      ) {
        accumulatedDeltaRef.current = effectiveDelta
      } else {
        accumulatedDeltaRef.current += effectiveDelta
      }

      // Scrolling DOWN past tolerance (14px)
      if (accumulatedDeltaRef.current > DOWN_TOLERANCE) {
        setIsTopNavVisible(false)
        setIsBottomNavVisible(true)
        setShowAnnouncement(false)
        setShowIcons(false)
        accumulatedDeltaRef.current = 0
        lastPixelsRef.current = pixels
        return
      }

      // Scrolling UP past tolerance (8px)
      if (accumulatedDeltaRef.current < -UP_TOLERANCE) {
        setIsTopNavVisible(true)
        setIsBottomNavVisible(false)
        setShowAnnouncement(false)
        setShowIcons(false)
        accumulatedDeltaRef.current = 0
        lastPixelsRef.current = pixels
        return
      }

      lastPixelsRef.current = pixels
    }

    const scrollEl = typeof document !== 'undefined' ? document.getElementById('glorov-page-scroll') : null
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true })
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true })
    }

    const handleCapture = (e: Event) => {
      const target = e.target as HTMLElement | null
      if (target && target.id === 'glorov-page-scroll') {
        handleScroll()
      }
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('scroll', handleCapture, { capture: true, passive: true })
    }

    // Run once synchronously on mount to establish initial state
    handleScroll()

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', handleScroll)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll)
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('scroll', handleCapture, { capture: true })
      }
    }
  }, [])

  const value = useMemo(
    () => ({
      isTopNavVisible,
      isBottomNavVisible,
      showIcons,
      showAnnouncement,
      isAtTop,
      selectedCategory,
      setSelectedCategory,
      reset,
    }),
    [
      isTopNavVisible,
      isBottomNavVisible,
      showIcons,
      showAnnouncement,
      isAtTop,
      selectedCategory,
      reset,
    ]
  )

  return (
    <HeaderScrollContext.Provider value={value}>
      {children}
    </HeaderScrollContext.Provider>
  )
}

export function useHeaderScroll(): HeaderScrollState {
  const context = useContext(HeaderScrollContext)
  if (!context) {
    throw new Error('useHeaderScroll must be used within a HeaderScrollProvider')
  }
  return context
}
