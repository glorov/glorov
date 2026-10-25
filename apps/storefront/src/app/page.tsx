import React from 'react'
import { Hero } from '@/components/home/Hero'
import { ProductPlaceholderGrid } from '@/components/home/ProductPlaceholderGrid'
import { ValuePropositions } from '@/components/home/ValuePropositions'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-full">
      <Hero />
      <ProductPlaceholderGrid />
      <ValuePropositions />
    </div>
  )
}
