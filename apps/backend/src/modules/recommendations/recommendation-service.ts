export interface RecommendedProduct {
  id: string;
  handle: string;
  title: string;
  category: "plants" | "seeds" | "care";
  badge?: string;
  price: number;
  compare_at_price: number | null;
  discount_percent?: number;
  rating: number;
  review_count: number;
  thumbnail: string;
  variant_id: string;
  weight_or_size?: string;
  affinity_reason?: string;
}

export const CATALOG_RECOMMENDATIONS: RecommendedProduct[] = [
  {
    id: "rec_instagrow_npk",
    handle: "instagrow-npk-19-19-19-fertilizer",
    title: "Instagrow NPK 19:19:19 Fertilizer",
    category: "care",
    badge: "BESTSELLER",
    price: 169,
    compare_at_price: 399,
    discount_percent: 58,
    rating: 4.8,
    review_count: 416,
    thumbnail: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80",
    variant_id: "variant_01M5TY5X6NG1JSFXP50NNKS3J8",
    weight_or_size: "500 gm",
    affinity_reason: "Essential nutrition for leafy growth and vibrant blooms",
  },
  {
    id: "rec_jade_mini_plant",
    handle: "jade-plant-mini",
    title: "Jade Mini Plant",
    category: "plants",
    badge: "BESTSELLER",
    price: 199,
    compare_at_price: 299,
    discount_percent: 33,
    rating: 4.8,
    review_count: 416,
    thumbnail: "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-02_0d33dec3-6493-44d0-8248-e1450743b893.jpg?v=1786010277",
    variant_id: "variant_01M5Y0A2AXFJBNCEBNJ2SWQ4SV",
    weight_or_size: "Mini Pot",
    affinity_reason: "Top auspicious succulent for desk & gifting",
  },
  {
    id: "rec_peace_lily_plant",
    handle: "peace-lily-plant",
    title: "Peace Lily Air Purifying Plant",
    category: "plants",
    badge: "AIR PURIFIER",
    price: 249,
    compare_at_price: 349,
    discount_percent: 28,
    rating: 4.8,
    review_count: 70,
    thumbnail: "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-292_1_76e34228-5ca7-48ea-b42c-512bb6c3bbd1.jpg?v=1786528267",
    variant_id: "variant_01M5Y0A28RYB0MEJRG2RGS41B3",
    weight_or_size: "5-inch Grower Pot",
    affinity_reason: "NASA certified natural bedroom oxygen booster",
  },
  {
    id: "rec_cosmos_mix_seeds",
    handle: "cosmos-mix-seeds",
    title: "Cosmos Mix Seeds",
    category: "seeds",
    badge: "EASY BLOOMS",
    price: 99,
    compare_at_price: 155,
    discount_percent: 36,
    rating: 4.7,
    review_count: 135,
    thumbnail: "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Cosmos_Bright_Lights_Artboard_2.jpg?v=1788597029",
    variant_id: "variant_01M5Y0A1CZMM9W7CEH9BAVN822",
    weight_or_size: "1 gm (135 seeds)",
    affinity_reason: "Vibrant daisy-like pollinator blooms for Indian terraces",
  },
  {
    id: "rec_snake_plant_golden",
    handle: "snake-plant-golden-hahnii",
    title: "Snake Plant Golden Hahnii",
    category: "plants",
    badge: "LOW LIGHT",
    price: 199,
    compare_at_price: 299,
    discount_percent: 33,
    rating: 4.9,
    review_count: 512,
    thumbnail: "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Golden_Hahnii_Listing-02.jpg?v=1786010001",
    variant_id: "variant_01M5TY5XJ5YBJ2G7K92KKH3S2E",
    weight_or_size: "4-inch Pot",
    affinity_reason: "Indestructible indoor air purifier for beginners",
  },
  {
    id: "rec_organic_potting_soil",
    handle: "organic-potting-soil-mix",
    title: "Enriched Organic Potting Soil Mix",
    category: "care",
    badge: "NUTRIENT RICH",
    price: 149,
    compare_at_price: 249,
    discount_percent: 40,
    rating: 4.9,
    review_count: 210,
    thumbnail: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80",
    variant_id: "variant_01M5TY5X6NG1JSFXP50NNKS3J8",
    weight_or_size: "2 kg Pack",
    affinity_reason: "Sterilized ready-to-use soil with neem cake and perlite",
  },
  {
    id: "rec_marigold_seeds",
    handle: "marigold-seeds-pusa-narangi",
    title: "Marigold Seeds (Pusa Narangi)",
    category: "seeds",
    badge: "0% GST HSN 1209",
    price: 49,
    compare_at_price: 99,
    discount_percent: 50,
    rating: 4.8,
    review_count: 180,
    thumbnail: "https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Marigold_Pusa_Narangi_Artboard_2.jpg?v=1788597111",
    variant_id: "variant_01M5TY5XBZ34B05GGCQ2ZSDEES",
    weight_or_size: "50 Seeds",
    affinity_reason: "Natural pest repellent companion plant for vegetables",
  },
];

export class RecommendationService {
  /**
   * Intelligently selects recommended products for cart drawer or checkout.
   * Considers:
   * 1. Items currently in cart (avoids recommending duplicates, pairs seeds with fertilizer/soil, plants with care)
   * 2. Past orders or customer profile affinity
   * 3. Overall bestsellers
   */
  public static getCartRecommendations(options: {
    cartProductHandles?: string[];
    cartProductTitles?: string[];
    pastPurchasedCategories?: string[];
    limit?: number;
  }): RecommendedProduct[] {
    const {
      cartProductHandles = [],
      cartProductTitles = [],
      pastPurchasedCategories = [],
      limit = 6,
    } = options;

    const lowerHandles = new Set(cartProductHandles.map((h) => h.toLowerCase().trim()));
    const lowerTitles = cartProductTitles.map((t) => t.toLowerCase().trim());

    // Detect cart intent
    const hasSeeds =
      lowerTitles.some((t) => t.includes("seed") || t.includes("seeds")) ||
      cartProductHandles.some((h) => h.includes("seed") || h.includes("seeds"));

    const hasLivePlants =
      lowerTitles.some((t) => t.includes("plant") || t.includes("lily") || t.includes("jade")) ||
      cartProductHandles.some((h) => h.includes("plant") || h.includes("lily") || h.includes("jade"));

    // Filter out items already in the cart
    const candidates = CATALOG_RECOMMENDATIONS.filter(
      (item) =>
        !lowerHandles.has(item.handle.toLowerCase()) &&
        !lowerTitles.some((t) => t.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(t))
    );

    // Score candidates based on complementary value and customer affinity
    const scored = candidates.map((item) => {
      let score = 50; // Base score

      // Complementary pairings
      if (hasSeeds && item.category === "care") {
        score += 40; // Seeds need fertilizer and soil
      }
      if (hasLivePlants && item.handle === "instagrow-npk-19-19-19-fertilizer") {
        score += 35; // Live plants need NPK food
      }
      if (hasLivePlants && item.category === "plants" && item.handle === "jade-plant-mini") {
        score += 25; // Perfect companion desk plant
      }
      if (hasSeeds && item.handle === "cosmos-mix-seeds") {
        score += 20; // Additional flower seeds
      }

      // Past customer affinity boost
      if (pastPurchasedCategories.includes(item.category)) {
        score += 15;
      }

      // Review count / rating boost
      score += Math.round(item.rating * 5) + Math.min(20, Math.round(item.review_count / 25));

      // Bestseller boost
      if (item.badge === "BESTSELLER") {
        score += 10;
      }

      return { item, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((s) => s.item);
  }
}
