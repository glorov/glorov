import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import CareCompanionPage from '../app/care-companion/page'
import { CareScheduleCalculator } from '../app/care-companion/CareScheduleCalculator'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/care-companion',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Digital Plant Care Companion Page', () => {
  it('renders hero title, breadcrumb navigation, and feature cards', () => {
    render(<CareCompanionPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Digital Plant Care Companion/i })).toBeDefined()
    expect(screen.getByText(/Precise Hydration/i)).toBeDefined()
    expect(screen.getByText(/Calendar Sync/i)).toBeDefined()
    expect(screen.getByText(/Root-Safe Protocols/i)).toBeDefined()
    expect(screen.getByText(/WhatsApp Reminders/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders configuration inputs and updates care metrics on plant change', () => {
    render(<CareScheduleCalculator />)

    // Check dropdowns exist
    const plantSelect = screen.getByLabelText(/Select Your Botanical Specimen/i)
    expect(plantSelect).toBeDefined()

    // Initial default is Monstera
    expect(screen.getByText(/Monstera Deliciosa \(Swiss Cheese Plant\)/i)).toBeDefined()
    expect(screen.getByText(/Monstera deliciosa Liebm\./i)).toBeDefined()

    // Change to Snake Plant
    fireEvent.change(plantSelect, { target: { value: 'snake_plant' } })

    expect(screen.getByRole('heading', { level: 3, name: /Sansevieria Trifasciata/i })).toBeDefined()
    expect(screen.getByText(/Dracaena trifasciata \(Laurentii\)/i)).toBeDefined()
    expect(screen.getByText(/None \(Keep foliage strictly dry\)/i)).toBeDefined()
  })

  it('dynamically recalibrates watering frequency based on pot size, light, and season', () => {
    render(<CareScheduleCalculator />)

    // Select Peace Lily
    const plantSelect = screen.getByLabelText(/Select Your Botanical Specimen/i)
    fireEvent.change(plantSelect, { target: { value: 'peace_lily' } })

    // Select Summer season (accelerates drying)
    const seasonSelect = screen.getByLabelText(/Season & Ambient Climate/i)
    fireEvent.change(seasonSelect, { target: { value: 'summer' } })

    // Select Small pot
    const potSelect = screen.getByLabelText(/Planter \/ Pot Size/i)
    fireEvent.change(potSelect, { target: { value: 'small' } })

    // Watering frequency pill should be displayed
    expect(screen.getAllByText(/Water Every/i).length).toBeGreaterThanOrEqual(1)
  })

  it('subscribes to WhatsApp care reminders and shows confirmation', async () => {
    render(<CareScheduleCalculator />)

    const input = screen.getByLabelText(/WhatsApp Number or Email for Care Reminders/i)
    fireEvent.change(input, { target: { value: '+91 98220 99999' } })

    const submitBtn = screen.getByRole('button', { name: /Activate Care Alerts/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Care alerts active for/i)).toBeDefined()
    })
  })

  it('renders the 4 Golden Rules of Plant Hydration and Plant Doctor banner', () => {
    render(<CareCompanionPage />)

    expect(screen.getByRole('heading', { level: 2, name: /4 Golden Rules of Plant Hydration/i })).toBeDefined()
    expect(screen.getByText(/The 2-Inch Finger Moisture Test/i)).toBeDefined()
    expect(screen.getByText(/Zero Standing Water in Saucers/i)).toBeDefined()
    expect(screen.getByText(/Rest Municipal Tap Water 24 Hours/i)).toBeDefined()
    expect(screen.getByText(/Hydrate Exclusively in Morning Hours/i)).toBeDefined()

    expect(screen.getByRole('link', { name: /Consult Plant Doctor Clinic/i })).toBeDefined()
  })
})
