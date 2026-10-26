import React from 'react'
import { Sparkles, Truck } from 'lucide-react'

export function AnnouncementBar() {
  return (
    <aside
      aria-label="Store Announcement"
      className="bg-botanical-900 text-botanical-100 text-xs py-2 px-4 transition-colors"
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-botanical-300" aria-hidden="true" />
          <span>Pan-India Safe-Transit Live Plants & High-Viability Seeds</span>
        </div>
        <div className="mx-auto md:mx-0 flex items-center gap-1.5 font-medium">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          <span>Free Express Shipping on Seed Orders Above ₹499</span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-botanical-300">
          <span>Carefully Packaged Botanicals</span>
          <span className="text-botanical-600">•</span>
          <span>Agricultural Seeds (HSN 1209)</span>
        </div>
      </div>
    </aside>
  )
}
