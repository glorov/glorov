import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Patron Account | GLOROV',
  description: 'Sign in or register for your GLOROV patron botanical account.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children
}
