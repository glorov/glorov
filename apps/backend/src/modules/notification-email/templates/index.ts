import type { RenderedTemplate } from '../types'
import { renderOrderPlacedTemplate } from './order-placed'
import { renderPaymentCapturedTemplate } from './payment-captured'
import { renderPaymentFailedTemplate } from './payment-failed'
import { renderOrderCanceledTemplate } from './order-canceled'
import { renderRefundProcessedTemplate } from './refund-processed'
import { renderShipmentCreatedTemplate } from './shipment-created'
import { renderDeliveryCompletedTemplate } from './delivery-completed'
import { renderTrackingUpdatedTemplate } from './tracking-updated'
import { renderRtoNotificationTemplate } from './rto-notification'
import { renderBaseHtml, renderBaseText } from './base-layout'

export type TemplateRenderer = (data: any) => RenderedTemplate

const TEMPLATE_REGISTRY: Record<string, TemplateRenderer> = {
  // Order placed
  'order-placed': renderOrderPlacedTemplate,
  'order_placed': renderOrderPlacedTemplate,
  'order.placed': renderOrderPlacedTemplate,
  'order-confirmation': renderOrderPlacedTemplate,

  // Payment captured
  'payment-captured': renderPaymentCapturedTemplate,
  'payment_captured': renderPaymentCapturedTemplate,
  'payment.captured': renderPaymentCapturedTemplate,
  'payment-confirmation': renderPaymentCapturedTemplate,

  // Payment failed
  'payment-failed': renderPaymentFailedTemplate,
  'payment_failed': renderPaymentFailedTemplate,
  'payment.failed': renderPaymentFailedTemplate,
  'payment-failure': renderPaymentFailedTemplate,

  // Order canceled
  'order-canceled': renderOrderCanceledTemplate,
  'order_canceled': renderOrderCanceledTemplate,
  'order.canceled': renderOrderCanceledTemplate,
  'order-cancellation': renderOrderCanceledTemplate,

  // Refund processed / Payment refunded
  'refund-processed': renderRefundProcessedTemplate,
  'refund_processed': renderRefundProcessedTemplate,
  'payment-refunded': renderRefundProcessedTemplate,
  'payment_refunded': renderRefundProcessedTemplate,
  'payment.refunded': renderRefundProcessedTemplate,

  // Shipment created / dispatched
  'shipment-created': renderShipmentCreatedTemplate,
  'shipment_created': renderShipmentCreatedTemplate,
  'shipment.created': renderShipmentCreatedTemplate,
  'order-shipped': renderShipmentCreatedTemplate,

  // Tracking information availability
  'tracking-updated': renderTrackingUpdatedTemplate,
  'tracking_updated': renderTrackingUpdatedTemplate,
  'tracking.updated': renderTrackingUpdatedTemplate,
  'tracking-available': renderTrackingUpdatedTemplate,
  'tracking_available': renderTrackingUpdatedTemplate,
  'tracking.available': renderTrackingUpdatedTemplate,
  'tracking-info': renderTrackingUpdatedTemplate,
  'tracking_info': renderTrackingUpdatedTemplate,

  // Delivery completed / created
  'delivery-completed': renderDeliveryCompletedTemplate,
  'delivery_completed': renderDeliveryCompletedTemplate,
  'delivery-created': renderDeliveryCompletedTemplate,
  'delivery_created': renderDeliveryCompletedTemplate,
  'delivery.created': renderDeliveryCompletedTemplate,
  'order-delivered': renderDeliveryCompletedTemplate,

  // RTO / Return to Origin
  'rto-notification': renderRtoNotificationTemplate,
  'rto_notification': renderRtoNotificationTemplate,
  'fulfillment-rto': renderRtoNotificationTemplate,
  'fulfillment.rto': renderRtoNotificationTemplate,
}


/**
 * Render a template by identifier with data payload.
 * If the template is unknown, creates a safe generic notification layout.
 */
export function renderTemplate(templateName: string, data: Record<string, unknown> = {}): RenderedTemplate {
  const normalizedKey = (templateName || '').toLowerCase().trim()
  const renderer = TEMPLATE_REGISTRY[normalizedKey]

  if (renderer) {
    return renderer(data)
  }

  // Fallback for custom or unmapped template
  const subject = String(data.subject || `GLOROV Notification: ${templateName}`)
  const body = String(data.body || data.message || 'Notification from GLOROV Botanical Garden.')
  const title = String(data.title || subject)

  return {
    subject,
    html: renderBaseHtml({
      title,
      contentHtml: `<p style="font-size: 15px; color: #334155;">${body}</p>`,
      contentText: body,
      supportEmail: data.support_email as string | undefined,
    }),
    text: renderBaseText({
      title,
      contentHtml: '',
      contentText: body,
      supportEmail: data.support_email as string | undefined,
    }),
  }
}

export {
  renderOrderPlacedTemplate,
  renderPaymentCapturedTemplate,
  renderPaymentFailedTemplate,
  renderOrderCanceledTemplate,
  renderRefundProcessedTemplate,
  renderShipmentCreatedTemplate,
  renderDeliveryCompletedTemplate,
  renderTrackingUpdatedTemplate,
  renderRtoNotificationTemplate,
}

