import React from 'react'
import Link from 'next/link'
import styles from './TransformHome.module.css'

const SPACES = [
  {
    title: 'Living Room',
    cta: 'Explore Living Room Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/space-living.webp',
  },
  {
    title: 'Bedroom',
    cta: 'Explore Bedroom Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/space-bedroom.webp',
  },
  {
    title: 'Balcony',
    cta: 'Explore Balcony Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/space-balcony.webp',
  },
  {
    title: 'Office',
    cta: 'Explore Office Plants',
    href: '/categories/live-plants',
    image: '/ugaoo-assets/space-office.webp',
  },
]

export function TransformHome() {
  return (
    <section className={styles.section} aria-label="Transform Your Home Spaces">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.heading}>
            Transform Your <em>Home</em>.
          </h2>
          <p className={styles.subtitle}>
            Living botanicals curated to thrive in the light, humidity, and aesthetic of every room in your home.
          </p>
        </div>

        <div className={styles.grid}>
          {SPACES.map((space) => (
            <Link
              key={space.title}
              href={space.href}
              className={styles.card}
              aria-label={`Shop plants for ${space.title}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={space.image}
                alt={`${space.title} plants`}
                className={styles.img}
              />
              <div className={styles.overlay} />
              <h3 className={styles.title}>{space.title}</h3>
              <span className={styles.ctaPill}>{space.cta}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
