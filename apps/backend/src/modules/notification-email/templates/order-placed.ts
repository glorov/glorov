import type { OrderNotificationData, RenderedTemplate } from '../types'
import { escapeHtml, renderBaseHtml, renderBaseText } from './base-layout'
import { formatINR } from '../utils/format-currency'

export function renderOrderPlacedTemplate(data: {
  order?: OrderNotificationData
  customer_name?: string
  support_email?: string
}): RenderedTemplate {
  const order = data.order || ({} as OrderNotificationData)
  const displayId = order.display_id
    ? `#${order.display_id}`
    : order.id
      ? `#${order.id.slice(-6).toUpperCase()}`
      : '#ORDER'

  const customerName =
    data.customer_name ||
    (order.shipping_address?.first_name
      ? `${order.shipping_address.first_name} ${order.shipping_address.last_name || ''}`.trim()
      : 'Valued Customer')

  const items = order.items || []
  const subtotalFormatted = formatINR(order.subtotal ?? order.total ?? 0)
  const shippingFormatted = order.shipping_total === 0 ? 'FREE' : formatINR(order.shipping_total || 0)
  const taxFormatted = formatINR(order.tax_total || 0)
  const totalFormatted = formatINR(order.total || 0)

  // HTML items rows
  const itemRowsHtml = items.length > 0
    ? items.map((item) => {
        const itemTotal = item.total ?? (item.quantity * item.unit_price)
        return `
          <tr>
            <td>
              <strong>${escapeHtml(item.title)}</strong>
              ${item.variant_title ? `<br><span style="font-size: 12px; color: #64748b;">${escapeHtml(item.variant_title)}</span>` : ''}
            </td>
            <td style="text-align: center;">${item.quantity}</td>
            <td style="text-align: right;">${formatINR(item.unit_price)}</td>
            <td style="text-align: right; font-weight: 600;">${formatINR(itemTotal)}</td>
          </tr>
        `
      }).join('')
    : `<tr><td colspan="4" style="text-align: center; color: #64748b; padding: 16px;">Botanical items</td></tr>`

  // Shipping Address block
  const addr = order.shipping_address
  const addressHtml = addr
    ? `
      <div class="address-card">
        <strong style="color: #064e3b; display: block; margin-bottom: 6px;">📍 Shipping Address:</strong>
        ${escapeHtml(addr.first_name || '')} ${escapeHtml(addr.last_name || '')}<br>
        ${escapeHtml(addr.address_1 || '')}
        ${addr.address_2 ? `<br>${escapeHtml(addr.address_2)}` : ''}<br>
        ${escapeHtml(addr.city || '')}${addr.province ? `, ${escapeHtml(addr.province)}` : ''} — ${escapeHtml(addr.postal_code || '')}<br>
        ${addr.phone ? `Phone: ${escapeHtml(addr.phone)}` : ''}
      </div>
    `
    : ''

  const contentHtml = `
    <div style="margin-bottom: 24px;">
      <span class="badge badge-success">✓ Order Confirmed</span>
      <h2 style="color: #064e3b; margin: 12px 0 6px 0; font-size: 20px;">
        Thank you for choosing GLOROV, ${escapeHtml(customerName)}!
      </h2>
      <p style="margin: 0; color: #475569; font-size: 14px;">
        Your order <strong>${escapeHtml(displayId)}</strong> has been confirmed. Our team at the Pune Central Nursery Hub is preparing your botanical selection for dispatch.
      </p>
    </div>

    <table class="item-table">
      <thead>
        <tr>
          <th>Botanical Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHtml}
      </tbody>
    </table>

    <table class="summary-table">
      <tr>
        <td style="text-align: right; color: #64748b;">Subtotal:</td>
        <td style="text-align: right; width: 120px; font-weight: 500;">${subtotalFormatted}</td>
      </tr>
      <tr>
        <td style="text-align: right; color: #64748b;">Express Botanical Shipping:</td>
        <td style="text-align: right; font-weight: 500;">${shippingFormatted}</td>
      </tr>
      ${order.tax_total ? `
      <tr>
        <td style="text-align: right; color: #64748b;">Applicable Taxes (GST):</td>
        <td style="text-align: right; font-weight: 500;">${taxFormatted}</td>
      </tr>` : ''}

      <tr class="total-row">
        <td style="text-align: right;">Total Order Value:</td>
        <td style="text-align: right;">${totalFormatted}</td>
      </tr>
    </table>

    ${addressHtml}

    <div class="advisory-box">
      <strong>🌿 Live Botanical Transit Advisory:</strong>
      <p style="margin: 4px 0 0 0;">
        Live potted plants are biological organisms sensitive to transit times. We pack them with root ball moisture retention and aerated corrugated liners. You will receive an email with live courier tracking as soon as the parcel leaves our nursery.
      </p>
    </div>
  `

  // Plain-text items
  const itemsText = items.length > 0
    ? items
        .map((i) => ` - ${i.title}${i.variant_title ? ` (${i.variant_title})` : ''} x ${i.quantity} @ ${formatINR(i.unit_price)} = ${formatINR(i.total ?? (i.quantity * i.unit_price))}`)
        .join('\n')
    : ' - Botanical products'

  const addressText = addr
    ? `\nSHIPPING ADDRESS:\n${addr.first_name || ''} ${addr.last_name || ''}\n${addr.address_1 || ''}${addr.address_2 ? `, ${addr.address_2}` : ''}\n${addr.city || ''}, ${addr.province || ''} - ${addr.postal_code || ''}\n${addr.phone ? `Phone: ${addr.phone}` : ''}\n`
    : ''

  const contentText = `Dear ${customerName},

Thank you for your order with GLOROV Botanical Garden!
We have received your order ${displayId}.

ORDER DETAILS:
${itemsText}

------------------------------------------------------------
Subtotal: ${subtotalFormatted}
Shipping: ${shippingFormatted}
${order.tax_total ? `GST: ${taxFormatted}\n` : ''}Total: ${totalFormatted}
------------------------------------------------------------
${addressText}
LIVE BOTANICAL TRANSIT ADVISORY:
Live potted plants are packaged with protective moisture barriers and aerated liners. You will receive a tracking update with an active AWB link once your parcel is handed over to the courier.`

  const title = `Order Confirmation ${displayId}`
  const subject = `Order Confirmed: ${displayId} — GLOROV Botanical Garden`

  return {
    subject,
    html: renderBaseHtml({ title, contentHtml, contentText, supportEmail: data.support_email }),
    text: renderBaseText({ title, contentHtml, contentText, supportEmail: data.support_email }),
  }
}
