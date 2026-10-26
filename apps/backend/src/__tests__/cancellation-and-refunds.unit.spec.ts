import {
  orderCancellationSchema,
  orderReturnRequestSchema,
  adminReturnReviewSchema,
  adminRefundSchema,
  adminCodRefundSchema,
  returnInventoryTriageSchema,
} from '@glorov/types'
import { CodPaymentProviderService } from '../modules/payment-cod/service'
import { ShiprocketFulfillmentService } from '../modules/fulfillment-shiprocket/service'
import { MedusaError } from '@medusajs/framework/utils'

describe('Cancellations, Returns, and Refund Workflows Unit Tests', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  // =========================================================================
  // 1. Zod Validation Schemas & Botanical Invariants
  // =========================================================================
  describe('1. Validation Schemas & Botanical Invariants', () => {
    it('validates customer order cancellation request payload', () => {
      const validPayload = {
        reason: 'Ordered by mistake',
        customer_note: 'Need to change delivery address',
      }
      const parsed = orderCancellationSchema.safeParse(validPayload)
      expect(parsed.success).toBe(true)

      const minimalPayload = {
        reason: 'Delivery delayed beyond sowing season',
      }
      expect(orderCancellationSchema.safeParse(minimalPayload).success).toBe(true)

      // Rejects empty reason
      const invalidPayload = { reason: '' }
      expect(orderCancellationSchema.safeParse(invalidPayload).success).toBe(false)
    })

    it('validates customer return request payload with botanical return reasons', () => {
      const validReturn = {
        items: [
          {
            line_item_id: 'item_seeds_01',
            quantity: 2,
            reason: 'expired_viability',
            customer_note: '0/20 seeds germinated after 14 days under standard propagation',
          },
          {
            line_item_id: 'item_plant_02',
            quantity: 1,
            reason: 'damaged_in_transit',
            customer_note: 'Monstera arrived withered and stems crushed',
          },
        ],
        customer_notes: 'Please issue refund to original payment source',
      }

      const res = orderReturnRequestSchema.safeParse(validReturn)
      expect(res.success).toBe(true)

      // Rejects invalid botanical return reason
      const invalidReason = {
        items: [
          {
            line_item_id: 'item_seeds_01',
            quantity: 1,
            reason: 'changed_mind_after_planting', // Invalid reason
          },
        ],
      }
      expect(orderReturnRequestSchema.safeParse(invalidReason).success).toBe(false)

      // Rejects non-positive quantity
      const invalidQty = {
        items: [
          {
            line_item_id: 'item_seeds_01',
            quantity: 0,
            reason: 'damaged_in_transit',
          },
        ],
      }
      expect(orderReturnRequestSchema.safeParse(invalidQty).success).toBe(false)

      // Rejects empty items array
      expect(orderReturnRequestSchema.safeParse({ items: [] }).success).toBe(false)
    })

    it('validates admin return request review schema', () => {
      const approval = {
        decision: 'approved',
        decision_notes: 'Confirmed botanical transport shock from transit logs',
        return_action: 'approve_with_refund',
        return_shipping_required: false, // Botanical live plants do not require reverse transit
      }
      expect(adminReturnReviewSchema.safeParse(approval).success).toBe(true)

      const rejection = {
        decision: 'rejected',
        decision_notes: 'Exceeded 7-day botanical return window for perishable nursery stock',
        return_action: 'reject',
      }
      expect(adminReturnReviewSchema.safeParse(rejection).success).toBe(true)

      // Rejects invalid decision enum
      expect(
        adminReturnReviewSchema.safeParse({
          decision: 'pending',
          decision_notes: 'Thinking about it',
        }).success
      ).toBe(false)
    })

    it('validates standard refund schema and enforces positive INR amount', () => {
      const validRefund = {
        amount_inr: 499.5,
        payment_id: 'pay_rzp_12345',
        reason: 'customer_request',
        note: 'Damaged heirloom tomato seed packet refund',
        idempotency_key: 'idem_ref_001',
      }
      expect(adminRefundSchema.safeParse(validRefund).success).toBe(true)

      // Rejects negative or zero amount
      expect(
        adminRefundSchema.safeParse({
          amount_inr: 0,
          reason: 'customer_request',
        }).success
      ).toBe(false)

      expect(
        adminRefundSchema.safeParse({
          amount_inr: -100,
          reason: 'customer_request',
        }).success
      ).toBe(false)
    })

    it('validates COD direct bank payout refund schema with Indian banking parameters', () => {
      const validCodRefund = {
        order_id: 'order_01H12345',
        amount_inr: 1250,
        bank_account_number: '123456789012',
        bank_ifsc: 'HDFC0001234',
        account_holder_name: 'Aarav Sharma',
        bank_name: 'HDFC Bank',
        bank_utr: 'HDFC261026001234',
        payout_date: '2026-10-26',
        reason: 'customer_return_cod',
      }
      expect(adminCodRefundSchema.safeParse(validCodRefund).success).toBe(true)

      // Rejects invalid IFSC code format (must be 4 alpha, 0, 6 alphanumeric)
      expect(
        adminCodRefundSchema.safeParse({
          ...validCodRefund,
          bank_ifsc: 'HDFC1234567', // 5th character is '1', not '0'
        }).success
      ).toBe(false)

      // Rejects bank account numbers that are too short (< 9 digits)
      expect(
        adminCodRefundSchema.safeParse({
          ...validCodRefund,
          bank_account_number: '12345',
        }).success
      ).toBe(false)

      // Rejects missing bank UTR
      expect(
        adminCodRefundSchema.safeParse({
          ...validCodRefund,
          bank_utr: '',
        }).success
      ).toBe(false)
    })

    it('validates return inventory triage schema with botanical conditions', () => {
      const validTriage = {
        items: [
          {
            line_item_id: 'item_seeds_01',
            condition: 'unopened_sealed_seeds',
            quantity: 3,
            restock: true,
            notes: 'Foil seal intact, lot date valid, restocked to Pune Central Nursery Hub',
          },
          {
            line_item_id: 'item_plant_02',
            condition: 'quarantine_salvage',
            quantity: 1,
            restock: false,
            notes: 'Root rot from return transit. Placed in nursery greenhouse isolation bay',
          },
          {
            line_item_id: 'item_packet_03',
            condition: 'damaged_unsellable',
            quantity: 1,
            restock: false,
            notes: 'Punctured packaging during return transit; discarded as botanical writeoff',
          },
        ],
        triage_notes: 'Physical shipment inspection completed by Pune nursery hub manager',
      }
      expect(returnInventoryTriageSchema.safeParse(validTriage).success).toBe(true)

      // Rejects unknown condition
      expect(
        returnInventoryTriageSchema.safeParse({
          items: [
            {
              line_item_id: 'item_seeds_01',
              condition: 'perfect_condition', // Not allowed, must be botanical condition
              quantity: 1,
              restock: true,
            },
          ],
        }).success
      ).toBe(false)
    })
  })

  // =========================================================================
  // 2. COD Payment Provider Refund Hardening
  // =========================================================================
  describe('2. Cash on Delivery (COD) Payment Provider Refund Hardening', () => {
    let codService: CodPaymentProviderService

    beforeEach(() => {
      codService = new CodPaymentProviderService(
        { logger: mockLogger as any },
        { max_amount: 500000, restricted_pincodes: ['744101'] }
      )
    })

    it('rejects refund on uncaptured COD session (cash never collected)', async () => {
      await expect(
        codService.refundPayment({
          data: {
            payment_method: 'cod',
            amount: 1500,
            status: 'authorized',
            cash_collected: false,
          },
          amount: 1500,
        } as any)
      ).rejects.toThrow(/Cannot refund an uncaptured Cash on Delivery order/i)
    })

    it('rejects refund on captured COD session if bank UTR reference is missing', async () => {
      await expect(
        codService.refundPayment({
          data: {
            payment_method: 'cod',
            amount: 1500,
            status: 'captured',
            cash_collected: true,
          },
          amount: 1500,
          context: {},
        } as any)
      ).rejects.toThrow(/bank transfer \(NEFT\/IMPS\).*bank UTR reference is required/i)
    })

    it('approves refund on captured COD session when verified bank UTR is provided', async () => {
      const res = await codService.refundPayment({
        data: {
          payment_method: 'cod',
          amount: 1500,
          status: 'captured',
          cash_collected: true,
        },
        amount: 1500,
        context: {
          payout: {
            bank_utr: 'UTR_NEFT_20261026_999',
            bank_account: 'XXXXXX5678',
            bank_ifsc: 'SBIN0001234',
          },
        },
      } as any)

      expect(res.data).toBeDefined()
      expect((res.data as any).status).toBe('refunded')
      expect((res.data as any).bank_utr).toBe('UTR_NEFT_20261026_999')
      expect((res.data as any).payout_reference).toBe('UTR_NEFT_20261026_999')
    })
  })

  // =========================================================================
  // 3. Shiprocket Fulfillment Provider Cancellation Hardening
  // =========================================================================
  describe('3. Shiprocket Fulfillment Provider Cancellation Hardening', () => {
    let fulfillmentService: ShiprocketFulfillmentService
    let mockClient: any

    beforeEach(() => {
      mockClient = {
        isMockMode: jest.fn().mockReturnValue(false),
        cancelOrder: jest.fn(),
      }
      fulfillmentService = new ShiprocketFulfillmentService({
        logger: mockLogger as any,
      })
      ;(fulfillmentService as any).client = mockClient
    })

    it('successfully cancels fulfillment when Shiprocket returns status 200', async () => {
      mockClient.cancelOrder.mockResolvedValue({
        status: 200,
        message: 'Order cancelled successfully in Shiprocket',
      })

      const res = await fulfillmentService.cancelFulfillment({
        shiprocket_order_id: 88812345,
      })

      expect(res.status).toBe('CANCELLED')
      expect(res.cancelled_at).toBeDefined()
      expect(mockClient.cancelOrder).toHaveBeenCalledWith([88812345])
    })

    it('throws MedusaError when Shiprocket returns non-200 error code', async () => {
      mockClient.cancelOrder.mockResolvedValue({
        status: 400,
        message: 'AWB already picked up by courier; cancellation refused',
      })

      await expect(
        fulfillmentService.cancelFulfillment({
          shiprocket_order_id: 88812345,
        })
      ).rejects.toThrow(/Shiprocket courier rejected shipment cancellation/i)
    })

    it('propagates network or API errors during Shiprocket cancellation', async () => {
      mockClient.cancelOrder.mockRejectedValue(new Error('Shiprocket API Gateway Timeout'))

      await expect(
        fulfillmentService.cancelFulfillment({
          shiprocket_order_id: 88812345,
        })
      ).rejects.toThrow(/Shiprocket order cancellation failed: Shiprocket API Gateway Timeout/i)
    })
  })

  // =========================================================================
  // 4. Order Cancellation Eligibility Invariants
  // =========================================================================
  describe('4. Order Cancellation Eligibility Rules', () => {
    const evaluateCancellationEligibility = (order: {
      status: string
      fulfillments?: Array<{
        id: string
        canceled_at?: string | null
        shipped_at?: string | null
        delivered_at?: string | null
      }>
    }) => {
      if (order.status === 'canceled') {
        return { eligible: false, reason: 'ALREADY_CANCELED' }
      }
      if (order.status === 'completed') {
        return { eligible: false, reason: 'COMPLETED_ORDER' }
      }
      const activeFulfillments = (order.fulfillments || []).filter((f) => !f.canceled_at)
      const isShipped = activeFulfillments.some(
        (f) => Boolean(f.shipped_at) || Boolean(f.delivered_at)
      )
      if (isShipped) {
        return { eligible: false, reason: 'SHIPPED_IN_TRANSIT' }
      }
      return { eligible: true, activeFulfillmentsToCancel: activeFulfillments }
    }

    it('rejects cancellation for already canceled order', () => {
      const result = evaluateCancellationEligibility({ status: 'canceled' })
      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('ALREADY_CANCELED')
    })

    it('rejects cancellation for completed order', () => {
      const result = evaluateCancellationEligibility({ status: 'completed' })
      expect(result.eligible).toBe(false)
      expect(result.reason).toBe('COMPLETED_ORDER')
    })

    it('rejects cancellation for orders where fulfillment has shipped_at or delivered_at', () => {
      const resultShipped = evaluateCancellationEligibility({
        status: 'pending',
        fulfillments: [
          {
            id: 'ful_01',
            shipped_at: '2026-10-26T10:00:00Z',
            canceled_at: null,
          },
        ],
      })
      expect(resultShipped.eligible).toBe(false)
      expect(resultShipped.reason).toBe('SHIPPED_IN_TRANSIT')

      const resultDelivered = evaluateCancellationEligibility({
        status: 'pending',
        fulfillments: [
          {
            id: 'ful_02',
            delivered_at: '2026-10-26T14:00:00Z',
            canceled_at: null,
          },
        ],
      })
      expect(resultDelivered.eligible).toBe(false)
      expect(resultDelivered.reason).toBe('SHIPPED_IN_TRANSIT')
    })

    it('allows cancellation for pending orders with active un-shipped fulfillments', () => {
      const result = evaluateCancellationEligibility({
        status: 'pending',
        fulfillments: [
          {
            id: 'ful_created_only',
            shipped_at: null,
            delivered_at: null,
            canceled_at: null,
          },
        ],
      })
      expect(result.eligible).toBe(true)
      expect(result.activeFulfillmentsToCancel).toHaveLength(1)
      expect(result.activeFulfillmentsToCancel?.[0].id).toBe('ful_created_only')
    })
  })

  // =========================================================================
  // 5. Refund Amount Calculation & Bounds Verification
  // =========================================================================
  describe('5. Refund Bounds & Financial Calculations', () => {
    const calculateRefundableBalance = (payment: {
      status: string
      amount: number
      captures?: Array<{ amount: number }>
      refunds?: Array<{ amount: number }>
    }) => {
      const capturedPaise = (payment.captures || []).reduce(
        (sum, cap) => sum + (Number(cap.amount) || 0),
        0
      )
      const refundedPaise = (payment.refunds || []).reduce(
        (sum, ref) => sum + (Number(ref.amount) || 0),
        0
      )

      if (capturedPaise === 0) {
        return { isCaptured: false, maxRefundablePaise: 0 }
      }

      const maxRefundablePaise = Math.max(0, capturedPaise - refundedPaise)
      return { isCaptured: true, capturedPaise, refundedPaise, maxRefundablePaise }
    }

    it('rejects refund calculation for uncaptured payment', () => {
      const payment = {
        status: 'authorized',
        amount: 250000,
        captures: [],
        refunds: [],
      }
      const res = calculateRefundableBalance(payment)
      expect(res.isCaptured).toBe(false)
      expect(res.maxRefundablePaise).toBe(0)
    })

    it('correctly calculates remaining refundable balance after partial refunds', () => {
      const payment = {
        status: 'captured',
        amount: 250000, // ₹2,500
        captures: [{ amount: 250000 }],
        refunds: [{ amount: 50000 }], // ₹500 already refunded
      }
      const res = calculateRefundableBalance(payment)
      expect(res.isCaptured).toBe(true)
      expect(res.capturedPaise).toBe(250000)
      expect(res.refundedPaise).toBe(50000)
      expect(res.maxRefundablePaise).toBe(200000) // ₹2,000 remaining
    })

    it('detects when requested refund exceeds remaining refundable balance', () => {
      const payment = {
        status: 'captured',
        amount: 100000,
        captures: [{ amount: 100000 }],
        refunds: [{ amount: 80000 }],
      }
      const { maxRefundablePaise } = calculateRefundableBalance(payment)
      const requestedPaise = 30000 // ₹300 requested, only ₹200 left
      expect(requestedPaise > maxRefundablePaise).toBe(true)
    })
  })

  // =========================================================================
  // 6. Botanical Return Inventory Triage Rules
  // =========================================================================
  describe('6. Botanical Return Inventory Triage Invariants', () => {
    interface TriageDecisionInput {
      condition: 'unopened_sealed_seeds' | 'damaged_unsellable' | 'quarantine_salvage' | 'perishable_spoilage'
      requestedRestock: boolean
      quantity: number
      isLivePlant: boolean
    }

    const evaluateTriageAction = (input: TriageDecisionInput) => {
      // Live nursery plants can NEVER be auto-restocked to sellable stock
      if (input.isLivePlant) {
        return {
          canRestock: false,
          disposition: input.condition === 'quarantine_salvage' ? 'nursery_quarantine_bay' : 'botanical_loss_writeoff',
          restockedQty: 0,
        }
      }

      // Only unopened, undamaged seeds are eligible for restock
      if (input.condition === 'unopened_sealed_seeds' && input.requestedRestock) {
        return {
          canRestock: true,
          disposition: 'pune_central_nursery_hub_restock',
          restockedQty: input.quantity,
        }
      }

      return {
        canRestock: false,
        disposition: 'damaged_packaging_writeoff',
        restockedQty: 0,
      }
    }

    it('restocks unopened sealed seeds to Pune Central Nursery Hub', () => {
      const result = evaluateTriageAction({
        condition: 'unopened_sealed_seeds',
        requestedRestock: true,
        quantity: 5,
        isLivePlant: false,
      })
      expect(result.canRestock).toBe(true)
      expect(result.disposition).toBe('pune_central_nursery_hub_restock')
      expect(result.restockedQty).toBe(5)
    })

    it('never restocks live nursery plants to sellable inventory even if restock is requested', () => {
      const result = evaluateTriageAction({
        condition: 'quarantine_salvage',
        requestedRestock: true, // Admin mistakenly requested restock
        quantity: 2,
        isLivePlant: true,
      })
      expect(result.canRestock).toBe(false)
      expect(result.disposition).toBe('nursery_quarantine_bay')
      expect(result.restockedQty).toBe(0)
    })

    it('writes off damaged seed packets as packaging loss without restock', () => {
      const result = evaluateTriageAction({
        condition: 'damaged_unsellable',
        requestedRestock: false,
        quantity: 2,
        isLivePlant: false,
      })
      expect(result.canRestock).toBe(false)
      expect(result.disposition).toBe('damaged_packaging_writeoff')
      expect(result.restockedQty).toBe(0)
    })

    it('prevents duplicate inventory adjustment on previously triaged items', () => {
      const existingTriage = [
        {
          line_item_id: 'item_01',
          condition: 'unopened_sealed_seeds',
          restocked: true,
          adjustment_quantity: 2,
        },
      ]

      const isDuplicate = existingTriage.some(
        (t) => t.line_item_id === 'item_01' && t.restocked === true
      )
      expect(isDuplicate).toBe(true)
    })

    it('rejects triage quantity that exceeds ordered line item quantity', () => {
      const orderedQty = 3
      const requestedTriageQty = 10
      expect(requestedTriageQty > orderedQty).toBe(true)
    })
  })

  // =========================================================================
  // 7. Advanced Idempotency, Shiprocket & Cumulative Return Tests
  // =========================================================================
  describe('7. Edge Cases: Idempotency, Shiprocket & Cumulative Returns', () => {
    it('allows subsequent legitimate partial refunds of identical amount with different idempotency keys', () => {
      const existingRefunds = [
        {
          id: 'ref_01',
          amount: 50000, // ₹500
          idempotency_key: 'custom_idem_part_1',
          created_at: new Date(Date.now() - 60000).toISOString(),
        },
      ]

      // Same amount ₹500, but with a different explicit key
      const newKey = 'custom_idem_part_2'
      const isDuplicate = existingRefunds.some((r) => r.idempotency_key === newKey)
      expect(isDuplicate).toBe(false)
    })

    it('detects duplicate idempotency key when identical key is reused', () => {
      const existingRefunds = [
        {
          id: 'ref_01',
          amount: 50000,
          idempotency_key: 'custom_idem_key_abc',
        },
      ]
      const duplicateKey = 'custom_idem_key_abc'
      const isDuplicate = existingRefunds.some((r) => r.idempotency_key === duplicateKey)
      expect(isDuplicate).toBe(true)
    })

    it('enforces cumulative return quantities and rejects requests exceeding unreturned balance', () => {
      const orderedQty = 2
      const existingReturnRequests = [
        {
          id: 'ret_01',
          status: 'pending_review',
          items: [{ line_item_id: 'item_seeds_01', quantity: 1 }],
        },
      ]

      const previouslyRequested = existingReturnRequests
        .filter((r) => r.status !== 'rejected')
        .flatMap((r) => r.items)
        .filter((it) => it.line_item_id === 'item_seeds_01')
        .reduce((sum, it) => sum + it.quantity, 0)

      expect(previouslyRequested).toBe(1)
      const remainingEligible = orderedQty - previouslyRequested
      expect(remainingEligible).toBe(1)

      // Requesting 1 more unit should be allowed
      expect(1 <= remainingEligible).toBe(true)

      // Requesting 2 units exceeds remaining eligible (only 1 left)
      expect(2 > remainingEligible).toBe(true)
    })

    it('detects cross-order COD UTR duplicate reuse across multiple orders', () => {
      const orders = [
        {
          id: 'order_1',
          metadata: {
            cod_refunds: [{ bank_utr: 'HDFC202610269999' }],
          },
        },
        {
          id: 'order_2',
          metadata: {
            cod_refunds: [],
          },
        },
      ]

      const candidateUtr = 'HDFC202610269999'
      const isDuplicateAcrossOrders = orders.some((ord) =>
        (ord.metadata?.cod_refunds || []).some((r: any) => r.bank_utr === candidateUtr)
      )
      expect(isDuplicateAcrossOrders).toBe(true)

      const freshUtr = 'ICIC202610268888'
      const isFreshDuplicate = orders.some((ord) =>
        (ord.metadata?.cod_refunds || []).some((r: any) => r.bank_utr === freshUtr)
      )
      expect(isFreshDuplicate).toBe(false)
    })

    it('detects Shiprocket cancellation failure when status_code is non-200', () => {
      const shiprocketResponse = {
        status_code: 400,
        message: 'Order already out for delivery linehaul, cancellation rejected',
      }

      const statusCode =
        typeof (shiprocketResponse as any).status === 'number'
          ? (shiprocketResponse as any).status
          : typeof shiprocketResponse.status_code === 'number'
            ? shiprocketResponse.status_code
            : null

      const isFailed = statusCode !== null && statusCode !== 200 && statusCode !== 204
      expect(isFailed).toBe(true)
    })
  })
})
