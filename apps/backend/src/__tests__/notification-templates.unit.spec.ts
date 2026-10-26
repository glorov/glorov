import {
  renderTemplate,
  renderOrderPlacedTemplate,
  renderPaymentCapturedTemplate,
  renderPaymentFailedTemplate,
  renderOrderCanceledTemplate,
  renderRefundProcessedTemplate,
  renderShipmentCreatedTemplate,
  renderDeliveryCompletedTemplate,
  renderTrackingUpdatedTemplate,
} from '../modules/notification-email/templates'
import { formatINR } from '../modules/notification-email/utils/format-currency'


describe('GLOROV Notification Email Templates', () => {
  describe('Currency Formatter (formatINR)', () => {
    it('should format amounts in paise to INR currency strings', () => {
      expect(formatINR(49900)).toBe('₹499')
      expect(formatINR(125000)).toBe('₹1,250')
      expect(formatINR(0)).toBe('₹0')
    })

    it('should format amounts in major rupee units when isPaise is false', () => {
      expect(formatINR(499, false)).toBe('₹499')
      expect(formatINR(2500, false)).toBe('₹2,500')
    })

    it('should handle Medusa v2 BigNumber objects ({ numeric, raw, value }) correctly', () => {
      expect(formatINR({ numeric: 49900 })).toBe('₹499')
      expect(formatINR({ raw: { value: '149900' } })).toBe('₹1,499')
      expect(formatINR({ value: 99900 })).toBe('₹999')
      expect(formatINR({ numeric: 499 }, false)).toBe('₹499')
    })

    it('should handle undefined or null amounts safely', () => {
      expect(formatINR(null)).toBe('₹0')
      expect(formatINR(undefined)).toBe('₹0')
    })
  })


  describe('Template: order-placed (Order Confirmation)', () => {
    const mockOrderData = {
      order: {
        id: 'order_01HXYZBOTANICAL',
        display_id: 1042,
        email: 'aarav.patel@glorov.in',
        currency_code: 'inr',
        total: 149900,
        subtotal: 139900,
        shipping_total: 10000,
        tax_total: 7000,
        items: [
          {
            title: 'Monstera Deliciosa',
            variant_title: '6-inch Nursery Self-Watering Pot',
            quantity: 1,
            unit_price: 99900,
            total: 99900,
          },
          {
            title: 'F1 Hybrid Cherry Tomato Seeds',
            variant_title: 'Pack of 50 Seeds (High Viability)',
            quantity: 2,
            unit_price: 20000,
            total: 40000,
          },
        ],
        shipping_address: {
          first_name: 'Aarav',
          last_name: 'Patel',
          address_1: 'Flat 402, Green Meadows',
          address_2: 'Koregaon Park',
          city: 'Pune',
          province: 'Maharashtra',
          postal_code: '411001',
          phone: '+919876543210',
        },
      },
    }

    it('should render complete order confirmation HTML with GLOROV botanical branding', () => {
      const rendered = renderOrderPlacedTemplate(mockOrderData)

      expect(rendered.subject).toBe('Order Confirmed: #1042 — GLOROV Botanical Garden')
      expect(rendered.html).toContain('GLOROV BOTANICAL GARDEN')
      expect(rendered.html).toContain('#1042')
      expect(rendered.html).toContain('Aarav Patel')
      expect(rendered.html).toContain('Monstera Deliciosa')
      expect(rendered.html).toContain('6-inch Nursery Self-Watering Pot')
      expect(rendered.html).toContain('F1 Hybrid Cherry Tomato Seeds')
      expect(rendered.html).toContain('₹1,499')
      expect(rendered.html).toContain('Pune, Maharashtra — 411001')
      expect(rendered.html).toContain('Live Botanical Transit Advisory')
      expect(rendered.html).toContain('care@glorov.in')
    })

    it('should generate plain-text alternative matching the order details', () => {
      const rendered = renderOrderPlacedTemplate(mockOrderData)

      expect(rendered.text).toContain('GLOROV BOTANICAL GARDEN')
      expect(rendered.text).toContain('#1042')
      expect(rendered.text).toContain('Monstera Deliciosa')
      expect(rendered.text).toContain('Total: ₹1,499')
      expect(rendered.text).toContain('care@glorov.in')
    })

    it('should gracefully handle missing optional fields without crashing', () => {
      const rendered = renderOrderPlacedTemplate({
        order: {
          id: 'order_fallback_01',
        },
      })

      expect(rendered.subject).toContain('#')
      expect(rendered.html).toContain('Valued Customer')
      expect(rendered.html).toContain('₹0')
      expect(rendered.text).toContain('Valued Customer')
    })
  })

  describe('Template: payment-captured (Payment Confirmation)', () => {
    it('should render payment confirmation with amount, transaction ID and provider', () => {
      const rendered = renderPaymentCapturedTemplate({
        display_id: 1042,
        order_id: 'order_01HXYZ',
        amount: 149900,
        customer_name: 'Priya Sharma',
        payment: {
          id: 'pay_rzp_test_98765',
          amount: 149900,
          provider_id: 'razorpay',
        },
      })

      expect(rendered.subject).toBe('Payment Received: #1042 — GLOROV Botanical Garden')
      expect(rendered.html).toContain('Payment Confirmed for Order #1042')
      expect(rendered.html).toContain('₹1,499')
      expect(rendered.html).toContain('pay_rzp_test_98765')
      expect(rendered.html).toContain('Razorpay')
      expect(rendered.html).toContain('Priya Sharma')
      expect(rendered.text).toContain('Amount Received: ₹1,499')
      expect(rendered.text).toContain('Transaction ID: pay_rzp_test_98765')
    })
  })

  describe('Template: payment-failed (Payment Failure Alert)', () => {
    it('should render helpful non-accusatory alert with retry guidance', () => {
      const rendered = renderPaymentFailedTemplate({
        display_id: 1042,
        order_id: 'order_01HXYZ',
        amount: 149900,
        customer_name: 'Rohan Mehra',
        error_description: 'Card issuer declined the transaction due to temporary network limit.',
        retry_url: 'http://localhost:3000/account/orders',
      })

      expect(rendered.subject).toBe('Payment Incomplete for Order #1042 — GLOROV')
      expect(rendered.html).toContain('Payment could not be completed for Order #1042')
      expect(rendered.html).toContain('₹1,499')
      expect(rendered.html).toContain('Card issuer declined')
      expect(rendered.html).toContain('Retry Payment Securely')
      expect(rendered.html).toContain('http://localhost:3000/account/orders')
      expect(rendered.text).toContain('REASON:')
      expect(rendered.text).toContain('RETRY YOUR ORDER:')
    })

    it('should not leak internal payment gateway secrets or tokens', () => {
      const rendered = renderPaymentFailedTemplate({
        display_id: 1042,
        amount: 50000,
        error_description: 'Authentication failure',
      })

      expect(rendered.html).not.toContain('secret')
      expect(rendered.html).not.toContain('Bearer')
      expect(rendered.html).not.toContain('webhook_secret')
    })
  })

  describe('Template: order-canceled (Order Cancellation)', () => {
    it('should render cancellation notice with refund timeline', () => {
      const rendered = renderOrderCanceledTemplate({
        display_id: 1042,
        customer_name: 'Ananya Roy',
        reason: 'Customer initiated cancellation prior to packaging',
        order: {
          id: 'order_01',
          display_id: 1042,
          total: 89900,
        },
      })

      expect(rendered.subject).toBe('Order Canceled: #1042 — GLOROV Botanical Garden')
      expect(rendered.html).toContain('Order #1042 has been canceled')
      expect(rendered.html).toContain('Customer initiated cancellation')
      expect(rendered.html).toContain('₹899')
      expect(rendered.html).toContain('5 to 7 business days')
      expect(rendered.text).toContain('REFUND INFORMATION:')
    })
  })

  describe('Template: refund-processed (Refund Status Update)', () => {
    it('should render refund confirmation with reference and banking clearance timeline', () => {
      const rendered = renderRefundProcessedTemplate({
        display_id: 1042,
        customer_name: 'Ananya Roy',
        amount: 89900,
        refund_id: 'rfnd_rzp_mock_12345',
      })

      expect(rendered.subject).toBe('Refund Processed: #1042 — GLOROV Botanical Garden')
      expect(rendered.html).toContain('Refund of ₹899 initiated for Order #1042')
      expect(rendered.html).toContain('rfnd_rzp_mock_12345')
      expect(rendered.html).toContain('5 to 7 working days')
      expect(rendered.text).toContain('Refund Amount: ₹899')
      expect(rendered.text).toContain('rfnd_rzp_mock_12345')
    })
  })

  describe('Template: shipment-created (Shipment Dispatch & Tracking)', () => {
    it('should render shipment dispatch with carrier, tracking number, and live tracking link', () => {
      const rendered = renderShipmentCreatedTemplate({
        display_id: 1042,
        customer_name: 'Vikram Singh',
        carrier: 'Shiprocket Express',
        tracking_number: 'SRIN1029384756',
        shipment: {
          id: 'ful_01',
          carrier: 'Shiprocket Express',
          tracking_number: 'SRIN1029384756',
          items: [
            {
              title: 'Sansevieria Trifasciata (Snake Plant)',
              variant_title: 'Ceramic Pot 6-inch',
              quantity: 1,
              unit_price: 69900,
            },
          ],
        },
      })

      expect(rendered.subject).toBe('Your GLOROV Plants & Seeds are on the way! Order #1042')
      expect(rendered.html).toContain('SRIN1029384756')
      expect(rendered.html).toContain('https://shiprocket.co/tracking/SRIN1029384756')
      expect(rendered.html).toContain('Sansevieria Trifasciata')
      expect(rendered.html).toContain('Important Botanical Transit Advice')
      expect(rendered.text).toContain('Track Online: https://shiprocket.co/tracking/SRIN1029384756')
    })

    it('should ensure tracking link contains no sensitive authentication tokens', () => {
      const rendered = renderShipmentCreatedTemplate({
        display_id: 1042,
        tracking_number: 'AWB987654321',
      })

      expect(rendered.html).not.toContain('token=')
      expect(rendered.html).not.toContain('jwt=')
      expect(rendered.html).not.toContain('key=')
    })
  })

  describe('Template: delivery-completed (Delivery Confirmation)', () => {
    it('should render delivery confirmation with botanical unboxing guide and plant care support', () => {
      const rendered = renderDeliveryCompletedTemplate({
        display_id: 1042,
        customer_name: 'Vikram Singh',
        delivered_at: '26 Oct 2026',
      })

      expect(rendered.subject).toBe('Delivered: Your GLOROV Order #1042 has arrived!')
      expect(rendered.html).toContain('safely delivered on <strong>26 Oct 2026</strong>')
      expect(rendered.html).toContain('Immediate Plant Acclimation &amp; Unboxing Guide')
      expect(rendered.html).toContain('Botanical Plant Care &amp; Support')
      expect(rendered.html).toContain('care@glorov.in')
      expect(rendered.text).toContain('BOTANICAL CARE & SUPPORT:')
    })
  })

  describe('Template: tracking-updated (Tracking Information Availability)', () => {
    it('should render tracking details with carrier, AWB, and secure tracking link', () => {
      const rendered = renderTrackingUpdatedTemplate({
        display_id: 1042,
        customer_name: 'Vikram Singh',
        carrier: 'Shiprocket Express',
        tracking_number: 'SRIN9988776655',
      })

      expect(rendered.subject).toBe('Tracking Information Available: Order #1042 — GLOROV')
      expect(rendered.html).toContain('SRIN9988776655')
      expect(rendered.html).toContain('https://shiprocket.co/tracking/SRIN9988776655')
      expect(rendered.html).toContain('Shiprocket Express')
      expect(rendered.html).toContain('Botanical Transit Reminder')
      expect(rendered.text).toContain('AWB / Tracking Code: SRIN9988776655')
      expect(rendered.text).toContain('Track Online: https://shiprocket.co/tracking/SRIN9988776655')
    })

    it('should sanitize tracking link from authentication tokens', () => {
      const rendered = renderTrackingUpdatedTemplate({
        display_id: 1042,
        tracking_number: 'AWB112233',
      })

      expect(rendered.html).not.toContain('token=')
      expect(rendered.html).not.toContain('jwt=')
      expect(rendered.html).not.toContain('key=')
    })
  })

  describe('Template Registry Dispatcher (renderTemplate)', () => {
    it('should resolve templates by standard kebab-case, snake_case, and dot-notation aliases', () => {
      const kebab = renderTemplate('order-placed', { order: { id: 'order_test', display_id: 501 } })
      const snake = renderTemplate('order_placed', { order: { id: 'order_test', display_id: 501 } })
      const dot = renderTemplate('order.placed', { order: { id: 'order_test', display_id: 501 } })
      const trackingKebab = renderTemplate('tracking-updated', { display_id: 501, tracking_number: 'AWB1' })
      const trackingDot = renderTemplate('tracking.updated', { display_id: 501, tracking_number: 'AWB1' })
      const trackingAvail = renderTemplate('tracking-available', { display_id: 501, tracking_number: 'AWB1' })

      expect(kebab.subject).toBe('Order Confirmed: #501 — GLOROV Botanical Garden')
      expect(snake.subject).toBe('Order Confirmed: #501 — GLOROV Botanical Garden')
      expect(dot.subject).toBe('Order Confirmed: #501 — GLOROV Botanical Garden')
      expect(trackingKebab.subject).toBe('Tracking Information Available: Order #501 — GLOROV')
      expect(trackingDot.subject).toBe('Tracking Information Available: Order #501 — GLOROV')
      expect(trackingAvail.subject).toBe('Tracking Information Available: Order #501 — GLOROV')
    })

    it('should provide fallback layout for custom or unknown templates', () => {
      const generic = renderTemplate('custom-gardening-newsletter', {
        subject: 'Seasonal Care Tips for Winter Garden',
        body: 'Here are the tips for mulching and protecting tropical live plants.',
      })

      expect(generic.subject).toBe('Seasonal Care Tips for Winter Garden')
      expect(generic.html).toContain('protecting tropical live plants')
      expect(generic.text).toContain('protecting tropical live plants')
    })
  })
})

