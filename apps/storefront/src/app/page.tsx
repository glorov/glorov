import React from 'react'
import { Hero } from '@/components/home/Hero'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { ValuePropositions } from '@/components/home/ValuePropositions'
import { GardeningGuide } from '@/components/home/GardeningGuide'
import { checkBackendHealth } from '@/lib/medusa-client'

export const dynamic = 'force-dynamic'

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
