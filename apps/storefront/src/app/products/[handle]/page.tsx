import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Sprout, Leaf, Tag } from 'lucide-react'
import {
  getStoreCatalogProductByHandle,
  getStoreCatalogProducts,
  getProductLowestPriceINR,
  getProductStockSummary,
} from '@/lib/catalog'
import { ProductGallery } from '@/components/catalog/ProductGallery'
import { VariantSelector } from '@/components/catalog/VariantSelector'
import { BotanicalSpecs } from '@/components/catalog/BotanicalSpecs'
import { ProductTrustAndPolicies } from '@/components/catalog/ProductTrustAndPolicies'
import { PincodeChecker } from '@/components/shipping/PincodeChecker'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{
    handle: string
  }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params
  const res = await getStoreCatalogProductByHandle(handle)
  const canonicalPath = `/products/${handle}`

  if (!res.success || !res.product) {
    return {
      title: 'Botanical Product Not Found',
      description: 'The requested botanical variety or seed packet could not be found.',
      alternates: {
        canonical: canonicalPath,
      },
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const product = res.product
  const botanicalName = res.seedMetadata?.botanical_name
  const commonName = res.seedMetadata?.common_name
  const title = `${product.title}${botanicalName ? ` (${botanicalName})` : ''}`
  const description =
    product.description ||
    `Buy authentic ${product.title}${commonName ? ` (${commonName})` : ''} online with protective botanical packaging dispatched from our Pune nursery hub across India.`

  const imageUrls = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images?.map((img) => img.url).filter(Boolean) || []),
  ]
  const uniqueImages = Array.from(new Set(imageUrls))

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${title} | GLOROV Botanicals`,
      description,
      url: canonicalPath,
      type: 'website',
      images: uniqueImages.map((url) => ({ url, alt: product.title })),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | GLOROV Botanicals`,
      description,
      images: uniqueImages.length > 0 ? [uniqueImages[0]] : undefined,
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { handle } = await params
  const res = await getStoreCatalogProductByHandle(handle)

  if (!res.success || !res.product) {
    notFound()
  }

  const { product, seedMetadata } = res
  const category = product.categories?.[0]
  const isPerishable = Boolean(seedMetadata?.is_perishable)
  const isSeed = !isPerishable && (!category?.handle || !category.handle.includes('plant'))

  const lowestPrice = getProductLowestPriceINR(product)
  const stockSummary = getProductStockSummary(product)
  const defaultVariant = product.variants?.[0]

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://glorov.in'
  const canonicalProductUrl = `${siteUrl}/products/${product.handle}`

  const productImages = [
    ...(product.thumbnail ? [product.thumbnail] : []),
    ...(product.images?.map((img) => img.url).filter(Boolean) || []),
  ]
  const uniqueProductImages = Array.from(new Set(productImages))

  // Map individual variants into verified Schema.org Offer instances
  const offers = (product.variants && product.variants.length > 0)
    ? product.variants.map((v) => {
        const inrPrice = v.prices?.find((p) => p.currency_code?.toLowerCase() === 'inr')
        const priceVal = inrPrice
          ? (inrPrice.amount / 100).toFixed(2)
          : lowestPrice.minPricePaise
            ? (lowestPrice.minPricePaise / 100).toFixed(2)
            : undefined
        const hasVariantStock =
          typeof v.inventory_quantity === 'number'
            ? v.inventory_quantity > 0
            : stockSummary.hasStock

        return {
          '@type': 'Offer',
          sku: v.sku || undefined,
          name: v.title || undefined,
          priceCurrency: 'INR',
          price: priceVal,
          availability: hasVariantStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
          url: canonicalProductUrl,
          seller: {
            '@type': 'Organization',
            name: 'GLOROV Botanicals',
          },
        }
      })
    : {
        '@type': 'Offer',
        priceCurrency: 'INR',
        price: lowestPrice.minPricePaise
          ? (lowestPrice.minPricePaise / 100).toFixed(2)
          : undefined,
        availability: stockSummary.hasStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        url: canonicalProductUrl,
        seller: {
          '@type': 'Organization',
          name: 'GLOROV Botanicals',
        },
      }

  // JSON-LD Structured Data for Search Engine Optimization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || undefined,
    image: uniqueProductImages.length > 0 ? uniqueProductImages : undefined,
    sku: defaultVariant?.sku || undefined,
    category: category?.name || undefined,
    url: canonicalProductUrl,
    brand: {
      '@type': 'Brand',
      name: 'GLOROV',
    },
    offers: Array.isArray(offers) && offers.length === 1 ? offers[0] : offers,
  }

  // Fetch related products from the same category or general catalog
  const relatedRes = await getStoreCatalogProducts({
    category_id: category ? [category.id] : undefined,
    limit: 5,
  })
  const relatedProducts = (relatedRes.success ? relatedRes.products : [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap"
      >
        <Link href="/" className="hover:text-botanical-700 transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <Link href="/store" className="hover:text-botanical-700 transition-colors">
          Store
        </Link>
        {category && (
          <>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link
              href={`/categories/${category.handle}`}
              className="hover:text-botanical-700 transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" aria-hidden="true" />
        <span className="font-semibold text-botanical-900 truncate max-w-xs sm:max-w-md">
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Visual Gallery (6 cols) */}
        <div className="lg:col-span-6">
          <ProductGallery
            title={product.title}
            thumbnail={product.thumbnail}
            images={product.images}
          />
        </div>

        {/* Right Column: Title, Botanical Metadata, Variant Selector, Add to Cart (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Category, Perishable, and Fiscal Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant={isSeed ? 'botanical' : 'earth'}
              className="text-xs font-medium py-1 px-3"
            >
              {isSeed ? (
                <Sprout className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              ) : (
                <Leaf className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
              )}
              <span>{category?.name || (isSeed ? 'Pure Seed Batch' : 'Live Botanical')}</span>
            </Badge>

            {isPerishable ? (
              <Badge variant="warning" className="text-xs font-bold py-1 px-2.5">
                Air Express Transit Required
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs font-medium text-emerald-800 bg-emerald-50 border-emerald-200 py-1 px-2.5"
              >
                Standard Pan-India Shipping
              </Badge>
            )}

            <Badge
              variant="outline"
              className="text-xs font-medium text-muted-foreground border-border/80 bg-earth-50/70 py-1 px-2"
            >
              <Tag className="h-3 w-3 mr-1 text-botanical-700" aria-hidden="true" />
              <span>{isSeed ? 'GST 0% Exempt (HSN 1209)' : 'GST 5% (Live Plant HSN 0602)'}</span>
            </Badge>
          </div>

          {/* Botanical Taxonomy Subtitle & Title */}
          <div className="space-y-1.5">
            {(seedMetadata?.botanical_name || seedMetadata?.common_name) && (
              <p className="text-xs sm:text-sm font-serif italic text-muted-foreground flex items-center gap-1.5 flex-wrap">
                {seedMetadata.botanical_name && (
                  <span className="font-semibold text-botanical-900">{seedMetadata.botanical_name}</span>
                )}
                {seedMetadata.botanical_name && seedMetadata.common_name && <span>•</span>}
                {seedMetadata.common_name && <span>{seedMetadata.common_name}</span>}
                {seedMetadata.variety && <span>({seedMetadata.variety})</span>}
              </p>
            )}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-botanical-950 tracking-tight leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          {/* Interactive Variant Selection, Pricing & Cart Integration */}
          <VariantSelector product={product} />

          {/* Indian Destination PIN Serviceability Checker */}
          <div className="pt-2">
            <PincodeChecker
              isPerishable={isPerishable}
              weightKg={isSeed ? 0.25 : 1.0}
              compact={false}
            />
          </div>
        </div>
      </div>

      {/* Botanical Specifications & Cultivation Guidelines Section */}
      <div className="pt-8 border-t border-border">
        <BotanicalSpecs metadata={seedMetadata} />
      </div>

      {/* Customer Information, Logistics & Store Policies Section */}
      <div className="pt-8 border-t border-border">
        <ProductTrustAndPolicies
          isPerishable={isPerishable}
          categoryName={category?.name || (isSeed ? 'Seeds' : 'Plants')}
        />
      </div>

      {/* Related Products Carousel / Grid */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-border space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-botanical-950 tracking-tight">
                Complementary Varieties &amp; Plants
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                More high-viability seeds and companion plants suited for Indian home cultivation.
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-botanical-700">
              <Link href="/store">View All →</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
