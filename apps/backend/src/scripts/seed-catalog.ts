import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils";
import {
  createCollectionsWorkflow,
  createInventoryItemsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";

interface SeedProductVariantInput {
  title: string;
  sku: string;
  priceINR: number; // in paise (e.g. 4900 = ₹49)
  stockQuantity: number;
  optionValue: string;
  metadata?: Record<string, unknown>;
}

interface SeedProductInput {
  title: string;
  handle: string;
  description: string;
  categoryHandle: string;
  collectionHandle: string;
  optionTitle: string;
  optionValues: string[];
  thumbnail: string;
  images: string[];
  metadata: Record<string, unknown>;
  variants: SeedProductVariantInput[];
}

export default async function seedCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("🌿 Seeding GLOROV Botanical Product Catalog & Inventory...");

  // 1. Resolve Default Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel = salesChannels.find(
    (sc) => sc.name === "Default Sales Channel" || sc.name === "GLOROV Web Store"
  ) || salesChannels[0];

  if (!salesChannel) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No sales channel found. Please run seed-india-region first."
    );
  }
  logger.info(`Using sales channel: ${salesChannel.name} (${salesChannel.id})`);

  // 2. Resolve Stock Location (Pune Central Nursery Hub)
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const puneLocation = stockLocations.find((sl) => sl.name.includes("Pune")) || stockLocations[0];

  if (!puneLocation) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      "No stock location found. Please run seed-india-region first."
    );
  }
  logger.info(`Using stock location: ${puneLocation.name} (${puneLocation.id})`);

  // Ensure stock location is linked to sales channel
  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: puneLocation.id,
        add: [salesChannel.id],
      },
    });
    logger.info("Verified stock location link to sales channel.");
  } catch {
    // Already linked
  }

  // 3. Seed Collections
  const targetCollections = [
    {
      title: "Kitchen Garden Essentials",
      handle: "kitchen-garden-essentials",
    },
    {
      title: "Monsoon Sowing Specials",
      handle: "monsoon-sowing-specials",
    },
    {
      title: "Air Purifying Plants",
      handle: "air-purifying-plants",
    },
  ];

  const { data: existingCollections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "handle"],
  });

  const collectionMap: Record<string, string> = {};
  for (const tc of targetCollections) {
    const existing = existingCollections.find((c) => c.handle === tc.handle);
    if (existing) {
      collectionMap[tc.handle] = existing.id;
    } else {
      const {
        result: [newColl],
      } = await createCollectionsWorkflow(container).run({
        input: {
          collections: [tc],
        },
      });
      collectionMap[tc.handle] = newColl.id;
      logger.info(`Created collection: ${tc.title} (${newColl.id})`);
    }
  }

  // 4. Seed Product Categories
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle", "parent_category_id"],
  });

  const categoryMap: Record<string, string> = {};
  for (const cat of existingCategories) {
    categoryMap[cat.handle] = cat.id;
  }

  // Root categories
  const rootCategories = [
    { name: "Seeds", handle: "seeds", description: "High-germination vegetable, flower, and herb seeds", is_active: true },
    { name: "Live Plants", handle: "live-plants", description: "Potted indoor, air-purifying, and ornamental live plants", is_active: true },
    { name: "Planters & Pots", handle: "planters-pots", description: "Eco-friendly, ceramic, and nursery planters", is_active: true },
  ];

  const { updateProductCategoriesWorkflow } = await import("@medusajs/medusa/core-flows");

  for (const root of rootCategories) {
    if (!categoryMap[root.handle]) {
      const {
        result: [newCat],
      } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [root],
        },
      });
      categoryMap[root.handle] = newCat.id;
      logger.info(`Created root category: ${root.name} (${newCat.id})`);
    } else {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: categoryMap[root.handle] },
          update: { is_active: true },
        },
      });
    }
  }

  // Subcategories
  const subCategories = [
    { name: "Vegetable Seeds", handle: "vegetable-seeds", parent_category_id: categoryMap["seeds"], is_active: true },
    { name: "Flower Seeds", handle: "flower-seeds", parent_category_id: categoryMap["seeds"], is_active: true },
    { name: "Herb Seeds", handle: "herb-seeds", parent_category_id: categoryMap["seeds"], is_active: true },
    { name: "Indoor Plants", handle: "indoor-plants", parent_category_id: categoryMap["live-plants"], is_active: true },
  ];

  for (const sub of subCategories) {
    if (!categoryMap[sub.handle]) {
      const {
        result: [newSub],
      } = await createProductCategoriesWorkflow(container).run({
        input: {
          product_categories: [sub],
        },
      });
      categoryMap[sub.handle] = newSub.id;
      logger.info(`Created subcategory: ${sub.name} (${newSub.id})`);
    } else {
      await updateProductCategoriesWorkflow(container).run({
        input: {
          selector: { id: categoryMap[sub.handle] },
          update: { is_active: true },
        },
      });
    }
  }

  // 5. Products Definition with packet-size variants and Indian botanical metadata
  const productsToSeed: SeedProductInput[] = [
    {
      title: "Tomato Seeds (Desi / Pusa Ruby)",
      handle: "tomato-seeds-desi",
      description:
        "High-viability heirloom Desi Tomato seeds suited for Indian climatic conditions. Produces high-yielding plants with juicy, aromatic, and tangy fruits rich in Lycopene and Vitamin C.",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "kitchen-garden-essentials",
      optionTitle: "Packet Size",
      optionValues: ["20 Seeds", "50 Seeds", "100 Seeds"],
      thumbnail: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=1200&q=80",
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
        planting_instructions:
          "Sow seeds 0.5 cm deep in seedling trays or loose, well-draining organic soil mix. Water gently with a fine spray to keep soil moist until germination. Transplant seedlings to garden beds or 12-inch pots when they develop 4-6 true leaves.",
        packaging_notes:
          "Sealed in moisture-barrier aluminum foil pouches with food-grade desiccant to ensure maximum viability up to 18 months.",
        is_perishable: false,
      },
      variants: [
        {
          title: "20 Seeds",
          sku: "GLR-SD-TOM-020",
          priceINR: 4900, // ₹49
          stockQuantity: 150,
          optionValue: "20 Seeds",
          metadata: {
            packet_size_label: "20 Seeds",
            approx_seeds_per_packet: 20,
            weight_grams: 10,
          },
        },
        {
          title: "50 Seeds",
          sku: "GLR-SD-TOM-050",
          priceINR: 9900, // ₹99
          stockQuantity: 80,
          optionValue: "50 Seeds",
          metadata: {
            packet_size_label: "50 Seeds",
            approx_seeds_per_packet: 50,
            weight_grams: 20,
          },
        },
        {
          title: "100 Seeds",
          sku: "GLR-SD-TOM-100",
          priceINR: 17900, // ₹179
          stockQuantity: 0, // Out of stock to demonstrate stock tracking & overselling prevention
          optionValue: "100 Seeds",
          metadata: {
            packet_size_label: "100 Seeds",
            approx_seeds_per_packet: 100,
            weight_grams: 35,
          },
        },
      ],
    },
    {
      title: "Marigold Seeds (Pusa Narangi Gainda)",
      handle: "marigold-seeds-pusa-narangi",
      description:
        "Vibrant deep orange marigold flowers ideal for festive celebrations, garlands, and natural garden pest deterrents. Attracts beneficial pollinators like bees and butterflies.",
      categoryHandle: "flower-seeds",
      collectionHandle: "monsoon-sowing-specials",
      optionTitle: "Packet Size",
      optionValues: ["50 Seeds", "100 Seeds"],
      thumbnail: "https://images.unsplash.com/photo-1508784411316-02b8cd4d4a3a?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1508784411316-02b8cd4d4a3a?auto=format&fit=crop&w=1200&q=80",
      ],
      metadata: {
        common_name: "Marigold / Gainda",
        botanical_name: "Tagetes erecta",
        seed_type: "Open-Pollinated",
        variety: "Pusa Narangi",
        approx_seeds_per_packet: 50,
        germination_time_range: "5-8 days",
        sowing_depth: "0.5 cm",
        spacing: "30-40 cm",
        sunlight: "full_sun",
        watering: "alternate_days",
        season: "all_season",
        difficulty: "beginner",
        planting_instructions:
          "Scatter seeds lightly over compost-rich soil and cover with a thin 0.5 cm layer. Germinates readily in warm weather. Water regularly without waterlogging.",
        packaging_notes: "Sealed in protective kraft pouches.",
        is_perishable: false,
      },
      variants: [
        {
          title: "50 Seeds",
          sku: "GLR-SD-MAR-050",
          priceINR: 3900, // ₹39
          stockQuantity: 200,
          optionValue: "50 Seeds",
          metadata: {
            packet_size_label: "50 Seeds",
            approx_seeds_per_packet: 50,
            weight_grams: 15,
          },
        },
        {
          title: "100 Seeds",
          sku: "GLR-SD-MAR-100",
          priceINR: 6900, // ₹69
          stockQuantity: 120,
          optionValue: "100 Seeds",
          metadata: {
            packet_size_label: "100 Seeds",
            approx_seeds_per_packet: 100,
            weight_grams: 28,
          },
        },
      ],
    },
    {
      title: "Krishna Tulsi Seeds (Holy Basil)",
      handle: "krishna-tulsi-seeds",
      description:
        "Sacred purple-green foliage Tulsi renowned in Ayurveda for its adaptogenic, respiratory, and antioxidant properties. Highly fragrant with peppery-sweet notes.",
      categoryHandle: "herb-seeds",
      collectionHandle: "kitchen-garden-essentials",
      optionTitle: "Packet Size",
      optionValues: ["100 Seeds", "250 Seeds"],
      thumbnail: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80",
      ],
      metadata: {
        common_name: "Krishna Tulsi / Holy Basil",
        botanical_name: "Ocimum tenuiflorum",
        seed_type: "Heirloom",
        variety: "Shyam / Krishna Tulsi",
        approx_seeds_per_packet: 100,
        germination_time_range: "7-14 days",
        sowing_depth: "0.3 cm",
        spacing: "25-30 cm",
        sunlight: "full_sun",
        watering: "daily",
        season: "all_season",
        difficulty: "beginner",
        planting_instructions:
          "Press seeds gently into fine organic soil surface; Tulsi seeds require light to germinate. Mist lightly daily until sprouts emerge.",
        packaging_notes: "Airtight moisture-shielded foil sachet.",
        is_perishable: false,
      },
      variants: [
        {
          title: "100 Seeds",
          sku: "GLR-SD-TLS-100",
          priceINR: 4500, // ₹45
          stockQuantity: 100,
          optionValue: "100 Seeds",
          metadata: {
            packet_size_label: "100 Seeds",
            approx_seeds_per_packet: 100,
            weight_grams: 10,
          },
        },
        {
          title: "250 Seeds",
          sku: "GLR-SD-TLS-250",
          priceINR: 8900, // ₹89
          stockQuantity: 75,
          optionValue: "250 Seeds",
          metadata: {
            packet_size_label: "250 Seeds",
            approx_seeds_per_packet: 250,
            weight_grams: 22,
          },
        },
      ],
    },
    {
      title: "Snake Plant Golden Hahnii (Sansevieria)",
      handle: "snake-plant-golden-hahnii",
      description:
        "Compact rosette bird's nest snake plant with striking golden-yellow variegated borders. Exceptional NASA-certified air purifying indoor succulent that filters benzene and formaldehyde.",
      categoryHandle: "indoor-plants",
      collectionHandle: "air-purifying-plants",
      optionTitle: "Pot Option",
      optionValues: ["4-inch Nursery Pot", "6-inch Ceramic Pot"],
      thumbnail: "https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=600&q=80",
      images: [
        "https://images.unsplash.com/photo-1599685315640-9ceab2f58944?auto=format&fit=crop&w=1200&q=80",
      ],
      metadata: {
        common_name: "Snake Plant Golden Hahnii / Mother-in-law's Tongue",
        botanical_name: "Sansevieria trifasciata 'Golden Hahnii'",
        seed_type: "Live Botanical Specimen",
        variety: "Golden Hahnii Dwarf",
        sunlight: "low_light",
        watering: "weekly",
        season: "all_season",
        difficulty: "beginner",
        planting_instructions:
          "Place in bright indirect light or low-light corners. Water only when the top 2 inches of soil are completely dry. Drought-hardy and low maintenance.",
        packaging_notes:
          "Packed in custom ventilated corrugated boxes with coco-peat moisture root wrap for live transit safety.",
        is_perishable: true,
      },
      variants: [
        {
          title: "4-inch Nursery Pot",
          sku: "GLR-PL-SNK-004-NUR",
          priceINR: 19900, // ₹199
          stockQuantity: 40,
          optionValue: "4-inch Nursery Pot",
          metadata: {
            packet_size_label: "4-inch Nursery Pot",
            weight_grams: 450,
          },
        },
        {
          title: "6-inch Ceramic Pot",
          sku: "GLR-PL-SNK-006-CER",
          priceINR: 44900, // ₹449
          stockQuantity: 25,
          optionValue: "6-inch Ceramic Pot",
          metadata: {
            packet_size_label: "6-inch Ceramic Pot",
            weight_grams: 1100,
          },
        },
      ],
    },
  ];

  // 6. Seed each product with variants and inventory
  for (const prodInput of productsToSeed) {
    logger.info(`Processing product: "${prodInput.title}" (${prodInput.handle})...`);

    // Check if product with this handle already exists
    const { data: existingProds } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: prodInput.handle },
    });

    if (existingProds.length > 0) {
      logger.info(`Cleaning up existing product with handle "${prodInput.handle}"...`);
      await deleteProductsWorkflow(container).run({
        input: { ids: existingProds.map((p) => p.id) },
      });
    }

    const categoryId = categoryMap[prodInput.categoryHandle];
    const collectionId = collectionMap[prodInput.collectionHandle];

    const {
      result: [createdProduct],
    } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: prodInput.title,
            handle: prodInput.handle,
            description: prodInput.description,
            status: "published",
            thumbnail: prodInput.thumbnail,
            images: prodInput.images.map((url) => ({ url })),
            category_ids: categoryId ? [categoryId] : [],
            collection_id: collectionId || null,
            sales_channels: [{ id: salesChannel.id }],
            metadata: prodInput.metadata,
            options: [
              {
                title: prodInput.optionTitle,
                values: prodInput.optionValues,
              },
            ],
            variants: prodInput.variants.map((v) => ({
              title: v.title,
              sku: v.sku,
              manage_inventory: true,
              allow_backorder: false,
              options: {
                [prodInput.optionTitle]: v.optionValue,
              },
              prices: [
                {
                  currency_code: "inr",
                  amount: v.priceINR,
                },
              ],
              metadata: v.metadata || {},
            })),
          },
        ],
      },
    });

    logger.info(`Product created: ${createdProduct.title} (ID: ${createdProduct.id})`);

    // Query created product's variants to link inventory
    const { data: queriedProduct } = await query.graph({
      entity: "product",
      fields: ["id", "variants.*"],
      filters: { id: createdProduct.id },
    });

    for (const variant of queriedProduct[0].variants) {
      const vInput = prodInput.variants.find((v) => v.sku === variant.sku);
      const targetStock = vInput?.stockQuantity ?? 0;

      // Check or create inventory item
      const { data: existingInvItems } = await query.graph({
        entity: "inventory_item",
        fields: ["id", "sku"],
        filters: { sku: variant.sku },
      });

      let invItemId: string;
      if (existingInvItems.length > 0) {
        invItemId = existingInvItems[0].id;
      } else {
        const {
          result: [invItem],
        } = await createInventoryItemsWorkflow(container).run({
          input: {
            items: [
              {
                sku: variant.sku,
                requires_shipping: true,
                title: `${prodInput.title} - ${variant.title}`,
              },
            ],
          },
        });
        invItemId = invItem.id;
      }

      // Link variant to inventory item
      const { data: existingLinks } = await query.graph({
        entity: "product_variant",
        fields: ["id", "inventory_items.*"],
        filters: { id: variant.id },
      });

      const isLinked = existingLinks[0]?.inventory_items?.some(
        (l) => l && "inventory_item_id" in l && l.inventory_item_id === invItemId
      );

      if (!isLinked) {
        await link.create({
          [Modules.PRODUCT]: { variant_id: variant.id },
          [Modules.INVENTORY]: { inventory_item_id: invItemId },
        });
      }

      // Manage stock level at Pune Central Nursery Hub
      const { data: existingLevels } = await query.graph({
        entity: "inventory_level",
        fields: ["id", "stocked_quantity"],
        filters: {
          inventory_item_id: invItemId,
          location_id: puneLocation.id,
        },
      });

      if (existingLevels.length > 0) {
        await updateInventoryLevelsWorkflow(container).run({
          input: {
            updates: [
              {
                inventory_item_id: invItemId,
                location_id: puneLocation.id,
                stocked_quantity: targetStock,
              },
            ],
          },
        });
      } else {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: [
              {
                inventory_item_id: invItemId,
                location_id: puneLocation.id,
                stocked_quantity: targetStock,
              },
            ],
          },
        });
      }

      logger.info(
        `  Variant "${variant.title}" [${variant.sku}]: Stock set to ${targetStock} units at ${puneLocation.name}`
      );
    }
  }

  // Ensure all products are linked to default shipping profile
  try {
    const { data: profiles } = await query.graph({
      entity: "shipping_profile",
      fields: ["id", "type"],
    });
    const defaultProfile = profiles.find((p) => p.type === "default") || profiles[0];
    if (defaultProfile) {
      const { data: allProds } = await query.graph({
        entity: "product",
        fields: ["id"],
      });
      const prodLinks = allProds.map((p) => ({
        [Modules.PRODUCT]: { product_id: p.id },
        [Modules.FULFILLMENT]: { shipping_profile_id: defaultProfile.id },
      }));
      await link.create(prodLinks);
      logger.info(`Linked ${prodLinks.length} products to default shipping profile (${defaultProfile.id})`);
    }
  } catch (e) {
    logger.info(`Product shipping profile link skipped or already active: ${e}`);
  }

  // Remove test-tomato if present
  const { data: testProds } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
    filters: { handle: "test-tomato" },
  });
  if (testProds.length > 0) {
    await deleteProductsWorkflow(container).run({
      input: { ids: testProds.map((p) => p.id) },
    });
  }

  logger.info("✅ GLOROV Catalog & Inventory seeded successfully!");
}
