import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AnnouncementBar } from '../components/common/AnnouncementBar'

describe('AnnouncementBar Marquee Component', () => {
  it('renders marquee ticker with correct accessible region label', () => {
    render(<AnnouncementBar />)
    const aside = screen.getByRole('region', { name: /storefront announcement marquee/i })
    expect(aside).toBeInTheDocument()
  })

  it('renders the ₹499 free express delivery threshold badge and message', () => {
    render(<AnnouncementBar />)
    const badges = screen.getAllByText('₹499 FREE DELIVERY')
    expect(badges.length).toBeGreaterThanOrEqual(1)

    const texts = screen.getAllByText(/FREE EXPRESS BOTANICAL DELIVERY ON ORDERS OVER ₹499/i)
    expect(texts.length).toBeGreaterThanOrEqual(1)
  })

  it('renders all default botanical promotional items in the ticker', () => {
    render(<AnnouncementBar />)
    expect(screen.getAllByText(/GROW MORE. LIVE GREENER/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/USE CODE GLOROV10/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/100% ORGANIC & NON-GMO/i).length).toBeGreaterThanOrEqual(1)
  })
})
