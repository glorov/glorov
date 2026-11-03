import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Shopping Bag | GLOROV',
  description: 'Review your selected botanical seeds, indoor live plants, and handcrafted planters.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children
}
