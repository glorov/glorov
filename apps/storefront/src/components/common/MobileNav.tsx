'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Sprout,
  Leaf,
  Store,
  Container,
  User,
  ShoppingBag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'

const NAV_ITEMS = [
  { href: '/store', label: 'All Botanical Store', icon: Store },
  { href: '/categories/seeds', label: 'Seeds (Desi & Hybrid)', icon: Sprout },
  { href: '/categories/live-plants', label: 'Live Indoor Plants', icon: Leaf },
  { href: '/categories/planters-pots', label: 'Pots & Planters', icon: Container },
  { href: '/account', label: 'My Account & Orders', icon: User },
  { href: '/cart', label: 'Shopping Cart', icon: ShoppingBag },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        className="text-foreground"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="absolute inset-x-0 top-full z-50 bg-background/98 backdrop-blur-md border-b shadow-lg p-5 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto"
        >
          {/* Mobile Search */}
          <div className="mb-4">
            <SearchInput
              id="mobile-nav-search"
              placeholder="Search seeds, plants, pots..."
              onSearchSubmitted={() => setIsOpen(false)}
            />
          </div>

          <nav aria-label="Mobile Menu" className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-2.5 px-2 rounded-lg text-sm font-medium text-foreground hover:bg-earth-100 hover:text-botanical-800 transition-colors"
                >
                  <Icon className="h-4 w-4 text-botanical-600 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <div className="pt-3 border-t border-border flex flex-col gap-2">
              <Button asChild variant="botanical" className="w-full">
                <Link href="/store" onClick={() => setIsOpen(false)}>
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
