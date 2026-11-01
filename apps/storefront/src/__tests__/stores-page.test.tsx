import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import StoresPage from '../app/stores/page'
import { StoreLocatorList } from '../app/stores/StoreLocatorList'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/stores',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

describe('Botanical Studios & Store Locator Page', () => {
  it('renders hero title, studio amenities, and breadcrumb navigation', () => {
    render(<StoresPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Visit GLOROV Botanical Studios/i })).toBeDefined()
    expect(screen.getAllByText(/Free Organic Repotting/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Resident Plant Doctor/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Heirloom Seed Vault/i)).toBeDefined()
    expect(screen.getByText(/Hands-On Workshops/i)).toBeDefined()

    // Breadcrumbs
    expect(screen.getByRole('navigation', { name: /breadcrumb/i })).toBeDefined()
  })

  it('renders all 4 studios initially under default All Studios filter', () => {
    render(<StoreLocatorList />)

    expect(screen.getByText(/Pune Koregaon Park Botanical Studio/i)).toBeDefined()
    expect(screen.getByText(/Mumbai Bandra Botanical Studio/i)).toBeDefined()
    expect(screen.getByText(/Bengaluru Indiranagar Botanical Studio/i)).toBeDefined()
    expect(screen.getByText(/Delhi Saket Botanical Studio/i)).toBeDefined()
    expect(screen.getByText(/Mother Nursery Flagship/i)).toBeDefined()
  })

  it('filters studios interactively by city tabs', () => {
    render(<StoreLocatorList />)

    // Click Pune tab
    const puneTab = screen.getByRole('tab', { name: /Pune Flagship/i })
    fireEvent.click(puneTab)

    expect(screen.getByText(/Pune Koregaon Park Botanical Studio/i)).toBeDefined()
    expect(screen.queryByText(/Mumbai Bandra Botanical Studio/i)).toBeNull()
    expect(screen.queryByText(/Delhi Saket Botanical Studio/i)).toBeNull()

    // Click Mumbai tab
    const mumbaiTab = screen.getByRole('tab', { name: /Mumbai/i })
    fireEvent.click(mumbaiTab)

    expect(screen.getByText(/Mumbai Bandra Botanical Studio/i)).toBeDefined()
    expect(screen.queryByText(/Pune Koregaon Park Botanical Studio/i)).toBeNull()

    // Click Bengaluru tab
    const blrTab = screen.getByRole('tab', { name: /Bengaluru/i })
    fireEvent.click(blrTab)

    expect(screen.getByText(/Bengaluru Indiranagar Botanical Studio/i)).toBeDefined()

    // Click All Studios tab to restore
    const allTab = screen.getByRole('tab', { name: /All Studios \(4\)/i })
    fireEvent.click(allTab)

    expect(screen.getByText(/Pune Koregaon Park Botanical Studio/i)).toBeDefined()
    expect(screen.getByText(/Delhi Saket Botanical Studio/i)).toBeDefined()
  })

  it('renders studio details including directions, call links, and amenities', () => {
    render(<StoreLocatorList />)

    // Check directions link
    const directionsLink = screen.getByRole('link', {
      name: /Get directions to Pune Koregaon Park Botanical Studio/i,
    })
    expect(directionsLink.getAttribute('href')).toContain('maps.google.com')

    // Check phone call link
    const callLink = screen.getByRole('link', {
      name: /Call Pune Koregaon Park Botanical Studio/i,
    })
    expect(callLink.getAttribute('href')).toContain('tel:')

    // Check amenities
    expect(screen.getAllByText(/✓ Free Organic Repotting Bar/i).length).toBeGreaterThanOrEqual(1)
  })

  it('renders upcoming in-studio workshops and nursery visit banner on page', () => {
    render(<StoresPage />)

    expect(screen.getByRole('heading', { level: 2, name: /Upcoming Botanical Masterclasses/i })).toBeDefined()
    expect(screen.getByText(/Kitchen Microgreens & Seed Starting/i)).toBeDefined()
    expect(screen.getByText(/Ficus Bonsai Pruning & Root Training/i)).toBeDefined()
    expect(screen.getByText(/Living Moss & Fern Terrarium Biomes/i)).toBeDefined()
    expect(screen.getByText(/Want to Visit Our 25-Acre Mother Nursery\?/i)).toBeDefined()
  })
})
