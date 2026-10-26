import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Calendar,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Truck,
} from 'lucide-react'
import { getCurrentCustomerAction, getCustomerOrdersAction } from '@/lib/customer-actions'
import { AccountNav } from '@/components/account/AccountNav'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function CustomerOrdersPage() {
  const customerRes = await getCurrentCustomerAction()
  if (!customerRes.success || !customerRes.customer) {
    redirect('/account/login')
  }

  const ordersRes = await getCustomerOrdersAction()
  const orders = ordersRes.orders || []

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-6xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Order History
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review past seed and botanical orders, invoice totals, and shipment tracking.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0">
          <Link href="/categories/seeds">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 w-full space-y-4">
          {orders.length === 0 ? (
            <Card className="text-center py-16 px-4">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                No orders found
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
                You haven&apos;t placed any orders with this customer account yet. Browse our
                catalog of high-germination seeds, live potted plants, and premium planters.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button asChild className="bg-botanical-700 hover:bg-botanical-800 text-white">
                  <Link href="/categories/seeds">Explore Seeds</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/categories/live-plants">Explore Live Plants</Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const formattedDate = order.created_at
                  ? new Date(order.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Recent'

                const itemsCount =
                  order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0

                return (
                  <Card
                    key={order.id}
                    className="overflow-hidden hover:border-botanical-300 transition-colors shadow-sm"
                  >
                    <CardHeader className="bg-muted/40 p-4 sm:p-5 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-extrabold text-base text-foreground tracking-tight">
                          Order #{order.display_id || order.id.slice(-6)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formattedDate}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Fulfillment Status */}
                        <Badge
                          variant="outline"
                          className={
                            order.fulfillment_status === 'fulfilled' ||
                            order.fulfillment_status === 'shipped'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-xs'
                              : 'bg-amber-50 text-amber-800 border-amber-200 text-xs'
                          }
                        >
                          <Truck className="mr-1 h-3 w-3" />
                          {order.fulfillment_status
                            ? order.fulfillment_status.replace('_', ' ')
                            : 'Processing'}
                        </Badge>

                        {/* Payment Status */}
                        <Badge
                          variant="outline"
                          className={
                            order.payment_status === 'captured' || order.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-xs'
                              : 'bg-blue-50 text-blue-800 border-blue-200 text-xs'
                          }
                        >
                          <CreditCard className="mr-1 h-3 w-3" />
                          {order.payment_status || 'Authorized'}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-5">
                      <div className="space-y-3">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-4 py-1 text-sm border-b last:border-b-0 border-border/50"
                          >
                            <div className="space-y-0.5">
                              <p className="font-medium text-foreground">{item.title}</p>
                              {item.variant_title && (
                                <p className="text-xs text-muted-foreground">
                                  Variant: {item.variant_title}
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × {formatINR(item.unit_price || 0)}
                              </p>
                            </div>
                            <div className="text-right font-medium text-foreground text-sm shrink-0">
                              {formatINR(item.total || (item.unit_price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="bg-muted/20 p-4 sm:p-5 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="text-xs text-muted-foreground">
                        <span>Total Items: </span>
                        <span className="font-semibold text-foreground">{itemsCount}</span>
                        {order.shipping_address && (
                          <span className="ml-3">
                            Deliver to:{' '}
                            <span className="font-semibold text-foreground">
                              {order.shipping_address.city}, {order.shipping_address.postal_code}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground block">Grand Total</span>
                          <span className="text-base font-extrabold text-foreground">
                            {formatINR(order.total || 0)}
                          </span>
                        </div>
                        <Button asChild size="sm" className="bg-botanical-700 hover:bg-botanical-800 text-white">
                          <Link href={`/account/orders/${order.id}`}>
                            View Order Details
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
