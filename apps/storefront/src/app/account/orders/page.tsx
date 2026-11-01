import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Package,
  Calendar,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  CreditCard,
  Truck,
} from 'lucide-react'
import { getCurrentCustomerAction, getCustomerOrdersAction } from '@/lib/customer-actions'
import { AccountNav } from '@/components/account/AccountNav'
import { formatINR } from '@/lib/utils'
import styles from './CustomerOrders.module.css'

export const dynamic = 'force-dynamic'

export default async function CustomerOrdersPage() {
  const customerRes = await getCurrentCustomerAction()
  if (!customerRes.success || !customerRes.customer) {
    redirect('/account/login')
  }

  const ordersRes = await getCustomerOrdersAction()
  const orders = ordersRes.orders || []

  return (
    <div className={styles.container}>
      {/* Mobile Back Bar */}
      <div className={styles.mobileTopBar}>
        <Link href="/account" className={styles.mobileBackBtn} aria-label="Back to Account Dashboard">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to Account</span>
        </Link>
      </div>

      <header className={styles.headerArea}>
        <div>
          <h1 className={styles.title}>Order History</h1>
          <p className={styles.subtitle}>
            Review past seed and botanical orders, invoice totals, and shipment tracking.
          </p>
        </div>
        <Link href="/store" className={styles.continueBtn}>
          <ShoppingBag size={16} aria-hidden="true" />
          <span>Continue Shopping</span>
        </Link>
      </header>

      <div className={styles.ordersLayout}>
        <AccountNav />

        <main className={styles.mainContent} aria-label="Customer order history">
          {orders.length === 0 ? (
            <div className={styles.emptyStateCard}>
              <Package className={styles.emptyIcon} aria-hidden="true" />
              <h2 className={styles.emptyTitle}>No orders found</h2>
              <p className={styles.emptyDesc}>
                You haven&apos;t placed any orders with this customer account yet. Browse our
                catalog of high-germination seeds, live potted plants, and botanical supplies.
              </p>
              <div className={styles.emptyActions}>
                <Link href="/categories/seeds" className={styles.btnPrimary}>
                  Explore Seeds
                </Link>
                <Link href="/categories/live-plants" className={styles.continueBtn}>
                  Explore Live Plants
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.ordersList}>
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

                const isFulfilled =
                  order.fulfillment_status === 'fulfilled' ||
                  order.fulfillment_status === 'shipped'

                const isPaid =
                  order.payment_status === 'captured' || order.status === 'completed'

                return (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <div className={styles.orderMetaLeft}>
                        <span className={styles.orderId}>
                          Order #{order.display_id || order.id.slice(-6)}
                        </span>
                        <span className={styles.orderDate}>
                          <Calendar size={13} aria-hidden="true" />
                          {formattedDate}
                        </span>
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
                      </div>
                    </div>

                    <div className={styles.orderBody}>
                      <div className={styles.itemsContainer}>
                        {order.items?.map((item) => (
                          <div key={item.id} className={styles.itemRow}>
                            <div>
                              <p className={styles.itemTitle}>{item.title}</p>
                              {item.variant_title && (
                                <p className={styles.itemVariant}>
                                  Variant: {item.variant_title}
                                </p>
                              )}
                              <p className={styles.itemQty}>
                                Qty: {item.quantity} × {formatINR(item.unit_price || 0)}
                              </p>
                            </div>
                            <div className={styles.itemSubtotal}>
                              {formatINR(item.total || (item.unit_price || 0) * (item.quantity || 1))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.orderFooter}>
                      <div className={styles.footerSummary}>
                        <span>Total Items: <strong>{itemsCount}</strong></span>
                        {order.shipping_address && (
                          <span style={{ marginLeft: 12 }}>
                            Deliver to: <strong>{order.shipping_address.city}, {order.shipping_address.postal_code}</strong>
                          </span>
                        )}
                      </div>

                      <div className={styles.footerTotalGroup}>
                        <div className={styles.totalBlock}>
                          <span className={styles.totalLabel}>Grand Total</span>
                          <span className={styles.totalAmount}>
                            {formatINR(order.total || 0)}
                          </span>
                        </div>
                        <Link
                          href={`/account/orders/${order.id}`}
                          className={styles.btnPrimary}
                          style={{ padding: '8px 18px', fontSize: '0.8125rem' }}
                        >
                          <span>View Details</span>
                          <ArrowRight size={14} aria-hidden="true" style={{ marginLeft: 6 }} />
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
