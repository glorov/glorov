import { MEDUSA_BACKEND_URL, MEDUSA_PUBLISHABLE_KEY } from '../constants'
import { MOCK_PRODUCTS } from '../mock-products'
import type { GlorovProductItem, ProductVariantItem, ProductType } from '../../types/storefront'

/**
 * Raw Medusa V2 product shapes returned from `/store/products`.
 */
interface MedusaProductRaw {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  handle: string
  thumbnail?: string | null
  metadata?: Record<string, unknown> | null
  collection?: { title?: string; handle?: string } | null
  categories?: Array<{ id: string; name: string; handle: string }> | null
  images?: Array<{ id: string; url: string }> | null
  variants?: Array<{
    id: string
    title: string
    prices?: Array<{
      amount: number
      currency_code: string
      raw_amount?: { value?: string }
    }> | null
    metadata?: Record<string, unknown> | null
  }> | null
  tags?: Array<{ value: string }> | null
}

/**
 * Normalizes image URLs from Medusa backend / Cloudinary / relative assets
 */
function resolveProductImageUrl(rawUrl?: string | null): string {
  if (!rawUrl) return ''
  const trimmed = rawUrl.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  const cleanBase = MEDUSA_BACKEND_URL.replace(/\/$/, '')
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${cleanBase}${cleanPath}`
}

/**
 * Transforms a raw Medusa product into a typed GLOROV Storefront item
 * Mirroring Flutter `GlorovProduct.fromMedusaJson`
 */
export function transformMedusaProduct(raw: MedusaProductRaw): GlorovProductItem {
  const meta = (raw.metadata || {}) as Record<string, string | number | undefined>

  // 1. Images
  const imageUrls: string[] = []
  if (raw.thumbnail) {
    const thumb = resolveProductImageUrl(raw.thumbnail)
    if (thumb) imageUrls.push(thumb)
  }
  if (Array.isArray(raw.images)) {
    for (const img of raw.images) {
      if (img?.url) {
        const u = resolveProductImageUrl(img.url)
        if (u && !imageUrls.includes(u)) {
          imageUrls.push(u)
        }
      }
    }
  }
  const primaryImage = imageUrls.length > 0 ? imageUrls[0] : '/og-image.jpg'

  // 2. Category & Product Type
  let category = 'Seeds'
  if (Array.isArray(raw.categories) && raw.categories.length > 0 && raw.categories[0].name) {
    category = raw.categories[0].name
  } else if (raw.collection?.title) {
    category = raw.collection.title
  } else if (meta.category) {
    category = String(meta.category)
  }

  const catLower = category.toLowerCase()
  let productType: ProductType = 'seeds'
  if (catLower.includes('plant')) {
    productType = 'plants'
  } else if (catLower.includes('pot') || catLower.includes('planter')) {
    productType = 'planters'
  } else if (catLower.includes('care') || catLower.includes('soil') || catLower.includes('fertilizer')) {
    productType = 'care'
  }

  // 3. Match with botanical reference catalog for pricing, MRP, and discount enrichment
  const mockMatch = MOCK_PRODUCTS.find(
    (p) =>
      p.slug === raw.handle ||
      p.id === raw.id ||
      p.title.toLowerCase().trim() === raw.title.toLowerCase().trim()
  )

  let sellingPrice = 99
  let originalMrp: number | undefined = undefined

  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    const rawAmount = raw.variants[0].prices?.[0]?.amount
    if (typeof rawAmount === 'number') {
      sellingPrice = rawAmount > 500 ? Math.round(rawAmount / 100) : rawAmount
    }
  }

  // Check metadata for discount_price or original_price/mrp
  if (meta.discount_price) {
    const rawDisc = Number(meta.discount_price)
    const disc = rawDisc > 500 ? Math.round(rawDisc / 100) : rawDisc
    if (sellingPrice > disc) {
      originalMrp = sellingPrice
      sellingPrice = disc
    }
  } else if (meta.mrp || meta.original_price || meta.compare_at_price) {
    const rawMrp = Number(meta.mrp || meta.original_price || meta.compare_at_price)
    const parsedMrp = rawMrp > 500 ? Math.round(rawMrp / 100) : rawMrp
    if (parsedMrp > sellingPrice) {
      originalMrp = parsedMrp
    }
  }

  // Authentic discount only when compare-at price exists (GLOROV-UI-001)
  const discountPercent =
    originalMrp && originalMrp > sellingPrice
      ? Math.round(((originalMrp - sellingPrice) / originalMrp) * 100)
      : undefined

  // Build variants with consistent MRP (price) and selling price (discountPrice)
  const variants: ProductVariantItem[] = []
  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    for (const v of raw.variants) {
      let vSelling = sellingPrice
      if (Array.isArray(v.prices) && v.prices.length > 0) {
        const amt = v.prices[0].amount
        vSelling = amt > 500 ? Math.round(amt / 100) : amt
      }
      const vMrp =
        originalMrp && originalMrp > sellingPrice
          ? Math.round(vSelling * (originalMrp / sellingPrice))
          : undefined
      variants.push({
        id: v.id,
        name: v.title || 'Standard Pack',
        price: vMrp || vSelling,
        discountPrice: vMrp ? vSelling : undefined,
        inStock: true,
      })
    }
  }

  // 4. Rating and reviews
  const rating = meta.rating ? parseFloat(String(meta.rating)) : (mockMatch?.rating ?? 4.7)
  const reviewCount = meta.review_count ? parseInt(String(meta.review_count), 10) : (mockMatch?.reviewCount ?? 41)

  // 5. Badges
  const badges: string[] = []
  if (meta.badge) badges.push(String(meta.badge))
  else if (mockMatch?.badges && mockMatch.badges.length > 0) badges.push(...mockMatch.badges)
  else if (discountPercent && discountPercent > 15) badges.push('Summer Sale')

  const resolvedImages =
    mockMatch?.imageUrls && mockMatch.imageUrls.length > imageUrls.length
      ? mockMatch.imageUrls
      : imageUrls.length > 0
        ? imageUrls
        : [primaryImage]

  return {
    id: raw.id,
    slug: raw.handle || raw.id,
    title: raw.title,
    botanicalName: meta.botanical_name ? String(meta.botanical_name) : (mockMatch?.botanicalName || raw.subtitle || 'Heirloom Cultivar'),
    shortDescription: raw.description?.slice(0, 150) || (mockMatch?.shortDescription || ''),
    description: raw.description || (mockMatch?.description || ''),
    category,
    subcategory: raw.collection?.title || (mockMatch?.subcategory || category),
    productType,
    price: originalMrp && originalMrp > sellingPrice ? originalMrp : sellingPrice,
    discountPrice: originalMrp && originalMrp > sellingPrice ? sellingPrice : undefined,
    discountPercent,
    rating,
    reviewCount,
    imageUrls: resolvedImages,
    primaryImage: resolvedImages[0] || primaryImage,
    inStock: true,
    isBestSeller: mockMatch?.isBestSeller ?? true,
    badges,
    tags: raw.tags?.map((t) => t.value) || (mockMatch?.tags || ['botanical', productType]),
    variants: variants.length > 0 ? variants : (mockMatch?.variants || [
      {
        id: `var-${raw.id}-1`,
        name: 'Standard Pack',
        price: originalMrp && originalMrp > sellingPrice ? originalMrp : sellingPrice,
        discountPrice: originalMrp && originalMrp > sellingPrice ? sellingPrice : undefined,
        inStock: true,
      }
    ]),
    botanicalSpecs: {
      germinationPeriod: (meta.germination_period as string) || '5 — 8 Days',
      sowingDepth: (meta.sowing_depth as string) || '0.5 cm',
      plantingSeason: (meta.planting_season as string) || 'All Seasons (Monsoon / Summer)',
      harvestTime: (meta.harvest_time as string) || '65 — 75 Days from Sowing',
      packContents: (meta.pack_contents as string) || 'Approx. 100 Seeds (Minimum 98% Germination)',
      sunlightRequirement: (meta.sunlight as string) || 'Full Sun (6 — 8 Hours Daily)',
      wateringNeeds: (meta.watering as string) || 'Moderate • Water when top soil is dry',
      difficultyLevel: 'Beginner Friendly',
      potSize: '10 — 12 Inch Diameter or 24L Grow Bag',
    },
    reviewsSummary: {
      averageRating: rating,
      totalReviews: reviewCount,
      starCounts: { 5: Math.round(reviewCount * 0.8), 4: Math.round(reviewCount * 0.15), 3: Math.round(reviewCount * 0.05), 2: 0, 1: 0 },
      aiSummaryTitle: `Why gardeners praise ${raw.title}`,
      aiSummaryText: `Customers report rapid sprouts within 4-6 days and vigorous vegetative growth with 98% germination vigor.`,
    },
    customerReviews: [],
  }
}

/**
 * Fetch a single product from Medusa backend by handle (slug) or id,
 * with fallback to local MOCK_PRODUCTS.
 */
export async function getProductBySlugOrId(slugOrId: string): Promise<GlorovProductItem | null> {
  const cleanSlug = slugOrId.trim()

  // 1. Try querying Medusa backend first
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const isId = cleanSlug.startsWith('prod_')
    const url = isId
      ? `${baseUrl}/store/products/${cleanSlug}?fields=*variants,*variants.prices,*categories,*images,+metadata`
      : `${baseUrl}/store/products?handle=${encodeURIComponent(cleanSlug)}&limit=1&fields=*variants,*variants.prices,*categories,*images,+metadata`

    const res = await fetch(url, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    })

    if (res.ok) {
      const data = await res.json()
      if (isId && data.product) {
        return transformMedusaProduct(data.product)
      } else if (Array.isArray(data.products) && data.products.length > 0) {
        return transformMedusaProduct(data.products[0])
      }
    }
  } catch {}

  // 2. Fallback to local catalog mock data
  const mockMatch = MOCK_PRODUCTS.find(
    (p) => p.slug === cleanSlug || p.id === cleanSlug
  )
  if (mockMatch) {
    if (!mockMatch.botanicalSpecs) {
      mockMatch.botanicalSpecs = {
        germinationPeriod: '5 — 8 Days',
        sowingDepth: '0.5 cm',
        plantingSeason: 'All Seasons (Monsoon / Summer)',
        harvestTime: '65 — 75 Days from Sowing',
        packContents: 'Approx. 100 Seeds (Minimum 98% Germination)',
        sunlightRequirement: 'Full Sun (6 — 8 Hours Daily)',
        wateringNeeds: 'Moderate • Water when top soil is dry',
        difficultyLevel: 'Beginner Friendly',
        potSize: '10 — 12 Inch Diameter or 24L Grow Bag',
      }
    }
    return mockMatch
  }
  return null
}

/**
 * Fetches all available product handles (from Medusa database + mock catalog)
 */
export async function getAllProductHandles(): Promise<string[]> {
  const handles = new Set<string>()

  // From mock products
  for (const p of MOCK_PRODUCTS) {
    if (p.slug) handles.add(p.slug)
  }

  // From Medusa database
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/products?limit=100&fields=handle,id`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(4000),
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.products)) {
        for (const p of data.products) {
          if (p.handle) handles.add(p.handle)
        }
      }
    }
  } catch {}

  return Array.from(handles)
}

