/**
 * Core domain types for GLOROV Storefront shared components.
 * Conforms to Flutter domain models and Medusa v2 backend responses.
 */

export type ProductType = 'seeds' | 'plants' | 'planters' | 'care' | 'accessories'

export interface ProductVariantItem {
  id: string
  name: string
  price: number
  discountPrice?: number
  inStock?: boolean
}

export interface BotanicalSpecifications {
  germinationPeriod?: string
  sowingDepth?: string
  plantingSeason?: string
  harvestTime?: string
  packContents?: string
  sunlightRequirement?: string
  wateringNeeds?: string
  difficultyLevel?: string
  potSize?: string
  isPetFriendly?: boolean
  material?: string
  dimensions?: string
}

export interface CustomerReviewItem {
  id: string
  author: string
  rating: number
  date: string
  title: string
  content: string
  isVerified: boolean
}

export interface ProductReviewSummary {
  averageRating: number
  totalReviews: number
  starCounts: Record<number, number>
  aiSummaryTitle?: string
  aiSummaryText?: string
}

export interface GlorovProductItem {
  id: string
  slug: string
  title: string
  botanicalName?: string
  shortDescription?: string
  description?: string
  category: string
  subcategory?: string
  productType?: ProductType
  price: number // in INR
  discountPrice?: number // in INR
  discountPercent?: number
  rating: number
  reviewCount: number
  imageUrls: string[]
  primaryImage: string
  inStock: boolean
  isBestSeller?: boolean
  isStaffPick?: boolean
  isFeatured?: boolean
  badges?: string[]
  tags?: string[]
  variants?: ProductVariantItem[]
  botanicalSpecs?: BotanicalSpecifications
  reviewsSummary?: ProductReviewSummary
  customerReviews?: CustomerReviewItem[]
}

export interface AnnouncementItem {
  id: string
  text: string
  highlightText?: string
  highlight_text?: string
  badgeColor?: string
  badge_color?: string
  badgeTextColor?: string
  badge_text_color?: string
  icon?: 'truck' | 'sprout' | 'bolt' | 'percent' | 'winter' | 'shield' | 'star' | string
  link?: string
  link_url?: string
  displayOrder?: number
  display_order?: number
  isActive?: boolean
  is_active?: boolean
}

export interface AnnouncementConfig {
  isEnabled?: boolean
  is_enabled?: boolean
  speedSeconds?: number
  speed_seconds?: number
  pauseOnHover?: boolean
  pause_on_hover?: boolean
  highlightColor?: string
  highlight_color?: string
  textColor?: string
  text_color?: string
  bgColor?: string
  bg_color?: string
}

export interface CategoryNavItem {
  id: string
  label: string
  categoryFilter: string
  route: string
  icon: string
  badge?: string
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrent?: boolean
}

export interface BannerSlideItem {
  id: string
  title: string
  subtitle: string
  tag?: string
  desktopImageUrl: string
  mobileImageUrl: string
  ctaText: string
  ctaRoute: string
  bgColor?: string
  isImageOnly?: boolean
}

export interface TrustBadgeItem {
  id: string
  title: string
  description: string
  icon:
    | 'soil'
    | 'shipping'
    | 'replacement'
    | 'support'
    | 'shield'
    | 'organic-shield'
    | 'transit-truck'
    | 'support-hand'
    | 'eco-leaf'
    | string
  ctaRoute?: string
}

export interface BotanicalCategoryDetail {
  id: string
  slug: string
  title: string
  description: string
  imageUrl: string
  productCount: number
  badge: string
  subcategories: string[]
}

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastMessage {
  id: string
  type: ToastType
  message: string
  title?: string
  duration?: number
  actionLabel?: string
  onAction?: () => void
  action?: {
    label: string
    onClick: () => void
  }
}

export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  originalPrice?: number
  quantity: number
  image: string
  variantName?: string
}
