import type { PaymentNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'
import { formatINR } from '../utils/format-currency'

export function renderPaymentCapturedTemplate(data: {
  payment?: PaymentNotificationData
  order_id?: string
  display_id?: string | number
  amount?: number
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.payment?.order?.display_id
      ? `#${data.payment.order.display_id}`
      : data.order_id
        ? `#${data.order_id.slice(-6).toUpperCase()}`
        : '#ORDER'

  const customerName = data.customer_name || 'Valued Customer'
  const amountPaid = data.amount ?? data.payment?.amount ?? 0
  const formattedAmount = formatINR(amountPaid)
  const paymentId = data.payment?.id || 'Verified Online Transaction'
  const provider = data.payment?.provider_id === 'razorpay'
    ? 'Razorpay (UPI / NetBanking / Cards)'
    : data.payment?.provider_id === 'cod'
      ? 'Cash on Delivery (Verified)'
      : 'Online Secure Gateway'

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-success">✓ Payment Received</span>
      <h2 style="color: #064e3b; margin: 12px 0 6px 0; font-size: 20px;">
        Payment Confirmed for Order ${escapeHtml(displayId)}
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, we have successfully verified your payment of <strong>${escapeHtml(formattedAmount)}</strong>.
      </p>
    </div>

    <div class="address-card" style="background-color: #f0fdf4; border-color: #bbf7d0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #166534; font-size: 13px;">Order Reference:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #064e3b;">${escapeHtml(displayId)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #166534; font-size: 13px;">Amount Captured:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #064e3b; font-size: 16px;">${escapeHtml(formattedAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #166534; font-size: 13px;">Payment Channel:</td>
          <td style="padding: 6px 0; text-align: right; color: #166534;">${escapeHtml(provider)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #166534; font-size: 13px;">Transaction Reference:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 12px; color: #166534;">${escapeHtml(paymentId)}</td>
        </tr>
      </table>
    </div>

    <div class="advisory-box">
      <strong>📦 What happens next?</strong>
      <p style="margin: 4px 0 0 0;">
        Your order is now queued in our Pune fulfillment nursery for inspection, packing, and courier pickup. We will notify you with the courier AWB tracking code once dispatched.
      </p>
    </div>
  `

  const contentText = `Dear ${customerName},

We have successfully received and verified your payment for order ${displayId}.

PAYMENT RECEIPT:
- Order Reference: ${displayId}
- Amount Received: ${formattedAmount}
- Payment Method: ${provider}
- Transaction ID: ${paymentId}

WHAT HAPPENS NEXT:
Your order has moved to fulfillment at our Pune Botanical Hub. You will receive courier tracking details once your parcel is on its way.`

  const title = `Payment Received ${displayId}`
  const subject = `Payment Received: ${displayId} — GLOROV Botanical Garden`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
