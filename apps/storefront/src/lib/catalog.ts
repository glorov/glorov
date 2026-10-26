import {
  StoreCatalogProduct,
  StoreCatalogVariant,
  StoreCatalogCategory,
  StoreProductFilterParams,
  InventoryAvailability,
  computeVariantAvailability,
  parseSeedMetadata,
  SeedMetadata,
  CatalogSortOption,
} from '@glorov/types'
import { medusaClient } from './medusa-client'
import { formatINR } from './utils'

export const STORE_CATALOG_DEFAULT_FIELDS = [
  '*variants',
  '*variants.prices',
  '+variants.inventory_quantity',
  '*variants.inventory_items',
  '*variants.inventory_items.inventory.location_levels',
  '+metadata',
  '*categories',
  '*collection',
  '+created_at',
].join(',')

/**
 * Optimized field selection for catalog grids, search, and category listing.
 * Omits deeply nested location levels to prevent unnecessary link-table joins.
 */
export const STORE_CATALOG_LISTING_FIELDS = [
  '*variants',
  '*variants.prices',
  '+variants.inventory_quantity',
  '+metadata',
  '*categories',
  '*collection',
  '+created_at',
].join(',')

export const STORE_CATALOG_PDP_FIELDS = STORE_CATALOG_DEFAULT_FIELDS

export interface CatalogProductsResponse {
  success: boolean
  count: number
  products: StoreCatalogProduct[]
  error?: string
}

export interface CatalogProductResponse {
  success: boolean
  product?: StoreCatalogProduct
  seedMetadata?: SeedMetadata
  error?: string
}

export interface CatalogCategoriesResponse {
  success: boolean
  categories: StoreCatalogCategory[]
  error?: string
}

export interface CatalogSearchParams {
  q?: string
  category?: string
  seed_type?: string
  season?: string
  min_price?: number
  max_price?: number
  in_stock?: boolean
  packet_size?: string
  sort?: CatalogSortOption
  page?: number
  limit?: number
}

export interface CatalogFacetOption {
  value: string
  label: string
  count: number
}

export interface CatalogFacets {
  categories: CatalogFacetOption[]
  seedTypes: CatalogFacetOption[]
  seasons: CatalogFacetOption[]
  packetSizes: CatalogFacetOption[]
  priceRange: {
    minRupees: number
    maxRupees: number
  }
  inStockCount: number
  outOfStockCount: number
  totalCount: number
}

/**
 * Fetch catalog products from Medusa Store API with full variant pricing,
 * inventory levels, and botanical metadata.
 */
