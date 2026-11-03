import type { Metadata } from 'next'
import React from 'react'
import { HeroBannerSlider } from '../components/home/HeroBannerSlider'
import { ValuePropsRibbon } from '../components/home/ValuePropsRibbon'
import { CategoryDiscoveryGrid } from '../components/home/CategoryDiscoveryGrid'
import { FeaturedProductsSection } from '../components/home/FeaturedProductsSection'
import { BotanicalEditorialShowcase } from '../components/home/BotanicalEditorialShowcase'
import { ScrollRevealSection } from '../components/ui/ScrollRevealSection'
import { SITE_NAME, BASE_URL } from '../lib/constants'

export const metadata: Metadata = {
  title: `${SITE_NAME} — Authentic Indian Seeds, Live Houseplants & Organic Care`,
  description:
    'GLOROV is an organic seed sanctuary and live plant nursery. Order indigenous Desi heirloom vegetable seeds, indoor air-purifying houseplants, and artisan planters online with 100% transit guarantee across India.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${SITE_NAME} — Grow More. Live Greener.`,
    description:
      'Buy indigenous Desi seeds, indoor houseplants, and organic plant care online. Pan-India safe delivery.',
    url: '/',
    siteName: 'GLOROV',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GLOROV — Botanical Nursery & Premium Seeds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Grow More. Live Greener.`,
    description:
      'Buy indigenous Desi seeds, indoor houseplants, and organic plant care online. Pan-India safe delivery.',
    images: ['/og-image.jpg'],
  },
}

export default function HomePage() {
  // JSON-LD Structured Data for Botanical Organization & E-Commerce WebSite
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: SITE_NAME,
        url: BASE_URL,
        logo: `${BASE_URL}/logo/glorov-logo.svg`,
        description:
          'Indian botanical garden nursery offering organic heirloom seeds, live plants, and sustainable gardening supplies.',
        contactPoint: {
          '@type': 'ContactPoint',
          email: 'support@glorov.in',
          contactType: 'customer support',
          areaServed: 'IN',
          availableLanguage: ['en', 'hi'],
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: SITE_NAME,
        publisher: { '@id': `${BASE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${BASE_URL}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <>
      {/* Schema.org Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full">
        {/* 1. Multi-device Hero Banner Slider (Instant above-the-fold display) */}
        <HeroBannerSlider />

        {/* 2. Trust Badges & Botanical Value Props (Smooth Hardware-Accelerated Reveal) */}
        <ScrollRevealSection delay={0.04} yOffset={24}>
          <ValuePropsRibbon />
        </ScrollRevealSection>

        {/* 3. Category Discovery Grid (Smooth Hardware-Accelerated Reveal) */}
        <ScrollRevealSection delay={0.05} yOffset={28}>
          <CategoryDiscoveryGrid />
        </ScrollRevealSection>

        {/* 4. Featured Botanical Products (Smooth Hardware-Accelerated Reveal) */}
        <ScrollRevealSection delay={0.05} yOffset={28}>
          <FeaturedProductsSection />
        </ScrollRevealSection>

        {/* 5. Editorial Botanical Showcase (Smooth Hardware-Accelerated Reveal) */}
        <ScrollRevealSection delay={0.05} yOffset={28}>
          <BotanicalEditorialShowcase />
        </ScrollRevealSection>
      </div>
    </>
  )
}
