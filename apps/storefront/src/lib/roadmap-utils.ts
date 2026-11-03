/**
 * Dynamic Milestone Roadmap Engine for GLOROV Botanical Commerce
 *
 * Dynamically computes milestone tiers, deduplicates colliding offer percentages,
 * distributes node coordinates along the continuous progress track, and
 * generates real-time headlines based on active backend database offers.
 */

export interface RawOfferLike {
  id?: string
  code: string
  title: string
  description?: string
  discount_badge?: string
  discountBadge?: string
  discount_type?: 'percentage' | 'fixed' | 'free_shipping'
  discountType?: 'percentage' | 'fixed' | 'free_shipping'
  discount_value?: number
  discountValue?: number
  discountPercent?: number
  min_spend?: number
  minSpend?: number
  category?: string
  applicable_categories?: string[]
  applicableCategories?: string[]
  is_active?: boolean
  isActive?: boolean
  display_order?: number
  displayOrder?: number
}

export interface RoadmapNode {
  id: string
  label: string // e.g. "FREE", "10%", "15%", "20%"
  type: 'free_shipping' | 'percentage' | 'fixed'
  discountPercent: number // 0 for free shipping
  minSpend: number
  code: string
  title: string
  description: string
  category?: string
  applicableCategories?: string[]
  positionFraction: number // 0 to 1 along track
  isReached: boolean
  isApplied: boolean
  isUpgrade: boolean
}

export interface DynamicRoadmap {
  nodes: RoadmapNode[]
  progressFraction: number // 0 to 1
  headline: {
    prefix: string
    highlight: string
  }
  currentSubtotal: number
  freeShippingThreshold: number
  nextTargetNode?: RoadmapNode
  highestReachedNode?: RoadmapNode
}

/**
 * Normalizes offer fields from either snake_case (Medusa backend) or camelCase (storefront)
 */
export function normalizeOffer(raw: RawOfferLike): {
  id: string
  code: string
  title: string
  description: string
  discountType: 'percentage' | 'fixed' | 'free_shipping'
  discountPercent: number
  minSpend: number
  category: string
  applicableCategories: string[]
  isActive: boolean
  displayOrder: number
} {
  const code = (raw.code || '').trim().toUpperCase()
  const discountType = raw.discount_type || raw.discountType || 'percentage'
  const discountPercent =
    raw.discount_value ??
    raw.discountValue ??
    raw.discountPercent ??
    (raw.discount_badge ? parseInt(raw.discount_badge.replace(/[^0-9]/g, ''), 10) || 0 : 0)

  const minSpend = raw.min_spend ?? raw.minSpend ?? 0
  const applicableCategories = raw.applicable_categories ?? raw.applicableCategories ?? []
  const category = raw.category || 'sitewide'
  const isActive = raw.is_active ?? raw.isActive ?? true
  const displayOrder = raw.display_order ?? raw.displayOrder ?? 99

  return {
    id: raw.id || `offer_${code.toLowerCase()}`,
    code,
    title: raw.title || `${discountPercent}% OFF`,
    description: raw.description || `Special discount on botanical orders`,
    discountType,
    discountPercent,
    minSpend,
    category,
    applicableCategories,
    isActive,
    displayOrder,
  }
}

/**
 * Builds a dynamic, collision-free milestone roadmap from current active database offers.
 *
 * Rules:
 * 1. Automatically extracts percentage discounts from active database offers.
 * 2. De-duplicates colliding offers (if two different offers have the same percentage discount, only one is kept).
 *    Prefers sitewide offers over category-restricted ones, and selects the threshold that creates a clean ascending ladder.
 * 3. Keeps total nodes strictly between 3 and 5 (1 Free Delivery node + 2 to 4 unique percentage tiers).
 * 4. Calculates precise milestone coordinates matching the reference horizontal track.
 * 5. Computes continuous progress fill and real-time shortfall headlines.
 */
