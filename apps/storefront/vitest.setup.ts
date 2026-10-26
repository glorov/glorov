import React from 'react'
import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) =>
    React.createElement('a', { href: typeof href === 'object' ? href.pathname : href, ...props }, children),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, priority, unoptimized, ...props }: any) =>
    React.createElement('img', {
      src: typeof src === 'object' ? src.src : src,
      alt,
      ...props,
    }),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))
