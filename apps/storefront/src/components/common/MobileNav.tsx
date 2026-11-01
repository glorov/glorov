'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  Sprout,
  Leaf,
  Store,
  User,
  ShoppingBag,
  Sparkles,
  Truck,
  ChevronRight,
  Salad,
  Flower2,
  Gift,
  Compass,
  BookOpen,
  MapPin,
  Stethoscope,
  Package,
  Calendar,
  Droplets,
  Users,
  Tag,
  Coins,
  TreeDeciduous,
  Award,
} from 'lucide-react'
import styles from './MobileNav.module.css'
import { SearchInput } from '@/components/common/SearchInput'

interface MobileNavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: string
  subItems?: { href: string; label: string; icon: React.ElementType }[]
}

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  {
    href: '/store',
    label: 'All Botanical Store',
    icon: Store,
  },
  {
    href: '/offers',
    label: 'Offers & Coupons',
    icon: Tag,
    badge: 'Sale',
  },
  {
    href: '/plant-parent-club',
    label: 'Plant Parent Rewards Club',
    icon: Coins,
    badge: '200 Coins',
  },
  {
    href: '/categories/seeds',
    label: 'Seeds (Desi & Hybrid)',
    icon: Sprout,
    badge: 'Popular',
    subItems: [
      { href: '/categories/seeds/vegetable-seeds', label: 'Desi Vegetables', icon: Salad },
      { href: '/categories/seeds/flower-seeds', label: 'Festive Flowers', icon: Flower2 },
      { href: '/categories/seeds/herb-seeds', label: 'Medicinal Herbs', icon: Sprout },
    ],
  },
  {
    href: '/categories/live-plants',
    label: 'Live Indoor Plants',
    icon: Leaf,
    subItems: [
      { href: '/categories/live-plants/indoor-plants', label: 'Air-Purifying Plants', icon: Leaf },
    ],
  },
  {
    href: '/sowing-calendar',
    label: 'Indian Sowing Calendar',
    icon: Calendar,
    badge: 'Guide',
  },
  {
    href: '/care-companion',
    label: 'Care Companion & Hydration',
    icon: Droplets,
  },
  {
    href: '/community',
    label: 'Botanical Community',
    icon: Users,
    badge: '100k+',
  },
  {
    href: '/gift-builder',
    label: 'Custom Gift Hamper',
    icon: Gift,
  },
  {
    href: '/plant-doctor',
    label: 'Plant Doctor Clinic',
    icon: Stethoscope,
    badge: 'Free',
  },
  {
    href: '/garden-services',
    label: 'Garden Services & Care',
    icon: TreeDeciduous,
    badge: 'Turnkey',
  },
  {
    href: '/subscriptions',
    label: 'Green Routine Box',
    icon: Package,
  },
  {
    href: '/stores',
    label: 'Botanical Studios',
    icon: Store,
  },
  {
    href: '/plant-finder',
    label: 'Plant Finder Quiz',
    icon: Compass,
    badge: 'New',
  },
  {
    href: '/gardening-guide',
    label: 'Gardening Guide',
    icon: Sparkles,
  },
  {
    href: '/blog',
    label: 'Botanical Blog',
    icon: BookOpen,
  },
  {
    href: '/nursery',
    label: 'Visit Pune Nursery',
    icon: MapPin,
  },
  {
    href: '/gifting',
    label: 'Green Gifting',
    icon: Gift,
  },
  {
    href: '/shipping/tracker',
    label: 'Track Shipment',
    icon: Truck,
  },
  {
    href: '/about',
    label: 'Our Story (Pune Nursery)',
    icon: Leaf,
  },
  {
    href: '/why-glorov',
    label: 'Why GLOROV (Quality Standard)',
    icon: Award,
  },
  {
    href: '/contact',
    label: 'Contact & Support',
    icon: User,
  },
  {
    href: '/account',
    label: 'My Account & Orders',
    icon: User,
  },
  {
    href: '/cart',
    label: 'Shopping Cart',
    icon: ShoppingBag,
  },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
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
    <div className={styles.mobileNavWrapper}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        className={`${styles.hamburgerBtn} min-h-[44px] min-w-[44px]`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className={`${styles.backdrop} ${styles.backdropOpen}`}
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            className={`${styles.drawer} ${styles.drawerOpen}`}
          >
            {/* Drawer Header with Logo & Close Button */}
            <div className={styles.drawerHeader}>
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                aria-label="GLOROV Homepage"
              >
                <div className={styles.drawerLogo}>
                  <Image
                    src="/glorov-logo.svg"
                    alt="GLOROV"
                    fill
                    priority
                    className={styles.drawerLogoImg}
                  />
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Dismiss navigation"
                className={`${styles.closeButton} min-h-[44px] min-w-[44px]`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Embedded Live Search Bar */}
            <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid rgba(230, 222, 210, 0.6)' }}>
              <SearchInput
                id="mobile-nav-search"
                placeholder="Search seeds, plants..."
                onSearchSubmitted={() => setIsOpen(false)}
              />
            </div>

            {/* Scrollable Navigation List */}
            <div className={styles.drawerBody}>
              <nav aria-label="Mobile Menu">
                <ul className={styles.navList}>
                  {MOBILE_NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.href === '/store'
                        ? pathname === '/store'
                        : pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    const hasSub = Boolean(item.subItems && item.subItems.length > 0)
                    const isExpanded = expandedSection === item.href

                    return (
                      <li key={item.href} className={styles.navItem}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Link
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            aria-current={isActive ? 'page' : undefined}
                            className={styles.navLink}
                            style={isActive ? { color: 'var(--ugaoo-maroon)', fontWeight: 700 } : undefined}
                          >
                            <span className={styles.navLinkLeft}>
                              <Icon className={styles.navIcon} aria-hidden="true" />
                              <span>{item.label}</span>
                            </span>
                            {item.badge && <span className={styles.badge}>{item.badge}</span>}
                          </Link>

                          {hasSub && (
                            <button
                              type="button"
                              onClick={() => setExpandedSection(isExpanded ? null : item.href)}
                              aria-label={`Toggle ${item.label} subcategories`}
                              aria-expanded={isExpanded}
                              style={{ padding: '0.5rem', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                              <ChevronRight
                                size={16}
                                className={`${styles.chevronIcon} ${isExpanded ? styles.chevronOpen : ''}`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Subcategory Links */}
                        {hasSub && isExpanded && (
                          <ul className={styles.subList}>
                            {item.subItems?.map((sub) => {
                              const SubIcon = sub.icon
                              const isSubActive = pathname === sub.href

                              return (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`${styles.subLink} min-h-[44px]`}
                                    style={isSubActive ? { color: 'var(--ugaoo-maroon)', fontWeight: 700 } : undefined}
                                  >
                                    <SubIcon size={14} style={{ color: 'var(--ugaoo-maroon)', flexShrink: 0 }} />
                                    <span>{sub.label}</span>
                                  </Link>
                                </li>
                              )
                            })}
                          </ul>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </nav>
            </div>

            {/* Drawer Footer with Botanical Assurances */}
            <div className={styles.drawerFooter}>
              <div className={styles.trustTag}>
                <Sparkles size={16} style={{ color: 'var(--ugaoo-maroon)', flexShrink: 0 }} />
                <span>Free Express Shipping on Seeds &gt; ₹499</span>
              </div>
              <div className={styles.trustTag} style={{ fontSize: '11px', color: 'rgba(4, 32, 24, 0.7)' }}>
                <Truck size={14} style={{ color: 'var(--ugaoo-green)', flexShrink: 0 }} />
                <span>Pune Nursery Dispatch • Safe-Transit Guaranteed</span>
              </div>
              <Link
                href="/store"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '44px',
                  backgroundColor: 'var(--ugaoo-maroon)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-pill)',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 700,
                  marginTop: '0.25rem',
                }}
              >
                Browse All Botanical Catalog
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
