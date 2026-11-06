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

// Exact thresholds for smooth storefront header scroll transitions
const TOP_THRESHOLD = 34.0
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

  const isTopNavVisibleRef = useRef(true)
  const isBottomNavVisibleRef = useRef(false)
  const showIconsRef = useRef(true)
  const showAnnouncementRef = useRef(true)
  const isAtTopRef = useRef(true)

  const lastPixelsRef = useRef(0)
  const accumulatedDeltaRef = useRef(0)

  const setNavState = useCallback(
    (
      nextTopNav: boolean,
      nextBottomNav: boolean,
      nextAnnouncement: boolean,
      nextIcons: boolean,
      nextAtTop: boolean
    ) => {
      if (nextTopNav !== isTopNavVisibleRef.current) {
        isTopNavVisibleRef.current = nextTopNav
        setIsTopNavVisible(nextTopNav)
      }
      if (nextBottomNav !== isBottomNavVisibleRef.current) {
        isBottomNavVisibleRef.current = nextBottomNav
        setIsBottomNavVisible(nextBottomNav)
      }
      if (nextAnnouncement !== showAnnouncementRef.current) {
        showAnnouncementRef.current = nextAnnouncement
        setShowAnnouncement(nextAnnouncement)
      }
      if (nextIcons !== showIconsRef.current) {
        showIconsRef.current = nextIcons
        setShowIcons(nextIcons)
      }
      if (nextAtTop !== isAtTopRef.current) {
        isAtTopRef.current = nextAtTop
        setIsAtTop(nextAtTop)
      }
    },
    []
  )

  const reset = useCallback(() => {
    isTopNavVisibleRef.current = true
    isBottomNavVisibleRef.current = false
    showIconsRef.current = true
    showAnnouncementRef.current = true
    isAtTopRef.current = true
    setIsTopNavVisible(true)
    setIsBottomNavVisible(false)
    setShowIcons(true)
    setShowAnnouncement(true)
    setIsAtTop(true)
    lastPixelsRef.current = 0
    accumulatedDeltaRef.current = 0
  }, [])

  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      const scrollEl = typeof document !== 'undefined' ? document.getElementById('glorov-page-scroll') : null
      const pixels =
        typeof window !== 'undefined' && window.scrollY > 0
          ? window.scrollY
          : typeof document !== 'undefined' && document.documentElement.scrollTop > 0
            ? document.documentElement.scrollTop
            : scrollEl && scrollEl.scrollTop > 0
              ? scrollEl.scrollTop
              : 0

      // 1. Zone 1: Maximum Top of the page (pixels <= 34):
      if (pixels <= TOP_THRESHOLD) {
        accumulatedDeltaRef.current = 0
        setNavState(true, false, true, true, true)
        lastPixelsRef.current = pixels
        return
      }

      // 2. Zone 2: Initial Page Scroll / "No-Hide Zone" (34px < pixels <= 180px):
      if (pixels <= STICKY_ACTIVATION_THRESHOLD) {
        accumulatedDeltaRef.current = 0
        setNavState(true, false, false, false, false)
        lastPixelsRef.current = pixels
        return
      }

      // 3. Zone 3: Bottom of Page / Footer Zone (within 240px of bottom):
      const doc = typeof document !== 'undefined' ? document.documentElement : null
      const maxScroll =
        doc && typeof window !== 'undefined'
          ? Math.max(0, doc.scrollHeight - window.innerHeight)
          : scrollEl
            ? Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
            : 0

      if (maxScroll > STICKY_ACTIVATION_THRESHOLD && pixels >= maxScroll - BOTTOM_THRESHOLD) {
        accumulatedDeltaRef.current = 0
        setNavState(isTopNavVisibleRef.current, true, false, false, false)
        lastPixelsRef.current = pixels
        return
      }

      // 4. Zone 4: Content Browsing / Dynamic Sticky (pixels > 180px):
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
        setNavState(false, true, false, false, false)
        accumulatedDeltaRef.current = 0
        lastPixelsRef.current = pixels
        return
      }

      // Scrolling UP past tolerance (8px)
      if (accumulatedDeltaRef.current < -UP_TOLERANCE) {
        setNavState(true, false, false, false, false)
        accumulatedDeltaRef.current = 0
        lastPixelsRef.current = pixels
        return
      }

      lastPixelsRef.current = pixels
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
      }
    }

    const scrollEl = typeof document !== 'undefined' ? document.getElementById('glorov-page-scroll') : null
    if (scrollEl) {
      scrollEl.addEventListener('scroll', onScroll, { passive: true })
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    // Run once synchronously on mount to establish initial state
    handleScroll()

    return () => {
      if (scrollEl) {
        scrollEl.removeEventListener('scroll', onScroll)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', onScroll)
      }
    }
  }, [setNavState])

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
