'use client'

import React from 'react'
import { cn } from '../../lib/utils/cn'

export interface BotanicalLoadingStateProps {
  label?: string
  sublabel?: string
  className?: string
  fullScreen?: boolean
}

/**
 * BotanicalLoadingState
 * Authentic 1:1 mirror of GLOROV Flutter Web's signature splash & loading presentation.
 * Features:
 * - 64x64px rotating botanical ring (`#1E3A2F` accent with 12% alpha track)
 * - Centered botanical sprout seedling SVG glyph
 * - Bold uppercase GLOROV wordmark with 0.12em letter spacing
 * - Botanical Nursery & Seeds subtext
 * - Smooth micro-loading progress bar
 */
export function BotanicalLoadingState({
  label = 'GLOROV',
  sublabel = 'Botanical Nursery & Seeds',
  className,
  fullScreen = false,
}: BotanicalLoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${label} - ${sublabel}`}
      className={cn(
        'flex flex-col items-center justify-center bg-[#FAF8F5] select-none',
        fullScreen
          ? 'fixed inset-0 z-[99999] w-screen h-screen'
          : 'w-full min-h-[380px] py-16',
        className
      )}
    >
      {/* 1. Spinner Ring with Seedling Glyph */}
      <div className="relative w-16 h-16 mb-5">
        {/* Animated Outer Ring */}
        <div className="box-border absolute inset-0 w-16 h-16 rounded-full border-[3px] border-[#1E3A2F]/15 border-t-[#1E3A2F] animate-[glrSpin_0.9s_cubic-bezier(0.5,0.1,0.4,0.9)_infinite]" />

        {/* Center Seedling Glyph */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-6.5 h-6.5 text-[#1E3A2F]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2L12 22" />
            <path d="M17 7C17 7 13 8 12 12C11 8 7 7 7 7" />
            <path d="M17 14C17 14 13 15 12 19C11 15 7 14 7 14" />
          </svg>
        </div>
      </div>

      {/* 2. Brand Name Typography */}
      <div className="text-[#1E3A2F] text-[18px] font-bold tracking-[0.12em] uppercase font-sans">
        {label}
      </div>

      {/* 3. Subtitle / Mission */}
      {sublabel && (
        <div className="text-[#6B7280] text-[13px] tracking-[0.04em] mt-1.5 font-sans">
          {sublabel}
        </div>
      )}

      {/* 4. Elegant Progress Track */}
      <div className="w-28 h-1 bg-[#1E3A2F]/10 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-[#52B788] rounded-full w-1/2 animate-[progressSlide_1.2s_easeInOut_infinite]" />
      </div>

      <style jsx global>{`
        @keyframes glrSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes progressSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  )
}
