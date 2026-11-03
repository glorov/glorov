import type { Metadata } from 'next'
import React from 'react'
import { notFound } from 'next/navigation'
import { PageContainer } from '../../../components/layout/PageContainer'
import { Breadcrumbs } from '../../../components/layout/Breadcrumbs'
import { ProductDetailView } from '../../../components/product/ProductDetailView'
import { BASE_URL } from '../../../lib/constants'
import { GlorovProductItem } from '../../../types/storefront'
import {
  getProductBySlugOrId,
  getAllProductHandles,
  getRelatedProductsForProduct,
} from '../../../lib/api/products'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

/**
 * Enable dynamic route generation so products created in Medusa Admin Dashboard
 * or PostgreSQL are immediately resolved without rebuilds.
 */
export const dynamicParams = true
export const revalidate = 60

/**
 * Pre-generate static routes for all available botanical products in Medusa DB and catalog
 */
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const handles = await getAllProductHandles()
    // Pre-render the primary catalog items; dynamicParams = true handles remaining items on demand
    return handles.slice(0, 15).map((h) => ({ slug: h }))
  } catch {
    return []
  }
}

/**
 * Dynamic SEO metadata for PDP
 */
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlugOrId(slug)

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The requested botanical item could not be located in our nursery catalog.',
    }
  }

  const effectivePrice = product.discountPrice ?? product.price
  const priceDisplay = `₹${effectivePrice}`
  const pageTitle = `${product.title} (${priceDisplay})`
  const description =
    product.shortDescription ||
    product.description ||
    `Buy authentic ${product.title} online at GLOROV with 100% live transit guarantee across India.`
  const imageUrl = product.primaryImage || '/og-image.jpg'

  return {
    title: pageTitle,
    description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${pageTitle} | GLOROV`,
      description,
      url: `/products/${product.slug}`,
      siteName: 'GLOROV',
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} | GLOROV`,
      description,
      images: [imageUrl],
    },
  }
}

/**
 * GLOROV Product Detail Page (PDP)
 * Implements high-craft desktop two-column sticky layout,
 * mobile responsive single column with sticky bottom purchase bar,
 * Schema.org Product structured data, and related botanical recommendations.
 */
export default async function ProductDetailPage({ params }: ProductPageProps): Promise<React.ReactElement> {
  const { slug } = await params
  const product = await getProductBySlugOrId(slug)

  if (!product) {
    notFound()
  }

  // Related products from Medusa backend or category fallback
  const fallbackRelated: GlorovProductItem[] = await getRelatedProductsForProduct(product, 4)

  // Schema.org Product JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.imageUrls.length > 0 ? product.imageUrls : [product.primaryImage],
    description: product.shortDescription || product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'GLOROV',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.discountPrice ?? product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${BASE_URL}/products/${product.slug}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
  }

  const categorySlug = product.category.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return (
    <div className="w-full bg-[#F9FAF8] pb-16">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: product.category, href: `/categories/${categorySlug}` },
          { label: product.title },
        ]}
        showBackButton={true}
        showShareButton={true}
      />

      <PageContainer className="pt-4 max-w-[1400px]">
        {/* 2. Interactive Product Detail Coordinator */}
        <ProductDetailView product={product} relatedProducts={fallbackRelated} />
      </PageContainer>
    </div>
  )
}
