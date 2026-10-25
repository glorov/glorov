import React from 'react'
import Link from 'next/link'
import { Leaf, ShieldCheck, Truck, RefreshCcw, HeartHandshake } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-earth-50/80 text-foreground">
      {/* Trust Badges Bar */}
      <div className="border-b border-border/60 py-8 bg-earth-100/40">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">Safe Root-Transit</p>
              <p className="text-xs text-muted-foreground">Ventilated moisture-pack packaging</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">90%+ Germination</p>
              <p className="text-xs text-muted-foreground">Certified viable non-GMO seed batches</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <RefreshCcw className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">Transit Damage Cover</p>
              <p className="text-xs text-muted-foreground">Instant photo-based replacement</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-botanical-100 flex items-center justify-center text-botanical-700 shrink-0">
              <HeartHandshake className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-botanical-900">Indian Grown</p>
              <p className="text-xs text-muted-foreground">Acclimatized to Indian tropical climate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Col 1: Brand & Story */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-botanical-700 flex items-center justify-center text-white">
              <Leaf className="h-4 w-4 text-emerald-200" />
            </div>
            <span className="font-extrabold tracking-tight text-lg text-botanical-900">
              GLOROV
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Nurturing India&apos;s green living spaces with high-viability seeds, resilient potted indoor plants, and organic soil mixes. Shipped with love and biological care across 24,000+ PIN codes.
          </p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>CIN:</strong> U01100MH2025PTC123456</p>
            <p><strong>GSTIN:</strong> 27AABCG1234F1Z5</p>
            <p>Pune Dispatch Nursery, Maharashtra — 411001</p>
          </div>
        </div>

        {/* Col 2: Categories */}
        <div className="space-y-3">
          <p className="font-semibold text-sm text-botanical-900 tracking-wide uppercase">
            Shop Catalog
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/categories/seeds" className="hover:text-botanical-700 transition-colors">
                Vegetable Seeds
              </Link>
            </li>
            <li>
              <Link href="/categories/seeds" className="hover:text-botanical-700 transition-colors">
                Exotic Herb Seeds
              </Link>
            </li>
            <li>
              <Link href="/categories/live-plants" className="hover:text-botanical-700 transition-colors">
                Indoor Live Plants
              </Link>
            </li>
            <li>
              <Link href="/categories/planters" className="hover:text-botanical-700 transition-colors">
                Ceramic Planters
              </Link>
            </li>
            <li>
              <Link href="/categories/plant-care" className="hover:text-botanical-700 transition-colors">
                Organic Potting Mix
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Policies */}
        <div className="space-y-3">
          <p className="font-semibold text-sm text-botanical-900 tracking-wide uppercase">
            Logistics & Care
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/policies/shipping" className="hover:text-botanical-700 transition-colors">
                Shipping & PIN Code Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/live-plant-guarantee" className="hover:text-botanical-700 transition-colors">
                Live Plant Guarantee
              </Link>
            </li>
            <li>
              <Link href="/policies/returns" className="hover:text-botanical-700 transition-colors">
                Returns & Replacements
              </Link>
            </li>
            <li>
              <Link href="/policies/cod-rules" className="hover:text-botanical-700 transition-colors">
                COD Terms & Limits
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy" className="hover:text-botanical-700 transition-colors">
                Privacy & DPDP Compliance
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Plant Care Knowledge */}
        <div className="space-y-3">
          <p className="font-semibold text-sm text-botanical-900 tracking-wide uppercase">
            Plant Guides
          </p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/guides/sowing-calendar" className="hover:text-botanical-700 transition-colors">
                Indian Sowing Calendar
              </Link>
            </li>
            <li>
              <Link href="/guides/low-light-plants" className="hover:text-botanical-700 transition-colors">
                Low Light Apartment Plants
              </Link>
            </li>
            <li>
              <Link href="/guides/summer-care" className="hover:text-botanical-700 transition-colors">
                Summer Heat Transit Prep
              </Link>
            </li>
            <li>
              <Link href="/guides/potting-mix-recipe" className="hover:text-botanical-700 transition-colors">
                Aerated Coco-Peat Soil Mix
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-border/80 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} GLOROV Retail India Pvt. Ltd. All rights reserved.</p>
          <p className="text-center md:text-right">
            Agricultural seeds exempt under HSN 1209. GST applied as per statutory schedule.
          </p>
        </div>
      </div>
    </footer>
  )
}
