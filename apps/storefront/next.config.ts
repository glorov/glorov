import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // GLOROV-PERF-005: CDN asset prefix support (uncomment when CDN distribution is active)
  // assetPrefix: process.env.CDN_URL || '',

  // Standalone output for super-lightweight production deployment (<80MB RAM)
  output: 'standalone',

  // Monorepo root tracing for pnpm workspace standalone build
  outputFileTracingRoot: path.join(__dirname, '../../'),

  // Strict mode for React — surfaces potential issues early
  reactStrictMode: true,

  // Strict type checking and linting during production builds
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Image optimisation — allow Cloudinary and local public assets
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
    // Prefer modern high-compression formats
    formats: ['image/avif', 'image/webp'],
    // Granular responsive widths for mobile & desktop to prevent downloading oversized assets
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images aggressively (1 year TTL)
    minimumCacheTTL: 31536000,
  },

  // Environment variables that are safe to expose to the browser
  // Private server-only vars are accessed via process.env directly in server components
  env: {
    NEXT_PUBLIC_MEDUSA_BACKEND_URL: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000',
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME ?? 'GLOROV',
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN ?? '',
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

  // Webpack tuning: disable dev filesystem pack cache to prevent file-locking corruption during test runs
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false
    }
    return config
  },

  // Security: Disable X-Powered-By header to avoid leaking server technology (GLOROV-SEC-003)
  poweredByHeader: false,

  // Security Headers for defense-in-depth complementing reverse proxy (GLOROV-SEC-003)
  async headers() {
    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://i.imgur.com",
      "font-src 'self' data:",
      "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://api.glorov.in https://api.glorov.tech http://localhost:9000 http://127.0.0.1:9000 https://*.ingest.sentry.io https://*.sentry.io",
      "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ')

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: cspDirectives,
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
    ]
  },

  // Rewrites to proxy Medusa backend requests cleanly without browser CORS issues
  // Restricts proxying to /store/* endpoints only, preventing exposure of /admin/* (GLOROV-PROXY-001)
  async rewrites() {
    const backendUrl = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://127.0.0.1:9000').replace(/\/$/, '')
    return [
      {
        source: '/medusa/store/:path*',
        destination: `${backendUrl}/store/:path*`,
      },
    ]
  },
}

export default nextConfig
