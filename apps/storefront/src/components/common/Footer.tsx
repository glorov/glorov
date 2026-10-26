'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Leaf,
  ShieldCheck,
  Truck,
  RefreshCcw,
  HeartHandshake,
  Mail,
  FileText,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PolicyModalContent {
  title: string
  subtitle: string
  content: React.ReactNode
}

const POLICY_DATA: Record<string, PolicyModalContent> = {
  shipping: {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Storefront Logistics Placeholder',
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          GLOROV dispatches botanical parcels directly from our propagation nursery in Pune, Maharashtra (PIN 411001).
        </p>
        <div className="p-3 rounded-lg bg-earth-100/60 border space-y-1">
          <p className="font-semibold text-botanical-950">Standard Delivery (India):</p>
          <p>₹49 flat rate for non-perishable seeds and gardening supplies. Free for orders qualifying above ₹499.</p>
        </div>
        <div className="p-3 rounded-lg bg-earth-100/60 border space-y-1">
          <p className="font-semibold text-botanical-950">Express Botanical Delivery (Air):</p>
          <p>₹99 dedicated air courier for live potted plants to minimize transit duration.</p>
        </div>
        <p>
          Tracking details are shared via email once dispatched. Live plants are dispatched on business days to avoid weekend holding in courier transit hubs.
        </p>
      </div>
    ),
  },
  'live-plants': {
    title: 'Live Plant Transit Guidelines',
    subtitle: 'Storefront Horticultural Care Placeholder',
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          Every live botanical plant is conditioned before shipment to withstand interstate travel.
        </p>
        <ul className="list-disc pl-4 space-y-1.5">
          <li><strong>Root Hydration:</strong> Roots are encased in aerated coco-peat wrap to maintain moisture balance.</li>
          <li><strong>Ventilated Crating:</strong> Breathable, shock-absorbing outer cartons protect foliage from physical crush.</li>
          <li><strong>Post-Transit Care:</strong> Upon unboxing, place plants in bright indirect sunlight for 48 hours and hydrate gently.</li>
        </ul>
      </div>
    ),
  },
  returns: {
    title: 'Cancellations & Replacements',
    subtitle: 'Storefront Support Policy Placeholder',
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          We want your garden to thrive. Due to the perishable nature of live botanicals:
        </p>
        <ul className="list-disc pl-4 space-y-1.5">
          <li><strong>Unshipped Orders:</strong> Orders may be cancelled anytime prior to packaging at our Pune nursery.</li>
          <li><strong>Transit Concerns:</strong> If a live plant arrives severely damaged or wilted, email our support team with delivery photographs within 24 hours of arrival.</li>
          <li><strong>Replacement Dispatch:</strong> Verified transit damaged items will be replaced or refunded promptly.</li>
        </ul>
      </div>
    ),
  },
  payments: {
    title: 'Statutory GST & Payment Terms',
    subtitle: 'Storefront Invoicing Placeholder',
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          Transparent Indian invoicing on all GLOROV purchases:
        </p>
        <ul className="list-disc pl-4 space-y-1.5">
          <li><strong>Agricultural Seeds:</strong> Exempt from GST (0% rate under statutory HSN Code 1209).</li>
          <li><strong>Live Plants &amp; Planters:</strong> Applicable GST included in displayed prices according to statutory schedules.</li>
          <li><strong>Payment Methods:</strong> Card payments, UPI, and Cash on Delivery (COD) subject to verification.</li>
        </ul>
      </div>
    ),
  },
  privacy: {
    title: 'Privacy & Data Protection',
    subtitle: 'Storefront Privacy Policy Placeholder',
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          GLOROV respects your personal information and operates in accordance with applicable Indian digital data protection standards.
        </p>
        <p>
          We collect shipping addresses, mobile numbers, and email IDs exclusively for processing your orders, generating delivery airway bills, and communicating transit updates. We do not sell customer personal data to third parties.
        </p>
      </div>
    ),
  },
  support: {
    title: 'Customer Support Desk',
    subtitle: 'Storefront Contact Placeholder',
    content: (
      <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
        <p>
          Need help choosing seed varieties, selecting suitable indoor plants, or checking your order status?
        </p>
        <div className="p-3.5 rounded-xl bg-botanical-50 border border-botanical-200 text-botanical-950 space-y-1.5">
          <p className="font-bold text-sm">Customer Care Team</p>
          <p><strong>Email:</strong> support@glorov.in</p>
          <p><strong>Hours:</strong> Monday – Saturday, 9:30 AM – 6:30 PM IST</p>
          <p><strong>Dispatch Hub:</strong> Pune Nursery, Maharashtra — 411001</p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Note: This is a placeholder support interface for the GLOROV responsive storefront foundation.
        </p>
      </div>
    ),
  },
}

