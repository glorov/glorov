'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Sprout, Leaf, Flower2, Container, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
  { href: '/categories/seeds', label: 'Seeds (Desi & Hybrid)', icon: Sprout },
  { href: '/categories/live-plants', label: 'Live Indoor Plants', icon: Leaf },
  { href: '/categories/flowering', label: 'Flowering & Outdoor', icon: Flower2 },
  { href: '/categories/planters', label: 'Pots & Planters', icon: Container },
  { href: '/categories/plant-care', label: 'Organic Care & Mix', icon: ShieldCheck },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-50 bg-background/98 backdrop-blur-md border-b shadow-lg p-6 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-4">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2 text-base font-medium text-foreground/80 hover:text-primary transition-colors border-b border-border/40"
                >
                  <Icon className="h-5 w-5 text-botanical-600" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-4 flex flex-col gap-2">
              <Button asChild variant="botanical" className="w-full">
                <Link href="/catalog" onClick={() => setIsOpen(false)}>
                  Browse All Botanical Catalog
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )
}
