import type { RefundNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'
import { formatINR } from '../utils/format-currency'

export function renderRefundProcessedTemplate(data: {
  refund?: RefundNotificationData
  order_id?: string
  display_id?: string | number
  amount?: number
  refund_id?: string
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.refund?.order?.display_id
      ? `#${data.refund.order.display_id}`
      : data.order_id
        ? `#${data.order_id.slice(-6).toUpperCase()}`
        : '#ORDER'

  const customerName = data.customer_name || 'Valued Customer'
  const refundAmount = data.amount ?? data.refund?.amount ?? 0
  const formattedAmount = formatINR(refundAmount)
  const refundId = data.refund_id || data.refund?.id || 'RFND_PROCESSED'
  const reason = data.refund?.reason || 'Approved return, item adjustment, or canceled order'

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-info">Refund Processed</span>
      <h2 style="color: #075985; margin: 12px 0 6px 0; font-size: 20px;">
        Refund of ${escapeHtml(formattedAmount)} initiated for Order ${escapeHtml(displayId)}
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, we have processed a refund for your order with GLOROV Botanical Garden.
      </p>
    </div>

    <div class="address-card" style="background-color: #f0f9ff; border-color: #bae6fd;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #0369a1; font-size: 13px;">Order Reference:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #075985;">${escapeHtml(displayId)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #0369a1; font-size: 13px;">Refund Amount:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #075985; font-size: 16px;">${escapeHtml(formattedAmount)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #0369a1; font-size: 13px;">Refund Reference ID:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; font-size: 12px; color: #0369a1;">${escapeHtml(refundId)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #0369a1; font-size: 13px;">Reason:</td>
          <td style="padding: 6px 0; text-align: right; color: #0369a1;">${escapeHtml(reason)}</td>
        </tr>
      </table>
    </div>

    <div class="advisory-box">
      <strong>🏦 Bank Processing Time:</strong>
      <p style="margin: 4px 0 0 0;">
        The refund has been transferred to our payment gateway (Razorpay). Depending on your bank or UPI app, it will reflect in your account within <strong>5 to 7 working days</strong>.
      </p>
    </div>
  `

  const contentText = `Dear ${customerName},

A refund of ${formattedAmount} has been processed for order ${displayId}.

REFUND DETAILS:
- Order Reference: ${displayId}
- Refund Amount: ${formattedAmount}
- Refund Reference ID: ${refundId}
- Context: ${reason}

BANKING CLEARANCE TIMELINE:
The refund was submitted through our payment gateway. Most Indian banks (UPI, NetBanking, Debit/Credit Card) credit this back within 5 to 7 business days.

If you do not see the credit after 7 business days, reach out to care@glorov.in quoting ${displayId} and reference ${refundId}.`

  const title = `Refund Processed for Order ${displayId}`
  const subject = `Refund Processed: ${displayId} — GLOROV Botanical Garden`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
