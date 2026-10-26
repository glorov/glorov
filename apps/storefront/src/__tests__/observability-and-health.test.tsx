/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as healthHandler } from '../app/api/health/route'
import { GET as pincodeHandler } from '../app/api/shipping/pincode-check/route'
import { GET as trackingHandler } from '../app/api/shipping/tracking/[id]/route'
import { GET as searchHandler } from '../app/api/search/route'
import * as medusaClientModule from '../lib/medusa-client'
import { isValidCorrelationId } from '@glorov/types'

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: 'mock_customer_jwt' }),
  }),
}))

describe('Storefront Observability, Health Checks, and Request Correlation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('1. Storefront Health Check (/api/health)', () => {
    it('returns healthy operational status when backend is responsive', async () => {
      vi.spyOn(medusaClientModule, 'checkBackendHealth').mockResolvedValueOnce({
        healthy: true,
        status: 200,
        latencyMs: 15,
        message: 'Medusa v2 backend is online and healthy',
      })

      const req = new NextRequest('http://localhost:3000/api/health', {
        headers: {
          'x-correlation-id': 'glr_test_custom_cid_123',
        },
      })

      const res = await healthHandler(req)
      expect(res.status).toBe(200)

      const body = await res.json()
      expect(body.status).toBe('healthy')
      expect(body.correlation_id).toBe('glr_test_custom_cid_123')
      expect(res.headers.get('x-correlation-id')).toBe('glr_test_custom_cid_123')
      expect(res.headers.get('cache-control')).toContain('no-store')

      // Process telemetry
      expect(body.storefront.status).toBe('healthy')
      expect(typeof body.storefront.uptime_seconds).toBe('number')
      expect(typeof body.storefront.memory.heap_used_mb).toBe('number')

      // Backend status
      expect(body.backend.healthy).toBe(true)
      expect(body.backend.status).toBe(200)
    })

    it('returns degraded status without restarting when backend is temporarily unreachable', async () => {
      vi.spyOn(medusaClientModule, 'checkBackendHealth').mockResolvedValueOnce({
        healthy: false,
        status: 503,
        latencyMs: 120,
        message: 'Could not connect to backend',
      })

      const req = new NextRequest('http://localhost:3000/api/health')
      const res = await healthHandler(req)

      expect(res.status).toBe(200) // Returns 200 so container orchestrator does not restart storefront process

      const body = await res.json()
      expect(body.status).toBe('degraded')
      expect(isValidCorrelationId(body.correlation_id)).toBe(true)
      expect(res.headers.get('x-correlation-id')).toBe(body.correlation_id)
      expect(body.storefront.status).toBe('healthy')
      expect(body.backend.healthy).toBe(false)
    })
  })

  describe('2. Request Correlation & Header Propagation', () => {
    it('propagates correlation ID in shipping pincode check to backend and client', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          serviceable: true,
          status: 'confirmed',
          pincode: '411001',
          city: 'Pune',
          state: 'Maharashtra',
          prepaid_eligible: true,
          cod_available: true,
          rate_inr: 49,
          estimated_days: '2-3',
        }),
      } as any)

      const customCid = 'glr_pincode_req_9988'
      const req = new NextRequest('http://localhost:3000/api/shipping/pincode-check?pincode=411001', {
        headers: {
          'x-correlation-id': customCid,
        },
      })

      const res = await pincodeHandler(req)
      expect(res.status).toBe(200)
      expect(res.headers.get('x-correlation-id')).toBe(customCid)

      // Verify that fetch was called with x-correlation-id forwarded to Medusa
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/store/pincode-check?pincode=411001'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-correlation-id': customCid,
          }),
        })
      )
    })

    it('propagates correlation ID in tracking route to backend and client', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          order_id: 'order_123',
          tracking_number: 'SR123456789IN',
          status: 'IN_TRANSIT',
        }),
      } as any)

      const customCid = 'glr_tracking_req_7766'
      const req = new NextRequest('http://localhost:3000/api/shipping/tracking/order_123', {
        headers: {
          'x-correlation-id': customCid,
        },
      })

      const res = await trackingHandler(req, { params: Promise.resolve({ id: 'order_123' }) })
      expect(res.status).toBe(200)
      expect(res.headers.get('x-correlation-id')).toBe(customCid)

      // Verify that fetch was called with x-correlation-id forwarded to Medusa
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/store/orders/order_123/tracking'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-correlation-id': customCid,
          }),
        })
      )
    })

    it('attaches correlation ID on search route response headers', async () => {
      const req = new NextRequest('http://localhost:3000/api/search?q=tulsi', {
        headers: {
          'x-correlation-id': 'glr_search_req_5544',
        },
      })

      const res = await searchHandler(req)
      expect(res.headers.get('x-correlation-id')).toBe('glr_search_req_5544')
    })
  })
})
