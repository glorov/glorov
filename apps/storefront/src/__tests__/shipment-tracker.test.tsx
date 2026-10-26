import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShipmentTracker, type TrackingData } from '../components/shipping/ShipmentTracker'

describe('ShipmentTracker Component Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('1. Renders loading spinner while fetching tracking details', () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}))

    render(<ShipmentTracker orderId="order_test_123" />)
    expect(screen.getByTestId('shipment-tracker-loading')).toBeInTheDocument()
    expect(screen.getByText(/Connecting to courier tracking gateway/i)).toBeInTheDocument()
  })

  it('2. Displays pending preparation state when order is not yet dispatched', async () => {
    const mockPending: TrackingData = {
      order_id: 'order_test_123',
      display_id: 1001,
      fulfillment_status: 'not_fulfilled',
      shipping_status: 'processing',
      awb: null,
      courier_name: null,
      origin: 'Pune Central Nursery Hub (PIN 411001)',
      is_perishable: true,
      moisture_shield_status:
        'Live plant undergoing hydration & moisture-shield packaging at Pune Hub',
      scans: [
        {
          date: '2026-10-26T10:00:00.000Z',
          activity: 'Order confirmed and registered at Pune Central Nursery Hub',
          location: 'Pune, Maharashtra',
        },
      ],
    }

    render(<ShipmentTracker orderId="order_test_123" initialTracking={mockPending} />)

    expect(screen.getByText(/Live Shipment Tracking/i)).toBeInTheDocument()
    expect(screen.getByText(/Packing in Progress/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Order Confirmed/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Live plant undergoing hydration/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Order confirmed and registered at Pune Central Nursery Hub/i)
    ).toBeInTheDocument()
  })

  it('3. Displays live tracking with AWB, courier name, and in-transit progress', async () => {
    const mockInTransit: TrackingData = {
      order_id: 'order_test_123',
      display_id: 1002,
      fulfillment_status: 'fulfilled',
      shipping_status: 'in_transit',
      awb: 'SR987654321',
      courier_name: 'Delhivery Air Botanical Express',
      tracking_url: 'https://shiprocket.co/tracking/SR987654321',
      origin: 'Pune Central Nursery Hub (PIN 411001)',
      is_perishable: false,
      moisture_shield_status: 'Protected in airtight moisture-barrier botanical foil pouch',
      scans: [
        {
          date: '2026-10-26T12:00:00.000Z',
          activity: 'In Transit: Departed Pune Airport sorting facility',
          location: 'Pune Hub',
        },
        {
          date: '2026-10-26T08:00:00.000Z',
          activity: 'Picked up from Pune Central Nursery Hub',
          location: 'Pune Central Nursery Hub',
        },
      ],
    }

    render(<ShipmentTracker orderId="order_test_123" initialTracking={mockInTransit} />)

    expect(screen.getByText(/SR987654321/i)).toBeInTheDocument()
    expect(screen.getByText(/Delhivery Air Botanical Express/i)).toBeInTheDocument()
    expect(screen.getAllByText(/In Transit/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Departed Pune Airport sorting facility/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Protected in airtight moisture-barrier botanical foil pouch/i)
    ).toBeInTheDocument()
  })

  it('4. Displays delivered status when shipment delivery is confirmed', async () => {
    const mockDelivered: TrackingData = {
      order_id: 'order_test_123',
      display_id: 1003,
      fulfillment_status: 'fulfilled',
      shipping_status: 'delivered',
      awb: 'SR11223344',
      courier_name: 'Delhivery Air Botanical Express',
      scans: [
        {
          date: '2026-10-26T14:00:00.000Z',
          activity: 'Package delivered to consignee',
          location: 'Bengaluru',
        },
      ],
    }

    render(<ShipmentTracker orderId="order_test_123" initialTracking={mockDelivered} />)

    expect(screen.getAllByText(/Delivered/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Package delivered to consignee/i)).toBeInTheDocument()
  })

  it('5. Handles gateway errors gracefully with informative messaging', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({
        message: 'Carrier tracking gateway unavailable',
      }),
    } as unknown as Response)

    render(<ShipmentTracker orderId="order_test_err" />)

    await waitFor(() => {
      expect(
        screen.getByText(/Tracking Status Temporarily Unavailable/i)
      ).toBeInTheDocument()
    })

    expect(screen.getByText(/Carrier tracking gateway unavailable/i)).toBeInTheDocument()
  })

  it('6. Copies AWB number to clipboard when copy button is clicked', async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextSpy,
      },
    })

    const mockData: TrackingData = {
      order_id: 'order_copy_test',
      shipping_status: 'in_transit',
      awb: 'SR99887766',
      courier_name: 'Delhivery Express',
    }

    render(<ShipmentTracker orderId="order_copy_test" initialTracking={mockData} />)

    const copyBtn = screen.getByRole('button', { name: /Copy AWB number/i })
    fireEvent.click(copyBtn)

    expect(writeTextSpy).toHaveBeenCalledWith('SR99887766')
  })
})
