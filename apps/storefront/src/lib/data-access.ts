import { medusaClient, checkBackendHealth, BackendHealthResult } from './medusa-client'

export type StoreProductItem = Awaited<
  ReturnType<typeof medusaClient.store.product.list>
>['products'][number]

export type StoreRegionItem = Awaited<
  ReturnType<typeof medusaClient.store.region.list>
>['regions'][number]

export interface CatalogResponse {
  success: boolean
  products: StoreProductItem[]
  error?: string
}

export interface RegionsResponse {
  success: boolean
  regions: StoreRegionItem[]
  error?: string
}

/**
 * Fetch catalog products from Medusa Store API with graceful fallback.
 * Uses official Medusa JS SDK with publishable key authentication.
 */
export async function getStoreCatalog(
  limit: number = 10
): Promise<CatalogResponse> {
  try {
    const res = await medusaClient.store.product.list({
      limit,
    })
    return {
      success: true,
      products: res.products || [],
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve catalog'
    return {
      success: false,
      products: [],
      error: message,
    }
  }
}

/**
 * Fetch active store regions from Medusa Store API with graceful fallback.
 */
export async function getStoreRegions(): Promise<RegionsResponse> {
  try {
    const res = await medusaClient.store.region.list()
    return {
      success: true,
      regions: res.regions || [],
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve regions'
    return {
      success: false,
      regions: [],
      error: message,
    }
  }
}

export { checkBackendHealth, type BackendHealthResult }