/**
 * Get related products for a given product from Medusa backend or mock fallback
 */
export async function getRelatedProductsForProduct(
  product: GlorovProductItem,
  limit: number = 4
): Promise<GlorovProductItem[]> {
  // Query Medusa by category
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(`${baseUrl}/store/products?limit=8&fields=*variants,*variants.prices,*categories,*images,+metadata`, {
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        Accept: 'application/json',
      },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(4000),
    })

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.products)) {
        const transformed = data.products
          .filter((p: MedusaProductRaw) => p.id !== product.id && p.handle !== product.slug)
          .map(transformMedusaProduct)

        if (transformed.length >= 2) {
          return transformed.slice(0, limit)
        }
      }
    }
  } catch {}

  // Fallback to mock products
  const filtered = MOCK_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.productType === product.productType)
  )
  return filtered.length > 0 ? filtered.slice(0, limit) : MOCK_PRODUCTS.filter((p) => p.id !== product.id).slice(0, limit)
}

/**
 * Fetches all active products from Medusa backend with fallback and caching.
 */
export async function getAllStoreProducts(limit: number = 100): Promise<GlorovProductItem[]> {
  try {
    const baseUrl = MEDUSA_BACKEND_URL.replace(/\/$/, '')
    const res = await fetch(
      `${baseUrl}/store/products?limit=${limit}&fields=*variants,*variants.prices,*categories,*images,+metadata`,
      {
        headers: {
          'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
          Accept: 'application/json',
        },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(8000),
      }
    )

    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.products) && data.products.length > 0) {
        const transformed = data.products.map(transformMedusaProduct)
        const backendSlugs = new Set(transformed.map((p: GlorovProductItem) => p.slug))
        const remainingMock = MOCK_PRODUCTS.filter((p) => !backendSlugs.has(p.slug))
        return [...transformed, ...remainingMock]
      }
    }
  } catch (error) {
    console.error('Failed to fetch store products from Medusa backend:', error)
  }

  return MOCK_PRODUCTS
}

