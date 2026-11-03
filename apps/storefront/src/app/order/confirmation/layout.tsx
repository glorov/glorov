import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Order Confirmed | GLOROV',
  description: 'Thank you for your order with GLOROV Botanical Storefront.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return children
}
