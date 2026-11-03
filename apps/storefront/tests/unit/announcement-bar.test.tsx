import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AnnouncementBar, AnnouncementIcon, getContrastTextColor } from '../../src/components/layout/AnnouncementBar'
import type { AnnouncementItem } from '../../src/types/storefront'

describe('AnnouncementBar Component', () => {
  const mockItems: AnnouncementItem[] = [
    {
      id: 'ann-1',
      text: 'Pan-India Cold Chain Dispatch & 100% Transit Safe Guarantee',
      highlightText: '₹499 FREE DELIVERY',
      badgeColor: '#D48B46',
      badgeTextColor: '#111827',
      icon: 'truck',
      link: '/policies/shipping',
    },
    {
      id: 'ann-2',
      text: 'Heirloom & Indigenous Indian Desi Seeds Tested for Vigorous Growth',
      highlightText: '98% GERMINATION',
      badgeColor: '#2D6A4F',
      badgeTextColor: '#FFFFFF',
      icon: 'sprout',
      link: '/categories/seeds',
    },
    {
      id: 'ann-3',
      text: 'Air-Purifying & Rare Cultivars Direct From Our Pune & Bengaluru Nurseries',
      highlightText: 'NURSERY FRESH',
      badgeColor: '#D48B46',
      badgeTextColor: '#111827',
      icon: 'star',
      link: '/categories/live-plants',
    },
  ]

  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          config: {
            is_enabled: true,
            speed_seconds: 28,
            bg_color: '#1E392A',
            text_color: '#FFFFFF',
            highlight_color: '#D48B46',
            pause_on_hover: true,
          },
          items: mockItems,
        }),
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders announcement badges with embedded icons and custom colors', async () => {
    render(<AnnouncementBar items={mockItems} />)

    // Verify badge text renders
    const deliveryBadges = screen.getAllByText('₹499 FREE DELIVERY')
    expect(deliveryBadges.length).toBeGreaterThan(0)

    const germinationBadges = screen.getAllByText('98% GERMINATION')
    expect(germinationBadges.length).toBeGreaterThan(0)

    const nurseryBadges = screen.getAllByText('NURSERY FRESH')
    expect(nurseryBadges.length).toBeGreaterThan(0)

    // Check that badge pill contains the icon inside and has custom colors
    const badgePill = germinationBadges[0].parentElement
    expect(badgePill).toBeDefined()
    expect(badgePill?.style.backgroundColor).toBe('rgb(45, 106, 79)') // #2D6A4F
    expect(badgePill?.style.color).toBe('rgb(255, 255, 255)') // #FFFFFF

    // Check SVG icon exists inside the badge pill
    const svgIcon = badgePill?.querySelector('svg')
    expect(svgIcon).not.toBeNull()
  })

  it('calculates optimal contrast text color', () => {
    // Light / warm colors should get dark text #111827
    expect(getContrastTextColor('#D48B46')).toBe('#111827')
    expect(getContrastTextColor('#FFD51F')).toBe('#111827')
    expect(getContrastTextColor('#FFFFFF')).toBe('#111827')

    // Dark colors should get white text #FFFFFF
    expect(getContrastTextColor('#1B4332')).toBe('#FFFFFF')
    expect(getContrastTextColor('#7A1C2E')).toBe('#FFFFFF')
    expect(getContrastTextColor('#000000')).toBe('#FFFFFF')
  })

  it('renders different vector icon types without errors', () => {
    const { container: truckContainer } = render(<AnnouncementIcon icon="truck" />)
    expect(truckContainer.querySelector('svg')).toBeDefined()

    const { container: sproutContainer } = render(<AnnouncementIcon icon="sprout" />)
    expect(sproutContainer.querySelector('svg')).toBeDefined()

    const { container: starContainer } = render(<AnnouncementIcon icon="star" />)
    expect(starContainer.querySelector('svg')).toBeDefined()

    const { container: shieldContainer } = render(<AnnouncementIcon icon="shield" />)
    expect(shieldContainer.querySelector('svg')).toBeDefined()

    const { container: boltContainer } = render(<AnnouncementIcon icon="bolt" />)
    expect(boltContainer.querySelector('svg')).toBeDefined()
  })

  it('fetches dynamic announcements from backend API', async () => {
    render(<AnnouncementBar />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })
  })
})
