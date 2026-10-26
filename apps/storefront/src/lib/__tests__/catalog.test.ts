import { describe, it, expect } from 'vitest'
import {
  computeVariantAvailability,
  parseSeedMetadata,
  seedMetadataSchema,
  seedVariantMetadataSchema,
  StoreCatalogVariant,
} from '@glorov/types'
import {
  getVariantStockAvailability,
  getVariantPriceINR,
  STORE_CATALOG_DEFAULT_FIELDS,
  flattenCategories,
  findCategoryByHandle,
  getCategoryHierarchyIds,
  getProductLowestPriceINR,
  getProductStockSummary,
} from '../catalog'

describe('Storefront Catalog & Inventory Helpers', () => {
  describe('Seed Metadata Validation (seedMetadataSchema)', () => {
    it('accepts complete authentic Indian seed metadata', () => {
      const validSeed = {
        common_name: 'Desi Tomato / Tamatar',
        botanical_name: 'Solanum lycopersicum',
        seed_type: 'Heirloom / Open-Pollinated',
        variety: 'Pusa Ruby',
        approx_seeds_per_packet: 50,
        germination_time_range: '6-10 days',
        sowing_depth: '0.5 cm',
        spacing: '45-60 cm',
        sunlight: 'full_sun' as const,
        watering: 'daily' as const,
        season: 'kharif' as const,
        difficulty: 'beginner' as const,
        planting_instructions: 'Sow 0.5 cm deep in trays. Transplant at 4-6 leaves.',
        packaging_notes: 'Foil pouch with desiccant.',
        is_perishable: false,
      }
      const result = seedMetadataSchema.safeParse(validSeed)
      expect(result.success).toBe(true)
    })

    it('keeps all botanical fields optional and accepts empty/partial metadata cleanly', () => {
      const emptySeed = {}
      const result = seedMetadataSchema.safeParse(emptySeed)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.is_perishable).toBe(false)
      }

      const partialSeed = {
        common_name: 'Marigold',
        sunlight: 'full_sun' as const,
      }
      expect(seedMetadataSchema.safeParse(partialSeed).success).toBe(true)
    })

    it('accepts null values for optional metadata fields without validation failure', () => {
      const metadataWithNulls = {
        common_name: 'Wild Mustard',
        botanical_name: null,
        seed_type: null,
        variety: null,
        germination_time_range: null,
        sowing_depth: null,
        spacing: null,
        sunlight: null,
        watering: null,
        season: null,
        difficulty: null,
        planting_instructions: null,
        packaging_notes: null,
      }
      const result = seedMetadataSchema.safeParse(metadataWithNulls)
      expect(result.success).toBe(true)
    })

    it('validates packet size variant metadata and accepts null values', () => {
      const variantMeta = {
        packet_size_label: '50 Seeds',
        approx_seeds_per_packet: 50,
        weight_grams: 20,
      }
      const result = seedVariantMetadataSchema.safeParse(variantMeta)
      expect(result.success).toBe(true)

      const variantWithNulls = {
        packet_size_label: null,
        approx_seeds_per_packet: null,
        weight_grams: null,
      }
      expect(seedVariantMetadataSchema.safeParse(variantWithNulls).success).toBe(true)
    })
  })

  describe('parseSeedMetadata', () => {
    it('gracefully handles null, undefined, or non-object inputs', () => {
      expect(parseSeedMetadata(null)).toEqual({})
      expect(parseSeedMetadata(undefined)).toEqual({})
      expect(parseSeedMetadata('invalid')).toEqual({})
    })

    it('extracts typed attributes from raw metadata safely', () => {
      const raw = {
        common_name: 'Tulsi',
        botanical_name: 'Ocimum tenuiflorum',
        season: 'all_season',
        sunlight: 'full_sun',
        is_perishable: false,
        extra_arbitrary_field: 12345,
      }
      const parsed = parseSeedMetadata(raw)
      expect(parsed.common_name).toBe('Tulsi')
      expect(parsed.botanical_name).toBe('Ocimum tenuiflorum')
      expect(parsed.season).toBe('all_season')
      expect(parsed.sunlight).toBe('full_sun')
      expect(parsed.is_perishable).toBe(false)
    })
  })

  describe('Inventory Availability & Out-of-Stock Calculations', () => {
    it('marks variant as in_stock when available quantity exceeds threshold', () => {
      const availability = computeVariantAvailability({
        manageInventory: true,
        allowBackorder: false,
        stockedQuantity: 150,
        reservedQuantity: 10,
      })
      expect(availability.isAvailable).toBe(true)
      expect(availability.status).toBe('in_stock')
      expect(availability.availableQuantity).toBe(140)
    })

    it('marks variant as low_stock when available quantity is 10 or fewer', () => {
      const availability = computeVariantAvailability({
        manageInventory: true,
        allowBackorder: false,
        stockedQuantity: 8,
        reservedQuantity: 0,
      })
      expect(availability.isAvailable).toBe(true)
      expect(availability.status).toBe('low_stock')
      expect(availability.availableQuantity).toBe(8)
    })

    it('marks variant as out_of_stock when available quantity is 0 and backorder is false', () => {
      const availability = computeVariantAvailability({
        manageInventory: true,
        allowBackorder: false,
        stockedQuantity: 0,
        reservedQuantity: 0,
      })
      expect(availability.isAvailable).toBe(false)
      expect(availability.status).toBe('out_of_stock')
      expect(availability.availableQuantity).toBe(0)
    })

    it('marks variant as available with low_stock status when backorder is allowed', () => {
      const availability = computeVariantAvailability({
        manageInventory: true,
        allowBackorder: true,
        stockedQuantity: 0,
        reservedQuantity: 0,
      })
      expect(availability.isAvailable).toBe(true)
      expect(availability.allowBackorder).toBe(true)
      expect(availability.status).toBe('low_stock')
    })

    it('marks variant as untracked when manage_inventory is false', () => {
      const availability = computeVariantAvailability({
        manageInventory: false,
      })
      expect(availability.isAvailable).toBe(true)
      expect(availability.status).toBe('untracked')
      expect(availability.manageInventory).toBe(false)
    })
  })

  describe('getVariantStockAvailability from Store API variant payload', () => {
    it('calculates availability from nested location_levels in inventory_items', () => {
      const variant: StoreCatalogVariant = {
        id: 'var_123',
        title: '20 Seeds',
        sku: 'GLR-SD-TOM-020',
        manage_inventory: true,
        allow_backorder: false,
        inventory_items: [
          {
            inventory: {
              location_levels: [
                {
                  stocked_quantity: 150,
                  reserved_quantity: 10,
                },
              ],
            },
          },
        ],
      }

      const result = getVariantStockAvailability(variant)
      expect(result.isAvailable).toBe(true)
      expect(result.status).toBe('in_stock')
      expect(result.availableQuantity).toBe(140)
    })

    it('identifies out-of-stock variant when location level stock is 0', () => {
      const variant: StoreCatalogVariant = {
        id: 'var_456',
        title: '100 Seeds',
        sku: 'GLR-SD-TOM-100',
        manage_inventory: true,
        allow_backorder: false,
        inventory_items: [
          {
            inventory: {
              location_levels: [
                {
                  stocked_quantity: 0,
                  reserved_quantity: 0,
                },
              ],
            },
          },
        ],
      }

      const result = getVariantStockAvailability(variant)
      expect(result.isAvailable).toBe(false)
      expect(result.status).toBe('out_of_stock')
      expect(result.availableQuantity).toBe(0)
    })

    it('falls back to direct variant.inventory_quantity when location levels are not present', () => {
      const variant: StoreCatalogVariant = {
        id: 'var_789',
        title: '50 Seeds',
        sku: 'GLR-SD-TOM-050',
        manage_inventory: true,
        allow_backorder: false,
        inventory_quantity: 25,
      }

      const result = getVariantStockAvailability(variant)
      expect(result.isAvailable).toBe(true)
      expect(result.status).toBe('in_stock')
      expect(result.availableQuantity).toBe(25)
    })

    it('accurately aggregates stock across multiple inventory items and locations', () => {
      const variant: StoreCatalogVariant = {
        id: 'var_combo',
        title: 'Combo Pack',
        sku: 'GLR-SD-COMBO',
        manage_inventory: true,
        allow_backorder: false,
        inventory_items: [
          {
            inventory: {
              location_levels: [
                { stocked_quantity: 40, reserved_quantity: 5 },
                { stocked_quantity: 20, reserved_quantity: 0 },
              ],
            },
          },
        ],
      }

      const result = getVariantStockAvailability(variant)
      expect(result.isAvailable).toBe(true)
      expect(result.stockedQuantity).toBe(60)
      expect(result.reservedQuantity).toBe(5)
      expect(result.availableQuantity).toBe(55)
    })
  })

  describe('getVariantPriceINR', () => {
    it('formats INR price correctly from paise', () => {
      const variant: StoreCatalogVariant = {
        id: 'var_1',
        title: '20 Seeds',
        sku: 'GLR-SD-TOM-020',
        manage_inventory: true,
        allow_backorder: false,
        prices: [{ id: 'p_1', currency_code: 'inr', amount: 4900 }],
      }
      expect(getVariantPriceINR(variant)).toContain('49')
    })

    it('returns Price on request when INR price is missing', () => {
      const variant: StoreCatalogVariant = {
        id: 'var_2',
        title: '20 Seeds',
        sku: 'GLR-SD-TOM-020',
        manage_inventory: true,
        allow_backorder: false,
        prices: [{ id: 'p_2', currency_code: 'usd', amount: 500 }],
      }
      expect(getVariantPriceINR(variant)).toBe('Price on request')
    })
  })

  describe('STORE_CATALOG_DEFAULT_FIELDS', () => {
    it('includes required Store API fields for variants, pricing, inventory, categories, and metadata', () => {
      expect(STORE_CATALOG_DEFAULT_FIELDS).toContain('*variants')
      expect(STORE_CATALOG_DEFAULT_FIELDS).toContain('*variants.prices')
      expect(STORE_CATALOG_DEFAULT_FIELDS).toContain('+variants.inventory_quantity')
      expect(STORE_CATALOG_DEFAULT_FIELDS).toContain('*variants.inventory_items')
      expect(STORE_CATALOG_DEFAULT_FIELDS).toContain('+metadata')
      expect(STORE_CATALOG_DEFAULT_FIELDS).toContain('*categories')
    })
  })

  describe('Category Hierarchy Helpers', () => {
    const mockCategories = [
      {
        id: 'cat_seeds',
        name: 'Seeds',
        handle: 'seeds',
        category_children: [
          {
            id: 'cat_veg',
            name: 'Vegetable Seeds',
            handle: 'vegetable-seeds',
            category_children: [],
          },
          {
            id: 'cat_flower',
            name: 'Flower Seeds',
            handle: 'flower-seeds',
            category_children: [
              {
                id: 'cat_marigold',
                name: 'Marigold Varieties',
                handle: 'marigold-varieties',
              },
            ],
          },
        ],
      },
      {
        id: 'cat_plants',
        name: 'Live Plants',
        handle: 'live-plants',
        category_children: [],
      },
    ]

    it('flattenCategories flattens hierarchical tree into a single array', () => {
      const flattened = flattenCategories(mockCategories)
      expect(flattened).toHaveLength(5)
      const handles = flattened.map((c) => c.handle)
      expect(handles).toEqual([
        'seeds',
        'vegetable-seeds',
        'flower-seeds',
        'marigold-varieties',
        'live-plants',
      ])
    })

    it('flattenCategories deduplicates categories if child also appears in the root list', () => {
      const categoriesWithDups = [
        ...mockCategories,
        {
          id: 'cat_veg',
          name: 'Vegetable Seeds',
          handle: 'vegetable-seeds',
          category_children: [],
        },
      ]
      const flattened = flattenCategories(categoriesWithDups)
      expect(flattened).toHaveLength(5)
    })

    it('findCategoryByHandle finds root category correctly', () => {
      const cat = findCategoryByHandle(mockCategories, 'seeds')
      expect(cat).toBeDefined()
      expect(cat?.id).toBe('cat_seeds')
    })

    it('findCategoryByHandle finds deeply nested category correctly', () => {
      const cat = findCategoryByHandle(mockCategories, 'marigold-varieties')
      expect(cat).toBeDefined()
      expect(cat?.id).toBe('cat_marigold')
    })

    it('findCategoryByHandle returns undefined when handle does not exist', () => {
      const cat = findCategoryByHandle(mockCategories, 'non-existent-handle')
      expect(cat).toBeUndefined()
    })

    it('getCategoryHierarchyIds collects parent and all descendant IDs', () => {
      const seedsCat = mockCategories[0]
      const ids = getCategoryHierarchyIds(seedsCat)
      expect(ids).toEqual(['cat_seeds', 'cat_veg', 'cat_flower', 'cat_marigold'])
    })

    it('getCategoryHierarchyIds returns only own ID if category has no children', () => {
      const plantsCat = mockCategories[1]
      const ids = getCategoryHierarchyIds(plantsCat)
      expect(ids).toEqual(['cat_plants'])
    })
  })

  describe('getProductLowestPriceINR', () => {
    it('returns formatted From ₹X when variants have differing prices', () => {
      const product = {
        id: 'prod_1',
        title: 'Desi Tomato Seeds',
        handle: 'desi-tomato-seeds',
        description: 'Heirloom seeds',
        status: 'published' as const,
        thumbnail: null,
        variants: [
          {
            id: 'var_1',
            title: '20 Seeds',
            sku: 'GLR-SD-TOM-020',
            manage_inventory: true,
            allow_backorder: false,
            prices: [{ id: 'p_1', currency_code: 'inr', amount: 4900 }],
          },
          {
            id: 'var_2',
            title: '50 Seeds',
            sku: 'GLR-SD-TOM-050',
            manage_inventory: true,
            allow_backorder: false,
            prices: [{ id: 'p_2', currency_code: 'inr', amount: 9900 }],
          },
        ],
      }

      const priceInfo = getProductLowestPriceINR(product)
      expect(priceInfo.minPricePaise).toBe(4900)
      expect(priceInfo.hasMultiplePrices).toBe(true)
      expect(priceInfo.formatted).toContain('From')
      expect(priceInfo.formatted).toContain('49')
    })

    it('returns exact price without From when all variants have identical price', () => {
      const product = {
        id: 'prod_2',
        title: 'Single Price Item',
        handle: 'single-price',
        description: '',
        status: 'published' as const,
        thumbnail: null,
        variants: [
          {
            id: 'var_1',
            title: 'Standard',
            sku: 'GLR-STD',
            manage_inventory: true,
            allow_backorder: false,
            prices: [{ id: 'p_1', currency_code: 'inr', amount: 19900 }],
          },
        ],
      }

      const priceInfo = getProductLowestPriceINR(product)
      expect(priceInfo.minPricePaise).toBe(19900)
      expect(priceInfo.hasMultiplePrices).toBe(false)
      expect(priceInfo.formatted).not.toContain('From')
      expect(priceInfo.formatted).toContain('199')
    })

    it('returns Price on request when product has no INR prices', () => {
      const product = {
        id: 'prod_3',
        title: 'No Price Item',
        handle: 'no-price',
        description: '',
        status: 'published' as const,
        thumbnail: null,
        variants: [],
      }

      const priceInfo = getProductLowestPriceINR(product)
      expect(priceInfo.minPricePaise).toBeNull()
      expect(priceInfo.formatted).toBe('Price on request')
    })
  })

  describe('getProductStockSummary', () => {
    it('returns in_stock when at least one variant has stock', () => {
      const product = {
        id: 'prod_1',
        title: 'Tomato Seeds',
        handle: 'tomato',
        description: '',
        status: 'published' as const,
        thumbnail: null,
        variants: [
          {
            id: 'v_1',
            title: '20 Seeds',
            sku: 'TOM-20',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 50,
          },
          {
            id: 'v_2',
            title: '100 Seeds',
            sku: 'TOM-100',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 0,
          },
        ],
      }

      const summary = getProductStockSummary(product)
      expect(summary.hasStock).toBe(true)
      expect(summary.status).toBe('in_stock')
      expect(summary.totalStock).toBe(50)
    })

    it('returns out_of_stock when all variants have 0 stock', () => {
      const product = {
        id: 'prod_2',
        title: 'Sold Out Item',
        handle: 'sold-out',
        description: '',
        status: 'published' as const,
        thumbnail: null,
        variants: [
          {
            id: 'v_1',
            title: 'Variant 1',
            sku: 'SO-1',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 0,
          },
        ],
      }

      const summary = getProductStockSummary(product)
      expect(summary.hasStock).toBe(false)
      expect(summary.status).toBe('out_of_stock')
    })

    it('returns low_stock when total stock is between 1 and 10', () => {
      const product = {
        id: 'prod_3',
        title: 'Low Stock Item',
        handle: 'low-stock',
        description: '',
        status: 'published' as const,
        thumbnail: null,
        variants: [
          {
            id: 'v_1',
            title: 'Variant 1',
            sku: 'LS-1',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 5,
          },
        ],
      }

      const summary = getProductStockSummary(product)
      expect(summary.hasStock).toBe(true)
      expect(summary.status).toBe('low_stock')
      expect(summary.totalStock).toBe(5)
    })
  })
})

