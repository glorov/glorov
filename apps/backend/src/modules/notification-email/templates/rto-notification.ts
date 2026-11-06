import type { RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'
import { formatINR } from '../utils/format-currency'

export interface RTONotificationData {
  order_id?: string
  display_id?: string | number
  awb?: string
  reason?: string
  customer_name?: string
  customer_email?: string
  order_total?: number | string | { numeric?: number; value?: string | number }
  is_prepaid?: boolean
  refund_status?: string
  support_email?: string
}

export function renderRtoNotificationTemplate(data: RTONotificationData): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.order_id
      ? `#${data.order_id.slice(-6).toUpperCase()}`
      : '#ORDER'

  const awb = data.awb || 'N/A'
  const reason = data.reason || 'Undelivered / Address uncontactable / Refused delivery'
  const customerName = data.customer_name || 'Customer'
  const customerEmail = data.customer_email || 'N/A'
  const totalFormatted = data.order_total ? formatINR(data.order_total) : null
  const isPrepaid = data.is_prepaid !== false

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-danger">Return to Origin (RTO)</span>
      <h2 style="color: #991b1b; margin: 12px 0 6px 0; font-size: 20px;">
        Botanical Shipment RTO Alert: Order ${escapeHtml(displayId)}
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        A shipment for Order <strong>${escapeHtml(displayId)}</strong> has been flagged as <strong>Return to Origin</strong> by the logistics courier.
      </p>
    </div>

    <div class="address-card" style="border-left: 4px solid #dc2626;">
      <strong style="color: #1e293b; display: block; margin-bottom: 8px;">Logistics & Exception Details:</strong>
      <table style="width: 100%; font-size: 13px; color: #334155;">
        <tr><td style="padding: 4px 0; width: 140px;"><strong>Order ID:</strong></td><td>${escapeHtml(displayId)} (${escapeHtml(data.order_id || '')})</td></tr>
        <tr><td style="padding: 4px 0;"><strong>AWB Tracking:</strong></td><td><code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${escapeHtml(awb)}</code></td></tr>
        <tr><td style="padding: 4px 0;"><strong>Customer:</strong></td><td>${escapeHtml(customerName)} (${escapeHtml(customerEmail)})</td></tr>
        <tr><td style="padding: 4px 0;"><strong>RTO Reason:</strong></td><td><span style="color: #b91c1c;">${escapeHtml(reason)}</span></td></tr>
        ${totalFormatted ? `<tr><td style="padding: 4px 0;"><strong>Order Total:</strong></td><td>${escapeHtml(totalFormatted)} (${isPrepaid ? 'Prepaid' : 'COD'})</td></tr>` : ''}
        ${data.refund_status ? `<tr><td style="padding: 4px 0;"><strong>Refund Status:</strong></td><td>${escapeHtml(data.refund_status)}</td></tr>` : ''}
      </table>
    </div>

    <div class="advisory-box" style="background-color: #fffbeb; border-color: #f59e0b; color: #92400e;">
      <strong>🌱 Immediate Action Required (Botanical Triage):</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px;">
        <li>Inspect physical condition of returned botanical parcels upon warehouse delivery.</li>
        <li>Assess viability of live plants, roots, or seeds exposed to prolonged courier transit.</li>
        <li>Record return quality assessment in the Admin Triage portal before restocking inventory.</li>
        ${isPrepaid ? '<li>Verify automated refund status for customer in Razorpay / Medusa dashboard.</li>' : '<li>Confirm COD cancellation - no customer refund required.</li>'}
      </ul>
    </div>
  `

  const contentText = `RTO ALERT: Order ${displayId} Returned to Origin

Shipment Details:
- Order: ${displayId} (${data.order_id || ''})
- AWB: ${awb}
- Customer: ${customerName} (${customerEmail})
- Reason: ${reason}
${totalFormatted ? `- Order Total: ${totalFormatted} (${isPrepaid ? 'Prepaid' : 'COD'})\n` : ''}
${data.refund_status ? `- Refund Status: ${data.refund_status}\n` : ''}
Action Required:
1. Inspect returned botanical parcels upon warehouse delivery.
2. Complete botanical triage assessment before updating inventory.
3. ${isPrepaid ? 'Verify automated customer refund.' : 'Confirm COD order cancellation.'}
`

  const title = `RTO Alert: Order ${displayId}`
  const subject = `[RTO ALERT] Order ${displayId} Returned to Origin (AWB: ${awb})`

  return {
    subject,
    html: renderBaseHtml({
      title,
      contentHtml,
      contentText,
      supportEmail: data.support_email,
    }),
    text: renderBaseText({
      title,
      contentHtml: '',
      contentText,
      supportEmail: data.support_email,
    }),
  }
}
