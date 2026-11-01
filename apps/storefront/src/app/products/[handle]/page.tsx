import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronRight, Sprout, Leaf, Tag, Star, ShieldCheck } from 'lucide-react'
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
import { StickyAddToCartBar } from '@/components/catalog/StickyAddToCartBar'
import { ProductReviews } from '@/components/catalog/ProductReviews'
import { FrequentlyBoughtTogether } from '@/components/catalog/FrequentlyBoughtTogether'
import styles from './ProductPage.module.css'

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

  // JSON-LD Structured Data
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

  // Fetch related products
  const relatedRes = await getStoreCatalogProducts({
    category_id: category ? [category.id] : undefined,
    limit: 5,
  })
  const relatedProducts = (relatedRes.success ? relatedRes.products : [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4)

  return (
    <div className={styles.container}>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link href="/store" className={styles.breadcrumbLink}>
          Store
        </Link>
        {category && (
          <>
            <ChevronRight size={12} aria-hidden="true" />
            <Link
              href={`/categories/${category.handle}`}
              className={styles.breadcrumbLink}
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight size={12} aria-hidden="true" />
        <span className={styles.breadcrumbCurrent}>
          {product.title}
        </span>
      </nav>

      {/* Main 2-Column Product Detail Layout */}
      <div className={styles.productGrid}>
        {/* Left Column: Gallery */}
        <div className={styles.leftColumn}>
          <ProductGallery
            title={product.title}
            thumbnail={product.thumbnail}
            images={product.images}
          />
        </div>

        {/* Right Column: Title, Metadata, Variants, Pincode Checker */}
        <div className={styles.rightColumn}>
          {/* Badge Row */}
          <div className={styles.badgeRow}>
            <span className={styles.categoryBadge}>
              {isSeed ? (
                <Sprout size={14} aria-hidden="true" />
              ) : (
                <Leaf size={14} aria-hidden="true" />
              )}
              <span>{category?.name || (isSeed ? 'Pure Seed Batch' : 'Live Botanical')}</span>
            </span>

            {isPerishable ? (
              <span className={styles.shippingBadge} style={{ color: 'var(--ugaoo-maroon)', borderColor: 'var(--ugaoo-maroon)' }}>
                Air Express Transit Required
              </span>
            ) : (
              <span className={styles.shippingBadge}>
                Standard Pan-India Shipping
              </span>
            )}

            <span className={styles.taxBadge}>
              <Tag size={12} aria-hidden="true" style={{ color: 'var(--ugaoo-green)' }} />
              <span>{isSeed ? 'GST 0% Exempt (HSN 1209)' : 'GST 5% (Live Plant HSN 0602)'}</span>
            </span>
          </div>

          {/* Title Area */}
          <div className={styles.titleArea}>
            {(seedMetadata?.botanical_name || seedMetadata?.common_name) && (
              <p className={styles.taxonomySubtitle}>
                {seedMetadata.botanical_name && (
                  <span className={styles.taxonomyBinomial}>{seedMetadata.botanical_name}</span>
                )}
                {seedMetadata.botanical_name && seedMetadata.common_name && <span>•</span>}
                {seedMetadata.common_name && <span>{seedMetadata.common_name}</span>}
                {seedMetadata.variety && <span>({seedMetadata.variety})</span>}
              </p>
            )}
            <h1 className={styles.productTitle}>
              {product.title}
            </h1>

            {/* Ratings & Verification */}
            <div className={styles.ratingRow}>
              <div className={styles.stars} aria-label="Quality Rating 4.8 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} style={{ fill: '#fbbf24', color: '#fbbf24' }} aria-hidden="true" />
                ))}
              </div>
              <span className={styles.ratingScore}>4.8</span>
              <span>•</span>
              <span>Pune Nursery Verified Batch</span>
              <span>•</span>
              <span className={styles.testedChip}>
                <ShieldCheck size={12} aria-hidden="true" />
                <span>95%+ Viability Tested</span>
              </span>
            </div>
          </div>

          {/* Product Description */}
          {product.description && (
            <p className={styles.description}>
              {product.description}
            </p>
          )}

          {/* Variant Selector */}
          <div id="main-add-to-cart-container">
            <VariantSelector product={product} />
          </div>

          {/* Pincode Checker */}
          <div style={{ paddingTop: '0.5rem' }}>
            <PincodeChecker
              isPerishable={isPerishable}
              weightKg={isSeed ? 0.25 : 1.0}
              compact={false}
            />
          </div>
        </div>
      </div>

      {/* Botanical Specifications Section */}
      <div className={styles.sectionDivider}>
        <BotanicalSpecs metadata={seedMetadata} />
      </div>

      {/* Frequently Bought Together / Botanical Pairing Duo */}
      {relatedProducts.length > 0 && (
        <div className={styles.sectionDivider}>
          <FrequentlyBoughtTogether
            mainProduct={product}
            companionProduct={relatedProducts[0]}
          />
        </div>
      )}

      {/* Trust & Policies Section */}
      <div className={styles.sectionDivider}>
        <ProductTrustAndPolicies
          isPerishable={isPerishable}
          categoryName={category?.name || (isSeed ? 'Seeds' : 'Plants')}
        />
      </div>

      {/* Customer Reviews & Botanical Experiences */}
      <div className={styles.sectionDivider}>
        <ProductReviews productTitle={product.title} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className={styles.sectionDivider}>
          <div className={styles.relatedHeader}>
            <div>
              <h2 className={styles.relatedTitle}>
                Complementary Varieties &amp; Plants
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--ugaoo-text-muted)', margin: '2px 0 0 0' }}>
                More high-viability seeds and companion plants suited for Indian home cultivation.
              </p>
            </div>
            <Link href="/store" className={styles.viewAllLink}>
              View All Botanical Catalog →
            </Link>
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Bottom Add-to-Cart Bar */}
      <StickyAddToCartBar product={product} targetSentinelId="main-add-to-cart-container" />
    </div>
  )
}
