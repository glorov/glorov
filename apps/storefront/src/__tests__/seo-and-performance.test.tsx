/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { metadata as rootMetadata } from '../app/layout'
import { metadata as homeMetadata } from '../app/page'
import { metadata as storeMetadata } from '../app/store/page'
import { generateMetadata as generateCategoryMetadata } from '../app/categories/[...category]/page'
import {
  generateMetadata as generateProductMetadata,
  default as ProductDetailPage,
} from '../app/products/[handle]/page'
import { metadata as accountMetadata } from '../app/account/layout'
import { metadata as checkoutMetadata } from '../app/checkout/layout'
import { metadata as cartMetadata } from '../app/cart/layout'
import { metadata as orderConfirmedMetadata } from '../app/order/confirmed/[id]/page'
import robots from '../app/robots'
import sitemap from '../app/sitemap'
import {
  getStoreCatalogProductByHandle,
  getStoreCatalogCategories,
  clearCatalogCache,
} from '../lib/catalog'
import { medusaClient } from '../lib/medusa-client'
import { CartProvider } from '../context/CartContext'
import React from 'react'
import { render, act } from '@testing-library/react'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  }),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, priority, unoptimized, ...rest } = props
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={rest.alt || ''} data-priority={priority ? 'true' : undefined} />
  },
}))

