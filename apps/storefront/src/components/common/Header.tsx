'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Search, User, X } from 'lucide-react'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileNav } from './MobileNav'
import { SearchInput } from './SearchInput'
import { CartNavButton } from '@/components/cart/CartNavButton'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/store', label: 'All Products' },
  { href: '/categories/seeds', label: 'Seeds' },
  { href: '/categories/live-plants', label: 'Live Plants' },
  { href: '/categories/planters-pots', label: 'Planters & Pots' },
]

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 relative">
      <AnnouncementBar />
      <div className="container mx-auto flex h-16 items-center justify-between gap-1.5 sm:gap-4 px-3 sm:px-6">
        {/* Left: Mobile Nav & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          <MobileNav />
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 rounded-lg p-0.5"
            aria-label="GLOROV Homepage"
          >
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-botanical-700 flex items-center justify-center text-white shadow-xs group-hover:bg-botanical-800 transition-colors shrink-0">
              <Leaf className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-lg sm:text-xl text-botanical-950 leading-none">
                GLOROV
              </span>
              <span className="hidden min-[380px]:inline text-[10px] uppercase tracking-widest text-botanical-700 font-bold leading-tight">
                Botanicals &amp; Seeds
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/store'
                ? pathname === '/store'
                : pathname.startsWith(link.href)

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'py-1 transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 rounded-sm',
                  isActive
                    ? 'text-botanical-900 font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-botanical-700'
                    : 'text-foreground/80 hover:text-botanical-700 hover:after:content-[""] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-botanical-400'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions (Search, Account, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Search input */}
          <div className="hidden sm:block">
            <SearchInput
              id="desktop-header-search"
              className="w-44 md:w-56 xl:w-72"
            />
          </div>

          {/* Mobile Search Toggle Button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="sm:hidden text-foreground/80 hover:text-botanical-700 min-h-[38px] min-w-[38px] rounded-lg focus-visible:ring-2 focus-visible:ring-botanical-600"
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Search className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>

          {/* Account Icon */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-foreground/80 hover:text-botanical-700 min-h-[38px] min-w-[38px] rounded-lg focus-visible:ring-2 focus-visible:ring-botanical-600"
          >
            <Link href="/account" aria-label="Customer Account">
              <User className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>

          {/* Cart Icon with Counter */}
          <CartNavButton />
        </div>
      </div>

      {/* Expandable Mobile Search Bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-border bg-background animate-in slide-in-from-top duration-150">
          <SearchInput
            id="mobile-header-search"
            autoFocus
            onSearchSubmitted={() => setMobileSearchOpen(false)}
          />
        </div>
      )}
    </header>
  )
}
