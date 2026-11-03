import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Secure Checkout | GLOROV',
  description: 'Complete your botanical order with verified delivery and secure payment options across India.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
