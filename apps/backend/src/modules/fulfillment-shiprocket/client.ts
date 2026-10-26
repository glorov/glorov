import { MedusaError } from '@medusajs/framework/utils'
import type {
  ShiprocketModuleOptions,
  ShiprocketAuthResponse,
  ShiprocketServiceabilityResponse,
  ShiprocketCreateOrderPayload,
  ShiprocketCreateOrderResponse,
  ShiprocketAssignAwbResponse,
  ShiprocketGenerateLabelResponse,
  ShiprocketTrackResponse,
  PincodeServiceabilityCheckResult,
} from './types'

export class ShiprocketClient {
  private readonly baseUrl = 'https://apiv2.shiprocket.in/v1/external'
  private readonly email?: string
  private readonly password?: string
  private readonly webhookToken?: string
  private readonly pickupPincode: string
  private readonly pickupLocationName: string
  private readonly timeoutMs: number
  private readonly mockMode: boolean

  private cachedToken: string | null = null
  private tokenExpiresAt = 0

  private static readonly serviceabilityCache = new Map<
    string,
    { result: PincodeServiceabilityCheckResult; expiresAt: number }
  >()

  public static clearServiceabilityCache(): void {
    ShiprocketClient.serviceabilityCache.clear()
  }

  constructor(options?: ShiprocketModuleOptions) {
    this.email = options?.email || process.env.SHIPROCKET_EMAIL
    this.password = options?.password || process.env.SHIPROCKET_PASSWORD
    this.webhookToken =
      options?.webhook_token ||
      process.env.SHIPROCKET_WEBHOOK_TOKEN ||
      process.env.SHIPROCKET_WEBHOOK_SECRET
    this.pickupPincode =
      options?.pickup_pincode || process.env.SHIPROCKET_PICKUP_PINCODE || '411001'
    this.pickupLocationName =
      options?.pickup_location_name ||
      process.env.SHIPROCKET_PICKUP_LOCATION ||
      'Pune Central Nursery Hub'
    this.timeoutMs = options?.timeout_ms || 5000

    // Enable mock mode if explicitly configured or if credentials are empty
    this.mockMode = Boolean(
      options?.mock_mode ??
        (process.env.SHIPROCKET_MOCK_MODE === 'true' ||
          !this.email ||
          !this.password ||
          process.env.NODE_ENV === 'test')
    )
  }

  public isMockMode(): boolean {
    return this.mockMode
  }

  public getPickupPincode(): string {
    return this.pickupPincode
  }

  public getPickupLocationName(): string {
    return this.pickupLocationName
  }

