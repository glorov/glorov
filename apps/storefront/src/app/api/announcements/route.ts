import { NextResponse } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../lib/constants'
import type { AnnouncementConfig, AnnouncementItem } from '../../../types/storefront'

export const dynamic = 'force-dynamic'

interface StoreAnnouncementsResponse {
  config: {
    is_enabled: boolean
    speed_seconds: number
    bg_color: string
    text_color: string
    highlight_color: string
    pause_on_hover: boolean
    updated_at: string
  }
  items: Array<{
    id: string
    text: string
    highlight_text?: string
    badge_color?: string
    badge_text_color?: string
    icon?: string
    link_url?: string
    display_order: number
    is_active: boolean
    created_at: string
    updated_at: string
  }>
  count: number
}

/**
 * GET /api/announcements
 * Proxies dynamic announcement configuration and items from Medusa Commerce backend.
 */
export async function GET() {
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/announcements`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream backend returned status ${res.status}` },
        { status: res.status }
      )
    }

    const data: StoreAnnouncementsResponse = await res.json()

    // Normalize to camelCase storefront format while preserving snake_case
    const normalizedConfig: AnnouncementConfig = {
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
    }

    const normalizedItems: AnnouncementItem[] = (data.items || []).map((item) => ({
      id: item.id,
      text: item.text,
      highlightText: item.highlight_text,
      highlight_text: item.highlight_text,
      badgeColor: item.badge_color,
      badge_color: item.badge_color,
      badgeTextColor: item.badge_text_color,
      badge_text_color: item.badge_text_color,
      icon: item.icon || 'local_shipping',
      link: item.link_url || '/store',
      link_url: item.link_url || '/store',
    }))

    return NextResponse.json(
      {
        config: normalizedConfig,
        items: normalizedItems,
        count: normalizedItems.length,
      },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
