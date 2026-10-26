import crypto from 'crypto'
import {
  indianPincodeSchema,
  indianPhoneSchema,
  indianAddressSchema,
  seedMetadataSchema,
  seedVariantMetadataSchema,
  botanicalFilterSchema,
} from '@glorov/types'
import { CsvParser } from '../modules/csv-import/csv-parser'
import { CsvValidator } from '../modules/csv-import/csv-validator'

describe('GLOROV Core Business Logic & Quality Engineering Unit Tests', () => {
  describe('1. Product & Botanical Variant Metadata Validation', () => {
    it('validates seed botanical metadata with full gardening parameters', () => {
      const validMetadata = {
        common_name: 'Pusa Ruby Desi Tomato',
        botanical_name: 'Solanum lycopersicum',
        seed_type: 'Heirloom',
        variety: 'Pusa Ruby',
        approx_seeds_per_packet: 50,
        germination_time_range: '6-10 days',
        sowing_depth: '0.5 cm',
        spacing: '45 x 60 cm',
        sunlight: 'full_sun' as const,
        watering: 'alternate_days' as const,
        season: 'kharif' as const,
        difficulty: 'beginner' as const,
        planting_instructions: 'Sow in well-draining loamy soil with rich compost',
        packaging_notes: 'Moisture-proof foil pouch with desiccants',
        is_perishable: false,
      }

      const parsed = seedMetadataSchema.safeParse(validMetadata)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.botanical_name).toBe('Solanum lycopersicum')
        expect(parsed.data.season).toBe('kharif')
        expect(parsed.data.sunlight).toBe('full_sun')
      }
    })

    it('rejects invalid sunlight or season enums in botanical metadata', () => {
      const invalid = {
        botanical_name: 'Ocimum tenuiflorum',
        sunlight: 'ultra_dark', // invalid enum
        season: 'monsoon_winter', // invalid enum
      }
      const parsed = seedMetadataSchema.safeParse(invalid)
      expect(parsed.success).toBe(false)
    })

    it('validates packet size variant metadata and extracts count and weight', () => {
      const packetMetadata = {
        packet_size_label: '50 Seeds Packet',
        approx_seeds_per_packet: 50,
        weight_grams: 2.5,
      }
      const parsed = seedVariantMetadataSchema.safeParse(packetMetadata)
      expect(parsed.success).toBe(true)
      if (parsed.success) {
        expect(parsed.data.approx_seeds_per_packet).toBe(50)
        expect(parsed.data.weight_grams).toBe(2.5)
      }
    })

    it('filters botanical catalog inputs safely with boundary price values', () => {
      const filter = {
        category: 'seeds' as const,
        sunlight: 'full_sun' as const,
        watering: 'daily' as const,
        minPrice: 0,
        maxPrice: 500,
        isPerishable: false,
      }
      const parsed = botanicalFilterSchema.safeParse(filter)
      expect(parsed.success).toBe(true)

      // Negative minPrice is rejected
      const negativeFilter = { minPrice: -50 }
      expect(botanicalFilterSchema.safeParse(negativeFilter).success).toBe(false)
    })
  })

  describe('2. Cart Quantity & Limits Validation Logic', () => {
    /**
     * Pure business logic helper for cart line item quantity constraints:
     * - Minimum quantity: 1
     * - Maximum packet quantity per order: 50 (to prevent commercial hoarding during planting season)
     * - Integer only: no fractions
     * - Stock constraint: cannot exceed available inventory
     */
    function validateCartItemQuantity(
      quantity: unknown,
      availableStock: number
    ): { valid: boolean; error?: string; sanitizedQuantity?: number } {
      if (typeof quantity !== 'number' || isNaN(quantity)) {
        return { valid: false, error: 'Quantity must be a valid number' }
      }
      if (!Number.isInteger(quantity)) {
        return { valid: false, error: 'Quantity must be a whole integer' }
      }
      if (quantity < 1) {
        return { valid: false, error: 'Minimum order quantity is 1 packet' }
      }
      if (quantity > 50) {
        return {
          valid: false,
          error: 'Maximum order quantity per botanical seed variant is 50 packets',
        }
      }
      if (quantity > availableStock) {
        return {
          valid: false,
          error: `Requested quantity (${quantity}) exceeds available stock (${availableStock})`,
        }
      }
      return { valid: true, sanitizedQuantity: quantity }
    }

    it('accepts valid quantities within stock limits', () => {
      expect(validateCartItemQuantity(1, 10)).toEqual({ valid: true, sanitizedQuantity: 1 })
      expect(validateCartItemQuantity(5, 50)).toEqual({ valid: true, sanitizedQuantity: 5 })
      expect(validateCartItemQuantity(50, 100)).toEqual({ valid: true, sanitizedQuantity: 50 })
    })

    it('rejects zero or negative quantities with clear error', () => {
      expect(validateCartItemQuantity(0, 10).valid).toBe(false)
      expect(validateCartItemQuantity(-5, 10).valid).toBe(false)
      expect(validateCartItemQuantity(0, 10).error).toContain('Minimum order quantity')
    })

    it('rejects decimal / non-integer quantities (e.g. 2.5 packets)', () => {
      expect(validateCartItemQuantity(2.5, 10).valid).toBe(false)
      expect(validateCartItemQuantity(2.5, 10).error).toContain('whole integer')
    })

    it('rejects hoarding quantities exceeding maximum order threshold of 50 packets', () => {
      const result = validateCartItemQuantity(51, 100)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Maximum order quantity per botanical seed variant is 50 packets')
    })

    it('rejects requested quantity when inventory is insufficient', () => {
      const result = validateCartItemQuantity(10, 4)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds available stock (4)')
    })
  })

  describe('3. CSV Import Parsing, Escapes & Formula Injection Defense', () => {
    it('correctly parses quoted fields with commas and embedded line breaks', () => {
      const csv = `product_title,handle,sku,price,packet_size
"Tomato Seeds, Heirloom Desi",tomato-desi,GLR-TOM-01,49.00,"20 Seeds"
"Marigold Seeds
Pusa Narangi",marigold-pusa,GLR-MAR-01,79.00,"50 Seeds"`

      const parsed = CsvParser.parse(csv)
      expect(parsed).toHaveLength(2)
      expect(parsed[0].product_title).toBe('Tomato Seeds, Heirloom Desi')
      expect(parsed[1].product_title).toContain('Pusa Narangi')
    })

    it('neutralizes spreadsheet formula injection (=, +, -, @) safely', () => {
      const maliciousFormula = "=cmd|' /C calc'!A0"
      const sanitized = CsvParser.sanitizeFormulaInjection(maliciousFormula)
      expect(sanitized.hadFormula).toBe(true)
      expect(sanitized.sanitized.startsWith("'")).toBe(true)

      const plusFormula = '+1234567890'
      const sanitizedPlus = CsvParser.sanitizeFormulaInjection(plusFormula)
      expect(sanitizedPlus.hadFormula).toBe(true)
      expect(sanitizedPlus.sanitized.startsWith("'")).toBe(true)
    })

    it('validates CSV rows and detects duplicate SKUs in the same file', () => {
      const duplicateSkuCsv = [
        {
          row_number: 1,
          product_title: 'Tomato Seeds',
          handle: 'tomato-seeds',
          sku: 'GLR-TOM-001',
          price: '49.00',
          packet_size: '20 Seeds',
        },
        {
          row_number: 2,
          product_title: 'Tomato Seeds Large',
          handle: 'tomato-seeds',
          sku: 'GLR-TOM-001', // Duplicate SKU!
          price: '99.00',
          packet_size: '50 Seeds',
        },
      ]

      const { report } = CsvValidator.validate(duplicateSkuCsv)
      expect(report.is_valid).toBe(false)
      expect(report.errors.some((e) => e.code === 'DUPLICATE_SKU_IN_FILE')).toBe(true)
    })

    it('rejects negative or zero prices in CSV rows with actionable feedback', () => {
      const badPriceCsv = [
        {
          row_number: 1,
          product_title: 'Free Seed Promo',
          handle: 'free-seed',
          sku: 'GLR-FREE-001',
          price: '-10.00',
          packet_size: '20 Seeds',
        },
      ]
      const { report } = CsvValidator.validate(badPriceCsv)
      expect(report.is_valid).toBe(false)
      expect(report.errors.some((e) => e.field === 'price')).toBe(true)
    })
  })

  describe('4. Inventory Adjustment Rules & Reservation Constraints', () => {
    interface InventoryRecord {
      stocked_quantity: number
      reserved_quantity: number
      safety_stock: number
    }

    /**
     * Core inventory business logic:
     * - Available stock = stocked_quantity - reserved_quantity - safety_stock
     * - Reserve inventory: cannot exceed available stock
     * - Release reservation: cannot decrement below zero
     * - Restock: increments stocked_quantity
     */
    class BotanicalInventoryManager {
      public static calculateAvailable(inv: InventoryRecord): number {
        return Math.max(0, inv.stocked_quantity - inv.reserved_quantity - inv.safety_stock)
      }

      public static reserve(
        inv: InventoryRecord,
        qty: number
      ): { success: boolean; newInv?: InventoryRecord; error?: string } {
        const available = this.calculateAvailable(inv)
        if (qty <= 0) return { success: false, error: 'Reservation quantity must be positive' }
        if (qty > available) {
          return {
            success: false,
            error: `Insufficient available inventory: requested ${qty}, available ${available}`,
          }
        }
        return {
          success: true,
          newInv: {
            ...inv,
            reserved_quantity: inv.reserved_quantity + qty,
          },
        }
      }

      public static releaseReservation(
        inv: InventoryRecord,
        qty: number
      ): { success: boolean; newInv: InventoryRecord } {
        const released = Math.min(qty, inv.reserved_quantity)
        return {
          success: true,
          newInv: {
            ...inv,
            reserved_quantity: inv.reserved_quantity - released,
          },
        }
      }

      public static allocate(
        inv: InventoryRecord,
        qty: number
      ): { success: boolean; newInv: InventoryRecord } {
        // Move from reserved to fulfilled (deducted from both stock and reservation)
        return {
          success: true,
          newInv: {
            ...inv,
            stocked_quantity: Math.max(0, inv.stocked_quantity - qty),
            reserved_quantity: Math.max(0, inv.reserved_quantity - qty),
          },
        }
      }
    }

    it('calculates available inventory taking safety stock into account', () => {
      const inv: InventoryRecord = {
        stocked_quantity: 100,
        reserved_quantity: 20,
        safety_stock: 10,
      }
      expect(BotanicalInventoryManager.calculateAvailable(inv)).toBe(70)
    })

    it('reserves inventory safely without overselling past safety buffer', () => {
      const inv: InventoryRecord = {
        stocked_quantity: 50,
        reserved_quantity: 40,
        safety_stock: 5,
      }
      // Available = 50 - 40 - 5 = 5
      const reserveSuccess = BotanicalInventoryManager.reserve(inv, 5)
      expect(reserveSuccess.success).toBe(true)
      expect(reserveSuccess.newInv?.reserved_quantity).toBe(45)

      // Requesting 6 fails
      const reserveFail = BotanicalInventoryManager.reserve(inv, 6)
      expect(reserveFail.success).toBe(false)
      expect(reserveFail.error).toContain('Insufficient available inventory')
    })

    it('releases reserved stock when customer abandons cart or cancels checkout', () => {
      const inv: InventoryRecord = {
        stocked_quantity: 50,
        reserved_quantity: 20,
        safety_stock: 0,
      }
      const released = BotanicalInventoryManager.releaseReservation(inv, 10)
      expect(released.newInv.reserved_quantity).toBe(10)
      expect(BotanicalInventoryManager.calculateAvailable(released.newInv)).toBe(40)
    })

    it('allocates fulfilled inventory by simultaneously reducing stocked and reserved quantities', () => {
      const inv: InventoryRecord = {
        stocked_quantity: 50,
        reserved_quantity: 10,
        safety_stock: 0,
      }
      const allocated = BotanicalInventoryManager.allocate(inv, 10)
      expect(allocated.newInv.stocked_quantity).toBe(40)
      expect(allocated.newInv.reserved_quantity).toBe(0)
    })
  })

  describe('5. Payment Status Mapping State Machine', () => {
    type MedusaPaymentStatus = 'pending' | 'authorized' | 'captured' | 'canceled' | 'error'

    function mapRazorpayStatus(gatewayStatus: string, verified: boolean): MedusaPaymentStatus {
      switch (gatewayStatus.toLowerCase()) {
        case 'captured':
          return 'captured'
        case 'authorized':
          return 'authorized'
        case 'created':
          return verified ? 'authorized' : 'pending'
        case 'refunded':
        case 'canceled':
          return 'canceled'
        case 'failed':
          return 'error'
        default:
          return 'pending'
      }
    }

    function mapCodStatus(cashCollected: boolean, isCancelled: boolean): MedusaPaymentStatus {
      if (isCancelled) return 'canceled'
      if (cashCollected) return 'captured'
      return 'authorized' // COD orders are authorized upon placement
    }

    it('maps Razorpay gateway statuses to Medusa payment states', () => {
      expect(mapRazorpayStatus('captured', true)).toBe('captured')
      expect(mapRazorpayStatus('authorized', true)).toBe('authorized')
      expect(mapRazorpayStatus('created', false)).toBe('pending')
      expect(mapRazorpayStatus('created', true)).toBe('authorized')
      expect(mapRazorpayStatus('refunded', true)).toBe('canceled')
      expect(mapRazorpayStatus('failed', false)).toBe('error')
      expect(mapRazorpayStatus('unknown_status', false)).toBe('pending')
    })

    it('maps Cash on Delivery lifecycle states correctly', () => {
      // Order placed: cash not yet collected
      expect(mapCodStatus(false, false)).toBe('authorized')
      // Delivery courier marks cash collected
      expect(mapCodStatus(true, false)).toBe('captured')
      // Order cancelled by customer before dispatch
      expect(mapCodStatus(false, true)).toBe('canceled')
    })
  })

  describe('6. Shipping Status Mapping & Webhook Event Translation', () => {
    type MedusaFulfillmentStatus =
      | 'not_fulfilled'
      | 'partially_fulfilled'
      | 'fulfilled'
      | 'shipped'
      | 'delivered'
      | 'canceled'

    function mapShiprocketToMedusaFulfillment(
      shiprocketStatus: string,
      statusId?: number
    ): {
      fulfillmentStatus: MedusaFulfillmentStatus
      isTerminal: boolean
      requiresInspection: boolean
    } {
      const s = shiprocketStatus.trim().toUpperCase()

      if (s === 'DELIVERED' || statusId === 7) {
        return { fulfillmentStatus: 'delivered', isTerminal: true, requiresInspection: false }
      }
      if (
        s === 'IN_TRANSIT' ||
        s === 'IN TRANSIT' ||
        s === 'PICKED_UP' ||
        s === 'PICKED UP' ||
        s === 'SHIPPED' ||
        statusId === 6 ||
        statusId === 17 ||
        statusId === 18
      ) {
        return { fulfillmentStatus: 'shipped', isTerminal: false, requiresInspection: false }
      }
      if (s === 'RTO' || s === 'RTO INITIATED' || s === 'RTO DELIVERED' || statusId === 13) {
        // Return to Origin requires botanical inspection of perishable plants/seeds
        return { fulfillmentStatus: 'shipped', isTerminal: false, requiresInspection: true }
      }
      if (s === 'CANCELLED' || s === 'CANCELED' || statusId === 8) {
        return { fulfillmentStatus: 'canceled', isTerminal: true, requiresInspection: false }
      }
      return { fulfillmentStatus: 'fulfilled', isTerminal: false, requiresInspection: false }
    }

    it('maps Shiprocket delivery event to Medusa delivered status', () => {
      const res = mapShiprocketToMedusaFulfillment('DELIVERED', 7)
      expect(res.fulfillmentStatus).toBe('delivered')
      expect(res.isTerminal).toBe(true)
      expect(res.requiresInspection).toBe(false)
    })

    it('maps in-transit and courier pickup to shipped status', () => {
      expect(mapShiprocketToMedusaFulfillment('IN TRANSIT').fulfillmentStatus).toBe('shipped')
      expect(mapShiprocketToMedusaFulfillment('PICKED UP', 17).fulfillmentStatus).toBe('shipped')
    })

    it('flags Return-To-Origin (RTO) for seller botanical inventory inspection', () => {
      const rto = mapShiprocketToMedusaFulfillment('RTO INITIATED', 13)
      expect(rto.requiresInspection).toBe(true)
    })

    it('maps cancellation to terminal canceled status', () => {
      const cancel = mapShiprocketToMedusaFulfillment('CANCELLED', 8)
      expect(cancel.fulfillmentStatus).toBe('canceled')
      expect(cancel.isTerminal).toBe(true)
    })
  })

  describe('7. Webhook Payload Validation, HMAC Verification & Anti-Replay Defense', () => {
    function verifyHmacSignature(
      rawBody: string,
      receivedSignature: string,
      secret: string
    ): boolean {
      if (!rawBody || !receivedSignature || !secret) return false
      const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')

      const bufA = Buffer.from(expectedSignature, 'utf8')
      const bufB = Buffer.from(receivedSignature, 'utf8')
      if (bufA.length !== bufB.length) return false
      return crypto.timingSafeEqual(bufA, bufB)
    }

    function validateWebhookTimestampFreshness(
      timestampSeconds: number,
      maxDriftSeconds = 300
    ): { fresh: boolean; error?: string } {
      const nowSeconds = Math.floor(Date.now() / 1000)
      const diff = Math.abs(nowSeconds - timestampSeconds)
      if (diff > maxDriftSeconds) {
        return {
          fresh: false,
          error: `Webhook timestamp expired or drifted: ${diff}s drift exceeds ${maxDriftSeconds}s threshold`,
        }
      }
      return { fresh: true }
    }

    it('verifies legitimate webhook signatures using constant-time comparison', () => {
      const secret = 'webhook_secret_key_12345'
      const payload = JSON.stringify({ event: 'order.fulfilled', id: 'ord_123' })
      const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

      expect(verifyHmacSignature(payload, signature, secret)).toBe(true)
      expect(verifyHmacSignature(payload, 'tampered_signature_hex_value', secret)).toBe(false)
      expect(verifyHmacSignature(payload, signature, 'wrong_secret')).toBe(false)
    })

    it('rejects stale webhook payloads to prevent replay attacks', () => {
      const currentSeconds = Math.floor(Date.now() / 1000)
      // Within 5 minute window: valid
      expect(validateWebhookTimestampFreshness(currentSeconds - 30).fresh).toBe(true)

      // 10 minutes old: rejected as replay attack
      const staleSeconds = currentSeconds - 600
      const staleRes = validateWebhookTimestampFreshness(staleSeconds)
      expect(staleRes.fresh).toBe(false)
      expect(staleRes.error).toContain('Webhook timestamp expired')
    })
  })

  describe('8. Retry Decisions & Exponential Backoff Strategy', () => {
    /**
     * Determines whether an external API call failure is transient and retryable:
     * - Retryable: 429 (rate limit), 502, 503, 504 (gateway/network errors), ECONNRESET, ETIMEDOUT
     * - Non-retryable: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 422 (unprocessable)
     */
    function shouldRetry(errorOrStatus: number | Error, attempt: number, maxAttempts = 3): boolean {
      if (attempt >= maxAttempts) return false

      if (typeof errorOrStatus === 'number') {
        const retryableCodes = [429, 502, 503, 504]
        return retryableCodes.includes(errorOrStatus)
      }

      const msg = errorOrStatus.message.toLowerCase()
      return (
        msg.includes('etimedout') ||
        msg.includes('econnreset') ||
        msg.includes('network error') ||
        msg.includes('fetch failed')
      )
    }

    function calculateBackoffDelayMs(
      attempt: number,
      baseDelayMs = 100,
      maxDelayMs = 3000
    ): number {
      // Exponential backoff: base * 2^(attempt - 1) capped at maxDelayMs
      const exponential = baseDelayMs * Math.pow(2, attempt - 1)
      return Math.min(exponential, maxDelayMs)
    }

    it('identifies transient errors as retryable', () => {
      expect(shouldRetry(429, 1, 3)).toBe(true)
      expect(shouldRetry(503, 2, 3)).toBe(true)
      expect(shouldRetry(new Error('Fetch failed: ETIMEDOUT'), 1, 3)).toBe(true)
    })

    it('identifies client/auth errors as non-retryable to avoid spamming endpoints', () => {
      expect(shouldRetry(400, 1, 3)).toBe(false)
      expect(shouldRetry(401, 1, 3)).toBe(false)
      expect(shouldRetry(403, 1, 3)).toBe(false)
      expect(shouldRetry(404, 1, 3)).toBe(false)
      expect(shouldRetry(422, 1, 3)).toBe(false)
    })

    it('stops retrying when maximum attempts are reached', () => {
      expect(shouldRetry(503, 3, 3)).toBe(false)
      expect(shouldRetry(429, 4, 3)).toBe(false)
    })

    it('calculates proper exponential backoff with caps', () => {
      expect(calculateBackoffDelayMs(1, 100, 1000)).toBe(100)
      expect(calculateBackoffDelayMs(2, 100, 1000)).toBe(200)
      expect(calculateBackoffDelayMs(3, 100, 1000)).toBe(400)
      expect(calculateBackoffDelayMs(4, 100, 1000)).toBe(800)
      expect(calculateBackoffDelayMs(5, 100, 1000)).toBe(1000) // capped
    })
  })
})
