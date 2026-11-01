import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import GiftingPage from '@/app/gifting/page'
import { GiftingInquiryForm } from '@/app/gifting/GiftingInquiryForm'

describe('Corporate & Green Botanical Gifting Page', () => {
  it('1. Renders hero section, statistics, and curated gift collections', () => {
    render(<GiftingPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Gift a Life that Grows & Thrives/i })
    ).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText(/Living Botanicals & Heirloom Seeds/i)).toBeInTheDocument()
    expect(screen.getByText('19k+')).toBeInTheDocument()

    // Curated packages
    expect(screen.getByText('Executive Air-Purifier Trio')).toBeInTheDocument()
    expect(screen.getByText('Prosperity & Wellness Duo')).toBeInTheDocument()
    expect(screen.getByText('Organic Kitchen Garden Hamper')).toBeInTheDocument()
    expect(screen.getByText('Desktop Succulent Harmony')).toBeInTheDocument()

    // Pricing
    expect(screen.getByText('₹1,199')).toBeInTheDocument()
    expect(screen.getByText('₹549')).toBeInTheDocument()
  })

  it('2. Renders corporate contact details and trust badges', () => {
    render(<GiftingPage />)

    expect(screen.getByText('+91 80870 87224')).toBeInTheDocument()
    expect(screen.getByText('corporate@glorov.in')).toBeInTheDocument()
    expect(
      screen.getByText(/Statutory GST Invoicing with Input Tax Credit/i)
    ).toBeInTheDocument()
  })

  it('3. Allows completing and submitting the corporate inquiry form', async () => {
    render(<GiftingInquiryForm />)

    fireEvent.change(screen.getByLabelText(/Your Full Name/i), {
      target: { value: 'Kiran Mazumdar' },
    })
    fireEvent.change(screen.getByLabelText(/Company \/ Organization/i), {
      target: { value: 'Biocon Labs' },
    })
    fireEvent.change(screen.getByLabelText(/Work Email Address/i), {
      target: { value: 'kiran@biocon.com' },
    })
    fireEvent.change(screen.getByLabelText(/Mobile \/ WhatsApp/i), {
      target: { value: '+91 98765 11111' },
    })

    const submitBtn = screen.getByRole('button', { name: /Submit Corporate Gifting Inquiry/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Gifting Quotation Request Received/i })
      ).toBeInTheDocument()
      expect(screen.getByText(/Kiran Mazumdar/i)).toBeInTheDocument()
      expect(screen.getByText(/Biocon Labs/i)).toBeInTheDocument()
      expect(screen.getByText(/GLR-GIFT-/i)).toBeInTheDocument()
    })
  })
})
