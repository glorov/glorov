import React from 'react'
import type { Metadata } from 'next'
import { getStoreCatalogCategories } from '@/lib/catalog'
import { CategoriesClient, type CuratedCategoryVisual } from './CategoriesClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Botanical Categories & Collections — Indian Seeds & Live Plants | GLOROV',
  description:
    'Browse our comprehensive botanical directory of high-germination Desi seeds, acclimatized live houseplants, artisanal terracotta pots, and certified organic soil mixes.',
  alternates: {
    canonical: '/categories',
  },
  openGraph: {
    title: 'Botanical Categories & Collections | GLOROV',
    description:
      'Explore certified Desi heirloom seeds, indoor houseplants, and gardening supplies with safe transit dispatch across India.',
    url: '/categories',
    type: 'website',
  },
}

const CURATED_CATEGORY_VISUALS: CuratedCategoryVisual[] = [
  {
    handle: 'vegetable-seeds',
    title: 'Desi Vegetable Seeds',
    group: 'Seeds',
    badge: 'Desi Heirloom',
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80',
    description: 'Indigenous high-yield heirloom tomato, chilli, bhindi, gourds, and seasonal vegetables.',
    subcategories: [
      { name: 'Tomatoes', handle: 'vegetable-seeds' },
      { name: 'Green Chillies', handle: 'vegetable-seeds' },
      { name: 'Greens & Spinach', handle: 'vegetable-seeds' },
      { name: 'Bhindi / Okra', handle: 'vegetable-seeds' },
    ],
  },
  {
    handle: 'flower-seeds',
    title: 'Festive Flower Seeds',
    group: 'Seeds',
    badge: 'Pollinator Friendly',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=1200&q=80',
    description: 'Vibrant marigold, golden sunflowers, zinnias, and pollinator-friendly garden blooms.',
    subcategories: [
      { name: 'Pusa Narangi Marigold', handle: 'flower-seeds' },
      { name: 'Cosmos & Zinnias', handle: 'flower-seeds' },
      { name: 'Sunflowers', handle: 'flower-seeds' },
    ],
  },
  {
    handle: 'herb-seeds',
    title: 'Medicinal & Herb Seeds',
    group: 'Seeds',
    badge: 'Ayurvedic Kitchen',
    image: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=1200&q=80',
    description: 'Krishna Tulsi, Italian basil, coriander, mint, and culinary wellness herb seeds.',
    subcategories: [
      { name: 'Krishna Tulsi', handle: 'herb-seeds' },
      { name: 'Sweet Basil', handle: 'herb-seeds' },
      { name: 'Dhaniya / Coriander', handle: 'herb-seeds' },
      { name: 'Pudina / Mint', handle: 'herb-seeds' },
    ],
  },
  {
    handle: 'indoor-plants',
    title: 'Live Indoor Plants',
    group: 'Live Plants',
    badge: 'Low Light Resilient',
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80',
    description: 'Resilient potted foliage specimens including Snake Plant, Golden Pothos, and ZZ Plant.',
    subcategories: [
      { name: 'Snake Plants', handle: 'indoor-plants' },
      { name: 'ZZ Plants', handle: 'indoor-plants' },
      { name: 'Golden Pothos', handle: 'indoor-plants' },
      { name: 'Monstera', handle: 'indoor-plants' },
    ],
  },
  {
    handle: 'air-purifying-plants',
    title: 'Air-Purifying Botanicals',
    group: 'Live Plants',
    badge: 'NASA Clean Air',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=1200&q=80',
    description: 'NASA-evaluated natural toxin-absorbing plants including Peace Lily, Areca Palm, and Sansevieria.',
    subcategories: [
      { name: 'Peace Lilies', handle: 'indoor-plants' },
      { name: 'Areca Palm', handle: 'indoor-plants' },
      { name: 'Spider Plant', handle: 'indoor-plants' },
    ],
  },
  {
    handle: 'flowering-plants',
    title: 'Flowering Live Plants',
    group: 'Live Plants',
    badge: 'Festive Blooms',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80',
    description: 'Ornamental blooming indoor and balcony plants including Anthuriums, Peace Lily, and Hibiscus.',
    subcategories: [
      { name: 'Red Anthurium', handle: 'indoor-plants' },
      { name: 'Peace Lily Blooms', handle: 'indoor-plants' },
      { name: 'Hibiscus', handle: 'indoor-plants' },
    ],
  },
  {
    handle: 'succulents-bonsai',
    title: 'Succulents & Bonsai',
    group: 'Live Plants',
    badge: 'Low Maintenance',
    image: 'https://images.unsplash.com/photo-1509223197845-458d87318791?auto=format&fit=crop&w=1200&q=80',
    description: 'Compact drought-tolerant jade succulents, zebra haworthias, and trained miniature ficus bonsai.',
    subcategories: [
      { name: 'Jade Plants', handle: 'indoor-plants' },
      { name: 'Haworthia', handle: 'indoor-plants' },
      { name: 'Ficus Bonsai', handle: 'indoor-plants' },
    ],
  },
  {
    handle: 'planters-pots',
    title: 'Pots & Ceramic Planters',
    group: 'Planters & Pots',
    badge: 'Artisan Crafted',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1200&q=80',
    description: 'Glazed ceramic designer pots, natural terracotta planters, and lightweight balcony containers.',
    subcategories: [
      { name: 'Ceramic Pots', handle: 'planters-pots' },
      { name: 'Terracotta Pots', handle: 'planters-pots' },
      { name: 'Hanging Planters', handle: 'planters-pots' },
    ],
  },
  {
    handle: 'plant-care-soil',
    title: 'Plant Care & Soil Mix',
    group: 'Plant Care & Soil',
    badge: '100% Organic',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
    description: 'Enriched vermicompost, nutrient cocopeat blocks, cold-pressed neem oil, and garden tools.',
    subcategories: [
      { name: 'Potting Mix', handle: 'store' },
      { name: 'Vermicompost', handle: 'store' },
      { name: 'Neem Oil Spray', handle: 'store' },
    ],
  },
]

export default async function CategoriesPage() {
  const categoriesRes = await getStoreCatalogCategories()
  const dbCategories = categoriesRes.success ? categoriesRes.categories : []

  // Map backend categories or fallback to curated visuals
  const categoriesToRender = CURATED_CATEGORY_VISUALS.map((curated) => {
    const matched = dbCategories.find(
      (c) => c.handle === curated.handle || c.handle.includes(curated.handle)
    )
    const dbChildren = matched?.category_children || []

    return {
      ...curated,
      title: matched?.name || curated.title,
      description: matched?.description || curated.description,
      image: (matched?.metadata?.image_url as string) || curated.image,
      badge: (matched?.metadata?.badge as string) || curated.badge,
      subcategories:
        dbChildren.length > 0
          ? dbChildren.map((c) => ({ name: c.name, handle: c.handle }))
          : curated.subcategories,
    }
  })

  return <CategoriesClient categories={categoriesToRender} />
}