export function Footer() {
  const [activePolicyKey, setActivePolicyKey] = useState<string | null>(null)

  const activePolicy = activePolicyKey ? POLICY_DATA[activePolicyKey] : null

  return (
    <footer className="border-t bg-earth-50/80 text-foreground">
      {/* Trust Badges Bar */}
      <div className="border-b border-border/60 py-8 bg-earth-100/40">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <Truck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">Botanical Packaging</p>
              <p className="text-xs text-muted-foreground">Ventilated moisture-pack wrapping</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">High-Viability Batches</p>
              <p className="text-xs text-muted-foreground">Desi heirloom &amp; adapted seeds</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <RefreshCcw className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">Transit Care</p>
              <p className="text-xs text-muted-foreground">Dedicated botanical support</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <HeartHandshake className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">Indian Grown</p>
              <p className="text-xs text-muted-foreground">Acclimatized to Indian weather</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        {/* Col 1: Brand & Nursery Summary */}
        <div className="sm:col-span-2 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-botanical-700 flex items-center justify-center text-white shadow-xs">
              <Leaf className="h-4 w-4 text-emerald-200" aria-hidden="true" />
            </div>
            <span className="font-black tracking-tight text-xl text-botanical-950">
              GLOROV
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Cultivating vitality across Indian living spaces with authentic heirloom seeds, climate-hardened live indoor plants, and durable nursery planters dispatched directly from our central nursery in Pune, Maharashtra.
          </p>
          <div className="pt-2 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-botanical-900">GLOROV Botanical Storefront</p>
            <p>Pune Dispatch Nursery, Maharashtra — 411001</p>
            <button
              type="button"
              onClick={() => setActivePolicyKey('support')}
              className="text-botanical-700 hover:text-botanical-900 underline text-xs font-medium inline-flex items-center gap-1 mt-1"
            >
              <Mail className="h-3 w-3" />
              <span>Contact Customer Support Placeholder</span>
            </button>
          </div>
        </div>

        {/* Col 2: Categories (Verified Active Medusa Handles) */}
        <div className="space-y-3">
          <p className="font-bold text-xs text-botanical-900 tracking-wider uppercase">
            Shop Catalog
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>
              <Link href="/store" className="hover:text-botanical-700 transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/categories/seeds" className="hover:text-botanical-700 transition-colors">
                Seeds Collection
              </Link>
            </li>
            <li>
              <Link href="/categories/vegetable-seeds" className="hover:text-botanical-700 transition-colors">
                Vegetable Seeds
              </Link>
            </li>
            <li>
              <Link href="/categories/flower-seeds" className="hover:text-botanical-700 transition-colors">
                Flower Seeds
              </Link>
            </li>
            <li>
              <Link href="/categories/herb-seeds" className="hover:text-botanical-700 transition-colors">
                Herb Seeds
              </Link>
            </li>
            <li>
              <Link href="/categories/live-plants" className="hover:text-botanical-700 transition-colors">
                Live Houseplants
              </Link>
            </li>
            <li>
              <Link href="/categories/planters-pots" className="hover:text-botanical-700 transition-colors">
                Planters &amp; Pots
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Policy Placeholders (Accessible Dialogs) */}
        <div className="space-y-3">
          <p className="font-bold text-xs text-botanical-900 tracking-wider uppercase">
            Customer Care
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>
              <button
                type="button"
                onClick={() => setActivePolicyKey('shipping')}
                className="hover:text-botanical-700 transition-colors text-left"
              >
                Shipping &amp; Delivery Policy
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicyKey('live-plants')}
                className="hover:text-botanical-700 transition-colors text-left"
              >
                Live Plant Transit Guidelines
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicyKey('returns')}
                className="hover:text-botanical-700 transition-colors text-left"
              >
                Cancellations &amp; Returns
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicyKey('payments')}
                className="hover:text-botanical-700 transition-colors text-left"
              >
                Statutory GST &amp; Payment Terms
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicyKey('privacy')}
                className="hover:text-botanical-700 transition-colors text-left"
              >
                Privacy Notice
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActivePolicyKey('support')}
                className="hover:text-botanical-700 transition-colors text-left font-medium text-botanical-800"
              >
                Help &amp; Support Desk
              </button>
            </li>
          </ul>
        </div>

        {/* Col 4: Sowing & Cultivation Information */}
        <div className="space-y-3">
          <p className="font-bold text-xs text-botanical-900 tracking-wider uppercase">
            Sowing Calendar
          </p>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>
              <Link href="/#sowing-calendar" className="hover:text-botanical-700 transition-colors">
                Indian Sowing Calendar
              </Link>
            </li>
            <li>
              <Link href="/#sowing-calendar" className="hover:text-botanical-700 transition-colors">
                Kharif (Monsoon) Varieties
              </Link>
            </li>
            <li>
              <Link href="/#sowing-calendar" className="hover:text-botanical-700 transition-colors">
                Rabi (Winter) Seeds
              </Link>
            </li>
            <li>
              <Link href="/#sowing-calendar" className="hover:text-botanical-700 transition-colors">
                Zaid (Summer) Gardening
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-botanical-700 transition-colors">
                My Customer Account
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-botanical-700 transition-colors">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal & Statutory Bar */}
      <div className="border-t border-border/80 py-6 bg-earth-100/30">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GLOROV. All rights reserved.</p>
          <p className="text-center md:text-right">
            Agricultural seeds for sowing exempt from GST under HSN 1209. Live plants and planters carry statutory GST.
          </p>
        </div>
      </div>

      {/* Accessible Policy & Support Dialog Modal */}
      <Dialog
        open={Boolean(activePolicyKey)}
        onOpenChange={(open) => {
          if (!open) setActivePolicyKey(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          {activePolicy && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-botanical-700" />
                  <span>{activePolicy.title}</span>
                </DialogTitle>
                <DialogDescription>
                  {activePolicy.subtitle}
                </DialogDescription>
              </DialogHeader>

              <div className="py-2">
                {activePolicy.content}
              </div>

              <div className="pt-3 border-t flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActivePolicyKey(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </footer>
  )
}
