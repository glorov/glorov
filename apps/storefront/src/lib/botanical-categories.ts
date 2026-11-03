/**
 * GLOROV Botanical Categories Data Model
 *
 * Strictly matches Flutter's `flutter/lib/models/category_model.dart`
 * Zero unseeded items. Exactly 4 root seeded categories + "For You" curated overview.
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
    count: 66,
    description:
      'Personalized selection of fresh nursery arrivals, high-germination Desi seeds, and artisan pots.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    subCategories: [
      {
        title: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 6,
      },
      {
        title: 'Indoor Plants',
        handle: 'indoor-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
        count: 6,
      },
      {
        title: 'Flower Seeds',
        handle: 'flower-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571743/glorov/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        count: 6,
      },
      {
        title: 'Air-Purifying',
        handle: 'air-purifying-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516564/glorov/products/air-purifying-plants/peace-lily-plant-1.jpg',
        count: 6,
      },
      {
        title: 'Herb Seeds',
        handle: 'herb-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        count: 6,
      },
      {
        title: 'Ceramic Pots',
        handle: 'ceramic-planters',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516566/glorov/products/ceramic-planters/diamond-pot-1.jpg',
        count: 6,
      },
      {
        title: 'Flowering Plants',
        handle: 'flowering-plants',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516572/glorov/products/flowering-plants/peace-lily-plant-1.jpg',
        count: 6,
      },
      {
        title: 'Terracotta Pots',
        handle: 'terracotta-pots',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516586/glorov/products/terracotta-pots/roma-ceramic-pot-1.jpg',
        count: 6,
      },
      {
        title: 'Potting Mix & Fertilizers',
        handle: 'potting-mix-fertilizers',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
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
        handle: 'italian-basil-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571749/glorov/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      },
      {
        title: 'Diamond Ceramic Pot',
        handle: 'diamond-pot',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516566/glorov/products/ceramic-planters/diamond-pot-1.jpg',
        tag: 'BUY NOW',
        price: 349.0,
      },
    ],
  },

  // 2. Seeds
  {
    id: 'pcat_01M5TXG1A4901RXMESXHDGHWDS',
    title: 'Seeds',
    handle: 'seeds',
    badge: 'High Germination',
    count: 18,
    description:
      'High-germination tested indigenous Desi heirloom vegetable, flowering, and medicinal herb seeds.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    subCategories: [
      {
        title: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 6,
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
        handle: 'italian-basil-seeds',
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

  // 3. Live Plants
  {
    id: 'pcat_01M5TXG1AEPW6JPNWC2VNGH22D',
    title: 'Live Plants',
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
          'Ornamental blooming plants including Peace Lily, Aglaonema Snow White, and Red Beauty.',
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

  // 4. Planters & Pots
  {
    id: 'pcat_01M5TXG1AJDCXR6H9TZY4APJVH',
    title: 'Planters & Pots',
    handle: 'planters-pots',
    badge: 'Artisan Handcrafted',
    count: 12,
    description:
      'Eco-friendly terracotta, ceramic designer pots, and nursery planters with optimal drainage.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516566/glorov/products/ceramic-planters/diamond-pot-1.jpg',
    subCategories: [
      {
        title: 'Ceramic Planters',
        handle: 'ceramic-planters',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516566/glorov/products/ceramic-planters/diamond-pot-1.jpg',
        count: 6,
        description:
          'Premium handcrafted glazed ceramic pots with drainage holes and protective saucers.',
      },
      {
        title: 'Terracotta Pots',
        handle: 'terracotta-pots',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516586/glorov/products/terracotta-pots/roma-ceramic-pot-1.jpg',
        count: 6,
        description:
          'Breathable natural clay terracotta pots ideal for optimal root aeration.',
      },
    ],
    launches: [
      {
        title: 'Diamond Ceramic Pot',
        handle: 'diamond-pot',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516566/glorov/products/ceramic-planters/diamond-pot-1.jpg',
        tag: 'BUY NOW',
        price: 349.0,
      },
      {
        title: 'Roma Terracotta Pot',
        handle: 'roma-ceramic-pot',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516586/glorov/products/terracotta-pots/roma-ceramic-pot-1.jpg',
        tag: 'SALE IS LIVE',
        price: 299.0,
      },
      {
        title: 'Spiro Ceramic Pot',
        handle: 'spiro-pot',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516568/glorov/products/ceramic-planters/spiro-pot-1.jpg',
        tag: 'BUY NOW',
        price: 379.0,
      },
      {
        title: 'Olivia Ivory Handpainted Pot',
        handle: 'olivia-ivory-handpainted-ceramic-pot',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516585/glorov/products/terracotta-pots/olivia-ivory-handpainted-ceramic-pot-1.jpg',
        tag: 'BUY NOW',
        price: 399.0,
      },
    ],
  },

  // 5. Plant Care & Soil
  {
    id: 'pcat_glorov_plant_care_soil',
    title: 'Plant Care & Soil',
    handle: 'plant-care-soil',
    badge: '100% Organic',
    count: 12,
    description:
      'Organic vermicompost, nutrient potting mixes, neem oil repellents, and precision gardening toolkits.',
    image:
      'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
    subCategories: [
      {
        title: 'Potting Mix & Fertilizers',
        handle: 'potting-mix-fertilizers',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
        count: 6,
        description:
          'Enriched vermicompost, nutrient cocopeat blocks, and cold-pressed neem cake.',
      },
      {
        title: 'Gardening Tools & Kits',
        handle: 'gardening-tools',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516573/glorov/products/gardening-tools/heavy-duty-anvil-pruner-1.jpg',
        count: 6,
        description:
          'Ergonomic rust-proof trowels, precision bypass pruners, and brass watering cans.',
      },
    ],
    launches: [
      {
        title: 'Pot-O-Mix 5 Kg Potting Mix',
        handle: 'pot-o-mix-5-kg-potting-mix',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
        tag: 'BUY NOW',
        price: 349.0,
      },
      {
        title: 'Heavy Duty Anvil Pruner',
        handle: 'heavy-duty-anvil-pruner',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516573/glorov/products/gardening-tools/heavy-duty-anvil-pruner-1.jpg',
        tag: 'BUY NOW',
        price: 449.0,
      },
      {
        title: 'Cocopeat Block 5 Kg',
        handle: 'cocopeat-block-5-kg',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516580/glorov/products/potting-mix-fertilizers/cocopeat-block-5-kg-1.jpg',
        tag: 'SALE IS LIVE',
        price: 199.0,
      },
      {
        title: 'Garden Rake Long Handle',
        handle: 'garden-rake-with-long-handle-12-teeth-4-ft',
        image:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516573/glorov/products/gardening-tools/garden-rake-with-long-handle-12-teeth-4-ft-1.jpg',
        tag: 'BUY NOW',
        price: 499.0,
      },
    ],
  },
]
