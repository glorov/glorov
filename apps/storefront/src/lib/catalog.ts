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
