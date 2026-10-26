import orderPlacedHandler from '../subscribers/order-placed'
import paymentCapturedHandler from '../subscribers/payment-captured'
import paymentFailedHandler from '../subscribers/payment-failed'
import orderCanceledHandler from '../subscribers/order-canceled'
import paymentRefundedHandler from '../subscribers/payment-refunded'
import shipmentCreatedHandler from '../subscribers/shipment-created'
import deliveryCreatedHandler from '../subscribers/delivery-created'
import trackingUpdatedHandler from '../subscribers/tracking-updated'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'


describe('GLOROV Customer Notification Subscribers', () => {
  let mockLogger: any
  let mockQuery: any
  let mockNotificationModule: any
  let mockContainer: any

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    }

    mockQuery = {
      graph: jest.fn(),
    }

    mockNotificationModule = {
      createNotifications: jest.fn().mockResolvedValue({ id: 'noti_mock_success_01' }),
    }

    mockContainer = {
      resolve: jest.fn((key: string) => {
        if (key === ContainerRegistrationKeys.LOGGER) return mockLogger
        if (key === ContainerRegistrationKeys.QUERY) return mockQuery
        if (key === Modules.NOTIFICATION) return mockNotificationModule
        return null
      }),
    }
  })

  describe('order.placed Subscriber', () => {
    it('should map order.placed to order-placed notification with verified data and idempotency key', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'aarav.patel@glorov.in',
            currency_code: 'inr',
            total: 149900,
            subtotal: 139900,
            shipping_total: 10000,
            tax_total: 7000,
            items: [{ title: 'Monstera Deliciosa', quantity: 1, unit_price: 99900 }],
            shipping_address: { first_name: 'Aarav', last_name: 'Patel', city: 'Pune' },
          },
        ],
      })

      await orderPlacedHandler({
        event: { name: 'order.placed', data: { id: 'order_1001' } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockQuery.graph).toHaveBeenCalledWith(
        expect.objectContaining({
          entity: 'order',
          filters: { id: 'order_1001' },
        })
      )

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'aarav.patel@glorov.in',
          channel: 'email',
          template: 'order-placed',
          trigger_type: 'order.placed',
          resource_id: 'order_1001',
          resource_type: 'order',
          idempotency_key: 'notif:order-placed:order_1001',
        })
      )
    })

    it('should not throw or block checkout when notification module fails', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [{ id: 'order_fail', email: 'test@glorov.in' }],
      })
      mockNotificationModule.createNotifications.mockRejectedValueOnce(
        new Error('SMTP service temporarily unreachable')
      )

      // Must resolve cleanly without throwing
      await expect(
        orderPlacedHandler({
          event: { name: 'order.placed', data: { id: 'order_fail' } },
          container: mockContainer,
          pluginOptions: {},
        } as any)
      ).resolves.not.toThrow()

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to dispatch order confirmation')
      )
    })

    it('should safely skip when order payload is missing id', async () => {
      await orderPlacedHandler({
        event: { name: 'order.placed', data: {} },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).not.toHaveBeenCalled()
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('missing order id in event payload')
      )
    })
  })

  describe('payment.captured Subscriber', () => {
    it('should map payment.captured to payment-captured notification with payment amount', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'priya@glorov.in',
            total: 149900,
            payment_collections: [
              {
                payments: [{ id: 'pay_rzp_123', amount: 149900, provider_id: 'razorpay' }],
              },
            ],
          },
        ],
      })

      await paymentCapturedHandler({
        event: { name: 'payment.captured', data: { id: 'pay_rzp_123', order_id: 'order_1001' } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'priya@glorov.in',
          channel: 'email',
          template: 'payment-captured',
          trigger_type: 'payment.captured',
          idempotency_key: 'notif:payment-captured:order_1001:pay_rzp_123',
        })
      )
    })
  })

  describe('payment.failed Subscriber', () => {
    it('should map payment.failed to payment-failed notification with helpful guidance', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [{ id: 'order_failed_01', display_id: 1005, email: 'rohan@glorov.in', total: 50000 }],
      })

      await paymentFailedHandler({
        event: {
          name: 'payment.failed',
          data: {
            order_id: 'order_failed_01',
            customer_email: 'rohan@glorov.in',
            amount: 50000,
            error_code: 'BAD_REQUEST_ERROR',
            error_description: 'UPI PIN incorrect or bank server timed out',
          },
        },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'rohan@glorov.in',
          channel: 'email',
          template: 'payment-failed',
          trigger_type: 'payment.failed',
          idempotency_key: 'notif:payment-failed:order_failed_01:BAD_REQUEST_ERROR',
        })
      )
    })
  })

  describe('order.canceled Subscriber', () => {
    it('should map order.canceled to order-canceled notification with refund info', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_canceled_01',
            display_id: 1008,
            email: 'ananya@glorov.in',
            total: 89900,
            shipping_address: { first_name: 'Ananya' },
          },
        ],
      })

      await orderCanceledHandler({
        event: { name: 'order.canceled', data: { id: 'order_canceled_01' } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ananya@glorov.in',
          channel: 'email',
          template: 'order-canceled',
          trigger_type: 'order.canceled',
          idempotency_key: 'notif:order-canceled:order_canceled_01',
        })
      )
    })
  })

  describe('payment.refunded Subscriber', () => {
    it('should map payment.refunded to refund-processed notification', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'ananya@glorov.in',
            total: 89900,
            shipping_address: { first_name: 'Ananya' },
          },
        ],
      })

      await paymentRefundedHandler({
        event: {
          name: 'payment.refunded',
          data: { id: 'pay_01', refund_id: 'rfnd_999', order_id: 'order_1001', amount: 89900 },
        },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ananya@glorov.in',
          channel: 'email',
          template: 'refund-processed',
          trigger_type: 'payment.refunded',
          idempotency_key: 'notif:payment-refunded:order_1001:rfnd_999',
        })
      )
    })

    it('should accurately resolve partial refund amount from payment record when payload omits amount and order_id', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'ananya@glorov.in',
            total: 100000,
            shipping_address: { first_name: 'Ananya' },
            payment_collections: [
              {
                payments: [
                  {
                    id: 'pay_02',
                    refunds: [
                      {
                        id: 'rfnd_partial_01',
                        amount: 25000,
                        note: 'Customer requested return of 1 seed packet',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      })

      await paymentRefundedHandler({
        event: {
          name: 'payment.refunded',
          data: { id: 'pay_02' },
        },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'ananya@glorov.in',
          template: 'refund-processed',
          idempotency_key: 'notif:payment-refunded:order_1001:rfnd_partial_01',
          data: expect.objectContaining({
            amount: 25000,
            refund_id: 'rfnd_partial_01',
          }),
        })
      )
    })
  })

  describe('shipment.created Subscriber', () => {
    it('should map shipment.created to shipment-created notification with courier tracking details', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'vikram@glorov.in',
            shipping_address: { first_name: 'Vikram' },
            fulfillments: [
              {
                id: 'ful_shiprocket_01',
                data: { awb_code: 'SRIN1029384756', courier_name: 'Shiprocket Express' },
                labels: [
                  {
                    tracking_number: 'SRIN1029384756',
                    tracking_url: 'https://shiprocket.co/tracking/SRIN1029384756',
                  },
                ],
                items: [{ title: 'Snake Plant', quantity: 1 }],
              },
            ],
          },
        ],
      })

      await shipmentCreatedHandler({
        event: { name: 'shipment.created', data: { id: 'ful_shiprocket_01', order_id: 'order_1001' } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'vikram@glorov.in',
          channel: 'email',
          template: 'shipment-created',
          trigger_type: 'shipment.created',
          idempotency_key: 'notif:shipment-created:order_1001:ful_shiprocket_01',
          data: expect.objectContaining({
            tracking_number: 'SRIN1029384756',
            tracking_url: 'https://shiprocket.co/tracking/SRIN1029384756',
          }),
        })
      )
    })

    it('should respect no_notification flag and skip dispatch', async () => {
      await shipmentCreatedHandler({
        event: { name: 'shipment.created', data: { id: 'ful_silent', no_notification: true } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('no_notification is requested'))
    })
  })

  describe('delivery.created Subscriber', () => {
    it('should map delivery.created to delivery-completed notification with care guide', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'vikram@glorov.in',
            shipping_address: { first_name: 'Vikram' },
            fulfillments: [
              {
                id: 'ful_delivered_01',
                delivered_at: '2026-10-26T10:00:00.000Z',
              },
            ],
          },
        ],
      })

      await deliveryCreatedHandler({
        event: { name: 'delivery.created', data: { id: 'ful_delivered_01', order_id: 'order_1001' } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'vikram@glorov.in',
          channel: 'email',
          template: 'delivery-completed',
          trigger_type: 'delivery.created',
          idempotency_key: 'notif:delivery-created:order_1001:ful_delivered_01',
        })
      )
    })

    it('should respect no_notification flag and skip delivery notification', async () => {
      await deliveryCreatedHandler({
        event: { name: 'delivery.created', data: { id: 'ful_silent', no_notification: true } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('no_notification is requested'))
    })
  })

  describe('tracking.updated Subscriber', () => {
    it('should map tracking.updated to tracking-updated notification with active AWB and link', async () => {
      mockQuery.graph.mockResolvedValueOnce({
        data: [
          {
            id: 'order_1001',
            display_id: 1001,
            email: 'vikram@glorov.in',
            shipping_address: { first_name: 'Vikram' },
            fulfillments: [
              {
                id: 'ful_sr_02',
                data: { awb_code: 'SRIN5544332211', courier_name: 'Delhivery Express' },
                labels: [{ tracking_number: 'SRIN5544332211', tracking_url: 'https://shiprocket.co/tracking/SRIN5544332211' }],
              },
            ],
          },
        ],
      })

      await trackingUpdatedHandler({
        event: {
          name: 'tracking.updated',
          data: {
            order_id: 'order_1001',
            fulfillment_id: 'ful_sr_02',
            tracking_number: 'SRIN5544332211',
            carrier: 'Delhivery Express',
          },
        },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'vikram@glorov.in',
          channel: 'email',
          template: 'tracking-updated',
          trigger_type: 'tracking.updated',
          idempotency_key: 'notif:tracking-updated:order_1001:SRIN5544332211',
          data: expect.objectContaining({
            tracking_number: 'SRIN5544332211',
            carrier: 'Delhivery Express',
          }),
        })
      )
    })

    it('should respect no_notification flag and skip tracking update dispatch', async () => {
      await trackingUpdatedHandler({
        event: { name: 'tracking.updated', data: { order_id: 'order_1001', no_notification: true } },
        container: mockContainer,
        pluginOptions: {},
      } as any)

      expect(mockNotificationModule.createNotifications).not.toHaveBeenCalled()
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('no_notification is requested'))
    })
  })
})

