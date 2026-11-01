import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ShipmentTrackerPage from '../app/shipping/tracker/page'

const mockPush = vi.fn()
let mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}))

vi.mock('@/components/shipping/ShipmentTracker', () => ({
  ShipmentTracker: ({ orderId }: { orderId: string }) => (
    <div data-testid="mock-shipment-tracker">
      <p>Tracking Order: {orderId}</p>
    </div>
  ),
}))

describe('ShipmentTrackerPage Component Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
  })

  it('1. Renders tracker page with hero header and search input', () => {
    render(<ShipmentTrackerPage />)

    expect(screen.getByRole('heading', { level: 1, name: /Track Your Botanical Order/i })).toBeInTheDocument()
    expect(screen.getByText(/Pune Nursery Hub Dispatch/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Order ID \/ AWB Tracking Number/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Track Parcel/i })).toBeInTheDocument()
  })

  it('2. Submits search form and updates router', () => {
    render(<ShipmentTrackerPage />)

    const input = screen.getByLabelText(/Order ID \/ AWB Tracking Number/i)
    fireEvent.change(input, { target: { value: 'order_01TEST999' } })

    const button = screen.getByRole('button', { name: /Track Parcel/i })
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/shipping/tracker?orderId=order_01TEST999')
    expect(screen.getByTestId('mock-shipment-tracker')).toBeInTheDocument()
    expect(screen.getByText(/Tracking Order: order_01TEST999/i)).toBeInTheDocument()
  })

  it('3. Renders tracker directly when orderId query param is present', () => {
    mockSearchParams = new URLSearchParams('orderId=order_abc_456')

    render(<ShipmentTrackerPage />)

    expect(screen.getByTestId('mock-shipment-tracker')).toBeInTheDocument()
    expect(screen.getByText(/Tracking Order: order_abc_456/i)).toBeInTheDocument()
  })

  it('4. Renders botanical guarantees and FAQ section', () => {
    render(<ShipmentTrackerPage />)

    expect(screen.getByText(/Moisture-Shield Packaging/i)).toBeInTheDocument()
    expect(screen.getByText(/Express Nursery Dispatch/i)).toBeInTheDocument()
    expect(screen.getByText(/48-Hour Live Plant Guarantee/i)).toBeInTheDocument()
    expect(screen.getByText(/How long does live plant delivery take across India\?/i)).toBeInTheDocument()
  })
})
