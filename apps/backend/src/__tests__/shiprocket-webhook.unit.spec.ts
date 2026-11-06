import { POST } from '../api/hooks/shiprocket/route'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

describe('Shiprocket Webhook Route Unit Tests (GLOROV-SHIP-003, GLOROV-SHIP-006, GLOROV-PERF-006)', () => {
  const originalEnv = process.env

  let mockLogger: any
  let mockQuery: any
  let mockEventBus: any
  let mockReq: any
  let mockRes: any

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      SHIPROCKET_WEBHOOK_TOKEN: 'test_sr_secret_token_123',
    }

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }

    mockQuery = {
      graph: jest.fn(),
    }

    mockEventBus = {
      emit: jest.fn().mockResolvedValue(undefined),
    }

    mockReq = {
      headers: {
        'x-shiprocket-token': 'test_sr_secret_token_123',
      },
      query: {},
      body: {},
      scope: {
        resolve: jest.fn((key: string) => {
          if (key === ContainerRegistrationKeys.LOGGER) return mockLogger
          if (key === ContainerRegistrationKeys.QUERY) return mockQuery
          if (key === Modules.EVENT_BUS) return mockEventBus
          return null
        }),
      },
    }

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('1. Webhook Authentication & Token Verification', () => {
    it('rejects unauthorized requests with invalid or missing webhook token', async () => {
      mockReq.headers['x-shiprocket-token'] = 'invalid_secret_token'
      await POST(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(401)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Unauthorized'),
        })
      )
    })

    it('rejects invalid payload bodies', async () => {
      mockReq.body = null
      await POST(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(400)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('Invalid payload'),
        })
      )
    })
  })

  describe('2. GLOROV-SHIP-006 / GLOROV-PERF-006: Filtered & Indexed Fulfillment Search', () => {
    it('uses direct filtered query by orderId when order_id is present (no full fulfillment scan)', async () => {
      mockReq.body = {
        order_id: 'order_1001',
        awb: 'SR99887711',
        current_status: 'OUT_FOR_DELIVERY',
      }

      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            status: 'pending',
            fulfillment_status: 'shipped',
            fulfillments: [
              {
                id: 'ful_01',
                data: { awb_code: 'SR99887711' },
                labels: [{ tracking_number: 'SR99887711' }],
              },
            ],
          },
        ],
      })

      await POST(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          order_id: 'order_1001',
          fulfillment_id: 'ful_01',
          status: 'OUT_FOR_DELIVERY',
        })
      )

      // Verify the query was made directly to 'order' with filters: { id: 'order_1001' }
      expect(mockQuery.graph).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'order',
          filters: { id: 'order_1001' },
        })
      )

      // Verified: 'fulfillment' entity was never queried with an unbounded scan!
      const fulfillmentCalls = mockQuery.graph.mock.calls.filter(
        (call: any[]) => call[0]?.entity === 'fulfillment'
      )
      expect(fulfillmentCalls).toHaveLength(0)
    })

    it('uses filtered query with tracking_number filter when order_id is absent', async () => {
      mockReq.body = {
        awb: 'SR88776655',
        current_status: 'OUT_FOR_DELIVERY',
      }

      // 1. Fulfillment query with AWB filter
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'ful_02',
            data: { awb_code: 'SR88776655' },
            labels: [{ tracking_number: 'SR88776655' }],
          },
        ],
      })

      // 2. Order query with fulfillment filter
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1002',
            fulfillments: [{ id: 'ful_02' }],
          },
        ],
      })

      await POST(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          order_id: 'order_1002',
          fulfillment_id: 'ful_02',
        })
      )

      // Verify fulfillment was queried with AWB filter
      expect(mockQuery.graph).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'fulfillment',
          filters: expect.objectContaining({
            labels: { tracking_number: 'SR88776655' },
          }),
        })
      )
    })
  })

  describe('3. GLOROV-SHIP-003: Automated RTO Event Handling', () => {
    it('emits fulfillment.rto event on EventBus when Shiprocket reports RTO', async () => {
      mockReq.body = {
        order_id: 'order_rto_999',
        awb: 'SR99112233',
        current_status: 'RTO INITIATED',
        activity: 'Customer not available at delivery address',
      }

      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_rto_999',
            display_id: 1999,
            fulfillments: [
              {
                id: 'ful_rto_999',
                data: { awb_code: 'SR99112233' },
                labels: [{ tracking_number: 'SR99112233' }],
              },
            ],
          },
        ],
      })

      await POST(mockReq, mockRes)

      expect(mockRes.status).toHaveBeenCalledWith(200)
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          order_id: 'order_rto_999',
          fulfillment_id: 'ful_rto_999',
          status: 'RTO',
          action_taken: 'rto_processed',
        })
      )

      // Verify fulfillment.rto event was emitted on eventBus
      expect(mockEventBus.emit).toHaveBeenCalledWith({
        name: 'fulfillment.rto',
        data: expect.objectContaining({
          order_id: 'order_rto_999',
          fulfillment_id: 'ful_rto_999',
          awb: 'SR99112233',
          raw_status: 'RTO INITIATED',
          reason: 'Customer not available at delivery address',
        }),
      })

      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ Shiprocket RTO reported for Order order_rto_999')
      )
    })
  })
})
