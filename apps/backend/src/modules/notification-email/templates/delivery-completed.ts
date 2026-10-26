import type { DeliveryNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'

export function renderDeliveryCompletedTemplate(data: {
  delivery?: DeliveryNotificationData
  order_id?: string
  display_id?: string | number
  delivered_at?: string | Date
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const displayId = data.display_id
    ? `#${data.display_id}`
    : data.delivery?.order?.display_id
      ? `#${data.delivery.order.display_id}`
      : data.order_id
        ? `#${data.order_id.slice(-6).toUpperCase()}`
        : '#ORDER'

  const customerName = data.customer_name || 'Valued Customer'
  const deliveredTime = data.delivered_at || data.delivery?.delivered_at || new Date()
  const formattedDate = deliveredTime instanceof Date
    ? deliveredTime.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : String(deliveredTime)

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-success">✓ Parcel Delivered</span>
      <h2 style="color: #064e3b; margin: 12px 0 6px 0; font-size: 20px;">
        Your GLOROV Plants &amp; Seeds have arrived!
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Hello <strong>${escapeHtml(customerName)}</strong>, our courier partner has reported that order <strong>${escapeHtml(displayId)}</strong> was safely delivered on <strong>${escapeHtml(formattedDate)}</strong>.
      </p>
    </div>

    <div class="advisory-box" style="background-color: #f0fdf4; border-color: #047857;">
      <strong>🌱 Immediate Plant Acclimation &amp; Unboxing Guide:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 20px; line-height: 1.8;">
        <li><strong>Open the box now:</strong> Live plants have been in dark transit. Unpack them carefully from the aerated protective sleeve.</li>
        <li><strong>Check soil moisture:</strong> Touch the soil. If dry, give a gentle cup of room-temperature water.</li>
        <li><strong>Avoid scorching direct sun:</strong> Keep in bright, indirect light for 48 hours to rest and adapt to your home's microclimate.</li>
        <li><strong>Delay repotting:</strong> Do not repot immediately. Allow 5–7 days for root shock to settle before moving to a larger container.</li>
      </ul>
    </div>

    <div class="address-card" style="margin-top: 24px; background-color: #f8fafc;">
      <strong style="color: #064e3b; font-size: 14px; display: block; margin-bottom: 6px;">
        🌿 Botanical Plant Care &amp; Support:
      </strong>
      <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
        If your botanical shipment arrived distressed during transit or you need guidance on potting and germination, please reach out to our team at
        <a href="mailto:care@glorov.in" style="color: #047857; font-weight: 600;">care@glorov.in</a> quoting order reference ${escapeHtml(displayId)}.
      </p>
    </div>
  `

  const contentText = `Dear ${customerName},

Our courier partner has confirmed the delivery of your GLOROV order ${displayId} on ${formattedDate}.

IMMEDIATE PLANT CARE UPON ARRIVAL:
1. Unbox Now: Open the parcel immediately to allow the plants to breathe.
2. Hydrate: Check the soil moisture; water lightly if dry.
3. Indirect Light: Place in bright, filtered light for 48 hours. Avoid harsh direct sun.
4. Delay Repotting: Let the root system rest 5–7 days before repotting.

BOTANICAL CARE & SUPPORT:
If your botanical shipment arrived distressed or you need plant care guidance, reach out to care@glorov.in quoting ${displayId}.

Thank you for choosing GLOROV Botanical Garden!`


  const title = `Delivery Confirmation for Order ${displayId}`
  const subject = `Delivered: Your GLOROV Order ${displayId} has arrived!`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
