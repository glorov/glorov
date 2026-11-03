import type { Metadata } from 'next'
import React from 'react'
import {
  GlorovPolicyLayout,
  PolicySection,
  PolicyCalloutBox,
  PolicyBullet,
  PolicyContactCard,
} from '../../../components/policies/GlorovPolicyLayout'

export const metadata: Metadata = {
  title: 'Terms & Conditions of Service | GLOROV',
  description:
    'GLOROV Terms of Service: Statutory agricultural seed guidelines, trademark notice, GST 0% tax exemptions, and purchase conditions.',
  alternates: {
    canonical: '/policies/terms',
  },
  openGraph: {
    title: 'Terms & Conditions of Service | GLOROV',
    description:
      'Review GLOROV botanical purchase terms, seed germination standards, and live plant transit responsibilities.',
    url: '/policies/terms',
    siteName: 'GLOROV',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms & Conditions of Service | GLOROV',
    description:
      'Review GLOROV botanical purchase terms, seed germination standards, and live plant transit responsibilities.',
    images: ['/og-image.jpg'],
  },
}

export default function TermsOfServicePage(): React.ReactElement {
  return (
    <GlorovPolicyLayout
      currentTab="terms"
      badgeText="Statutory Compliance & Governance"
      badgeIcon={
        <svg className="w-3.5 h-3.5 text-[#10B981]" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      }
      title="Terms of Botanical Service"
      subtitle="Last updated: October 2026 • Governing all botanical orders and services across India"
    >
      {/* Section 1 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C12 3 5.5 10.5 5.5 15.5C5.5 19.1 8.4 22 12 22C15.6 22 18.5 19.1 18.5 15.5C18.5 10.5 12 3 12 3Z" />
          </svg>
        }
        title="1. Overview & Botanical Product Scope"
      >
        <p>
          Welcome to GLOROV Botanicals (&quot;GLOROV&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By browsing or placing orders through our website or mobile application, you agree to comply with and be bound by these Terms of Botanical Service.
        </p>
        <p>
          GLOROV is an online horticultural destination specializing exclusively in living plants (indoor houseplants, air-purifying foliage, and outdoor specimens) and certified organic seeds (desi vegetable seeds, heirloom flower seeds, and culinary herb seeds). In accordance with our organic ethos, our catalog strictly excludes synthetic chemical pesticides and single-use packaging plastics.
        </p>
      </PolicySection>

      {/* Section 2 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        title="2. Trademark Notice & Proprietary Rights"
      >
        <p>
          Please take note of the following statutory notice regarding intellectual property and brand identification:
        </p>

        <PolicyCalloutBox
          title="GLOROV™ Trademark Notice (Application Pending / Not Registered)"
          text="GLOROV™ is a trademark for which registration application has been formally filed under the Trade Marks Act, 1999 with the Trade Marks Registry (Government of India). GLOROV is currently a trademark under application and is NOT yet a registered trademark (®). All brand marks, logos, typography, botanical photography, product titles, mobile application interfaces, and packaging trade dress remain proprietary to GLOROV Botanicals and are legally protected under common law trademark rights and Indian intellectual property statutes."
        />
      </PolicySection>

      {/* Section 3 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
          </svg>
        }
        title="3. Statutory GST Compliance & 0% Seed Exemption"
      >
        <p>
          GLOROV operates in full compliance with Central GST (CGST), Integrated GST (IGST), and State GST (SGST) regulations of India:
        </p>
        <ul className="space-y-2 pt-1">
          <PolicyBullet
            label="0% GST on Seeds for Sowing (HSN 1209):"
            description="All vegetable, herb, and flower seeds sold for agricultural or garden sowing are legally exempt from Goods and Services Tax (GST @ 0.00%) under Notification No. 02/2017-Central Tax (Rate). No GST is levied on seed purchases."
          />
          <PolicyBullet
            label="Live Botanical Plants (HSN 0602):"
            description="Live potted houseplants, outdoor shrubs, and vegetative cuttings are billed with applicable statutory GST already included in the displayed item price."
          />
          <PolicyBullet
            label="Itemized Tax Invoices:"
            description="Every order generates an itemized electronic invoice detailing respective HSN classifications and statutory tax allocations upon dispatch from our Pune nursery."
          />
        </ul>
      </PolicySection>

      {/* Section 4 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
        title="4. Payment Terms & COD Safety Guardrails"
      >
        <p>
          All product prices in the GLOROV application are listed in Indian Rupees (INR ₹). We accept payments via UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit cards, and Cash on Delivery (COD).
        </p>
        <ul className="space-y-2 pt-1">
          <PolicyBullet
            label="Cash on Delivery (COD) Limit:"
            description="To protect delicate living botanical specimens from transit mortality resulting from courier non-acceptance, COD is available for orders up to ₹5,000. Orders exceeding ₹5,000 require prepaid digital settlement."
          />
          <PolicyBullet
            label="Order Verification:"
            description="First-time COD orders may receive an automated WhatsApp confirmation prompt before dispatch from our Pune nursery hub."
          />
        </ul>
      </PolicySection>

      {/* Section 5 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="5. Natural Variations & Horticultural Disclaimers"
      >
        <p>
          Living plants are unique biological organisms rather than factory-manufactured uniform goods. Photographs shown in our catalog represent mature, healthy specimens cultivated under optimal Pune nursery greenhouse conditions.
        </p>
        <ul className="space-y-2 pt-1">
          <PolicyBullet
            label="Botanical Variations:"
            description="Natural differences in leaf variegation, stem branching, foliage density, and seasonal bud/flowering status are normal and celebrated biological characteristics."
          />
          <PolicyBullet
            label="Seed Viability & Germination:"
            description="GLOROV seeds are tested for minimum 80% to 90% germination viability. Successful germination is influenced by customer environmental variables such as soil temperature, sowing depth, sunlight, and moisture discipline. Our botanical helpdesk provides free sowing guides."
          />
        </ul>
      </PolicySection>

      {/* Section 6 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        }
        title="6. Governing Law & Jurisdiction"
      >
        <p>
          These Terms of Botanical Service are governed by and construed in accordance with the substantive laws of the Republic of India. Any legal dispute arising in connection with orders or app use shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.
        </p>

        <PolicyContactCard
          title="Legal Entity & Corporate Inquiries"
          entity="GLOROV Botanicals"
          address="Pune Central Nursery Hub, Maharashtra 411001, India"
          email="support@glorov.in"
          phone="+91 80870 87224"
        />
      </PolicySection>
    </GlorovPolicyLayout>
  )
}
