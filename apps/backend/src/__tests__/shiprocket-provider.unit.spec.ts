import { ShiprocketClient } from '../modules/fulfillment-shiprocket/client'
import { ShiprocketFulfillmentService } from '../modules/fulfillment-shiprocket/service'

describe('Shiprocket Fulfillment Provider Unit Tests', () => {
  describe('ShiprocketClient Configuration & Mock Mode', () => {
    it('1. Initializes in mock mode when credentials are not supplied or mock_mode is true', () => {
      const client = new ShiprocketClient({
        mock_mode: true,
        pickup_pincode: '411001',
        pickup_location_name: 'Pune Central Nursery Hub',
      })

      expect(client.isMockMode()).toBe(true)
      expect(client.getPickupPincode()).toBe('411001')
      expect(client.getPickupLocationName()).toBe('Pune Central Nursery Hub')
    })

    it('2. Authenticates and caches JWT token with 24-hour TTL', async () => {
      const client = new ShiprocketClient({ mock_mode: true })
      const token1 = await client.authenticate()
      expect(token1).toMatch(/^mock_sr_jwt_token_/)

      // Verify cached token survives subsequent invocations after a time delay
      await new Promise((resolve) => setTimeout(resolve, 10))

      const token2 = await client.authenticate()
      expect(token2).toBe(token1) // Cached token returned without re-authenticating
    })

    it('3. Validates Indian PIN code format in serviceability check', async () => {
      const client = new ShiprocketClient({ mock_mode: true })

      // Invalid: starts with 0
      const res0 = await client.checkServiceability({ deliveryPostcode: '012345' })
      expect(res0.serviceable).toBe(false)
      expect(res0.message).toContain('Invalid 6-digit Indian PIN code')

      // Invalid: 5 digits
      const res5 = await client.checkServiceability({ deliveryPostcode: '41100' })
      expect(res5.serviceable).toBe(false)

      // Invalid: 7 digits
      const res7 = await client.checkServiceability({ deliveryPostcode: '4110011' })
      expect(res7.serviceable).toBe(false)

      // Valid: Pune PIN 411001
      const resPune = await client.checkServiceability({ deliveryPostcode: '411001' })
      expect(resPune.serviceable).toBe(true)
      expect(resPune.city).toBe('Pune')
      expect(resPune.cod_available).toBe(true)
      expect(resPune.estimated_days).toBe(2)

      // Unserviceable prefix 999
      const resUnserviceable = await client.checkServiceability({ deliveryPostcode: '999123' })
      expect(resUnserviceable.serviceable).toBe(false)
      expect(resUnserviceable.cod_available).toBe(false)
    })

    it('4. Creates adhoc order and assigns mock AWB with tracking details', async () => {
      const client = new ShiprocketClient({ mock_mode: true })
      const order = await client.createAdhocOrder({
        order_id: 'order_test_123',
        order_date: '2026-10-26 12:00',
        pickup_location: 'Pune Central Nursery Hub',
        billing_customer_name: 'Aditi',
        billing_last_name: 'Sharma',
        billing_address: '42 Garden Lane',
        billing_city: 'Pune',
        billing_pincode: '411001',
        billing_state: 'Maharashtra',
        billing_country: 'India',
        billing_email: 'aditi@example.com',
        billing_phone: '9876543210',
        shipping_is_billing: true,
        order_items: [
          {
            name: 'Tomato Seeds (Desi / Pusa Ruby)',
            sku: 'GLR-SD-TOM-020',
            units: 2,
            selling_price: 49,
          },
        ],
        payment_method: 'Prepaid',
        shipping_charges: 49,
        sub_total: 98,
        length: 15,
        breadth: 10,
        height: 5,
        weight: 0.25,
      })

      expect(order.order_id).toBeDefined()
      expect(order.shipment_id).toBeDefined()
      expect(order.awb_code).toMatch(/^SR\d+/)
      expect(order.courier_name).toBeDefined()

      // Assign AWB
      const awbRes = await client.assignAwb(order.shipment_id)
      expect(awbRes.awb_assign_status).toBe(1)
      expect(awbRes.response?.data?.awb_code).toMatch(/^SR\d+/)

      // Generate Label
      const labelRes = await client.generateLabel([order.shipment_id])
      expect(labelRes.label_created).toBe(1)
      expect(labelRes.label_url).toContain('https://')

      // Track AWB
      const trackRes = await client.trackAwb(order.awb_code!)
      expect(trackRes.tracking_data?.shipment_status).toBe(7)
      expect(trackRes.tracking_data?.shipment_track?.[0].current_status).toBe('DELIVERED')

      // Cancel Order
      const cancelRes = await client.cancelOrder([order.order_id])
      expect(cancelRes.status).toBe(200)
    })

    it('5. Webhook token verification handles configured and mock secrets', () => {
      const client = new ShiprocketClient({
        webhook_token: 'secure_wh_secret_2026',
      })

      expect(client.verifyWebhookToken('secure_wh_secret_2026')).toBe(true)
      expect(client.verifyWebhookToken('wrong_secret')).toBe(false)
      expect(client.verifyWebhookToken(null)).toBe(false)
      expect(client.verifyWebhookToken(undefined)).toBe(false)
    })
  })

  describe('ShiprocketFulfillmentService Interface & Methods', () => {
    let service: ShiprocketFulfillmentService

    beforeEach(() => {
      service = new ShiprocketFulfillmentService(
        {},
        {
          mock_mode: true,
          pickup_pincode: '411001',
          pickup_location_name: 'Pune Central Nursery Hub',
        }
      )
    })

    it('6. Exposes supported Indian fulfillment options with correct identifiers', async () => {
      const options = await service.getFulfillmentOptions()
      expect(options).toHaveLength(3)

      const standard = options.find((o) => o.id === 'shiprocket-standard')
      const express = options.find((o) => o.id === 'shiprocket-express')
      const ret = options.find((o) => o.id === 'shiprocket-return')

      expect(standard).toBeDefined()
      expect(standard?.name).toContain('Standard Delivery')
      expect(express).toBeDefined()
      expect(express?.name).toContain('Express Botanical Delivery')
      expect(ret?.is_return).toBe(true)
    })

    it('7. Calculates shipping prices with graceful fallbacks', async () => {
      // Standard option price calculation
      const stdPrice = await service.calculatePrice(
        { id: 'shiprocket-standard' },
        {},
        { shipping_address: { postal_code: '411001' } } as any
      )
      expect(stdPrice.calculated_amount).toBe(4900) // ₹49
      expect(stdPrice.is_calculated_price_tax_inclusive).toBe(true)

      // Express option price calculation
      const expPrice = await service.calculatePrice(
        { id: 'shiprocket-express' },
        {},
        { shipping_address: { postal_code: '560001' } } as any
      )
      expect(expPrice.calculated_amount).toBeGreaterThanOrEqual(4900)

      // Missing postal code returns safe default without throwing error
      const fallbackPrice = await service.calculatePrice(
        { id: 'shiprocket-standard' },
        {},
        {} as any
      )
      expect(fallbackPrice.calculated_amount).toBe(4900)
    })

    it('8. Creates fulfillment with complete Indian delivery details, AWB, and label', async () => {
      const fulfillmentResult = await service.createFulfillment(
        { payment_method: 'prepaid' },
        [
          {
            title: 'Marigold Seeds (Pusa Narangi Gainda)',
            sku: 'GLR-SD-MAR-050',
            quantity: 3,
            unit_price: 3900,
          } as any,
        ],
        {
          id: 'ord_test_999',
          email: 'vikram.mehta@example.com',
          shipping_address: {
            first_name: 'Vikram',
            last_name: 'Mehta',
            address_1: 'Plot 42, Botanical Greens',
            city: 'Pune',
            province: 'Maharashtra',
            postal_code: '411001',
            phone: '9876543210',
          },
        } as any,
        { data: {} } as any
      )

      expect(fulfillmentResult.data).toBeDefined()
      expect(fulfillmentResult.data.shiprocket_order_id).toBeDefined()
      expect(fulfillmentResult.data.shiprocket_shipment_id).toBeDefined()
      expect(fulfillmentResult.data.awb_code).toMatch(/^SR\d+/)
      expect(fulfillmentResult.data.courier_name).toBeDefined()
      expect(fulfillmentResult.data.status).toBe('AWB_ASSIGNED')

      expect(fulfillmentResult.labels).toHaveLength(1)
      const label = fulfillmentResult.labels[0]
      expect(label.tracking_number).toBe(fulfillmentResult.data.awb_code)
      expect(label.tracking_url).toContain(fulfillmentResult.data.awb_code as string)
      expect(label.label_url).toBeDefined()
    })

    it('9. Idempotency Guard: does not duplicate shipment creation if already created', async () => {
      const existingFulfillment = {
        data: {
          shiprocket_order_id: 98123456,
          shiprocket_shipment_id: 87123456,
          awb_code: 'SR999888777',
          tracking_url: 'https://shiprocket.co/tracking/SR999888777',
          label_url: 'https://shiprocket.co/labels/SR999888777.pdf',
        },
      }

      // Re-invoking createFulfillment with existing fulfillment data returns existing data without calling API
      const result = await service.createFulfillment(
        {},
        [],
        undefined,
        existingFulfillment as any
      )

      expect(result.data.shiprocket_order_id).toBe(98123456)
      expect(result.data.awb_code).toBe('SR999888777')
      expect(result.labels[0].tracking_number).toBe('SR999888777')
    })

    it('10. Rejects fulfillment if delivery address has an invalid Indian PIN code', async () => {
      await expect(
        service.createFulfillment(
          {},
          [],
          {
            shipping_address: {
              postal_code: '012345', // Invalid: begins with 0
            },
          } as any,
          { data: {} } as any
        )
      ).rejects.toThrow(/valid 6-digit Indian PIN code/)
    })

    it('11. Cancels fulfillment cleanly', async () => {
      const cancelRes = await service.cancelFulfillment({
        shiprocket_order_id: 98123456,
      })
      expect(cancelRes.status).toBe('CANCELLED')
      expect(cancelRes.cancelled_at).toBeDefined()
    })

    it('12. Retrieves fulfillment documents (shipping label)', async () => {
      const docs = await service.getFulfillmentDocuments({
        label_url: 'https://shiprocket.co/label.pdf',
      })
      expect(docs).toHaveLength(1)
      expect((docs[0] as unknown as { url: string }).url).toBe('https://shiprocket.co/label.pdf')
    })

    it('13. Supports remote postal corridors (North East & Islands) with extended ETDs and COD restrictions', async () => {
      const client = new ShiprocketClient({ mock_mode: true })

      // Remote North East PIN
      const neRes = await client.checkServiceability({ deliveryPostcode: '790001' })
      expect(neRes.serviceable).toBe(true)
      expect(neRes.state).toBe('Assam / North East')
      expect(neRes.estimated_days).toBe(5)
      expect(neRes.cod_available).toBe(false)
      expect(neRes.message).toContain('Remote Transit Corridor')

      // Remote Andaman & Nicobar Island PIN
      const islandRes = await client.checkServiceability({ deliveryPostcode: '744101' })
      expect(islandRes.serviceable).toBe(true)
      expect(islandRes.city).toBe('Port Blair')
      expect(islandRes.state).toBe('Andaman and Nicobar Islands')
      expect(islandRes.estimated_days).toBe(5)
      expect(islandRes.cod_available).toBe(false)
    })

    it('14. Never marks prepaid authorized payment orders as COD', async () => {
      const order = {
        id: 'ord_prepaid_auth',
        email: 'prepaid@example.com',
        payment_status: 'authorized', // Note: card/UPI orders are in authorized state before capture!
        payment_collections: [
          {
            payments: [{ provider_id: 'razorpay' }],
          },
        ],
        shipping_address: {
          postal_code: '411001',
          phone: '9876543210',
        },
      }

      // Mock createAdhocOrder to inspect generated payload
      const spy = jest.spyOn(service.client, 'createAdhocOrder')

      await service.createFulfillment(
        { payment_method: 'prepaid' },
        [{ title: 'Seeds', quantity: 1, unit_price: 4900 } as any],
        order as any,
        { data: {} } as any
      )

      expect(spy).toHaveBeenCalledTimes(1)
      const callPayload = spy.mock.calls[0][0]
      expect(callPayload.payment_method).toBe('Prepaid') // MUST be Prepaid, NOT COD
      spy.mockRestore()
    })

    it('15. Sanitizes formatted Indian phone numbers to 10 digits', async () => {
      const spy = jest.spyOn(service.client, 'createAdhocOrder')

      await service.createFulfillment(
        {},
        [{ title: 'Seeds', quantity: 1, unit_price: 4900 } as any],
        {
          id: 'ord_phone_test',
          shipping_address: {
            postal_code: '411001',
            phone: '+91 98765 43210', // Formatted with +91 and spaces
          },
        } as any,
        { data: {} } as any
      )

      expect(spy).toHaveBeenCalledTimes(1)
      const callPayload = spy.mock.calls[0][0]
      expect(callPayload.billing_phone).toBe('9876543210')
      expect(callPayload.shipping_phone).toBe('9876543210')
      spy.mockRestore()
    })

    it('16. Implements getShipmentDocuments, getReturnDocuments, and retrieveDocuments', async () => {
      const shipmentDocs = await service.getShipmentDocuments({
        label_url: 'https://shiprocket.co/shipment-label.pdf',
      })
      expect(shipmentDocs).toHaveLength(1)

      const returnDocs = await service.getReturnDocuments({})
      expect(returnDocs).toEqual([])

      const retrievedDocs = await service.retrieveDocuments(
        { label_url: 'https://shiprocket.co/doc-label.pdf' },
        'label'
      )
      expect(retrievedDocs).toHaveLength(1)
    })

    it('17. Caches serviceability lookups with short-lived TTL and clears on request', async () => {
      ShiprocketClient.clearServiceabilityCache()
      const client = new ShiprocketClient({ mock_mode: true })

      const firstCheck = await client.checkServiceability({ deliveryPostcode: '560001' })
      expect(firstCheck.serviceable).toBe(true)
      expect(firstCheck.status).toBe('confirmed')

      // Second check should be served from memory cache
      const secondCheck = await client.checkServiceability({ deliveryPostcode: '560001' })
      expect(secondCheck).toBe(firstCheck) // exact object reference from cache

      // Clearing cache forces fresh lookup
      ShiprocketClient.clearServiceabilityCache()
      const thirdCheck = await client.checkServiceability({ deliveryPostcode: '560001' })
      expect(thirdCheck).not.toBe(firstCheck)
      expect(thirdCheck.pincode).toBe('560001')
    })

    it('18. Explicitly marks unserviceable and invalid PINs with status "rejected"', async () => {
      const client = new ShiprocketClient({ mock_mode: true })

      // Invalid format
      const invalidRes = await client.checkServiceability({ deliveryPostcode: '012345' })
      expect(invalidRes.status).toBe('rejected')
      expect(invalidRes.serviceable).toBe(false)
      expect(invalidRes.prepaid_eligible).toBe(false)
      expect(invalidRes.cod_eligible).toBe(false)
      expect(invalidRes.cod_restriction_reason).toBe('invalid_format')

      // Unserviceable prefix
      const unserviceableRes = await client.checkServiceability({ deliveryPostcode: '999123' })
      expect(unserviceableRes.status).toBe('rejected')
      expect(unserviceableRes.serviceable).toBe(false)
      expect(unserviceableRes.prepaid_eligible).toBe(false)
      expect(unserviceableRes.cod_eligible).toBe(false)
      expect(unserviceableRes.cod_restriction_reason).toBe('out_of_service_area')
    })

    it('19. Accurately reports "undetermined" status on external provider failure', async () => {
      // Create client in live mode with mocked request method that throws timeout
      const liveClient = new ShiprocketClient({
        mock_mode: false,
        email: 'test@example.com',
        password: 'password',
      })
      ;(liveClient as any).cachedToken = 'valid_token'
      ;(liveClient as any).tokenExpiresAt = Date.now() + 100000

      // Mock request to throw a timeout / 503 error
      jest.spyOn(liveClient as any, 'request').mockRejectedValueOnce(
        new Error('Shiprocket API gateway timed out after 5000ms')
      )

      const result = await liveClient.checkServiceability({
        deliveryPostcode: '411001',
        skipCache: true,
      })

      // Must be undetermined, NOT serviceable=true with fake delivery date
      expect(result.status).toBe('undetermined')
      expect(result.serviceable).toBe(false)
      expect(result.prepaid_eligible).toBe(false)
      expect(result.cod_eligible).toBe(false)
      expect(result.cod_restriction_reason).toBe('provider_unavailable')
      expect(result.message).toContain('logistics provider issue')
    })

    it('20. Distinguishes delivery serviceability from COD eligibility for remote corridors', async () => {
      const client = new ShiprocketClient({ mock_mode: true })

      // Andaman & Nicobar PIN 744101
      const islandRes = await client.checkServiceability({ deliveryPostcode: '744101' })
      expect(islandRes.serviceable).toBe(true)
      expect(islandRes.status).toBe('confirmed')
      expect(islandRes.prepaid_eligible).toBe(true)
      // COD restricted for remote botanical transit corridor
      expect(islandRes.cod_available).toBe(false)
      expect(islandRes.cod_eligible).toBe(false)
      expect(islandRes.cod_restriction_reason).toBe('remote_corridor')
      expect(islandRes.rate_inr).toBe(129)
      expect(islandRes.rate_source).toBe('configured_estimate')
    })

    it('21. Prevents shipping price tampering by calculating canonical prices server-side', async () => {
      // Test standard shipping calculation: server ignores any client-supplied price
      const standardPrice = await service.calculatePrice(
        { id: 'shiprocket-standard' } as any,
        { option_code: 'shiprocket-standard', client_tampered_price: 1 } as any,
        { shipping_address: { postal_code: '411001' } } as any
      )
      // Canonical standard rate is ₹49 (4900 paise)
      expect(standardPrice.calculated_amount).toBe(4900)

      // Test express shipping calculation
      const expressPrice = await service.calculatePrice(
        { id: 'shiprocket-express' } as any,
        { option_code: 'shiprocket-express', client_tampered_price: 10 } as any,
        { shipping_address: { postal_code: '411001' } } as any
      )
      // Canonical express rate is ₹99 (9900 paise) or calculated live paise
      expect(expressPrice.calculated_amount).toBeGreaterThanOrEqual(4900)
    })

    it('22. GLOROV-SHIP-004: Rejects fulfillment if delivery address phone number is missing or invalid', async () => {
      // Missing phone
      await expect(
        service.createFulfillment(
          {},
          [{ title: 'Seeds', quantity: 1, unit_price: 4900 } as any],
          {
            id: 'ord_no_phone',
            shipping_address: {
              postal_code: '411001',
              phone: '',
            },
          } as any,
          { data: {} } as any
        )
      ).rejects.toThrow(/valid 10-digit mobile number/)

      // Phone with fewer than 10 digits
      await expect(
        service.createFulfillment(
          {},
          [{ title: 'Seeds', quantity: 1, unit_price: 4900 } as any],
          {
            id: 'ord_short_phone',
            shipping_address: {
              postal_code: '411001',
              phone: '98765',
            },
          } as any,
          { data: {} } as any
        )
      ).rejects.toThrow(/valid 10-digit mobile number/)
    })

    it('23. GLOROV-SHIP-001: Throws error when AWB assignment fails instead of generating a fake SR AWB', async () => {
      // Mock createAdhocOrder to return an order without an awb_code
      const createSpy = jest.spyOn(service.client, 'createAdhocOrder').mockResolvedValueOnce({
        order_id: 1234567,
        shipment_id: 7654321,
        status: 'NEW',
        status_code: 1,
        onboarding_completed_now: 0,
        awb_code: undefined as any,
        courier_name: 'Delhivery',
      })

      // Mock assignAwb to fail / return no AWB code
      const assignSpy = jest.spyOn(service.client, 'assignAwb').mockResolvedValueOnce({
        awb_assign_status: 0,
        message: 'No couriers available or wallet balance depleted',
      })

      await expect(
        service.createFulfillment(
          {},
          [{ title: 'Seeds', quantity: 1, unit_price: 4900 } as any],
          {
            id: 'ord_awb_fail',
            shipping_address: {
              postal_code: '411001',
              phone: '9876543210',
            },
          } as any,
          { data: {} } as any
        )
      ).rejects.toThrow(/live AWB assignment failed/)

      createSpy.mockRestore()
      assignSpy.mockRestore()
    })

    it('24. GLOROV-SHIP-005: Reads package dimensions from item metadata / product attributes and calculates totals', () => {
      // Default single item fallback
      const defaultDims = service.calculatePackageDimensions([{ quantity: 1 }])
      expect(defaultDims).toEqual({
        length: 15,
        breadth: 12,
        height: 8,
        weight: 0.5,
      })

      // Item with custom metadata (e.g., large planter pot)
      const customItemDims = service.calculatePackageDimensions([
        {
          quantity: 1,
          metadata: {
            length: 30,
            breadth: 25,
            height: 20,
            weight_grams: 1500, // 1.5 kg
          },
        },
      ])
      expect(customItemDims.length).toBe(30)
      expect(customItemDims.breadth).toBe(25)
      expect(customItemDims.height).toBe(20)
      expect(customItemDims.weight).toBe(1.5)

      // Multi-item order: dimensions combine max length/breadth and stack height & sum weight
      const multiItemDims = service.calculatePackageDimensions([
        {
          quantity: 2,
          metadata: {
            length: 20,
            breadth: 15,
            height: 5,
            weight_grams: 300, // 0.3 kg * 2 = 0.6 kg
          },
        },
        {
          quantity: 1,
          metadata: {
            length: 25,
            breadth: 18,
            height: 10,
            weight_grams: 800, // 0.8 kg
          },
        },
      ])
      expect(multiItemDims.length).toBe(25) // max(20, 25)
      expect(multiItemDims.breadth).toBe(18) // max(15, 18)
      expect(multiItemDims.height).toBe(20) // 5*2 + 10 = 20
      expect(multiItemDims.weight).toBe(1.4) // 0.6 + 0.8 = 1.4
    })

    it('25. GLOROV-SHIP-005: Honors explicit package dimensions override from fulfillment data', () => {
      const explicitDims = service.calculatePackageDimensions(
        [{ quantity: 1 }],
        undefined,
        {
          length: 40,
          breadth: 35,
          height: 30,
          weight: 5.2,
        }
      )
      expect(explicitDims).toEqual({
        length: 40,
        breadth: 35,
        height: 30,
        weight: 5.2,
      })
    })

    it('26. GLOROV-PERF-007: Evicts oldest 200 entries when serviceability cache reaches 1000 without dropping entire cache', async () => {
      ShiprocketClient.clearServiceabilityCache()
      const client = new ShiprocketClient({ mock_mode: true, pickup_pincode: '411001' })

      // Seed 1,000 unique cache entries
      for (let i = 1; i <= 1000; i++) {
        const pin = String(100000 + i)
        await client.checkServiceability({
          deliveryPostcode: pin,
          weightKg: 0.5,
        })
      }
      expect(ShiprocketClient.getServiceabilityCacheSize()).toBe(1000)

      // Add the 1,001st entry -> Triggers LRU eviction of oldest 200 entries
      await client.checkServiceability({
        deliveryPostcode: '299999',
        weightKg: 0.5,
      })

      // Cache size should be 1000 - 200 + 1 = 801 entries (NOT 1 or 0 from complete clear)
      expect(ShiprocketClient.getServiceabilityCacheSize()).toBe(801)
      ShiprocketClient.clearServiceabilityCache()
    })

    it('27. GLOROV-SHIP-002: Does not generate fake mock S3/Shiprocket label URLs when label generation fails', async () => {
      const service = new ShiprocketFulfillmentService()
      const client = (service as any).client
      jest.spyOn(client, 'generateLabel').mockRejectedValueOnce(new Error('Shiprocket label API down'))

      const result = await service.createFulfillment(
        {
          provider_id: 'shiprocket-standard',
          data: {},
        },
        [
          {
            title: 'Holy Basil Tulsi Seeds',
            quantity: 1,
            unit_price: 19900,
          },
        ],
        {
          id: 'ord_label_fallback_test',
          shipping_address: {
            first_name: 'Aarav',
            last_name: 'Sharma',
            address_1: '101 Lotus Garden Road',
            city: 'Bengaluru',
            province: 'Karnataka',
            postal_code: '560001',
            country_code: 'in',
            phone: '9876543210',
          },
        },
        {}
      )

      expect(result.data.label_url).toBe('')
      expect(result.labels[0].label_url).toBe('')
      expect(result.data.label_url).not.toContain('mock-label')
    })
  })
})
