import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroBannerSlider } from '../../src/components/home/HeroBannerSlider'
import { ValuePropsRibbon } from '../../src/components/home/ValuePropsRibbon'
import { CategoryDiscoveryGrid } from '../../src/components/home/CategoryDiscoveryGrid'
import { FeaturedProductsSection } from '../../src/components/home/FeaturedProductsSection'
import { BotanicalEditorialShowcase } from '../../src/components/home/BotanicalEditorialShowcase'
import { StorefrontProvider } from '../../src/context/StorefrontContext'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
  }),
  usePathname: () => '/',
}))

describe('Homepage — HeroBannerSlider', () => {
  it('renders carousel slider with navigation controls and accessibility semantics', () => {
    render(<HeroBannerSlider />)
    expect(screen.getByRole('region', { name: /Promotional Hero Banners/i })).toBeDefined()
    expect(screen.getByText(/Grow Fresh\. Live Green\./i)).toBeDefined()
    expect(screen.getByLabelText('Next banner slide')).toBeDefined()
    expect(screen.getByLabelText('Previous banner slide')).toBeDefined()
  })

  it('cycles to next slide when next button is clicked', () => {
    render(<HeroBannerSlider />)
    const nextBtn = screen.getByLabelText('Next banner slide')
    fireEvent.click(nextBtn)
    expect(screen.getByText(/Let Your Garden Bloom\./i)).toBeDefined()
  })
})

describe('Homepage — ValuePropsRibbon', () => {
  it('renders welcome coupon offer and 4 trust guarantee pillars', () => {
    render(
      <StorefrontProvider>
        <ValuePropsRibbon />
      </StorefrontProvider>
    )

    expect(screen.getAllByText(/FIRST10/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('90-Day Pre-Fertilised Soil')).toBeDefined()
    expect(screen.getByText('Arrives Healthy Guaranteed')).toBeDefined()
    expect(screen.getByText('Free Plant Replacement')).toBeDefined()
    expect(screen.getByText('Lifetime Botanical Support')).toBeDefined()
  })
})

describe('Homepage — CategoryDiscoveryGrid', () => {
  it('renders 4 root categories with counts and badges', () => {
    render(<CategoryDiscoveryGrid />)
    expect(screen.getAllByText('Seeds').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Live Plants').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Planters & Pots').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Plant Care & Soil').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('98% Germination')).toBeDefined()
  })
})

describe('Homepage — FeaturedProductsSection', () => {
  it('renders filter tabs and filters product cards', () => {
    render(
      <StorefrontProvider>
        <FeaturedProductsSection />
      </StorefrontProvider>
    )

    expect(screen.getByText(/All Featured/)).toBeDefined()
    expect(screen.getByText(/Live Plants/)).toBeDefined()
    expect(screen.getByText(/Heirloom Seeds/)).toBeDefined()

    const plantTab = screen.getByText(/Live Plants/)
    fireEvent.click(plantTab)
    expect(screen.getAllByText(/Peace Lily Plant/i).length).toBeGreaterThan(0)
  })
})

describe('Homepage — BotanicalEditorialShowcase', () => {
  it('renders editorial certified organic heading and trust metrics', () => {
    render(<BotanicalEditorialShowcase />)
    expect(screen.getByText('CERTIFIED 100% ORGANIC NURSERY')).toBeDefined()
    expect(screen.getByText(/Nurture Nature in Every Corner of Your Home/i)).toBeDefined()
    expect(screen.getByText('98%+')).toBeDefined()
    expect(screen.getByText('100%')).toBeDefined()
    expect(screen.getByText('50k+')).toBeDefined()
  })
})
