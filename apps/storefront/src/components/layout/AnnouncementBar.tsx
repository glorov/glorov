'use client'

import React, { useState, useEffect, useMemo } from 'react'
import type { AnnouncementItem, AnnouncementConfig } from '../../types/storefront'
import { MOCK_ANNOUNCEMENTS } from '../../lib/mock-data'
import { HeaderScrollContext } from '../../context/HeaderScrollContext'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../lib/constants'
import { cn } from '../../lib/utils/cn'

export interface AnnouncementBarProps {
  items?: AnnouncementItem[]
  config?: AnnouncementConfig
  speedSeconds?: number
  isAnimated?: boolean
  className?: string
}

interface BackendAnnouncementPayload {
  id: string
  text: string
  highlight_text?: string
  badge_color?: string
  badge_text_color?: string
  icon?: string
  link_url?: string
  display_order?: number
  is_active?: boolean
}

interface BackendAnnouncementsResponse {
  config?: {
    is_enabled: boolean
    speed_seconds: number
    bg_color: string
    text_color: string
    highlight_color: string
    pause_on_hover: boolean
  }
  items?: BackendAnnouncementPayload[]
}

/**
 * Calculates high-contrast text color based on relative luminance
 */
export function getContrastTextColor(hexColor?: string): string {
  if (!hexColor) return '#111827'
  const hex = hexColor.replace('#', '')
  if (hex.length !== 6 && hex.length !== 3) return '#111827'
  const r = parseInt(hex.length === 3 ? hex[0] + hex[0] : hex.slice(0, 2), 16)
  const g = parseInt(hex.length === 3 ? hex[1] + hex[1] : hex.slice(2, 4), 16)
  const b = parseInt(hex.length === 3 ? hex[2] + hex[2] : hex.slice(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 135 ? '#111827' : '#FFFFFF'
}

/**
 * Botanical vector icon helper matching Flutter `GlorovAnnouncementBar._getIconData`
 */
export function AnnouncementIcon({
  icon,
  className = 'w-[12px] h-[12px]',
}: {
  icon?: string
  className?: string
}) {
  switch (icon) {
    case 'truck':
    case 'local_shipping':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
          />
        </svg>
      )
    case 'sprout':
    case 'spa':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M12 22v-9m0 0a4 4 0 00-4-4H4a8 8 0 018-8v12zm0 0a4 4 0 014-4h4a8 8 0 00-8-8v12z"
          />
        </svg>
      )
    case 'shield':
    case 'verified':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      )
    case 'bolt':
    case 'zap':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      )
    case 'percent':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M19 5L5 19M7.5 7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zm9 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          />
        </svg>
      )
    case 'winter':
    case 'ac_unit':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14"
          />
        </svg>
      )
    case 'star':
    case 'sparkle':
    case 'sparkles':
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
          />
        </svg>
      )
  }
}

/**
 * Single dynamic item inside the announcement bar with icon INSIDE the badge pill.
 * Purely informational ticker element with no clickable links or pointer interactions.
 */
function SingleAnnouncement({
  item,
  defaultBadgeColor = '#D48B46',
  defaultTextColor = '#FFFFFF',
}: {
  item: AnnouncementItem
  defaultBadgeColor?: string
  defaultTextColor?: string
}) {
  const highlightText = item.highlightText || item.highlight_text
  const badgeColor = item.badgeColor || item.badge_color || defaultBadgeColor
  const badgeTextColor =
    item.badgeTextColor ||
    item.badge_text_color ||
    getContrastTextColor(badgeColor)

  return (
    <div
      className="inline-flex items-center gap-2 px-4 h-[34px] shrink-0 select-none cursor-default pointer-events-none"
      style={{ color: defaultTextColor }}
    >
      {/* Highlight Badge with embedded Icon inside the colored pill */}
      {highlightText && (
        <span
          className="inline-flex items-center gap-1.5 px-2 py-[2px] rounded-[4px] font-extrabold text-[10px] tracking-[0.4px] uppercase shrink-0 transition-colors"
          style={{
            backgroundColor: badgeColor,
            color: badgeTextColor,
          }}
        >
          {item.icon && (
            <span
              className="shrink-0 flex items-center justify-center leading-none"
              style={{ color: badgeTextColor }}
            >
              <AnnouncementIcon icon={item.icon} className="w-[12px] h-[12px]" />
            </span>
          )}
          <span>{highlightText}</span>
        </span>
      )}

      {/* If icon exists but no highlightText, render icon in its own colored pill */}
      {!highlightText && item.icon && (
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-[4px] shrink-0"
          style={{
            backgroundColor: badgeColor,
            color: badgeTextColor,
          }}
        >
          <AnnouncementIcon icon={item.icon} className="w-[12px] h-[12px]" />
        </span>
      )}

      {/* Message Text: font weight 600, letter spacing 0.3 */}
      <span
        className="text-[11.5px] font-semibold tracking-[0.3px] whitespace-nowrap"
        style={{ color: defaultTextColor }}
      >
        {item.text}
      </span>

      {/* Botanical bullet separator */}
      <span className="opacity-35 text-[12px] pl-3 select-none font-bold">•</span>
    </div>
  )
}

/**
 * @component AnnouncementBar
 *
 * @description
 * Dynamic announcement bar powered entirely by the Medusa commerce backend.
 * Features:
 * - Dynamic backend data: fetches active announcements & bar configuration from backend API.
 * - Dynamic per-item badge colors: each badge inside color & text color is controlled from admin dashboard.
 * - Icon inside badge: vector icons are cleanly nested inside each announcement badge with perfect contrast.
 * - Dynamic scroll auto-hide: collapses smoothly from 34px to 0px on scroll.
 * - Non-interactive / No click option: strictly informational display with no links or pointer cursors.
 * - Ultra-smooth 60/120fps motion: hardware-accelerated 3D transform (`translate3d`) with zero main-thread JS interference.
 */
