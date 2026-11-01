import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ShippingPolicyPage from '../app/policies/shipping-policy/page'
import RefundPolicyPage from '../app/policies/refund-policy/page'
import TermsOfServicePage from '../app/policies/terms-of-service/page'
import PrivacyPolicyPage from '../app/policies/privacy-policy/page'
import CorporateGiftingPolicyPage from '../app/policies/corporate-gifting-policy/page'

vi.mock('next/navigation', () => ({
  usePathname: () => '/policies/shipping-policy',
}))

describe('Policy Pages Component Tests', () => {
  it('1. Renders Shipping Policy with Pune nursery SLAs and table', () => {
    render(<ShippingPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Safe-Transit Shipping & Delivery Policy/i })).toBeInTheDocument()
    expect(screen.getByText(/Pune Nursery Dispatch Protocols/i)).toBeInTheDocument()
    expect(screen.getByText(/FREE Delivery/i)).toBeInTheDocument()
  })

  it('2. Renders Refund Policy with 48-hour live plant guarantee', () => {
    render(<RefundPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Cancellations & Replacement Policy/i })).toBeInTheDocument()
    expect(screen.getByText(/The 48-Hour Live Plant Arrival Guarantee/i)).toBeInTheDocument()
    expect(screen.getByText(/Perishable Botanical Policy/i)).toBeInTheDocument()
  })

  it('3. Renders Terms of Service with statutory 0% GST (HSN 1209)', () => {
    render(<TermsOfServicePage />)
    expect(screen.getByRole('heading', { level: 1, name: /Terms of Botanical Service/i })).toBeInTheDocument()
    expect(screen.getByText(/0% GST on Seeds \(HSN Code 1209\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Payment Terms & COD Safety Guardrails/i)).toBeInTheDocument()
  })

  it('4. Renders Privacy Policy with DPDP Act 2023 compliance', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Privacy & Data Protection Policy/i })).toBeInTheDocument()
    expect(screen.getByText(/Data Collection & Strict Minimization/i)).toBeInTheDocument()
    expect(screen.getByText(/Our Zero-Sale Privacy Pledge/i)).toBeInTheDocument()
  })

  it('5. Renders Corporate Gifting Policy with MOQ tiers and statutory 0% GST (HSN 1209)', () => {
    render(<CorporateGiftingPolicyPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Corporate Gifting & Bulk Procurement Policy/i })).toBeInTheDocument()
    expect(screen.getByText(/Minimum Order Quantities \(MOQ\) & Nursery Capacity/i)).toBeInTheDocument()
    expect(screen.getByText(/B2B GST Compliance & 0% Statutory Tax \(HSN Code 1209\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Zero-Plastic Custom Branding & Plantable Seed-Paper/i)).toBeInTheDocument()
    expect(screen.getByText(/Multi-Drop PAN-India Doorstep Logistics/i)).toBeInTheDocument()
    expect(screen.getByText(/The 48-Hour Live Plant Enterprise Guarantee/i)).toBeInTheDocument()
  })
})
