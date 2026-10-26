import {
  AbstractPaymentProvider,
  BigNumber,
  MedusaError,
} from '@medusajs/framework/utils'
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  Logger,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/framework/types'
import type { CodModuleOptions, CodPaymentSessionData } from './types'

type InjectedDependencies = {
  logger?: Logger
}

export class CodPaymentProviderService extends AbstractPaymentProvider<CodModuleOptions> {
  public static identifier = 'cod'

  private maxAmountPaise: number
  private restrictedPincodes: Set<string>
  private logger?: Logger

  constructor(container: InjectedDependencies, options?: CodModuleOptions) {
    super(container, options || {})
    this.logger = container.logger
    // Default maximum COD order limit: ₹5,000 (500,000 paise)
    this.maxAmountPaise = options?.max_amount ?? 500000
    this.restrictedPincodes = new Set(options?.restricted_pincodes ?? [
      '744101', '744102', '744103', '744201', '744301', '744302', // Andaman & Nicobar
      '682555', '682556', '682557', '682558', '682559', // Lakshadweep
    ])
  }

  private convertToPaise(amount: unknown): number {
    if (amount && typeof amount === 'object' && 'numeric' in amount) {
      return Number((amount as { numeric: number }).numeric)
    }
    if (amount && typeof amount === 'object' && 'raw' in amount) {
      const rawVal = (amount as { raw: { value: string } }).raw.value
      return Number(rawVal)
    }
    const num = Number(amount)
    if (isNaN(num) || num <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid payment amount for COD: ${amount}`
      )
    }
    if (Number.isInteger(num)) {
      return num
    }
    return Math.round(num * 100)
  }

  /**
   * Initialize a Cash-on-Delivery payment session.
   * Validates Indian currency, maximum order limit, and delivery pincode eligibility.
   */
  public async initiatePayment(
    input: InitiatePaymentInput
  ): Promise<InitiatePaymentOutput> {
    const { amount, currency_code, context } = input

    const normalizedCurrency = (currency_code || 'inr').toLowerCase()
    if (normalizedCurrency !== 'inr') {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cash on Delivery is only available for Indian Rupee (INR) transactions. Received: ${currency_code}`
      )
    }

    const amountInPaise = this.convertToPaise(amount)
    if (amountInPaise > this.maxAmountPaise) {
      const maxInRupees = Math.floor(this.maxAmountPaise / 100)
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cash on Delivery is restricted to orders up to ₹${maxInRupees.toLocaleString('en-IN')}. Please choose Razorpay for higher value orders.`
      )
    }

    // Check pincode restrictions if available in context
    const customerAddress = (context as {
      shipping_address?: { postal_code?: string }
    })?.shipping_address
    const postalCode = customerAddress?.postal_code?.trim()

    if (postalCode) {
      if (this.restrictedPincodes.has(postalCode) || postalCode.startsWith('744') || postalCode.startsWith('682')) {
        throw new MedusaError(
          MedusaError.Types.NOT_ALLOWED,
          `Cash on Delivery is not supported for delivery postal code ${postalCode} due to courier transit constraints. Please select online payment.`
        )
      }
    }

    const sessionId = `cod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const sessionData: CodPaymentSessionData = {
      payment_method: 'cod',
      amount: amountInPaise,
      currency: 'INR',
      status: 'pending',
      cash_collected: false,
    }

    return {
      id: sessionId,
      data: sessionData as unknown as Record<string, unknown>,
    }
  }

  /**
   * Authorizes COD payment upon customer checkout completion.
   * The order is marked authorized, but NOT captured. Physical cash collection remains outstanding.
   */
  public async authorizePayment(
    input: AuthorizePaymentInput
  ): Promise<AuthorizePaymentOutput> {
    const sessionData = (input.data || {}) as unknown as CodPaymentSessionData

    return {
      status: 'authorized',
      data: {
        ...sessionData,
        status: 'authorized',
        authorized_at: new Date().toISOString(),
        cash_collected: false,
      } as unknown as Record<string, unknown>,
    }
  }

