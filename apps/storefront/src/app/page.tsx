import React from 'react'
import type { Metadata } from 'next'
import { Hero } from '@/components/home/Hero'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ValuePropositions } from '@/components/home/ValuePropositions'
import { GardeningGuide } from '@/components/home/GardeningGuide'
import { checkBackendHealth } from '@/lib/medusa-client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery',
  description:
    'Order authentic Indian heirloom vegetable seeds, organic flower seeds, herbs, and potted live plants online with protective nursery packaging dispatched from Pune.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery',
    description:
      'Order authentic Indian heirloom vegetable seeds, organic flower seeds, herbs, and potted live plants online with protective nursery packaging dispatched from Pune.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery',
    description:
      'Order authentic Indian heirloom vegetable seeds, organic flower seeds, herbs, and potted live plants online with protective nursery packaging dispatched from Pune.',
  },
}

export default async function HomePage() {
  const health = await checkBackendHealth(1500)

  return (
    <div className="flex flex-col min-h-full">
      <Hero backendOnline={health.healthy} />
      <CategoryShowcase />
      <FeaturedProducts />
      <ValuePropositions />
      <GardeningGuide />
    </div>
  )
}
