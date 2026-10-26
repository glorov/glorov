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
  calculateRelevanceScore,
  filterCatalogProducts,
  sortCatalogProducts,
  extractCatalogFacets,
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

  describe('Product Search, Filtering, and Sorting Helpers', () => {
    const mockCatalogProducts = [
      {
        id: 'prod_tomato',
        title: 'Tomato Seeds (Desi / Pusa Ruby)',
        handle: 'tomato-seeds-desi',
        description: 'Heirloom Indian tomato with balanced acidity and high yield.',
        status: 'published' as const,
        thumbnail: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
        created_at: '2026-01-10T10:00:00.000Z',
        categories: [
          { id: 'cat_veg', name: 'Vegetable Seeds', handle: 'vegetable-seeds' },
        ],
        metadata: {
          common_name: 'Desi Tomato / Tamatar',
          botanical_name: 'Solanum lycopersicum',
          seed_type: 'Heirloom / Open-Pollinated',
          variety: 'Pusa Ruby',
          season: 'kharif' as const,
          sunlight: 'full_sun' as const,
        },
        variants: [
          {
            id: 'v_tom_20',
            title: '20 Seeds',
            sku: 'GLR-SD-TOM-020',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 150,
            prices: [{ id: 'p_1', currency_code: 'inr', amount: 4900 }], // ₹49
          },
          {
            id: 'v_tom_100',
            title: '100 Seeds',
            sku: 'GLR-SD-TOM-100',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 0,
            prices: [{ id: 'p_2', currency_code: 'inr', amount: 17900 }], // ₹179
          },
        ],
      },
      {
        id: 'prod_marigold',
        title: 'Marigold Seeds (Pusa Narangi Gainda)',
        handle: 'marigold-seeds-pusa-narangi',
        description: 'Vibrant orange marigold flowers for garlands and festive pest deterrence.',
        status: 'published' as const,
        thumbnail: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651',
        created_at: '2026-01-20T10:00:00.000Z',
        categories: [
          { id: 'cat_flower', name: 'Flower Seeds', handle: 'flower-seeds' },
        ],
        metadata: {
          common_name: 'Marigold / Gainda',
          botanical_name: 'Tagetes erecta',
          seed_type: 'Open-Pollinated',
          variety: 'Pusa Narangi',
          season: 'all_season' as const,
        },
        variants: [
          {
            id: 'v_mari_50',
            title: '50 Seeds',
            sku: 'GLR-SD-MAR-050',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 80,
            prices: [{ id: 'p_3', currency_code: 'inr', amount: 3900 }], // ₹39
          },
        ],
      },
      {
        id: 'prod_tulsi',
        title: 'Krishna Tulsi Seeds (Holy Basil)',
        handle: 'krishna-tulsi-seeds',
        description: 'Sacred purple-tinged Krishna Tulsi revered in Indian Ayurveda.',
        status: 'published' as const,
        thumbnail: null,
        created_at: '2026-02-01T10:00:00.000Z',
        categories: [
          { id: 'cat_herb', name: 'Herb Seeds', handle: 'herb-seeds' },
        ],
        metadata: {
          common_name: 'Krishna Tulsi / Holy Basil',
          botanical_name: 'Ocimum tenuiflorum',
          seed_type: 'Heirloom',
          variety: 'Shyam / Krishna Tulsi',
          season: 'all_season' as const,
        },
        variants: [
          {
            id: 'v_tul_100',
            title: '100 Seeds',
            sku: 'GLR-SD-TUL-100',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 60,
            prices: [{ id: 'p_4', currency_code: 'inr', amount: 4500 }], // ₹45
          },
        ],
      },
      {
        id: 'prod_snake_plant',
        title: 'Snake Plant Golden Hahnii (Sansevieria)',
        handle: 'snake-plant-golden-hahnii',
        description: 'Air-purifying variegated dwarf snake plant in nursery pot.',
        status: 'published' as const,
        thumbnail: null,
        created_at: '2026-03-01T10:00:00.000Z',
        categories: [
          { id: 'cat_indoor', name: 'Indoor Plants', handle: 'indoor-plants' },
        ],
        metadata: {
          common_name: 'Snake Plant',
          botanical_name: 'Sansevieria trifasciata',
          seed_type: 'Live Botanical Specimen',
          season: 'all_season' as const,
          is_perishable: true,
        },
        variants: [
          {
            id: 'v_sp_4in',
            title: '4-inch Nursery Pot',
            sku: 'GLR-PL-SNK-004',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 25,
            prices: [{ id: 'p_5', currency_code: 'inr', amount: 19900 }], // ₹199
          },
        ],
      },
      {
        id: 'prod_coriander',
        title: 'Coriander Seeds (Pusa Haritima)',
        handle: 'coriander-seeds-rabi',
        description: 'Late-bolting Indian dhaniya seeds with lush aromatic foliage.',
        status: 'published' as const,
        thumbnail: null,
        created_at: '2026-04-01T10:00:00.000Z',
        categories: [
          { id: 'cat_veg', name: 'Vegetable Seeds', handle: 'vegetable-seeds' },
        ],
        metadata: {
          common_name: 'Desi Dhaniya / Coriander',
          botanical_name: 'Coriandrum sativum',
          seed_type: 'Certified Organic',
          variety: 'Pusa Haritima',
          season: 'rabi' as const,
        },
        variants: [
          {
            id: 'v_cor_50',
            title: '50 Seeds',
            sku: 'GLR-SD-COR-050',
            manage_inventory: true,
            allow_backorder: false,
            inventory_quantity: 0, // Out of stock
            prices: [{ id: 'p_6', currency_code: 'inr', amount: 3500 }], // ₹35
          },
        ],
      },
    ]

    describe('calculateRelevanceScore', () => {
      it('awards highest score for exact title match', () => {
        const score = calculateRelevanceScore(mockCatalogProducts[0], 'Tomato Seeds (Desi / Pusa Ruby)')
        expect(score).toBeGreaterThanOrEqual(100)
      })

      it('awards high score for title prefix and variety match', () => {
        const score1 = calculateRelevanceScore(mockCatalogProducts[0], 'Tomato')
        const score2 = calculateRelevanceScore(mockCatalogProducts[0], 'Pusa Ruby')
        expect(score1).toBeGreaterThan(0)
        expect(score2).toBeGreaterThan(0)
      })

      it('matches common Indian vernacular names', () => {
        const score = calculateRelevanceScore(mockCatalogProducts[0], 'Tamatar')
        expect(score).toBeGreaterThan(0)
      })

      it('returns 0 for empty or non-matching query', () => {
        expect(calculateRelevanceScore(mockCatalogProducts[0], '')).toBe(0)
        expect(calculateRelevanceScore(mockCatalogProducts[0], '   ')).toBe(0)
        expect(calculateRelevanceScore(mockCatalogProducts[0], 'Xylophone')).toBe(0)
      })
    })

    describe('filterCatalogProducts', () => {
      it('returns all products when no filters are applied', () => {
        const result = filterCatalogProducts(mockCatalogProducts, {})
        expect(result).toHaveLength(mockCatalogProducts.length)
      })

      it('filters products by free-text search query (q)', () => {
        const result = filterCatalogProducts(mockCatalogProducts, { q: 'tomato' })
        expect(result).toHaveLength(1)
        expect(result[0].id).toBe('prod_tomato')

        const hindiResult = filterCatalogProducts(mockCatalogProducts, { q: 'dhaniya' })
        expect(hindiResult).toHaveLength(1)
        expect(hindiResult[0].id).toBe('prod_coriander')
      })

      it('filters products by category handle', () => {
        const vegResult = filterCatalogProducts(mockCatalogProducts, { category: 'vegetable-seeds' })
        expect(vegResult).toHaveLength(2)
        expect(vegResult.map((p) => p.id)).toEqual(['prod_tomato', 'prod_coriander'])

        const herbResult = filterCatalogProducts(mockCatalogProducts, { category: 'herb-seeds' })
        expect(herbResult).toHaveLength(1)
        expect(herbResult[0].id).toBe('prod_tulsi')
      })

      it('filters products by botanical seed/plant type', () => {
        const heirloomResult = filterCatalogProducts(mockCatalogProducts, { seed_type: 'heirloom' })
        expect(heirloomResult).toHaveLength(2) // Tomato & Tulsi
        expect(heirloomResult.map((p) => p.id)).toContain('prod_tomato')
        expect(heirloomResult.map((p) => p.id)).toContain('prod_tulsi')

        const liveResult = filterCatalogProducts(mockCatalogProducts, { seed_type: 'live' })
        expect(liveResult).toHaveLength(1)
        expect(liveResult[0].id).toBe('prod_snake_plant')
      })

      it('filters products by sowing season', () => {
        // Kharif: matches Kharif products and All Season products
        const kharifResult = filterCatalogProducts(mockCatalogProducts, { season: 'kharif' })
        expect(kharifResult.map((p) => p.id)).toContain('prod_tomato')
        expect(kharifResult.map((p) => p.id)).toContain('prod_marigold') // all_season
        expect(kharifResult.map((p) => p.id)).not.toContain('prod_coriander') // rabi only

        // Rabi: matches Coriander and All Season products
        const rabiResult = filterCatalogProducts(mockCatalogProducts, { season: 'rabi' })
        expect(rabiResult.map((p) => p.id)).toContain('prod_coriander')
        expect(rabiResult.map((p) => p.id)).not.toContain('prod_tomato')
      })

      it('filters products by price range (INR)', () => {
        // Under ₹40: Coriander (₹35) & Marigold (₹39)
        const under40 = filterCatalogProducts(mockCatalogProducts, { max_price: 40 })
        expect(under40.map((p) => p.id)).toEqual(['prod_marigold', 'prod_coriander'])

        // Between ₹40 and ₹50: Tomato (₹49) & Tulsi (₹45)
        const midPrice = filterCatalogProducts(mockCatalogProducts, { min_price: 40, max_price: 50 })
        expect(midPrice.map((p) => p.id)).toEqual(['prod_tomato', 'prod_tulsi'])

        // Above ₹100: Snake Plant (₹199)
        const above100 = filterCatalogProducts(mockCatalogProducts, { min_price: 100 })
        expect(above100.map((p) => p.id)).toEqual(['prod_snake_plant'])
      })

      it('filters products by in-stock availability', () => {
        const inStock = filterCatalogProducts(mockCatalogProducts, { in_stock: true })
        // Coriander has stock 0; all others have stock > 0
        expect(inStock).toHaveLength(4)
        expect(inStock.map((p) => p.id)).not.toContain('prod_coriander')
      })

      it('filters products by packet size / variant title', () => {
        const size20 = filterCatalogProducts(mockCatalogProducts, { packet_size: '20 Seeds' })
        expect(size20).toHaveLength(1)
        expect(size20[0].id).toBe('prod_tomato')

        const potSize = filterCatalogProducts(mockCatalogProducts, { packet_size: '4-inch' })
        expect(potSize).toHaveLength(1)
        expect(potSize[0].id).toBe('prod_snake_plant')
      })

      it('combines multiple filters correctly', () => {
        // Vegetable seeds + in stock + under ₹100
        const combined = filterCatalogProducts(mockCatalogProducts, {
          category: 'vegetable-seeds',
          in_stock: true,
          max_price: 100,
        })
        expect(combined).toHaveLength(1)
        expect(combined[0].id).toBe('prod_tomato')
      })

      it('returns empty array when filter criteria match nothing without crashing', () => {
        const result = filterCatalogProducts(mockCatalogProducts, {
          q: 'nonexistent-variety-xyz',
          min_price: 1000,
        })
        expect(result).toEqual([])
      })
    })

    describe('sortCatalogProducts', () => {
      it('sorts by price: low to high (price_asc)', () => {
        const sorted = sortCatalogProducts(mockCatalogProducts, 'price_asc')
        // ₹35 (Coriander), ₹39 (Marigold), ₹45 (Tulsi), ₹49 (Tomato), ₹199 (Snake Plant)
        const titles = sorted.map((p) => p.title)
        expect(titles[0]).toContain('Coriander')
        expect(titles[1]).toContain('Marigold')
        expect(titles[4]).toContain('Snake Plant')
      })

      it('sorts by price: high to low (price_desc)', () => {
        const sorted = sortCatalogProducts(mockCatalogProducts, 'price_desc')
        const titles = sorted.map((p) => p.title)
        expect(titles[0]).toContain('Snake Plant') // ₹199
        expect(titles[titles.length - 1]).toContain('Coriander') // ₹35
      })

      it('sorts by newest arrivals (newest)', () => {
        const sorted = sortCatalogProducts(mockCatalogProducts, 'newest')
        expect(sorted[0].id).toBe('prod_coriander') // 2026-04-01
        expect(sorted[1].id).toBe('prod_snake_plant') // 2026-03-01
        expect(sorted[sorted.length - 1].id).toBe('prod_tomato') // 2026-01-10
      })

      it('sorts alphabetically (title_asc and title_desc)', () => {
        const asc = sortCatalogProducts(mockCatalogProducts, 'title_asc')
        expect(asc[0].title).toBe('Coriander Seeds (Pusa Haritima)')

        const desc = sortCatalogProducts(mockCatalogProducts, 'title_desc')
        expect(desc[0].title).toBe('Tomato Seeds (Desi / Pusa Ruby)')
      })

      it('sorts by relevance when searching (relevance)', () => {
        const sorted = sortCatalogProducts(mockCatalogProducts, 'relevance', 'tulsi')
        expect(sorted[0].id).toBe('prod_tulsi')
      })
    })

    describe('extractCatalogFacets', () => {
      it('dynamically computes facet counts from catalog products', () => {
        const facets = extractCatalogFacets(mockCatalogProducts)

        expect(facets.totalCount).toBe(5)
        expect(facets.inStockCount).toBe(4)
        expect(facets.outOfStockCount).toBe(1)

        expect(facets.priceRange.minRupees).toBe(35)
        expect(facets.priceRange.maxRupees).toBe(199)

        const categoryHandles = facets.categories.map((c) => c.value)
        expect(categoryHandles).toContain('vegetable-seeds')
        expect(categoryHandles).toContain('flower-seeds')
        expect(categoryHandles).toContain('herb-seeds')

        const seedTypes = facets.seedTypes.map((s) => s.value)
        expect(seedTypes).toContain('Heirloom / Open-Pollinated')
        expect(seedTypes).toContain('Live Botanical Specimen')
      })
    })
  })
})

