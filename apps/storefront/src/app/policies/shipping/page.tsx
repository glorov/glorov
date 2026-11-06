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
  title: 'Shipping & Transit Shield Policy | GLOROV',
  description:
    'GLOROV Botanical Shipping Policy: 100% Transit Shield Guarantee, 48-Hour Live Arrival Guarantee, seed germination warranty, and zero physical plant returns across India.',
  alternates: {
    canonical: '/policies/shipping',
  },
  openGraph: {
    title: 'Shipping & Transit Shield Policy | GLOROV',
    description:
      'Learn about GLOROV 100% Transit Shield Guarantee, 48-hour live plant guarantee, plastic-free biodegradable packing, and live plant transit standards across India.',
    url: '/policies/shipping',
    siteName: 'GLOROV',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shipping & Transit Shield Policy | GLOROV',
    description:
      'Learn about GLOROV 100% Transit Shield Guarantee, 48-hour live plant guarantee, plastic-free biodegradable packing, and live plant transit standards across India.',
    images: ['/og-image.jpg'],
  },
}

export default function ShippingPolicyPage(): React.ReactElement {
  return (
    <GlorovPolicyLayout
      currentTab="shipping"
      badgeText="100% Transit Shield Guarantee"
      badgeIcon={
        <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
        </svg>
      }
      title="Botanical Shipping & Transit Shield Policy"
      subtitle="Fast, climate-controlled dispatch for live indoor plants and seeds across 19,000+ Indian pin codes"
    >
      {/* Section 1 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C12 3 5.5 10.5 5.5 15.5C5.5 19.1 8.4 22 12 22C15.6 22 18.5 19.1 18.5 15.5C18.5 10.5 12 3 12 3Z" />
          </svg>
        }
        title="1. Pune Nursery Dispatch Protocols"
      >
        <p>
          At GLOROV, living botanicals and organic seeds require synchronized climate preparation before shipping. Unlike inert manufactured goods, living plants must never remain stranded in transit facilities over weekends:
        </p>

        <ul className="space-y-2 pt-1">
          <PolicyBullet
            label="Monday through Thursday Live Plant Dispatches:"
            description="Living potted houseplants and outdoor plants are dispatched exclusively Monday through Thursday. This guarantees specimens do not linger in weekend courier sorting hubs."
          />
          <PolicyBullet
            label="24–48 Hour Nursery Conditioning:"
            description="Every specimen undergoes root saturation, foliar health inspection, and organic pest screening before custom packaging at our Pune nursery hub (PIN 411001)."
          />
          <PolicyBullet
            label="Seeds Dispatches (Monday–Saturday):"
            description="Organic vegetable, flower, and herb seeds are dispatched 6 days a week within 24 hours of order confirmation."
          />
        </ul>

        <PolicyCalloutBox
          title="Moisture-Shield & Root Hydration Packaging"
          text="Every living specimen is packed using coco-peat moisture retention wraps that lock in hydration for up to 7 days, encased in ventilated corrugated cartons that permit foliage respiration while preventing courier impact damage."
        />
      </PolicySection>

      {/* Section 2 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
        }
        title="2. Delivery Timelines & Shipping Rates"
      >
        <p>
          We offer standard shipping at ₹49 on orders below ₹499. All orders of ₹499 and above receive <strong>FREE Standard Shipping</strong>. Express botanical air dispatch is available for major metro corridors with 24 — 48 hour turnaround.
        </p>

        {/* Regional Transit Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-3">
          <div className="p-4 rounded-2xl bg-[#F9FAF8] border border-stone-200/90 space-y-1">
            <span className="font-bold text-sm text-[#1B4332]">Metro Corridors</span>
            <p className="text-xs text-stone-600">Bengaluru, Mumbai, Pune, Delhi NCR, Hyderabad, Chennai, Kolkata: 2 — 3 business days.</p>
          </div>
          <div className="p-4 rounded-2xl bg-[#F9FAF8] border border-stone-200/90 space-y-1">
            <span className="font-bold text-sm text-[#1B4332]">Rest of India</span>
            <p className="text-xs text-stone-600">Tier 2/3 cities and regional centers: 3 — 5 business days with live courier tracking.</p>
          </div>
        </div>

        {/* Shipping Rates Table matching Flutter */}
        <div className="rounded-2xl border border-stone-200 overflow-hidden my-3">
          <div className="bg-[#0F281E] text-white px-3.5 py-2.5 text-[11px] font-bold grid grid-cols-12 gap-2">
            <span className="col-span-4">Category</span>
            <span className="col-span-3">Order Value</span>
            <span className="col-span-2">Shipping</span>
            <span className="col-span-3 text-right sm:text-left">Transit SLA</span>
          </div>
          <div className="divide-y divide-stone-100 text-xs text-stone-700 bg-white">
            <div className="px-3.5 py-2.5 grid grid-cols-12 gap-2 items-center">
              <span className="col-span-4 font-semibold text-stone-900">Seeds & Accessories</span>
              <span className="col-span-3 text-stone-500">Above ₹499</span>
              <span className="col-span-2 font-bold text-emerald-600">FREE</span>
              <span className="col-span-3 text-right sm:text-left text-stone-500">2–4 Days</span>
            </div>
            <div className="px-3.5 py-2.5 grid grid-cols-12 gap-2 items-center bg-[#F9FAF8]">
              <span className="col-span-4 font-semibold text-stone-900">Seeds & Accessories</span>
              <span className="col-span-3 text-stone-500">Below ₹499</span>
              <span className="col-span-2 font-bold text-stone-800">₹49 Flat</span>
              <span className="col-span-3 text-right sm:text-left text-stone-500">2–4 Days</span>
            </div>
            <div className="px-3.5 py-2.5 grid grid-cols-12 gap-2 items-center">
              <span className="col-span-4 font-semibold text-stone-900">Live Potted Plants</span>
              <span className="col-span-3 text-stone-500">Orders &gt; ₹999</span>
              <span className="col-span-2 font-bold text-emerald-600">FREE Air</span>
              <span className="col-span-3 text-right sm:text-left text-stone-500">2–3 Days</span>
            </div>
            <div className="px-3.5 py-2.5 grid grid-cols-12 gap-2 items-center bg-[#F9FAF8]">
              <span className="col-span-4 font-semibold text-stone-900">Live Potted Plants</span>
              <span className="col-span-3 text-stone-500">Standard</span>
              <span className="col-span-2 font-bold text-stone-800">₹99 Express</span>
              <span className="col-span-3 text-right sm:text-left text-stone-500">2–3 Days</span>
            </div>
          </div>
        </div>
      </PolicySection>

      {/* Section 3 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        }
        title="3. The 48-Hour Live Plant Arrival Guarantee"
      >
        <p>
          We take deep pride in cultivating vibrant specimens. If your plant arrives dead on arrival (DOA), suffering severe stem fracture, or irreversible root damage, you are protected under our unconditional 48-Hour Live Arrival Guarantee:
        </p>

        <ul className="space-y-2 pt-1">
          <PolicyBullet
            label="Free Immediate Replacement:"
            description="We dispatch a healthy replacement specimen directly from our Pune nursery at zero extra plant or courier charge."
          />
          <PolicyBullet
            label="100% Refund / Store Credit:"
            description="If the seasonal plant cultivar is out of stock, an immediate full refund is processed to your original payment method."
          />
        </ul>

        <PolicyCalloutBox
          title="How to Submit a Botanical Claim in 4 Hours:"
          text="Within 48 hours of delivery, take 2 clear photographs of the damaged plant and outer courier packaging label. Send them via WhatsApp to +91 80870 87224 or email support@glorov.in with your Order ID. Our horticulturists verify and approve claims within 4 business hours."
        />
      </PolicySection>

      {/* Section 4 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="4. Perishable Botanical Policy (No Physical Return Required)"
      >
        <p>
          Unlike electronics or clothing, returning a distressed living plant via reverse courier transit will inevitably result in the death of the specimen due to prolonged darkness and double handling.
        </p>
        <p>
          Therefore, GLOROV does <strong>NOT</strong> require you to package and return the living plant. Once your photo claim is verified, we process your replacement or refund immediately.
        </p>
      </PolicySection>

      {/* Section 5 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
        title="5. Sustainable Plastic-Free Packaging"
      >
        <p>
          All seed packets are sealed in 100% biodegradable glassine sleeves. Planters are protected with shredded recycled honeycomb paper rather than plastic bubble wrap.
        </p>
      </PolicySection>

      {/* Section 6 */}
      <PolicySection
        icon={
          <svg className="w-5 h-5 text-[#1B4332]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        }
        title="6. Live Order Tracking & Nursery Support"
      >
        <p>
          As soon as your parcel is dispatched from our Pune nursery, you will receive real-time SMS and email alerts containing your courier Air Waybill (AWB) number and direct live tracking link.
        </p>

        <div className="flex items-center gap-3 flex-wrap pt-2">
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F281E] text-white text-xs font-bold hover:bg-[#1B4332] transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <span>Track My Plant Shipment</span>
          </Link>
          <a
            href="mailto:support@glorov.in"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-50 transition"
          >
            <svg className="w-3.5 h-3.5 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span>Contact Nursery Support Desk</span>
          </a>
        </div>

        <div className="pt-2">
          <PolicyContactCard
            title="Horticultural Dispatch & Claims Desk"
            entity="GLOROV Botanicals"
            address="Pune Central Nursery Hub, Maharashtra 411001, India"
            email="support@glorov.in"
            phone="+91 80870 87224 (WhatsApp & Voice)"
          />
        </div>
      </PolicySection>
    </GlorovPolicyLayout>
  )
}
