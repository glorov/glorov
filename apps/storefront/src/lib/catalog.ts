import {
  StoreCatalogProduct,
  StoreCatalogVariant,
  StoreCatalogCategory,
  StoreProductFilterParams,
  InventoryAvailability,
  computeVariantAvailability,
  parseSeedMetadata,
  SeedMetadata,
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
].join(',')

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
      fields: params.fields ?? STORE_CATALOG_DEFAULT_FIELDS,
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

/**
 * Fetch a single product by handle with complete variant pricing, inventory,
 * and parsed seed/plant metadata.
 */
export async function getStoreCatalogProductByHandle(
  handle: string
): Promise<CatalogProductResponse> {
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
 */
export async function getStoreCatalogCategories(): Promise<CatalogCategoriesResponse> {
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

