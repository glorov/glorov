import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroBannerSlider } from '../../src/components/home/HeroBannerSlider'
import { ValuePropsRibbon, GlorovOfferBanner } from '../../src/components/home/ValuePropsRibbon'
import { CategoryDiscoveryGrid } from '../../src/components/home/CategoryDiscoveryGrid'
import { FeaturedProductsSection } from '../../src/components/home/FeaturedProductsSection'
import { BotanicalEditorialShowcase } from '../../src/components/home/BotanicalEditorialShowcase'
import { StorefrontProvider } from '../../src/context/StorefrontContext'
import { MOCK_PRODUCTS } from '../../src/lib/mock-products'

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
  it('renders 4 trust guarantee pillars without banner when none is active and highlighted', () => {
    render(
      <StorefrontProvider>
        <ValuePropsRibbon />
      </StorefrontProvider>
    )

    expect(screen.queryByText(/FIRST10/i)).toBeNull()
    expect(screen.getByText('90-Day Pre-Fertilised Soil')).toBeDefined()
    expect(screen.getByText('Arrives Healthy Guaranteed')).toBeDefined()
    expect(screen.getByText('Free Plant Replacement')).toBeDefined()
    expect(screen.getByText('Lifetime Botanical Support')).toBeDefined()
  })

  it('renders active highlighted banner when an offer is set as featured banner', () => {
    const featuredOffer = {
      id: 'off-diwali10',
      code: 'DIWALI10',
      title: '10% OFF',
      tag: 'FESTIVE BOTANICAL OFFER',
      description: '10% OFF On orders above ₹999',
      is_active: true,
      is_highlighted: true,
    }

    render(
      <StorefrontProvider>
        <GlorovOfferBanner offer={featuredOffer} />
      </StorefrontProvider>
    )

    expect(screen.getByText(/DIWALI10/i)).toBeDefined()
    expect(screen.getByText(/FESTIVE BOTANICAL OFFER/i)).toBeDefined()
  })
})

describe('Homepage — CategoryDiscoveryGrid', () => {
  it('renders core botanical categories with counts and badges', () => {
    render(<CategoryDiscoveryGrid />)
    expect(screen.getAllByText('Seeds').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Vegetables').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Living Plants').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Flowers').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Herbs').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('98% Germination')).toBeDefined()
  })
})

describe('Homepage — FeaturedProductsSection', () => {
  it('renders filter tabs and filters product cards', () => {
    render(
      <StorefrontProvider>
        <FeaturedProductsSection initialProducts={MOCK_PRODUCTS} />
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
