import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import GardenServicesPage from '../app/garden-services/page'
import { GardenServiceBookingForm } from '../app/garden-services/GardenServiceBookingForm'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/garden-services',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('End-to-End Garden Services Page', () => {
  it('renders hero title, breadcrumbs, and trust stats bar', () => {
    render(<GardenServicesPage />)

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /End-to-End Garden Services & Botanical Maintenance/i,
      })
    ).toBeDefined()

    expect(screen.getByText(/5,000\+/i)).toBeDefined()
    expect(screen.getByText(/98\.2%/i)).toBeDefined()
    expect(screen.getByText(/Organic Coco-Peat & Biochar Mediums/i)).toBeDefined()
    expect(screen.getByText(/In-House Horticultural Specialists/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders all four core botanical service packages with pricing', () => {
    render(<GardenServicesPage />)

    expect(screen.getByRole('heading', { level: 3, name: /Balcony Garden Makeover/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Terrace Edible Kitchen Farm/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Indoor Biophilic & Office Styling/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Periodic Horticultural Maintenance/i })).toBeDefined()

    expect(screen.getByText(/From ₹4,999/i)).toBeDefined()
    expect(screen.getByText(/From ₹8,999 • 0% GST/i)).toBeDefined()
    expect(screen.getByText(/From ₹1,499 \/ Visit/i)).toBeDefined()
  })

  it('renders before-and-after transformation case studies', () => {
    render(<GardenServicesPage />)

    expect(screen.getByText(/Koramangala 4th Block Balcony Oasis/i)).toBeDefined()
    expect(screen.getByText(/Baner Rooftop Edible Farm/i)).toBeDefined()
    expect(screen.getByText(/Bandra Minimalist Living Sanctuary/i)).toBeDefined()
    expect(screen.getByText(/Bengaluru, Karnataka/i)).toBeDefined()
  })

  it('submits site assessment form and displays optimistic confirmation ticket', async () => {
    render(<GardenServiceBookingForm />)

    // Fill form
    const nameInput = screen.getByLabelText(/Full Name \*/i)
    const phoneInput = screen.getByLabelText(/Mobile Number \(\+91\) \*/i)
    const notesInput = screen.getByLabelText(/Special Vision or Plant Preferences/i)

    fireEvent.change(nameInput, { target: { value: 'Ananya Deshmukh' } })
    fireEvent.change(phoneInput, { target: { value: '9822099999' } })
    fireEvent.change(notesInput, { target: { value: 'Looking for a private reading nook with fragrant night-blooming jasmine.' } })

    const submitBtn = screen.getByRole('button', { name: /Book In-Person Site Assessment/i })
    fireEvent.click(submitBtn)

    await waitFor(
      () => {
        expect(screen.getByRole('heading', { level: 3, name: /Site Assessment Booked Successfully!/i })).toBeDefined()
        expect(screen.getByText(/GLR-SRV-/i)).toBeDefined()
        expect(screen.getByText(/Ananya Deshmukh/i)).toBeDefined()
        expect(screen.getByText(/Fast-Track on WhatsApp Concierge/i)).toBeDefined()
      },
      { timeout: 2000 }
    )

    // Reset button
    const resetBtn = screen.getByRole('button', { name: /Book Another Assessment/i })
    fireEvent.click(resetBtn)

    expect(screen.getByLabelText(/Full Name \*/i)).toBeDefined()
  })
})
