import type { Metadata, Viewport } from 'next'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import './globals.css'

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
}

export const viewport: Viewport = {
  themeColor: '#255e3a',
  width: 'device-width',
  initialScale: 1,
}

import { CartProvider } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-botanical-200 selection:text-botanical-950">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-botanical-800 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-botanical-500 font-semibold text-xs transition-all"
        >
          Skip to main content
        </a>
        <CartProvider>
          <Header />
          <CartDrawer />
          <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