describe('SEO & Technical Indexing Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCatalogCache()
  })

  describe('1. Root & Public Route Metadata', () => {
    it('configures metadataBase, title template, and OpenGraph defaults on RootLayout', () => {
      expect(rootMetadata.metadataBase).toBeDefined()
      expect(rootMetadata.metadataBase?.toString()).toMatch(/https:\/\/glorov\.in/)
      expect(rootMetadata.title).toEqual({
        default: 'GLOROV — Indian Seeds & Live Plants | Pan-India Botanical Nursery',
        template: '%s | GLOROV Botanicals',
      })
      expect(rootMetadata.openGraph?.locale).toBe('en_IN')
      expect(rootMetadata.openGraph?.siteName).toBe('GLOROV Botanicals')
      expect(rootMetadata.robots).toEqual(
        expect.objectContaining({
          index: true,
          follow: true,
        })
      )
    })

    it('defines canonical link and OpenGraph cards for the homepage', () => {
      expect(homeMetadata.alternates?.canonical).toBe('/')
      expect((homeMetadata.openGraph as any)?.type).toBe('website')
      expect(homeMetadata.title).toContain('GLOROV')
    })

    it('sets a fixed canonical URL for the catalog store page to prevent crawl traps', () => {
      expect(storeMetadata.alternates?.canonical).toBe('/store')
      expect(storeMetadata.openGraph?.url).toBe('/store')
    })
  })

  describe('2. Dynamic Category Metadata', () => {
    it('generates dynamic metadata and canonical path for a category slug', async () => {
      vi.spyOn(medusaClient.store.category, 'list').mockResolvedValueOnce({
        product_categories: [
          {
            id: 'pcat_seeds',
            name: 'Vegetable Seeds',
            handle: 'seeds',
            description: 'Organic desi heirloom vegetable seeds for Indian kitchen gardens.',
          },
        ] as any,
        count: 1,
        offset: 0,
        limit: 20,
      })

      const meta = await generateCategoryMetadata({
        params: Promise.resolve({ category: ['seeds'] }),
        searchParams: Promise.resolve({ q: 'tomato', season: 'monsoon' }), // Query parameters present
      })

      expect(meta.title).toBe('Vegetable Seeds — Indian Seeds & Plants')
      expect(meta.description).toContain('Organic desi heirloom vegetable seeds')
      // Canonical link MUST NOT contain filter query strings
      expect(meta.alternates?.canonical).toBe('/categories/seeds')
      expect(meta.openGraph?.url).toBe('/categories/seeds')
    })

    it('sets robots noindex when a category does not exist', async () => {
      vi.spyOn(medusaClient.store.category, 'list').mockResolvedValueOnce({
        product_categories: [],
        count: 0,
        offset: 0,
        limit: 20,
      })

      const meta = await generateCategoryMetadata({
        params: Promise.resolve({ category: ['unknown-category'] }),
        searchParams: Promise.resolve({}),
      })

      expect(meta.title).toBe('Botanical Category Not Found')
      expect(meta.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: true,
        })
      )
    })
  })

  describe('3. Dynamic Product Metadata and Schema.org JSON-LD', () => {
    const mockProduct = {
      id: 'prod_marigold_01',
      title: 'Desi Genda Marigold Seeds',
      handle: 'desi-genda-marigold-seeds',
      description: 'Heirloom yellow and orange flower seeds for festive winter blooms.',
      thumbnail: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
      images: [
        { id: 'img_1', url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa' },
        { id: 'img_2', url: 'https://images.unsplash.com/photo-1508784411316-02b8cd4d4a3a' },
      ],
      categories: [{ id: 'cat_flower', name: 'Flower Seeds', handle: 'flower-seeds' }],
      metadata: {
        botanical_name: 'Tagetes erecta',
        common_name: 'African Marigold',
        is_perishable: false,
        packet_size: '50 seeds (~2g)',
        viable_years: 2,
      },
      variants: [
        {
          id: 'var_small',
          title: '50 Seeds Packet',
          sku: 'GLR-MAR-50S',
          inventory_quantity: 45,
          prices: [{ id: 'p_1', currency_code: 'inr', amount: 9900 }],
        },
        {
          id: 'var_large',
          title: '200 Seeds Packet',
          sku: 'GLR-MAR-200S',
          inventory_quantity: 20,
          prices: [{ id: 'p_2', currency_code: 'inr', amount: 24900 }],
        },
      ],
    }

    it('generates dynamic product metadata with botanical name, canonical link, and OpenGraph', async () => {
      vi.spyOn(medusaClient.store.product, 'list').mockResolvedValueOnce({
        products: [mockProduct] as any,
        count: 1,
        offset: 0,
        limit: 1,
      })

      const meta = await generateProductMetadata({
        params: Promise.resolve({ handle: 'desi-genda-marigold-seeds' }),
      })

      expect(meta.title).toBe('Desi Genda Marigold Seeds (Tagetes erecta)')
      expect(meta.description).toContain('Heirloom yellow and orange flower seeds')
      expect(meta.alternates?.canonical).toBe('/products/desi-genda-marigold-seeds')
      expect(meta.openGraph?.url).toBe('/products/desi-genda-marigold-seeds')
      expect(meta.openGraph?.images).toHaveLength(2)
      expect((meta.twitter as any)?.card).toBe('summary_large_image')
    })

    it('renders valid Schema.org Product structured data without invented reviews or fake ratings', async () => {
      vi.spyOn(medusaClient.store.product, 'list').mockImplementation(async (params: any) => {
        if (params?.handle === 'desi-genda-marigold-seeds') {
          return { products: [mockProduct] as any, count: 1, offset: 0, limit: 1 }
        }
        return { products: [] as any, count: 0, offset: 0, limit: 5 }
      })

      const component = await ProductDetailPage({
        params: Promise.resolve({ handle: 'desi-genda-marigold-seeds' }),
      })

      let rendered: any
      await act(async () => {
        rendered = render(<CartProvider>{component}</CartProvider>)
      })
      const jsonLdScript = rendered.container.querySelector('script[type="application/ld+json"]')
      expect(jsonLdScript).toBeTruthy()

      const parsedJsonLd = JSON.parse(jsonLdScript!.textContent || '{}')

      expect(parsedJsonLd['@context']).toBe('https://schema.org')
      expect(parsedJsonLd['@type']).toBe('Product')
      expect(parsedJsonLd.name).toBe('Desi Genda Marigold Seeds')
      expect(parsedJsonLd.url).toBe('https://glorov.in/products/desi-genda-marigold-seeds')
      expect(parsedJsonLd.brand).toEqual({ '@type': 'Brand', name: 'GLOROV' })
      expect(parsedJsonLd.sku).toBe('GLR-MAR-50S')

      // Ensure NO fabricated reviews or fake ratings are present
      expect(parsedJsonLd.aggregateRating).toBeUndefined()
      expect(parsedJsonLd.review).toBeUndefined()

      // Verify Offers schema
      expect(Array.isArray(parsedJsonLd.offers)).toBe(true)
      expect(parsedJsonLd.offers).toHaveLength(2)

      const firstOffer = parsedJsonLd.offers[0]
      expect(firstOffer['@type']).toBe('Offer')
      expect(firstOffer.priceCurrency).toBe('INR')
      expect(firstOffer.price).toBe('99.00')
      expect(firstOffer.availability).toBe('https://schema.org/InStock')
      expect(firstOffer.itemCondition).toBe('https://schema.org/NewCondition')
      expect(firstOffer.seller?.name).toBe('GLOROV Botanicals')
    })
  })

  describe('4. Private Route Indexing Protection', () => {
    it('sets robots noindex, nofollow on customer account layout', () => {
      expect(accountMetadata.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: false,
        })
      )
    })

    it('sets robots noindex, nofollow on checkout layout', () => {
      expect(checkoutMetadata.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: false,
        })
      )
    })

    it('sets robots noindex, nofollow on cart layout', () => {
      expect(cartMetadata.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: false,
        })
      )
    })

    it('sets robots noindex, nofollow on order confirmed page', () => {
      expect(orderConfirmedMetadata.robots).toEqual(
        expect.objectContaining({
          index: false,
          follow: false,
        })
      )
    })
  })

  describe('5. Robots Directives & Sitemap Generation', () => {
    it('generates robots.txt rules disallowing private and API paths and pointing to sitemap.xml', () => {
      const robotsConfig = robots()
      expect(robotsConfig.sitemap).toBe('https://glorov.in/sitemap.xml')

      const mainRule = Array.isArray(robotsConfig.rules)
        ? robotsConfig.rules[0]
        : robotsConfig.rules

      expect(mainRule.userAgent).toBe('*')
      expect(mainRule.allow).toBe('/')
      expect(mainRule.disallow).toEqual(
        expect.arrayContaining([
          '/account',
          '/account/',
          '/checkout',
          '/checkout/',
          '/cart',
          '/cart/',
          '/order/confirmed',
          '/order/confirmed/',
          '/api/',
        ])
      )
    })

    it('generates sitemap containing core routes, categories, and published products', async () => {
      vi.spyOn(medusaClient.store.category, 'list').mockResolvedValueOnce({
        product_categories: [
          {
            id: 'pcat_seeds',
            name: 'Seeds',
            handle: 'seeds',
            updated_at: '2026-10-25T10:00:00Z',
          },
        ] as any,
        count: 1,
        offset: 0,
        limit: 20,
      })

      vi.spyOn(medusaClient.store.product, 'list').mockResolvedValueOnce({
        products: [
          {
            id: 'prod_1',
            title: 'Tulsi Seeds',
            handle: 'holy-basil-tulsi-seeds',
            updated_at: '2026-10-26T08:00:00Z',
          },
        ] as any,
        count: 1,
        offset: 0,
        limit: 100,
      })

      const siteEntries = await sitemap()

      const urls = siteEntries.map((e) => e.url)
      expect(urls).toContain('https://glorov.in')
      expect(urls).toContain('https://glorov.in/store')
      expect(urls).toContain('https://glorov.in/categories/seeds')
      expect(urls).toContain('https://glorov.in/products/holy-basil-tulsi-seeds')

      // Ensure priorities and frequencies are structured
      const homeEntry = siteEntries.find((e) => e.url === 'https://glorov.in')
      expect(homeEntry?.priority).toBe(1.0)
      expect(homeEntry?.changeFrequency).toBe('daily')

      const prodEntry = siteEntries.find(
        (e) => e.url === 'https://glorov.in/products/holy-basil-tulsi-seeds'
      )
      expect(prodEntry?.priority).toBe(0.7)
    })
  })

  describe('6. Performance & Request Deduplication', () => {
    it('deduplicates concurrent calls to getStoreCatalogProductByHandle with a single network request', async () => {
      const listSpy = vi
        .spyOn(medusaClient.store.product, 'list')
        .mockResolvedValueOnce({
          products: [
            {
              id: 'prod_tomato',
              title: 'Desi Tamatar Seeds',
              handle: 'desi-tamatar-seeds',
              metadata: {},
            },
          ] as any,
          count: 1,
          offset: 0,
          limit: 1,
        })

      // Simulate simultaneous invocation (as happens during SSR generateMetadata + Page)
      const [res1, res2] = await Promise.all([
        getStoreCatalogProductByHandle('desi-tamatar-seeds'),
        getStoreCatalogProductByHandle('desi-tamatar-seeds'),
      ])

      expect(res1.success).toBe(true)
      expect(res2.success).toBe(true)
      expect(res1.product?.id).toBe('prod_tomato')
      expect(res2.product?.id).toBe('prod_tomato')

      // Crucial verification: exactly ONE network request was dispatched to Medusa backend
      expect(listSpy).toHaveBeenCalledTimes(1)
    })

    it('deduplicates concurrent calls to getStoreCatalogCategories', async () => {
      const catSpy = vi
        .spyOn(medusaClient.store.category, 'list')
        .mockResolvedValueOnce({
          product_categories: [{ id: 'pcat_1', name: 'Live Plants' }] as any,
          count: 1,
          offset: 0,
          limit: 20,
        })

      const [c1, c2] = await Promise.all([
        getStoreCatalogCategories(),
        getStoreCatalogCategories(),
      ])

      expect(c1.success).toBe(true)
      expect(c2.success).toBe(true)
      expect(catSpy).toHaveBeenCalledTimes(1)
    })
  })
})