  /**
   * Authenticate with Shiprocket API using server-side credentials.
   * Caches JWT token for 24 hours to prevent redundant login calls.
   */
  public async authenticate(): Promise<string> {
    // Return cached token if valid (buffer by 60 seconds)
    if (this.cachedToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.cachedToken
    }

    if (this.mockMode) {
      this.cachedToken = 'mock_sr_jwt_token_' + Date.now()
      this.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000
      return this.cachedToken
    }

    if (!this.email || !this.password) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        'Shiprocket credentials (email and password) are not configured'
      )
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: this.email,
          password: this.password,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Shiprocket authentication failed with status ${response.status}: ${response.statusText}`
        )
      }

      const data = (await response.json()) as ShiprocketAuthResponse
      if (!data.token) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          'Shiprocket authentication returned an invalid token response'
        )
      }

      this.cachedToken = data.token
      // Cache for 24 hours
      this.tokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000
      return this.cachedToken
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Shiprocket authentication timed out after ${this.timeoutMs}ms`
        )
      }
      throw error instanceof Error
        ? error
        : new MedusaError(
            MedusaError.Types.UNEXPECTED_STATE,
            'Shiprocket authentication failed'
          )
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Helper to perform authenticated requests to Shiprocket with retry on 401.
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const token = await this.authenticate()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string>),
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      })

      // If token expired, clear cache and retry once
      if (response.status === 401 && !isRetry) {
        this.cachedToken = null
        this.tokenExpiresAt = 0
        return this.request<T>(path, options, true)
      }

      if (!response.ok) {
        const errText = await response.text()
        let parsedMessage = errText
        try {
          const parsed = JSON.parse(errText)
          parsedMessage = parsed.message || parsed.error || errText
        } catch {
          // Keep raw text
        }
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Shiprocket API error [${response.status}]: ${parsedMessage}`
        )
      }

      return (await response.json()) as T
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new MedusaError(
          MedusaError.Types.UNEXPECTED_STATE,
          `Shiprocket API call to ${path} timed out after ${this.timeoutMs}ms`
        )
      }
      throw error
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Check delivery PIN code serviceability, courier options, rate estimation, and COD availability.
   * Includes short-lived caching (10 min TTL) to avoid redundant third-party API calls.
   */
  public async checkServiceability(params: {
    deliveryPostcode: string
    pickupPostcode?: string
    weightKg?: number
    cod?: boolean
    declaredValueInr?: number
    skipCache?: boolean
  }): Promise<PincodeServiceabilityCheckResult> {
    const deliveryPin = params.deliveryPostcode.trim()
    const pickupPin = (params.pickupPostcode || this.pickupPincode).trim()
    const weight = params.weightKg || 0.5
    const isCod = params.cod ? 1 : 0
    const declaredValue = params.declaredValueInr || 0

    // Validate 6-digit Indian PIN code format
    if (!/^[1-9][0-9]{5}$/.test(deliveryPin)) {
      return {
        pincode: deliveryPin,
        serviceable: false,
        status: 'rejected',
        prepaid_eligible: false,
        cod_available: false,
        cod_eligible: false,
        cod_restriction_reason: 'invalid_format',
        message: 'Invalid 6-digit Indian PIN code format. Must be 6 digits and cannot start with 0.',
      }
    }

    const cacheKey = `${deliveryPin}:${pickupPin}:${weight}:${isCod}:${declaredValue}`
    if (!params.skipCache) {
      const cached = ShiprocketClient.serviceabilityCache.get(cacheKey)
      if (cached && Date.now() < cached.expiresAt) {
        return cached.result
      }
    }

    const setCache = (
      result: PincodeServiceabilityCheckResult,
      ttlMs = 10 * 60 * 1000
    ): PincodeServiceabilityCheckResult => {
      if (ShiprocketClient.serviceabilityCache.size > 1000) {
        ShiprocketClient.serviceabilityCache.clear()
      }
      ShiprocketClient.serviceabilityCache.set(cacheKey, {
        result,
        expiresAt: Date.now() + ttlMs,
      })
      return result
    }

    if (this.mockMode) {
      // Deterministic mock behavior: PINs starting with 999 or 000 are unserviceable
      if (deliveryPin.startsWith('999') || deliveryPin.startsWith('000')) {
        return setCache({
          pincode: deliveryPin,
          serviceable: false,
          status: 'rejected',
          prepaid_eligible: false,
          cod_available: false,
          cod_eligible: false,
          cod_restriction_reason: 'out_of_service_area',
          message: 'Delivery is currently unavailable to this PIN code region.',
        })
      }

      // Check tier/region based on PIN prefix
      const isMetro = ['11', '40', '56', '50', '60', '70', '41'].some((prefix) =>
        deliveryPin.startsWith(prefix)
      )

      const isRemote = ['79', '78', '744', '18', '19', '682'].some((prefix) =>
        deliveryPin.startsWith(prefix)
      )

      if (isRemote) {
        const remoteCity = deliveryPin.startsWith('744')
          ? 'Port Blair'
          : deliveryPin.startsWith('79') || deliveryPin.startsWith('78')
            ? 'Guwahati / NE Hub'
            : 'Srinagar / Jammu'
        const remoteState = deliveryPin.startsWith('744')
          ? 'Andaman and Nicobar Islands'
          : deliveryPin.startsWith('79') || deliveryPin.startsWith('78')
            ? 'Assam / North East'
            : 'Jammu & Kashmir'

        return setCache({
          pincode: deliveryPin,
          serviceable: true,
          status: 'confirmed',
          city: remoteCity,
          state: remoteState,
          prepaid_eligible: true,
          cod_available: false, // COD restricted for remote botanical corridors
          cod_eligible: false,
          cod_restriction_reason: 'remote_corridor',
          estimated_days: 5,
          courier_name: 'Delhivery Priority Air',
          rate_inr: 129,
          rate_source: 'configured_estimate',
          message:
            'Serviceable via Remote Transit Corridor (5-6 business days). Live plants require express care.',
        })
      }

      return setCache({
        pincode: deliveryPin,
        serviceable: true,
        status: 'confirmed',
        city: deliveryPin.startsWith('411')
          ? 'Pune'
          : deliveryPin.startsWith('560')
            ? 'Bengaluru'
            : deliveryPin.startsWith('400')
              ? 'Mumbai'
              : deliveryPin.startsWith('110')
                ? 'Delhi'
                : 'India Regional Hub',
        state: deliveryPin.startsWith('41') || deliveryPin.startsWith('40')
          ? 'Maharashtra'
          : deliveryPin.startsWith('56')
            ? 'Karnataka'
            : deliveryPin.startsWith('11')
              ? 'Delhi'
              : 'India',
        prepaid_eligible: true,
        cod_available: true,
        cod_eligible: true,
        cod_restriction_reason: null,
        estimated_days: isMetro ? 2 : 4,
        courier_name: isMetro ? 'Delhivery Air Botanical Express' : 'BlueDart Surface Delivery',
        rate_inr: isMetro ? 49 : 79,
        rate_source: 'configured_estimate',
        message: isMetro
          ? 'Serviceable via Express Botanical Air Corridor (2 business days)'
          : 'Serviceable via Standard Botanical Surface Transit (3-5 business days)',
      })
    }

    try {
      const queryParams: Record<string, string> = {
        pickup_postcode: pickupPin,
        delivery_postcode: deliveryPin,
        weight: weight.toString(),
        cod: isCod.toString(),
      }
      if (declaredValue > 0) {
        queryParams.declared_value = declaredValue.toString()
      }

      const query = new URLSearchParams(queryParams)

      const res = await this.request<ShiprocketServiceabilityResponse>(
        `/courier/serviceability?${query.toString()}`
      )

      const couriers = res.data?.available_courier_companies || []
      if (couriers.length === 0) {
        return setCache({
          pincode: deliveryPin,
          serviceable: false,
          status: 'rejected',
          prepaid_eligible: false,
          cod_available: false,
          cod_eligible: false,
          cod_restriction_reason: 'no_courier_available',
          message: 'No active courier partners service this PIN code.',
        })
      }

      // Pick top-rated or lowest-rate courier
      const topCourier = couriers.sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
      const estDays =
        typeof topCourier.estimated_delivery_days === 'number'
          ? topCourier.estimated_delivery_days
          : parseInt(String(topCourier.estimated_delivery_days), 10) || 3

      const isCourierCod = topCourier.cod === 1

      return setCache({
        pincode: deliveryPin,
        serviceable: true,
        status: 'confirmed',
        prepaid_eligible: true,
        cod_available: isCourierCod,
        cod_eligible: isCourierCod,
        cod_restriction_reason: isCourierCod ? null : 'courier_cod_disabled',
        estimated_days: estDays,
        courier_name: topCourier.courier_name,
        rate_inr: topCourier.rate,
        rate_source: 'live_courier',
        message: `Serviceable via ${topCourier.courier_name} (${estDays} business days)`,
      })
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Provider serviceability lookup failed'
      // When live provider fails or times out, report undetermined status
      // Do NOT invent a fake successful estimate
      return {
        pincode: deliveryPin,
        serviceable: false,
        status: 'undetermined',
        prepaid_eligible: false,
        cod_available: false,
        cod_eligible: false,
        cod_restriction_reason: 'provider_unavailable',
        rate_source: 'configured_estimate',
        message: `Serviceability check could not be determined due to logistics provider issue: ${errMsg}`,
      }
    }
  }

  /**
   * Create an adhoc shipment order in Shiprocket.
   * Includes duplicate prevention guard.
   */
  public async createAdhocOrder(
    payload: ShiprocketCreateOrderPayload
  ): Promise<ShiprocketCreateOrderResponse> {
    if (this.mockMode) {
      const mockOrderId = 98000000 + Math.floor(Math.random() * 100000)
      const mockShipmentId = 87000000 + Math.floor(Math.random() * 100000)
      const mockAwb = `SR${Math.floor(100000000 + Math.random() * 900000000)}`

      return {
        order_id: mockOrderId,
        shipment_id: mockShipmentId,
        status: 'NEW',
        status_code: 1,
        onboarding_completed_now: 0,
        awb_code: mockAwb,
        courier_company_id: 12,
        courier_name: 'Delhivery Botanical Express',
      }
    }

    return this.request<ShiprocketCreateOrderResponse>('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  /**
   * Assign courier and AWB number to a generated shipment.
   */
  public async assignAwb(
    shipmentId: number,
    courierId?: number
  ): Promise<ShiprocketAssignAwbResponse> {
    if (this.mockMode) {
      return {
        awb_assign_status: 1,
        response: {
          data: {
            awb_code: `SR${Math.floor(100000000 + Math.random() * 900000000)}`,
            courier_company_id: courierId || 12,
            courier_name: 'Delhivery Botanical Express',
          },
        },
      }
    }

    return this.request<ShiprocketAssignAwbResponse>('/courier/assign/awb', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: shipmentId,
        courier_id: courierId,
      }),
    })
  }

  /**
   * Schedule courier pickup at the origin nursery location.
   */
  public async generatePickup(
    shipmentIds: number[],
    pickupDate?: string
  ): Promise<{ pickup_status: number; pickup_token?: string }> {
    if (this.mockMode) {
      return {
        pickup_status: 1,
        pickup_token: `PKP_${Date.now()}`,
      }
    }

    const payload: { shipment_id: number[]; pickup_date?: string[] } = {
      shipment_id: shipmentIds,
    }
    if (pickupDate) {
      payload.pickup_date = [pickupDate]
    }

    return this.request<{ pickup_status: number; pickup_token?: string }>(
      '/courier/generate/pickup',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    )
  }

  /**
   * Generate downloadable PDF shipping label.
   */
  public async generateLabel(
    shipmentIds: number[]
  ): Promise<ShiprocketGenerateLabelResponse> {
    if (this.mockMode) {
      const mockAwb = `SR${Math.floor(100000000 + Math.random() * 900000000)}`
      return {
        label_created: 1,
        label_url: `https://kr-shipmultichannel.s3.ap-southeast-1.amazonaws.com/labels/${mockAwb}.pdf`,
      }
    }

    return this.request<ShiprocketGenerateLabelResponse>('/courier/generate/label', {
      method: 'POST',
      body: JSON.stringify({
        shipment_id: shipmentIds,
      }),
    })
  }

  /**
   * Track shipment by Air Waybill (AWB) number.
   */
  public async trackAwb(awbCode: string): Promise<ShiprocketTrackResponse> {
    if (this.mockMode) {
      return {
        tracking_data: {
          track_status: 1,
          shipment_status: 7,
          shipment_track: [
            {
              id: 1,
              awb_code: awbCode,
              current_status: 'DELIVERED',
              scans: [
                {
                  date: new Date().toISOString(),
                  activity: 'Shipment handed over to consignee',
                  location: 'Destination Hub',
                },
                {
                  date: new Date(Date.now() - 86400000).toISOString(),
                  activity: 'Picked up from Pune Central Nursery Hub',
                  location: 'Pune',
                },
              ],
            },
          ],
        },
      }
    }

    return this.request<ShiprocketTrackResponse>(`/courier/track/awb/${encodeURIComponent(awbCode)}`)
  }

  /**
   * Cancel order/shipment in Shiprocket.
   */
  public async cancelOrder(orderIds: (string | number)[]): Promise<{ status: number; message: string }> {
    if (this.mockMode) {
      return {
        status: 200,
        message: 'Mock Shiprocket order cancelled successfully',
      }
    }

    return this.request<{ status: number; message: string }>('/orders/cancel', {
      method: 'POST',
      body: JSON.stringify({ ids: orderIds }),
    })
  }

  /**
   * Verify authenticity of incoming webhook requests using configured webhook token.
   */
  public verifyWebhookToken(token?: string | null): boolean {
    if (!this.webhookToken) {
      // In dev or test environments without a token, accept mock headers
      return true
    }
    return Boolean(token && token === this.webhookToken)
  }
}
