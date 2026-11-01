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

import {
  getCustomerOrderAction,
  getCurrentCustomerAction,
  getOrderReturnRequestsAction,
} from '@/lib/customer-actions'
import { AccountNav } from '@/components/account/AccountNav'
import { formatINR } from '@/lib/utils'
import { ShipmentTracker } from '@/components/shipping/ShipmentTracker'
import { OrderCancellationButton } from '@/components/orders/OrderCancellationButton'
import { OrderReturnRequestModal } from '@/components/orders/OrderReturnRequestModal'
import { OrderReturnStatusSection } from '@/components/orders/OrderReturnStatusSection'
import styles from './CustomerOrderDetail.module.css'

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
      <div className={styles.container}>
        <div className={styles.orderDetailLayout}>
          <AccountNav />
          <div className={styles.mainContent}>
            <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#fff', borderRadius: 16, border: '1px solid #fee2e2' }}>
              <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 8px' }}>
                {isForbidden ? 'Access Denied' : 'Order Not Available'}
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: 440, margin: '0 auto 24px' }}>
                {isForbidden
                  ? 'You do not have permission to access this order. This order belongs to a different customer account.'
                  : error || `Could not find order ${id}. Please verify the order reference.`}
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link href="/account/orders" className={styles.backLink}>
                  <ArrowLeft size={16} aria-hidden="true" />
                  <span>Back to Order History</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const returnRes = await getOrderReturnRequestsAction(id)
  const returnRequests = returnRes.success ? returnRes.return_requests : []

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

  const isFulfilled =
    order.fulfillment_status === 'fulfilled' ||
    order.fulfillment_status === 'shipped'

  const isPaid =
    order.payment_status === 'captured' || order.status === 'completed'

  return (
    <div className={styles.container}>
      {/* Breadcrumb / Back button */}
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/account/orders" className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Order History</span>
        </Link>
        <Link href="/store" className={styles.backLink}>
          <ShoppingBag size={14} aria-hidden="true" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className={styles.orderDetailLayout}>
        <AccountNav />

        <main className={styles.mainContent} aria-label="Customer order details">
          {/* Canceled Order Alert Banner */}
          {order.status === 'canceled' && (
            <div style={{ padding: 16, borderRadius: 12, border: '1px solid #fecaca', backgroundColor: '#fef2f2', fontSize: '0.8125rem', color: '#991b1b', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <ShieldAlert size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontWeight: 700, margin: '0 0 2px' }}>This order has been canceled</p>
                <p style={{ margin: 0 }}>
                  All reserved inventory has been returned to available stock at Pune Central Nursery Hub,
                  and uncaptured payments or payment collections have been canceled.
                </p>
              </div>
            </div>
          )}

          {/* Customer Return Requests & Refund Progress */}
          <OrderReturnStatusSection returnRequests={returnRequests} />

          {/* Live Shipment Tracking Card */}
          <div className={styles.shipmentWrapper}>
            <ShipmentTracker orderId={order.id} />
          </div>

          {/* Order Details Card */}
          <article className={styles.orderCard}>
            <div className={styles.cardHeader}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0a4c36', display: 'block', marginBottom: 2 }}>
                  Order Details
                </span>
                <h1 className={styles.orderTitle}>Order {displayId}</h1>
                <p className={styles.orderMetaText}>
                  <Calendar size={12} aria-hidden="true" style={{ display: 'inline', marginRight: 4 }} />
                  Placed on {orderDate}
                </p>
              </div>

              <div className={styles.badgesGroup}>
                <span className={isFulfilled ? styles.badgeSuccess : styles.badgeWarning}>
                  <Truck size={12} aria-hidden="true" />
                  {order.fulfillment_status
                    ? order.fulfillment_status.replace('_', ' ')
                    : 'Processing'}
                </span>

                <span className={isPaid ? styles.badgeSuccess : styles.badgeInfo}>
                  <CreditCard size={12} aria-hidden="true" />
                  {order.payment_status || 'Authorized'}
                </span>

                {/* Actions */}
                <OrderCancellationButton
                  orderId={order.id}
                  displayId={order.display_id}
                  status={order.status}
                  fulfillmentStatus={order.fulfillment_status}
                />

                <OrderReturnRequestModal
                  orderId={order.id}
                  displayId={order.display_id}
                  status={order.status}
                  fulfillmentStatus={order.fulfillment_status}
                  items={items.map((it) => ({
                    id: it.id,
                    title: it.title,
                    variant_title: it.variant_title,
                    quantity: it.quantity,
                    unit_price: it.unit_price,
                  }))}
                />
              </div>
            </div>

            <div style={{ padding: '20px 20px 0' }}>
              <h2 className={styles.cardTitle}>
                <Package size={16} aria-hidden="true" />
                <span>Items in this order ({items.length})</span>
              </h2>
            </div>

            {/* Items List */}
            <ul className={styles.itemsList} aria-label="Items in this order">
              {items.map((item) => (
                <li key={item.id} className={styles.itemRow}>
                  <div className={styles.itemLeft}>
                    {item.thumbnail ? (
                      <div className={styles.itemThumb}>
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={56}
                          height={56}
                          unoptimized
                          className={styles.thumbImg}
                        />
                      </div>
                    ) : (
                      <div className={styles.itemThumb}>
                        <Sprout size={24} color="#0a4c36" aria-hidden="true" />
                      </div>
                    )}
                    <div className={styles.itemDetails}>
                      <p className={styles.itemTitle}>{item.title}</p>
                      {item.variant_title && (
                        <p className={styles.itemSubtitle}>
                          Variant: <strong>{item.variant_title}</strong>
                        </p>
                      )}
                      {item.variant_sku && (
                        <p style={{ fontSize: '0.6875rem', fontFamily: 'monospace', color: '#94a3b8', margin: 0 }}>
                          SKU: {item.variant_sku}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <p className={styles.itemQty}>
                      Qty: {item.quantity} × {formatINR(item.unit_price || 0)}
                    </p>
                    <div className={styles.itemSubtotal}>
                      {formatINR(item.total || (item.unit_price || 0) * (item.quantity || 1))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Delivery and Shipping Info */}
            <div className={styles.infoGrid}>
              <div>
                <h3 className={styles.infoBlockTitle}>
                  <MapPin size={14} aria-hidden="true" />
                  <span>Delivery Destination</span>
                </h3>
                {shippingAddress ? (
                  <div className={styles.infoBlockContent}>
                    <p><strong>{shippingAddress.first_name} {shippingAddress.last_name}</strong></p>
                    <p>{shippingAddress.address_1}</p>
                    {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                    <p>{shippingAddress.city}, {shippingAddress.province} — {shippingAddress.postal_code}</p>
                    <p>India</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: 4 }}>
                      Phone: +91 {shippingAddress.phone || 'None provided'}
                    </p>
                  </div>
                ) : (
                  <p className={styles.infoBlockContent}>Standard Delivery Address</p>
                )}
              </div>

              <div>
                <h3 className={styles.infoBlockTitle}>
                  <Truck size={14} aria-hidden="true" />
                  <span>Selected Shipping Method</span>
                </h3>
                <div className={styles.infoBlockContent}>
                  <p><strong>{selectedShipping?.name || 'Standard Botanical Delivery'}</strong></p>
                  <p>Air/surface botanical express routing with thermal packing protection from Pune Central Nursery Hub.</p>
                  <p style={{ marginTop: 4, fontWeight: 600 }}>
                    Shipping Fee: {formatINR(selectedShipping?.amount || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className={styles.financialSummary}>
              <div className={styles.summaryRow}>
                <span>Items Subtotal</span>
                <span className={styles.summaryVal}>{formatINR(subtotal)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping Fee</span>
                <span className={styles.summaryVal}>{formatINR(shippingTotal)}</span>
              </div>
              <div className={styles.summaryTax}>
                <span>GST (CGST/SGST 0% Seeds / Included)</span>
                <span className={styles.exemptTag}>₹0 (0% Exempt)</span>
              </div>
              <div className={styles.grandTotalRow}>
                <span className={styles.grandTotalLabel}>Grand Total</span>
                <span className={styles.grandTotalVal}>{formatINR(total)}</span>
              </div>
            </div>

            <div className={styles.actionsBar}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', flex: 1 }}>
                For order support or botanical replacement claims, contact <strong>support@glorov.in</strong>
              </span>
              <Link
                href="/store"
                className={styles.backLink}
                style={{ fontWeight: 700 }}
              >
                <span>Explore More Seeds &amp; Plants</span>
              </Link>
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}
