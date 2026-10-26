import type { ShipmentNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'

export function renderTrackingUpdatedTemplate(data: {
  shipment?: ShipmentNotificationData
  order_id?: string
  display_id?: string | number
  tracking_number?: string
  tracking_url?: string
  carrier?: string
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.shipment?.order?.display_id
      ? `#${data.shipment.order.display_id}`
      : data.order_id
        ? `#${data.order_id.slice(-6).toUpperCase()}`
        : '#ORDER'

  const customerName = data.customer_name || 'Valued Customer'
  const trackingNumber = data.tracking_number || data.shipment?.tracking_number || ''
  const carrier = data.carrier || data.shipment?.carrier || 'Shiprocket Express'

  // Safe public tracking link: strictly without sensitive authentication tokens or credentials
  const trackingUrl =
    data.tracking_url ||
    data.shipment?.tracking_url ||
    (trackingNumber
      ? `https://shiprocket.co/tracking/${encodeURIComponent(trackingNumber)}`
      : 'https://shiprocket.co/tracking')

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-info">📍 Tracking Available</span>
      <h2 style="color: #064e3b; margin: 12px 0 6px 0; font-size: 20px;">
        Tracking details are now available for Order ${escapeHtml(displayId)}
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, active tracking has been assigned for your GLOROV botanical parcel.
      </p>
    </div>

    <div class="address-card" style="background-color: #f0fdf4; border-color: #86efac;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #166534; font-size: 13px;">Courier Partner:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #064e3b;">${escapeHtml(carrier)}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #166534; font-size: 13px;">AWB / Tracking Number:</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; font-family: monospace; font-size: 14px; color: #064e3b;">
            ${trackingNumber ? escapeHtml(trackingNumber) : 'Assigned (In Transit)'}
          </td>
        </tr>
      </table>

      ${trackingNumber ? `
      <div style="text-align: center; margin-top: 16px;">
        <a href="${escapeHtml(trackingUrl)}" class="btn" style="margin: 0; background-color: #047857;">
          Track Parcel Progress →
        </a>
      </div>` : ''}
    </div>

    <div class="advisory-box">
      <strong>🌿 Botanical Transit Reminder:</strong>
      <p style="margin: 4px 0 0 0;">
        Live potted plants are packaged with protective moisture barriers. Once your parcel arrives, please open the box promptly to provide fresh air and gentle indirect light.
      </p>
    </div>
  `

  const contentText = `Dear ${customerName},

Tracking details are now active for your GLOROV order ${displayId}.

TRACKING INFORMATION:
- Courier Partner: ${carrier}
- AWB / Tracking Code: ${trackingNumber || 'Available via tracking link'}
- Track Online: ${trackingUrl}

BOTANICAL TRANSIT REMINDER:
Live plants are sensitive to dark packaging. Once your parcel arrives, open the box immediately to inspect and unpack your botanical selection.

For questions or assistance regarding transit, contact care@glorov.in quoting ${displayId}.`

  const title = `Tracking Information for Order ${displayId}`
  const subject = `Tracking Information Available: Order ${displayId} — GLOROV`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
