import React from 'react'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CareersPage from '../app/careers/page'
import { CareersInteractive } from '../app/careers/CareersInteractive'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/careers',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Careers Page & Botanical Talent Pipeline', () => {
  it('renders hero title, breadcrumbs, culture stats and benefit pillars', () => {
    render(<CareersPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Grow Your Career With Living Nature/i })
    ).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()

    // Stats
    expect(screen.getByText('25 Acres')).toBeDefined()
    expect(screen.getByText('120+')).toBeDefined()
    expect(screen.getByText('4 Studios')).toBeDefined()
    expect(screen.getByText('100% Organic')).toBeDefined()

    // Culture Pillars
    expect(screen.getByText(/Biophilic Working Sanctuaries/i)).toBeDefined()
    expect(screen.getByText(/Master Botanical Mentorship/i)).toBeDefined()
    expect(screen.getByText(/Annual Green Allowance/i)).toBeDefined()
    expect(screen.getByText(/Holistic Health & Rest Protocols/i)).toBeDefined()
  })

  it('renders open job roles and filters by department', () => {
    render(<CareersInteractive />)

    // All roles initial count
    expect(screen.getByText(/Senior Plant Pathologist & Nursery Lead/i)).toBeDefined()
    expect(screen.getByText(/Botanical Packaging & Cold-Chain Specialist/i)).toBeDefined()
    expect(screen.getByText(/Senior Full-Stack E-Commerce Engineer/i)).toBeDefined()
    expect(screen.getByText(/Experiential Studio Lead & Botanical Stylist/i)).toBeDefined()
    expect(screen.getByText(/Heirloom Seed Cultivation Specialist/i)).toBeDefined()

    // Filter by Technology / Engineering
    const techBtn = screen.getByRole('tab', { name: /Engineering/i })
    fireEvent.click(techBtn)

    expect(screen.getByText(/Senior Full-Stack E-Commerce Engineer/i)).toBeDefined()
    expect(screen.queryByText(/Senior Plant Pathologist & Nursery Lead/i)).toBeNull()

    // Filter back to All
    const allBtn = screen.getByRole('tab', { name: /All Openings/i })
    fireEvent.click(allBtn)
    expect(screen.getByText(/Senior Plant Pathologist & Nursery Lead/i)).toBeDefined()
  })

  it('opens application modal and submits application successfully with ticket code', () => {
    render(<CareersInteractive />)

    const applyButtons = screen.getAllByRole('button', { name: /Apply for/i })
    expect(applyButtons.length).toBeGreaterThan(0)

    // Click first apply button
    fireEvent.click(applyButtons[0])

    // Modal should be open
    const modal = screen.getByRole('dialog')
    expect(modal).toBeDefined()
    expect(within(modal).getByRole('heading', { level: 3, name: /Senior Plant Pathologist & Nursery Lead/i })).toBeDefined()

    // Fill form
    const nameInput = screen.getByLabelText(/Full Name \*/i)
    const emailInput = screen.getByLabelText(/Email Address \*/i)
    const phoneInput = screen.getByLabelText(/Mobile Number \(\+91\) \*/i)

    fireEvent.change(nameInput, { target: { value: 'Ananya Deshmukh' } })
    fireEvent.change(emailInput, { target: { value: 'ananya.deshmukh@botany.org' } })
    fireEvent.change(phoneInput, { target: { value: '9876543210' } })

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Submit Application/i })
    fireEvent.click(submitBtn)

    // Confirmation receipt check
    expect(screen.getByText(/Application Received!/i)).toBeDefined()
    expect(screen.getByText(/Ananya Deshmukh/i)).toBeDefined()
    expect(screen.getByText(/GLR-CAREER-/i)).toBeDefined()

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /Close Window/i })
    fireEvent.click(closeBtn)

    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
