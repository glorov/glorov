import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  transformMedusaOrder,
  formatOrderDate,
  fetchCustomerOrders,
  fetchOrderById,
  fetchOrderTracking,
  cancelOrder,
  submitReturnRequest,
} from '../../src/lib/api/orders'
import OrdersPage from '../../src/app/account/orders/page'
import OrderDetailPage from '../../src/app/account/orders/[id]/page'
import { CustomerAuthProvider, CustomerAuthContext } from '../../src/context/CustomerAuthContext'

const mockPush = vi.fn()
const mockBack = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
    replace: vi.fn(),
  }),
  usePathname: () => '/account/orders',
  useParams: () => ({ id: 'ord_medusa_test_101' }),
  useSearchParams: () => ({
    get: (k: string) => (k === 'email' ? 'test@glorov.in' : null),
  }),
}))

const rawMedusaOrderMock = {
  id: 'ord_medusa_test_101',
  display_id: 1001,
  created_at: '2026-11-01T10:30:00.000Z',
  status: 'pending',
  payment_status: 'captured',
  fulfillment_status: 'shipped',
  total: 49900, // 499 INR in paise
  subtotal: 49900,
  shipping_total: 0,
  discount_total: 0,
  currency_code: 'inr',
  email: 'test@glorov.in',
  items: [
    {
      id: 'item_plant_01',
      title: 'Peace Lily Air Purifier',
      quantity: 1,
      unit_price: 49900,
      thumbnail: 'https://res.cloudinary.com/naodmm8w/image/upload/v1/plant.png',
      variant_title: '6" Ceramic Pot',
    },
  ],
  shipping_address: {
    id: 'addr_1',
    first_name: 'Pooja',
    last_name: 'Nair',
    address_1: '12 Garden Street',
    city: 'Pune',
    province: 'Maharashtra',
    postal_code: '411001',
    phone: '9876543210',
    country_code: 'in',
  },
  fulfillments: [
    {
      id: 'ful_1',
      shipped_at: '2026-11-02T08:00:00.000Z',
      data: {
        courier_name: 'Delhivery Air Botanical Express',
        awb_code: 'AWB998877',
      },
      labels: [
        {
          tracking_number: 'AWB998877',
          tracking_url: 'https://shiprocket.co/tracking/AWB998877',
        },
      ],
    },
  ],
}

describe('Medusa Order Transformer (transformMedusaOrder)', () => {
  it('correctly maps raw Medusa v2 minor units (paise) to INR and extracts tracking', () => {
    const order = transformMedusaOrder(rawMedusaOrderMock)

    expect(order.id).toBe('ord_medusa_test_101')
    expect(order.displayId).toBe('GLR-1001')
    expect(order.totalAmount).toBe(499)
    expect(order.subtotal).toBe(499)
    expect(order.status).toBe('pending')
    expect(order.paymentStatus).toBe('captured')
    expect(order.fulfillmentStatus).toBe('shipped')
    expect(order.trackingCode).toBe('AWB998877')
    expect(order.carrierName).toBe('Delhivery Air Botanical Express')
    expect(order.trackingUrl).toBe('https://shiprocket.co/tracking/AWB998877')

    expect(order.items.length).toBe(1)
    expect(order.items[0].title).toBe('Peace Lily Air Purifier')
    expect(order.items[0].price).toBe(499)

    expect(order.shippingAddress.fullName).toBe('Pooja Nair')
    expect(order.shippingAddress.city).toBe('Pune')
    expect(order.shippingAddress.pincode).toBe('411001')
  })

  it('safely formats order dates', () => {
    const formatted = formatOrderDate('2026-11-01T10:30:00.000Z')
    expect(formatted).toBeDefined()
    expect(formatted).toContain('2026')
  })
})

describe('Order API Client Functions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetchCustomerOrders retrieves and transforms orders', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        orders: [transformMedusaOrder(rawMedusaOrderMock)],
      }),
    } as Response)

    const res = await fetchCustomerOrders('mock_token')
    expect(res.success).toBe(true)
    expect(res.orders.length).toBe(1)
    expect(res.orders[0].displayId).toBe('GLR-1001')
  })

  it('fetchOrderById retrieves order and enforces guest email check', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        order: transformMedusaOrder(rawMedusaOrderMock),
        rawOrder: rawMedusaOrderMock,
      }),
    } as Response)

    const res = await fetchOrderById('ord_medusa_test_101', undefined, 'test@glorov.in')
    expect(res.success).toBe(true)
    expect(res.order?.displayId).toBe('GLR-1001')
  })

  it('fetchOrderTracking retrieves live tracking data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        order_id: 'ord_medusa_test_101',
        shipping_status: 'in_transit',
        awb: 'AWB998877',
        courier_name: 'Delhivery Air Botanical Express',
        moisture_shield_status: 'Sphagnum hydration wrap active',
        scans: [{ date: '01 Nov', activity: 'Dispatched from Pune Hub', location: 'Pune' }],
      }),
    } as Response)

    const res = await fetchOrderTracking('ord_medusa_test_101')
    expect(res.success).toBe(true)
    expect(res.tracking?.awb).toBe('AWB998877')
    expect(res.tracking?.moisture_shield_status).toContain('Sphagnum')
  })

  it('cancelOrder calls cancellation endpoint', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Order canceled successfully.',
        status: 'canceled',
      }),
    } as Response)

    const res = await cancelOrder('ord_medusa_test_101', {
      reason: 'Customer requested cancellation',
    })
    expect(res.success).toBe(true)
    expect(res.status).toBe('canceled')
  })

  it('submitReturnRequest calls return request endpoint', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Return request submitted successfully.',
        return_request: { id: 'ret_1' },
      }),
    } as Response)

    const res = await submitReturnRequest('ord_medusa_test_101', {
      items: [
        {
          line_item_id: 'item_plant_01',
          quantity: 1,
          reason: 'damaged_in_transit',
        },
      ],
    })
    expect(res.success).toBe(true)
    expect(res.return_request?.id).toBe('ret_1')
  })
})