export async function getStoreCatalogProducts(
  params: StoreProductFilterParams = {}
): Promise<CatalogProductsResponse> {
  try {
    const queryParams: Record<string, unknown> = {
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
      fields: params.fields ?? STORE_CATALOG_LISTING_FIELDS,
    }

    if (params.category_id && params.category_id.length > 0) {
      queryParams.category_id = params.category_id
    }
    if (params.collection_id && params.collection_id.length > 0) {
      queryParams.collection_id = params.collection_id
    }
    if (params.handle) {
      queryParams.handle = params.handle
    }
    if (params.q) {
      queryParams.q = params.q
    }
    if (params.order) {
      queryParams.order = params.order
    }

    const res = await medusaClient.store.product.list(queryParams)

    return {
      success: true,
      count: res.count ?? res.products?.length ?? 0,
      products: (res.products as unknown as StoreCatalogProduct[]) || [],
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve products'
    return {
      success: false,
      count: 0,
      products: [],
      error: message,
    }
  }
}

// In-flight request deduplication and short-TTL memoization for public catalog reads
const productHandleCache = new Map<
  string,
  { timestamp: number; promise: Promise<CatalogProductResponse> }
>()

let categoriesCache: {
  timestamp: number
  promise: Promise<CatalogCategoriesResponse>
} | null = null

const CATALOG_CACHE_TTL_MS = 15000 // 15 seconds short-lived cache for fresh inventory & pricing

export function clearCatalogCache(): void {
  productHandleCache.clear()
  categoriesCache = null
}

/**
 * Fetch a single product by handle with complete variant pricing, inventory,
 * and parsed seed/plant metadata. Deduplicates concurrent calls during SSR/metadata generation.
 */
export async function getStoreCatalogProductByHandle(
  handle: string
): Promise<CatalogProductResponse> {
  const now = Date.now()
  const cached = productHandleCache.get(handle)
  if (cached && now - cached.timestamp < CATALOG_CACHE_TTL_MS) {
    return cached.promise
  }

  const promise = (async () => {
    try {
      const res = await medusaClient.store.product.list({
        handle,
        fields: STORE_CATALOG_DEFAULT_FIELDS,
        limit: 1,
      })

      const product = (res.products?.[0] as unknown as StoreCatalogProduct) || undefined
      if (!product) {
        return {
          success: false,
          error: `Product with handle "${handle}" not found`,
        }
      }

      const seedMetadata = parseSeedMetadata(product.metadata)

      return {
        success: true,
        product,
        seedMetadata,
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve product'
      return {
        success: false,
        error: message,
      }
    }
  })()

  productHandleCache.set(handle, { timestamp: now, promise })
  return promise
}

/**
 * Fetch a single product by ID with complete variant pricing, inventory,
 * and parsed seed/plant metadata.
 */
export async function getStoreCatalogProductById(
  id: string
): Promise<CatalogProductResponse> {
  try {
    const res = await medusaClient.store.product.retrieve(id, {
      fields: STORE_CATALOG_DEFAULT_FIELDS,
    })

    const product = (res.product as unknown as StoreCatalogProduct) || undefined
    if (!product) {
      return {
        success: false,
        error: `Product with id "${id}" not found`,
      }
    }

    const seedMetadata = parseSeedMetadata(product.metadata)

    return {
      success: true,
      product,
      seedMetadata,
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve product'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Fetch active product categories hierarchy from Medusa Store API.
 * Deduplicates concurrent calls during SSR/metadata generation.
 */
export async function getStoreCatalogCategories(): Promise<CatalogCategoriesResponse> {
  const now = Date.now()
  if (categoriesCache && now - categoriesCache.timestamp < CATALOG_CACHE_TTL_MS) {
    return categoriesCache.promise
  }

  const promise = (async () => {
    try {
      const res = await medusaClient.store.category.list({
        fields: '*category_children',
      })

      return {
        success: true,
        categories: (res.product_categories as unknown as StoreCatalogCategory[]) || [],
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to retrieve categories'
      return {
        success: false,
        categories: [],
        error: message,
      }
    }
  })()

  categoriesCache = { timestamp: now, promise }
  return promise
}

/**
 * Determine variant inventory availability from Store API variant payload.
 * Supports both direct variant.inventory_quantity and nested multi-location inventory levels.
 */
export function getVariantStockAvailability(variant: StoreCatalogVariant): InventoryAvailability {
  let stockedQuantity = 0
  let reservedQuantity = 0
  let hasLocationLevels = false

  // If inventory items with location levels are present, aggregate across all items and locations
  if (Array.isArray(variant.inventory_items) && variant.inventory_items.length > 0) {
    for (const item of variant.inventory_items) {
      const levels = item.inventory?.location_levels
      if (Array.isArray(levels) && levels.length > 0) {
        hasLocationLevels = true
        for (const lvl of levels) {
          stockedQuantity += Number(lvl.stocked_quantity ?? 0)
          reservedQuantity += Number(lvl.reserved_quantity ?? 0)
        }
      }
    }
  }

  // Fallback to variant.inventory_quantity if location levels are absent
  if (!hasLocationLevels && typeof variant.inventory_quantity === 'number') {
    stockedQuantity = Math.max(0, variant.inventory_quantity)
    reservedQuantity = 0
  }

  return computeVariantAvailability({
    manageInventory: variant.manage_inventory,
    allowBackorder: variant.allow_backorder,
    stockedQuantity,
    reservedQuantity,
  })
}

/**
 * Format variant price in INR (e.g. ₹49 or ₹179).
 */
export function getVariantPriceINR(variant: StoreCatalogVariant): string {
  const inrPrice = variant.prices?.find((p) => p.currency_code.toLowerCase() === 'inr')
  if (!inrPrice) {
    return 'Price on request'
  }
  return formatINR(inrPrice.amount, true)
}

/**
 * Recursively flatten a category hierarchy into a single list.
 */
export function flattenCategories(
  categories: StoreCatalogCategory[]
): StoreCatalogCategory[] {
  const result: StoreCatalogCategory[] = []
  const seenIds = new Set<string>()

  function recurse(list: StoreCatalogCategory[]) {
    for (const item of list) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id)
        result.push(item)
      }
      if (item.category_children && item.category_children.length > 0) {
        recurse(item.category_children)
      }
    }
  }
  recurse(categories)
  return result
}

/**
 * Find a category by handle anywhere in a hierarchical category tree.
 */
export function findCategoryByHandle(
  categories: StoreCatalogCategory[],
  handle: string
): StoreCatalogCategory | undefined {
  for (const cat of categories) {
    if (cat.handle === handle) {
      return cat
    }
    if (cat.category_children && cat.category_children.length > 0) {
      const found = findCategoryByHandle(cat.category_children, handle)
      if (found) return found
    }
  }
  return undefined
}

/**
 * Collect a category's ID and all its descendants' IDs.
 * Used for querying products in a parent category (e.g. "seeds" queries "seeds", "vegetable-seeds", etc.).
 */
export function getCategoryHierarchyIds(category: StoreCatalogCategory): string[] {
  const ids: string[] = [category.id]
  if (category.category_children && category.category_children.length > 0) {
    for (const child of category.category_children) {
      ids.push(...getCategoryHierarchyIds(child))
    }
  }
  return ids
}

/**
 * Determine the lowest price in INR for a product across its variants.
 */
export function getProductLowestPriceINR(product: StoreCatalogProduct): {
  minPricePaise: number | null
  formatted: string
  hasMultiplePrices: boolean
} {
  const variants = product.variants || []
  const prices: number[] = []

  for (const v of variants) {
    const inrPrice = v.prices?.find((p) => p.currency_code.toLowerCase() === 'inr')
    if (inrPrice && typeof inrPrice.amount === 'number') {
      prices.push(inrPrice.amount)
    }
  }

  if (prices.length === 0) {
    return {
      minPricePaise: null,
      formatted: 'Price on request',
      hasMultiplePrices: false,
    }
  }

  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  const hasMultiplePrices = minPrice !== maxPrice

  return {
    minPricePaise: minPrice,
    formatted: hasMultiplePrices ? `From ${formatINR(minPrice, true)}` : formatINR(minPrice, true),
    hasMultiplePrices,
  }
}

/**
 * Determine overall stock status for a product based on its variants.
 */
export function getProductStockSummary(product: StoreCatalogProduct): {
  hasStock: boolean
  totalStock: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
} {
  const variants = product.variants || []
  if (variants.length === 0) {
    return { hasStock: true, totalStock: 0, status: 'in_stock' }
  }

  let totalAvailable = 0
  let anyAvailable = false
  let allTracked = true

  for (const v of variants) {
    const avail = getVariantStockAvailability(v)
    if (!avail.manageInventory) {
      allTracked = false
      anyAvailable = true
    } else {
      totalAvailable += avail.availableQuantity
      if (avail.isAvailable) {
        anyAvailable = true
      }
    }
  }

  if (!allTracked || anyAvailable) {
    if (allTracked && totalAvailable <= 10 && totalAvailable > 0) {
      return { hasStock: true, totalStock: totalAvailable, status: 'low_stock' }
    }
    return { hasStock: true, totalStock: totalAvailable, status: 'in_stock' }
  }

  return { hasStock: false, totalStock: 0, status: 'out_of_stock' }
}

/**
 * Calculate relevance score for a product against a search query.
 * Higher scores indicate closer matches.
 */
export function calculateRelevanceScore(
  product: StoreCatalogProduct,
  rawQuery: string
): number {
  if (!rawQuery || !rawQuery.trim()) return 0
  const q = rawQuery.trim().toLowerCase()
  const title = (product.title || '').toLowerCase()
  const desc = (product.description || '').toLowerCase()
  const handle = (product.handle || '').toLowerCase()
  const meta = (product.metadata || {}) as Record<string, unknown>
  const commonName = String(meta.common_name || '').toLowerCase()
  const botanicalName = String(meta.botanical_name || '').toLowerCase()
  const variety = String(meta.variety || '').toLowerCase()

  let score = 0
  // Exact title match gets top priority
  if (title === q) {
    score += 100
  } else if (title.startsWith(q)) {
    score += 60
  } else if (title.includes(q)) {
    score += 40
  }

  // Common Indian vernacular name or variety matches
  if (commonName === q || variety === q) {
    score += 70
  } else if (commonName.includes(q) || variety.includes(q)) {
    score += 35
  }

  // Botanical binomial name match
  if (botanicalName.includes(q)) {
    score += 30
  }

  // Handle match
  if (handle.includes(q)) {
    score += 20
  }

  // Description match
  if (desc.includes(q)) {
    score += 10
  }

  // Variant title / SKU match
  if (product.variants) {
    for (const v of product.variants) {
      if (v.title?.toLowerCase().includes(q)) score += 15
      if (v.sku?.toLowerCase().includes(q)) score += 15
    }
  }

  return score
}

/**
 * Filter catalog products across all discovery dimensions:
 * search query, category, seed/plant type, season, price range, in-stock, and packet sizes.
 */
export function filterCatalogProducts(
  products: StoreCatalogProduct[],
  filters: CatalogSearchParams = {}
): StoreCatalogProduct[] {
  return products.filter((product) => {
    // 1. Text Query Search (fallback / refined in-memory search)
    if (filters.q && filters.q.trim()) {
      const q = filters.q.trim().toLowerCase()
      const title = (product.title || '').toLowerCase()
      const desc = (product.description || '').toLowerCase()
      const handle = (product.handle || '').toLowerCase()
      const meta = (product.metadata || {}) as Record<string, unknown>
      const commonName = String(meta.common_name || '').toLowerCase()
      const botanicalName = String(meta.botanical_name || '').toLowerCase()
      const variety = String(meta.variety || '').toLowerCase()
      const seedType = String(meta.seed_type || '').toLowerCase()
      const variantMatches = (product.variants || []).some(
        (v) =>
          (v.title && v.title.toLowerCase().includes(q)) ||
          (v.sku && v.sku.toLowerCase().includes(q))
      )

      const matchesQuery =
        title.includes(q) ||
        desc.includes(q) ||
        handle.includes(q) ||
        commonName.includes(q) ||
        botanicalName.includes(q) ||
        variety.includes(q) ||
        seedType.includes(q) ||
        variantMatches

      if (!matchesQuery) return false
    }

    // 2. Category Filter (by handle, id, or name)
    if (filters.category && filters.category.trim()) {
      const catTarget = filters.category.trim().toLowerCase()
      const matchesCategory = (product.categories || []).some(
        (c) =>
          c.handle.toLowerCase() === catTarget ||
          c.id.toLowerCase() === catTarget ||
          c.name.toLowerCase() === catTarget
      )
      if (!matchesCategory) return false
    }

    // 3. Seed / Plant Type Filter (Heirloom, Open-Pollinated, Hybrid, Organic, Live Specimen)
    if (filters.seed_type && filters.seed_type.trim()) {
      const targetType = filters.seed_type.trim().toLowerCase()
      const meta = (product.metadata || {}) as Record<string, unknown>
      const actualType = String(meta.seed_type || '').toLowerCase()
      const matchesType =
        actualType.includes(targetType) ||
        targetType.includes(actualType) ||
        (targetType === 'organic' &&
          (actualType.includes('organic') || (product.title || '').toLowerCase().includes('organic')))

      if (!matchesType) return false
    }

    // 4. Sowing Season Filter (Kharif, Rabi, Zaid, All Season)
    if (filters.season && filters.season.trim()) {
      const targetSeason = filters.season.trim().toLowerCase()
      const meta = (product.metadata || {}) as Record<string, unknown>
      const actualSeason = String(meta.season || '').toLowerCase()
      const matchesSeason =
        actualSeason === targetSeason ||
        (targetSeason !== 'all_season' && actualSeason === 'all_season') ||
        actualSeason.includes(targetSeason)

      if (!matchesSeason) return false
    }

    // 5. Price Range Filter (in INR Rupees)
    if (typeof filters.min_price === 'number' || typeof filters.max_price === 'number') {
      const priceInfo = getProductLowestPriceINR(product)
      if (priceInfo.minPricePaise === null) {
        return false
      }
      const priceRupees = priceInfo.minPricePaise / 100

      if (typeof filters.min_price === 'number' && priceRupees < filters.min_price) {
        return false
      }
      if (typeof filters.max_price === 'number' && priceRupees > filters.max_price) {
        return false
      }
    }

    // 6. In-Stock Availability Filter
    if (filters.in_stock === true) {
      const stock = getProductStockSummary(product)
      if (!stock.hasStock) return false
    }

    // 7. Packet Size or Variant Quantity Filter
    if (filters.packet_size && filters.packet_size.trim()) {
      const targetSize = filters.packet_size.trim().toLowerCase()
      const matchesSize = (product.variants || []).some((v) => {
        const titleMatch = (v.title || '').toLowerCase().includes(targetSize)
        const meta = (v.metadata || {}) as Record<string, unknown>
        const labelMatch = String(meta.packet_size_label || '').toLowerCase().includes(targetSize)
        return titleMatch || labelMatch
      })
      if (!matchesSize) return false
    }

    return true
  })
}

/**
 * Sort catalog products cleanly according to the selected option:
 * price ascending/descending, newest arrivals, relevance, or title.
 */
export function sortCatalogProducts(
  products: StoreCatalogProduct[],
  sort: CatalogSortOption = 'featured',
  searchQuery?: string
): StoreCatalogProduct[] {
  const cloned = [...products]

  switch (sort) {
    case 'relevance': {
      if (!searchQuery || !searchQuery.trim()) {
        return cloned
      }
      return cloned.sort((a, b) => {
        const scoreB = calculateRelevanceScore(b, searchQuery)
        const scoreA = calculateRelevanceScore(a, searchQuery)
        return scoreB - scoreA
      })
    }
    case 'price_asc': {
      return cloned.sort((a, b) => {
        const priceA = getProductLowestPriceINR(a).minPricePaise ?? Infinity
        const priceB = getProductLowestPriceINR(b).minPricePaise ?? Infinity
        return priceA - priceB
      })
    }
    case 'price_desc': {
      return cloned.sort((a, b) => {
        const priceA = getProductLowestPriceINR(a).minPricePaise ?? -Infinity
        const priceB = getProductLowestPriceINR(b).minPricePaise ?? -Infinity
        return priceB - priceA
      })
    }
    case 'newest': {
      return cloned.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
    }
    case 'title_asc': {
      return cloned.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
    }
    case 'title_desc': {
      return cloned.sort((a, b) => (b.title || '').localeCompare(a.title || ''))
    }
    case 'featured':
    default: {
      if (searchQuery && searchQuery.trim()) {
        return cloned.sort((a, b) => {
          const scoreB = calculateRelevanceScore(b, searchQuery)
          const scoreA = calculateRelevanceScore(a, searchQuery)
          return scoreB - scoreA
        })
      }
      return cloned
    }
  }
}

/**
 * Extract dynamic filter facets (categories, seed types, seasons, packet sizes, price bounds)
 * from a list of catalog products.
 */
export function extractCatalogFacets(products: StoreCatalogProduct[]): CatalogFacets {
  const seedTypeCounts: Record<string, number> = {}
  const seasonCounts: Record<string, number> = {}
  const packetSizeCounts: Record<string, number> = {}
  const categoryCounts: Record<string, { label: string; count: number }> = {}

  let minPrice = Infinity
  let maxPrice = 0
  let inStockCount = 0
  let outOfStockCount = 0

  for (const product of products) {
    // Categories
    if (product.categories) {
      for (const cat of product.categories) {
        if (!categoryCounts[cat.handle]) {
          categoryCounts[cat.handle] = { label: cat.name, count: 0 }
        }
        categoryCounts[cat.handle].count++
      }
    }

    // Seed Type
    const meta = product.metadata as Record<string, unknown> | undefined
    if (meta && typeof meta.seed_type === 'string' && meta.seed_type.trim()) {
      const type = meta.seed_type.trim()
      seedTypeCounts[type] = (seedTypeCounts[type] || 0) + 1
    }

    // Season
    if (meta && typeof meta.season === 'string' && meta.season.trim()) {
      const s = meta.season.trim()
      seasonCounts[s] = (seasonCounts[s] || 0) + 1
    }

    // Packet Sizes / Variant Options
    if (product.variants) {
      for (const v of product.variants) {
        if (v.title && v.title.trim()) {
          const t = v.title.trim()
          packetSizeCounts[t] = (packetSizeCounts[t] || 0) + 1
        }
      }
    }

    // Price
    const priceInfo = getProductLowestPriceINR(product)
    if (priceInfo.minPricePaise !== null) {
      const rupees = Math.floor(priceInfo.minPricePaise / 100)
      if (rupees < minPrice) minPrice = rupees
      if (rupees > maxPrice) maxPrice = rupees
    }

    // Stock
    const stock = getProductStockSummary(product)
    if (stock.hasStock) {
      inStockCount++
    } else {
      outOfStockCount++
    }
  }

  return {
    categories: Object.entries(categoryCounts).map(([handle, info]) => ({
      value: handle,
      label: info.label,
      count: info.count,
    })),
    seedTypes: Object.entries(seedTypeCounts).map(([val, count]) => ({
      value: val,
      label: val,
      count,
    })),
    seasons: Object.entries(seasonCounts).map(([val, count]) => {
      const seasonLabels: Record<string, string> = {
        kharif: 'Kharif (Monsoon)',
        rabi: 'Rabi (Winter)',
        zaid: 'Zaid (Summer)',
        all_season: 'All Season',
      }
      return {
        value: val,
        label: seasonLabels[val.toLowerCase()] || val,
        count,
      }
    }),
    packetSizes: Object.entries(packetSizeCounts).map(([val, count]) => ({
      value: val,
      label: val,
      count,
    })),
    priceRange: {
      minRupees: minPrice === Infinity ? 0 : minPrice,
      maxRupees: maxPrice === 0 ? 500 : maxPrice,
    },
    inStockCount,
    outOfStockCount,
    totalCount: products.length,
  }
}

/**
 * Fast search suggestion helper for storefront typeahead.
 */
export async function searchStorefrontProducts(
  query: string,
  limit: number = 5
): Promise<StoreCatalogProduct[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const response = await getStoreCatalogProducts({
    q: trimmed,
    limit,
  })

  if (!response.success || !response.products) {
    return []
  }

  return sortCatalogProducts(response.products, 'relevance', trimmed)
}

