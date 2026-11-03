import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Standalone output for super-lightweight production deployment (<80MB RAM)
  output: 'standalone',

  // Monorepo root tracing for pnpm workspace standalone build
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Strict mode for React — surfaces potential issues early
  reactStrictMode: true,

  // Image optimisation — allow Cloudinary and local public assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/naodmm8w/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
    // Prefer modern formats
    formats: ['image/avif', 'image/webp'],
  },

  // Environment variables that are safe to expose to the browser
  // Private server-only vars are accessed via process.env directly in server components
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'GLOROV',
  },

  // Compiler options
  compiler: {
    // Remove console.log in production (but keep console.warn and console.error)
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['warn', 'error'] }
        : false,
  },

  // Experimental features
  experimental: {
    // Optimise package imports for better tree-shaking
    optimizePackageImports: [],
  },

  // Rewrites to proxy Medusa backend requests cleanly without browser CORS issues
  async rewrites() {
    return [
      {
        source: '/medusa/:path*',
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://127.0.0.1:9000'}/:path*`,
      },
    ]
  },
}

export default nextConfig
