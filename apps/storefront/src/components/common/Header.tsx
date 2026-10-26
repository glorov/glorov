'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Leaf, Search, User, X } from 'lucide-react'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileNav } from './MobileNav'
import { SearchInput } from './SearchInput'
import { CartNavButton } from '@/components/cart/CartNavButton'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/store', label: 'All Products' },
  { href: '/categories/seeds', label: 'Seeds' },
  { href: '/categories/live-plants', label: 'Live Plants' },
  { href: '/categories/planters-pots', label: 'Planters & Pots' },
]

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 relative">
      <AnnouncementBar />
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6">
        {/* Left: Mobile Nav & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          <MobileNav />
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 rounded-lg p-0.5"
            aria-label="GLOROV Homepage"
          >
            <div className="h-9 w-9 rounded-lg bg-botanical-700 flex items-center justify-center text-white shadow-xs group-hover:bg-botanical-800 transition-colors shrink-0">
              <Leaf className="h-5 w-5 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-xl text-botanical-950 leading-none">
                GLOROV
              </span>
              <span className="text-[10px] uppercase tracking-widest text-botanical-700 font-bold leading-tight">
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
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/85 hover:text-botanical-700 transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-botanical-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-botanical-600 rounded-sm"
            >
              {link.label}
            </Link>
          ))}
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
            className="sm:hidden text-foreground/80 hover:text-botanical-700"
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
            className="text-foreground/80 hover:text-botanical-700"
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
