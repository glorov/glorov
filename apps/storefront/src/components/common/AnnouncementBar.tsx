'use client'

import React, { useState, useEffect } from 'react'
import { Truck, ShieldCheck, Sprout, Zap, Percent } from 'lucide-react'
import styles from './AnnouncementBar.module.css'

export interface AnnouncementItem {
  id: string
  text: string
  highlight_text?: string
  icon?: string
  link_url?: string
}

export const DEFAULT_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ann_free_shipping_499',
    text: 'FREE EXPRESS BOTANICAL DELIVERY ON ORDERS OVER ₹499',
    highlight_text: '₹499 FREE DELIVERY',
    icon: 'truck',
    link_url: '/store',
  },
  {
    id: 'ann_grow_more',
    text: 'GROW MORE. LIVE GREENER. • DISPATCHED FRESH FROM PUNE NURSERY',
    highlight_text: 'GLOROV BOTANICALS',
    icon: 'sprout',
    link_url: '/store',
  },
  {
    id: 'ann_glorov10',
    text: 'USE CODE GLOROV10 AT CHECKOUT FOR 10% OFF YOUR ORDER',
    highlight_text: 'USE CODE GLOROV10',
    icon: 'percent',
    link_url: '/store',
  },
  {
    id: 'ann_organic_seeds',
    text: '100% ORGANIC & NON-GMO HEIRLOOM SEEDS • 0% GST SPECIAL',
    highlight_text: '100% ORGANIC SEEDS',
    icon: 'shield',
    link_url: '/store?category=seeds',
  },
  {
    id: 'ann_safe_transit',
    text: 'ROOT-SAFE ECO-PACKAGING • 48-HOUR LIVE SPECIMEN GUARANTEE',
    highlight_text: 'SAFE TRANSIT',
    icon: 'zap',
    link_url: '/policies/shipping',
  },
]

function renderIcon(iconName?: string) {
  switch (iconName) {
    case 'truck':
    case 'local_shipping':
      return <Truck size={13} className={styles.itemIcon} aria-hidden="true" />
    case 'sprout':
    case 'spa':
      return <Sprout size={13} className={styles.itemIcon} aria-hidden="true" />
    case 'zap':
    case 'bolt':
      return <Zap size={13} className={styles.itemIcon} aria-hidden="true" />
    case 'percent':
      return <Percent size={13} className={styles.itemIcon} aria-hidden="true" />
    case 'shield':
    case 'verified':
    default:
      return <ShieldCheck size={13} className={styles.itemIcon} aria-hidden="true" />
  }
}

export function AnnouncementBar() {
  const [items, setItems] = useState<AnnouncementItem[]>(DEFAULT_ANNOUNCEMENTS)
  const [isEnabled, setIsEnabled] = useState(true)

  useEffect(() => {
    // Optionally fetch dynamic configuration from backend if reachable
    fetch('/api/store/announcements')
      .then((res) => {
        if (!res.ok) throw new Error('Store announcements unavailable')
        return res.json()
      })
      .then((data) => {
        if (data.config && typeof data.config.is_enabled === 'boolean') {
          setIsEnabled(data.config.is_enabled)
        }
        if (Array.isArray(data.items) && data.items.length > 0) {
          setItems(data.items)
        }
      })
      .catch(() => {
        // Graceful fallback to rich default ticker items
      })
  }, [])

  if (!isEnabled || items.length === 0) {
    return null
  }

  // Duplicate the list 3 times to create a completely seamless infinite continuous marquee loop
  const marqueeItems = [...items, ...items, ...items]

  return (
    <aside
      role="region"
      aria-label="Storefront Announcement Marquee"
      className={styles.announcementBar}
    >
      <div className={styles.marqueeViewport}>
        <div className={styles.marqueeTrack}>
          {marqueeItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={styles.marqueeItem}
              title={item.text}
            >
              {renderIcon(item.icon)}

              {item.highlight_text && (
                <span className={styles.badgeHighlight}>
                  {item.highlight_text}
                </span>
              )}

              <span className={styles.messageText}>{item.text}</span>

              <span className={styles.dividerDot} aria-hidden="true">
                •
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
