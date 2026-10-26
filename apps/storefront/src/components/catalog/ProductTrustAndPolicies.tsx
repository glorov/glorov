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
    <section aria-labelledby="store-policies-heading" className="space-y-4">
      <div>
        <h2
          id="store-policies-heading"
          className="text-xl sm:text-2xl font-black text-botanical-950 tracking-tight"
        >
          Delivery, Guarantees &amp; Customer Support
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Transparent fulfilment logistics and care policies dispatched directly from our Pune nursery hub.
        </p>
      </div>

      <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden text-xs sm:text-sm">
        {/* Section 1: Shipping & Delivery Expectations */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('shipping')}
            aria-expanded={openSection === 'shipping'}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-earth-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Shipping Logistics &amp; Transit Expectations
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dispatched from Pune Hub (PIN 411001) across all serviceable Indian PIN codes
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                openSection === 'shipping' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'shipping' && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-muted-foreground text-xs leading-relaxed border-t border-border/40 bg-earth-50/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl border border-border/80 bg-background space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <Clock className="h-3.5 w-3.5 text-botanical-700" />
                    Dispatch Timeline
                  </span>
                  <p className="text-[11px]">
                    Orders are viability-inspected, packed, and handed to national couriers within 24–48 hours (Mon–Sat).
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-background space-y-1">
                  <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <PackageCheck className="h-3.5 w-3.5 text-botanical-700" />
                    Protective Packaging
                  </span>
                  <p className="text-[11px]">
                    {isPerishable
                      ? 'Custom ventilated corrugated shippers with root coco-peat moisture wrap to survive express transit.'
                      : 'Hermetically heat-sealed aluminum barrier pouches with food-grade desiccant to prevent moisture ingress.'}
                  </p>
                </div>
              </div>

              <div className="pt-1 space-y-1.5 text-[11px]">
                <p>
                  • <strong>Express Air (Live Plants &amp; Priority Seeds):</strong> Estimated 2–4 business days delivery to metro and tier-1 destinations.
                </p>
                <p>
                  • <strong>Standard Surface (Dry Seeds &amp; Planters):</strong> Estimated 4–7 business days delivery across tier-2 and tier-3 locations.
                </p>
                <p>
                  • Real-time AWB tracking numbers from courier partners (e.g., Shiprocket) are provided upon dispatch via email and account orders tab.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Returns & Transit Replacement Policy */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('returns')}
            aria-expanded={openSection === 'returns'}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-earth-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-earth-200 text-earth-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Transit Damage Replacement &amp; Perishables Policy
                </h3>
                <p className="text-xs text-muted-foreground">
                  48-hour unboxing coverage for transit defects and botanical transit safety
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                openSection === 'returns' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'returns' && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-muted-foreground text-xs leading-relaxed border-t border-border/40 bg-earth-50/30">
              <div className="p-3 rounded-xl border border-amber-300/60 bg-amber-50/50 space-y-1.5 text-amber-950">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-700 shrink-0" />
                  <span>Perishable Botanical Asset Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Due to the biological and perishable nature of {categoryName.toLowerCase()}, routine remorse returns are not accepted once packages are unsealed.
                </p>
              </div>

              <div className="space-y-2 pt-1 text-[11px]">
                <p className="font-bold text-foreground">What is covered for free replacement:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Damaged, crushed, or waterlogged parcels upon initial delivery.</li>
                  <li>Live plants showing terminal stem or root rot incurred strictly during transit delays.</li>
                  <li>Mismatched botanical variety or incorrect variant packet size delivered.</li>
                </ul>

                <p className="pt-1">
                  <strong>Reporting Process:</strong> Please email <a href="mailto:support@glorov.in" className="text-botanical-700 font-semibold underline">support@glorov.in</a> within <strong>48 hours of delivery</strong> with unboxing photographs or video showing the shipping label and condition.
                </p>

                <p className="text-[10px] text-muted-foreground italic pt-1">
                  [Store Owner Notice: Final refund and warranty claims are governed by GLOROV Terms of Service. Germination guarantees cannot be made unconditionally due to customer soil and climate variations.]
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Customer Support & Care Guidance */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('support')}
            aria-expanded={openSection === 'support'}
            className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-earth-50/70 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-botanical-100 text-botanical-800 flex items-center justify-center shrink-0">
                <Headphones className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">
                  Gardening Helpdesk &amp; Order Support
                </h3>
                <p className="text-xs text-muted-foreground">
                  Direct support from our Pune nursery team for germination queries and order updates
                </p>
              </div>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-muted-foreground transition-transform duration-200 shrink-0 ${
                openSection === 'support' ? 'rotate-180' : ''
              }`}
            />
          </button>

          {openSection === 'support' && (
            <div className="px-5 pb-5 pt-1 space-y-3 text-muted-foreground text-xs leading-relaxed border-t border-border/40 bg-earth-50/30">
              <p>
                Need guidance on soil preparation, sowing depth, or transplanting this specimen? Our Pune horticultural team is happy to assist.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl border border-border/80 bg-background text-[11px] space-y-1">
                  <span className="font-bold text-foreground block">Email Support</span>
                  <a
                    href="mailto:support@glorov.in"
                    className="text-botanical-700 font-semibold hover:underline"
                  >
                    support@glorov.in
                  </a>
                  <p className="text-muted-foreground text-[10px]">Responses within 12–24 business hours</p>
                </div>

                <div className="p-3 rounded-xl border border-border/80 bg-background text-[11px] space-y-1">
                  <span className="font-bold text-foreground block">Operating Hours</span>
                  <p className="text-foreground font-medium">Monday to Saturday: 9:00 AM – 6:00 PM IST</p>
                  <p className="text-muted-foreground text-[10px]">Closed on national Indian holidays</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
