'use client'

import React from 'react'
import { cn } from '../../lib/utils/cn'
import { GlorovGSymbol } from '../ui/GlorovGSymbol'

export interface BotanicalLoadingStateProps {
  label?: string
  sublabel?: string
  className?: string
  fullScreen?: boolean
  size?: 'sm' | 'md' | 'lg'
}

/**
 * BotanicalLoadingState
 * Signature GLOROV page loading presentation.
 * Features:
 * - Branded G SVG logo mark centered inside the loading circle
 * - Color palette derived directly from the G SVG logo:
 *   - Rich botanical forest green (#02411a, #014720)
 *   - Vibrant leaf lime & emerald (#71b109, #95d507, #52B788)
 * - Multi-accent rotating outer spinner ring with G logo color sweep
 * - Soft radial ambient glow and breathing pulse inside the circle
 * - Elegant uppercase GLOROV typography and animated dual-tone progress track
 */
export function BotanicalLoadingState({
  label = 'GLOROV',
  sublabel = 'Botanical Nursery & Seeds',
  className,
  fullScreen = false,
  size = 'md',
}: BotanicalLoadingStateProps) {
  const isSm = size === 'sm'
  const isLg = size === 'lg'

  const circleDimensions = isSm ? 'w-12 h-12' : isLg ? 'w-20 h-20' : 'w-16 h-16'
  const logoSize = isSm ? 26 : isLg ? 46 : 36

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${label} - ${sublabel}`}
      className={cn(
        'flex flex-col items-center justify-center bg-[#FAF8F5] select-none',
        fullScreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen'
          : 'w-full min-h-[360px] py-14',
        className
      )}
    >
      {/* 1. Branded Loading Circle with GLOROV G SVG Logo */}
      <div className={cn('relative mb-4 flex items-center justify-center', circleDimensions)}>
        {/* Soft Ambient Radial Glow inside the circle with G logo green tones */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full pointer-events-none animate-[glrGlowPulse_2.4s_ease-in-out_infinite]"
          style={{
            background:
              'radial-gradient(circle, rgba(113, 177, 9, 0.22) 0%, rgba(2, 65, 26, 0.08) 60%, transparent 100%)',
          }}
        />

        {/* Ambient Ring Track in G Logo Forest Green */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-[2.5px] border-[#02411a]/15"
        />

        {/* Dynamic Rotating Spinner Ring using G SVG Logo Colors (#02411a & #71b109 & #95d507) */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full animate-[glrSpin_1s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite] pointer-events-none"
          viewBox="0 0 64 64"
          fill="none"
        >
          <defs>
            <linearGradient id="glrGLogoSpinnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#71b109" stopOpacity="1" />
              <stop offset="50%" stopColor="#95d507" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#02411a" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#glrGLogoSpinnerGrad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="130"
            strokeDashoffset="75"
          />
        </svg>

        {/* Center: Glorov G SVG Logo (Instant Inline Vector with Organic Breathing Pulse Animation) */}
        <div className="relative z-10 flex items-center justify-center animate-[glrGBreathe_2s_ease-in-out_infinite]">
          <GlorovGSymbol
            size={logoSize}
            className="pointer-events-none select-none"
          />
        </div>
      </div>

      {/* 2. Brand Name Typography in G Logo Forest Green */}
      <div className="text-[#02411a] text-[17px] font-bold tracking-[0.14em] uppercase font-sans">
        {label}
      </div>

      {/* 3. Subtitle / Mission */}
      {sublabel && (
        <div className="text-[#4B5563] text-[12.5px] tracking-[0.03em] mt-1 font-sans">
          {sublabel}
        </div>
      )}

      <style jsx global>{`
        @keyframes glrSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes glrGBreathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }
        @keyframes glrGlowPulse {
          0%,
          100% {
            opacity: 0.6;
            transform: scale(0.96);
          }
          50% {
            opacity: 1;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  )
}
