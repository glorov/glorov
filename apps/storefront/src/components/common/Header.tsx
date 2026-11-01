'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  ChevronDown,
  Search,
  User,
  X,
  Sprout,
  Flower2,
  Salad,
  Leaf,
  Store,
  Truck,
  Heart,
  Calendar,
  LayoutDashboard,
  Package,
  MapPin,
  LogOut,
} from 'lucide-react'
import { AnnouncementBar } from './AnnouncementBar'
import { MobileNav } from './MobileNav'
import { SearchInput } from './SearchInput'
import { CartNavButton } from '@/components/cart/CartNavButton'
import { useWishlist } from '@/context/WishlistContext'
import { useCustomer } from '@/context/CustomerContext'
import { GuestUserIcon, UserProfileAvatar } from './icons/UserIcons'
import styles from './Header.module.css'

interface SubCategoryItem {
  href: string
  label: string
  description?: string
  icon?: React.ElementType
}

interface NavLinkItem {
  href: string
  label: string
  subItems?: SubCategoryItem[]
  badge?: string
}

const DESKTOP_NAV_LINKS: NavLinkItem[] = [
  { href: '/offers', label: '⚡ OFFERS' },
  { href: '/store', label: 'All Products' },
  {
    href: '/categories/seeds',
    label: 'Seeds',
    subItems: [
      {
        href: '/sowing-calendar',
        label: 'Indian Sowing Calendar',
        description: 'Month-by-month Kharif, Rabi & Zaid seed guide',
        icon: Calendar,
      },
      {
        href: '/categories/seeds/vegetable-seeds',
        label: 'Desi Vegetable Seeds',
        description: 'High-yield, disease-resistant heirloom seeds',
        icon: Salad,
      },
      {
        href: '/categories/seeds/flower-seeds',
        label: 'Festive Flower Seeds',
        description: 'Vibrant pollinator-friendly bloom varieties',
        icon: Flower2,
      },
      {
        href: '/categories/seeds/herb-seeds',
        label: 'Medicinal & Herb Seeds',
        description: 'Kitchen garden essentials including Krishna Tulsi',
        icon: Sprout,
      },
      {
        href: '/categories/seeds',
        label: 'Explore All Seeds',
        description: 'Browse complete germination-tested collection',
        icon: Store,
      },
    ],
  },
  {
    href: '/categories/live-plants',
    label: 'Live Plants',
    subItems: [
      {
        href: '/categories/live-plants/indoor-plants',
        label: 'Indoor & Air-Purifying',
        description: 'Low-light resilient live plants with ceramic pots',
        icon: Leaf,
      },
      {
        href: '/categories/live-plants',
        label: 'All Live Plants',
        description: 'Root-safe nursery dispatched potted plants',
        icon: Store,
      },
    ],
  },
  { href: '/sowing-calendar', label: 'Sowing Calendar' },
  { href: '/care-companion', label: 'Care Companion' },
  { href: '/community', label: 'Community' },
  { href: '/plant-parent-club', label: 'Rewards Club' },
  { href: '/plant-finder', label: 'Plant Finder' },
  { href: '/plant-doctor', label: 'Plant Doctor' },
  { href: '/garden-services', label: 'Garden Services' },
  { href: '/subscriptions', label: 'Subscriptions' },
  { href: '/stores', label: 'Studios' },
  { href: '/gift-builder', label: 'Gift Hamper' },
  { href: '/gardening-guide', label: 'Gardening Guide' },
  { href: '/blog', label: 'Blog' },
  { href: '/gifting', label: 'Gifting' },
  { href: '/about', label: 'About Us' },
  { href: '/why-glorov', label: 'Why GLOROV' },
  { href: '/shipping/tracker', label: 'Track Order' },
  { href: '/contact', label: 'Contact' },
]

