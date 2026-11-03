'use client'

import { useEffect, useState } from 'react'

/**
 * BotanicalSplashScreen
 * 1:1 migration and enhancement of Flutter Web's instant native botanical splash screen.
 * Displays the signature GLOROV botanical emblem, spinning accent ring,
 * and elegant typography. Smoothly dissolves on hydration.
 */
export function BotanicalSplashScreen() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Check if initial splash element exists in DOM (inlined in layout.tsx)
    const splashEl = document.getElementById('glorov-splash')

    // Graceful initial presentation: minimum display time for smooth perceived performance
    const timer = setTimeout(() => {
      if (splashEl) {
        splashEl.style.transition = 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
        splashEl.style.opacity = '0'
        splashEl.style.pointerEvents = 'none'
      }

      const removeTimer = setTimeout(() => {
        setVisible(false)
        if (splashEl && splashEl.parentNode) {
          splashEl.parentNode.removeChild(splashEl)
        }
      }, 450)

      return () => clearTimeout(removeTimer)
    }, 450)

    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return null
}