describe('OrdersPage UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Guest Order Lookup form when user is not authenticated', () => {
    render(
      <CustomerAuthProvider>
        <OrdersPage />
      </CustomerAuthProvider>
    )

    expect(screen.getByText('Track Your Botanical Order')).toBeDefined()
    expect(screen.getByText('Guest Order Lookup')).toBeDefined()
    expect(screen.getByLabelText(/Order ID or Display Number/i)).toBeDefined()
    expect(screen.getByLabelText(/Checkout Email Address/i)).toBeDefined()
    expect(screen.getByText('Find & Track Order')).toBeDefined()
  })

  it('submits guest order lookup and renders verified order card', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url)
      if (urlStr.includes('/api/auth/session')) {
        return { ok: true, json: async () => ({ authenticated: false }) } as Response
      }
      if (urlStr.includes('/api/orders/')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            order: transformMedusaOrder(rawMedusaOrderMock),
          }),
        } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })

    render(
      <CustomerAuthProvider>
        <OrdersPage />
      </CustomerAuthProvider>
    )

    fireEvent.change(screen.getByLabelText(/Order ID or Display Number/i), {
      target: { value: 'GLR-1001' },
    })
    fireEvent.change(screen.getByLabelText(/Checkout Email Address/i), {
      target: { value: 'test@glorov.in' },
    })

    fireEvent.click(screen.getByText('Find & Track Order'))

    await waitFor(() => {
      expect(screen.getByText(/Order Found & Ownership Verified/i)).toBeDefined()
      expect(screen.getByText('Peace Lily Air Purifier')).toBeDefined()
    })
  })

  it('renders authenticated order history with filter pills', () => {
    const sampleCustomer = {
      id: 'cust_1',
      email: 'pooja@glorov.in',
      firstName: 'Pooja',
      lastName: 'Nair',
      memberSince: 'Nov 2026',
    }

    const sampleOrder = transformMedusaOrder(rawMedusaOrderMock)

    const mockContextValue: any = {
      customer: sampleCustomer,
      token: 'jwt_valid_token',
      isAuthenticated: true,
      isLoading: false,
      authError: null,
      orders: [sampleOrder],
      refreshOrders: vi.fn(),
      addresses: [],
      notifications: [],
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn(),
      addAddress: vi.fn(),
      updateAddress: vi.fn(),
      deleteAddress: vi.fn(),
      markNotificationAsRead: vi.fn(),
    }

    render(
      <CustomerAuthContext.Provider value={mockContextValue}>
        <OrdersPage />
      </CustomerAuthContext.Provider>
    )

    expect(screen.getByText('Order History & Tracking')).toBeDefined()
    expect(screen.getByText('All (1)')).toBeDefined()
    expect(screen.getByText('In Transit (1)')).toBeDefined()
    expect(screen.getByText('Peace Lily Air Purifier')).toBeDefined()
    expect(screen.getByText('GLR-1001')).toBeDefined()
  })
})

describe('OrderDetailPage UI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches order details and renders live tracking, specimens, and financial ledger', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(async (url: any) => {
      const urlStr = String(url)
      if (urlStr.includes('/api/auth/session')) {
        return { ok: true, json: async () => ({ authenticated: false }) } as Response
      }
      if (urlStr.includes('/tracking')) {
        return {
          ok: true,
          json: async () => ({
            order_id: 'ord_medusa_test_101',
            shipping_status: 'in_transit',
            awb: 'AWB998877',
            courier_name: 'Delhivery Air Botanical Express',
            moisture_shield_status: 'Hydration gel active',
            scans: [{ date: '01 Nov', activity: 'Dispatched from Pune Hub', location: 'Pune' }],
          }),
        } as Response
      }
      if (urlStr.includes('/return-request')) {
        return {
          ok: true,
          json: async () => ({ return_requests: [] }),
        } as Response
      }
      if (urlStr.includes('/api/orders/')) {
        return {
          ok: true,
          json: async () => ({
            success: true,
            order: transformMedusaOrder(rawMedusaOrderMock),
            rawOrder: rawMedusaOrderMock,
          }),
        } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })

    render(
      <CustomerAuthProvider>
        <OrderDetailPage />
      </CustomerAuthProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('GLR-1001')).toBeDefined()
      expect(screen.getByText('Peace Lily Air Purifier')).toBeDefined()
      expect(screen.getByText('Consignment Progress')).toBeDefined()
      expect(screen.getByText('Delhivery Air Botanical Express')).toBeDefined()
      expect(screen.getByText('AWB998877')).toBeDefined()
      expect(screen.getByText(/Hydration gel active/i)).toBeDefined()
      expect(screen.getByText('12 Garden Street')).toBeDefined()
    })
  })
})
