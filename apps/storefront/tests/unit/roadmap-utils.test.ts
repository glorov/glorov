import { describe, it, expect } from 'vitest'
import {
  buildDynamicMilestoneRoadmap,
  normalizeOffer,
  RawOfferLike,
} from '../../src/lib/roadmap-utils'

describe('Dynamic Milestone Roadmap Engine (roadmap-utils)', () => {
  const sampleOffers: RawOfferLike[] = [
    {
      code: 'GLOROV10',
      title: 'Special Welcome Offer',
      discount_value: 10,
      discount_type: 'percentage',
      min_spend: 499,
      category: 'sitewide',
      is_active: true,
      display_order: 1,
    },
    {
      code: 'DIWALI10', // Collides with GLOROV10 (both 10%)
      title: '10% OFF',
      discount_value: 10,
      discount_type: 'percentage',
      min_spend: 999,
      category: 'sitewide',
      is_active: true,
      display_order: 2,
    },
    {
      code: 'THUNDER15',
      title: '15% OFF',
      discount_value: 15,
      discount_type: 'percentage',
      min_spend: 1499,
      category: 'sitewide',
      is_active: true,
      display_order: 3,
    },
    {
      code: 'WINTER20',
      title: '20% OFF',
      discount_value: 20,
      discount_type: 'percentage',
      min_spend: 2299,
      category: 'sitewide',
      is_active: true,
      display_order: 4,
    },
    {
      code: 'HEIRLOOM20', // Collides with WINTER20 (both 20%)
      title: '20% OFF Seeds',
      discount_value: 20,
      discount_type: 'percentage',
      min_spend: 499,
      category: 'seeds',
      applicable_categories: ['seeds'],
      is_active: true,
      display_order: 5,
    },
  ]

  it('normalizes offer fields from snake_case backend representation', () => {
    const raw: RawOfferLike = {
      code: 'GLOROV10',
      title: 'Special Welcome Offer',
      discount_value: 10,
      discount_type: 'percentage',
      min_spend: 499,
    }
    const normalized = normalizeOffer(raw)
    expect(normalized.code).toBe('GLOROV10')
    expect(normalized.discountPercent).toBe(10)
    expect(normalized.minSpend).toBe(499)
  })

  it('deduplicates colliding percentages and limits to 3-5 total nodes', () => {
    const roadmap = buildDynamicMilestoneRoadmap(sampleOffers, 0, null, 499)

    // Should have: FREE + 10% + 15% + 20% = 4 total nodes
    expect(roadmap.nodes.length).toBe(4)
    expect(roadmap.nodes[0].label).toBe('FREE')
    expect(roadmap.nodes[1].label).toBe('10%')
    expect(roadmap.nodes[2].label).toBe('15%')
    expect(roadmap.nodes[3].label).toBe('20%')

    // Sitewide 20% should win over seeds-restricted 20%
    expect(roadmap.nodes[3].code).toBe('WINTER20')
  })

  it('dynamically adapts when offers have different percentages (e.g. 12%, 18%, 25%)', () => {
    const customOffers: RawOfferLike[] = [
      {
        code: 'TIER12',
        title: '12% OFF',
        discount_value: 12,
        discount_type: 'percentage',
        min_spend: 799,
        is_active: true,
      },
      {
        code: 'TIER18',
        title: '18% OFF',
        discount_value: 18,
        discount_type: 'percentage',
        min_spend: 1399,
        is_active: true,
      },
      {
        code: 'TIER25',
        title: '25% OFF',
        discount_value: 25,
        discount_type: 'percentage',
        min_spend: 2499,
        is_active: true,
      },
    ]

    const roadmap = buildDynamicMilestoneRoadmap(customOffers, 0, null, 499)
    expect(roadmap.nodes.length).toBe(4)
    expect(roadmap.nodes.map((n) => n.label)).toEqual(['FREE', '12%', '18%', '25%'])
    expect(roadmap.nodes[1].minSpend).toBe(799)
    expect(roadmap.nodes[2].minSpend).toBe(1399)
    expect(roadmap.nodes[3].minSpend).toBe(2499)
  })

  it('calculates position fractions evenly across nodes matching reference image', () => {
    const roadmap = buildDynamicMilestoneRoadmap(sampleOffers, 0, null, 499)
    // 4 nodes: positions are 0.25, 0.50, 0.75, 1.00
    expect(roadmap.nodes[0].positionFraction).toBe(0.25)
    expect(roadmap.nodes[1].positionFraction).toBe(0.5)
    expect(roadmap.nodes[2].positionFraction).toBe(0.75)
    expect(roadmap.nodes[3].positionFraction).toBe(1)
  })

  it('generates exact headline: "Add ₹420 more to unlock free delivery" when subtotal is 79', () => {
    const roadmap = buildDynamicMilestoneRoadmap(sampleOffers, 79, null, 499)
    expect(roadmap.headline.prefix).toBe('Add ₹420 more to unlock ')
    expect(roadmap.headline.highlight).toBe('free delivery')
    // Progress fraction is (79 / 499) * 0.25 ≈ 0.0395
    expect(roadmap.progressFraction).toBeCloseTo(0.0395, 2)
  })

  it('generates correct headline and progress when free delivery is unlocked', () => {
    const roadmap = buildDynamicMilestoneRoadmap(sampleOffers, 500, null, 499)
    expect(roadmap.nodes[0].isReached).toBe(true)
    expect(roadmap.headline.prefix).toContain('Add ₹')
    expect(roadmap.headline.highlight).toBe('10% off')
  })

  it('reports maximum discount unlocked when subtotal reaches highest tier', () => {
    const roadmap = buildDynamicMilestoneRoadmap(sampleOffers, 2500, 'WINTER20', 499)
    expect(roadmap.progressFraction).toBe(1.0)
    expect(roadmap.nodes.every((n) => n.isReached)).toBe(true)
    expect(roadmap.nodes[3].isApplied).toBe(true)
    expect(roadmap.headline.prefix).toBe('🎉 Maximum discount unlocked! ')
    expect(roadmap.headline.highlight).toBe('20% off')
  })
})
