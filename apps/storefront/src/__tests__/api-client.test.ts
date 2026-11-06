import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { apiFetch, MedusaApiError } from '../lib/api/client'
import { MEDUSA_PUBLISHABLE_KEY } from '../lib/constants'

describe('Medusa API Client Unit Tests (api-client.test.ts)', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  describe('MedusaApiError Class', () => {
    it('instantiates correctly with message, status, details, and name', () => {
      const error = new MedusaApiError('Cart not found', 404, { cart_id: 'cart_123' })
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(MedusaApiError)
      expect(error.name).toBe('MedusaApiError')
      expect(error.message).toBe('Cart not found')
      expect(error.status).toBe(404)
      expect(error.details).toEqual({ cart_id: 'cart_123' })
    })
  })

  describe('apiFetch() Success Flows', () => {
    it('successfully fetches and deserializes JSON response from Medusa backend', async () => {
      const mockData = { id: 'prod_monstera', title: 'Monstera Deliciosa' }
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData,
      } as Response)

      const result = await apiFetch<typeof mockData>('/store/products/prod_monstera')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(mockData)
        expect(result.status).toBe(200)
      }
    })

    it('attaches publishable API key, content-type, and accept headers by default', async () => {
      let capturedHeaders: Record<string, string> = {}
      global.fetch = vi.fn().mockImplementation((_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers as Record<string, string>
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ status: 'ok' }),
        } as Response)
      })

      await apiFetch('/store/health')

      expect(capturedHeaders['Content-Type']).toBe('application/json')
      expect(capturedHeaders['Accept']).toBe('application/json')
      if (MEDUSA_PUBLISHABLE_KEY) {
        expect(capturedHeaders['x-publishable-api-key']).toBe(MEDUSA_PUBLISHABLE_KEY)
      }
    })

    it('attaches Authorization Bearer header when authToken option is provided', async () => {
      let capturedHeaders: Record<string, string> = {}
      global.fetch = vi.fn().mockImplementation((_url: string | URL | Request, init?: RequestInit) => {
        capturedHeaders = init?.headers as Record<string, string>
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ customer: { id: 'cust_me' } }),
        } as Response)
      })

      await apiFetch('/store/customers/me', {
        authToken: 'customer_jwt_session_token_xyz',
      })

      expect(capturedHeaders['Authorization']).toBe('Bearer customer_jwt_session_token_xyz')
    })

    it('builds query parameters string correctly and omits null or undefined values', async () => {
      let capturedUrl = ''
      global.fetch = vi.fn().mockImplementation((url: string | URL | Request) => {
        capturedUrl = typeof url === 'string' ? url : url.toString()
        return Promise.resolve({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ products: [] }),
        } as Response)
      })

      await apiFetch('/store/products', {
        params: {
          category_id: 'cat_seeds',
          limit: 10,
          offset: 0,
          in_stock: true,
          undefined_param: undefined,
          null_param: null,
        },
      })

      expect(capturedUrl).toContain('category_id=cat_seeds')
      expect(capturedUrl).toContain('limit=10')
      expect(capturedUrl).toContain('in_stock=true')
      expect(capturedUrl).not.toContain('undefined_param')
      expect(capturedUrl).not.toContain('null_param')
    })

    it('serializes JSON request body for POST/PUT requests', async () => {
      let capturedBody = ''
      global.fetch = vi.fn().mockImplementation((_url: string | URL | Request, init?: RequestInit) => {
        capturedBody = init?.body as string
        return Promise.resolve({
          ok: true,
          status: 201,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ cart: { id: 'cart_created' } }),
        } as Response)
      })

      await apiFetch('/store/carts', {
        method: 'POST',
        body: { currency_code: 'inr', region_id: 'reg_in' },
      })

      expect(JSON.parse(capturedBody)).toEqual({
        currency_code: 'inr',
        region_id: 'reg_in',
      })
    })
  })

  describe('apiFetch() Error Handling', () => {
    it('handles HTTP 400 Bad Request and extracts backend message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          type: 'invalid_data',
          message: 'Variant is out of stock for Pune nursery.',
        }),
      } as Response)

      const result = await apiFetch('/store/carts/cart_1/line-items', {
        method: 'POST',
        body: { variant_id: 'var_empty' },
      })

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(400)
        expect(result.error).toBe('Variant is out of stock for Pune nursery.')
        expect(result.details).toBeDefined()
      }
    })

    it('handles HTTP 401 Unauthorized with descriptive error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Customer session has expired or token is invalid.',
        }),
      } as Response)

      const result = await apiFetch('/store/customers/me')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(401)
        expect(result.error).toBe('Customer session has expired or token is invalid.')
      }
    })

    it('handles HTTP 404 Not Found error', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          message: 'Product with handle "unknown-plant" does not exist.',
        }),
      } as Response)

      const result = await apiFetch('/store/products/unknown-plant')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(404)
        expect(result.error).toBe('Product with handle "unknown-plant" does not exist.')
      }
    })

    it('handles HTTP 500 Internal Server Error when response body is HTML/text rather than JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html><body>Internal Server Error</body></html>',
      } as Response)

      const result = await apiFetch('/store/checkout')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(500)
        expect(result.error).toBe('API request failed with status 500')
        expect(result.details).toEqual({
          raw: '<html><body>Internal Server Error</body></html>',
        })
      }
    })

    it('handles low-level network failure (connection refused / offline) and returns status 0', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch from http://localhost:9000'))

      const result = await apiFetch('/store/products')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.status).toBe(0)
        expect(result.error).toContain('Failed to fetch from http://localhost:9000')
        expect(result.details).toBeInstanceOf(Error)
      }
    })
  })
})
