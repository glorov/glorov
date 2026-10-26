import type { PaymentFailureNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'
import { formatINR } from '../utils/format-currency'

export function renderPaymentFailedTemplate(data: PaymentFailureNotificationData & {
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.order_id
      ? `#${data.order_id.slice(-6).toUpperCase()}`
      : '#ORDER'

  const customerName = data.customer_name || 'Valued Customer'
  const formattedAmount = data.amount ? formatINR(data.amount) : 'your order total'
  const errorDescription =
    data.error_description ||
    'The transaction was declined by the bank or timed out during authentication.'
  const retryUrl = data.retry_url || 'http://localhost:3000/account/orders'

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-danger">Payment Incomplete</span>
      <h2 style="color: #991b1b; margin: 12px 0 6px 0; font-size: 20px;">
        Payment could not be completed for Order ${escapeHtml(displayId)}
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, we noticed that your recent payment attempt for <strong>${escapeHtml(formattedAmount)}</strong> was not successful.
      </p>
    </div>

    <div class="address-card" style="background-color: #fef2f2; border-color: #fecaca;">
      <strong style="color: #991b1b; display: block; margin-bottom: 4px;">Reason reported by banking partner:</strong>
      <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
        ${escapeHtml(errorDescription)}
      </p>
    </div>

    <div style="margin: 24px 0;">
      <h3 style="color: #064e3b; font-size: 16px; margin: 0 0 8px 0;">Don't worry — your selected items are safe:</h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.8;">
        <li>Your botanical plant &amp; seed cart items have been reserved.</li>
        <li>No amount was claimed by GLOROV for this failed attempt.</li>
        <li>If your bank account was debited, banks automatically refund failed UPI/card transactions within 2 to 4 business days.</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${escapeHtml(retryUrl)}" class="btn" style="background-color: #047857;">
        Retry Payment Securely →
      </a>
    </div>

    <div class="advisory-box">
      <strong>Need help completing your order?</strong>
      <p style="margin: 4px 0 0 0;">
        If you are experiencing payment gateway issues or wish to switch to Cash on Delivery (COD) for eligible seeds, please contact us at care@glorov.in with your reference ${escapeHtml(displayId)}.
      </p>
    </div>
  `

  const contentText = `Dear ${customerName},

Your payment attempt for order ${displayId} of ${formattedAmount} was not completed.

REASON:
${errorDescription}

DON'T WORRY:
- Your selected botanical items are reserved.
- No amount was claimed by GLOROV for this failed transaction.
- If money was debited from your account, banking gateways automatically reverse it within 2 to 4 business days.

RETRY YOUR ORDER:
You can retry payment securely at:
${retryUrl}

If you need assistance or want to inquire about Cash on Delivery (COD) availability, email us at care@glorov.in quoting reference ${displayId}.`

  const title = `Payment Notice for Order ${displayId}`
  const subject = `Payment Incomplete for Order ${displayId} — GLOROV`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
