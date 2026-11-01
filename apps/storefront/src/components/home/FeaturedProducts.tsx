import React from 'react'
import { getStoreCatalogProducts, STORE_CATALOG_LISTING_FIELDS } from '@/lib/catalog'
import { FeaturedProductsClient } from './FeaturedProductsClient'

export async function FeaturedProducts() {
  const response = await getStoreCatalogProducts({
    limit: 60,
    fields: STORE_CATALOG_LISTING_FIELDS,
  })
  const products = response.success ? response.products : []

  return <FeaturedProductsClient initialProducts={products} />
}