export function Header() {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  const { totalItems: totalWishlistItems } = useWishlist()
  const { customer, isAuthenticated, logout } = useCustomer()
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  // Scroll detection for sticky shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Clear hover timeouts
  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current)
    }
    setActiveDropdown(label)
  }

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  // Close dropdowns on route navigation or Escape
  useEffect(() => {
    setActiveDropdown(null)
    setProfileMenuOpen(false)
    setMobileSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
        setProfileMenuOpen(false)
        setMobileSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    setProfileMenuOpen(false)
    await logout()
  }

  // Determine routes where top header should be hidden
  const isCategoryPage = pathname?.startsWith('/categories') || pathname?.startsWith('/category')
  const isCartPage = pathname === '/cart' || pathname?.startsWith('/cart')
  const isAccountPage = pathname?.startsWith('/account')

  // On cart and account pages, hide the global top header completely
  if (isCartPage || isAccountPage) {
    return null
  }

  return (
    <header
      className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''} ${
        isCategoryPage ? styles.headerMobileHidden : ''
      }`}
    >
      {/* 1. Promotional / Safe-Transit Announcement Bar */}
      <AnnouncementBar />

      {/* 2. Main Navigation Bar - Tier 1: Logo, Pill Search, Right Actions */}
      <div className={styles.headerTier1}>
        {/* Left Section: Mobile Nav Drawer Button & Brand Logo */}
        <div className={styles.leftSection}>
          <MobileNav />

          <Link
            href="/"
            className={styles.logoLink}
            aria-label="GLOROV Homepage"
          >
            <div className={styles.logoImageWrapper}>
              <Image
                src="/glorov-logo.svg"
                alt="GLOROV"
                fill
                priority
                className={styles.logoImg}
              />
            </div>
          </Link>
        </div>

        {/* Center Section: Pill Search Bar (Desktop / Laptop) */}
        <div className={styles.centerSection}>
          <div className={styles.searchPillBox}>
            <SearchInput
              id="header-desktop-search"
              placeholder="Search plant, seeds, garden essentials..."
              inputClassName={styles.searchInput}
            />
          </div>
        </div>

        {/* Right Section: Utility Links & Cart Button */}
        <div className={styles.rightSection}>
          <Link
            href="/shipping/tracker"
            className={styles.actionLink}
            aria-label="Track your order"
          >
            <Truck size={16} aria-hidden="true" style={{ color: 'var(--ugaoo-maroon)' }} />
            <span>Track Order</span>
          </Link>

          <Link
            href="/wishlist"
            className={styles.actionLink}
            aria-label={`View Wishlist (${totalWishlistItems} saved specimens)`}
          >
            <Heart size={16} aria-hidden="true" />
            <span>Wishlist</span>
            {totalWishlistItems > 0 && (
              <span className={styles.wishlistBadge}>{totalWishlistItems}</span>
            )}
          </Link>

          {/* User Account / Dynamic Profile Section */}
          <div
            className={styles.profileContainer}
            ref={profileRef}
            onMouseEnter={() => isAuthenticated && setProfileMenuOpen(true)}
            onMouseLeave={() => isAuthenticated && setProfileMenuOpen(false)}
          >
            {isAuthenticated && customer ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`${styles.profileButton} ${profileMenuOpen ? styles.profileButtonActive : ''}`}
                  aria-expanded={profileMenuOpen}
                  aria-haspopup="true"
                  aria-label={`Account menu for ${customer.first_name || 'Customer'}`}
                >
                  <UserProfileAvatar customer={customer} size={24} />
                  <span>{customer.first_name || 'Account'}</span>
                  <ChevronDown
                    size={12}
                    style={{
                      transition: 'transform 180ms ease',
                      transform: profileMenuOpen ? 'rotate(180deg)' : 'none',
                    }}
                    aria-hidden="true"
                  />
                </button>

                {profileMenuOpen && (
                  <div className={styles.profileDropdown} role="menu" aria-label="Customer account options">
                    <div className={styles.dropdownUserHeader}>
                      <UserProfileAvatar customer={customer} size={36} />
                      <div className={styles.dropdownUserInfo}>
                        <span className={styles.dropdownUserName}>
                          {customer.first_name} {customer.last_name || ''}
                        </span>
                        <span className={styles.dropdownUserEmail} title={customer.email}>
                          {customer.email}
                        </span>
                        <span className={styles.dropdownBadge}>Verified Customer</span>
                      </div>
                    </div>

                    <ul className={styles.dropdownLinksList} role="none">
                      <li role="none">
                        <Link
                          href="/account"
                          className={styles.dropdownLinkItem}
                          onClick={() => setProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          <LayoutDashboard size={15} aria-hidden="true" style={{ color: 'var(--ugaoo-dark, #0a4c36)' }} />
                          <span>Account Dashboard</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/account/orders"
                          className={styles.dropdownLinkItem}
                          onClick={() => setProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          <Package size={15} aria-hidden="true" style={{ color: 'var(--ugaoo-dark, #0a4c36)' }} />
                          <span>Orders &amp; Tracking</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/account/addresses"
                          className={styles.dropdownLinkItem}
                          onClick={() => setProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          <MapPin size={15} aria-hidden="true" style={{ color: 'var(--ugaoo-dark, #0a4c36)' }} />
                          <span>Saved Addresses</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/account/profile"
                          className={styles.dropdownLinkItem}
                          onClick={() => setProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          <User size={15} aria-hidden="true" style={{ color: 'var(--ugaoo-dark, #0a4c36)' }} />
                          <span>Profile &amp; Password</span>
                        </Link>
                      </li>
                      <li role="none">
                        <Link
                          href="/wishlist"
                          className={styles.dropdownLinkItem}
                          onClick={() => setProfileMenuOpen(false)}
                          role="menuitem"
                        >
                          <Heart size={15} aria-hidden="true" style={{ color: 'var(--ugaoo-maroon, #722f37)' }} />
                          <span>Botanical Wishlist</span>
                        </Link>
                      </li>
                    </ul>

                    <hr className={styles.dropdownDivider} aria-hidden="true" />

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className={styles.dropdownLogoutBtn}
                      role="menuitem"
                      aria-label="Sign out of GLOROV account"
                    >
                      <LogOut size={15} aria-hidden="true" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/account/login"
                className={styles.actionLink}
                aria-label="Sign in to your account"
              >
                <GuestUserIcon size={18} aria-hidden="true" />
                <span>Sign In</span>
              </Link>
            )}
          </div>

          {/* Mobile search toggle button */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={styles.mobileSearchToggle}
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Slide-out Cart Button */}
          <CartNavButton />
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && (
        <div className={styles.mobileSearchContainer}>
          <SearchInput
            id="header-mobile-expandable-search"
            placeholder="Search plant, seeds, planters..."
            onSearchSubmitted={() => setMobileSearchOpen(false)}
            inputClassName={styles.searchInput}
          />
        </div>
      )}

      {/* 3. Main Navigation Bar - Tier 2: Horizontal Category Links (Desktop) */}
      <div className={styles.headerTier2}>
        <div className={styles.navContainer}>
          <nav
            aria-label="Main Navigation"
            className={styles.desktopNav}
          >
            <ul className={styles.navList}>
              {DESKTOP_NAV_LINKS.map((link) => {
                const isSeeds = link.label === 'Seeds'
                const isPlants = link.label === 'Live Plants'
                const hasDropdown = isSeeds || isPlants
                const isOpen = activeDropdown === link.label
                const isActive =
                  link.href === '/store'
                    ? pathname === '/store'
                    : pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))

                return (
                  <li
                    key={link.label}
                    className={styles.navItem}
                    onMouseEnter={() => hasDropdown && handleMouseEnter(link.label)}
                    onMouseLeave={() => hasDropdown && handleMouseLeave()}
                  >
                    <Link
                      href={link.href}
                      className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                      aria-expanded={hasDropdown ? isOpen : undefined}
                      aria-haspopup={hasDropdown ? 'true' : undefined}
                    >
                      <span>{link.label}</span>
                      {link.badge && <span className={styles.saleBadge}>{link.badge}</span>}
                      {hasDropdown && (
                        <ChevronDown
                          size={14}
                          style={{
                            transition: 'transform 200ms ease',
                            transform: isOpen ? 'rotate(180deg)' : 'none',
                            color: isOpen ? 'var(--ugaoo-maroon)' : undefined,
                          }}
                          aria-hidden="true"
                        />
                      )}
                    </Link>

                    {/* Mega Dropdown Menu */}
                    {hasDropdown && isOpen && (
                      <div
                        className={styles.dropdownMenu}
                        onMouseEnter={() => handleMouseEnter(link.label)}
                        onMouseLeave={handleMouseLeave}
                        role="region"
                        aria-label={`${link.label} submenu`}
                      >
                        {link.subItems?.map((sub) => {
                          const SubIcon = sub.icon || Sprout
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              className={styles.dropdownItem}
                              onClick={() => setActiveDropdown(null)}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  backgroundColor: 'var(--ugaoo-butter, #fff3d9)',
                                  color: 'var(--ugaoo-maroon, #93113a)',
                                  flexShrink: 0,
                                }}
                              >
                                <SubIcon size={16} />
                              </div>
                              <div>
                                <div className={styles.dropdownItemTitle}>{sub.label}</div>
                                {sub.description && (
                                  <div className={styles.dropdownItemDesc}>{sub.description}</div>
                                )}
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
