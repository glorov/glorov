import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, ShieldCheck, EyeOff, Server, UserCheck, Mail } from 'lucide-react'
import { PolicyNav } from '@/components/policies/PolicyNav'
import styles from '@/app/policies/PolicyPage.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy — GLOROV Botanicals',
  description: 'Digital Personal Data Protection Act (DPDP 2023) compliant privacy policy, data security, and customer rights.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className={styles.pageContainer}>
      {/* 1. Breadcrumb Bar */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumbBar}>
        <div className={styles.breadcrumbContainer}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSep}>/</span>
          <span className={styles.breadcrumbCurrent}>Privacy Policy</span>
        </div>
      </nav>

      {/* 2. Hero Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Lock size={14} aria-hidden="true" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
          <h1 className={styles.heroTitle}>Privacy &amp; Data Protection Policy</h1>
          <p className={styles.heroSubtitle}>
            How GLOROV protects your personal data, shipping information, and digital privacy.
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
              <span><strong>Compliance Standard:</strong> Indian Digital Personal Data Protection Act, 2023</span>
            </div>

            {/* Section 1: Data Minimization */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <ShieldCheck size={20} color="#0a4c36" aria-hidden="true" />
                <span>1. Data Collection &amp; Strict Minimization</span>
              </h2>
              <p className={styles.paragraph}>
                GLOROV Botanicals respects your privacy and adheres to the principles of purpose limitation and data minimization under the Digital Personal Data Protection Act, 2023 (DPDP). We collect only information strictly necessary to fulfill botanical orders:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Contact &amp; Delivery Details:</strong> Full name, delivery shipping address, 6-digit Indian PIN code, mobile telephone number, and email address for Air Waybill (AWB) generation and SMS tracking.
                </li>
                <li>
                  <strong>Account Credentials:</strong> Securely salted and hashed authentication credentials if you choose to create a customer account.
                </li>
                <li>
                  <strong>Payment Data:</strong> Payment card details, UPI Virtual Payment Addresses (VPAs), and net banking credentials are <em>never</em> stored on our servers. All financial transactions are processed directly via PCI-DSS compliant gateways (Razorpay).
                </li>
              </ul>
            </section>

            {/* Callout Box: Zero Ad Retargeting / No Data Sale */}
            <div className={styles.calloutBox}>
              <h3 className={styles.calloutTitle}>Our Zero-Sale Privacy Pledge</h3>
              <p className={styles.calloutText}>
                We do not sell, rent, lease, or monetize customer telephone numbers, email addresses, or physical delivery addresses to third-party marketing brokers or ad networks. Your details are used strictly for delivering living plants and seeds to your home.
              </p>
            </div>

            {/* Section 2: How Data is Used */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Server size={20} color="#0a4c36" aria-hidden="true" />
                <span>2. Authorized Purposes of Processing</span>
              </h2>
              <p className={styles.paragraph}>
                We process your personal information exclusively for the following lawful purposes:
              </p>
              <ul className={styles.bulletList}>
                <li>Generating courier shipping labels with our logistics partners (Delhivery, Bluedart, Shiprocket).</li>
                <li>Sending transactional order confirmation emails, delivery tracking SMS, and WhatsApp plant transit updates.</li>
                <li>Providing personalized plant care advice and botanical replacement claim assistance via our Pune nursery desk.</li>
                <li>Preventing payment fraud and enforcing Cash on Delivery safety thresholds.</li>
              </ul>
            </section>

            {/* Section 3: Data Security Standards */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <EyeOff size={20} color="#0a4c36" aria-hidden="true" />
                <span>3. Encryption &amp; Security Standards</span>
              </h2>
              <p className={styles.paragraph}>
                All communication between your browser and our storefront is protected by TLS 1.3 encryption with modern forward secrecy. Customer account tokens are issued via secure, HttpOnly, SameSite cookies to protect against cross-site scripting (XSS) and token exfiltration.
              </p>
            </section>

            {/* Section 4: Customer Rights & Erasure */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <UserCheck size={20} color="#0a4c36" aria-hidden="true" />
                <span>4. Your Data Rights &amp; Erasure Requests</span>
              </h2>
              <p className={styles.paragraph}>
                Under the DPDP Act 2023, you have the right to access, rectify, or request deletion of your personal data stored with us:
              </p>
              <ul className={styles.bulletList}>
                <li>
                  <strong>Address Book Management:</strong> You can edit or remove saved shipping addresses at any time in your <Link href="/account/addresses" style={{ color: '#0a4c36', fontWeight: 600, textDecoration: 'underline' }}>Account Addresses</Link> dashboard.
                </li>
                <li>
                  <strong>Right to Erasure:</strong> To request complete deletion of your account and customer history, write to our Data Protection Officer at <strong>privacy@glorov.in</strong> or <strong>support@glorov.in</strong> with the subject line &quot;Data Erasure Request&quot;. Requests are processed within 7 business days.
                </li>
              </ul>
            </section>

            {/* Section 5: Grievance Officer */}
            <section className={styles.articleSection}>
              <h2 className={styles.sectionHeading}>
                <Mail size={20} color="#0a4c36" aria-hidden="true" />
                <span>5. Grievance Redressal</span>
              </h2>
              <p className={styles.paragraph}>
                In accordance with Indian Information Technology regulations, any privacy grievances or questions may be directed to:
              </p>
              <p className={styles.paragraph}>
                <strong>Grievance Officer:</strong> Horticultural Operations &amp; Data Compliance<br />
                <strong>Entity:</strong> GLOROV Botanicals Private Limited<br />
                <strong>Address:</strong> Pune Central Nursery Hub, Maharashtra 411001<br />
                <strong>Email:</strong> privacy@glorov.in / support@glorov.in
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
