export interface PincodeServiceabilityRequest {
  pincode: string
}

export interface PincodeServiceabilityResponse {
  pincode: string
  serviceable: boolean
  city?: string
  state?: string
  cod_available: boolean
  estimated_days?: number
  message?: string
}