export function buildDynamicMilestoneRoadmap(
  rawOffers: RawOfferLike[] = [],
  currentSubtotal = 0,
  appliedCouponCode: string | null = null,
  freeShippingThreshold = 499
): DynamicRoadmap {
  const subtotal = Math.max(0, currentSubtotal)
  const cleanAppliedCode = (appliedCouponCode || '').trim().toUpperCase()

  // 1. Normalize and filter active percentage offers
  const normalized = rawOffers
    .map(normalizeOffer)
    .filter((o) => o.isActive && o.discountPercent > 0 && o.discountType === 'percentage')

  // 2. Collision Resolution: Group by discount percentage and select the single best offer for each percentage
  const offersByPercent = new Map<number, ReturnType<typeof normalizeOffer>>()

  for (const offer of normalized) {
    const existing = offersByPercent.get(offer.discountPercent)
    if (!existing) {
      offersByPercent.set(offer.discountPercent, offer)
      continue
    }

    // Collision detected! Choose the winner:
    // A) Sitewide offers beat category-restricted offers for the global roadmap
    const offerIsSitewide =
      offer.applicableCategories.length === 0 ||
      offer.applicableCategories.includes('*') ||
      offer.applicableCategories.includes('sitewide') ||
      offer.category === 'sitewide'

    const existingIsSitewide =
      existing.applicableCategories.length === 0 ||
      existing.applicableCategories.includes('*') ||
      existing.applicableCategories.includes('sitewide') ||
      existing.category === 'sitewide'

    if (offerIsSitewide && !existingIsSitewide) {
      offersByPercent.set(offer.discountPercent, offer)
      continue
    }
    if (!offerIsSitewide && existingIsSitewide) {
      continue
    }

    // B) If both are sitewide (or both category-restricted), pick the one with better ascending min_spend or priority
    if (offer.minSpend > existing.minSpend && offer.discountPercent >= 15) {
      // Higher spend milestone for higher tier discounts
      offersByPercent.set(offer.discountPercent, offer)
    } else if (offer.displayOrder < existing.displayOrder) {
      offersByPercent.set(offer.discountPercent, offer)
    }
  }

  // 3. Fallback defaults if no percentage offers found in database
  let uniqueOffers = Array.from(offersByPercent.values())

  if (uniqueOffers.length === 0) {
    uniqueOffers = [
      {
        id: 'offer_10',
        code: 'GLOROV10',
        title: '10% OFF',
        description: 'On orders above ₹999',
        discountType: 'percentage',
        discountPercent: 10,
        minSpend: 999,
        category: 'sitewide',
        applicableCategories: [],
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 'offer_15',
        code: 'THUNDER15',
        title: '15% OFF',
        description: 'On orders above ₹1,599',
        discountType: 'percentage',
        discountPercent: 15,
        minSpend: 1599,
        category: 'sitewide',
        applicableCategories: [],
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 'offer_20',
        code: 'WINTER20',
        title: '20% OFF',
        description: 'On orders above ₹2,299',
        discountType: 'percentage',
        discountPercent: 20,
        minSpend: 2299,
        category: 'sitewide',
        applicableCategories: [],
        isActive: true,
        displayOrder: 3,
      },
    ]
  }

  // 4. Sort ascending by discount percentage (and ensure ascending minSpend tiers)
  uniqueOffers.sort((a, b) => a.discountPercent - b.discountPercent)

  // Cap discount milestones to at most 4 tiers so total nodes (including FREE) is between 3 and 5
  if (uniqueOffers.length > 4) {
    uniqueOffers = uniqueOffers.slice(0, 4)
  }

  // Ensure minimum threshold spacing so milestones step up cleanly
  let previousSpend = freeShippingThreshold
  for (let i = 0; i < uniqueOffers.length; i++) {
    if (uniqueOffers[i].minSpend <= previousSpend) {
      // Step up minimum spend cleanly if database has a flat threshold
      uniqueOffers[i].minSpend = previousSpend + 500
    }
    previousSpend = uniqueOffers[i].minSpend
  }

  // 5. Determine active coupon discount percent to compute upgrade status
  let currentAppliedPercent = 0
  if (cleanAppliedCode) {
    const matched = uniqueOffers.find((o) => o.code === cleanAppliedCode)
    if (matched) {
      currentAppliedPercent = matched.discountPercent
    } else if (cleanAppliedCode.includes('20')) {
      currentAppliedPercent = 20
    } else if (cleanAppliedCode.includes('15')) {
      currentAppliedPercent = 15
    } else if (cleanAppliedCode.includes('10')) {
      currentAppliedPercent = 10
    }
  }

  // 6. Build the Nodes array
  // Node 0 is always Free Delivery
  const isFreeReached = subtotal >= freeShippingThreshold

  const nodes: RoadmapNode[] = [
    {
      id: 'milestone_node_free',
      label: 'FREE',
      type: 'free_shipping',
      discountPercent: 0,
      minSpend: freeShippingThreshold,
      code: 'FREESHIP',
      title: 'Free Express Delivery',
      description: `Free moisture-conditioned botanical delivery on orders above ₹${freeShippingThreshold}`,
      category: 'sitewide',
      positionFraction: 0, // Assigned below
      isReached: isFreeReached,
      isApplied: false,
      isUpgrade: false,
    },
  ]

  for (const offer of uniqueOffers) {
    const isReached = subtotal >= offer.minSpend
    const isApplied = cleanAppliedCode === offer.code
    const isUpgrade = isReached && offer.discountPercent > currentAppliedPercent

    nodes.push({
      id: `milestone_node_${offer.discountPercent}`,
      label: `${offer.discountPercent}%`,
      type: 'percentage',
      discountPercent: offer.discountPercent,
      minSpend: offer.minSpend,
      code: offer.code,
      title: offer.title,
      description: offer.description,
      category: offer.category,
      applicableCategories: offer.applicableCategories,
      positionFraction: 0, // Assigned below
      isReached,
      isApplied,
      isUpgrade,
    })
  }

  // 7. Calculate Node Coordinates along the track
  // For K nodes (e.g. 4 nodes: FREE, 10%, 15%, 20%), node i is at (i + 1) / K
  // Node 0 (FREE) = 0.25, Node 1 (10%) = 0.50, Node 2 (15%) = 0.75, Node 3 (20%) = 1.00
  const totalNodes = nodes.length
  nodes.forEach((node, idx) => {
    node.positionFraction = (idx + 1) / totalNodes
  })

  // 8. Continuous Progress Fraction Calculation
  let progressFraction = 0
  if (subtotal <= 0) {
    progressFraction = 0
  } else if (subtotal < nodes[0].minSpend) {
    progressFraction = (subtotal / nodes[0].minSpend) * nodes[0].positionFraction
  } else {
    // Check intermediate intervals
    let intervalFound = false
    for (let i = 0; i < nodes.length - 1; i++) {
      const current = nodes[i]
      const next = nodes[i + 1]

      if (subtotal >= current.minSpend && subtotal < next.minSpend) {
        const deltaSpend = next.minSpend - current.minSpend
        const progressInInterval = deltaSpend > 0 ? (subtotal - current.minSpend) / deltaSpend : 0
        const deltaFraction = next.positionFraction - current.positionFraction

        progressFraction = current.positionFraction + progressInInterval * deltaFraction
        intervalFound = true
        break
      }
    }

    if (!intervalFound) {
      // Subtotal is at or beyond the final milestone
      progressFraction = 1.0
    }
  }

  progressFraction = Math.min(1.0, Math.max(0, progressFraction))

  // 9. Real-Time Dynamic Headline & Next Target Milestone
  const unreachedNodes = nodes.filter((n) => !n.isReached)
  const nextTargetNode = unreachedNodes[0]
  const reachedNodes = nodes.filter((n) => n.isReached)
  const highestReachedNode = reachedNodes[reachedNodes.length - 1]

  let headline: { prefix: string; highlight: string }

  if (nextTargetNode) {
    const diff = Math.max(1, Math.round(nextTargetNode.minSpend - subtotal))
    if (nextTargetNode.type === 'free_shipping') {
      headline = {
        prefix: `Add ₹${diff} more to unlock `,
        highlight: 'free delivery',
      }
    } else {
      headline = {
        prefix: `Add ₹${diff} more to unlock `,
        highlight: `${nextTargetNode.label} off`,
      }
    }
  } else {
    const lastNode = nodes[nodes.length - 1]
    headline = {
      prefix: '🎉 Maximum discount unlocked! ',
      highlight: `${lastNode.label} off`,
    }
  }

  return {
    nodes,
    progressFraction,
    headline,
    currentSubtotal: subtotal,
    freeShippingThreshold,
    nextTargetNode,
    highestReachedNode,
  }
}
