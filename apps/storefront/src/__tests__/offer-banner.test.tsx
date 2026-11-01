import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OfferBanner } from '@/components/home/OfferBanner'

describe('Storefront OfferBanner Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    })
  })

  it('renders the default welcome offer matching design specifications', () => {
    render(<OfferBanner />)

    expect(screen.getByText('SPECIAL WELCOME OFFER')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Use code GLOROV10 at checkout for an extra 10% off your entire botanical order.'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('GLOROV10')).toBeInTheDocument()
    expect(screen.getByText('COPY')).toBeInTheDocument()
    expect(screen.getByText('10% OFF')).toBeInTheDocument()
  })

  it('copies coupon code to clipboard and updates button state to COPIED', async () => {
    render(<OfferBanner />)

    const copyBtn = screen.getByRole('button', { name: /copy discount code glorov10/i })
    expect(copyBtn).toHaveTextContent('COPY')

    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('GLOROV10')
    expect(copyBtn).toHaveTextContent('COPIED')
  })
})
