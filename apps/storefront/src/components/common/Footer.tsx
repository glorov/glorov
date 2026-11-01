'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import styles from './Footer.module.css'

interface PolicyModalContent {
  title: string
  subtitle: string
  content: React.ReactNode
}

const POLICY_DATA: Record<string, PolicyModalContent> = {
  shipping: {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Storefront Logistics Policy',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', lineHeight: 1.6, color: 'rgba(4, 32, 24, 0.8)' }}>
        <p>
          GLOROV dispatches botanical parcels directly from our propagation nursery in Pune, Maharashtra (PIN 411001).
        </p>
        <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fef8ec', border: '1px solid #e6ded2' }}>
          <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0', color: '#042018' }}>Standard Delivery (India):</p>
          <p style={{ margin: 0 }}>₹49 flat rate for non-perishable seeds and gardening supplies. Free for orders qualifying above ₹499.</p>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: '#fef8ec', border: '1px solid #e6ded2' }}>
          <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0', color: '#042018' }}>Express Botanical Delivery (Air):</p>
          <p style={{ margin: 0 }}>₹99 dedicated air courier for live potted plants to minimize transit duration.</p>
        </div>
        <p>
          Tracking details are shared via email once dispatched. Live plants are dispatched on business days to avoid weekend holding in courier transit hubs.
        </p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <Link href="/policies/shipping-policy" style={{ color: '#0a4c36', fontWeight: 700, textDecoration: 'underline' }}>
            View Full Dedicated Shipping Policy Page →
          </Link>
        </p>
      </div>
    ),
  },
  'live-plants': {
    title: 'Live Plant Transit Guidelines',
    subtitle: 'Storefront Horticultural Care',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', lineHeight: 1.6, color: 'rgba(4, 32, 24, 0.8)' }}>
        <p>Every live botanical plant is conditioned before shipment to withstand interstate travel.</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong>Root Hydration:</strong> Roots are encased in aerated coco-peat wrap to maintain moisture balance.</li>
          <li><strong>Ventilated Crating:</strong> Breathable, shock-absorbing outer cartons protect foliage from physical crush.</li>
          <li><strong>Post-Transit Care:</strong> Upon unboxing, place plants in bright indirect sunlight for 48 hours and hydrate gently.</li>
        </ul>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <Link href="/policies/refund-policy" style={{ color: '#0a4c36', fontWeight: 700, textDecoration: 'underline' }}>
            View 48-Hour Live Plant Guarantee Details →
          </Link>
        </p>
      </div>
    ),
  },
  returns: {
    title: 'Cancellations & Replacements',
    subtitle: 'Storefront Support Policy',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', lineHeight: 1.6, color: 'rgba(4, 32, 24, 0.8)' }}>
        <p>We want your garden to thrive. Due to the perishable nature of live botanicals:</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong>Unshipped Orders:</strong> Orders may be cancelled anytime prior to packaging at our Pune nursery.</li>
          <li><strong>Transit Concerns:</strong> If a live plant arrives severely damaged or wilted, email our support team with delivery photographs within 24 hours of arrival.</li>
          <li><strong>Replacement Dispatch:</strong> Verified transit damaged items will be replaced or refunded promptly.</li>
        </ul>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <Link href="/policies/refund-policy" style={{ color: '#0a4c36', fontWeight: 700, textDecoration: 'underline' }}>
            View Complete Cancellations &amp; Replacement Policy →
          </Link>
        </p>
      </div>
    ),
  },
  payments: {
    title: 'Statutory GST & Payment Terms',
    subtitle: 'Storefront Invoicing Details',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', lineHeight: 1.6, color: 'rgba(4, 32, 24, 0.8)' }}>
        <p>Transparent Indian invoicing on all GLOROV purchases:</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong>Agricultural Seeds:</strong> Exempt from GST (0% rate under statutory HSN Code 1209).</li>
          <li><strong>Live Plants:</strong> Applicable GST included in displayed prices according to statutory schedules.</li>
          <li><strong>Payment Methods:</strong> Card payments, UPI, and Cash on Delivery (COD) subject to verification.</li>
        </ul>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <Link href="/policies/terms-of-service" style={{ color: '#0a4c36', fontWeight: 700, textDecoration: 'underline' }}>
            View Full Terms of Botanical Service →
          </Link>
        </p>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy & Data Protection',
    subtitle: 'Storefront Privacy Policy',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', lineHeight: 1.6, color: 'rgba(4, 32, 24, 0.8)' }}>
        <p>GLOROV respects your personal information and operates in accordance with applicable Indian digital data protection standards (DPDP Act 2023).</p>
        <p>We collect shipping addresses, mobile numbers, and email IDs exclusively for processing orders and generating delivery waybills.</p>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <Link href="/policies/privacy-policy" style={{ color: '#0a4c36', fontWeight: 700, textDecoration: 'underline' }}>
            View Full Privacy &amp; Data Protection Policy →
          </Link>
        </p>
      </div>
    ),
  },
  support: {
    title: 'Customer Support Desk',
    subtitle: 'Storefront Contact Details',
    content: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', lineHeight: 1.6, color: 'rgba(4, 32, 24, 0.8)' }}>
        <p>Need help choosing seed varieties, selecting suitable indoor plants, or checking your order status?</p>
        <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: '#fef8ec', border: '1px solid #e6ded2' }}>
          <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0', color: '#042018' }}>Customer Care Team</p>
          <p style={{ margin: '0 0 0.25rem 0' }}><strong>Email:</strong> support@glorov.in</p>
          <p style={{ margin: '0 0 0.25rem 0' }}><strong>Hours:</strong> Monday – Saturday, 9:30 AM – 6:30 PM IST</p>
          <p style={{ margin: 0 }}><strong>Dispatch Hub:</strong> Pune Nursery, Maharashtra — 411001</p>
        </div>
        <p style={{ margin: '0.5rem 0 0 0' }}>
          <Link href="/contact" style={{ color: '#0a4c36', fontWeight: 700, textDecoration: 'underline' }}>
            Open Dedicated Contact &amp; Inquiry Page →
          </Link>
        </p>
      </div>
    ),
  },
}

