import type { OrderNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'
import { formatINR } from '../utils/format-currency'

export function renderOrderCanceledTemplate(data: {
  order?: OrderNotificationData
  order_id?: string
  display_id?: string | number
  reason?: string
  refund_status?: string
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.order?.display_id
      ? `#${data.order.display_id}`
      : data.order_id
        ? `#${data.order_id.slice(-6).toUpperCase()}`
        : '#ORDER'

  const customerName = data.customer_name || 'Valued Customer'
  const reason = data.reason || 'Customer request or operational cancellation'
  const totalPaid = data.order?.total ? formatINR(data.order.total) : null

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-warning">Order Canceled</span>
      <h2 style="color: #92400e; margin: 12px 0 6px 0; font-size: 20px;">
        Order ${escapeHtml(displayId)} has been canceled
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, this is to confirm that your order <strong>${escapeHtml(displayId)}</strong> has been canceled.
      </p>
    </div>

    <div class="address-card">
      <strong style="color: #475569; display: block; margin-bottom: 4px;">Cancellation Context:</strong>
      <p style="margin: 0; font-size: 13px; color: #334155;">${escapeHtml(reason)}</p>
    </div>

    ${totalPaid ? `
    <div class="advisory-box" style="background-color: #f0fdf4; border-color: #047857; color: #166534;">
      <strong>💳 Refund Information:</strong>
      <p style="margin: 4px 0 0 0;">
        If payment was successfully captured for this order (${escapeHtml(totalPaid)}), a full refund has been initiated back to your original source of payment (UPI / Bank Account / Card). It typically reflects within 5 to 7 business days according to standard Indian banking clearing schedules.
      </p>
    </div>` : ''}

    <p style="font-size: 14px; color: #475569;">
      If you did not request this cancellation or have further questions regarding your order, please reply to this email or contact us at care@glorov.in.
    </p>
  `

  const contentText = `Dear ${customerName},

Your order ${displayId} with GLOROV Botanical Garden has been canceled.

CANCELLATION CONTEXT:
${reason}

${totalPaid ? `REFUND INFORMATION:
If payment was captured for this order (${totalPaid}), a full refund has been initiated to your original payment method. Banking refunds typically reflect in your account within 5 to 7 business days.\n` : ''}
If you did not request this cancellation or have questions, reach out to our team at care@glorov.in quoting ${displayId}.`

  const title = `Order Canceled ${displayId}`
  const subject = `Order Canceled: ${displayId} — GLOROV Botanical Garden`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
