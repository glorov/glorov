import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Leaf, Truck, ShieldCheck, Clock, MapPin } from 'lucide-react'
import { PolicyNav } from '@/components/policies/PolicyNav'
import styles from '@/app/policies/PolicyPage.module.css'

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — GLOROV Botanicals',
  description: 'Safe transit protocols, express Pune nursery dispatch, and 48-hour live plant guarantee across India.',
}

export default function ShippingPolicyPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Shipping &amp; Delivery Policy</span>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Truck size={14} aria-hidden="true" />
            <span>Pan-India Botanical Logistics</span>
          </div>
          <h1 className={styles.heroTitle}>Safe-Transit Shipping &amp; Delivery Policy</h1>
          <p className={styles.heroSubtitle}>
            Dispatched fresh from our Pune nursery hub with root hydration and moisture-shield packaging.
          </p>
        </div>
      </section>

      {/* 3. Main Content Grid */}
      <main className={styles.mainContent}>
        <div className={styles.layoutGrid}>
          {/* Sidebar */}
          <PolicyNav />

          {/* Article Body */}
          <article className={styles.articleCard}>
            <div className={styles.metaBar}>
              <span><strong>Last Updated:</strong> October 2026</span>
              <span><strong>Dispatch Hub:</strong> Pune Nursery, Maharashtra (PIN 411001)</span>
            </div>

            {/* Section 1: Dispatch Protocol */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Leaf size={20} color="#0a4c36" aria-hidden="true" />
                <span>1. Pune Nursery Dispatch Protocols</span>
              </h2>
              <p className={styles.paragraph}>
                At GLOROV, every living plant and seed parcel is prepared with precision horticultural care. Unlike ordinary dry goods, living botanicals require climate synchronization to thrive during interstate transit.
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Monday through Thursday Dispatches:</strong> Living potted plants are dispatched exclusively between Monday and Thursday to guarantee that fragile seedlings never sit in transit courier sorting hubs over the weekend.
                </li>
                <li>
                  <strong>24–48 Hour Nursery Conditioning:</strong> Each plant undergoes pre-shipment root hydration, foliar inspection, and pest screening before final crating at our Pune nursery (PIN 411001).
                </li>
                <li>
                  <strong>Seeds Dispatches:</strong> Organic vegetable, flower, and herb seeds are dispatched 6 days a week (Monday–Saturday) within 24 hours of order placement.
                </li>
              </ul>
            </section>

            {/* Callout: Moisture Shield */}
            <div className={styles.calloutBox}>
              <h3 className={styles.calloutTitle}>Moisture-Shield &amp; Root Hydration Packaging</h3>
              <p className={styles.calloutText}>
                Every living specimen is packed using coco-peat moisture retention wraps that lock in humidity for up to 7 days, encased in ventilated corrugated cartons that allow foliage respiration while preventing crushing.
              </p>
            </div>

            {/* Section 2: Rates & Delivery SLAs */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Clock size={20} color="#0a4c36" aria-hidden="true" />
                <span>2. Delivery Charges &amp; Speed Tiers</span>
              </h2>
              <p className={styles.paragraph}>
                We partner with premier express logistics carriers (Delhivery, Bluedart, and Shiprocket Air) to provide safe, temperature-monitored botanical delivery across India.
              </p>

              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Order Value</th>
                      <th>Shipping Charge</th>
                      <th>Estimated Transit Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Seeds &amp; Non-Perishables</strong></td>
                      <td>Above ₹499</td>
                      <td><span style={{ color: '#008c4b', fontWeight: 700 }}>FREE Delivery</span></td>
                      <td>2–4 Business Days</td>
                    </tr>
                    <tr>
                      <td><strong>Seeds &amp; Non-Perishables</strong></td>
                      <td>Below ₹499</td>
                      <td>₹49 Flat Rate</td>
                      <td>2–4 Business Days</td>
                    </tr>
                    <tr>
                      <td><strong>Live Indoor &amp; Outdoor Plants</strong></td>
                      <td>All Orders</td>
                      <td>₹99 Express Air</td>
                      <td>2–3 Business Days (Metros)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 3: Indian PIN Code Coverage */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <MapPin size={20} color="#0a4c36" aria-hidden="true" />
                <span>3. Geographic Serviceability</span>
              </h2>
              <p className={styles.paragraph}>
                We service over 19,000 PIN codes across India. You can verify instant pin-code delivery eligibility directly on any product page using our real-time PIN code checker tool.
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Metro Cities (Tier 1):</strong> Mumbai, Pune, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata receive priority next-day or 48-hour delivery.
                </li>
                <li>
                  <strong>Tier 2 &amp; Tier 3 Towns:</strong> Typically delivered within 3 to 5 business days via surface air-couriers.
                </li>
                <li>
                  <strong>Remote Mountain &amp; Island Zones:</strong> Transit for live plants may be paused during severe weather alerts (extreme frost or monsoons) to safeguard plant vitality.
                </li>
              </ul>
            </section>

            {/* Section 4: Live Order Tracking */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <ShieldCheck size={20} color="#0a4c36" aria-hidden="true" />
                <span>4. Tracking &amp; Real-Time Notifications</span>
              </h2>
              <p className={styles.paragraph}>
                Immediately upon parcel dispatch from our Pune nursery, you will receive an SMS and email notification containing your courier Air Waybill (AWB) number and direct tracking link.
              </p>
              <p className={styles.paragraph}>
                You can also track your shipment status at any time via our dedicated <Link href="/shipping/tracker" style={{ color: '#0a4c36', fontWeight: 600, textDecoration: 'underline' }}>Shipment Tracker</Link> or by checking the <Link href="/account/orders" style={{ color: '#0a4c36', fontWeight: 600, textDecoration: 'underline' }}>My Orders</Link> section in your account.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
