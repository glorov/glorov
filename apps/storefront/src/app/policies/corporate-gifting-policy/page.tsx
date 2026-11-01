import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Gift,
  Building2,
  FileCheck2,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react'
import { PolicyNav } from '@/components/policies/PolicyNav'
import styles from '@/app/policies/PolicyPage.module.css'

export const metadata: Metadata = {
  title: 'Corporate Botanical Gifting Policy — GLOROV Botanicals',
  description:
    'Sustainable corporate gifting guidelines, MOQ tiers, statutory 0% GST on seeds (HSN 1209), multi-drop PAN-India logistics, and custom eco-branding.',
}

export default function CorporateGiftingPolicyPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Corporate Gifting Policy</span>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Gift size={14} aria-hidden="true" />
            <span>Sustainable Enterprise Gifting</span>
          </div>
          <h1 className={styles.heroTitle}>Corporate Gifting &amp; Bulk Procurement Policy</h1>
          <p className={styles.heroSubtitle}>
            Horticultural excellence, custom seed-paper branding, statutory 0% GST (HSN 1209), and direct-to-doorstep pan-India delivery.
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
              <span><strong>Policy Version:</strong> 2.4 (Enterprise 2026)</span>
              <span><strong>Corporate Support:</strong> B2B Priority Desk</span>
            </div>

            {/* Section 1: MOQ & Capacity */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Building2 size={20} color="#0a4c36" aria-hidden="true" />
                <span>1. Minimum Order Quantities (MOQ) &amp; Nursery Capacity</span>
              </h2>
              <p className={styles.paragraph}>
                At GLOROV Botanicals, our mission is to eliminate throwaway plastic corporate trinkets in favor of thriving living botanical specimens. To ensure each specimen receives individual agronomic attention prior to dispatch, our minimum order quantities are structured as follows:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Curated Gift Hampers (Living Plants + Seed Kits):</strong> Minimum Order Quantity of <strong>10 units</strong>.
                </li>
                <li>
                  <strong>Desi Heirloom Seed Grow Kits (HSN 1209):</strong> Minimum Order Quantity of <strong>25 units</strong>.
                </li>
                <li>
                  <strong>Custom Enterprise Commemorative Projects:</strong> Nursery capacity handles up to <strong>15,000 units per month</strong> with dedicated acclimatization tunnels.
                </li>
              </ul>
            </section>

            {/* Section 2: Statutory 0% GST */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <FileCheck2 size={20} color="#0a4c36" aria-hidden="true" />
                <span>2. B2B GST Compliance &amp; 0% Statutory Tax (HSN Code 1209)</span>
              </h2>
              <p className={styles.paragraph}>
                We provide fully compliant GST tax invoices formatted with your organization’s registered GSTIN, legal entity name, and billing address.
              </p>
              <div className={styles.calloutBox}>
                <h3 className={styles.calloutTitle}>Statutory GST Exemption Notice:</h3>
                <p className={styles.calloutText}>
                  Under Government of India GST Notification No. 2/2017-Central Tax (Rate), all viable organic agricultural, vegetable, and botanical seeds classified under <strong>HSN Code 1209 attract 0% GST</strong>. Corporate seed kit invoices reflect ₹0 tax for maximum procurement efficiency. Living potted plants are billed under statutory horticultural rates.
                </p>
              </div>
            </section>

            {/* Section 3: Custom Eco-Branding */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Sparkles size={20} color="#0a4c36" aria-hidden="true" />
                <span>3. Zero-Plastic Custom Branding &amp; Plantable Seed-Paper</span>
              </h2>
              <p className={styles.paragraph}>
                We do not use single-use plastics or synthetic coatings in our corporate gift packs:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Plantable Seed-Paper Note Cards:</strong> Handcrafted from recycled cotton fibers embedded with marigold or basil seeds. Recipients can plant the card in soil after reading your customized CEO message.
                </li>
                <li>
                  <strong>Biodegradable Kraft Packaging:</strong> Breathable, ventilated cartons printed with organic non-toxic soy-based inks.
                </li>
                <li>
                  <strong>Horticultural QR Care Cards:</strong> Co-branded digital care manuals guiding each employee through specific sunlight and watering schedules.
                </li>
              </ul>
            </section>

            {/* Section 4: Multi-Drop Logistics */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Truck size={20} color="#0a4c36" aria-hidden="true" />
                <span>4. Multi-Drop PAN-India Doorstep Logistics</span>
              </h2>
              <p className={styles.paragraph}>
                Whether your team is working remote across 40 different cities or gathered at a single corporate convention, we offer flexible dispatch models:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Bulk Single-Site Consignments:</strong> Palletized, climate-monitored direct delivery to corporate offices with in-person handoff.
                </li>
                <li>
                  <strong>Individual Multi-Drop Dispatches:</strong> Secure automated dispatch to individual employee home addresses across 500+ tier-1, tier-2, and tier-3 postal codes with live SMS/WhatsApp tracking for each recipient.
                </li>
              </ul>
            </section>

            {/* Section 5: Enterprise Live Guarantee */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <ShieldCheck size={20} color="#0a4c36" aria-hidden="true" />
                <span>5. The 48-Hour Live Plant Enterprise Guarantee</span>
              </h2>
              <p className={styles.paragraph}>
                Every corporate plant order is backed by our signature <strong>48-Hour Live Arrival Guarantee</strong>. In the rare event an individual employee’s plant suffers transit fatigue or breakage, we dispatch an immediate replacement specimen directly to that recipient’s address at zero cost to your organization.
              </p>
            </section>

            {/* Section 6: Lead Times & Scheduling */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Clock size={20} color="#0a4c36" aria-hidden="true" />
                <span>6. Order Lead Times &amp; Sample Approvals</span>
              </h2>
              <div className={styles.tableWrapper}>
                <table className={styles.policyTable}>
                  <thead>
                    <tr>
                      <th scope="col">Tier / Order Volume</th>
                      <th scope="col">Sample Turnaround</th>
                      <th scope="col">Dispatch Lead Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>10 – 100 Units</td>
                      <td>2 business days</td>
                      <td>3 – 5 business days</td>
                    </tr>
                    <tr>
                      <td>101 – 500 Units</td>
                      <td>3 business days</td>
                      <td>5 – 7 business days</td>
                    </tr>
                    <tr>
                      <td>501 – 2,500 Units</td>
                      <td>4 business days</td>
                      <td>7 – 10 business days</td>
                    </tr>
                    <tr>
                      <td>2,500+ Units (Enterprise)</td>
                      <td>Dedicated Prototype Batch</td>
                      <td>12 – 15 business days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* B2B Concierge CTA */}
            <div className={styles.calloutBox} style={{ marginTop: '2.5rem' }}>
              <h3 className={styles.calloutTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="#0a4c36" />
                <span>Need a Custom Enterprise Proposal?</span>
              </h3>
              <p className={styles.calloutText}>
                Speak directly with our B2B Botanical Concierge team at <strong>corporate@glorov.in</strong> or WhatsApp us at <strong>+91 80870 87224</strong>. We provide instant mockups, digital quotes, and physical sample boxes within 48 hours.
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}
