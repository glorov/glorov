import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { RotateCcw, ShieldCheck, HeartHandshake, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PolicyNav } from '@/components/policies/PolicyNav'
import styles from '@/app/policies/PolicyPage.module.css'

export const metadata: Metadata = {
  title: 'Cancellations & Replacement Policy — GLOROV Botanicals',
  description: '48-Hour live plant transit guarantee, seed germination warranty, and cancellation terms.',
}

export default function RefundPolicyPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Cancellations &amp; Replacement Policy</span>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <RotateCcw size={14} aria-hidden="true" />
            <span>Botanical Health Guarantee</span>
          </div>
          <h1 className={styles.heroTitle}>Cancellations &amp; Replacement Policy</h1>
          <p className={styles.heroSubtitle}>
            Our 48-hour live plant arrival guarantee and 100% certified organic seed viability shield.
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
              <span><strong>Resolution Window:</strong> 48 Hours from Delivery</span>
            </div>

            {/* Section 1: 48-Hour Guarantee */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <ShieldCheck size={20} color="#0a4c36" aria-hidden="true" />
                <span>1. The 48-Hour Live Plant Arrival Guarantee</span>
              </h2>
              <p className={styles.paragraph}>
                We take immense pride in propagating healthy specimens at our Pune nursery. However, living plants can occasionally undergo severe stress, branch breakage, or thermal dehydration during couriered transit.
              </p>
              <p className={styles.paragraph}>
                If your plant arrives dead on arrival (DOA), suffering irreparable trunk fracture, or irreversible root rot, you are protected under our unconditional <strong>48-Hour Live Arrival Guarantee</strong>:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Free Immediate Replacement:</strong> We dispatch a replacement specimen from our nursery at zero additional courier or plant cost to you.
                </li>
                <li>
                  <strong>Store Credit / Full Refund:</strong> If the botanical variety is out of season or stock, an immediate full refund is issued back to your original payment method.
                </li>
              </ul>
            </section>

            {/* Callout: Simple 3-step claim */}
            <div className={styles.calloutBox}>
              <h3 className={styles.calloutTitle}>How to Submit a Transit Replacement Claim:</h3>
              <p className={styles.calloutText}>
                Within 48 hours of delivery, simply take 2 clear photographs of the damaged plant and outer packaging label. Send them via WhatsApp to <strong>+91 80870 87224</strong> or email <strong>support@glorov.in</strong> with your Order ID. Our horticulturists verify and approve claims within 4 business hours.
              </p>
            </div>

            {/* Section 2: Why Plants are Perishable (No Physical Returns) */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <AlertCircle size={20} color="#0a4c36" aria-hidden="true" />
                <span>2. Perishable Botanical Policy (No Reverse Shipping Required)</span>
              </h2>
              <p className={styles.paragraph}>
                Unlike electronics or clothing, returning a damaged living plant back through reverse courier transit will inevitably result in the death of the specimen due to prolonged packaging darkness.
              </p>
              <p className={styles.paragraph}>
                Therefore, <strong>we do not ask you to ship the plant back</strong>. Once your claim is validated with unboxing photos, we send your replacement or process your refund immediately. If our botanist assesses that the plant can be revived with minor trimming and watering, we guide you through step-by-step recovery while safeguarding your guarantee.
              </p>
            </section>

            {/* Section 3: Seed Viability & Germination Guarantee */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <CheckCircle2 size={20} color="#0a4c36" aria-hidden="true" />
                <span>3. Seed Viability &amp; Germination Shield</span>
              </h2>
              <p className={styles.paragraph}>
                All GLOROV seeds are indigenous (desi), open-pollinated, non-GMO, and tested for minimum 80% to 90% germination rates under standard horticultural moisture conditions.
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Sealed Foil Packaging:</strong> Seeds are triple-layer aluminum hermetically packed to protect embryological viability from atmospheric moisture.
                </li>
                <li>
                  <strong>Sowing Support:</strong> If you follow the sowing guide on your seed packet and experience zero germination within the specified germination period (typically 7–14 days), notify our team for free replacement seeds and expert potting medium advice.
                </li>
              </ul>
            </section>

            {/* Section 4: Cancellation Policy */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <RotateCcw size={20} color="#0a4c36" aria-hidden="true" />
                <span>4. Cancellation Policy</span>
              </h2>
              <p className={styles.paragraph}>
                You can cancel your order anytime before it has been packaged and assigned an Air Waybill (AWB) at our Pune nursery:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Before Nursery Packaging:</strong> Full 100% refund processed immediately with zero cancellation fees. You can click &quot;Cancel Order&quot; directly in <Link href="/account/orders" style={{ color: '#0a4c36', fontWeight: 600, textDecoration: 'underline' }}>My Orders</Link>.
                </li>
                <li>
                  <strong>After Courier Handover:</strong> Once an order is handed to the air courier partner, live transit cannot be intercepted. In such cases, the parcel will be delivered and covered under our 48-Hour Live Plant Guarantee.
                </li>
              </ul>
            </section>

            {/* Section 5: Refund Timelines */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <HeartHandshake size={20} color="#0a4c36" aria-hidden="true" />
                <span>5. Refund Processing Timelines</span>
              </h2>
              <p className={styles.paragraph}>
                Approved refunds are initiated immediately by our billing desk:
              </p>
              <ul className={styles.bulletList}>
                <li><strong>UPI &amp; Net Banking:</strong> 24 to 48 hours to reflect in your bank account.</li>
                <li><strong>Credit / Debit Cards:</strong> 3 to 5 business days depending on your issuing bank.</li>
                <li><strong>Cash on Delivery (COD):</strong> Transferred via instant UPI / NEFT upon customer sharing bank details.</li>
              </ul>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
