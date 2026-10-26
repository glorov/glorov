export interface CodModuleOptions {
  max_amount?: number // Maximum allowed COD order value in paise (e.g. 500000 = ₹5,000)
  restricted_pincodes?: string[] // Pincodes where COD is disabled (e.g. remote islands)
}

export interface CodPaymentSessionData {
  payment_method: 'cod'
  amount: number
  currency: string
  status: 'pending' | 'authorized' | 'captured' | 'canceled'
  cash_collected: boolean
  collected_amount?: number
  utr_reference?: string
  remitted_at?: string
  authorized_at?: string
  captured_at?: string
}
