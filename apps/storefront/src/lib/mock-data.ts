/**
 * @fileoverview Canonical botanical reference catalog.
 * Annotated with /*#__PURE__* / markers to enable dead-code elimination and tree-shaking (GLOROV-MOCK-001).
 */

import type {
  AnnouncementItem,
  BannerSlideItem,
  BotanicalCategoryDetail,
  CategoryNavItem,
  TrustBadgeItem,
} from '../types/storefront'

/**
 * Canonical botanical announcements matching Flutter GlorovRepositories.announcements
 */
export const MOCK_ANNOUNCEMENTS: AnnouncementItem[] = /*#__PURE__*/ [
  {
    id: 'ann-1',
    text: 'Pan-India Cold Chain Dispatch & 100% Transit Safe Guarantee',
    highlightText: '₹499 FREE DELIVERY',
    badgeColor: '#D48B46',
    badgeTextColor: '#111827',
    icon: 'truck',
    link: '/policies/shipping',
  },
  {
    id: 'ann-2',
    text: 'Heirloom & Indigenous Indian Desi Seeds Tested for Vigorous Growth',
    highlightText: '98% GERMINATION',
    badgeColor: '#D48B46',
    badgeTextColor: '#111827',
    icon: 'sprout',
    link: '/categories/seeds',
  },
  {
    id: 'ann-3',
    text: 'Air-Purifying & Rare Cultivars Direct From Our Pune & Bengaluru Nurseries',
    highlightText: 'NURSERY FRESH',
    badgeColor: '#D48B46',
    badgeTextColor: '#111827',
    icon: 'star',
    link: '/categories/live-plants',
  },
  {
    id: 'ann-4',
    text: 'Handcrafted Terracotta & Ceramic Planters with Optimal Root Aeration',
    highlightText: 'ARTISAN CRAFT',
    badgeColor: '#7A1C2E',
    badgeTextColor: '#FFFFFF',
    icon: 'shield',
    link: '/categories/planters',
  },
  {
    id: 'ann-5',
    text: 'Use code DIWALI10 at checkout for an extra 10% off your botanical order',
    highlightText: 'USE CODE DIWALI10',
    badgeColor: '#2D6A4F',
    badgeTextColor: '#FFFFFF',
    icon: 'percent',
    link: '/store',
  },
]

/**
 * Hero Banners from apps/backend/data/banners.json & Flutter GlorovHeroBannerSlider
 */
export const MOCK_BANNERS: BannerSlideItem[] = /*#__PURE__*/ [
  {
    id: 'banner_grow_fresh',
    title: 'Grow Fresh. Live Green.',
    subtitle: 'Turn your little space into a balcony garden full of life.',
    tag: 'GROW YOUR OWN',
    desktopImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516596/glorov/banners/banner_grow_fresh_desktop.png',
    mobileImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516597/glorov/banners/banner_grow_fresh_mobile.jpg',
    ctaText: 'SHOP VEGETABLE SEEDS',
    ctaRoute: '/categories/vegetables',
    bgColor: '#183B28',
    isImageOnly: true,
  },
  {
    id: 'banner_garden_bloom',
    title: 'Let Your Garden Bloom.',
    subtitle: 'Bring home the vibrant colors, calm, and soothing beauty of nature.',
    tag: 'A LITTLE MORE NATURE',
    desktopImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516595/glorov/banners/banner_garden_bloom_desktop.png',
    mobileImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516595/glorov/banners/banner_garden_bloom_mobile.jpg',
    ctaText: 'DISCOVER FLOWER SEEDS',
    ctaRoute: '/categories/flowering',
    bgColor: '#7C1034',
    isImageOnly: true,
  },
  {
    id: 'banner_plant_seed',
    title: 'Plant a Seed. Grow a Dream.',
    subtitle: 'A greener tomorrow begins with what you plant in your pots today.',
    tag: 'START SOMETHING BEAUTIFUL',
    desktopImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516598/glorov/banners/banner_plant_seed_desktop.png',
    mobileImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516599/glorov/banners/banner_plant_seed_mobile.jpg',
    ctaText: 'START YOUR GARDEN',
    ctaRoute: '/categories/live-plants',
    bgColor: '#2D5A27',
    isImageOnly: true,
  },
  {
    id: 'banner_garden_begins',
    title: 'Every Great Garden Begins with a Seed.',
    subtitle: 'Discover the pure joy of growing something beautiful from scratch.',
    tag: 'GROW WITH GLOROV',
    desktopImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516593/glorov/banners/banner_garden_begins_desktop.png',
    mobileImageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516594/glorov/banners/banner_garden_begins_mobile.jpg',
    ctaText: 'EXPLORE SEEDS & PLANTS',
    ctaRoute: '/categories/seeds',
    bgColor: '#1E3D2F',
    isImageOnly: true,
  },
]

