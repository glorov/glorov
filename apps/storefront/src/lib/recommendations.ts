/**
 * Storefront Recommendation Engine Client
 * Provides smart product suggestions for the cart drawer and cart page.
 */

export interface RecommendedProductItem {
  id: string;
  handle: string;
  title: string;
  category: 'plants' | 'seeds' | 'care';
  badge?: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  variantId: string;
  weightOrSize?: string;
}

export const FALLBACK_RECOMMENDED_PRODUCTS: RecommendedProductItem[] = [
  {
    id: 'rec_instagrow_npk',
    handle: 'instagrow-npk-19-19-19-fertilizer',
    title: 'Instagrow NPK 19:19:19 Fertilizer',
    category: 'care',
    badge: 'BESTSELLER',
    price: 169,
    compareAtPrice: 399,
    rating: 4.8,
    reviewCount: 416,
    thumbnail: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&auto=format&fit=crop&q=80',
    variantId: 'variant_01M5TY5X6NG1JSFXP50NNKS3J8',
    weightOrSize: '500 gm',
  },
  {
    id: 'rec_jade_mini_plant',
    handle: 'jade-plant-mini',
    title: 'Jade Mini Plant',
    category: 'plants',
    badge: 'BESTSELLER',
    price: 199,
    compareAtPrice: 299,
    rating: 4.8,
    reviewCount: 416,
    thumbnail: 'https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Jade_Mini_Listing-02_0d33dec3-6493-44d0-8248-e1450743b893.jpg?v=1786010277',
    variantId: 'variant_01M5Y0A2AXFJBNCEBNJ2SWQ4SV',
    weightOrSize: 'Mini Ceramic Pot',
  },
  {
    id: 'rec_peace_lily_plant',
    handle: 'peace-lily-plant',
    title: 'Peace Lily Live Plant',
    category: 'plants',
    badge: 'AIR PURIFIER',
    price: 249,
    compareAtPrice: 349,
    rating: 4.8,
    reviewCount: 70,
    thumbnail: 'https://cdn.shopify.com/s/files/1/0579/7924/0580/files/website-small-7jul-292_1_76e34228-5ca7-48ea-b42c-512bb6c3bbd1.jpg?v=1786528267',
    variantId: 'variant_01M5Y0A28RYB0MEJRG2RGS41B3',
    weightOrSize: '5-inch Pot',
  },
  {
    id: 'rec_cosmos_mix_seeds',
    handle: 'cosmos-mix-seeds',
    title: 'Cosmos Mix Seeds',
    category: 'seeds',
    badge: 'EASY BLOOMS',
    price: 99,
    compareAtPrice: 155,
    rating: 4.7,
    reviewCount: 135,
    thumbnail: 'https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Cosmos_Bright_Lights_Artboard_2.jpg?v=1788597029',
    variantId: 'variant_01M5Y0A1CZMM9W7CEH9BAVN822',
    weightOrSize: '1 gm',
  },
  {
    id: 'rec_snake_plant_golden',
    handle: 'snake-plant-golden-hahnii',
    title: 'Snake Plant Golden Hahnii',
    category: 'plants',
    badge: 'LOW LIGHT',
    price: 199,
    compareAtPrice: 299,
    rating: 4.9,
    reviewCount: 512,
    thumbnail: 'https://cdn.shopify.com/s/files/1/0579/7924/0580/files/Golden_Hahnii_Listing-02.jpg?v=1786010001',
    variantId: 'variant_01M5TY5XJ5YBJ2G7K92KKH3S2E',
    weightOrSize: '4-inch Pot',
  },
  {
    id: 'rec_organic_potting_soil',
    handle: 'organic-potting-soil-mix',
    title: 'Organic Potting Soil Mix',
    category: 'care',
    badge: 'SOIL & CARE',
    price: 149,
    compareAtPrice: 249,
    rating: 4.9,
    reviewCount: 210,
    thumbnail: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600&auto=format&fit=crop&q=80',
    variantId: 'variant_01M5TY5X6NG1JSFXP50NNKS3J8',
    weightOrSize: '2 kg Pack',
  },
];

/**
 * Fetches recommended botanical items with affinity scoring and deduplication.
 */
export async function fetchCartRecommendations(params?: {
  cartProductHandles?: string[];
  cartProductTitles?: string[];
  limit?: number;
}): Promise<RecommendedProductItem[]> {
  const handles = params?.cartProductHandles || [];
  const titles = params?.cartProductTitles || [];
  const limit = params?.limit || 6;

  try {
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000';
    const publishableKey =
      process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_STORE_PUBLISHABLE_KEY ||
      '';

    const query = new URLSearchParams();
    if (handles.length > 0) query.set('handles', handles.join(','));
    if (titles.length > 0) query.set('titles', titles.join(','));
    query.set('limit', limit.toString());

    const res = await fetch(`${backendUrl}/store/recommendations?${query.toString()}`, {
      headers: {
        'x-publishable-api-key': publishableKey,
      },
      next: { revalidate: 120 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return data.recommendations.map((item: {
          id: string;
          handle: string;
          title: string;
          category: 'plants' | 'seeds' | 'care';
          badge?: string;
          price: number;
          compare_at_price: number | null;
          rating: number;
          review_count: number;
          thumbnail: string;
          variant_id: string;
          weight_or_size?: string;
        }) => ({
          id: item.id,
          handle: item.handle,
          title: item.title,
          category: item.category,
          badge: item.badge,
          price: item.price,
          compareAtPrice: item.compare_at_price,
          rating: item.rating,
          reviewCount: item.review_count,
          thumbnail: item.thumbnail,
          variantId: item.variant_id,
          weightOrSize: item.weight_or_size,
        }));
      }
    }
  } catch {
    // Fall back to local items
  }

  // Filter out items already in the cart
  const lowerHandles = new Set(handles.map((h) => h.toLowerCase()));
  const lowerTitles = titles.map((t) => t.toLowerCase());

  const filtered = FALLBACK_RECOMMENDED_PRODUCTS.filter(
    (item) =>
      !lowerHandles.has(item.handle.toLowerCase()) &&
      !lowerTitles.some((t) => t.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(t))
  );

  return filtered.slice(0, limit);
}
