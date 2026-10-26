import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderCancellationButton } from '../components/orders/OrderCancellationButton'
import { OrderReturnRequestModal } from '../components/orders/OrderReturnRequestModal'
import { OrderReturnStatusSection } from '../components/orders/OrderReturnStatusSection'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}))

describe('Order Cancellation & Return Components Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // =========================================================================
  // 1. OrderCancellationButton Eligibility & Interaction
  // =========================================================================
  describe('OrderCancellationButton', () => {
    it('renders "Cancel Order" button for eligible pending order prior to dispatch', () => {
      render(
        <OrderCancellationButton
          orderId="order_1001"
          displayId={1001}
          status="pending"
          fulfillmentStatus="not_fulfilled"
        />
      )

      const btn = screen.getByRole('button', { name: /cancel order/i })
      expect(btn).toBeInTheDocument()
    })

    it('returns null when order is already canceled', () => {
      const { container } = render(
        <OrderCancellationButton
          orderId="order_1001"
          displayId={1001}
          status="canceled"
          fulfillmentStatus="canceled"
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null when order is completed', () => {
      const { container } = render(
        <OrderCancellationButton
          orderId="order_1001"
          displayId={1001}
          status="completed"
          fulfillmentStatus="delivered"
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('returns null when fulfillment has already shipped in transit', () => {
      const { container } = render(
        <OrderCancellationButton
          orderId="order_1001"
          displayId={1001}
          status="pending"
          fulfillmentStatus="shipped"
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('opens cancellation modal with reason options when clicked', () => {
      render(
        <OrderCancellationButton
          orderId="order_1001"
          displayId={1001}
          status="pending"
          fulfillmentStatus="not_fulfilled"
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /cancel order/i }))

      expect(screen.getByText(/Cancel Order #1001/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Reason for cancellation/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /confirm cancellation/i })).toBeInTheDocument()
    })
  })

  // =========================================================================
  // 2. OrderReturnRequestModal Eligibility & Submission
  // =========================================================================
  describe('OrderReturnRequestModal', () => {
    const mockItems = [
      {
        id: 'item_seeds_01',
        title: 'Heirloom San Marzano Seeds',
        variant_title: 'Pack of 50 seeds',
        quantity: 2,
        unit_price: 199,
      },
    ]

    it('renders "Request Return / Claim" button when order is fulfilled/delivered', () => {
      render(
        <OrderReturnRequestModal
          orderId="order_1002"
          displayId={1002}
          status="completed"
          fulfillmentStatus="delivered"
          items={mockItems}
        />
      )

      expect(
        screen.getByRole('button', { name: /request return \/ claim/i })
      ).toBeInTheDocument()
    })

    it('returns null when order is canceled', () => {
      const { container } = render(
        <OrderReturnRequestModal
          orderId="order_1002"
          displayId={1002}
          status="canceled"
          fulfillmentStatus="canceled"
          items={mockItems}
        />
      )
      expect(container.firstChild).toBeNull()
    })

    it('opens return claim modal and displays botanical item selection', () => {
      render(
        <OrderReturnRequestModal
          orderId="order_1002"
          displayId={1002}
          status="completed"
          fulfillmentStatus="delivered"
          items={mockItems}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /request return \/ claim/i }))

      expect(
        screen.getByRole('heading', { name: /request return \/ claim/i })
      ).toBeInTheDocument()
      expect(screen.getByLabelText(/Select Item to Return/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Reason for Return \/ Claim/i)).toBeInTheDocument()
    })
  })

  // =========================================================================
  // 3. OrderReturnStatusSection Rendering & Security Sanitization
  // =========================================================================
  describe('OrderReturnStatusSection', () => {
    it('returns null when there are no return requests', () => {
      const { container } = render(<OrderReturnStatusSection returnRequests={[]} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders return requests with status badges and refund amounts safely', () => {
      const mockReturnRequests = [
        {
          id: 'ret_req_abc123',
          created_at: '2026-10-26T12:00:00.000Z',
          status: 'pending_review' as const,
          items: [
            {
              line_item_id: 'item_01',
              title: 'Monstera Deliciosa Nursery Pot',
              quantity: 1,
              reason: 'damaged_in_transit',
            },
          ],
          refund_status: 'pending' as const,
        },
        {
          id: 'ret_req_xyz789',
          created_at: '2026-10-25T10:00:00.000Z',
          status: 'approved' as const,
          items: [
            {
              line_item_id: 'item_02',
              title: 'Heirloom Cherry Tomato Seeds',
              quantity: 2,
              reason: 'defective_quality',
            },
          ],
          seller_decision: {
            decision: 'approved' as const,
            decided_at: '2026-10-25T14:00:00.000Z',
            decision_notes: 'Replacement seeds dispatched under warranty claim',
            return_action: 'approve_with_refund',
            return_shipping_required: false,
          },
          refund_status: 'refunded' as const,
          refund_amount_inr: 398,
        },
      ]

      render(<OrderReturnStatusSection returnRequests={mockReturnRequests} />)

      expect(screen.getByText(/Return & Claim Requests \(2\)/i)).toBeInTheDocument()
      expect(screen.getByText(/ret_req_abc123/i)).toBeInTheDocument()
      expect(screen.getByText(/Under Review/i)).toBeInTheDocument()
      expect(screen.getByText(/ret_req_xyz789/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Approved/i).length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/Refund Processed/i)).toBeInTheDocument()
      expect(screen.getByText(/₹398/i)).toBeInTheDocument()
    })
  })
})
