import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Package,
  MapPin,
  User,
  ArrowRight,
  ArrowLeft,
  Sprout,
  Calendar,
  PlusCircle,
  Heart,
  Headphones,
  Sparkles,
} from 'lucide-react'
import { getCurrentCustomerAction, getCustomerOrdersAction } from '@/lib/customer-actions'
import { AccountNav } from '@/components/account/AccountNav'
import { formatINR } from '@/lib/utils'
import styles from './AccountDashboard.module.css'

export const dynamic = 'force-dynamic'

export default async function AccountDashboardPage() {
  const customerRes = await getCurrentCustomerAction()
  if (!customerRes.success || !customerRes.customer) {
    redirect('/account/login')
  }

  const customer = customerRes.customer
  const ordersRes = await getCustomerOrdersAction()
  const orders = ordersRes.orders || []
  const recentOrders = orders.slice(0, 3)

  const defaultShippingAddress =
    customer.addresses.find((a) => a.is_default_shipping) || customer.addresses[0]

  return (
    <div className={styles.container}>
      {/* Mobile Clean Top Bar */}
      <div className={styles.mobileAccountBar}>
        <Link href="/" className={styles.mobileBackBtn} aria-label="Back to store">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to Store</span>
        </Link>
        <span className={styles.mobileBarTitle}>My Account</span>
      </div>

      {/* Desktop Clean Top Header */}
      <div className={styles.desktopAccountHeader}>
        <Link href="/" className={styles.desktopLogoLink} aria-label="GLOROV Homepage">
          <Image src="/glorov-logo.svg" alt="GLOROV" width={130} height={36} priority />
        </Link>
        <Link href="/" className={styles.backToStoreLink}>
          <span>← Back to Store</span>
        </Link>
      </div>

      {/* Header Greeting */}
      <header className={styles.headerArea}>
        <div className={styles.accountBadge}>
          <Sprout size={14} aria-hidden="true" />
          <span>Verified Customer Account</span>
        </div>
        <h1 className={styles.greetingTitle}>
          Welcome back, {customer.first_name || 'Gardener'}!
        </h1>
        <p className={styles.greetingSub}>
          Manage your botanical orders, delivery destinations, and account settings.
        </p>
      </header>

      <div className={styles.dashboardLayout}>
        {/* Navigation Sidebar */}
        <AccountNav />

        {/* Main Content Area */}
        <main className={styles.mainContent} aria-label="Customer dashboard content">
          {/* Top Metrics Cards */}
          <section className={styles.metricsGrid} aria-label="Account overview statistics">
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Total Orders</span>
                <Package className={styles.metricIcon} aria-hidden="true" />
              </div>
              <p className={styles.metricValue}>{orders.length}</p>
              <p className={styles.metricFooter}>
                <Link href="/account/orders" className={styles.metricLink}>
                  <span>View order history</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </p>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Saved Addresses</span>
                <MapPin className={styles.metricIcon} aria-hidden="true" />
              </div>
              <p className={styles.metricValue}>{customer.addresses.length}</p>
              <p className={styles.metricFooter}>
                <Link href="/account/addresses" className={styles.metricLink}>
                  <span>Manage addresses</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </Link>
              </p>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <span className={styles.metricLabel}>Contact Profile</span>
                <User className={styles.metricIcon} aria-hidden="true" />
              </div>
              <p className={styles.metricEmailValue} title={customer.email}>
                {customer.email}
              </p>
              <p className={styles.metricFooter}>
                {customer.phone || 'No phone set'} •{' '}
                <Link href="/account/profile" className={styles.metricLink}>
                  Edit profile
                </Link>
              </p>
            </div>
          </section>

          {/* Available Only Services Section */}
          <section className={styles.servicesSection} aria-labelledby="available-services-heading">
            <div className={styles.servicesSectionHeader}>
              <h2 id="available-services-heading" className={styles.servicesSectionTitle}>
                <Sparkles size={18} aria-hidden="true" style={{ color: '#0a4c36' }} />
                <span>My Available Services</span>
              </h2>
            </div>

            <div className={styles.servicesGrid}>
              <Link href="/account/orders" className={styles.serviceCard}>
                <div>
                  <div className={styles.serviceIconWrapper}>
                    <Package size={20} aria-hidden="true" />
                  </div>
                  <h3 className={styles.serviceCardName}>My Orders &amp; Tracking</h3>
                  <p className={styles.serviceCardDesc}>
                    Track live parcels, view invoices and manage delivery status.
                  </p>
                </div>
                <div className={styles.serviceCardAction}>
                  <span>View Orders</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </div>
              </Link>

              <Link href="/account/addresses" className={styles.serviceCard}>
                <div>
                  <div className={styles.serviceIconWrapper}>
                    <MapPin size={20} aria-hidden="true" />
                  </div>
                  <h3 className={styles.serviceCardName}>Delivery Addresses</h3>
                  <p className={styles.serviceCardDesc}>
                    Manage delivery destinations and set default shipping address.
                  </p>
                </div>
                <div className={styles.serviceCardAction}>
                  <span>Manage Addresses</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </div>
              </Link>

              <Link href="/account/profile" className={styles.serviceCard}>
                <div>
                  <div className={styles.serviceIconWrapper}>
                    <User size={20} aria-hidden="true" />
                  </div>
                  <h3 className={styles.serviceCardName}>Profile Settings</h3>
                  <p className={styles.serviceCardDesc}>
                    Update contact details, phone number and login credentials.
                  </p>
                </div>
                <div className={styles.serviceCardAction}>
                  <span>Edit Profile</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </div>
              </Link>

              <Link href="/wishlist" className={styles.serviceCard}>
                <div>
                  <div className={styles.serviceIconWrapper}>
                    <Heart size={20} aria-hidden="true" />
                  </div>
                  <h3 className={styles.serviceCardName}>Botanical Wishlist</h3>
                  <p className={styles.serviceCardDesc}>
                    Access saved garden seeds, live indoor plants and planters.
                  </p>
                </div>
                <div className={styles.serviceCardAction}>
                  <span>View Wishlist</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </div>
              </Link>

              <a
                href="https://wa.me/918087087224?text=Hi!+I+need+help+with+my+GLOROV+account+or+plant+care"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.serviceCard}
              >
                <div>
                  <div className={styles.serviceIconWrapper} style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
                    <Headphones size={20} aria-hidden="true" />
                  </div>
                  <h3 className={styles.serviceCardName}>Customer Care &amp; Support</h3>
                  <p className={styles.serviceCardDesc}>
                    Horticultural help, order queries &amp; WhatsApp expert support desk.
                  </p>
                </div>
                <div className={styles.serviceCardAction}>
                  <span>Chat With Us</span>
                  <ArrowRight size={12} aria-hidden="true" />
                </div>
              </a>
            </div>
          </section>

          {/* Default Shipping Address Banner */}
          <section className={styles.addressCard} aria-labelledby="primary-delivery-address-heading">
            <div className={styles.addressHeader}>
              <h2 id="primary-delivery-address-heading" className={styles.addressTitle}>
                <MapPin size={16} aria-hidden="true" />
                <span>Primary Delivery Address</span>
              </h2>
              <Link href="/account/addresses" className={styles.addressActionLink}>
                {defaultShippingAddress ? 'Change default' : 'Add address'}
              </Link>
            </div>
            <div className={styles.addressBody}>
              {defaultShippingAddress ? (
                <div>
                  <p className={styles.recipientName}>
                    {defaultShippingAddress.first_name} {defaultShippingAddress.last_name}
                    {defaultShippingAddress.phone && (
                      <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8 }}>
                        ({defaultShippingAddress.phone})
                      </span>
                    )}
                  </p>
                  <p style={{ margin: '2px 0' }}>
                    {defaultShippingAddress.address_1}
                    {defaultShippingAddress.address_2 && `, ${defaultShippingAddress.address_2}`}
                  </p>
                  <p style={{ margin: '2px 0' }}>
                    {defaultShippingAddress.city}, {defaultShippingAddress.province} —{' '}
                    <strong>{defaultShippingAddress.postal_code}</strong>, India
                  </p>
                </div>
              ) : (
                <div className={styles.emptyAddressNotice}>
                  <span>No delivery addresses saved yet.</span>
                  <Link
                    href="/account/addresses"
                    className={styles.detailsBtn}
                    style={{ minHeight: 36, padding: '6px 12px' }}
                  >
                    <PlusCircle size={14} aria-hidden="true" />
                    <span>Add Address</span>
                  </Link>
                </div>
              )}
            </div>
          </section>

          {/* Recent Orders Section */}
          <section className={styles.recentOrdersSection} aria-labelledby="recent-orders-heading">
            <div className={styles.sectionHeader}>
              <h2 id="recent-orders-heading" className={styles.sectionTitle}>
                <Package size={18} aria-hidden="true" />
                <span>Recent Orders</span>
              </h2>
              {orders.length > 0 && (
                <Link href="/account/orders" className={styles.viewAllLink}>
                  <span>View all ({orders.length})</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              )}
            </div>

            {recentOrders.length === 0 ? (
              <div className={styles.emptyStateCard}>
                <Package className={styles.emptyStateIcon} aria-hidden="true" />
                <h3 className={styles.emptyStateTitle}>No orders placed yet</h3>
                <p className={styles.emptyStateDesc}>
                  Explore our collection of high-germination Desi seeds, potted indoor air-purifying
                  plants, and organic gardening supplies.
                </p>
                <Link
                  href="/store"
                  className={styles.detailsBtn}
                  style={{ backgroundColor: '#0a4c36', color: '#ffffff', borderColor: '#0a4c36', display: 'inline-flex' }}
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {recentOrders.map((order) => {
                  const formattedDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Recent'

                  const isComplete = order.status === 'completed'

                  return (
                    <article key={order.id} className={styles.orderCard}>
                      <div className={styles.orderCardContent}>
                        <div className={styles.orderInfo}>
                          <div className={styles.orderMetaRow}>
                            <span className={styles.orderIdText}>
                              Order #{order.display_id || order.id.slice(-6)}
                            </span>
                            <span className={styles.orderDateText}>
                              <Calendar size={12} aria-hidden="true" />
                              {formattedDate}
                            </span>
                            <span className={isComplete ? styles.statusBadgeGreen : styles.statusBadgeAmber}>
                              {order.status || 'Processing'}
                            </span>
                          </div>
                          <p className={styles.orderItemsSummary}>
                            {order.items?.length || 0} item
                            {(order.items?.length || 0) !== 1 ? 's' : ''}:{' '}
                            {order.items?.map((i) => i.title).join(', ')}
                          </p>
                        </div>

                        <div className={styles.orderActionsRow}>
                          <div className={styles.orderTotalBlock}>
                            <span className={styles.orderTotalLabel}>Total</span>
                            <span className={styles.orderTotalAmount}>
                              {formatINR(order.total || 0)}
                            </span>
                          </div>
                          <Link href={`/account/orders/${order.id}`} className={styles.detailsBtn}>
                            <span>Details</span>
                            <ArrowRight size={14} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
