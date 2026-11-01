'use client'

import React, { useState } from 'react'
import {
  Truck,
  ShieldAlert,
  Headphones,
  ChevronDown,
  Clock,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react'
import styles from './ProductTrustAndPolicies.module.css'

interface ProductTrustAndPoliciesProps {
  isPerishable?: boolean
  categoryName?: string
}

export function ProductTrustAndPolicies({
  isPerishable = false,
  categoryName = 'Seeds',
}: ProductTrustAndPoliciesProps) {
  const [openSection, setOpenSection] = useState<'shipping' | 'returns' | 'support' | null>('shipping')

  const toggleSection = (section: 'shipping' | 'returns' | 'support') => {
    setOpenSection(openSection === section ? null : section)
  }

  return (
    <section aria-labelledby="store-policies-heading" className={styles.container}>
      <div className={styles.header}>
        <h2
          id="store-policies-heading"
          className={styles.title}
        >
          Delivery, Guarantees &amp; Customer Support
        </h2>
        <p className={styles.subtitle}>
          Transparent fulfilment logistics and care policies dispatched directly from our Pune nursery hub.
        </p>
      </div>

      <div className={styles.accordionList}>
        {/* Section 1: Shipping & Delivery Expectations */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleSection('shipping')}
            aria-expanded={openSection === 'shipping'}
            className={styles.accordionButton}
          >
            <div className={styles.buttonContent}>
              <div className={styles.iconWrap}>
                <Truck size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className={styles.buttonHeading}>
                  Shipping Logistics &amp; Transit Expectations
                </h3>
                <p className={styles.buttonSubtext}>
                  Dispatched from Pune Hub (PIN 411001) across all serviceable Indian PIN codes
                </p>
              </div>
            </div>
            <ChevronDown
              className={`${styles.chevronIcon} ${openSection === 'shipping' ? styles.chevronOpen : ''}`}
            />
          </button>

          {openSection === 'shipping' && (
            <div className={styles.accordionBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardTitle}>
                    <Clock size={14} style={{ color: 'var(--ugaoo-maroon)' }} />
                    Dispatch Timeline
                  </span>
                  <p className={styles.infoCardText}>
                    Orders are viability-inspected, packed, and handed to national couriers within 24–48 hours (Mon–Sat).
                  </p>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoCardTitle}>
                    <PackageCheck size={14} style={{ color: 'var(--ugaoo-maroon)' }} />
                    Protective Packaging
                  </span>
                  <p className={styles.infoCardText}>
                    {isPerishable
                      ? 'Custom ventilated corrugated shippers with root coco-peat moisture wrap to survive express transit.'
                      : 'Hermetically heat-sealed aluminum barrier pouches with food-grade desiccant to prevent moisture ingress.'}
                  </p>
                </div>
              </div>

              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p>• <strong>Express Air (Live Plants &amp; Priority Seeds):</strong> Estimated 2–4 business days delivery to metro and tier-1 destinations.</p>
                <p>• <strong>Standard Surface:</strong> Estimated 4–7 business days pan-India coverage via India Post, Bluedart, or Delhivery.</p>
                <p>• <strong>Free Shipping:</strong> Automatically applied to all seed and plant orders exceeding ₹499.</p>
                <p>• Real-time AWB tracking numbers from courier partners (e.g., Shiprocket) are provided upon dispatch via email and account orders tab.</p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Returns & Transit Damage Replacement */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleSection('returns')}
            aria-expanded={openSection === 'returns'}
            className={styles.accordionButton}
          >
            <div className={styles.buttonContent}>
              <div className={styles.iconWrap}>
                <ShieldAlert size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className={styles.buttonHeading}>
                  Transit Damage Replacement &amp; Perishables Policy
                </h3>
                <p className={styles.buttonSubtext}>
                  48-hour transit damage replacement guarantee on living botanicals &amp; sealed seed packets
                </p>
              </div>
            </div>
            <ChevronDown
              className={`${styles.chevronIcon} ${openSection === 'returns' ? styles.chevronOpen : ''}`}
            />
          </button>

          {openSection === 'returns' && (
            <div className={styles.accordionBody}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #fcd34d', backgroundColor: '#fffbeb', color: '#78350f', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.75rem' }}>
                <AlertTriangle size={16} style={{ color: '#b45309', flexShrink: 0 }} />
                <span>Due to the biological and perishable nature of {categoryName.toLowerCase()}, routine remorse returns are not accepted once packages are unsealed.</span>
              </div>

              <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ fontWeight: 700, margin: 0 }}>What is covered for free replacement:</p>
                <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
                  <li>Damaged, crushed, or waterlogged parcels upon initial delivery.</li>
                  <li>Live plants showing terminal stem or root rot incurred strictly during transit delays.</li>
                  <li>Mismatched botanical variety or incorrect variant packet size delivered.</li>
                </ul>

                <p style={{ marginTop: '4px' }}>
                  <strong>Reporting Process:</strong> Please email <a href="mailto:support@glorov.in" style={{ color: 'var(--ugaoo-maroon)', fontWeight: 600 }}>support@glorov.in</a> within <strong>48 hours of delivery</strong> with unboxing photographs or video showing the shipping label and condition.
                </p>

                <p style={{ fontSize: '10px', color: 'var(--ugaoo-text-muted)', fontStyle: 'italic', margin: '4px 0 0 0' }}>
                  [Store Owner Notice: Final refund and warranty claims are governed by GLOROV Terms of Service. Germination guarantees cannot be made unconditionally due to customer soil and climate variations.]
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Gardening Helpdesk & Order Support */}
        <div className={styles.accordionItem}>
          <button
            type="button"
            onClick={() => toggleSection('support')}
            aria-expanded={openSection === 'support'}
            className={styles.accordionButton}
          >
            <div className={styles.buttonContent}>
              <div className={styles.iconWrap}>
                <Headphones size={20} aria-hidden="true" />
              </div>
              <div>
                <h3 className={styles.buttonHeading}>
                  Gardening Helpdesk &amp; Order Support
                </h3>
                <p className={styles.buttonSubtext}>
                  Direct advice from our nursery agronomists via email and WhatsApp (Mon–Sat, 9 AM – 6 PM IST)
                </p>
              </div>
            </div>
            <ChevronDown
              className={`${styles.chevronIcon} ${openSection === 'support' ? styles.chevronOpen : ''}`}
            />
          </button>

          {openSection === 'support' && (
            <div className={styles.accordionBody}>
              <p>
                Need guidance on soil preparation, sowing depth, or transplanting this specimen? Our Pune horticultural team is happy to assist.
              </p>
              <div className={styles.infoGrid} style={{ marginTop: '0.75rem' }}>
                <div className={styles.infoCard}>
                  <span className={styles.infoCardTitle}>Email Support</span>
                  <a
                    href="mailto:support@glorov.in"
                    style={{ color: 'var(--ugaoo-maroon)', fontWeight: 600, fontSize: '12px' }}
                  >
                    support@glorov.in
                  </a>
                  <p className={styles.infoCardText}>Responses within 12–24 business hours</p>
                </div>

                <div className={styles.infoCard}>
                  <span className={styles.infoCardTitle}>Operating Hours</span>
                  <p style={{ fontSize: '12px', fontWeight: 600, margin: '2px 0' }}>Monday to Saturday: 9:00 AM – 6:00 PM IST</p>
                  <p className={styles.infoCardText}>Closed on national Indian holidays</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
