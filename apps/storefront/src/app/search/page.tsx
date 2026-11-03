import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { SearchClientView } from '../../components/search/SearchClientView'
import { SITE_NAME } from '../../lib/constants'

export const metadata: Metadata = {
  title: `Search Botanical Catalog | ${SITE_NAME}`,
  description:
    'Search through heirloom seeds, indoor houseplants, ceramic planters, and organic gardening supplies at GLOROV.',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: `Search Botanical Catalog | ${SITE_NAME}`,
    description:
      'Search through heirloom seeds, indoor houseplants, ceramic planters, and organic gardening supplies at GLOROV.',
    url: '/search',
    siteName: 'GLOROV',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Search GLOROV Botanical Storefront',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Search Botanical Catalog | GLOROV`,
    description:
      'Search through heirloom seeds, indoor houseplants, ceramic planters, and organic gardening supplies at GLOROV.',
    images: ['/og-image.jpg'],
  },
}

function SearchLoadingFallback(): React.ReactElement {
  return (
    <div className="w-full min-h-[50vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-stone-500">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span className="text-xs font-medium">Loading nursery search...</span>
      </div>
    </div>
  )
}

/**
 * GLOROV Search Route
 * App Router Page hosting interactive search, filtering, and sorting with Next.js Suspense boundary.
 */
export default function SearchPage(): React.ReactElement {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchClientView />
    </Suspense>
  )
}