/**
 * Fetches products for a specific category slug or subcategory handle.
 */
export async function getProductsByCategory(slug: string): Promise<GlorovProductItem[]> {
  const allProducts = await getAllStoreProducts(100)
  const cleanSlug = slug.toLowerCase().trim()

  return allProducts.filter((p) => {
    const catLower = p.category.toLowerCase()
    const subcatLower = (p.subcategory || '').toLowerCase()
    const pType = p.productType

    if (cleanSlug === 'seeds') return catLower.includes('seed') || pType === 'seeds'
    if (cleanSlug === 'vegetables' || cleanSlug === 'vegetable-seeds') {
      return (
        subcatLower.includes('vegetable') ||
        (p.slug.includes('seeds') &&
          (p.slug.includes('brinjal') ||
            p.slug.includes('cabbage') ||
            p.slug.includes('onion') ||
            p.slug.includes('moringa') ||
            p.slug.includes('chilli') ||
            p.slug.includes('cucumber') ||
            p.slug.includes('watermelon') ||
            p.slug.includes('tomato')))
      )
    }
    if (cleanSlug === 'live-plants' || cleanSlug === 'plants') {
      return catLower.includes('plant') || pType === 'plants'
    }
    if (cleanSlug === 'flowers' || cleanSlug === 'flowering' || cleanSlug === 'flowering-plants') {
      return (
        subcatLower.includes('flower') ||
        catLower.includes('flower') ||
        p.badges?.includes('FLOWERING') ||
        p.slug.includes('petunia') ||
        p.slug.includes('dahlia') ||
        p.slug.includes('marigold') ||
        p.slug.includes('cosmos') ||
        p.slug.includes('chrysanthemum') ||
        p.slug.includes('portulaca') ||
        p.slug.includes('anthurium') ||
        p.slug.includes('peace-lily') ||
        p.slug.includes('bird-of-paradise')
      )
    }
    if (cleanSlug === 'herbs' || cleanSlug === 'herb-seeds') {
      return (
        subcatLower.includes('herb') ||
        p.tags?.includes('herb') ||
        p.tags?.includes('spicy') ||
        p.slug.includes('basil') ||
        p.slug.includes('tulsi') ||
        p.slug.includes('arugula') ||
        p.slug.includes('parsley') ||
        p.slug.includes('oregano') ||
        p.slug.includes('thyme') ||
        p.slug.includes('mint')
      )
    }
    if (cleanSlug === 'indoor-plants') return subcatLower.includes('indoor')
    if (cleanSlug === 'air-purifying-plants') return subcatLower.includes('air')
    if (cleanSlug === 'succulents-bonsai') return subcatLower.includes('succulent') || subcatLower.includes('bonsai')
    if (cleanSlug === 'offers') return p.discountPrice !== undefined && p.discountPrice < p.price

    return catLower === cleanSlug || subcatLower === cleanSlug || catLower.includes(cleanSlug) || subcatLower.includes(cleanSlug)
  })
}

