import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  MapPin,
  ArrowLeft,
  ShoppingBag,
  ShieldAlert,
  Sprout,
} from 'lucide-react'

import { getCustomerOrderAction, getCurrentCustomerAction } from '@/lib/customer-actions'
import { AccountNav } from '@/components/account/AccountNav'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatINR } from '@/lib/utils'
import { ShipmentTracker } from '@/components/shipping/ShipmentTracker'

export const dynamic = 'force-dynamic'

interface OrderDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CustomerOrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params

  // Verify authentication first
  const customerRes = await getCurrentCustomerAction()
  if (!customerRes.success || !customerRes.customer) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(`/account/orders/${id}`)}`)
  }

  const { success, order, error, status } = await getCustomerOrderAction(id)

  if (!success || !order) {
    const isForbidden = status === 403
    return (
      <div className="container mx-auto px-4 py-12 sm:px-6 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <AccountNav />
          <div className="flex-1 w-full">
            <Card className="text-center py-16 px-6 border-destructive/30 bg-destructive/5">
              <ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-3" />
              <h2 className="text-xl font-bold text-foreground">
                {isForbidden ? 'Access Denied' : 'Order Not Available'}
              </h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                {isForbidden
                  ? 'You do not have permission to access this order. This order belongs to a different customer account.'
                  : error || `Could not find order ${id}. Please verify the order reference.`}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button asChild variant="outline">
                  <Link href="/account/orders">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Order History
                  </Link>
                </Button>
                <Button asChild className="bg-botanical-700 hover:bg-botanical-800 text-white">
                  <Link href="/categories/seeds">Continue Shopping</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const items = order.items || []
  const shippingAddress = order.shipping_address
  const shippingMethods = order.shipping_methods || []
  const selectedShipping = shippingMethods[0]
  const subtotal = order.summary?.current_order_total
    ? order.summary.current_order_total - (order.shipping_total || 0)
    : (order.total || 0) - (order.shipping_total || 0)
  const total = order.summary?.current_order_total || order.total || 0
  const shippingTotal = selectedShipping?.amount || order.shipping_total || 0
  const displayId = order.display_id ? `#${order.display_id}` : order.id.slice(-8).toUpperCase()
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 max-w-6xl">
      {/* Breadcrumb / Back button */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <Link href="/account/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/categories/seeds">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continue Shopping
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 w-full space-y-6">
          {/* Live Shipment Tracking Card */}
          <ShipmentTracker orderId={order.id} />

          {/* Order Header Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="p-5 sm:p-6 pb-4 border-b bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-botanical-700 uppercase tracking-wider block mb-1">
                  Order Details
                </span>
                <CardTitle className="text-2xl font-black text-foreground">
                  Order {displayId}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Placed on {orderDate}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={
                    order.fulfillment_status === 'fulfilled' ||
                    order.fulfillment_status === 'shipped'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-xs py-1'
                      : 'bg-amber-50 text-amber-800 border-amber-200 text-xs py-1'
                  }
                >
                  <Truck className="mr-1.5 h-3.5 w-3.5" />
                  Fulfillment:{' '}
                  {order.fulfillment_status
                    ? order.fulfillment_status.replace('_', ' ')
                    : 'Processing'}
                </Badge>

                <Badge
                  variant="outline"
                  className={
                    order.payment_status === 'captured' || order.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 text-xs py-1'
                      : 'bg-blue-50 text-blue-800 border-blue-200 text-xs py-1'
                  }
                >
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                  Payment: {order.payment_status || 'Authorized'}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-6">
              {/* Ordered Botanical Items */}
              <div>
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-botanical-700" />
                  Items in this order ({items.length})
                </h3>

                <div className="divide-y divide-border border rounded-xl overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card"
                    >
                      <div className="flex items-center gap-3">
                        {item.thumbnail ? (
                          <div className="relative h-14 w-14 rounded-lg overflow-hidden border shrink-0 bg-earth-50">
                            <Image
                              src={item.thumbnail}
                              alt={item.title}
                              fill
                              sizes="56px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-earth-100 flex items-center justify-center text-botanical-700 shrink-0">
                            <Sprout className="h-6 w-6" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sm text-foreground">{item.title}</p>
                          {item.variant_title && (
                            <p className="text-xs text-muted-foreground">
                              Variant: <span className="font-medium text-foreground">{item.variant_title}</span>
                            </p>
                          )}
                          {item.variant_sku && (
                            <p className="text-[11px] font-mono text-muted-foreground">
                              SKU: {item.variant_sku}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0">
                        <div className="text-xs text-muted-foreground">
                          <span>Qty: </span>
                          <span className="font-semibold text-foreground">{item.quantity}</span>
                          <span className="mx-1">×</span>
                          <span>{formatINR(item.unit_price || 0)}</span>
                        </div>
                        <div className="text-sm font-bold text-foreground min-w-[80px]">
                          {formatINR(item.total || (item.unit_price || 0) * (item.quantity || 1))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery and Shipping Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Shipping Address */}
                <div className="p-4 rounded-xl border bg-earth-50/40 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-botanical-700" />
                    Delivery Destination
                  </span>
                  {shippingAddress ? (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p className="font-bold text-foreground text-sm">
                        {shippingAddress.first_name} {shippingAddress.last_name}
                      </p>
                      <p>{shippingAddress.address_1}</p>
                      {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                      <p>
                        {shippingAddress.city}, {shippingAddress.province} -{' '}
                        <span className="font-semibold text-foreground">
                          {shippingAddress.postal_code}
                        </span>
                      </p>
                      <p>India</p>
                      <p className="font-mono pt-1 text-foreground">
                        Phone: {shippingAddress.phone || 'None provided'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No address on file</p>
                  )}
                </div>

                {/* Shipping Method */}
                <div className="p-4 rounded-xl border bg-earth-50/40 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-botanical-700" />
                    Selected Shipping Method
                  </span>
                  {selectedShipping ? (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p className="font-bold text-foreground text-sm">
                        {selectedShipping.name}
                      </p>
                      <p>
                        Air/surface botanical express routing with thermal packing protection.
                      </p>
                      <p className="font-semibold text-foreground pt-1">
                        Shipping Fee: {formatINR(selectedShipping.amount || 0)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Standard Delivery (India)</p>
                  )}
                </div>
              </div>

              {/* Order Financial Summary */}
              <div className="border-t pt-4">
                <div className="max-w-xs ml-auto space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-foreground">{formatINR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping Fee</span>
                    <span className="font-medium text-foreground">{formatINR(shippingTotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>GST (CGST/SGST 0% Seeds / Included)</span>
                    <span className="font-medium text-foreground">₹0</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-sm font-extrabold text-foreground">
                    <span>Grand Total</span>
                    <span className="text-base text-botanical-800">{formatINR(total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/20 p-5 sm:p-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-xs text-muted-foreground">
                For order support or botanical replacement claims, contact support@glorov.in
              </span>
              <Button asChild className="bg-botanical-700 hover:bg-botanical-800 text-white">
                <Link href="/categories/seeds">
                  Continue Shopping
                  <ShoppingBag className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
