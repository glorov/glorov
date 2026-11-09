'use client'

import React, { useEffect, useState } from 'react'
import { GlorovGSymbol } from '../ui/GlorovGSymbol'

/**
 * BotanicalSplashScreen
 * 1:1 migration and enhancement of Flutter Web's instant native botanical splash screen.
 * Displays the signature GLOROV botanical emblem, spinning accent ring,
 * and elegant typography. Smoothly dissolves on hydration.
 *
 * NOTE: Fully React state-driven to prevent DOM node manipulation discrepancies
 * during Next.js App Router client-side navigation.
 */
export function BotanicalSplashScreen() {
  const [isFading, setIsFading] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Begin fade-out transition after initial presentation
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 450)

    // Complete removal from Virtual DOM after fade transition completes
    const dismissTimer = setTimeout(() => {
      setIsDismissed(true)
    }, 900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(dismissTimer)
    }
  }, [])

  if (isDismissed) return null

  return (
    <div
      id="glorov-splash"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: '#FAF8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        transition: 'opacity 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
        opacity: isFading ? 0 : 1,
        pointerEvents: isFading ? 'none' : 'auto',
      }}
    >
      <div style={{ position: 'relative', width: 64, height: 64, marginBottom: 20 }}>
        <div
          style={{
            boxSizing: 'border-box',
            position: 'absolute',
            width: 64,
            height: 64,
            border: '3px solid rgba(2, 65, 26, 0.12)',
            borderTopColor: '#71b109',
            borderRightColor: '#95d507',
            borderRadius: '50%',
            animation: 'glr-spin 0.9s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GlorovGSymbol size={36} />
        </div>
      </div>
      <div
        style={{
          color: '#02411a',
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}
      >
        GLOROV
      </div>
      <div
        style={{
          color: '#6B7280',
          fontSize: 13,
          marginTop: 6,
          letterSpacing: '0.04em',
        }}
      >
        Botanical Nursery &amp; Seeds
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes glr-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `,
        }}
      />
    </div>
  )
}