export function Footer() {
  const pathname = usePathname()
  const [activePolicyKey, setActivePolicyKey] = useState<string | null>(null)
  const activePolicy = activePolicyKey ? POLICY_DATA[activePolicyKey] : null

  // Hide the footer on category, cart, and account pages as requested
  const isCategoryPage = pathname?.startsWith('/categories') || pathname?.startsWith('/category')
  const isCartPage = pathname === '/cart' || pathname?.startsWith('/cart')
  const isAccountPage = pathname?.startsWith('/account')

  if (isCategoryPage || isCartPage || isAccountPage) {
    return null
  }

  return (
    <footer className={styles.footerWrapper} role="contentinfo">
      {/* 1. Ugaoo-Style WhatsApp Plant Care Banner */}
      <div className={styles.careBannerSection}>
        <div className={styles.careBannerContainer}>
          <div className={styles.careBannerCard}>
            <div>
              <h2 className={styles.careTitle}>Stuck with plant care?</h2>
              <p className={styles.careSubtitle}>We&apos;re here to help</p>
            </div>
            <a
              href="https://wa.me/918087087224?text=Hi!+I+need+help+with+plant+care+from+GLOROV"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.chatButton}
            >
              <span>Chat With Us</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links Container */}
      <div className={styles.mainFooterArea}>
        <div className={styles.footerGrid}>
          {/* Col 1: Brand & Nursery Summary */}
          <div className={styles.brandCol}>
            <div className={styles.logoRow}>
              <Link href="/" aria-label="GLOROV Homepage" className={styles.logoLink}>
                <Image
                  src="/glorov-logo.svg"
                  alt="GLOROV"
                  width={140}
                  height={38}
                  className={styles.footerLogo}
                />
              </Link>
              <span className={styles.brandPill}>BOTANICALS</span>
            </div>
            <p className={styles.brandDesc}>
              Cultivating green vitality with heirloom desi seeds and climate-conditioned living indoor plants dispatched directly from our propagation nursery in Pune, Maharashtra.
            </p>
            <div className={styles.nurseryInfo}>
              <p className={styles.nurseryHeading}>GLOROV Botanical Storefront</p>
              <p style={{ margin: 0 }}>Pune Dispatch Nursery, Maharashtra — 411001</p>
              <button
                type="button"
                onClick={() => setActivePolicyKey('support')}
                className={styles.policyBtn}
                style={{ marginTop: '0.35rem', textAlign: 'left' }}
              >
                Pune Plant Expert Helpdesk
              </button>
            </div>
          </div>

          {/* Col 2: Plants & Seeds Navigation */}
          <div className={styles.navCol}>
            <h3 className={styles.colHeading}>Botanical Catalog</h3>
            <ul className={styles.linkList}>
              <li><Link href="/categories/seeds" className={styles.footerLink}>Vegetable Seeds (Desi)</Link></li>
              <li><Link href="/categories/seeds/flower-seeds" className={styles.footerLink}>Festive Flower Seeds</Link></li>
              <li><Link href="/categories/seeds/herb-seeds" className={styles.footerLink}>Medicinal Herb Seeds</Link></li>
              <li><Link href="/categories/live-plants" className={styles.footerLink}>Indoor Living Plants</Link></li>
              <li><Link href="/categories/live-plants/air-purifying" className={styles.footerLink}>Air-Purifying Botanicals</Link></li>
              <li><Link href="/sowing-calendar" className={styles.footerLink}>Indian Sowing Calendar</Link></li>
              <li><Link href="/gifting" className={styles.footerLink}>Corporate &amp; Green Gifting</Link></li>
              <li><Link href="/gift-builder" className={styles.footerLink}>Custom Gift Hamper Builder</Link></li>
              <li><Link href="/care-companion" className={styles.footerLink}>Plant Care Companion &amp; Hydration</Link></li>
              <li><Link href="/community" className={styles.footerLink}>Botanical Community Stories</Link></li>
              <li><Link href="/plant-parent-club" className={styles.footerLink}>Plant Parent Rewards Club</Link></li>
              <li><Link href="/offers" className={styles.footerLink}>Offers &amp; Promo Coupons</Link></li>
              <li><Link href="/plant-finder" className={styles.footerLink}>Plant Finder Matcher</Link></li>
              <li><Link href="/plant-doctor" className={styles.footerLink}>Plant Doctor Clinic</Link></li>
              <li><Link href="/garden-services" className={styles.footerLink}>Garden Services &amp; Maintenance</Link></li>
              <li><Link href="/subscriptions" className={styles.footerLink}>Green Routine Subscriptions</Link></li>
              <li><Link href="/stores" className={styles.footerLink}>Botanical Studios &amp; Stores</Link></li>
              <li><Link href="/blog" className={styles.footerLink}>Botanical Chronicles (Blog)</Link></li>
              <li><Link href="/nursery" className={styles.footerLink}>Visit Pune Mother Nursery</Link></li>
              <li><Link href="/store" className={styles.footerLink}>View All Specimens</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Care & Tracking */}
          <div className={styles.navCol}>
            <h3 className={styles.colHeading}>Customer Care</h3>
            <ul className={styles.linkList}>
              <li><Link href="/shipping/tracker" className={styles.footerLink}>Track Your Order</Link></li>
              <li><Link href="/faq" className={styles.footerLink}>Plant Care &amp; FAQ</Link></li>
              <li><Link href="/wishlist" className={styles.footerLink}>Saved Botanical Notebook</Link></li>
              <li><Link href="/account" className={styles.footerLink}>My Account &amp; Past Orders</Link></li>
              <li><Link href="/gardening-guide" className={styles.footerLink}>Horticultural Guide</Link></li>
              <li><button type="button" onClick={() => setActivePolicyKey('support')} className={styles.policyBtn}>Contact Customer Support</button></li>
              <li><button type="button" onClick={() => setActivePolicyKey('shipping')} className={styles.policyBtn}>Shipping &amp; Delivery Policy</button></li>
              <li><button type="button" onClick={() => setActivePolicyKey('returns')} className={styles.policyBtn}>Cancellations &amp; Returns Policy</button></li>
            </ul>
          </div>

          {/* Col 4: Trust & Policies */}
          <div className={styles.navCol}>
            <h3 className={styles.colHeading}>Statutory &amp; Trust</h3>
            <ul className={styles.linkList}>
              <li><Link href="/about" className={styles.footerLink}>About GLOROV &amp; Pune Nursery</Link></li>
              <li><Link href="/why-glorov" className={styles.footerLink}>Why GLOROV (Quality Benchmark)</Link></li>
              <li><Link href="/careers" className={styles.footerLink}>Careers &amp; Opportunities</Link></li>
              <li><Link href="/policies/corporate-gifting-policy" className={styles.footerLink}>Corporate Gifting Policy</Link></li>
              <li><button type="button" onClick={() => setActivePolicyKey('live-plants')} className={styles.policyBtn}>Transit Guarantee Policy</button></li>
              <li><button type="button" onClick={() => setActivePolicyKey('payments')} className={styles.policyBtn}>0% GST on Seeds (HSN 1209)</button></li>
              <li><button type="button" onClick={() => setActivePolicyKey('privacy')} className={styles.policyBtn}>Privacy &amp; Data Protection Policy</button></li>
              <li><Link href="/cart" className={styles.footerLink}>Shopping Cart</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal Bar */}
      <div className={styles.bottomLegalBar}>
        <div className={styles.bottomLegalContainer}>
          <div>
            © {new Date().getFullYear()} GLOROV Botanicals Private Limited. All rights reserved.
          </div>
          <div>
            Dispatched fresh from Pune Nursery • Safe-Transit Plant &amp; Seed Packaging
          </div>
        </div>
      </div>

      {/* Policy Dialog Modal */}
      {activePolicy && (
        <Dialog open={Boolean(activePolicyKey)} onOpenChange={(open) => !open && setActivePolicyKey(null)}>
          <DialogContent className={styles.policyModalContent}>
            <DialogHeader>
              <DialogTitle className={styles.policyModalTitle}>
                {activePolicy.title}
              </DialogTitle>
              <DialogDescription className={styles.policyModalDescription}>
                {activePolicy.subtitle}
              </DialogDescription>
            </DialogHeader>
            <div className={styles.policyModalBody}>
              {activePolicy.content}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </footer>
  )
}
