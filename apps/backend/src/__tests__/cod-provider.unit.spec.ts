import { CodPaymentProviderService } from '../modules/payment-cod/service'

describe('Cash on Delivery (COD) Payment Provider Unit Tests', () => {
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }

  let service: CodPaymentProviderService

  beforeEach(() => {
    service = new CodPaymentProviderService(
      { logger: mockLogger as any },
      {
        max_amount: 500000, // ₹5,000 in paise
        restricted_pincodes: ['744101', '682555'],
      }
    )
  })

  it('1. Identifies as "cod"', () => {
    expect(CodPaymentProviderService.identifier).toBe('cod')
  })

  it('2. Initiates COD payment session for eligible amount and pincode', async () => {
    const res = await service.initiatePayment({
      amount: 4900,
      currency_code: 'inr',
      context: {
        shipping_address: { postal_code: '411001' },
      } as any,
    })

    expect(res.id).toMatch(/^cod_/)
    expect(res.data).toBeDefined()
    expect(res.data?.payment_method).toBe('cod')
    expect(res.data?.amount).toBe(4900)
    expect(res.data?.cash_collected).toBe(false)
  })

  it('3. Rejects COD initiation if order amount exceeds ₹5,000 threshold', async () => {
    await expect(
      service.initiatePayment({
        amount: 500100, // ₹5,001 (exceeds ₹5,000 limit)
        currency_code: 'inr',
        context: {} as any,
      })
    ).rejects.toThrow(/restricted to orders up to ₹5,000/i)
  })

  it('4. Rejects COD initiation for non-INR currencies', async () => {
    await expect(
      service.initiatePayment({
        amount: 2000,
        currency_code: 'usd',
        context: {} as any,
      })
    ).rejects.toThrow(/only available for Indian Rupee/i)
  })

  it('5. Rejects COD initiation for restricted remote PIN codes (e.g. Andaman/Nicobar)', async () => {
    await expect(
      service.initiatePayment({
        amount: 2000,
        currency_code: 'inr',
        context: {
          shipping_address: { postal_code: '744101' },
        } as any,
      })
    ).rejects.toThrow(/Cash on Delivery is not supported for delivery postal code 744101/i)
  })

  it('6. Authorizes COD order with outstanding cash status (NOT captured)', async () => {
    const res = await service.authorizePayment({
      data: {
        payment_method: 'cod',
        amount: 4900,
      },
    } as any)

    expect(res.status).toBe('authorized')
    expect(res.data?.cash_collected).toBe(false)
    expect(res.data?.authorized_at).toBeDefined()

    // Status check confirms authorized, NOT captured
    const statusRes = await service.getPaymentStatus({ data: res.data } as any)
    expect(statusRes.status).toBe('authorized')
  })

  it('7. Captures COD payment only upon bank remittance / courier settlement', async () => {
    const authRes = await service.authorizePayment({
      data: { payment_method: 'cod', amount: 4900 },
    } as any)

    // Courier remits funds -> Capture payment
    const capRes = await service.capturePayment({
      data: authRes.data,
    } as any)

    expect(capRes.data?.cash_collected).toBe(true)
    expect(capRes.data?.status).toBe('captured')
    expect(capRes.data?.captured_at).toBeDefined()

    const finalStatus = await service.getPaymentStatus({ data: capRes.data } as any)
    expect(finalStatus.status).toBe('captured')
  })

  it('8. Cancels COD order prior to dispatch', async () => {
    const cancelRes = await service.cancelPayment({
      data: { payment_method: 'cod', amount: 4900 },
    } as any)

    expect(cancelRes.data?.status).toBe('canceled')
    const status = await service.getPaymentStatus({ data: cancelRes.data } as any)
    expect(status.status).toBe('canceled')
  })
})