export function AnnouncementBar({
  items: initialItems,
  config: initialConfig,
  speedSeconds: forcedSpeed,
  className,
}: AnnouncementBarProps) {
  const [items, setItems] = useState<AnnouncementItem[]>(initialItems || MOCK_ANNOUNCEMENTS)
  const [config, setConfig] = useState<AnnouncementConfig | null>(initialConfig || null)
  const headerScroll = React.useContext(HeaderScrollContext)
  const showAnnouncement = headerScroll ? headerScroll.showAnnouncement : true

  // Dynamically load active announcements & config from backend on mount
  useEffect(() => {
    let isMounted = true

    async function loadDynamicAnnouncements() {
      try {
        const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
        const res = await fetch(`${baseUrl}/store/announcements`, {
          headers: {
            'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
            Accept: 'application/json',
          },
          cache: 'no-store',
        })

        if (!res.ok) return

        const data: BackendAnnouncementsResponse = await res.json()
        if (!isMounted) return

        if (data.config) {
          setConfig({
            isEnabled: data.config.is_enabled,
            speedSeconds: data.config.speed_seconds,
            pauseOnHover: data.config.pause_on_hover,
            highlightColor: data.config.highlight_color,
            textColor: data.config.text_color,
            bgColor: data.config.bg_color,
            is_enabled: data.config.is_enabled,
            speed_seconds: data.config.speed_seconds,
            pause_on_hover: data.config.pause_on_hover,
            highlight_color: data.config.highlight_color,
            text_color: data.config.text_color,
            bg_color: data.config.bg_color,
          })
        }

        if (Array.isArray(data.items) && data.items.length > 0) {
          const mappedItems: AnnouncementItem[] = data.items
            .filter((item) => item.is_active !== false)
            .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
            .map((item) => ({
              id: item.id,
              text: item.text,
              highlightText: item.highlight_text,
              highlight_text: item.highlight_text,
              badgeColor: item.badge_color,
              badge_color: item.badge_color,
              badgeTextColor: item.badge_text_color,
              badge_text_color: item.badge_text_color,
              icon: item.icon,
              link: item.link_url,
              link_url: item.link_url,
              displayOrder: item.display_order,
              display_order: item.display_order,
              isActive: item.is_active,
              is_active: item.is_active,
            }))

          if (mappedItems.length > 0) {
            setItems(mappedItems)
          }
        }
      } catch {
        // Graceful fallback to initialItems or MOCK_ANNOUNCEMENTS
      }
    }

    loadDynamicAnnouncements()

    return () => {
      isMounted = false
    }
  }, [])

  // Ensure enough items in each half-track so wide screens (e.g. 4K, 1440p) loop seamlessly
  const displayItems = useMemo(() => {
    if (!items || items.length === 0) return []
    let list = [...items]
    while (list.length < 6) {
      list = [...list, ...items]
    }
    return list
  }, [items])

  const isEnabled = config?.isEnabled ?? config?.is_enabled ?? true
  if (!isEnabled || items.length === 0) {
    return null
  }

  const bgColor = config?.bgColor || config?.bg_color || '#1E392A'
  const textColor = config?.textColor || config?.text_color || '#FFFFFF'
  const speed = forcedSpeed ?? config?.speedSeconds ?? config?.speed_seconds ?? 32
  const pauseOnHover = config?.pauseOnHover ?? config?.pause_on_hover ?? false
  const fallbackBadgeColor = config?.highlightColor || config?.highlight_color || '#D48B46'

  return (
    <aside
      role="region"
      aria-label="Store Announcements"
      style={{ backgroundColor: bgColor }}
      className={cn(
        'group w-full overflow-hidden relative z-40 transition-[max-height,opacity,transform] duration-300 ease-[cubic-bezier(0.33,1,0.68,1)] will-change-[max-height,opacity,transform] cursor-default select-none pointer-events-none',
        showAnnouncement
          ? 'max-h-[34px] opacity-100 translate-y-0 border-b border-black/15'
          : 'max-h-0 opacity-0 -translate-y-full border-b-0 pointer-events-none',
        className
      )}
    >
      <div className="h-[34px] flex items-center w-full relative">
        {/* Left and Right edge fade masks matching dynamic background color */}
        <div
          className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to right, ${bgColor}, transparent)`,
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to left, ${bgColor}, transparent)`,
          }}
        />

        <div
          className={cn(
            'flex items-center whitespace-nowrap w-max glorov-marquee-track animate-marquee',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
          style={{
            animationDuration: `${speed}s`,
            animationTimingFunction: 'linear',
          }}
        >
          {/* Render duplicate sets for continuous infinite seamless loop */}
          <div className="flex items-center glorov-marquee-track">
            {displayItems.map((item, idx) => (
              <SingleAnnouncement
                key={`track1-${item.id}-${idx}`}
                item={item}
                defaultBadgeColor={fallbackBadgeColor}
                defaultTextColor={textColor}
              />
            ))}
          </div>
          <div className="flex items-center glorov-marquee-track" aria-hidden="true">
            {displayItems.map((item, idx) => (
              <SingleAnnouncement
                key={`track2-${item.id}-${idx}`}
                item={item}
                defaultBadgeColor={fallbackBadgeColor}
                defaultTextColor={textColor}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
