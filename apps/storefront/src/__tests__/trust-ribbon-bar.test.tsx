import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ValuePropositions } from '@/components/home/ValuePropositions'

describe('GLOROV Botanical Trust Ribbon Bar (Image 2 Redesign)', () => {
  it('renders all 4 trust guarantee pillars matching User Reference Image', () => {
    render(<ValuePropositions />)

    // Check titles matching User Reference Image
    expect(screen.getByText('100% Organic & Non-GMO')).toBeInTheDocument()
    expect(screen.getByText('Safe Transit Guarantee')).toBeInTheDocument()
    expect(screen.getByText('Lifetime Plant Support')).toBeInTheDocument()
    expect(screen.getByText('Eco-Friendly Philosophy')).toBeInTheDocument()
  })

  it('renders within a botanical green theme ribbon container', () => {
    const { container } = render(<ValuePropositions />)
    const ribbon = container.querySelector('[class*="trustRibbon"]') as HTMLElement

    expect(ribbon).toBeInTheDocument()
    // Verify background color is set to botanical green
    expect(ribbon.style.backgroundColor).toBe('rgb(27, 67, 50)') // #1B4332
  })

  it('renders circular white badges with custom SVG icons for each guarantee', () => {
    const { container } = render(<ValuePropositions />)
    const iconCircles = container.querySelectorAll('[class*="ribbonIconCircle"]')

    expect(iconCircles.length).toBe(4)
    iconCircles.forEach((circle) => {
      expect(circle.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('renders vertical dividers between adjacent trust items', () => {
    const { container } = render(<ValuePropositions />)
    const dividers = container.querySelectorAll('[class*="ribbonDivider"]')

    // 4 items have 3 dividers between them
    expect(dividers.length).toBe(3)
  })

  it('provides navigation links for actionable policies', () => {
    render(<ValuePropositions />)

    const shippingLink = screen.getByRole('link', { name: /Safe Transit Guarantee/i })
    expect(shippingLink).toHaveAttribute('href', '/policies/shipping-policy')

    const supportLink = screen.getByRole('link', { name: /Lifetime Plant Support/i })
    expect(supportLink).toHaveAttribute('href', '/plant-doctor')

    const seedsLink = screen.getByRole('link', { name: /100% Organic & Non-GMO/i })
    expect(seedsLink).toHaveAttribute('href', '/categories/seeds')

    const ecoLink = screen.getByRole('link', { name: /Eco-Friendly Philosophy/i })
    expect(ecoLink).toHaveAttribute('href', '/about')
  })
})
