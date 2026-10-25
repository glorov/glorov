import type { Metadata, Viewport } from 'next'
import { Header } from '@/components/common/Header'
import { Footer } from '@/components/common/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery',
  description:
    'Buy high-viability garden seeds, outdoor & indoor live potted plants, planters, and organic potting mixes online in India. Safe transit guarantee across 24,000+ PIN codes.',
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
  openGraph: {
    title: 'GLOROV — Indian Seeds & Live Plants',
    description:
      'High-viability seeds & resilient indoor live plants shipped in protective root-safe transit packaging.',
    type: 'website',
    locale: 'en_IN',
    siteName: 'GLOROV',
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
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans bg-background text-foreground antialiased selection:bg-botanical-200 selection:text-botanical-950">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
