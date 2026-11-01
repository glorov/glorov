import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AboutPage from '../app/about/page'

describe('AboutPage Component Tests', () => {
  it('1. Renders about page with hero title and nursery heritage story', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Bringing Green Sanctuaries to Indian Homes/i })).toBeInTheDocument()
    expect(screen.getByText(/Rooted in Pune’s Rich Horticultural Heritage/i)).toBeInTheDocument()
    expect(screen.getByText(/Conditioned for Climate Resilience/i)).toBeInTheDocument()
  })

  it('2. Renders 4 pillars of GLOROV botany', () => {
    render(<AboutPage />)

    expect(screen.getByRole('heading', { level: 2, name: /The Four Pillars of GLOROV Botany/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Direct From Pune Nursery/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Pure Desi & Organic Seeds/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Moisture-Shield Transit/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 3, name: /Lifelong Expert Guidance/i })).toBeInTheDocument()
  })

  it('3. Renders milestones and call to action buttons', () => {
    render(<AboutPage />)

    expect(screen.getByText('50,000+')).toBeInTheDocument()
    expect(screen.getByText('19,000+')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Shop Living Plants/i })).toHaveAttribute('href', '/categories/live-plants')
    expect(screen.getByRole('link', { name: /Explore Desi Seeds/i })).toHaveAttribute('href', '/categories/seeds')
  })
})
