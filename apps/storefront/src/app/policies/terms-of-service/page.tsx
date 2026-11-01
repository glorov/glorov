import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck, Scale, CreditCard, AlertCircle, Sparkles } from 'lucide-react'
import { PolicyNav } from '@/components/policies/PolicyNav'
import styles from '@/app/policies/PolicyPage.module.css'

export const metadata: Metadata = {
  title: 'Terms of Service — GLOROV Botanicals',
  description: 'Terms of service, statutory GST 0% agricultural exemptions (HSN 1209), and conditions of use.',
}

export default function TermsOfServicePage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Terms of Service</span>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Scale size={14} aria-hidden="true" />
            <span>Statutory Compliance &amp; Governance</span>
          </div>
          <h1 className={styles.heroTitle}>Terms of Botanical Service</h1>
          <p className={styles.heroSubtitle}>
            Statutory Indian agricultural guidelines, tax exemption details, and purchase conditions.
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
              <span><strong>Governing Law:</strong> Republic of India (Jurisdiction: Pune, Maharashtra)</span>
            </div>

            {/* Section 1: Overview & Botanical Scope */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Sparkles size={20} color="#0a4c36" aria-hidden="true" />
                <span>1. Overview &amp; Botanical Product Scope</span>
              </h2>
              <p className={styles.paragraph}>
                Welcome to GLOROV Botanicals (&quot;GLOROV&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By browsing or purchasing through glorov.in, you agree to comply with and be bound by the following terms and conditions of use.
              </p>
              <p className={styles.paragraph}>
                GLOROV specializes exclusively in <strong>living plants and certified organic seeds</strong>. In accordance with our sustainable mission, our catalog strictly excludes synthetic chemical pesticides, toxic synthetic fertilizers, and non-biodegradable plastics.
              </p>
            </section>

            {/* Section 2: Statutory Indian GST 0% on Agricultural Seeds */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Scale size={20} color="#0a4c36" aria-hidden="true" />
                <span>2. Statutory GST Compliance &amp; 0% Seed Exemption</span>
              </h2>
              <p className={styles.paragraph}>
                We maintain complete transparency in our billing and statutory compliance under the Goods and Services Tax (GST) laws of India:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>0% GST on Seeds (HSN Code 1209):</strong> Agricultural, vegetable, herb, and flower seeds for sowing are legally exempt from Goods and Services Tax (GST rate: 0.00%) under Notification No. 02/2017-Central Tax (Rate). No GST is billed or charged on seed items.
                </li>
                <li>
                  <strong>Live Botanical Plants:</strong> Living indoor and outdoor potted plants are billed with applicable statutory GST included in the final displayed item price.
                </li>
                <li>
                  <strong>Formal Tax Invoices:</strong> Every customer receives an itemized digital GST invoice showing HSN classifications upon dispatch.
                </li>
              </ul>
            </section>

            {/* Callout Box */}
            <div className={styles.calloutBox}>
              <h3 className={styles.calloutTitle}>Statutory HSN Classification Summary</h3>
              <p className={styles.calloutText}>
                HSN 1209: Seeds, fruit and spores, of a kind used for sowing (Exempt from GST @ 0%). HSN 0602: Other live plants (including their roots), cuttings and slips; mushroom spawn.
              </p>
            </div>

            {/* Section 3: Pricing, Orders & Cash on Delivery */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <CreditCard size={20} color="#0a4c36" aria-hidden="true" />
                <span>3. Payment Terms &amp; COD Safety Guardrails</span>
              </h2>
              <p className={styles.paragraph}>
                All product prices are quoted in Indian Rupees (INR ₹). We accept payments through secure verified channels including Razorpay (UPI, Google Pay, PhonePe, Net Banking, Credit and Debit Cards) and Cash on Delivery (COD).
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Cash on Delivery (COD) Limit:</strong> To protect living botanical specimens from courier refusal and transit perishability, COD is available for orders up to a maximum value of <strong>₹5,000</strong>. Orders exceeding ₹5,000 require prepaid digital settlement.
                </li>
                <li>
                  <strong>Order Verification:</strong> First-time COD orders may receive an automated WhatsApp confirmation prompt before dispatch from our Pune nursery.
                </li>
              </ul>
            </section>

            {/* Section 4: Horticultural Nature of Products */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <AlertCircle size={20} color="#0a4c36" aria-hidden="true" />
                <span>4. Natural Variations &amp; Horticultural Disclaimers</span>
              </h2>
              <p className={styles.paragraph}>
                Living plants are unique biological organisms. Photographs shown on our website represent mature, healthy specimens grown under optimal Pune nursery conditions. Natural variations in foliage variegation, leaf count, branching structure, and seasonal flowering status are normal and celebrated characteristics of living botany.
              </p>
              <p className={styles.paragraph}>
                Germination of organic seeds depends upon environmental factors including soil temperature, sowing depth, sunlight exposure, and hydration discipline. While our seeds are tested for high viability (80%+ germination), GLOROV cannot guarantee identical yields under improper sowing conditions, though our botanical helpdesk is always ready to advise you.
              </p>
            </section>

            {/* Section 5: Jurisdiction */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <ShieldCheck size={20} color="#0a4c36" aria-hidden="true" />
                <span>5. Governing Law &amp; Jurisdiction</span>
              </h2>
              <p className={styles.paragraph}>
                These Terms of Service are governed by and construed in accordance with the substantive laws of India. Any disputes arising in connection with orders or website use shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