  /**
   * Captures the COD payment when courier confirms cash collection and bank remittance.
   * Separate from order fulfillment or shipment delivery.
   */
  public async capturePayment(
    input: CapturePaymentInput
  ): Promise<CapturePaymentOutput> {
    const sessionData = (input.data || {}) as unknown as CodPaymentSessionData
    const capturedData: CodPaymentSessionData = {
      ...sessionData,
      status: 'captured',
      cash_collected: true,
      captured_at: new Date().toISOString(),
    }

    return {
      data: capturedData as unknown as Record<string, unknown>,
    }
  }

  /**
   * Handles refund for Cash on Delivery.
   * Strictly enforces that uncaptured COD orders cannot be refunded (no cash was collected),
   * and captured COD orders require an explicitly designed bank transfer (NEFT/IMPS) process
   * with customer bank details and confirmed bank UTR reference.
   * Prevents fake automated refunds on physical cash transactions.
   */
  public async refundPayment(
    input: RefundPaymentInput
  ): Promise<RefundPaymentOutput> {
    const sessionData = (input.data || {}) as Record<string, unknown>
    const isCaptured =
      sessionData.cash_collected === true || sessionData.status === 'captured'

    if (!isCaptured) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        'Cannot refund an uncaptured Cash on Delivery order. Cash was never collected or reconciled.'
      )
    }

    // Verify explicit bank transfer / payout confirmation reference
    const inputAny = input as any
    const payoutData =
      inputAny?.context?.payout ||
      sessionData?.payout ||
      inputAny?.data?.payout ||
      {}
    const bankUtr =
      payoutData.bank_utr ||
      (sessionData as any).bank_utr ||
      inputAny.bank_utr ||
      inputAny?.data?.bank_utr

    if (!bankUtr) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        'Cash on Delivery refunds cannot be processed automatically via gateway rails. An explicit bank transfer (NEFT/IMPS) with verified customer bank account details and confirmed bank UTR reference is required.'
      )
    }

    return {
      data: {
        ...sessionData,
        status: 'refunded',
        refunded_amount: this.convertToPaise(input.amount),
        bank_utr: bankUtr,
        payout_reference: bankUtr,
        refunded_at: new Date().toISOString(),
      },
    }
  }

  /**
   * Cancels COD order prior to dispatch.
   */
  public async cancelPayment(
    input: CancelPaymentInput
  ): Promise<CancelPaymentOutput> {
    const sessionData = (input.data || {}) as Record<string, unknown>
    return {
      data: {
        ...sessionData,
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      },
    }
  }

  /**
   * Deletes session.
   */
  public async deletePayment(
    input: DeletePaymentInput
  ): Promise<DeletePaymentOutput> {
    return {
      data: input.data || {},
    }
  }

  /**
   * Returns current payment status:
   * 'authorized' = order placed, awaiting physical cash collection by courier
   * 'captured' = courier collected cash and funds remitted to bank
   */
  public async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    const sessionData = (input.data || {}) as unknown as CodPaymentSessionData

    if (sessionData.cash_collected || sessionData.status === 'captured') {
      return { status: 'captured' }
    }
    if (sessionData.status === 'authorized') {
      return { status: 'authorized' }
    }
    if (sessionData.status === 'canceled') {
      return { status: 'canceled' }
    }

    return { status: 'pending' }
  }

  public async retrievePayment(
    input: RetrievePaymentInput
  ): Promise<RetrievePaymentOutput> {
    return input.data || {}
  }

  public async updatePayment(
    input: UpdatePaymentInput
  ): Promise<UpdatePaymentOutput> {
    const sessionData = (input.data || {}) as Record<string, unknown>
    const newAmount = this.convertToPaise(input.amount)

    if (newAmount > this.maxAmountPaise) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Updated cart total exceeds the Cash on Delivery limit of ₹${Math.floor(this.maxAmountPaise / 100)}.`
      )
    }

    return {
      data: {
        ...sessionData,
        amount: newAmount,
        updated_at: new Date().toISOString(),
      },
    }
  }

  public async getWebhookActionAndData(
    _payload: ProviderWebhookPayload['payload']
  ): Promise<WebhookActionResult> {
    return {
      action: 'not_supported',
      data: {
        session_id: '',
        amount: new BigNumber(0),
      },
    }
  }
}
