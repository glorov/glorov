import { defineMiddlewares, authenticate } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'
import { createRateLimiter } from './middlewares/rate-limiter'
import { requestCorrelationMiddleware } from './middlewares/request-correlation'
import { sendSanitizedError } from '../utils/error-handler'

const pincodeRateLimiter = createRateLimiter({
  action: 'pincode_check',
  limit: 120,
  windowSeconds: 60,
})

const razorpayVerifyRateLimiter = createRateLimiter({
  action: 'razorpay_verify',
  limit: 60,
  windowSeconds: 60,
})

const csvImportRateLimiter = createRateLimiter({
  action: 'csv_import',
  limit: 30,
  windowSeconds: 60,
})

const orderCancelRateLimiter = createRateLimiter({
  action: 'order_cancel',
  limit: 30,
  windowSeconds: 60,
})

const returnRequestRateLimiter = createRateLimiter({
  action: 'return_request',
  limit: 30,
  windowSeconds: 60,
})

const checkoutRateLimiter = createRateLimiter({
  action: 'store_checkout',
  limit: 30,
  windowSeconds: 60,
})

/**
 * Validates that an authenticated customer only retrieves their own orders.
 * Prevents horizontal privilege escalation where changing the order ID allows
 * inspecting another customer's order history or personal details.
 */
const validateOrderOwnership = async (
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const orderId = req.params.id
  if (!orderId) {
    return next()
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  try {
    const { data: orders } = await query.graph({
      entity: 'order',
      fields: ['id', 'customer_id', 'email', 'customer.has_account'],
      filters: { id: orderId },
    })

    const order = orders?.[0] as
      | {
          id: string
          customer_id?: string | null
          email?: string | null
          customer?: { has_account?: boolean } | null
        }
      | undefined

    if (!order) {
      res.status(404).json({ message: `Order with id: ${orderId} was not found` })
      return
    }

    const authContext = (req as unknown as { auth_context?: { actor_id?: string; actor_type?: string } }).auth_context

    // Case 1: Order belongs to a registered customer account (customer.has_account is true)
    const isRegisteredCustomerOrder = Boolean(order.customer?.has_account)
    if (isRegisteredCustomerOrder) {
      if (!authContext?.actor_id) {
        res.status(401).json({ message: 'Authentication required to access customer order' })
        return
      }
      if (authContext.actor_id !== order.customer_id) {
        res.status(403).json({ message: 'Unauthorized access: you do not have permission to access this order' })
        return
      }
    } else {
      // Case 2: Guest checkout order
      // Allow unauthenticated guests to view their order (e.g. order confirmation page).
      // For mutating actions (cancellation, return requests), require email verification to prevent unauthorized state tampering.
      if (req.method !== 'GET') {
        const providedEmail =
          (req.body as any)?.email ||
          (req.body as any)?.order_email ||
          req.headers['x-order-email']
        if (!authContext?.actor_id) {
          if (
            !providedEmail ||
            String(providedEmail).trim().toLowerCase() !== String(order.email || '').toLowerCase()
          ) {
            res.status(401).json({
              message:
                'Authentication or matching order email verification is required to cancel or return a guest order',
            })
            return
          }
        }
      }

      // If the caller is an authenticated customer with a different email, prevent access.
      if (authContext?.actor_id && order.email) {
        const { data: customers } = await query.graph({
          entity: 'customer',
          fields: ['id', 'email'],
          filters: { id: authContext.actor_id },
        })
        const customer = customers?.[0] as { id: string; email?: string | null } | undefined
        if (customer && customer.email?.toLowerCase() !== order.email?.toLowerCase()) {
          res.status(403).json({ message: 'Unauthorized access: you do not have permission to access this order' })
          return
        }
      }
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

/**
 * GLOROV Backend Global Middlewares
 */
export default defineMiddlewares({
  routes: [
    {
      matcher: /.*/,
      middlewares: [requestCorrelationMiddleware],
    },
    {
      method: ['GET'],
      matcher: '/store/orders/:id',
      middlewares: [
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
        validateOrderOwnership,
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/orders/:id/cancel',
      middlewares: [
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
        validateOrderOwnership,
        orderCancelRateLimiter,
      ],
    },
    {
      method: ['GET', 'POST'],
      matcher: '/store/orders/:id/return-request',
      middlewares: [
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
        validateOrderOwnership,
        returnRequestRateLimiter,
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/customers/me/password',
      middlewares: [
        authenticate('customer', ['session', 'bearer']),
      ],
    },
    {
      method: ['POST'],
      matcher: '/store/reviews',
      middlewares: [
        authenticate('customer', ['session', 'bearer']),
      ],
    },
    {
      method: ['GET', 'POST', 'PUT', 'DELETE'],
      matcher: '/store/checkout*',
      middlewares: [checkoutRateLimiter],
    },
    {
      method: ['GET'],
      matcher: '/store/pincode-check',
      middlewares: [pincodeRateLimiter],
    },
    {
      method: ['POST'],
      matcher: '/store/payment/razorpay/verify',
      middlewares: [razorpayVerifyRateLimiter],
    },
    {
      method: ['POST'],
      matcher: '/admin/products/csv-import*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
        csvImportRateLimiter,
      ],
    },
    {
      method: ['GET', 'POST'],
      matcher: '/admin/orders/:id/shipment*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
    {
      method: ['GET', 'POST'],
      matcher: '/admin/orders/:id/return-requests*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
    {
      method: ['POST'],
      matcher: '/admin/orders/:id/refund*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
    {
      method: ['POST'],
      matcher: '/admin/orders/:id/return-inventory-triage*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
    {
      method: ['POST'],
      matcher: '/admin/payments/cod/reconcile*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
    {
      method: ['POST'],
      matcher: '/admin/payments/cod/refund*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
    {
      method: ['GET'],
      matcher: '/store/orders/:id/tracking',
      middlewares: [
        authenticate('customer', ['session', 'bearer'], {
          allowUnauthenticated: true,
        }),
        validateOrderOwnership,
      ],
    },
    {
      method: ['GET'],
      matcher: '/admin/health/metrics',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
  ],
  errorHandler: (
    error: any,
    req: MedusaRequest,
    res: MedusaResponse,
    _next: MedusaNextFunction
  ) => {
    sendSanitizedError(res, error, {
      req,
      operation: `${req.method} ${req.baseUrl || ''}${req.path || ''}`,
    })
  },
})



