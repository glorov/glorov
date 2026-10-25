import React from 'react'
import Link from 'next/link'
import { Leaf, Search, ShoppingBag, User } from 'lucide-react'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileNav } from './MobileNav'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/categories/seeds', label: 'Seeds' },
  { href: '/categories/live-plants', label: 'Live Plants' },
  { href: '/categories/planters', label: 'Planters' },
  { href: '/categories/plant-care', label: 'Soil & Care' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 relative">
      <AnnouncementBar />
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Mobile Nav & Brand Logo */}
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-lg bg-botanical-700 flex items-center justify-center text-white shadow-sm group-hover:bg-botanical-800 transition-colors">
              <Leaf className="h-5 w-5 text-emerald-200" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-xl text-botanical-900 leading-none">
                GLOROV
              </span>
              <span className="text-[10px] uppercase tracking-widest text-botanical-600 font-semibold leading-tight">
                Botanicals & Seeds
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-8 text-sm font-medium"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/80 hover:text-botanical-700 transition-colors py-1 relative hover:after:content-[''] hover:after:absolute hover:after:bottom-0 hover:after:left-0 hover:after:w-full hover:after:h-[2px] hover:after:bg-botanical-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions (Search, Account, Cart) */}
        <div className="flex items-center gap-2">
          {/* Quick Search trigger */}
          <div className="hidden sm:flex relative items-center">
            <input
              type="search"
              placeholder="Search seeds, plants, pots..."
              className="w-48 xl:w-64 h-9 rounded-full border border-border bg-earth-50/70 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-botanical-600 focus:bg-background transition-all"
            />
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>

          {/* Account Icon */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-foreground/80 hover:text-botanical-700"
          >
            <Link href="/account" aria-label="Customer Account">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          {/* Cart Icon with Counter */}
          <Button
            asChild
            variant="botanical"
            size="sm"
            className="relative gap-1.5 rounded-full px-3"
          >
            <Link href="/cart" aria-label="Shopping Cart">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-botanical-950">
                0
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
