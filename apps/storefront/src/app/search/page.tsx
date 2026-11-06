import type { Metadata } from 'next'
import React, { Suspense } from 'react'
import { SearchClientView } from '../../components/search/SearchClientView'
import { BotanicalLoadingState } from '../../components/feedback/BotanicalLoadingState'
import { SITE_NAME } from '../../lib/constants'
import { getAllStoreProducts } from '../../lib/api/products'

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
    <div className="w-full min-h-[50vh] flex items-center justify-center py-12">
      <BotanicalLoadingState
        label="GLOROV SEARCH"
        sublabel="Searching heirloom seeds & botanical collection..."
      />
    </div>
  )
}

/**
 * GLOROV Search Route
 * App Router Page hosting interactive search, filtering, and sorting with Next.js Suspense boundary.
 */
export default async function SearchPage(): Promise<React.ReactElement> {
  const initialProducts = await getAllStoreProducts(100)

  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchClientView initialProducts={initialProducts} />
    </Suspense>
  )
}
