'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, MessageCircle, ExternalLink, ShieldCheck, Truck, RotateCcw, FileText, Lock, Gift } from 'lucide-react'
import styles from '@/app/policies/PolicyPage.module.css'

const POLICIES = [
  {
    href: '/policies/shipping-policy',
    label: 'Shipping & Delivery',
    icon: Truck,
  },
  {
    href: '/policies/refund-policy',
    label: 'Cancellations & Returns',
    icon: RotateCcw,
  },
  {
    href: '/policies/corporate-gifting-policy',
    label: 'Corporate Gifting Policy',
    icon: Gift,
  },
  {
    href: '/policies/terms-of-service',
    label: 'Terms of Service',
    icon: FileText,
  },
  {
    href: '/policies/privacy-policy',
    label: 'Privacy Policy',
    icon: Lock,
  },
]

export function PolicyNav() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar} aria-label="Policy Navigation">
      <div className={styles.navCard}>
        <h2 className={styles.navTitle}>Statutory &amp; Policies</h2>
        <ul className={styles.navList}>
          {POLICIES.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={16} aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight size={15} aria-hidden="true" style={{ opacity: isActive ? 1 : 0.4 }} />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>

      <div className={styles.supportCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <ShieldCheck size={18} color="#0a4c36" />
          <h3 className={styles.supportTitle} style={{ margin: 0 }}>Pune Plant Helpdesk</h3>
        </div>
        <p className={styles.supportDesc}>
          Have questions about shipping times, seed viability, or transit replacement?
        </p>
        <a
          href="https://wa.me/918087087224?text=Hi!+I+have+a+question+about+GLOROV+policies"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.whatsappBtn}
        >
          <MessageCircle size={16} />
          <span>WhatsApp Expert Help</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </aside>
  )
}
