import React from 'react'
import type { Metadata } from 'next'
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
import { getCustomerToken } from '@/lib/auth-session'
import { formatINR } from '@/lib/utils'
import { ShipmentTracker } from '@/components/shipping/ShipmentTracker'
import styles from './OrderConfirmedPage.module.css'

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

export const metadata: Metadata = {
  title: 'Order Confirmation',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default async function OrderConfirmedPage({ params }: OrderConfirmedPageProps) {
  const { id } = await params
  const customerToken = await getCustomerToken()

  const { success, order, error } = await getOrder(id, customerToken)

  if (!success || !order) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundIcon}>
          <Package aria-hidden="true" />
        </div>
        <h1 className={styles.notFoundTitle}>Order Not Found</h1>
        <p className={styles.notFoundDesc}>
          {error || `We could not locate order ${id}. Please verify your confirmation email or order reference.`}
        </p>
        <Link href="/" className={styles.btnPrimary}>
          Back to Home
        </Link>
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
    <div className={styles.container}>
      {/* Success Hero */}
      <section className={styles.heroSection} aria-labelledby="order-confirmation-heading">
        <div className={styles.successIconBadge} aria-hidden="true">
          <CheckCircle2 />
        </div>
        <div>
          <span className={styles.badgeSuccess}>Order Successfully Placed</span>
        </div>
        <h1 id="order-confirmation-heading" className={styles.heroTitle}>
          Thank you for your order!
        </h1>
        <p className={styles.heroSubtitle}>
          Order reference <span className={styles.highlightRef}>{displayId}</span> has been confirmed. Confirmation details have been logged to{' '}
          <span className={styles.highlightEmail}>{order.email}</span>.
        </p>
      </section>

      {/* Order Status Cards */}
      <section className={styles.statusGrid} aria-label="Order summary metrics">
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>
            <Calendar size={14} aria-hidden="true" />
            Placed At
          </span>
          <p className={styles.statusValue}>{orderDate}</p>
        </div>

        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>
            <CreditCard size={14} aria-hidden="true" />
            Payment Status
          </span>
          <p className={styles.statusPaymentBadge}>
            <span className={styles.statusDotGreen} aria-hidden="true" />
            {order.payment_status || 'Authorized'}
          </p>
        </div>

        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>
            <Truck size={14} aria-hidden="true" />
            Fulfillment Status
          </span>
          <p className={styles.statusFulfillmentBadge}>
            <span className={styles.statusDotAmber} aria-hidden="true" />
            {order.fulfillment_status || 'Queued for Nursery Dispatch'}
          </p>
        </div>
      </section>

      {/* Live Shipment Tracking Card */}
      <section className={styles.shipmentSection} aria-label="Shipment tracking">
        <ShipmentTracker orderId={order.id} />
      </section>

      {/* Main Order Details Card */}
      <section className={styles.orderCard} aria-labelledby="ordered-items-heading">
        <div className={styles.orderCardHeader}>
          <h2 id="ordered-items-heading" className={styles.orderCardTitle}>
            <Package size={16} aria-hidden="true" />
            Ordered Botanical Items ({items.length})
          </h2>
          <span className={styles.orderCardId}>Medusa ID: {order.id}</span>
        </div>

        {/* Items List */}
        <ul className={styles.itemsList} aria-label="List of ordered items">
          {(items as unknown as OrderItem[]).map((item) => (
            <li key={item.id} className={styles.itemRow}>
              <div className={styles.itemInfoWrapper}>
                <div className={styles.itemThumbnail}>
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title || 'Botanical product'}
                      width={58}
                      height={58}
                      unoptimized
                      className={styles.itemThumbnailImage}
                    />
                  ) : (
                    <Sprout size={24} aria-hidden="true" color="#0a4c36" />
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <div className={styles.itemMeta}>
                    {item.subtitle && (
                      <span className={styles.subtitleBadge}>
                        {item.subtitle}
                      </span>
                    )}
                    {item.variant_sku && (
                      <span className={styles.skuText}>
                        SKU: {item.variant_sku}
                      </span>
                    )}
                  </div>
                  <p className={styles.itemQtyPrice}>
                    Qty: {item.quantity} × {formatINR(item.unit_price)}
                  </p>
                </div>
              </div>

              <div className={styles.itemSubtotal}>
                {formatINR(item.subtotal || item.unit_price * item.quantity)}
              </div>
            </li>
          ))}
        </ul>

        {/* Address and Shipping Info */}
        <div className={styles.shippingAndOriginGrid}>
          <div>
            <h3 className={styles.blockTitle}>
              <MapPin size={14} aria-hidden="true" />
              Delivery Address
            </h3>
            {shippingAddress ? (
              <div className={styles.addressDetails}>
                <p className={styles.recipientName}>
                  {shippingAddress.first_name} {shippingAddress.last_name}
                </p>
                <p>{shippingAddress.address_1}</p>
                {shippingAddress.address_2 && <p>{shippingAddress.address_2}</p>}
                <p>
                  {shippingAddress.city}, {shippingAddress.province} — {shippingAddress.postal_code}
                </p>
                <p>India (IN)</p>
                <p className={styles.recipientPhone}>Mobile: +91 {shippingAddress.phone}</p>
              </div>
            ) : (
              <p className={styles.addressDetails}>Standard Nursery Delivery Address</p>
            )}
          </div>

          <div>
            <h3 className={styles.blockTitle}>
              <Truck size={14} aria-hidden="true" />
              Shipping &amp; Origin
            </h3>
            <div className={styles.shippingDetails}>
              <p className={styles.shippingMethodName}>
                {selectedShipping?.name || 'Standard Delivery (India)'}
              </p>
              <p>Dispatch Origin: Pune Central Nursery Hub (PIN: 411001)</p>
              <div className={styles.viabilityBadgeBox}>
                <strong>Seed Viability Shield:</strong> Packets are sealed in airtight aluminium foil pouches with food-grade desiccant to guarantee viability in Indian transit conditions.
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className={styles.financialSummary}>
          <div className={styles.summaryRow}>
            <span>Items Subtotal</span>
            <span className={styles.summaryRowValue}>{formatINR(subtotal)}</span>
          </div>

          {(order.discount_total || 0) > 0 && (
            <div className={styles.discountRow}>
              <span>Botanical Discount</span>
              <span className={styles.summaryRowValue}>-{formatINR(order.discount_total || 0)}</span>
            </div>
          )}

          <div className={styles.summaryRow}>
            <span>Shipping ({selectedShipping?.name || 'Delivery'})</span>
            <span className={styles.summaryRowValue}>{formatINR(shippingTotal)}</span>
          </div>

          <div className={styles.taxRow}>
            <span>Agricultural GST (HSN 1209)</span>
            {(order.tax_total || 0) > 0 ? (
              <span className={styles.summaryRowValue}>{formatINR(order.tax_total || 0)}</span>
            ) : (
              <span className={styles.exemptText}>₹0 (0% Exempt)</span>
            )}
          </div>

          <div className={styles.grandTotalRow}>
            <span className={styles.grandTotalLabel}>Grand Total (INR)</span>
            <span className={styles.grandTotalValue}>{formatINR(total)}</span>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <nav className={styles.actionFooter} aria-label="Post-order navigation">
        <Link href="/" className={styles.btnSecondary}>
          Back to Homepage
        </Link>
        <Link href="/#catalog" className={styles.btnPrimary}>
          <span>Explore More Seeds &amp; Plants</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </nav>
    </div>
  )
}
