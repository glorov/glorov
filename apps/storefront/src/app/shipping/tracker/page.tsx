'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Truck,
  ShieldCheck,
  Search,
  MessageCircle,
  Clock,
  Leaf,
  ChevronRight,
  ExternalLink,
  Layers,
} from 'lucide-react'
import { ShipmentTracker } from '@/components/shipping/ShipmentTracker'
import styles from './TrackerPage.module.css'

function TrackerContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialOrderId = searchParams?.get('orderId') || ''

  const [orderQuery, setOrderQuery] = useState(initialOrderId)
  const [activeOrderId, setActiveOrderId] = useState<string | null>(initialOrderId || null)

  useEffect(() => {
    const q = searchParams?.get('orderId')
    if (q) {
      setOrderQuery(q)
      setActiveOrderId(q)
    }
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orderQuery.trim()
    if (!trimmed) return

    setActiveOrderId(trimmed)
    router.push(`/shipping/tracker?orderId=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Shipment Tracker</span>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Leaf size={14} aria-hidden="true" />
            <span>Pune Nursery Hub Dispatch</span>
          </div>
          <h1 className={styles.heroTitle}>Track Your Botanical Order</h1>
          <p className={styles.heroSubtitle}>
            Real-time delivery progress and moisture-shield status for living plants and certified organic seeds.
          </p>
        </div>
      </section>

      {/* 3. Main Body */}
      <main className={styles.mainContent}>
        {/* Search Input Card */}
        <div className={styles.searchCard}>
          <div className={styles.searchHeader}>
            <div className={styles.searchHeaderIcon}>
              <Search size={22} aria-hidden="true" />
            </div>
            <div>
              <h2 className={styles.searchHeaderTitle}>Enter Your Order or AWB Number</h2>
              <p className={styles.searchHeaderDesc}>
                Find your Order ID (e.g. order_01... or #1001) in your confirmation SMS or email.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="order-search-input" className={styles.label}>
                Order ID / AWB Tracking Number
              </label>
              <div className={styles.inputWrapper}>
                <Truck size={18} className={styles.inputIcon} aria-hidden="true" />
                <input
                  id="order-search-input"
                  type="text"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="e.g. order_01JJ88... or 1001"
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              <span>Track Parcel</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </form>
        </div>

        {/* Live Shipment Tracking Result */}
        {activeOrderId && (
          <div className={styles.trackingWrapper}>
            <ShipmentTracker orderId={activeOrderId} />
          </div>
        )}

        {/* Quick Plant Care & Support Bar */}
        <section className={styles.supportBanner} aria-label="Customer Care Helpdesk">
          <div className={styles.supportLeft}>
            <div className={styles.supportIcon}>
              <MessageCircle size={22} aria-hidden="true" />
            </div>
            <div>
              <h3 className={styles.supportTitle}>Need help with transit or unboxing?</h3>
              <p className={styles.supportDesc}>
                Our botanical experts in Pune are available Mon–Sat, 9:30 AM – 6:30 PM IST.
              </p>
            </div>
          </div>
          <div className={styles.supportActions}>
            <a
              href="https://wa.me/918087087224?text=Hi!+I+need+help+tracking+my+GLOROV+botanical+order"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
            >
              <span>Chat on WhatsApp</span>
              <ExternalLink size={15} aria-hidden="true" />
            </a>
            <Link href="/account/orders" className={styles.ordersBtn}>
              <span>My Orders</span>
            </Link>
          </div>
        </section>

        {/* 3 Botanical Logistics Guarantees */}
        <section className={styles.reassuranceGrid} aria-label="Botanical Transit Standards">
          <div className={styles.reassuranceCard}>
            <div className={styles.reassuranceIconWrap}>
              <Layers size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.reassuranceTitle}>Moisture-Shield Packaging</h3>
            <p className={styles.reassuranceDesc}>
              Roots are coco-peat hydrated and enclosed in breathable honeycomb cardboard to maintain foliage vigor.
            </p>
          </div>

          <div className={styles.reassuranceCard}>
            <div className={styles.reassuranceIconWrap}>
              <Clock size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.reassuranceTitle}>Express Nursery Dispatch</h3>
            <p className={styles.reassuranceDesc}>
              Dispatched within 24–48 hours from Pune. Plants ship Mon–Thu so seedlings never languish in weekend courier hubs.
            </p>
          </div>

          <div className={styles.reassuranceCard}>
            <div className={styles.reassuranceIconWrap}>
              <ShieldCheck size={24} aria-hidden="true" />
            </div>
            <h3 className={styles.reassuranceTitle}>48-Hour Live Plant Guarantee</h3>
            <p className={styles.reassuranceDesc}>
              If a plant arrives damaged or wilted from interstate travel, share an unboxing photo within 48 hours for immediate replacement.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className={styles.faqSection} aria-label="Tracking Frequently Asked Questions">
          <div className={styles.faqHeader}>
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
            <p className={styles.faqSubtitle}>Everything you need to know about your botanical delivery</p>
          </div>

          <div className={styles.faqList}>
            <article className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How long does live plant delivery take across India?</h3>
              <p className={styles.faqAnswer}>
                Metro cities and Tier-1 hubs receive deliveries in 2–4 business days via dedicated express air couriers (Delhivery / Bluedart). Tier-2 and Tier-3 locations take 3–5 days. All orders ship directly from our climate-conditioned nursery in Pune, Maharashtra.
              </p>
            </article>

            <article className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>How do I know when my seeds or plants have been dispatched?</h3>
              <p className={styles.faqAnswer}>
                As soon as our nursery team inspects and packs your botanical specimens, an AWB tracking number is generated. You will receive an SMS and email with direct tracking links and live courier dispatch notifications.
              </p>
            </article>

            <article className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>What should I do immediately upon unboxing my plant?</h3>
              <p className={styles.faqAnswer}>
                Unbox immediately in a well-ventilated area. Remove the coco-peat protective wrap and place your plant in bright, indirect sunlight. Check the soil moisture: if dry to the touch, water gently until water drains from the bottom. Allow 24–48 hours for the plant to adjust to your home environment.
              </p>
            </article>

            <article className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>Can I change my delivery address or reschedule delivery?</h3>
              <p className={styles.faqAnswer}>
                Address modifications can be requested before dispatch by messaging our WhatsApp support desk at +91 80870 87224. Once the parcel is in transit, you can use the courier partner tracking link to request a reschedule.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}

export default function ShipmentTrackerPage() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '4rem 1rem', textAlign: 'center', color: '#042018' }}>
          Loading shipment tracker...
        </div>
      }
    >
      <TrackerContent />
    </Suspense>
  )
}
