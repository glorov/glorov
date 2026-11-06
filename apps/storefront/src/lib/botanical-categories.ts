/**
 * GLOROV Botanical Categories Data Model
 *
 * Clean botanical categories representing GLOROV's core collections:
 * - For You (Curated botanical overview)
 * - Seeds (Desi heirloom vegetable, flower & herb seeds)
 * - Vegetables (Heirloom vegetable seeds & balcony greens)
 * - Living Plants (Indoor foliage, air-purifying, flowering & succulents)
 * - Flowers (Flower seeds & flowering house plants)
 * - Herbs (Culinary herb seeds & fresh wellness botanicals)
 */

export interface BotanicalSubCategory {
  title: string
  handle: string
  image: string
  description?: string
  count: number
}

export interface BotanicalProductLaunch {
  title: string
  handle: string
  image: string
  tag: 'BUY NOW' | 'NEW LAUNCH' | 'SALE IS LIVE' | string
  price?: number
}

export interface BotanicalCategoryModel {
  id: string
  title: string
  handle: string
  description: string
  image: string
  badge: string
  count: number
  subCategories: BotanicalSubCategory[]
  launches: BotanicalProductLaunch[]
}

export const GLOROV_BOTANICAL_CATEGORIES: BotanicalCategoryModel[] = [
  // 1. For You (Curated Overview)
  {
    id: 'cat-for-you',
    title: 'For You',
    handle: 'for-you',
    badge: 'Curated',
    count: 44,
    description:
      'Personalized selection of fresh nursery arrivals, high-germination Desi seeds, and air-purifying houseplants.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    subCategories: [
      {
        title: 'Vegetable Seeds',
        handle: 'vegetables',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 8,
      },
      {
        title: 'Indoor Plants',
        handle: 'live-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
        count: 6,
      },
      {
        title: 'Flower Seeds',
        handle: 'flowers',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        count: 6,
      },
      {
        title: 'Air-Purifying',
        handle: 'live-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516564/glorov/products/air-purifying-plants/peace-lily-plant-1.jpg',
        count: 6,
      },
      {
        title: 'Herb Seeds',
        handle: 'herbs',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        count: 6,
      },
      {
        title: 'Flowering Plants',
        handle: 'flowers',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516572/glorov/products/flowering-plants/peace-lily-plant-1.jpg',
        count: 6,
      },
    ],
    launches: [
      {
        title: 'Brinjal Banarasi Giant Seeds',
        handle: 'brinjal-banarshi-giant-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 99.0,
      },
      {
        title: 'Marigold African Double Seeds',
        handle: 'marigold-african-double-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        tag: 'NEW LAUNCH',
        price: 79.0,
      },
      {
        title: 'Golden Money Plant',
        handle: 'money-plant-golden',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
        tag: 'BUY NOW',
        price: 249.0,
      },
      {
        title: 'Peace Lily Plant',
        handle: 'peace-lily-plant',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516564/glorov/products/air-purifying-plants/peace-lily-plant-1.jpg',
        tag: 'SALE IS LIVE',
        price: 299.0,
      },
      {
        title: 'Italian Basil Seeds',
        handle: 'italian-basil-1000-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      },
      {
        title: 'Miniature Jade Plant',
        handle: 'jade-plant-mini',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/succulents-bonsai/jade-plant-mini-1.jpg',
        tag: 'BUY NOW',
        price: 199.0,
      },
    ],
  },

  // 2. Seeds (Main Root Category)
  {
    id: 'pcat_01M5TXG1A4901RXMESXHDGHWDS',
    title: 'Seeds',
    handle: 'seeds',
    badge: '98% Germination',
    count: 20,
    description:
      'High-germination tested indigenous Desi heirloom vegetable, flowering, and culinary herb seeds.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    subCategories: [
      {
        title: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 8,
        description:
          'Indigenous high-yield heirloom brinjal, cabbage, moringa, watermelon, and seasonal greens.',
      },
      {
        title: 'Flower Seeds',
        handle: 'flower-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        count: 6,
        description:
          'Vibrant marigold, petunia, dahlia, cosmos, and pollinator-friendly garden blooms.',
      },
      {
        title: 'Herb Seeds',
        handle: 'herb-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        count: 6,
        description:
          'Italian basil, holy tulsi, rocket arugula, parsley, and culinary wellness herbs.',
      },
    ],
    launches: [
      {
        title: 'Brinjal Banarasi Giant Seeds',
        handle: 'brinjal-banarshi-giant-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 99.0,
      },
      {
        title: 'Marigold African Double Seeds',
        handle: 'marigold-african-double-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        tag: 'NEW LAUNCH',
        price: 79.0,
      },
      {
        title: 'Italian Basil Seeds',
        handle: 'italian-basil-1000-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      },
      {
        title: 'Dahlia Seeds',
        handle: 'dahlia-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571741/glorov/products/flower-seeds/dahlia-seeds-1.jpg',
        tag: 'SALE IS LIVE',
        price: 99.0,
      },
      {
        title: 'Chinese Cabbage Seeds',
        handle: 'chinese-cabbage-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571728/glorov/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 119.0,
      },
    ],
  },

  // 3. Vegetables
  {
    id: 'pcat_vegetables_root',
    title: 'Vegetables',
    handle: 'vegetables',
    badge: 'Desi Heirloom',
    count: 8,
    description:
      'Pure non-GMO indigenous Indian vegetable seeds conditioned for terrace pots, kitchen gardens and grow bags.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571728/glorov/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
    subCategories: [
      {
        title: 'Heirloom Seeds',
        handle: 'vegetable-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 8,
        description:
          'Traditional open-pollinated Desi vegetable seeds with rich flavor and vigorous natural immunity.',
      },
      {
        title: 'Greens & Salads',
        handle: 'vegetable-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571728/glorov/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
        count: 4,
        description:
          'Fresh quick-harvest salad greens, leafy Chinese cabbage, and tender spring onions.',
      },
      {
        title: 'Kitchen Classics',
        handle: 'vegetable-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571731/glorov/products/vegetable-seeds/green-chilli-seeds-1.jpg',
        count: 4,
        description:
          'Essential Indian culinary staples: pungent green chillies, moringa drumsticks, and juicy tomatoes.',
      },
    ],
    launches: [
      {
        title: 'Brinjal Banarasi Giant Seeds',
        handle: 'brinjal-banarshi-giant-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 99.0,
      },
      {
        title: 'Green Chilli Seeds',
        handle: 'green-chilli-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571731/glorov/products/vegetable-seeds/green-chilli-seeds-1.jpg',
        tag: 'SALE IS LIVE',
        price: 79.0,
      },
      {
        title: 'Drumstick Seeds Moringa',
        handle: 'drumstick-seeds-moringa',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571730/glorov/products/vegetable-seeds/drumstick-seeds-moringa-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      },
      {
        title: 'Chinese Cabbage Seeds',
        handle: 'chinese-cabbage-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571728/glorov/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 119.0,
      },
    ],
  },

  // 4. Living Plants
  {
    id: 'pcat_01M5TXG1AEPW6JPNWC2VNGH22D',
    title: 'Living Plants',
    handle: 'live-plants',
    badge: 'Nursery Dispatched',
    count: 24,
    description:
      'Root-safe nursery dispatched indoor, air-purifying, and flowering live botanical specimens.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
    subCategories: [
      {
        title: 'Indoor Plants',
        handle: 'indoor-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
        count: 6,
        description:
          'Low-light resilient foliage plants including Money Plant Golden, Aglaonema, and ZZ Plant.',
      },
      {
        title: 'Air-Purifying Plants',
        handle: 'air-purifying-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516564/glorov/products/air-purifying-plants/peace-lily-plant-1.jpg',
        count: 6,
        description:
          'NASA-evaluated clean air plants including Peace Lily, China Doll, and Pink Beauty.',
      },
      {
        title: 'Flowering Plants',
        handle: 'flowering-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516572/glorov/products/flowering-plants/peace-lily-plant-1.jpg',
        count: 6,
        description:
          'Ornamental blooming plants including Peace Lily, Anthurium Red, and Marigold Flowering.',
      },
      {
        title: 'Succulents & Bonsai',
        handle: 'succulents-bonsai',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/succulents-bonsai/jade-plant-mini-1.jpg',
        count: 6,
        description:
          'Compact drought-tolerant jade succulents, Sansevieria Laurentii, and Zeylanica.',
      },
    ],
    launches: [
      {
        title: 'Golden Money Plant',
        handle: 'money-plant-golden',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
        tag: 'BUY NOW',
        price: 249.0,
      },
      {
        title: 'Peace Lily Plant',
        handle: 'peace-lily-plant',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516564/glorov/products/air-purifying-plants/peace-lily-plant-1.jpg',
        tag: 'SALE IS LIVE',
        price: 299.0,
      },
      {
        title: 'Miniature Jade Plant',
        handle: 'jade-plant-mini',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/succulents-bonsai/jade-plant-mini-1.jpg',
        tag: 'NEW LAUNCH',
        price: 199.0,
      },
      {
        title: 'Areca Palm Plant XL',
        handle: 'areca-palm-plant-xl',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516578/glorov/products/indoor-plants/areca-palm-plant-xl-1.jpg',
        tag: 'BUY NOW',
        price: 499.0,
      },
    ],
  },

  // 5. Flowers
  {
    id: 'pcat_flowers_root',
    title: 'Flowers',
    handle: 'flowers',
    badge: 'Seasonal Bloom',
    count: 12,
    description:
      'Vibrant seasonal flower seeds and healthy blooming live indoor plants for vibrant patios and living spaces.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
    subCategories: [
      {
        title: 'Flower Seeds',
        handle: 'flower-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        count: 6,
        description:
          'Heirloom marigold, petunia, dahlia, cosmos, and pollinator-friendly flower varieties.',
      },
      {
        title: 'Flowering Plants',
        handle: 'flowering-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516572/glorov/products/flowering-plants/peace-lily-plant-1.jpg',
        count: 6,
        description:
          'Nursery-potted live flowering plants including exotic Anthurium Red, Peace Lily, and Blooming Petunia.',
      },
    ],
    launches: [
      {
        title: 'Marigold African Double Seeds',
        handle: 'marigold-african-double-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        tag: 'NEW LAUNCH',
        price: 79.0,
      },
      {
        title: 'Dahlia Seeds',
        handle: 'dahlia-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571741/glorov/products/flower-seeds/dahlia-seeds-1.jpg',
        tag: 'SALE IS LIVE',
        price: 99.0,
      },
      {
        title: 'Anthurium Red Plant',
        handle: 'anthurium-red-plant',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516572/glorov/products/flowering-plants/peace-lily-plant-1.jpg',
        tag: 'BUY NOW',
        price: 499.0,
      },
      {
        title: 'Petunia Mix Seeds',
        handle: 'petunia-mix-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571744/glorov/products/flower-seeds/petunia-mix-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      },
    ],
  },

  // 6. Herbs
  {
    id: 'pcat_herbs_root',
    title: 'Herbs',
    handle: 'herbs',
    badge: 'Aromatic & Pure',
    count: 6,
    description:
      'Kitchen herb seeds and restorative wellness plants for fresh home-cooked flavor and botanical wellness.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
    subCategories: [
      {
        title: 'Herb Seeds',
        handle: 'herb-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        count: 6,
        description:
          'High-germination Italian basil, holy tulsi, rocket arugula, parsley, oregano, and thyme.',
      },
      {
        title: 'Medicinal Plants',
        handle: 'herb-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571750/glorov/products/herb-seeds/tulsi-seeds-holy-basil-1.jpg',
        count: 3,
        description:
          'Ayurvedic holy tulsi, cooling spearmint, and immune-supporting therapeutic botanicals.',
      },
    ],
    launches: [
      {
        title: 'Italian Basil Seeds',
        handle: 'italian-basil-1000-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      },
      {
        title: 'Holy Tulsi Seeds',
        handle: 'tulsi-seeds-holy-basil',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571750/glorov/products/herb-seeds/tulsi-seeds-holy-basil-1.jpg',
        tag: 'BUY NOW',
        price: 69.0,
      },
      {
        title: 'Rocket Arugula Seeds',
        handle: 'arugula-seeds-rocket-leaves',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571748/glorov/products/herb-seeds/arugula-seeds-rocket-leaves-1.jpg',
        tag: 'SALE IS LIVE',
        price: 79.0,
      },
    ],
  },
]
