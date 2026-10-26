import { defineMiddlewares, authenticate } from '@medusajs/framework/http'
import { ContainerRegistrationKeys } from '@medusajs/framework/utils'
import type { MedusaRequest, MedusaResponse, MedusaNextFunction } from '@medusajs/framework/http'

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
      matcher: '/store/customers/me/password',
      middlewares: [
        authenticate('customer', ['session', 'bearer']),
      ],
    },
    {
      method: ['POST'],
      matcher: '/admin/products/csv-import*',
      middlewares: [
        authenticate('user', ['session', 'bearer']),
      ],
    },
  ],
})

