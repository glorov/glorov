import type { ShipmentNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'

export function renderShipmentCreatedTemplate(data: {
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
  const trackingUrl = data.tracking_url ||
    data.shipment?.tracking_url ||
    (trackingNumber ? `https://shiprocket.co/tracking/${encodeURIComponent(trackingNumber)}` : 'https://shiprocket.co/tracking')

  const items = data.shipment?.items || []
  const itemsListHtml = items.length > 0
    ? `
      <div style="margin: 16px 0;">
        <strong style="font-size: 13px; color: #475569;">Dispatched Items in this Parcel:</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 13px; color: #334155;">
          ${items.map((i) => `<li>${escapeHtml(i.title)}${i.variant_title ? ` (${escapeHtml(i.variant_title)})` : ''} — Qty: ${i.quantity}</li>`).join('')}
        </ul>
      </div>
    `
    : ''

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-info">🚀 Order Dispatched</span>
      <h2 style="color: #064e3b; margin: 12px 0 6px 0; font-size: 20px;">
        Your GLOROV Plants &amp; Seeds are on the way!
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, great news! Parcel for order <strong>${escapeHtml(displayId)}</strong> has been packaged at our Pune Nursery Hub and handed over to our courier partner.
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
          Track Parcel Live →
        </a>
      </div>` : ''}
    </div>

    ${itemsListHtml}

    <div class="advisory-box">
      <strong>🌿 Important Botanical Transit Advice:</strong>
      <ol style="margin: 6px 0 0 0; padding-left: 20px; line-height: 1.6;">
        <li><strong>Unbox Immediately:</strong> Please open the parcel promptly upon arrival to allow your live plants to breathe.</li>
        <li><strong>Hydrate Gently:</strong> Check soil moisture with your fingertip. If dry, give a gentle drink of water at room temperature.</li>
        <li><strong>Acclimation:</strong> Keep your plants in bright, indirect sunlight for the first 48 hours. Avoid scorching direct sun or cold drafts.</li>
      </ol>
    </div>
  `

  const itemsText = items.length > 0
    ? `\nITEMS IN THIS SHIPMENT:\n${items.map((i) => ` - ${i.title}${i.variant_title ? ` (${i.variant_title})` : ''} (Qty: ${i.quantity})`).join('\n')}\n`
    : ''

  const contentText = `Dear ${customerName},

Great news! Your GLOROV order ${displayId} has been dispatched from our Pune Nursery Hub.

SHIPMENT TRACKING DETAILS:
- Courier Partner: ${carrier}
- AWB / Tracking Code: ${trackingNumber || 'Available via tracking link'}
- Track Online: ${trackingUrl}
${itemsText}
LIVE BOTANICAL ACCLIMATION ADVICE:
1. Unbox Immediately: Open the parcel as soon as delivered.
2. Hydrate: Check the soil moisture; water lightly if the top inch is dry.
3. Acclimation: Place in indirect daylight for the first 48 hours before repotting.

If you have any courier delays or concerns, reach out to care@glorov.in quoting ${displayId}.`

  const title = `Shipment Dispatched for Order ${displayId}`
  const subject = `Your GLOROV Plants & Seeds are on the way! Order ${displayId}`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
