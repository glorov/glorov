export interface ShiprocketModuleOptions {
  email?: string
  password?: string
  webhook_token?: string
  pickup_pincode?: string
  pickup_location_name?: string
  mock_mode?: boolean
  timeout_ms?: number
}

export interface ShiprocketAuthResponse {
  token: string
  id?: number
  email?: string
  first_name?: string
  last_name?: string
}

export interface ShiprocketCourierCompany {
  courier_company_id: number
  courier_name: string
  rate: number
  etd: string
  estimated_delivery_days: string | number
  cod: number
  rating?: number
}

export interface ShiprocketServiceabilityResponse {
  status: number
  data?: {
    available_courier_companies?: ShiprocketCourierCompany[]
  }
  message?: string
}

export interface ShiprocketOrderItem {
  name: string
  sku: string
  units: number
  selling_price: number
  discount?: number
  tax?: number
  hsn?: number | string
}

export interface ShiprocketCreateOrderPayload {
  order_id: string
  order_date: string
  pickup_location: string
  channel_id?: string
  comment?: string
  billing_customer_name: string
  billing_last_name: string
  billing_address: string
  billing_address_2?: string
  billing_city: string
  billing_pincode: string
  billing_state: string
  billing_country: string
  billing_email: string
  billing_phone: string
  shipping_is_billing: boolean
  shipping_customer_name?: string
  shipping_last_name?: string
  shipping_address?: string
  shipping_address_2?: string
  shipping_city?: string
  shipping_pincode?: string
  shipping_country?: string
  shipping_state?: string
  shipping_phone?: string
  order_items: ShiprocketOrderItem[]
  payment_method: 'Prepaid' | 'COD'
  shipping_charges: number
  giftwrap_charges?: number
  transaction_charges?: number
  total_discount?: number
  sub_total: number
  length: number
  breadth: number
  height: number
  weight: number
}

export interface ShiprocketPackageDimensions {
  length: number
  breadth: number
  height: number
  weight: number
}

export interface ShiprocketCreateOrderResponse {
  order_id: number
  shipment_id: number
  status: string
  status_code: number
  onboarding_completed_now?: number
  awb_code?: string
  courier_company_id?: number
  courier_name?: string
}

export interface ShiprocketAssignAwbResponse {
  awb_assign_status: number
  response?: {
    data?: {
      awb_code: string
      courier_company_id?: number
      courier_name?: string
    }
  }
  message?: string
}

export interface ShiprocketGenerateLabelResponse {
  label_created: number
  label_url: string
  response?: string
}

export interface ShiprocketTrackScan {
  date: string
  activity: string
  location: string
  sr_status?: string
}

export interface ShiprocketTrackResponse {
  tracking_data?: {
    track_status: number
    shipment_status: number
    shipment_track?: Array<{
      id: number
      awb_code: string
      current_status: string
      scans?: ShiprocketTrackScan[]
    }>
    shipment_track_activities?: ShiprocketTrackScan[]
  }
}

export interface ShiprocketWebhookPayload {
  awb?: string
  awb_code?: string
  courier_name?: string
  current_status?: string
  current_status_id?: number
  shipment_status?: string
  shipment_status_id?: number
  order_id?: string | number
  sr_order_id?: number
  scans?: ShiprocketTrackScan[]
  etd?: string
  pickup_date?: string
  delivered_date?: string
}

export interface PincodeServiceabilityCheckResult {
  pincode: string
  serviceable: boolean
  status: 'confirmed' | 'rejected' | 'undetermined'
  city?: string
  state?: string
  prepaid_eligible: boolean
  cod_available: boolean
  cod_eligible: boolean
  cod_restriction_reason?: string | null
  estimated_days?: number
  courier_name?: string
  rate_inr?: number
  rate_source?: 'live_courier' | 'configured_estimate'
  message?: string
}