/**
 * 4 Botanical Trust Guarantee Pillars matching Flutter GlorovValueProps
 */
export const MOCK_TRUST_BADGES: TrustBadgeItem[] = /*#__PURE__*/ [
  {
    id: 'trust-soil',
    title: '90-Day Pre-Fertilised Soil',
    description:
      'Open-pollinated, chemical-free heirloom seeds tested for 98%+ germination vigor.',
    icon: 'soil',
    ctaRoute: '/categories/plant-care',
  },
  {
    id: 'trust-shipping',
    title: 'Arrives Healthy Guaranteed',
    description:
      'Custom ventilated botanical packaging ensures live houseplants arrive lush and shock-free.',
    icon: 'shipping',
    ctaRoute: '/policies/shipping',
  },
  {
    id: 'trust-replacement',
    title: 'Free Plant Replacement',
    description:
      'No questions asked 7-day plant transit guarantee if any specimen suffers transit distress.',
    icon: 'replacement',
    ctaRoute: '/policies/shipping',
  },
  {
    id: 'trust-support',
    title: 'Lifetime Botanical Support',
    description:
      'Our in-house botanists guide your potting, watering, and harvesting every step of the way.',
    icon: 'support',
    ctaRoute: '/faq',
  },
]

/**
 * Root Botanical Categories matching GLOROV core catalog
 */
export const MOCK_CATEGORY_DETAILS: BotanicalCategoryDetail[] = /*#__PURE__*/ [
  {
    id: 'seeds',
    slug: 'seeds',
    title: 'Seeds',
    description: 'Heirloom Desi Vegetable, Flower & Herb Seeds',
    imageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    productCount: 20,
    badge: '98% Germination',
    subcategories: ['All Seeds', 'Vegetable Seeds', 'Flower Seeds', 'Herb Seeds'],
  },
  {
    id: 'vegetables',
    slug: 'vegetables',
    title: 'Vegetables',
    description: 'Desi Heirloom Vegetable Seeds & Balcony Kitchen Greens',
    imageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571728/glorov/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
    productCount: 8,
    badge: 'Desi Heirloom',
    subcategories: ['All Vegetables', 'Heirloom Seeds', 'Leafy Greens', 'Kitchen Essentials'],
  },
  {
    id: 'live-plants',
    slug: 'live-plants',
    title: 'Living Plants',
    description: 'Acclimatized Indoor, Air-Purifying & Balcony Houseplants',
    imageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
    productCount: 24,
    badge: 'Nursery Fresh',
    subcategories: ['All Live Plants', 'Indoor Foliage', 'Air-Purifying', 'Flowering Plants', 'Succulents & Bonsai'],
  },
  {
    id: 'flowers',
    slug: 'flowers',
    title: 'Flowers',
    description: 'Seasonal Flowering Seeds & Vibrant Blooming Houseplants',
    imageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
    productCount: 12,
    badge: 'Seasonal Bloom',
    subcategories: ['All Flowers', 'Flower Seeds', 'Flowering Plants', 'Pollinator Favorites'],
  },
  {
    id: 'herbs',
    slug: 'herbs',
    title: 'Herbs',
    description: 'Culinary Herb Seeds & Fresh Medicinal Living Botanicals',
    imageUrl:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
    productCount: 6,
    badge: 'Aromatic & Pure',
    subcategories: ['All Herbs', 'Herb Seeds', 'Medicinal Plants', 'Kitchen Herbs'],
  },
]

/**
 * Botanical Category Navigation Items matching GLOROV Header
 */
export const CATEGORY_NAV_ITEMS: CategoryNavItem[] = /*#__PURE__*/ [
  {
    id: 'cat-seeds',
    label: 'Seeds',
    categoryFilter: 'Seeds',
    route: '/categories/seeds',
    icon: 'eco',
  },
  {
    id: 'cat-vegetables',
    label: 'Vegetables',
    categoryFilter: 'Vegetable Seeds',
    route: '/categories/vegetables',
    icon: 'agriculture',
  },
  {
    id: 'cat-live-plants',
    label: 'Living Plants',
    categoryFilter: 'Live Plants',
    route: '/categories/live-plants',
    icon: 'yard',
  },
  {
    id: 'cat-flowers',
    label: 'Flowers',
    categoryFilter: 'Flowering Plants',
    route: '/categories/flowers',
    icon: 'local_florist',
  },
  {
    id: 'cat-herbs',
    label: 'Herbs',
    categoryFilter: 'Fruit & Herb Seeds',
    route: '/categories/herbs',
    icon: 'grass',
  },
  {
    id: 'cat-offers',
    label: 'Offers',
    categoryFilter: 'Offers',
    route: '/offers',
    icon: 'percent',
    badge: 'SALE',
  },
]


