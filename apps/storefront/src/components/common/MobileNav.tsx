'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
import { cn } from '@/lib/utils'

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
  const pathname = usePathname()

  // Close on Escape key & manage body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        document.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Close when pathname changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        className="text-foreground min-h-[40px] min-w-[40px] rounded-lg focus-visible:ring-2 focus-visible:ring-botanical-600"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs -z-10 animate-in fade-in-0 duration-150"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className="absolute inset-x-0 top-full z-50 bg-background/98 backdrop-blur-md border-b shadow-xl p-5 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto"
          >
            {/* Mobile Search */}
            <div className="mb-4">
              <SearchInput
                id="mobile-nav-search"
                placeholder="Search seeds, plants, pots..."
                onSearchSubmitted={() => setIsOpen(false)}
              />
            </div>

            <nav aria-label="Mobile Menu" className="flex flex-col space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive =
                  item.href === '/store'
                    ? pathname === '/store'
                    : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 py-3 px-3 rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                      isActive
                        ? 'bg-botanical-100 text-botanical-950 font-bold border-l-4 border-botanical-700 shadow-2xs'
                        : 'text-foreground/90 hover:bg-earth-100 hover:text-botanical-900'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        isActive ? 'text-botanical-800' : 'text-botanical-600'
                      )}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Button asChild variant="botanical" className="w-full h-11 text-xs font-semibold">
                  <Link href="/store" onClick={() => setIsOpen(false)}>
                    Browse All Botanical Catalog
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  )
}
