import { NextResponse, type NextRequest } from 'next/server'
import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../../../lib/constants'
import { MOCK_PRODUCTS } from '../../../lib/mock-data'
import { transformMedusaProduct } from '../../../lib/api/products'

export const dynamic = 'force-dynamic'

const CURATED_FEATURED_SLUGS = [
  'brinjal-banarshi-giant-seeds',
  'chinese-cabbage-seeds',
  'green-onion-seeds-leek',
  'drumstick-seeds-moringa',
  'watermelon-seeds',
  'white-cucumber-seeds-khira',
  'petunia-mix-seeds',
  'dahlia-seeds',
  'green-chilli-seeds',
  'anthurium-red-plant',
  'marigold-african-double-seeds',
  'money-plant-golden',
  'peace-lily-plant',
  'jade-plant-mini',
  'cosmos-mix-seeds',
  'aglaonema-pink-beauty-plant',
]

/**
 * GET /api/products
 * Fetches products from Medusa backend with automatic fallback to rich GLOROV botanical catalog.
 * Supports:
 * - ?limit=16 (default: 16)
 * - ?offset=0
 * - ?category=all|plants|seeds|planters|care
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '16', 10), 1), 100)
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
  const categoryParam = searchParams.get('category')?.toLowerCase().trim() || 'all'

  // 1. Try querying Medusa backend
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    let url = `${baseUrl}/store/products?limit=${limit}&offset=${offset}&fields=*variants,*variants.prices,*categories,*images,+metadata`
    
    if (categoryParam !== 'all') {
      url += `&category_id=${encodeURIComponent(categoryParam)}`
    }

    const res = await fetch(url, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.products) && data.products.length > 0) {
        const transformed = data.products.map(transformMedusaProduct)
        return NextResponse.json({
          products: transformed,
          count: transformed.length,
          total: data.count ?? transformed.length,
          limit,
          offset,
        })
      }
    }
  } catch {}

  // 2. Filter from MOCK_PRODUCTS
  let filtered = MOCK_PRODUCTS

  if (categoryParam === 'plants') {
    filtered = MOCK_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase().includes('plant') ||
        p.productType === 'plants'
    )
  } else if (categoryParam === 'seeds') {
    filtered = MOCK_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase().includes('seed') ||
        p.productType === 'seeds'
    )
  } else if (categoryParam === 'planters') {
    filtered = MOCK_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase().includes('pot') ||
        p.category.toLowerCase().includes('planter') ||
        p.productType === 'planters'
    )
  } else if (categoryParam === 'care') {
    filtered = MOCK_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase().includes('care') ||
        p.category.toLowerCase().includes('soil') ||
        p.productType === 'care'
    )
  } else {
    // When category is 'all', order curated featured items first
    const curated = CURATED_FEATURED_SLUGS.map((slug) =>
      MOCK_PRODUCTS.find((p) => p.slug === slug)
    ).filter(Boolean) as typeof MOCK_PRODUCTS
    const curatedSlugsSet = new Set(CURATED_FEATURED_SLUGS)
    const remaining = MOCK_PRODUCTS.filter((p) => !curatedSlugsSet.has(p.slug))
    filtered = [...curated, ...remaining]
  }

  const paged = filtered.slice(offset, offset + limit)

  return NextResponse.json({
    products: paged,
    count: paged.length,
    total: filtered.length,
    limit,
    offset,
  })
}
