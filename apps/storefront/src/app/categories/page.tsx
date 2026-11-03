import type { Metadata } from 'next'
import React from 'react'
import { SITE_NAME } from '../../lib/constants'
import { CategoryPageClient } from './CategoryPageClient'

export const metadata: Metadata = {
  title: `Botanical Categories | ${SITE_NAME}`,
  description:
    'Browse the full GLOROV botanical catalog: Desi heirloom vegetable & flower seeds, indoor live houseplants, handcrafted planters, and organic potting mix.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: `Botanical Categories | ${SITE_NAME}`,
    description:
      'Browse the full GLOROV botanical catalog: Desi heirloom vegetable & flower seeds, indoor live houseplants, handcrafted planters, and organic potting mix.',
    url: '/categories',
    siteName: 'GLOROV',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GLOROV Botanical Categories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Botanical Categories | ${SITE_NAME}`,
    description:
      'Browse the full GLOROV botanical catalog: Desi heirloom seeds, indoor houseplants, and planters.',
    images: ['/og-image.jpg'],
  },
}

interface CategoriesPageProps {
  searchParams?: Promise<{
    category?: string
    handle?: string
  }>
}

export default async function CategoriesPage({
  searchParams,
}: CategoriesPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const initialHandle =
    resolvedSearchParams?.category || resolvedSearchParams?.handle

  return <CategoryPageClient initialCategoryHandle={initialHandle} />
}
