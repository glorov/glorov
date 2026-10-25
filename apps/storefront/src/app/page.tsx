import React from 'react'
import { Hero } from '@/components/home/Hero'
import { ProductPlaceholderGrid } from '@/components/home/ProductPlaceholderGrid'
import { ValuePropositions } from '@/components/home/ValuePropositions'
import { checkBackendHealth } from '@/lib/medusa-client'

export default async function HomePage() {
  const health = await checkBackendHealth(1500)

  return (
    <div className="flex flex-col min-h-full">
      <Hero backendOnline={health.healthy} />
      <ProductPlaceholderGrid />
      <ValuePropositions />
    </div>
  )
}
