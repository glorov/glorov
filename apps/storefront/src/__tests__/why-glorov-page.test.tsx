import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import WhyGlorovPage from '../app/why-glorov/page'
import { ComparisonMatrixInteractive } from '../app/why-glorov/ComparisonMatrixInteractive'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/why-glorov',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Why GLOROV / Botanical Benchmark Page', () => {
  it('renders hero title, breadcrumbs, and trust stats bar', () => {
    render(<WhyGlorovPage />)

    expect(
      screen.getByRole('heading', { level: 1, name: /Why Choose GLOROV Botanicals\?/i })
    ).toBeDefined()

    expect(screen.getAllByText(/3-Step/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Horticultural Quality Check/i)).toBeDefined()
    expect(screen.getByText(/Organic Neem Pest-Controlled/i)).toBeDefined()
    expect(screen.getAllByText(/Live Plant Replacement Guarantee/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/HSN 1209 Certified Organic Seeds/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders comparison matrix with all core botanical benchmarks', () => {
    render(<ComparisonMatrixInteractive />)

    expect(screen.getByText(/Plant Health & Vigour/i)).toBeDefined()
    expect(screen.getByText(/Pest & Pathogen Control/i)).toBeDefined()
    expect(screen.getByText(/Potting Medium & Drainage/i)).toBeDefined()
    expect(screen.getByText(/Immediate Repotting Needed\?/i)).toBeDefined()
    expect(screen.getByText(/Growing Origin & Traceability/i)).toBeDefined()
    expect(screen.getByText(/Transit Guarantee & Packaging/i)).toBeDefined()
    expect(screen.getByText(/Statutory 0% GST Invoicing/i)).toBeDefined()
    expect(screen.getByText(/Post-Purchase Plant Care/i)).toBeDefined()
  })

  it('toggles mobile competitor views between local nurseries and generic online', () => {
    render(<ComparisonMatrixInteractive />)

    const vsLocalBtn = screen.getByRole('button', { name: /vs Local Nurseries/i })
    const vsOnlineBtn = screen.getByRole('button', { name: /vs Generic Online/i })

    expect(vsLocalBtn).toBeDefined()
    expect(vsOnlineBtn).toBeDefined()

    // Switch to generic online
    fireEvent.click(vsOnlineBtn)
    expect(vsOnlineBtn.getAttribute('aria-pressed')).toBe('true')

    // Switch back to local nurseries
    fireEvent.click(vsLocalBtn)
    expect(vsLocalBtn.getAttribute('aria-pressed')).toBe('true')
  })

  it('renders four pillars of botanical excellence and CTA banner', () => {
    render(<WhyGlorovPage />)

    expect(screen.getByRole('heading', { level: 3, name: /Direct Pune Nursery Dispatch/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Moisture-Shield Crating/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Bioactive Soil Chemistry/i })).toBeDefined()
    expect(screen.getByRole('heading', { level: 3, name: /Lifetime Agronomist Support/i })).toBeDefined()

    expect(screen.getByRole('link', { name: /Explore Botanical Catalog/i })).toBeDefined()
  })
})
