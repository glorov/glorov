import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import { MobileDock } from '@/components/common/MobileDock'
import { CartProvider } from '@/context/CartContext'
import { WishlistProvider } from '@/context/WishlistContext'
import { CustomerProvider } from '@/context/CustomerContext'
import { CartDrawer } from '@/components/cart/CartDrawer'
import './globals.css'
import styles from './RootLayout.module.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
})

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://glorov.in'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery',
    template: '%s | GLOROV Botanicals',
  },
  description:
    'Buy high-viability garden seeds, outdoor & indoor live potted plants, planters, and organic potting mixes online in India. Pan-India dispatch from our Pune nursery hub.',
  keywords: [
    'seeds india',
    'buy plants online',
    'indoor plants',
    'vegetable seeds',
    'organic potting mix',
    'botanical nursery',
    'GLOROV',
  ],
  authors: [{ name: 'GLOROV Botanicals' }],
  creator: 'GLOROV Botanicals',
  publisher: 'GLOROV Botanicals',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GLOROV — Indian Seeds & Live Plants',
    description:
      'High-viability seeds & resilient indoor live plants shipped in protective root-safe transit packaging.',
    url: siteUrl,
    type: 'website',
    locale: 'en_IN',
    siteName: 'GLOROV Botanicals',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GLOROV — Indian Seeds & Live Plants',
    description:
      'High-viability seeds & resilient indoor live plants shipped in protective root-safe transit packaging.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#255e3a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} ${fraunces.variable} ${styles.body}`}>
        <a
          href="#main-content"
          className={styles.skipLink}
        >
          Skip to main content
        </a>
        <CustomerProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <CartDrawer />
              <main id="main-content" tabIndex={-1} className={styles.main}>
                {children}
              </main>
              <Footer />
              <MobileDock />
            </WishlistProvider>
          </CartProvider>
        </CustomerProvider>
      </body>
    </html>
  )
}
