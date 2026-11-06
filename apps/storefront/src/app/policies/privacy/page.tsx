import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import {
  GlorovPolicyLayout,
  PolicySection,
  PolicyCalloutBox,
  PolicyBullet,
  PolicyContactCard,
} from '../../../components/policies/GlorovPolicyLayout'

export const metadata: Metadata = {
  title: 'Privacy & Data Protection Policy | GLOROV',
  description:
    'GLOROV Privacy Policy compliant with DPDP Act 2023. Learn how we safeguard your personal data, shipping details, and seed viability guarantees.',
  alternates: {
    canonical: '/policies/privacy',
  },
  openGraph: {
    title: 'Privacy & Data Protection Policy | GLOROV',
    description:
      'How GLOROV protects your personal information, delivery data, and botanical order privacy.',
    url: '/policies/privacy',
    siteName: 'GLOROV',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Privacy & Data Protection Policy | GLOROV',
    description:
      'How GLOROV protects your personal information, delivery data, and botanical order privacy.',
    images: ['/og-image.jpg'],
  },
}

export default function PrivacyPolicyPage(): React.ReactElement {
  return (
    <GlorovPolicyLayout
      currentTab="privacy"
      badgeText="DPDP Act 2023 Compliant"
      badgeIcon={
        <svg className="w-3.5 h-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
      }
      title="Privacy & Data Protection Policy"
      subtitle="Last updated: October 2026 • Effective for all GLOROV botanical patrons across India"
    >
      {/* Section 1 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C12 3 5.5 10.5 5.5 15.5C5.5 19.1 8.4 22 12 22C15.6 22 18.5 19.1 18.5 15.5C18.5 10.5 12 3 12 3Z" />
          </svg>
        }
        title="1. Our Botanical Privacy Commitment"
      >
        <p>
          At GLOROV, we honor your privacy as deeply as our botanical sanctuaries. We adhere strictly to the Digital Personal Data Protection Act, 2023 (DPDP) and never engage in third-party data brokerage or ad retargeting trackers. We collect only what is strictly required to deliver live plants and certified seeds to your doorstep.
        </p>

        <PolicyCalloutBox
          title="Our Zero-Sale Privacy Pledge"
          text="We never sell, rent, lease, or monetize customer telephone numbers, email addresses, or delivery addresses to third-party marketing brokers or ad networks. Your details are used strictly for delivering healthy living plants and seeds to your doorstep."
        />
      </PolicySection>

      {/* Section 2 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        title="2. Information We Collect & Strict Minimization"
      >
        <p>
          GLOROV Botanicals adheres strictly to purpose limitation under DPDP 2023. We collect only data strictly necessary to fulfill living plant and organic seed orders:
        </p>

        <ul className="space-y-2 pt-1">
          <PolicyBullet
            label="Shipping Coordinates:"
            description="Full name, delivery street address, verified 6-digit Indian PIN code, mobile phone number, and email address for courier Air Waybill (AWB) generation and SMS tracking."
          />
          <PolicyBullet
            label="Account Credentials:"
            description="Salted and securely hashed authentication credentials when you choose to create a customer account. We do not store plaintext passwords."
          />
          <PolicyBullet
            label="Order History & Preferences:"
            description="Wishlist items, previous nursery purchases, and regional climate filters used to deliver accurate seed sowing calendars and watering advice."
          />
        </ul>
      </PolicySection>

      {/* Section 3 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
        title="3. Payment Security & Zero Card Retention"
      >
        <p>
          All electronic payments are processed via RBI-authorized payment aggregators (Razorpay) using 256-bit AES encryption and SHA-256 HMAC signature verification. GLOROV never stores your credit card numbers, CVVs, UPI PINs, or bank net-banking passwords on our servers.
        </p>
        <p>
          All network communication between your browser and our infrastructure is strictly encrypted using Transport Layer Security (TLS 1.3) with modern forward secrecy.
        </p>
      </PolicySection>

      {/* Section 4 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        title="4. Your Data Rights & Erasure Requests"
      >
        <p>
          Under the DPDP Act 2023, you have full control over your personal data. You may review, edit, or delete saved delivery addresses at any time directly in your customer account.
        </p>
        <div className="pt-2">
          <Link
            href="/account/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F281E] text-white text-xs font-bold hover:bg-[#1B4332] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Manage Account & Addresses</span>
          </Link>
        </div>
      </PolicySection>

      {/* Section 5 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        title="5. Grievance Redressal & Legal Notice"
      >
        <p>
          In accordance with the Digital Personal Data Protection Act, 2023 and the Information Technology Rules, grievances may be directed to our dedicated Grievance Officer:
        </p>

        <PolicyContactCard
          title="Grievance Officer: Data Protection & Horticultural Operations"
          entity="GLOROV Botanicals"
          address="Pune Central Nursery Hub, Maharashtra 411001, India"
          email="privacy@glorov.in"
          phone="+91 80870 87224"
        />
      </PolicySection>
    </GlorovPolicyLayout>
  )
}
