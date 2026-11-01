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

export default async function seedUgaooCatalog({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);

  logger.info("🌿 Sowing GLOROV Botanical Products (Ugaoo-Inspired Catalog)...");

  // 1. Resolve Default Sales Channel
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel =
    salesChannels.find((sc) => sc.name === "Default Sales Channel" || sc.name === "GLOROV Web Store") ||
    salesChannels[0];

  if (!salesChannel) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No sales channel found.");
  }
  logger.info(`Using sales channel: ${salesChannel.name} (${salesChannel.id})`);

  // 2. Resolve Stock Location (Pune Central Nursery Hub)
  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const puneLocation = stockLocations.find((sl) => sl.name.includes("Pune")) || stockLocations[0];

  if (!puneLocation) {
    throw new MedusaError(MedusaError.Types.NOT_FOUND, "No stock location found.");
  }
  logger.info(`Using stock location: ${puneLocation.name} (${puneLocation.id})`);

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: puneLocation.id,
        add: [salesChannel.id],
      },
    });
  } catch {}

  // 3. Resolve Collections
  const targetCollections = [
    { title: "Seeds", handle: "seeds" },
    { title: "Live Plants", handle: "live-plants" },
    { title: "Planters & Pots", handle: "planters-pots" },
    { title: "Plant Care & Soil", handle: "plant-care-soil" },
    { title: "Kitchen Garden Essentials", handle: "kitchen-garden-essentials" },
    { title: "Monsoon Sowing Specials", handle: "monsoon-sowing-specials" },
    { title: "Air Purifying Plants", handle: "air-purifying-plants" },
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
        input: { collections: [tc] },
      });
      collectionMap[tc.handle] = newColl.id;
    }
  }

  // 4. Resolve Categories
  const { data: existingCategories } = await query.graph({
    entity: "product_category",
    fields: ["id", "handle"],
  });

  const categoryMap: Record<string, string> = {};
  for (const cat of existingCategories) {
    categoryMap[cat.handle] = cat.id;
  }

  const rootCategories = [
    { name: "Seeds", handle: "seeds" },
    { name: "Live Plants", handle: "live-plants" },
    { name: "Planters & Pots", handle: "planters-pots" },
    { name: "Plant Care & Soil", handle: "plant-care-soil" },
  ];
  for (const rc of rootCategories) {
    if (!categoryMap[rc.handle]) {
      const { result: [newCat] } = await createProductCategoriesWorkflow(container).run({
        input: { product_categories: [rc] },
      });
      categoryMap[rc.handle] = newCat.id;
    }
  }

  const subCategories = [
    { name: "Vegetable Seeds", handle: "vegetable-seeds", parent_category_id: categoryMap["seeds"] },
    { name: "Flower Seeds", handle: "flower-seeds", parent_category_id: categoryMap["seeds"] },
    { name: "Fruit & Herb Seeds", handle: "herb-seeds", parent_category_id: categoryMap["seeds"] },
    { name: "Indoor Plants", handle: "indoor-plants", parent_category_id: categoryMap["live-plants"] },
    { name: "Air-Purifying Plants", handle: "air-purifying-plants", parent_category_id: categoryMap["live-plants"] },
    { name: "Flowering Plants", handle: "flowering-plants", parent_category_id: categoryMap["live-plants"] },
    { name: "Succulents & Bonsai", handle: "succulents-bonsai", parent_category_id: categoryMap["live-plants"] },
    { name: "Ceramic Planters", handle: "ceramic-planters", parent_category_id: categoryMap["planters-pots"] },
    { name: "Terracotta Pots", handle: "terracotta-pots", parent_category_id: categoryMap["planters-pots"] },
    { name: "Potting Mix & Fertilizers", handle: "potting-mix-fertilizers", parent_category_id: categoryMap["plant-care-soil"] },
    { name: "Gardening Tools & Kits", handle: "gardening-tools", parent_category_id: categoryMap["plant-care-soil"] },
  ];
  for (const sc of subCategories) {
    if (!categoryMap[sc.handle]) {
      const { result: [newSub] } = await createProductCategoriesWorkflow(container).run({
        input: { product_categories: [sc] },
      });
      categoryMap[sc.handle] = newSub.id;
    }
  }

  // 5. Purge broken/empty dummy test products
  logger.info("Cleaning up orphaned test products with empty images...");
  const { data: allProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "images.*"],
  });

  const dummyToDelete = allProducts.filter(
    (p) =>
      p.handle.startsWith("coriander-seeds-desi-") ||
      p.handle === "test-tomato" ||
      (!p.images || p.images.length === 0)
  );

  if (dummyToDelete.length > 0) {
    logger.info(`Purging ${dummyToDelete.length} empty/dummy test items...`);
    await deleteProductsWorkflow(container).run({
      input: { ids: dummyToDelete.map((p) => p.id) },
    });
    logger.info("Orphaned test products purged successfully.");
  }

  // Ensure all products are published and linked to sales channel
  const { updateProductsWorkflow } = await import("@medusajs/medusa/core-flows");
  const { data: existingProdsToPublish } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "status"],
  });
  if (existingProdsToPublish.length > 0) {
    const productUpdates = existingProdsToPublish.map((p) => {
      const updateData: { id: string; status: "published"; thumbnail?: string; images?: { url: string }[] } = {
        id: p.id,
        status: "published" as const,
      };
      if (p.handle === "marigold-seeds-pusa-narangi") {
        updateData.thumbnail = "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=1200&q=80";
        updateData.images = [{ url: updateData.thumbnail }];
      } else if (p.handle === "snake-plant-golden-hahnii") {
        updateData.thumbnail = "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=1200&q=80";
        updateData.images = [{ url: updateData.thumbnail }];
      }
      return updateData;
    });

    await updateProductsWorkflow(container).run({
      input: {
        products: productUpdates,
      },
    });
    // Link sales channel
    const prodLinks = existingProdsToPublish.map((p) => ({
      [Modules.PRODUCT]: { product_id: p.id },
      [Modules.SALES_CHANNEL]: { sales_channel_id: salesChannel.id },
    }));
    await link.create(prodLinks);
    logger.info(`Updated and published ${existingProdsToPublish.length} products to sales channel.`);
  }

  // 6. Define Curated 16 Botanical Products
  const productsToSeed: SeedProductInput[] = [
    {
      title: "Brinjal Banarasi Giant Seeds",
      handle: "brinjal-banarshi-giant-seeds",
      description: "Brinjal Banarasi Giant is a classic Indian vegetable known for its large, meaty fruits and rich flavour; a must-have in any home kitchen garden. Large, deep purple, firm fruits perfect for baingan bharta, curries, and stir-fries. Rich in fibre, vitamin B6, and antioxidants. Grows well in large pots, grow bags, and garden beds. Grow it organically in GLOROV's Veggie Mix Soil, chemical-free brinjal all season long. Approx. seeds per gram: 220",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["1 gm", "25 gm"],
      thumbnail: "assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg",
      images: ["assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg", "assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-2.jpg", "assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-3.jpg"],
      metadata: {
        botanical_name: "Brinjal Banarasi Giant Seeds",
        rating: "4.7",
        review_count: "96",
      },
      variants: [
        {
                "title": "1 gm",
                "sku": "GLR-BRINJAL--01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "1 gm"
        },
        {
                "title": "25 gm",
                "sku": "GLR-BRINJAL--02",
                "priceINR": 30000,
                "stockQuantity": 80,
                "optionValue": "25 gm"
        }
],
    },
    {
      title: "Chinese Cabbage Seeds",
      handle: "chinese-cabbage-seeds",
      description: "Chinese Cabbage (Napa Cabbage) is a fast-growing, mild-flavoured cool-season vegetable that grows beautifully in Indian winters. Crisp, light, and endlessly useful in Asian and Indian cooking. Crisp, mild leaves great in stir-fries, soups, noodles, and salads. Rich in vitamin C, vitamin K, folate, and antioxidants. Quick-growing cool-season crop ready in under 10 weeks. Grow it organically with GLOROV's Veggie Mix Soil, chemical-free greens all winter long. Approx. seeds per gram: 230",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg",
      images: ["assets/images/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg", "assets/images/products/vegetable-seeds/chinese-cabbage-seeds-2.jpg", "assets/images/products/vegetable-seeds/chinese-cabbage-seeds-3.jpg"],
      metadata: {
        botanical_name: "Chinese Cabbage Seeds",
        rating: "4.7",
        review_count: "54",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-CHINESE--01",
                "priceINR": 11900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Green Onion Seeds (Leek)",
      handle: "green-onion-seeds-leek",
      description: "Green Onions or Spring Onions are a kitchen garden essential; quick to grow, endlessly useful, and freshest when cut right from your own pot. Fresh green tops with a mild, crisp onion flavour for everyday use. Rich in vitamin C, vitamin K, and folate. Both green leaves and white bulb are edible; nothing goes to waste. Grow it organically in GLOROV's Veggie Mix Soil, fresh spring onions whenever you need them. Approx. seeds per gram: 125",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/vegetable-seeds/green-onion-seeds-leek-1.jpg",
      images: ["assets/images/products/vegetable-seeds/green-onion-seeds-leek-1.jpg", "assets/images/products/vegetable-seeds/green-onion-seeds-leek-2.jpg", "assets/images/products/vegetable-seeds/green-onion-seeds-leek-3.jpg"],
      metadata: {
        botanical_name: "Leek",
        rating: "4.6",
        review_count: "56",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-GREEN-ON-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Drumstick Seeds (Moringa)",
      handle: "drumstick-seeds-moringa",
      description: "Drumstick, or Moringa, is a fast-growing tree and one of the most nutritious plants you can grow in an Indian home garden. Every part of it is useful, from the leaves to the pods to the flowers. Leaves, pods, and flowers are all edible and packed with iron, calcium, protein, and vitamin C. One of the most nutrient-dense plants to grow at home, used daily in Indian cooking. Grows fast, handles heat and drought, and needs very little attention once established. Grow it organically with GLOROV's Organic Veggie Mix for a healthy start. Approx. seeds per gram: 3",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg",
      images: ["assets/images/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg", "assets/images/products/vegetable-seeds/drumstick-seeds-moringa-2.jpg", "assets/images/products/vegetable-seeds/drumstick-seeds-moringa-3.jpg"],
      metadata: {
        botanical_name: "Moringa",
        rating: "4.6",
        review_count: "44",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-DRUMSTIC-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Watermelon Seeds",
      handle: "watermelon-seeds",
      description: "Watermelon is an excellent dessert fruit and the fruit juice makes an excellent refreshing and cooling beverage after adding a pinch of salt and black pepper. Watermelon is a trailing annual vine with tendrils. The plant requires 6 to 8 hours of daily sunlight in order to produce fully formed melons. Although watermelon is a fruit, in cultivation practices it is treated as a vegetable. Approx. seeds per gram: 26",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/vegetable-seeds/watermelon-seeds-1.jpg",
      images: ["assets/images/products/vegetable-seeds/watermelon-seeds-1.jpg", "assets/images/products/vegetable-seeds/watermelon-seeds-2.jpg", "assets/images/products/vegetable-seeds/watermelon-seeds-3.jpg"],
      metadata: {
        botanical_name: "Watermelon Seeds",
        rating: "4.6",
        review_count: "27",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-WATERMEL-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "White Cucumber Seeds (Khira)",
      handle: "white-cucumber-seeds-khira",
      description: "As far as the textural quality of a salad is concerned, white cucumbers are preferred in salads due to their crispier nature. Both the green and white cucumbers are packed with nutrients and fibres and have a high water content. Growing your own cucumbers makes them an even better choice for munching for people watching their weight and even kids Approx. seeds per gram: 42",
      categoryHandle: "vegetable-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-1.jpg",
      images: ["assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-1.jpg", "assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-2.jpg", "assets/images/products/vegetable-seeds/white-cucumber-seeds-khira-3.jpg"],
      metadata: {
        botanical_name: "Khira",
        rating: "4.7",
        review_count: "40",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-WHITE-CU-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Petunia Mix Seeds",
      handle: "petunia-mix-seeds",
      description: "Petunia Mix is a trailing, free-flowering annual. It's known for its trumpet-shaped blooms in bright colours. A gorgeous choice for hanging baskets and balconies. Produces trumpet-shaped blooms in pink, purple, red, white, and bicolour patterns One of the best flowers for continuous colour through the season Great for hanging baskets, window boxes, pots, and garden borders Grow it organically in GLOROV's Potting Mix, chemical-free blooms all season long Number of seeds per gram (aprox): 13044",
      categoryHandle: "flower-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/flower-seeds/petunia-mix-seeds-1.jpg",
      images: ["assets/images/products/flower-seeds/petunia-mix-seeds-1.jpg", "assets/images/products/flower-seeds/petunia-mix-seeds-2.jpg", "assets/images/products/flower-seeds/petunia-mix-seeds-3.jpg"],
      metadata: {
        botanical_name: "Petunia Mix Seeds",
        rating: "4.9",
        review_count: "97",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-PETUNIA--01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Dahlia Seeds",
      handle: "dahlia-seeds",
      description: "Dahlia is a striking flowering plant. It's known for its bold, layered blooms in a range of shapes and colours. A show-stopping choice for Indian winter gardens. Produces vibrant blooms in red, pink, orange, yellow, and white A rewarding flower for gardeners who want big, eye-catching colour Great for pots, borders, garden beds, and cut flower arrangements Grow it organically in GLOROV's Potting Mix, chemical-free blooms all season long Number of seeds per gram (aprox): 123",
      categoryHandle: "flower-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["1 gm", "25 gm"],
      thumbnail: "assets/images/products/flower-seeds/dahlia-seeds-1.jpg",
      images: ["assets/images/products/flower-seeds/dahlia-seeds-1.jpg", "assets/images/products/flower-seeds/dahlia-seeds-2.jpg", "assets/images/products/flower-seeds/dahlia-seeds-3.jpg"],
      metadata: {
        botanical_name: "Dahlia Seeds",
        rating: "4.8",
        review_count: "72",
      },
      variants: [
        {
                "title": "1 gm",
                "sku": "GLR-DAHLIA-S-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "1 gm"
        },
        {
                "title": "25 gm",
                "sku": "GLR-DAHLIA-S-02",
                "priceINR": 127500,
                "stockQuantity": 80,
                "optionValue": "25 gm"
        }
],
    },
    {
      title: "Marigold African Double Seeds",
      handle: "marigold-african-double-seeds",
      description: "Marigold African Double is a tall, robust flowering plant. It's known for its large, fully double blooms. A festive favourite in Indian gardens. Produces large, dense blooms in warm shades of yellow, orange, and gold A classic choice for festivals, temple offerings, rangoli, and garlands Great for borders, pots, garden beds, and cut flowers Grow it organically in GLOROV's Potting Mix, chemical-free blooms all season long Number of seeds per gram (aprox): 295",
      categoryHandle: "flower-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["1 gm", "25 gm"],
      thumbnail: "assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg",
      images: ["assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg", "assets/images/products/flower-seeds/marigold-african-double-seeds-2.jpg", "assets/images/products/flower-seeds/marigold-african-double-seeds-3.jpg"],
      metadata: {
        botanical_name: "Marigold African Double Seeds",
        rating: "4.8",
        review_count: "82",
      },
      variants: [
        {
                "title": "1 gm",
                "sku": "GLR-MARIGOLD-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "1 gm"
        },
        {
                "title": "25 gm",
                "sku": "GLR-MARIGOLD-02",
                "priceINR": 127500,
                "stockQuantity": 80,
                "optionValue": "25 gm"
        }
],
    },
    {
      title: "Cosmos Mix Seeds",
      handle: "cosmos-mix-seeds",
      description: "Cosmos Mix is a light, airy flowering plant. It's known for its delicate, daisy-like blooms. An easy, fuss-free way to add movement and colour to Indian gardens. Produces delicate, daisy-like blooms in pink, red, white, and magenta One of the easiest and fastest-flowering annuals, great for beginners Great for borders, pots, garden beds, and cut flower arrangements Grow it organically in GLOROV's Potting Mix, chemical-free blooms all season long Number of seeds per gram (aprox): 135",
      categoryHandle: "flower-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["1 gm", "25 GM"],
      thumbnail: "assets/images/products/flower-seeds/cosmos-mix-seeds-1.jpg",
      images: ["assets/images/products/flower-seeds/cosmos-mix-seeds-1.jpg", "assets/images/products/flower-seeds/cosmos-mix-seeds-2.jpg", "assets/images/products/flower-seeds/cosmos-mix-seeds-3.jpg"],
      metadata: {
        botanical_name: "Cosmos Mix Seeds",
        rating: "4.6",
        review_count: "85",
      },
      variants: [
        {
                "title": "1 gm",
                "sku": "GLR-COSMOS-M-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "1 gm"
        },
        {
                "title": "25 GM",
                "sku": "GLR-COSMOS-M-02",
                "priceINR": 127500,
                "stockQuantity": 80,
                "optionValue": "25 GM"
        }
],
    },
    {
      title: "Chrysanthemum Mix Seeds",
      handle: "chrysanthemum-mix-250-seeds",
      description: "Chrysanthemum Mix is a hardy, festive flowering plant. It's loved in Indian gardens for its abundant blooms and long flowering season. Produces bright, cheerful blooms in yellow, white, pink, orange, and bronze A classic choice for festive décor, temple offerings, and garden colour Great for borders, pots, garden beds, and cut flowers Grow it organically in GLOROV's Potting Mix, chemical-free blooms all season long Number of seeds per gram (aprox): 335",
      categoryHandle: "flower-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-1.jpg",
      images: ["assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-1.jpg", "assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-2.jpg", "assets/images/products/flower-seeds/chrysanthemum-mix-250-seeds-3.jpg"],
      metadata: {
        botanical_name: "Chrysanthemum Mix Seeds",
        rating: "4.9",
        review_count: "77",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-CHRYSANT-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Portulaca Mix Seeds",
      handle: "portulaca-mix-seeds",
      description: "Portulaca Mix is a low-growing, heat-loving annual. It's known for its vibrant, rose-like blooms that open wide in full sun. A tough, cheerful choice for Indian summer gardens. Produces bright blooms in pink, red, orange, yellow, and white Thrives in heat and needs very little care once established Great for borders, hanging pots, rock gardens, and sunny balconies Grow it organically in GLOROV's Pot-o-Mix, chemical-free blooms all season long Number of seeds per gram (aprox): 11420",
      categoryHandle: "flower-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/flower-seeds/portulaca-mix-seeds-1.jpg",
      images: ["assets/images/products/flower-seeds/portulaca-mix-seeds-1.jpg", "assets/images/products/flower-seeds/portulaca-mix-seeds-2.jpg", "assets/images/products/flower-seeds/portulaca-mix-seeds-3.jpg"],
      metadata: {
        botanical_name: "Portulaca Mix Seeds",
        rating: "4.9",
        review_count: "44",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-PORTULAC-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Italian Basil Seeds",
      handle: "italian-basil-1000-seeds",
      description: "Italian Basil is a fragrant, fast-growing herb with large, glossy leaves and a sweet, peppery flavour, a staple in Italian cooking and surprisingly easy to grow at home. Rich in vitamins A, C, and K, packed with antioxidants and anti-inflammatory properties Perfect for pesto, pasta, fresh salads, and more Thrives in India's warm weather, grows beautifully in pots, windowsills, and balconies",
      categoryHandle: "herb-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["1000 Seeds", "25 gm"],
      thumbnail: "assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg",
      images: ["assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg", "assets/images/products/herb-seeds/italian-basil-1000-seeds-2.jpg", "assets/images/products/herb-seeds/italian-basil-1000-seeds-3.jpg"],
      metadata: {
        botanical_name: "Italian Basil Seeds",
        rating: "4.9",
        review_count: "65",
      },
      variants: [
        {
                "title": "1000 Seeds",
                "sku": "GLR-ITALIAN--01",
                "priceINR": 11900,
                "stockQuantity": 80,
                "optionValue": "1000 Seeds"
        },
        {
                "title": "25 gm",
                "sku": "GLR-ITALIAN--02",
                "priceINR": 90000,
                "stockQuantity": 80,
                "optionValue": "25 gm"
        }
],
    },
    {
      title: "Arugula Seeds (Rocket Leaves)",
      handle: "arugula-seeds-rocket-leaves",
      description: "Arugula is a peppery, fast-growing salad green. It's a great way to add a bit of bite to home-grown greens. One of the quickest crops to go from seed to plate. Rich in vitamin K, vitamin C, and folate One of the fastest greens to harvest, ready in just a few weeks Toss it into salads, sandwiches, pastas, or as a peppery garnish Grow it organically in GLOROV's Veggie Mix Soil, chemical-free arugula all year round",
      categoryHandle: "herb-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-1.jpg",
      images: ["assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-1.jpg", "assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-2.jpg", "assets/images/products/herb-seeds/arugula-seeds-rocket-leaves-3.jpg"],
      metadata: {
        botanical_name: "Rocket Leaves",
        rating: "4.9",
        review_count: "51",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-ARUGULA--01",
                "priceINR": 11900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Tulsi Seeds (Holy Basil)",
      handle: "tulsi-seeds-holy-basil",
      description: "Tulsi is a sacred, aromatic herb. It's deeply rooted in Indian homes. Easy to grow, and valued for its medicinal and spiritual significance. Rich in antioxidants and essential oils, and known for its immunity-boosting properties One of the easiest ways to bring a daily wellness ritual into your home Use it in teas (kadha), fresh chewing, or as part of your daily puja Grow it organically in GLOROV's Veggie Mix Soil, chemical-free tulsi all year round Approx. seeds per gram: 4000",
      categoryHandle: "herb-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["2 gm", "25 gm"],
      thumbnail: "assets/images/products/herb-seeds/tulsi-seeds-holy-basil-1.jpg",
      images: ["assets/images/products/herb-seeds/tulsi-seeds-holy-basil-1.jpg", "assets/images/products/herb-seeds/tulsi-seeds-holy-basil-2.jpg", "assets/images/products/herb-seeds/tulsi-seeds-holy-basil-3.jpg"],
      metadata: {
        botanical_name: "Holy Basil",
        rating: "4.9",
        review_count: "83",
      },
      variants: [
        {
                "title": "2 gm",
                "sku": "GLR-TULSI-SE-01",
                "priceINR": 9900,
                "stockQuantity": 80,
                "optionValue": "2 gm"
        },
        {
                "title": "25 gm",
                "sku": "GLR-TULSI-SE-02",
                "priceINR": 60000,
                "stockQuantity": 80,
                "optionValue": "25 gm"
        }
],
    },
    {
      title: "Parsley Seeds",
      handle: "parsley-1000-seeds",
      description: "Parsley is that superhero that goes well not only as garnishing but also as a flavour enhancing addition to your culinary experiments. You will find Parsley in the list of ingredients in numerous recipes for soups, salads and main course meals. Now, parsley has a great flavour profile but it is also nutritious, which makes it great for those who are conscious of eating a balanced meal. Approx. seeds per gram: 590",
      categoryHandle: "herb-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["1 gm", "25 gm"],
      thumbnail: "assets/images/products/herb-seeds/parsley-1000-seeds-1.jpg",
      images: ["assets/images/products/herb-seeds/parsley-1000-seeds-1.jpg", "assets/images/products/herb-seeds/parsley-1000-seeds-2.jpg", "assets/images/products/herb-seeds/parsley-1000-seeds-3.jpg"],
      metadata: {
        botanical_name: "Parsley Seeds",
        rating: "4.6",
        review_count: "62",
      },
      variants: [
        {
                "title": "1 gm",
                "sku": "GLR-PARSLEY--01",
                "priceINR": 11900,
                "stockQuantity": 80,
                "optionValue": "1 gm"
        },
        {
                "title": "25 gm",
                "sku": "GLR-PARSLEY--02",
                "priceINR": 75000,
                "stockQuantity": 80,
                "optionValue": "25 gm"
        }
],
    },
    {
      title: "Oregano Seeds",
      handle: "oregano-1500-seeds",
      description: "Oregano is a low-growing, richly aromatic herb. It's a favourite for Italian and Mediterranean-style home cooking. Hardy, compact, and easy to keep going. Rich in antioxidants, vitamin K, and essential oils One of the easiest herbs to dry and store for later use Toss it into pastas, pizzas, salad dressings, or roasted vegetables Grow it organically in GLOROV's Veggie Mix Soil, chemical-free oregano all year round",
      categoryHandle: "herb-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/herb-seeds/oregano-1500-seeds-1.jpg",
      images: ["assets/images/products/herb-seeds/oregano-1500-seeds-1.jpg", "assets/images/products/herb-seeds/oregano-1500-seeds-2.jpg", "assets/images/products/herb-seeds/oregano-1500-seeds-3.jpg"],
      metadata: {
        botanical_name: "Oregano Seeds",
        rating: "4.7",
        review_count: "63",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-OREGANO--01",
                "priceINR": 11900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Thyme Seeds",
      handle: "thyme-750-seeds",
      description: "Thyme is a low-growing, aromatic herb. It's valued for its intense flavour and fragrance. A great addition to home kitchen gardens. Rich in vitamin C, vitamin A, iron, and antioxidants One of the easiest ways to add fresh herb flavour to everyday cooking Toss it into soups, roasted vegetables, marinades, or herbal teas Grow it organically in GLOROV's Veggie Mix Soil, chemical-free thyme all year round",
      categoryHandle: "herb-seeds",
      collectionHandle: "seeds",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/herb-seeds/thyme-750-seeds-1.jpg",
      images: ["assets/images/products/herb-seeds/thyme-750-seeds-1.jpg", "assets/images/products/herb-seeds/thyme-750-seeds-2.jpg", "assets/images/products/herb-seeds/thyme-750-seeds-3.jpg"],
      metadata: {
        botanical_name: "Thyme Seeds",
        rating: "4.8",
        review_count: "83",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-THYME-75-01",
                "priceINR": 11900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Peace Lily Plant",
      handle: "peace-lily-plant",
      description: "The Peace Lily plant is a stunning indoor flowering plant with dark, glossy green leaves and occasional pearly white flowers that put any competitors to shame. Known to be one of the best air-purifying plants, the Peace Lily is a wonderful indoor companion with a fuss-free attitude and low maintenance requirements. It is also fairly fast-growing, making it the perfect lush plant for indoor displays.",
      categoryHandle: "indoor-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/indoor-plants/peace-lily-plant-1.jpg",
      images: ["assets/images/products/indoor-plants/peace-lily-plant-1.jpg", "assets/images/products/indoor-plants/peace-lily-plant-2.jpg", "assets/images/products/indoor-plants/peace-lily-plant-3.jpg"],
      metadata: {
        botanical_name: "Peace Lily Plant",
        rating: "4.8",
        review_count: "54",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-PEACE-LI-01",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-PEACE-LI-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-PEACE-LI-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-PEACE-LI-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "Anthurium Red Plant",
      handle: "anthurium-red-plant",
      description: "This plant looks great when planted indoors. It features large, leathery, arrow-shaped green leaves. Its unusual, large, heart-shaped, showy red flowers bloom indoors. It is high on maintenance can be planted in decorative pots in the living room.",
      categoryHandle: "indoor-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Medium / GroPot / Mocca", "Medium / Krish / Ivory", "Medium / Krish / White", "Medium / Krish / Red"],
      thumbnail: "assets/images/products/indoor-plants/anthurium-red-plant-1.jpg",
      images: ["assets/images/products/indoor-plants/anthurium-red-plant-1.jpg", "assets/images/products/indoor-plants/anthurium-red-plant-2.jpg", "assets/images/products/indoor-plants/anthurium-red-plant-3.jpg"],
      metadata: {
        botanical_name: "Anthurium Red Plant",
        rating: "4.7",
        review_count: "59",
      },
      variants: [
        {
                "title": "Medium / GroPot / Mocca",
                "sku": "GLR-ANTHURIU-01",
                "priceINR": 59900,
                "stockQuantity": 80,
                "optionValue": "Medium / GroPot / Mocca"
        },
        {
                "title": "Medium / Krish / Ivory",
                "sku": "GLR-ANTHURIU-02",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Ivory"
        },
        {
                "title": "Medium / Krish / White",
                "sku": "GLR-ANTHURIU-03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / White"
        },
        {
                "title": "Medium / Krish / Red",
                "sku": "GLR-ANTHURIU-04",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Red"
        }
],
    },
    {
      title: "Jade Mini Plant",
      handle: "jade-plant-mini",
      description: "Are you a sucker for succulents? The Crassula Green Mini will be your dream plant kid. One of the easiest houseplants to look after, the Crassula Green Mini boasts a lush foliage which beautifies any room. Also considered lucky as per Feng Shui for its coin like round plump leaves, so go on, bring some green home, the luck just tags along for free..",
      categoryHandle: "indoor-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/indoor-plants/jade-plant-mini-1.jpg",
      images: ["assets/images/products/indoor-plants/jade-plant-mini-1.jpg", "assets/images/products/indoor-plants/jade-plant-mini-2.jpg", "assets/images/products/indoor-plants/jade-plant-mini-3.jpg"],
      metadata: {
        botanical_name: "Jade Mini Plant",
        rating: "4.6",
        review_count: "18",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-JADE-PLA-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-JADE-PLA-02",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-JADE-PLA-03",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-JADE-PLA-04",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "Money Plant Golden",
      handle: "money-plant-golden",
      description: "A beloved indoor plant around the world, the Money Plant Golden is every gardener’s favorite and with very good reason! Highly adaptable, versatile, low maintenance, and timeless, the Money Plant Gold en graces almost every garden, everywhere. This plant can survive some periods of neglect and continue to grace your gardens with an evergreen elegance. Its growth patterns also allow it to grow well as a cascading vine or a creeping plant when trained.",
      categoryHandle: "indoor-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/indoor-plants/money-plant-golden-1.jpg",
      images: ["assets/images/products/indoor-plants/money-plant-golden-1.jpg", "assets/images/products/indoor-plants/money-plant-golden-2.jpg", "assets/images/products/indoor-plants/money-plant-golden-3.jpg"],
      metadata: {
        botanical_name: "Money Plant Golden",
        rating: "4.8",
        review_count: "95",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-MONEY-PL-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-MONEY-PL-02",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-MONEY-PL-03",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-MONEY-PL-04",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "The China Doll Plant - XL",
      handle: "the-china-doll-plant-xl",
      description: "With its glossy green leaves and large growth, this indoor China Doll plant is basically a tree. The woody branches of the Radermachera sinica complement its dark green leaves perfectly, creating the most wonderful indoor aesthetics. Interestingly, the plant being called the China Doll Tree has nothing to do with the country but everything to do with the fact that the tree looks - quite literally - like a doll house tree. The best part? This plant is relatively easy to care for and adds an instant forest-like feel to any space, serving as an excellent plant for balconies and patios.",
      categoryHandle: "indoor-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/indoor-plants/the-china-doll-plant-xl-1.jpg",
      images: ["assets/images/products/indoor-plants/the-china-doll-plant-xl-1.jpg", "assets/images/products/indoor-plants/the-china-doll-plant-xl-2.jpg", "assets/images/products/indoor-plants/the-china-doll-plant-xl-3.jpg"],
      metadata: {
        botanical_name: "The China Doll Plant - XL",
        rating: "4.9",
        review_count: "46",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-THE-CHIN-01",
                "priceINR": 179900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Areca Palm Plant XL",
      handle: "areca-palm-plant-xl",
      description: "Once an endangered species, the Areca Palm is a staple in Indian spaces. One of the most undervalued plants in the indoor plant category. This excellent air purifier is pet friendly and easy to grow. Its delicate leaves/fronds grow outwards in a curved manner and add a tropical feel to any space and can adapt to a variety of growing conditions.",
      categoryHandle: "indoor-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/indoor-plants/areca-palm-plant-xl-1.jpg",
      images: ["assets/images/products/indoor-plants/areca-palm-plant-xl-1.jpg", "assets/images/products/indoor-plants/areca-palm-plant-xl-2.jpg", "assets/images/products/indoor-plants/areca-palm-plant-xl-3.jpg"],
      metadata: {
        botanical_name: "Areca Palm Plant XL",
        rating: "4.9",
        review_count: "73",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-ARECA-PA-01",
                "priceINR": 179900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Peace Lily Plant",
      handle: "peace-lily-plant",
      description: "The Peace Lily plant is a stunning indoor flowering plant with dark, glossy green leaves and occasional pearly white flowers that put any competitors to shame. Known to be one of the best air-purifying plants, the Peace Lily is a wonderful indoor companion with a fuss-free attitude and low maintenance requirements. It is also fairly fast-growing, making it the perfect lush plant for indoor displays.",
      categoryHandle: "air-purifying-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/air-purifying-plants/peace-lily-plant-1.jpg",
      images: ["assets/images/products/air-purifying-plants/peace-lily-plant-1.jpg", "assets/images/products/air-purifying-plants/peace-lily-plant-2.jpg", "assets/images/products/air-purifying-plants/peace-lily-plant-3.jpg"],
      metadata: {
        botanical_name: "Peace Lily Plant",
        rating: "4.7",
        review_count: "47",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-PEACE-LI-01",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-PEACE-LI-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-PEACE-LI-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-PEACE-LI-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "Money Plant Golden",
      handle: "money-plant-golden",
      description: "A beloved indoor plant around the world, the Money Plant Golden is every gardener’s favorite and with very good reason! Highly adaptable, versatile, low maintenance, and timeless, the Money Plant Gold en graces almost every garden, everywhere. This plant can survive some periods of neglect and continue to grace your gardens with an evergreen elegance. Its growth patterns also allow it to grow well as a cascading vine or a creeping plant when trained.",
      categoryHandle: "air-purifying-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/air-purifying-plants/money-plant-golden-1.jpg",
      images: ["assets/images/products/air-purifying-plants/money-plant-golden-1.jpg", "assets/images/products/air-purifying-plants/money-plant-golden-2.jpg", "assets/images/products/air-purifying-plants/money-plant-golden-3.jpg"],
      metadata: {
        botanical_name: "Money Plant Golden",
        rating: "4.7",
        review_count: "25",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-MONEY-PL-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-MONEY-PL-02",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-MONEY-PL-03",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-MONEY-PL-04",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "The China Doll Plant - XL",
      handle: "the-china-doll-plant-xl",
      description: "With its glossy green leaves and large growth, this indoor China Doll plant is basically a tree. The woody branches of the Radermachera sinica complement its dark green leaves perfectly, creating the most wonderful indoor aesthetics. Interestingly, the plant being called the China Doll Tree has nothing to do with the country but everything to do with the fact that the tree looks - quite literally - like a doll house tree. The best part? This plant is relatively easy to care for and adds an instant forest-like feel to any space, serving as an excellent plant for balconies and patios.",
      categoryHandle: "air-purifying-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/air-purifying-plants/the-china-doll-plant-xl-1.jpg",
      images: ["assets/images/products/air-purifying-plants/the-china-doll-plant-xl-1.jpg", "assets/images/products/air-purifying-plants/the-china-doll-plant-xl-2.jpg", "assets/images/products/air-purifying-plants/the-china-doll-plant-xl-3.jpg"],
      metadata: {
        botanical_name: "The China Doll Plant - XL",
        rating: "4.7",
        review_count: "67",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-THE-CHIN-01",
                "priceINR": 179900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Aglaonema Pink Beauty Plant - Medium",
      handle: "aglaonema-pink-beauty-plant",
      description: "If you are a first time gardener looking for an easy one, Aglaonema Pink Beauty is the plant for you. Also called the Chinese Evergreen, it will stay happy and beautiful in low indirect light with little water. Its bright pink leaves add the right amount of jazz and colour to any space and décor. Its a stunner with its pretty pink foliage both alone and in plant clusters.",
      categoryHandle: "air-purifying-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["GroPot / Mocca", "Krish / Ivory", "Krish / Red", "Krish / White"],
      thumbnail: "assets/images/products/air-purifying-plants/aglaonema-pink-beauty-plant-1.jpg",
      images: ["assets/images/products/air-purifying-plants/aglaonema-pink-beauty-plant-1.jpg", "assets/images/products/air-purifying-plants/aglaonema-pink-beauty-plant-2.jpg", "assets/images/products/air-purifying-plants/aglaonema-pink-beauty-plant-3.jpg"],
      metadata: {
        botanical_name: "Aglaonema Pink Beauty Plant - Medium",
        rating: "4.9",
        review_count: "52",
      },
      variants: [
        {
                "title": "GroPot / Mocca",
                "sku": "GLR-AGLAONEM-01",
                "priceINR": 59900,
                "stockQuantity": 80,
                "optionValue": "GroPot / Mocca"
        },
        {
                "title": "Krish / Ivory",
                "sku": "GLR-AGLAONEM-02",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Krish / Ivory"
        },
        {
                "title": "Krish / Red",
                "sku": "GLR-AGLAONEM-03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Krish / Red"
        },
        {
                "title": "Krish / White",
                "sku": "GLR-AGLAONEM-04",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Krish / White"
        }
],
    },
    {
      title: "Aglaonema Red Plant",
      handle: "aglaonema-red-plant",
      description: "A great hassle free addition to indoor spaces to lend it colour and charm with its bright red leaves. A lover of indirect to low light areas and little water, this plant is the answer you were looking for to add some character to that empty corner with little light or your work area. Too much green in the plant cluster, add a spot of red and voila!",
      categoryHandle: "air-purifying-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Medium / GroPot / Mocca", "Medium / Krish / Ivory", "Medium / Krish / Red", "Medium / Krish / White"],
      thumbnail: "assets/images/products/air-purifying-plants/aglaonema-red-plant-1.jpg",
      images: ["assets/images/products/air-purifying-plants/aglaonema-red-plant-1.jpg", "assets/images/products/air-purifying-plants/aglaonema-red-plant-2.jpg", "assets/images/products/air-purifying-plants/aglaonema-red-plant-3.jpg"],
      metadata: {
        botanical_name: "Aglaonema Red Plant",
        rating: "4.8",
        review_count: "22",
      },
      variants: [
        {
                "title": "Medium / GroPot / Mocca",
                "sku": "GLR-AGLAONEM-01",
                "priceINR": 59900,
                "stockQuantity": 80,
                "optionValue": "Medium / GroPot / Mocca"
        },
        {
                "title": "Medium / Krish / Ivory",
                "sku": "GLR-AGLAONEM-02",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Ivory"
        },
        {
                "title": "Medium / Krish / Red",
                "sku": "GLR-AGLAONEM-03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Red"
        },
        {
                "title": "Medium / Krish / White",
                "sku": "GLR-AGLAONEM-04",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / White"
        }
],
    },
    {
      title: "ZZ Plant - XL",
      handle: "zz-plant-xl",
      description: "Topping the list of indestructible houseplants is the Zamioculcas Zamiifolia more popularly known as the ZZ plant. This plant is loved for his easy going and non-demanding nature. The wide, dark, glossy leaves instantly add life to any interior and he will be a happy trooper in the darkest corners of your home.",
      categoryHandle: "air-purifying-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/air-purifying-plants/zz-plant-xl-1.jpg",
      images: ["assets/images/products/air-purifying-plants/zz-plant-xl-1.jpg", "assets/images/products/air-purifying-plants/zz-plant-xl-2.jpg", "assets/images/products/air-purifying-plants/zz-plant-xl-3.jpg"],
      metadata: {
        botanical_name: "ZZ Plant - XL",
        rating: "4.9",
        review_count: "50",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-ZZ-PLANT-01",
                "priceINR": 249900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Peace Lily Plant",
      handle: "peace-lily-plant",
      description: "The Peace Lily plant is a stunning indoor flowering plant with dark, glossy green leaves and occasional pearly white flowers that put any competitors to shame. Known to be one of the best air-purifying plants, the Peace Lily is a wonderful indoor companion with a fuss-free attitude and low maintenance requirements. It is also fairly fast-growing, making it the perfect lush plant for indoor displays.",
      categoryHandle: "flowering-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/flowering-plants/peace-lily-plant-1.jpg",
      images: ["assets/images/products/flowering-plants/peace-lily-plant-1.jpg", "assets/images/products/flowering-plants/peace-lily-plant-2.jpg", "assets/images/products/flowering-plants/peace-lily-plant-3.jpg"],
      metadata: {
        botanical_name: "Peace Lily Plant",
        rating: "4.7",
        review_count: "16",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-PEACE-LI-01",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-PEACE-LI-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-PEACE-LI-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-PEACE-LI-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "Anthurium Red Plant",
      handle: "anthurium-red-plant",
      description: "This plant looks great when planted indoors. It features large, leathery, arrow-shaped green leaves. Its unusual, large, heart-shaped, showy red flowers bloom indoors. It is high on maintenance can be planted in decorative pots in the living room.",
      categoryHandle: "flowering-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Medium / GroPot / Mocca", "Medium / Krish / Ivory", "Medium / Krish / White", "Medium / Krish / Red"],
      thumbnail: "assets/images/products/flowering-plants/anthurium-red-plant-1.jpg",
      images: ["assets/images/products/flowering-plants/anthurium-red-plant-1.jpg", "assets/images/products/flowering-plants/anthurium-red-plant-2.jpg", "assets/images/products/flowering-plants/anthurium-red-plant-3.jpg"],
      metadata: {
        botanical_name: "Anthurium Red Plant",
        rating: "4.8",
        review_count: "66",
      },
      variants: [
        {
                "title": "Medium / GroPot / Mocca",
                "sku": "GLR-ANTHURIU-01",
                "priceINR": 59900,
                "stockQuantity": 80,
                "optionValue": "Medium / GroPot / Mocca"
        },
        {
                "title": "Medium / Krish / Ivory",
                "sku": "GLR-ANTHURIU-02",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Ivory"
        },
        {
                "title": "Medium / Krish / White",
                "sku": "GLR-ANTHURIU-03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / White"
        },
        {
                "title": "Medium / Krish / Red",
                "sku": "GLR-ANTHURIU-04",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Red"
        }
],
    },
    {
      title: "Peace Lily Large (Spathiphyllum Sensation)",
      handle: "peace-lily-large-spathiphyllum-sensation",
      description: "The Large Peace Lily (Spathiphyllum Sensation) is elegance and calm in plant form. With lush, green leaves and graceful white blooms, it instantly brightens up living rooms, bedrooms, or office corners. Known as one of the best natural air purifiers, this large Peace Lily not only uplifts your décor but also helps you breathe fresher, cleaner air every day. Despite its grand size, it’s easy to care for - thriving in low light and needing only moderate watering. If you’re looking for a statement plant that’s both beautiful and fuss-free, the Peace Lily is the one to bring home.",
      categoryHandle: "flowering-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/flowering-plants/peace-lily-large-spathiphyllum-sensation-1.jpg",
      images: ["assets/images/products/flowering-plants/peace-lily-large-spathiphyllum-sensation-1.jpg", "assets/images/products/flowering-plants/peace-lily-large-spathiphyllum-sensation-2.jpg", "assets/images/products/flowering-plants/peace-lily-large-spathiphyllum-sensation-3.jpg"],
      metadata: {
        botanical_name: "Spathiphyllum Sensation",
        rating: "4.8",
        review_count: "28",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-PEACE-LI-01",
                "priceINR": 144900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Aglaonema Snow White Plant",
      handle: "aglaonema-snow-white-plant",
      description: "Elevate your indoor space with the Aglaonema Snow White plant. With its striking variegated leaves and low-maintenance nature, it's the perfect addition to any home. Thriving in moderate light and adaptable to various conditions, it's a breeze to care for, even for beginners. Ideal for all décor themes, the Aglaonema Snow White brings a touch of nature's elegance indoors. Its lush green and creamy white foliage complements both sleek modern spaces and culturally rich traditional interiors. This plant not only purifies the air but also adds a sense of tranquillity to your surroundings. Place it in living rooms, bedrooms, or offices, its charm and adaptability make it a must-have indoor companion for all décor styles.",
      categoryHandle: "flowering-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["GroPot / Ivory", "Krish / Ivory", "Krish / White", "Krish / Brown"],
      thumbnail: "assets/images/products/flowering-plants/aglaonema-snow-white-plant-1.jpg",
      images: ["assets/images/products/flowering-plants/aglaonema-snow-white-plant-1.jpg", "assets/images/products/flowering-plants/aglaonema-snow-white-plant-2.jpg", "assets/images/products/flowering-plants/aglaonema-snow-white-plant-3.jpg"],
      metadata: {
        botanical_name: "Aglaonema Snow White Plant",
        rating: "4.8",
        review_count: "30",
      },
      variants: [
        {
                "title": "GroPot / Ivory",
                "sku": "GLR-AGLAONEM-01",
                "priceINR": 129900,
                "stockQuantity": 80,
                "optionValue": "GroPot / Ivory"
        },
        {
                "title": "Krish / Ivory",
                "sku": "GLR-AGLAONEM-02",
                "priceINR": 139900,
                "stockQuantity": 80,
                "optionValue": "Krish / Ivory"
        },
        {
                "title": "Krish / White",
                "sku": "GLR-AGLAONEM-03",
                "priceINR": 139900,
                "stockQuantity": 80,
                "optionValue": "Krish / White"
        },
        {
                "title": "Krish / Brown",
                "sku": "GLR-AGLAONEM-04",
                "priceINR": 139900,
                "stockQuantity": 80,
                "optionValue": "Krish / Brown"
        }
],
    },
    {
      title: "Bird of Paradise Plant",
      handle: "bird-of-paradise-plant",
      description: "The Strelitzia nicolai, more famous as the Bird of Paradise plant, is given its name due to its wild blue-orange flowers that closely resemble its namesake bird. A close relative of the Banana family, it is an easier and more tolerant tropical plant to grow at home. This stunning plant does beautifully in bright, indirect light and rewards you with its graceful arching leaves, making for a beautiful housemate. While the plant does not flower indoors, its captivating foliage is more than enough to make up for it, giving the plant the center stage no matter where you put it!",
      categoryHandle: "flowering-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Medium / GroPot / Ivory", "Medium / Krish / White", "Medium / Krish / Ivory", "Medium / Krish / Red"],
      thumbnail: "assets/images/products/flowering-plants/bird-of-paradise-plant-1.jpg",
      images: ["assets/images/products/flowering-plants/bird-of-paradise-plant-1.jpg", "assets/images/products/flowering-plants/bird-of-paradise-plant-2.jpg", "assets/images/products/flowering-plants/bird-of-paradise-plant-3.jpg"],
      metadata: {
        botanical_name: "Bird of Paradise Plant",
        rating: "4.7",
        review_count: "88",
      },
      variants: [
        {
                "title": "Medium / GroPot / Ivory",
                "sku": "GLR-BIRD-OF--01",
                "priceINR": 59900,
                "stockQuantity": 80,
                "optionValue": "Medium / GroPot / Ivory"
        },
        {
                "title": "Medium / Krish / White",
                "sku": "GLR-BIRD-OF--02",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / White"
        },
        {
                "title": "Medium / Krish / Ivory",
                "sku": "GLR-BIRD-OF--03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Ivory"
        },
        {
                "title": "Medium / Krish / Red",
                "sku": "GLR-BIRD-OF--04",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Medium / Krish / Red"
        }
],
    },
    {
      title: "Peace Lily Plant - Set of 2",
      handle: "peace-lily-plant-set-of-2",
      description: "The bigger cousin of the beautiful peace lily, the Spatiphyllum Sensation is one of the most loved peace lily varieties in the world. In addition to its majestic white flowers, it has large, glossy, oblong leaves that are excellent air purifiers. The best part is its ease to grow and low maintenance nature that makes it a perfect choice first time gardeners.",
      categoryHandle: "flowering-plants",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/flowering-plants/peace-lily-plant-set-of-2-1.jpg",
      images: ["assets/images/products/flowering-plants/peace-lily-plant-set-of-2-1.jpg", "assets/images/products/flowering-plants/peace-lily-plant-set-of-2-2.jpg", "assets/images/products/flowering-plants/peace-lily-plant-set-of-2-3.jpg"],
      metadata: {
        botanical_name: "Peace Lily Plant - Set of 2",
        rating: "4.8",
        review_count: "48",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-PEACE-LI-01",
                "priceINR": 169900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Jade Mini Plant",
      handle: "jade-plant-mini",
      description: "Are you a sucker for succulents? The Crassula Green Mini will be your dream plant kid. One of the easiest houseplants to look after, the Crassula Green Mini boasts a lush foliage which beautifies any room. Also considered lucky as per Feng Shui for its coin like round plump leaves, so go on, bring some green home, the luck just tags along for free..",
      categoryHandle: "succulents-bonsai",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Small / GroPot / Mocca", "Small / Krish / Ivory", "Small / Krish / White", "Small / Krish / Brown"],
      thumbnail: "assets/images/products/succulents-bonsai/jade-plant-mini-1.jpg",
      images: ["assets/images/products/succulents-bonsai/jade-plant-mini-1.jpg", "assets/images/products/succulents-bonsai/jade-plant-mini-2.jpg", "assets/images/products/succulents-bonsai/jade-plant-mini-3.jpg"],
      metadata: {
        botanical_name: "Jade Mini Plant",
        rating: "4.9",
        review_count: "50",
      },
      variants: [
        {
                "title": "Small / GroPot / Mocca",
                "sku": "GLR-JADE-PLA-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "Small / GroPot / Mocca"
        },
        {
                "title": "Small / Krish / Ivory",
                "sku": "GLR-JADE-PLA-02",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Ivory"
        },
        {
                "title": "Small / Krish / White",
                "sku": "GLR-JADE-PLA-03",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / White"
        },
        {
                "title": "Small / Krish / Brown",
                "sku": "GLR-JADE-PLA-04",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "Small / Krish / Brown"
        }
],
    },
    {
      title: "Sansevieria Laurentii Plant - XL",
      handle: "sansevieria-laurentii-plant-xl",
      description: "",
      categoryHandle: "succulents-bonsai",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/succulents-bonsai/sansevieria-laurentii-plant-xl-1.jpg",
      images: ["assets/images/products/succulents-bonsai/sansevieria-laurentii-plant-xl-1.jpg", "assets/images/products/succulents-bonsai/sansevieria-laurentii-plant-xl-2.jpg", "assets/images/products/succulents-bonsai/sansevieria-laurentii-plant-xl-3.jpg"],
      metadata: {
        botanical_name: "Sansevieria Laurentii Plant - XL",
        rating: "4.8",
        review_count: "39",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-SANSEVIE-01",
                "priceINR": 179900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Snake Plant - Golden Hahnii",
      handle: "snake-plant-golden-hahnii",
      description: "A dwarf variety of the famed snake plant family, the Sansevieria Golden Hahnii sports beautiful variegated leaves in grey-green with dark green bands and golden yellow margins. It is a low maintenance plant that is hard to kill even for the most novice of gardeners. Its compact size makes it an excellent choice for office desks and small spaces.",
      categoryHandle: "succulents-bonsai",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["GroPot / Mocca", "Krish / Ivory", "Krish / White", "Krish / Brown"],
      thumbnail: "assets/images/products/succulents-bonsai/snake-plant-golden-hahnii-1.jpg",
      images: ["assets/images/products/succulents-bonsai/snake-plant-golden-hahnii-1.jpg", "assets/images/products/succulents-bonsai/snake-plant-golden-hahnii-2.jpg", "assets/images/products/succulents-bonsai/snake-plant-golden-hahnii-3.jpg"],
      metadata: {
        botanical_name: "Snake Plant - Golden Hahnii",
        rating: "4.6",
        review_count: "67",
      },
      variants: [
        {
                "title": "GroPot / Mocca",
                "sku": "GLR-SNAKE-PL-01",
                "priceINR": 24900,
                "stockQuantity": 80,
                "optionValue": "GroPot / Mocca"
        },
        {
                "title": "Krish / Ivory",
                "sku": "GLR-SNAKE-PL-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Krish / Ivory"
        },
        {
                "title": "Krish / White",
                "sku": "GLR-SNAKE-PL-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Krish / White"
        },
        {
                "title": "Krish / Brown",
                "sku": "GLR-SNAKE-PL-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Krish / Brown"
        }
],
    },
    {
      title: "Snake Plant - Futura Superba",
      handle: "snake-plant-futura-superba",
      description: "Another cousin of the classic Snake Plant, the Sansevieria Futura Superba is a delight to look at and have indoors with its long, sword-like leaves, dark green patterns on a lighter green backdrop, and golden-yellow borders that adorn the edges of the leaves. As is characteristic of Snake Plants, the Futura Superba is also a wonderfully low maintenance addition to indoor spaces, making it ideal for new and busy gardeners. Moreover, the low light tolerance and forgiving nature of this plant toward small durations of neglect make it a garden favorite.",
      categoryHandle: "succulents-bonsai",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["GroPot / Mocca", "Krish Pot / Ivory", "Krish Pot / White", "Diamond / White"],
      thumbnail: "assets/images/products/succulents-bonsai/snake-plant-futura-superba-1.jpg",
      images: ["assets/images/products/succulents-bonsai/snake-plant-futura-superba-1.jpg", "assets/images/products/succulents-bonsai/snake-plant-futura-superba-2.jpg", "assets/images/products/succulents-bonsai/snake-plant-futura-superba-3.jpg"],
      metadata: {
        botanical_name: "Snake Plant - Futura Superba",
        rating: "4.8",
        review_count: "82",
      },
      variants: [
        {
                "title": "GroPot / Mocca",
                "sku": "GLR-SNAKE-PL-01",
                "priceINR": 59900,
                "stockQuantity": 80,
                "optionValue": "GroPot / Mocca"
        },
        {
                "title": "Krish Pot / Ivory",
                "sku": "GLR-SNAKE-PL-02",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Krish Pot / Ivory"
        },
        {
                "title": "Krish Pot / White",
                "sku": "GLR-SNAKE-PL-03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Krish Pot / White"
        },
        {
                "title": "Diamond / White",
                "sku": "GLR-SNAKE-PL-04",
                "priceINR": 89900,
                "stockQuantity": 80,
                "optionValue": "Diamond / White"
        }
],
    },
    {
      title: "Sansevieria Zeylanica - XL",
      handle: "sansevieria-zeylanica-xl",
      description: "",
      categoryHandle: "succulents-bonsai",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/succulents-bonsai/sansevieria-zeylanica-xl-1.jpg",
      images: ["assets/images/products/succulents-bonsai/sansevieria-zeylanica-xl-1.jpg", "assets/images/products/succulents-bonsai/sansevieria-zeylanica-xl-2.jpg", "assets/images/products/succulents-bonsai/sansevieria-zeylanica-xl-3.jpg"],
      metadata: {
        botanical_name: "Sansevieria Zeylanica - XL",
        rating: "4.8",
        review_count: "34",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-SANSEVIE-01",
                "priceINR": 179900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Trailing Jade(Weeping Jade) With Hanging Pot",
      handle: "weeping-jade-with-hanging-pot",
      description: "Introducing the Jade Creeper Plant in a Hanging Planter—a stunning addition to your garden! Its vibrant green leaves cascade beautifully, adding a touch of natural beauty to any space. Easy to care for, this plant thrives in bright, indirect light and requires only occasional watering. Perfect for new and experienced gardeners alike, it’s low-maintenance and drought-tolerant. Ideal for hanging planters, it creates stunning displays indoors or outdoors. With air-purifying qualities, it not only beautifies but also freshens your home. Elevate your garden with the Jade Creeper Plant in a Hanging Planter!",
      categoryHandle: "succulents-bonsai",
      collectionHandle: "live-plants",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/succulents-bonsai/weeping-jade-with-hanging-pot-1.jpg",
      images: ["assets/images/products/succulents-bonsai/weeping-jade-with-hanging-pot-1.jpg", "assets/images/products/succulents-bonsai/weeping-jade-with-hanging-pot-2.jpg", "assets/images/products/succulents-bonsai/weeping-jade-with-hanging-pot-3.jpg"],
      metadata: {
        botanical_name: "Weeping Jade With Hanging Pot",
        rating: "4.9",
        review_count: "97",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-WEEPING--01",
                "priceINR": 99900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Spiro Ceramic Pot",
      handle: "spiro-pot",
      description: "Hey there, plant lovers! We have something special for you - the \"Spiro Ceramic Pot\" that'll give your plants the home they deserve. This premium quality ceramic planter is not your average pot, it boasts a glossy glazed finish that shines brighter than your best friend's smile. The grooved surface finish adds character to this pot, making it a unique addition to your plant collection. The \"Spiro Ceramic Pot\" is not just pretty, it's functional too. It's designed with a drainage hole that keeps your plants from drowning in excess water, and a ceramic base plate that keeps your floors clean and tidy. This planter is perfect for both indoor and outdoor settings, giving you the flexibility to move your plants around as you please. Invest in the \"Spiro Ceramic Pot\" and show your plants some love. It's not just a planter, it's a statement piece that'll make your home or garden look even more beautiful. With its practical features and stunning design, your plants will feel right at home. Don't wait any longer, get your \"Spiro Ceramic Pot\" today and give your plants the upgrade they deserve.",
      categoryHandle: "ceramic-planters",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Crepe Pink", "Cadet Blue", "Black", "Turquoise Blue"],
      thumbnail: "assets/images/products/ceramic-planters/spiro-pot-1.jpg",
      images: ["assets/images/products/ceramic-planters/spiro-pot-1.jpg", "assets/images/products/ceramic-planters/spiro-pot-2.jpg", "assets/images/products/ceramic-planters/spiro-pot-3.jpg"],
      metadata: {
        botanical_name: "Spiro Ceramic Pot",
        rating: "4.8",
        review_count: "62",
      },
      variants: [
        {
                "title": "Crepe Pink",
                "sku": "GLR-SPIRO-PO-01",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Crepe Pink"
        },
        {
                "title": "Cadet Blue",
                "sku": "GLR-SPIRO-PO-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Cadet Blue"
        },
        {
                "title": "Black",
                "sku": "GLR-SPIRO-PO-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Black"
        },
        {
                "title": "Turquoise Blue",
                "sku": "GLR-SPIRO-PO-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Turquoise Blue"
        }
],
    },
    {
      title: "Roma Ceramic Pot",
      handle: "roma-ceramic-pot",
      description: "Introducing the exquisite Roma Pot, a stunning ceramic masterpiece inspired by the timeless beauty of old Roman architecture. Reminiscent of majestic pillars, this unique pot brings an air of elegance and grandeur to your indoor or outdoor space. Crafted with meticulous attention to detail, the Roma Pot showcases a design that pays homage to the classical aesthetics of ancient Rome. Its cylindrical shape, adorned with intricate patterns and textured details, evokes a sense of history and sophistication. Made from high-quality ceramic, this pot combines durability with refined craftsmanship. Its sturdy construction ensures long-lasting performance, while the smooth glazed finish adds a touch of luxury. It is built to withstand the test of time , making it an ideal choice for both interior and exterior environments.",
      categoryHandle: "ceramic-planters",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["4 Inch / White", "4 Inch / Grey", "4 Inch / Magenta", "4 Inch / Carton Brown"],
      thumbnail: "assets/images/products/ceramic-planters/roma-ceramic-pot-1.jpg",
      images: ["assets/images/products/ceramic-planters/roma-ceramic-pot-1.jpg", "assets/images/products/ceramic-planters/roma-ceramic-pot-2.jpg", "assets/images/products/ceramic-planters/roma-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Roma Ceramic Pot",
        rating: "4.8",
        review_count: "43",
      },
      variants: [
        {
                "title": "4 Inch / White",
                "sku": "GLR-ROMA-CER-01",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / White"
        },
        {
                "title": "4 Inch / Grey",
                "sku": "GLR-ROMA-CER-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / Grey"
        },
        {
                "title": "4 Inch / Magenta",
                "sku": "GLR-ROMA-CER-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / Magenta"
        },
        {
                "title": "4 Inch / Carton Brown",
                "sku": "GLR-ROMA-CER-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / Carton Brown"
        }
],
    },
    {
      title: "Diamond Ceramic Pot",
      handle: "diamond-pot",
      description: "Introducing our Diamond Ceramic Planter in a sleek colour, a stunning addition to any plant lover's collection. Crafted from high-quality glazed ceramic, this planter boasts a premium finish that exudes elegance and style. This planter is not just a beautiful addition to your decor, it is also a practical choice for your plants. The drainage hole allows for proper drainage and prevents over-watering, keeping your plants healthy and happy and the attached ceramic base plate not only holds the extra drained water but also adds to the beauty of the planter. This handcrafted planter in black is designed to withstand the elements and can be used both indoors and outdoors, making it a versatile choice for any setting. Whether you are looking to add a modern touch to your living room or create a serene outdoor oasis, the Diamond Ceramic Planter in black is the perfect choice.",
      categoryHandle: "ceramic-planters",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Magenta", "White", "Carton Brown", "Light Pink"],
      thumbnail: "assets/images/products/ceramic-planters/diamond-pot-1.jpg",
      images: ["assets/images/products/ceramic-planters/diamond-pot-1.jpg", "assets/images/products/ceramic-planters/diamond-pot-2.jpg", "assets/images/products/ceramic-planters/diamond-pot-3.jpg"],
      metadata: {
        botanical_name: "Diamond Ceramic Pot",
        rating: "4.8",
        review_count: "64",
      },
      variants: [
        {
                "title": "Magenta",
                "sku": "GLR-DIAMOND--01",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Magenta"
        },
        {
                "title": "White",
                "sku": "GLR-DIAMOND--02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "White"
        },
        {
                "title": "Carton Brown",
                "sku": "GLR-DIAMOND--03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Carton Brown"
        },
        {
                "title": "Light Pink",
                "sku": "GLR-DIAMOND--04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "Light Pink"
        }
],
    },
    {
      title: "Shells Sage Ceramic Pot",
      handle: "shells-sage-ceramic-pot",
      description: "Inspired by the beauty of India’s coastlines, Shell Sage brings a little of the ocean’s charm into your home. Overlapping scallops fan out across the surface, each one finely veined like a leaf, while the glossy sage crackle glaze settles into every groove, highlighting the intricate texture. The layered pattern recalls seashells washed ashore along India’s shores, from the tranquil beaches of Konkan to the tropical coastlines of Kerala. Its soft green hue and sculptural design lend a quiet elegance to your space, whether styled with natural wood, woven textures or lush greenery. Crafted from high-fired ceramic, this pot looks lovely on a console, desk or bedside table. A distinctive home for your plants, inspired by the beauty of the Indian coast. Why You Will Love It The raised shell pattern catches the light, so it looks different at every hour of the day. Sage green is calm enough to sit beside wood., linen, cane, and white walls. The texture adds depth to a room without adding colour or clutter. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "ceramic-planters",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/ceramic-planters/shells-sage-ceramic-pot-1.jpg",
      images: ["assets/images/products/ceramic-planters/shells-sage-ceramic-pot-1.jpg", "assets/images/products/ceramic-planters/shells-sage-ceramic-pot-2.jpg", "assets/images/products/ceramic-planters/shells-sage-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Shells Sage Ceramic Pot",
        rating: "4.8",
        review_count: "24",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-SHELLS-S-01",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-SHELLS-S-02",
                "priceINR": 99900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Petals Ivory Handpainted Ceramic Pot",
      handle: "petals-ivory-handpainted-ceramic-pot",
      description: "Somewhere between a blooming garden and a little work of art, the Petals Ivory finds its charm. The folk-art design, with bold petals and delicate dotted details, has a personality all its own. Every stroke is painted by hand onto a glossy ivory glaze, and the fine crackle gives it the hush of old pottery. Its earthy palette suits any bohemian, eclectic or understated Indian space, adding colour without taking over. Style it on a console or windowsill, or let it brighten a quiet corner of your home. Made from high-fired ceramic, the Petals Ivory pairs artistic detail with the timeless appeal of ceramic. Why You Will Love It Bold blooms and leafy motifs give these pots a distinctive look that feels full of personality. The folk-art motifs are painted by hand, so every pot has its own brushwork. The colours come together beautifully to add warmth without overpowering your decor. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "ceramic-planters",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/ceramic-planters/petals-ivory-handpainted-ceramic-pot-1.jpg",
      images: ["assets/images/products/ceramic-planters/petals-ivory-handpainted-ceramic-pot-1.jpg", "assets/images/products/ceramic-planters/petals-ivory-handpainted-ceramic-pot-2.jpg", "assets/images/products/ceramic-planters/petals-ivory-handpainted-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Petals Ivory Handpainted Ceramic Pot",
        rating: "4.8",
        review_count: "39",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-PETALS-I-01",
                "priceINR": 84900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-PETALS-I-02",
                "priceINR": 119900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Olivia Ivory Handpainted Ceramic Pot",
      handle: "olivia-ivory-handpainted-ceramic-pot",
      description: "Inspired by the beauty of nature, the Olivia Ivory brings a touch of botanical charm to your home. Sage-green leaves and deep brown olives wind across a warm ivory glaze, each detail hand-painted, while the delicate crackle finish lends it an old-world appeal. Its leafy patterns evoke the charm of traditional Indian botanical motifs, reminiscent of hand-painted pottery and nature-inspired designs found in Indian homes. The understated ivory base and earthy greens make it an easy fit for everything from rustic corners and cosy balconies to contemporary living spaces. Crafted from high-fired ceramic with a glossy glaze, this pot brings together timeless design and everyday elegance. A beautiful way to give your plants a home while adding a thoughtful decorative touch to your space. Why You Will Love It The branch wraps around the pot, so it looks good from every angle. Muted green and brown on ivory is calm enough for any room, boho or minimal. Every branch is hand-painted, so each pot has its own brushwork. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "ceramic-planters",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/ceramic-planters/olivia-ivory-handpainted-ceramic-pot-1.jpg",
      images: ["assets/images/products/ceramic-planters/olivia-ivory-handpainted-ceramic-pot-1.jpg", "assets/images/products/ceramic-planters/olivia-ivory-handpainted-ceramic-pot-2.jpg", "assets/images/products/ceramic-planters/olivia-ivory-handpainted-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Olivia Ivory Handpainted Ceramic Pot",
        rating: "4.6",
        review_count: "91",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-OLIVIA-I-01",
                "priceINR": 84900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-OLIVIA-I-02",
                "priceINR": 119900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Roma Ceramic Pot",
      handle: "roma-ceramic-pot",
      description: "Introducing the exquisite Roma Pot, a stunning ceramic masterpiece inspired by the timeless beauty of old Roman architecture. Reminiscent of majestic pillars, this unique pot brings an air of elegance and grandeur to your indoor or outdoor space. Crafted with meticulous attention to detail, the Roma Pot showcases a design that pays homage to the classical aesthetics of ancient Rome. Its cylindrical shape, adorned with intricate patterns and textured details, evokes a sense of history and sophistication. Made from high-quality ceramic, this pot combines durability with refined craftsmanship. Its sturdy construction ensures long-lasting performance, while the smooth glazed finish adds a touch of luxury. It is built to withstand the test of time , making it an ideal choice for both interior and exterior environments.",
      categoryHandle: "terracotta-pots",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["4 Inch / White", "4 Inch / Grey", "4 Inch / Magenta", "4 Inch / Carton Brown"],
      thumbnail: "assets/images/products/terracotta-pots/roma-ceramic-pot-1.jpg",
      images: ["assets/images/products/terracotta-pots/roma-ceramic-pot-1.jpg", "assets/images/products/terracotta-pots/roma-ceramic-pot-2.jpg", "assets/images/products/terracotta-pots/roma-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Roma Ceramic Pot",
        rating: "4.7",
        review_count: "88",
      },
      variants: [
        {
                "title": "4 Inch / White",
                "sku": "GLR-ROMA-CER-01",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / White"
        },
        {
                "title": "4 Inch / Grey",
                "sku": "GLR-ROMA-CER-02",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / Grey"
        },
        {
                "title": "4 Inch / Magenta",
                "sku": "GLR-ROMA-CER-03",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / Magenta"
        },
        {
                "title": "4 Inch / Carton Brown",
                "sku": "GLR-ROMA-CER-04",
                "priceINR": 29900,
                "stockQuantity": 80,
                "optionValue": "4 Inch / Carton Brown"
        }
],
    },
    {
      title: "Orbit Wooden Planter - Set of 2",
      handle: "orbit-wooden-planter-set-of-2",
      description: "The Set of 2 of these Orbit Wooden Planters are everything you want - sleek, modern, and aesthetic. They add an elegant charm to any space and every plant. With intricately carved designs, they are resistant to weathering and are thus durable and lasting!",
      categoryHandle: "terracotta-pots",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/terracotta-pots/orbit-wooden-planter-set-of-2-1.jpg",
      images: ["assets/images/products/terracotta-pots/orbit-wooden-planter-set-of-2-1.jpg", "assets/images/products/terracotta-pots/orbit-wooden-planter-set-of-2-2.jpg", "assets/images/products/terracotta-pots/orbit-wooden-planter-set-of-2-3.jpg"],
      metadata: {
        botanical_name: "Orbit Wooden Planter - Set of 2",
        rating: "4.9",
        review_count: "54",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-ORBIT-WO-01",
                "priceINR": 139900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Shells Sage Ceramic Pot",
      handle: "shells-sage-ceramic-pot",
      description: "Inspired by the beauty of India’s coastlines, Shell Sage brings a little of the ocean’s charm into your home. Overlapping scallops fan out across the surface, each one finely veined like a leaf, while the glossy sage crackle glaze settles into every groove, highlighting the intricate texture. The layered pattern recalls seashells washed ashore along India’s shores, from the tranquil beaches of Konkan to the tropical coastlines of Kerala. Its soft green hue and sculptural design lend a quiet elegance to your space, whether styled with natural wood, woven textures or lush greenery. Crafted from high-fired ceramic, this pot looks lovely on a console, desk or bedside table. A distinctive home for your plants, inspired by the beauty of the Indian coast. Why You Will Love It The raised shell pattern catches the light, so it looks different at every hour of the day. Sage green is calm enough to sit beside wood., linen, cane, and white walls. The texture adds depth to a room without adding colour or clutter. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "terracotta-pots",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/terracotta-pots/shells-sage-ceramic-pot-1.jpg",
      images: ["assets/images/products/terracotta-pots/shells-sage-ceramic-pot-1.jpg", "assets/images/products/terracotta-pots/shells-sage-ceramic-pot-2.jpg", "assets/images/products/terracotta-pots/shells-sage-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Shells Sage Ceramic Pot",
        rating: "4.6",
        review_count: "20",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-SHELLS-S-01",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-SHELLS-S-02",
                "priceINR": 99900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Petals Ivory Handpainted Ceramic Pot",
      handle: "petals-ivory-handpainted-ceramic-pot",
      description: "Somewhere between a blooming garden and a little work of art, the Petals Ivory finds its charm. The folk-art design, with bold petals and delicate dotted details, has a personality all its own. Every stroke is painted by hand onto a glossy ivory glaze, and the fine crackle gives it the hush of old pottery. Its earthy palette suits any bohemian, eclectic or understated Indian space, adding colour without taking over. Style it on a console or windowsill, or let it brighten a quiet corner of your home. Made from high-fired ceramic, the Petals Ivory pairs artistic detail with the timeless appeal of ceramic. Why You Will Love It Bold blooms and leafy motifs give these pots a distinctive look that feels full of personality. The folk-art motifs are painted by hand, so every pot has its own brushwork. The colours come together beautifully to add warmth without overpowering your decor. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "terracotta-pots",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/terracotta-pots/petals-ivory-handpainted-ceramic-pot-1.jpg",
      images: ["assets/images/products/terracotta-pots/petals-ivory-handpainted-ceramic-pot-1.jpg", "assets/images/products/terracotta-pots/petals-ivory-handpainted-ceramic-pot-2.jpg", "assets/images/products/terracotta-pots/petals-ivory-handpainted-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Petals Ivory Handpainted Ceramic Pot",
        rating: "4.7",
        review_count: "95",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-PETALS-I-01",
                "priceINR": 84900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-PETALS-I-02",
                "priceINR": 119900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Olivia Ivory Handpainted Ceramic Pot",
      handle: "olivia-ivory-handpainted-ceramic-pot",
      description: "Inspired by the beauty of nature, the Olivia Ivory brings a touch of botanical charm to your home. Sage-green leaves and deep brown olives wind across a warm ivory glaze, each detail hand-painted, while the delicate crackle finish lends it an old-world appeal. Its leafy patterns evoke the charm of traditional Indian botanical motifs, reminiscent of hand-painted pottery and nature-inspired designs found in Indian homes. The understated ivory base and earthy greens make it an easy fit for everything from rustic corners and cosy balconies to contemporary living spaces. Crafted from high-fired ceramic with a glossy glaze, this pot brings together timeless design and everyday elegance. A beautiful way to give your plants a home while adding a thoughtful decorative touch to your space. Why You Will Love It The branch wraps around the pot, so it looks good from every angle. Muted green and brown on ivory is calm enough for any room, boho or minimal. Every branch is hand-painted, so each pot has its own brushwork. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "terracotta-pots",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/terracotta-pots/olivia-ivory-handpainted-ceramic-pot-1.jpg",
      images: ["assets/images/products/terracotta-pots/olivia-ivory-handpainted-ceramic-pot-1.jpg", "assets/images/products/terracotta-pots/olivia-ivory-handpainted-ceramic-pot-2.jpg", "assets/images/products/terracotta-pots/olivia-ivory-handpainted-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Olivia Ivory Handpainted Ceramic Pot",
        rating: "4.8",
        review_count: "43",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-OLIVIA-I-01",
                "priceINR": 84900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-OLIVIA-I-02",
                "priceINR": 119900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Indigo Ivory Handpainted Ceramic Pot",
      handle: "indigo-ivory-handpainted-ceramic-pot",
      description: "The Indigo Ivory brings together deep blue blooms, delicate leafy trails, and a warm ivory canvas, creating a look that feels both artistic and effortlessly at home. The hand-painted florals have a lovely, almost heritage-inspired charm, reminiscent of traditional Indian artistry reimagined for modern spaces. It is the kind of design that brings a hint of bohemian character to your decor. Place it on a windowsill, a console or a quiet corner, and it brings a touch of handcrafted charm wherever it sits. Crafted from high-fired ceramic with a glossy finish, this pot brings lasting style and artistic detail. Why You Will Love It The hand-painted indigo blooms and leafy details bring an artistic, heritage-inspired feel to your plant display. The timeless colour combination adds character without overwhelming your existing decor. Indigo and ivory sit easily next to white walls, cane, wood and terracotta, adding colour. Comes with soft rubber pads for scratch-free surfaces.",
      categoryHandle: "terracotta-pots",
      collectionHandle: "planters-pots",
      optionTitle: "Option",
      optionValues: ["Small", "Medium"],
      thumbnail: "assets/images/products/terracotta-pots/indigo-ivory-handpainted-ceramic-pot-1.jpg",
      images: ["assets/images/products/terracotta-pots/indigo-ivory-handpainted-ceramic-pot-1.jpg", "assets/images/products/terracotta-pots/indigo-ivory-handpainted-ceramic-pot-2.jpg", "assets/images/products/terracotta-pots/indigo-ivory-handpainted-ceramic-pot-3.jpg"],
      metadata: {
        botanical_name: "Indigo Ivory Handpainted Ceramic Pot",
        rating: "4.8",
        review_count: "83",
      },
      variants: [
        {
                "title": "Small",
                "sku": "GLR-INDIGO-I-01",
                "priceINR": 84900,
                "stockQuantity": 80,
                "optionValue": "Small"
        },
        {
                "title": "Medium",
                "sku": "GLR-INDIGO-I-02",
                "priceINR": 119900,
                "stockQuantity": 80,
                "optionValue": "Medium"
        }
],
    },
    {
      title: "Pot-O-Mix - 5 Kg Potting Mix",
      handle: "pot-o-mix-5-kg-potting-mix",
      description: "GLOROV Pot-O-Mix is ready to use potting mix for all your ornamental and flowering plants. This highly enriched soil-less mix ensures optimum growth and protects the plants from pest infestations. It is lightweight and hence can be used in all types of pots and vertical gardens too.",
      categoryHandle: "potting-mix-fertilizers",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg",
      images: ["assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg", "assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-2.jpg", "assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-3.jpg"],
      metadata: {
        botanical_name: "Pot-O-Mix - 5 Kg Potting Mix",
        rating: "4.9",
        review_count: "90",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-POT-O-MI-01",
                "priceINR": 37900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Garden Soil Mix",
      handle: "garden-soil-mix-5-kg",
      description: "This soil mix is an excellent blend of nutrient-rich red soil and cow manure. The mixture can be readily used by both urban and commercial growers. Completely organic in nature it can be utilized for ornamental, vegetable or flowering plants with ease. Use it directly from the packet for a majority of indoor plants or mix it with perlite or GLOROV's Pot-O-Mix to make it more well-draining for succulent varieties and drought resistant plants.",
      categoryHandle: "potting-mix-fertilizers",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["5 KG", "10 KG"],
      thumbnail: "assets/images/products/potting-mix-fertilizers/garden-soil-mix-5-kg-1.jpg",
      images: ["assets/images/products/potting-mix-fertilizers/garden-soil-mix-5-kg-1.jpg", "assets/images/products/potting-mix-fertilizers/garden-soil-mix-5-kg-2.jpg", "assets/images/products/potting-mix-fertilizers/garden-soil-mix-5-kg-3.jpg"],
      metadata: {
        botanical_name: "Garden Soil Mix",
        rating: "4.9",
        review_count: "75",
      },
      variants: [
        {
                "title": "5 KG",
                "sku": "GLR-GARDEN-S-01",
                "priceINR": 34900,
                "stockQuantity": 80,
                "optionValue": "5 KG"
        },
        {
                "title": "10 KG",
                "sku": "GLR-GARDEN-S-02",
                "priceINR": 64900,
                "stockQuantity": 80,
                "optionValue": "10 KG"
        }
],
    },
    {
      title: "Cocopeat Block",
      handle: "cocopeat-block-5-kg",
      description: "Made of the inner fibres of coconut, coco peat is light weight, well draining and retains moisture for longer without getting water logged. Naturally anti-fungal, it is essential in healthy potting mixes. Excellent for soil aeration and seed germination as the loose structure allows for easy root development. Coco Brick is an excellent growing medium for soil mixes.",
      categoryHandle: "potting-mix-fertilizers",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["1 KG", "5 KG", "10 KG"],
      thumbnail: "assets/images/products/potting-mix-fertilizers/cocopeat-block-5-kg-1.jpg",
      images: ["assets/images/products/potting-mix-fertilizers/cocopeat-block-5-kg-1.jpg", "assets/images/products/potting-mix-fertilizers/cocopeat-block-5-kg-2.jpg", "assets/images/products/potting-mix-fertilizers/cocopeat-block-5-kg-3.jpg"],
      metadata: {
        botanical_name: "Cocopeat Block",
        rating: "4.8",
        review_count: "65",
      },
      variants: [
        {
                "title": "1 KG",
                "sku": "GLR-COCOPEAT-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "1 KG"
        },
        {
                "title": "5 KG",
                "sku": "GLR-COCOPEAT-02",
                "priceINR": 39900,
                "stockQuantity": 80,
                "optionValue": "5 KG"
        },
        {
                "title": "10 KG",
                "sku": "GLR-COCOPEAT-03",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "10 KG"
        }
],
    },
    {
      title: "Cow Manure",
      handle: "cow-manure-5-kg",
      description: "GLOROV Cow Manure is an excellent fertilizer highly rich with organic matter and helps to improve aeration and break up compact soils. It is developed from composted cow dung of the Indian Desi cow and is incredibly rich with beneficial bacteria that convert soil nutrients into readily available forms for the tender plant.",
      categoryHandle: "potting-mix-fertilizers",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["1 KG", "5 KG", "10 KG"],
      thumbnail: "assets/images/products/potting-mix-fertilizers/cow-manure-5-kg-1.jpg",
      images: ["assets/images/products/potting-mix-fertilizers/cow-manure-5-kg-1.jpg", "assets/images/products/potting-mix-fertilizers/cow-manure-5-kg-2.jpg", "assets/images/products/potting-mix-fertilizers/cow-manure-5-kg-3.jpg"],
      metadata: {
        botanical_name: "Cow Manure",
        rating: "4.8",
        review_count: "41",
      },
      variants: [
        {
                "title": "1 KG",
                "sku": "GLR-COW-MANU-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "1 KG"
        },
        {
                "title": "5 KG",
                "sku": "GLR-COW-MANU-02",
                "priceINR": 36900,
                "stockQuantity": 80,
                "optionValue": "5 KG"
        },
        {
                "title": "10 KG",
                "sku": "GLR-COW-MANU-03",
                "priceINR": 64900,
                "stockQuantity": 80,
                "optionValue": "10 KG"
        }
],
    },
    {
      title: "Organic Veggie Mix - 5 Kg",
      handle: "organic-veggie-mix-5-kg",
      description: "GLOROV Organic Veggie Mix is the best-growing medium for all vegetable and herb growers. It is ready to use a mixture that can be applied directly to the containers where you wish to grow your vegetables and herbs. It is a soil-less organic blend of peat moss, cocopeat, neem powder and organic manure.",
      categoryHandle: "potting-mix-fertilizers",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/potting-mix-fertilizers/organic-veggie-mix-5-kg-1.jpg",
      images: ["assets/images/products/potting-mix-fertilizers/organic-veggie-mix-5-kg-1.jpg", "assets/images/products/potting-mix-fertilizers/organic-veggie-mix-5-kg-2.jpg", "assets/images/products/potting-mix-fertilizers/organic-veggie-mix-5-kg-3.jpg"],
      metadata: {
        botanical_name: "Organic Veggie Mix - 5 Kg",
        rating: "4.9",
        review_count: "87",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-ORGANIC--01",
                "priceINR": 36900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Garden Red Soil",
      handle: "garden-red-soil",
      description: "Revitalize your garden and give your plants the nourishment they need with our premium Red Soil in a convenient 5 KG package. Sourced from the finest natural deposits, our Red Soil is rich in essential minerals and nutrients, making it the perfect choice for all your gardening needs. Its vibrant red hue not only adds a touch of beauty to your garden but also signifies the high iron content, which promotes healthy plant growth and development. Whether you're a seasoned gardener or a beginner, our Red Soil is the ideal foundation for cultivating thriving and flourishing plants.",
      categoryHandle: "potting-mix-fertilizers",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["1 KG", "5 KG"],
      thumbnail: "assets/images/products/potting-mix-fertilizers/garden-red-soil-1.jpg",
      images: ["assets/images/products/potting-mix-fertilizers/garden-red-soil-1.jpg", "assets/images/products/potting-mix-fertilizers/garden-red-soil-2.jpg", "assets/images/products/potting-mix-fertilizers/garden-red-soil-3.jpg"],
      metadata: {
        botanical_name: "Garden Red Soil",
        rating: "4.8",
        review_count: "82",
      },
      variants: [
        {
                "title": "1 KG",
                "sku": "GLR-GARDEN-R-01",
                "priceINR": 19900,
                "stockQuantity": 80,
                "optionValue": "1 KG"
        },
        {
                "title": "5 KG",
                "sku": "GLR-GARDEN-R-02",
                "priceINR": 34900,
                "stockQuantity": 80,
                "optionValue": "5 KG"
        }
],
    },
    {
      title: "Garden Rake With Long Handle - 4 ft",
      handle: "garden-rake-with-long-handle-12-teeth-4-ft",
      description: "The GLOROV Garden Rake has a heavy-duty steel head that covers ground quickly - clearing leaves, breaking compacted soil, levelling beds before sowing, and pulling out surface weeds in one clean pass. It comes in two sizes: the 12-teeth rake suits raised beds, kitchen gardens and tighter spaces where you need more control, while the 14-teeth rake covers a wider area per stroke, making it ideal for lawns and larger beds. The 4 ft handle means you work upright, without hunching, and the ergonomic grip keeps your hands comfortable through longer sessions. The steel head is rust-resistant and built to hold its shape under pressure. The most common failure point in cheaper rakes is a head that bends after a few uses. This one doesn't. Use for: Leaf clearing, soil loosening, bed levelling, weed removal, thatch raking, mulch spreading. Works in: Home gardens, terrace gardens, kitchen gardens, lawns, and raised beds. Which one should you pick? 12 teeth: Best for compact spaces, raised beds and precise work around plants. 14 teeth: Best for open lawns and larger beds where you want to cover more ground faster. Key specifications: Teeth: 12 or 14 (available in both variants) Handle length: 4 ft (approx. 120 cm) Head material: Heavy-duty steel Grip: Ergonomic, comfort handle Finish: Rust-resistant",
      categoryHandle: "gardening-tools",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["12 Teeth", "14 Teeth"],
      thumbnail: "assets/images/products/gardening-tools/garden-rake-with-long-handle-12-teeth-4-ft-1.jpg",
      images: ["assets/images/products/gardening-tools/garden-rake-with-long-handle-12-teeth-4-ft-1.jpg", "assets/images/products/gardening-tools/garden-rake-with-long-handle-12-teeth-4-ft-2.jpg", "assets/images/products/gardening-tools/garden-rake-with-long-handle-12-teeth-4-ft-3.jpg"],
      metadata: {
        botanical_name: "Garden Rake With Long Handle - 4 ft",
        rating: "4.8",
        review_count: "70",
      },
      variants: [
        {
                "title": "12 Teeth",
                "sku": "GLR-GARDEN-R-01",
                "priceINR": 69900,
                "stockQuantity": 80,
                "optionValue": "12 Teeth"
        },
        {
                "title": "14 Teeth",
                "sku": "GLR-GARDEN-R-02",
                "priceINR": 74900,
                "stockQuantity": 80,
                "optionValue": "14 Teeth"
        }
],
    },
    {
      title: "Heavy Duty Anvil Pruner",
      handle: "heavy-duty-anvil-pruner",
      description: "The GLOROV Heavy Duty Anvil Pruner features a hardened steel blade that is used to remove thicker stems and branches along with solid steel handle with a plastic grip for a powerful and comfortable hold. It is ideal for pruning stems and dry, woody branches.",
      categoryHandle: "gardening-tools",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/gardening-tools/heavy-duty-anvil-pruner-1.jpg",
      images: ["assets/images/products/gardening-tools/heavy-duty-anvil-pruner-1.jpg", "assets/images/products/gardening-tools/heavy-duty-anvil-pruner-2.jpg", "assets/images/products/gardening-tools/heavy-duty-anvil-pruner-3.jpg"],
      metadata: {
        botanical_name: "Heavy Duty Anvil Pruner",
        rating: "4.7",
        review_count: "81",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-HEAVY-DU-01",
                "priceINR": 44900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Mungooz Electric Lawn Mower 16 in.",
      handle: "mungooz-electric-lawn-mower-16-in-1800w",
      description: "The Mungooz Electric Lawn Mower makes lawn care simple. It’s lightweight and easy to use, so it does the hard work for you. With powerful performance in a lightweight design, it’s a more sustainable option than petrol or diesel mowers. It’s easy enough for people of all ages, including women, to operate comfortably. You can adjust the cutting height with a single lever, while the 47L grass catcher makes collecting clippings easy and lets you mow for longer without frequent emptying. It’s safe to use in the morning, even with a bit of morning dew. No problem, it handles that too. It folds up for easy storage and comes with a 1-year warranty. No petrol, no hassle, just easy lawn care.",
      categoryHandle: "gardening-tools",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/gardening-tools/mungooz-electric-lawn-mower-16-in-1800w-1.jpg",
      images: ["assets/images/products/gardening-tools/mungooz-electric-lawn-mower-16-in-1800w-1.jpg", "assets/images/products/gardening-tools/mungooz-electric-lawn-mower-16-in-1800w-2.jpg", "assets/images/products/gardening-tools/mungooz-electric-lawn-mower-16-in-1800w-3.jpg"],
      metadata: {
        botanical_name: "Mungooz Electric Lawn Mower 16 in.",
        rating: "4.7",
        review_count: "33",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-MUNGOOZ--01",
                "priceINR": 1499900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Mini Garden Bonsai Set",
      handle: "mini-garden-bonsai-set",
      description: "Elevate your bonsai gardening experience with the GLOROV Mini Bonsai Kit, a must-have for both beginners and seasoned enthusiasts. Crafted with precision and care, this kit features premium steel and bamboo tools designed for every essential task. The bamboo rake effortlessly prepares the soil, ensuring the perfect foundation for your miniature masterpiece, while the small and wide spades guarantee successful repotting with ease. Embrace the art of plant cultivation with precision, thanks to GLOROV's commitment to quality and excellence. Get your GLOROV Mini Bonsai Kit today and unlock the secrets to nurturing thriving bonsai trees with finesse and expertise.",
      categoryHandle: "gardening-tools",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/gardening-tools/mini-garden-bonsai-set-1.jpg",
      images: ["assets/images/products/gardening-tools/mini-garden-bonsai-set-1.jpg", "assets/images/products/gardening-tools/mini-garden-bonsai-set-2.jpg", "assets/images/products/gardening-tools/mini-garden-bonsai-set-3.jpg"],
      metadata: {
        botanical_name: "Mini Garden Bonsai Set",
        rating: "4.7",
        review_count: "26",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-MINI-GAR-01",
                "priceINR": 39900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Mungooz Edgemaster Tree Pruner",
      handle: "edgemaster-tree-pruner",
      description: "Reach high branches from the ground with the Mungooz Edgemaster Tree Pruner. Its 2-in-1 head has a scissor-like cutter for smaller twigs and a 65Mn steel saw for thicker branches. Simply pull the cord to activate the double-pulley system, which helps you use about 30% less effort. The metal sleeve attaches securely to an extension pole, keeping the tool steady as you work. Backed by a 5-year warranty. Pole sold separately.",
      categoryHandle: "gardening-tools",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/gardening-tools/edgemaster-tree-pruner-1.jpg",
      images: ["assets/images/products/gardening-tools/edgemaster-tree-pruner-1.jpg", "assets/images/products/gardening-tools/edgemaster-tree-pruner-2.jpg", "assets/images/products/gardening-tools/edgemaster-tree-pruner-3.jpg"],
      metadata: {
        botanical_name: "Mungooz Edgemaster Tree Pruner",
        rating: "4.6",
        review_count: "81",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-EDGEMAST-01",
                "priceINR": 124900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
    {
      title: "Transplanter with PVC Handle",
      handle: "transplanter-with-pvc-handle",
      description: "This Transplanter features a PVC handle that provides extra protection and control when digging and planting in the garden. The tool head is made up of powder-coated steel for lasting durability. The head also features depth gauge markings for accurate planting.",
      categoryHandle: "gardening-tools",
      collectionHandle: "plant-care-soil",
      optionTitle: "Option",
      optionValues: ["Standard Pack"],
      thumbnail: "assets/images/products/gardening-tools/transplanter-with-pvc-handle-1.jpg",
      images: ["assets/images/products/gardening-tools/transplanter-with-pvc-handle-1.jpg"],
      metadata: {
        botanical_name: "Transplanter with PVC Handle",
        rating: "4.8",
        review_count: "80",
      },
      variants: [
        {
                "title": "Standard Pack",
                "sku": "GLR-TRANSPLA-01",
                "priceINR": 21900,
                "stockQuantity": 80,
                "optionValue": "Standard Pack"
        }
],
    },
  ];

  // 7. Seed each product
  for (const prodInput of productsToSeed) {
    const { data: existingProds } = await query.graph({
      entity: "product",
      fields: ["id", "handle"],
      filters: { handle: prodInput.handle },
    });

    if (existingProds.length > 0) {
      logger.info(`Product "${prodInput.title}" (${prodInput.handle}) already exists. Skipping.`);
      continue;
    }

    const catId = categoryMap[prodInput.categoryHandle];
    const collId = collectionMap[prodInput.collectionHandle];

    const {
      result: [createdProduct],
    } = await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: prodInput.title,
            handle: prodInput.handle,
            description: prodInput.description,
            status: "published" as const,
            thumbnail: prodInput.thumbnail,
            images: prodInput.images.map((url) => ({ url })),
            category_ids: catId ? [catId] : [],
            collection_id: collId || undefined,
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

    // Link inventory items and stock levels
    const { data: queriedProduct } = await query.graph({
      entity: "product",
      fields: ["id", "variants.*"],
      filters: { id: createdProduct.id },
    });

    for (const variant of queriedProduct[0].variants) {
      const vInput = prodInput.variants.find((v) => v.sku === variant.sku);
      const targetStock = vInput?.stockQuantity ?? 50;

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

      // Link variant to inventory
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

      // Set inventory level at Pune Central Nursery Hub
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
    }
  }

  // Ensure default shipping profile link
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
    }
  } catch {}

  logger.info("🎉 66 Botanical Products sown and inventory synced successfully!");
}
