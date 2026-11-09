import type { Metadata, Viewport } from 'next'
import React from 'react'
import Script from 'next/script'
import '../styles/globals.css'
import { StorefrontLayout } from '../components/layout/StorefrontLayout'
import { BotanicalSplashScreen } from '../components/layout/BotanicalSplashScreen'
import { BASE_URL, SITE_NAME } from '../lib/constants'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${SITE_NAME} — Premium Seeds, Live Plants & Botanical Gardening Supplies`,
    template: `%s | GLOROV`,
  },
  description:
    'Shop authentic premium vegetable & flower seeds with guaranteed germination, live indoor & outdoor plants, and aromatic kitchen herbs from GLOROV. Fast delivery across India.',
  keywords: [
    'GLOROV',
    'seeds',
    'vegetable seeds',
    'flower seeds',
    'indoor plants',
    'live plants',
    'kitchen herbs',
    'flowering plants',
    'organic gardening',
    'garden store India',
    'heirloom seeds',
    'air purifying plants',
  ],
  authors: [{ name: 'GLOROV Botanical' }],
  creator: 'GLOROV',
  publisher: 'GLOROV',
  applicationName: 'GLOROV',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: 'GLOROV',
    title: 'GLOROV — Premium Seeds, Live Plants & Botanical Gardening Supplies',
    description:
      'Shop authentic premium vegetable & flower seeds with guaranteed germination, live indoor & outdoor plants, handcrafted ceramic planters, and organic gardening supplies from GLOROV. Fast delivery across India.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GLOROV — Botanical Nursery & Premium Seeds',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@glorov_in',
    creator: '@glorov_in',
    title: 'GLOROV — Premium Seeds, Live Plants & Botanical Gardening Supplies',
    description:
      'Shop authentic premium vegetable & flower seeds with guaranteed germination, live indoor & outdoor plants, handcrafted ceramic planters, and organic gardening supplies from GLOROV. Fast delivery across India.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GLOROV',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1B4332', // GLOROV Forest Deep
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <html lang="en">
      <body className="bg-[#FAF8F5]">
        {/* Instant Native Botanical Splash Screen matching Flutter Web */}
        <BotanicalSplashScreen />

        {/* Razorpay Web Checkout SDK */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        <StorefrontLayout>{children}</StorefrontLayout>
      </body>
    </html>
  )
}
