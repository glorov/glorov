import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  CreditCard,
  Sprout,
  ArrowRight,
} from 'lucide-react'
import { getOrder } from '@/lib/cart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatINR } from '@/lib/utils'

interface OrderItem {
  id: string
  title: string
  subtitle?: string | null
  variant_sku?: string | null
  quantity: number
  unit_price: number
  subtotal?: number | null
  thumbnail?: string | null
}

interface OrderConfirmedPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OrderConfirmedPage({ params }: OrderConfirmedPageProps) {
  const { id } = await params

  const { success, order, error } = await getOrder(id)

  if (!success || !order) {
    return (
      <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center">
        <div className="h-16 w-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <Package className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-botanical-950">Order Not Found</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          {error || `We could not locate order ${id}. Please verify your confirmation email or order reference.`}
        </p>
        <Button asChild variant="botanical" className="mt-6 rounded-full">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    )
  }

  const items = order.items || []
  const shippingAddress = order.shipping_address
  const shippingMethods = order.shipping_methods || []
  const selectedShipping = shippingMethods[0]
  const subtotal = order.summary?.current_order_total
    ? order.summary.current_order_total - (order.shipping_total || 0)
    : order.total - (order.shipping_total || 0)
  const total = order.summary?.current_order_total || order.total || 0
  const shippingTotal = selectedShipping?.amount || order.shipping_total || 0
  const displayId = order.display_id ? `#${order.display_id}` : order.id.slice(-8).toUpperCase()
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-20 max-w-4xl">
      {/* Success Hero */}
      <div className="text-center pb-10 border-b border-border">
        <div className="h-20 w-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-5 shadow-sm">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <Badge variant="botanical" className="mb-2">
          Order Successfully Placed
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-black text-botanical-950 tracking-tight">
          Thank you for your order!
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Order reference <span className="font-bold text-botanical-900">{displayId}</span> has been confirmed. Confirmation details have been logged to{' '}
          <span className="font-semibold text-botanical-900">{order.email}</span>.
        </p>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-botanical-700" />
            Placed At
          </span>
          <p className="text-sm font-bold text-botanical-950 mt-1">{orderDate}</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-botanical-700" />
            Payment Status
          </span>
          <p className="text-sm font-bold text-emerald-700 mt-1 uppercase flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-600 inline-block" />
            {order.payment_status || 'Authorized'}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5 text-botanical-700" />
            Fulfillment Status
          </span>
          <p className="text-sm font-bold text-amber-700 mt-1 uppercase flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />
            {order.fulfillment_status || 'Queued for Nursery Dispatch'}
          </p>
        </div>
      </div>

      {/* Main Order Details Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs mb-8">
        <div className="px-6 py-4 bg-earth-50/70 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-botanical-950 flex items-center gap-2">
            <Package className="h-4 w-4 text-botanical-700" />
            Ordered Items ({items.length})
          </h2>
          <span className="text-xs font-mono text-muted-foreground">ID: {order.id}</span>
        </div>

        {/* Items List */}
        <ul className="divide-y divide-border px-6">
          {(items as unknown as OrderItem[]).map((item) => (
            <li key={item.id} className="py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-lg border border-border bg-earth-50 overflow-hidden flex-shrink-0 relative">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title || 'Product'}
                      width={56}
                      height={56}
                      unoptimized
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-botanical-400">
                      <Sprout className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-botanical-950">{item.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.subtitle && (
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-earth-50">
                        {item.subtitle}
                      </Badge>
                    )}
                    {item.variant_sku && (
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        SKU: {item.variant_sku}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Qty: {item.quantity} × {formatINR(item.unit_price)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-sm text-botanical-950">
                  {formatINR(item.subtotal || item.unit_price * item.quantity)}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* Address and Shipping Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-earth-50/40 border-t border-border text-xs">
          <div>
            <h3 className="font-bold text-botanical-950 mb-2 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-botanical-700" />
              Delivery Address
            </h3>
            {shippingAddress ? (
              <div className="text-muted-foreground space-y-0.5 leading-relaxed">
                <p className="font-semibold text-botanical-900">
                  {shippingAddress.first_name} {shippingAddress.last_name}
                </p>
                <p>{shippingAddress.address_1}</p>
                {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.province} — {shippingAddress.postal_code}
                </p>
                <p>India (IN)</p>
                <p className="pt-1 text-[11px] font-mono">Mobile: +91 {shippingAddress.phone}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Standard Nursery Delivery</p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-botanical-950 mb-2 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-botanical-700" />
              Shipping &amp; Origin
            </h3>
            <div className="text-muted-foreground space-y-1">
              <p className="font-semibold text-botanical-900">
                {selectedShipping?.name || 'Standard Delivery (India)'}
              </p>
              <p>Dispatch Origin: Pune Central Nursery Hub (PIN: 411001)</p>
              <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100 mt-2">
                <strong>Seed Viability Shield:</strong> Packets are sealed in airtight aluminium foil pouches with food-grade desiccant to guarantee viability in Indian transit conditions.
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="p-6 border-t border-border space-y-2 text-sm bg-background">
          <div className="flex justify-between text-muted-foreground">
            <span>Items Subtotal</span>
            <span className="font-semibold text-botanical-950">{formatINR(subtotal)}</span>
          </div>

          {(order.discount_total || 0) > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Botanical Discount</span>
              <span className="font-semibold">-{formatINR(order.discount_total || 0)}</span>
            </div>
          )}

          <div className="flex justify-between text-muted-foreground">
            <span>Shipping ({selectedShipping?.name || 'Delivery'})</span>
            <span className="font-semibold text-botanical-950">{formatINR(shippingTotal)}</span>
          </div>

          <div className="flex justify-between text-muted-foreground text-xs">
            <span>Agricultural GST (HSN 1209)</span>
            {(order.tax_total || 0) > 0 ? (
              <span className="font-semibold text-botanical-950">{formatINR(order.tax_total || 0)}</span>
            ) : (
              <span className="font-semibold text-emerald-700">₹0 (0% Exempt)</span>
            )}
          </div>

          <div className="border-t border-border pt-3 flex justify-between items-baseline">
            <span className="font-bold text-base text-botanical-950">Grand Total (INR)</span>
            <span className="text-2xl font-black text-botanical-950">{formatINR(total)}</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/">Back to Homepage</Link>
        </Button>
        <Button asChild variant="botanical" className="w-full sm:w-auto gap-2 font-bold shadow-md">
          <Link href="/#catalog">
            <span>Explore More Seeds &amp; Plants</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
