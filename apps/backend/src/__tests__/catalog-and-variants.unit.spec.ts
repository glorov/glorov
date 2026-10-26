import {
  computeVariantAvailability,
  parseSeedMetadata,
  seedMetadataSchema,
  seedVariantMetadataSchema,
} from "@glorov/types";

describe("Product Catalog & Packet Size Variants Foundation", () => {
  describe("Tomato Seeds Product & Packet-Size Variant Modeling", () => {
    const tomatoProduct = {
      title: "Tomato Seeds (Desi / Pusa Ruby)",
      handle: "tomato-seeds-desi",
      description: "High-viability heirloom Desi Tomato seeds suited for Indian climatic conditions.",
      status: "published",
      optionTitle: "Packet Size",
      optionValues: ["20 Seeds", "50 Seeds", "100 Seeds"],
      variants: [
        {
          title: "20 Seeds",
          sku: "GLR-SD-TOM-020",
          priceINR: 4900, // ₹49
          stockQuantity: 150,
          manageInventory: true,
          allowBackorder: false,
        },
        {
          title: "50 Seeds",
          sku: "GLR-SD-TOM-050",
          priceINR: 9900, // ₹99
          stockQuantity: 80,
          manageInventory: true,
          allowBackorder: false,
        },
        {
          title: "100 Seeds",
          sku: "GLR-SD-TOM-100",
          priceINR: 17900, // ₹179
          stockQuantity: 0, // Out of stock
          manageInventory: true,
          allowBackorder: false,
        },
      ],
      metadata: {
        common_name: "Desi Tomato / Tamatar",
        botanical_name: "Solanum lycopersicum",
        seed_type: "Heirloom / Open-Pollinated",
        variety: "Pusa Ruby",
        approx_seeds_per_packet: 50,
        germination_time_range: "6-10 days",
        sowing_depth: "0.5 cm",
        spacing: "45-60 cm plant-to-plant",
        sunlight: "full_sun",
        watering: "daily",
        season: "kharif",
        difficulty: "beginner",
        planting_instructions: "Sow in seed trays 0.5 cm deep. Transplant at 4-6 leaves.",
        packaging_notes: "Moisture-resistant foil pouch.",
        is_perishable: false,
      },
    };

    it("supports packet size variants under a single product rather than multiple products", () => {
      expect(tomatoProduct.optionTitle).toBe("Packet Size");
      expect(tomatoProduct.optionValues).toHaveLength(3);
      expect(tomatoProduct.optionValues).toContain("20 Seeds");
      expect(tomatoProduct.optionValues).toContain("50 Seeds");
      expect(tomatoProduct.optionValues).toContain("100 Seeds");
      expect(tomatoProduct.variants).toHaveLength(3);
    });

    it("enforces distinct SKU and pricing for each variant", () => {
      const skus = tomatoProduct.variants.map((v) => v.sku);
      const uniqueSkus = new Set(skus);
      expect(uniqueSkus.size).toBe(tomatoProduct.variants.length);

      const prices = tomatoProduct.variants.map((v) => v.priceINR);
      const uniquePrices = new Set(prices);
      expect(uniquePrices.size).toBe(tomatoProduct.variants.length);

      // Verify variant-specific prices in paise
      expect(tomatoProduct.variants[0].priceINR).toBe(4900); // ₹49
      expect(tomatoProduct.variants[1].priceINR).toBe(9900); // ₹99
      expect(tomatoProduct.variants[2].priceINR).toBe(17900); // ₹179
    });

    it("verifies inventory controls: manage_inventory is enabled and allow_backorder is disabled", () => {
      for (const variant of tomatoProduct.variants) {
        expect(variant.manageInventory).toBe(true);
        expect(variant.allowBackorder).toBe(false);
      }
    });

    it("determines available-to-sell quantity and accurately flags out-of-stock variants", () => {
      // Variant 1: 20 seeds (150 in stock)
      const var1 = computeVariantAvailability({
        manageInventory: tomatoProduct.variants[0].manageInventory,
        allowBackorder: tomatoProduct.variants[0].allowBackorder,
        stockedQuantity: tomatoProduct.variants[0].stockQuantity,
        reservedQuantity: 0,
      });
      expect(var1.isAvailable).toBe(true);
      expect(var1.status).toBe("in_stock");
      expect(var1.availableQuantity).toBe(150);

      // Variant 2: 50 seeds (80 in stock, 5 reserved)
      const var2 = computeVariantAvailability({
        manageInventory: tomatoProduct.variants[1].manageInventory,
        allowBackorder: tomatoProduct.variants[1].allowBackorder,
        stockedQuantity: tomatoProduct.variants[1].stockQuantity,
        reservedQuantity: 5,
      });
      expect(var2.isAvailable).toBe(true);
      expect(var2.availableQuantity).toBe(75);

      // Variant 3: 100 seeds (0 in stock) -> Out of stock
      const var3 = computeVariantAvailability({
        manageInventory: tomatoProduct.variants[2].manageInventory,
        allowBackorder: tomatoProduct.variants[2].allowBackorder,
        stockedQuantity: tomatoProduct.variants[2].stockQuantity,
        reservedQuantity: 0,
      });
      expect(var3.isAvailable).toBe(false);
      expect(var3.status).toBe("out_of_stock");
      expect(var3.availableQuantity).toBe(0);
    });

    it("safely handles edge cases in availability calculation (over-reserved and negative values)", () => {
      // Over-reserved: stocked 5, reserved 10 -> available must clamp to 0, not -5
      const overReserved = computeVariantAvailability({
        manageInventory: true,
        allowBackorder: false,
        stockedQuantity: 5,
        reservedQuantity: 10,
      });
      expect(overReserved.isAvailable).toBe(false);
      expect(overReserved.availableQuantity).toBe(0);

      // Negative stock edge case
      const negativeStock = computeVariantAvailability({
        manageInventory: true,
        allowBackorder: false,
        stockedQuantity: -10,
        reservedQuantity: 0,
      });
      expect(negativeStock.isAvailable).toBe(false);
      expect(negativeStock.availableQuantity).toBe(0);

      // Unmanaged inventory (e.g. digital seed guide or custom pre-orders)
      const unmanaged = computeVariantAvailability({
        manageInventory: false,
        stockedQuantity: 0,
      });
      expect(unmanaged.isAvailable).toBe(true);
      expect(unmanaged.status).toBe("untracked");
    });
  });

  describe("Validation of Optional Seed Metadata", () => {
    it("validates full botanical metadata through Zod schema", () => {
      const fullMeta = {
        common_name: "Krishna Tulsi",
        botanical_name: "Ocimum tenuiflorum",
        seed_type: "Heirloom",
        variety: "Shyam Tulsi",
        approx_seeds_per_packet: 100,
        germination_time_range: "7-14 days",
        sowing_depth: "0.3 cm",
        spacing: "25-30 cm",
        sunlight: "full_sun" as const,
        watering: "daily" as const,
        season: "all_season" as const,
        difficulty: "beginner" as const,
        planting_instructions: "Press seeds onto soil surface. Mist lightly daily.",
        packaging_notes: "Foil sachet.",
        is_perishable: false,
      };

      const parsed = seedMetadataSchema.safeParse(fullMeta);
      expect(parsed.success).toBe(true);
    });

    it("accepts metadata with missing/unknown fields without failure", () => {
      const minimalMeta = {
        common_name: "Wildflower Mix",
      };

      const parsed = seedMetadataSchema.safeParse(minimalMeta);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.botanical_name).toBeUndefined();
        expect(parsed.data.germination_time_range).toBeUndefined();
        expect(parsed.data.is_perishable).toBe(false);
      }
    });

    it("accepts explicit null values for optional metadata fields (cleared form fields)", () => {
      const nullMeta = {
        common_name: "Methi Seeds",
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
      };

      const parsed = seedMetadataSchema.safeParse(nullMeta);
      expect(parsed.success).toBe(true);
    });

    it("validates variant packet size metadata with optional and nullish values", () => {
      const validVariantMeta = {
        packet_size_label: "50 Seeds",
        approx_seeds_per_packet: 50,
        weight_grams: 15,
      };
      expect(seedVariantMetadataSchema.safeParse(validVariantMeta).success).toBe(true);

      const nullVariantMeta = {
        packet_size_label: null,
        approx_seeds_per_packet: null,
        weight_grams: null,
      };
      expect(seedVariantMetadataSchema.safeParse(nullVariantMeta).success).toBe(true);

      // Rejects non-positive seeds count
      const invalidSeeds = {
        approx_seeds_per_packet: -10,
      };
      expect(seedVariantMetadataSchema.safeParse(invalidSeeds).success).toBe(false);
    });

    it("correctly identifies live perishable plants vs non-perishable seeds", () => {
      const livePlantMeta = {
        common_name: "Snake Plant",
        botanical_name: "Sansevieria trifasciata",
        is_perishable: true,
      };
      const parsedPlant = seedMetadataSchema.safeParse(livePlantMeta);
      expect(parsedPlant.success).toBe(true);
      if (parsedPlant.success) {
        expect(parsedPlant.data.is_perishable).toBe(true);
      }

      const seedMeta = {
        common_name: "Tomato",
        is_perishable: false,
      };
      const parsedSeed = seedMetadataSchema.safeParse(seedMeta);
      expect(parsedSeed.success).toBe(true);
      if (parsedSeed.success) {
        expect(parsedSeed.data.is_perishable).toBe(false);
      }
    });

    it("parses raw metadata safely and preserves extra custom metadata fields", () => {
      const parsed = parseSeedMetadata({
        common_name: "Marigold",
        sunlight: "full_sun",
        custom_soil_recommendation: "well-drained loam",
      });
      expect(parsed.common_name).toBe("Marigold");
      expect(parsed.sunlight).toBe("full_sun");
      expect(parsed.is_perishable).toBe(false);
      expect(parsed.custom_soil_recommendation).toBe("well-drained loam");
    });
  });
});
