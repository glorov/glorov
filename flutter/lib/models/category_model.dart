/// GLOROV Botanical Category Models
/// Strictly matches the seeded database categories and products (Zero unseeded items).

class BotanicalSubCategory {
  final String title;
  final String handle;
  final String image;
  final String? description;
  final int count;

  const BotanicalSubCategory({
    required this.title,
    required this.handle,
    required this.image,
    this.description,
    this.count = 0,
  });
}

class BotanicalProductLaunch {
  final String title;
  final String handle;
  final String image;
  final String tag; // e.g. 'BUY NOW', 'NEW LAUNCH', 'SALE IS LIVE'
  final double? price;

  const BotanicalProductLaunch({
    required this.title,
    required this.handle,
    required this.image,
    this.tag = 'BUY NOW',
    this.price,
  });

  String get formattedPrice =>
      price != null ? '₹${price!.toStringAsFixed(0)}' : '';
}

class CategoryModel {
  final String id;
  final String title;
  final String handle;
  final String description;
  final String image;
  final String? svgSrc;
  final String badge;
  final int count;
  final List<BotanicalSubCategory> subCategories;
  final List<BotanicalProductLaunch> launches;

  CategoryModel({
    this.id = '',
    required this.title,
    required this.handle,
    this.description = '',
    required this.image,
    this.svgSrc = 'assets/icons/Category.svg',
    this.badge = 'Botanical',
    this.count = 0,
    this.subCategories = const [],
    this.launches = const [],
  });
}

/// The EXACT 4 Root Seeded Categories + "For You" Overview (Strictly Botanical Seeded Data)
final List<CategoryModel> glorovBotanicalCategories = [
  // 1. For You (Overview of all Seeded Collections & Trending Launches)
  CategoryModel(
    id: 'cat-for-you',
    title: 'For You',
    handle: 'for-you',
    badge: 'Curated',
    count: 66,
    description: 'Personalized selection of fresh nursery arrivals, high-germination Desi seeds, and artisan pots.',
    image: 'assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    subCategories: const [
      BotanicalSubCategory(
        title: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image: 'assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Indoor Plants',
        handle: 'indoor-plants',
        image: 'assets/images/products/indoor-plants/money-plant-golden-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Flower Seeds',
        handle: 'flower-seeds',
        image: 'assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Air-Purifying',
        handle: 'air-purifying-plants',
        image: 'assets/images/products/air-purifying-plants/peace-lily-plant-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Herb Seeds',
        handle: 'herb-seeds',
        image: 'assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Ceramic Pots',
        handle: 'ceramic-planters',
        image: 'assets/images/products/ceramic-planters/diamond-pot-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Flowering Plants',
        handle: 'flowering-plants',
        image: 'assets/images/products/flowering-plants/peace-lily-plant-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Terracotta Pots',
        handle: 'terracotta-pots',
        image: 'assets/images/products/terracotta-pots/roma-ceramic-pot-1.jpg',
        count: 6,
      ),
      BotanicalSubCategory(
        title: 'Potting Mix & Fertilizers',
        handle: 'potting-mix-fertilizers',
        image: 'assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
        count: 6,
      ),
    ],
    launches: const [
      BotanicalProductLaunch(
        title: 'Brinjal Banarasi Giant Seeds',
        handle: 'brinjal-banarshi-giant-seeds',
        image: 'assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 99.0,
      ),
      BotanicalProductLaunch(
        title: 'Marigold African Double Seeds',
        handle: 'marigold-african-double-seeds',
        image: 'assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        tag: 'NEW LAUNCH',
        price: 79.0,
      ),
      BotanicalProductLaunch(
        title: 'Golden Money Plant',
        handle: 'money-plant-golden',
        image: 'assets/images/products/indoor-plants/money-plant-golden-1.jpg',
        tag: 'BUY NOW',
        price: 249.0,
      ),
      BotanicalProductLaunch(
        title: 'Peace Lily Plant',
        handle: 'peace-lily-plant',
        image: 'assets/images/products/air-purifying-plants/peace-lily-plant-1.jpg',
        tag: 'SALE IS LIVE',
        price: 299.0,
      ),
      BotanicalProductLaunch(
        title: 'Italian Basil Seeds',
        handle: 'italian-basil-seeds',
        image: 'assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      ),
      BotanicalProductLaunch(
        title: 'Diamond Ceramic Pot',
        handle: 'diamond-pot',
        image: 'assets/images/products/ceramic-planters/diamond-pot-1.jpg',
        tag: 'BUY NOW',
        price: 349.0,
      ),
    ],
  ),

  // 2. Seeds (Root Category: 'seeds')
  CategoryModel(
    id: 'pcat_01M5TXG1A4901RXMESXHDGHWDS',
    title: 'Seeds',
    handle: 'seeds',
    badge: 'High Germination',
    count: 18,
    description: 'High-germination tested indigenous Desi heirloom vegetable, flowering, and medicinal herb seeds.',
    image: 'assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
    subCategories: const [
      BotanicalSubCategory(
        title: 'Vegetable Seeds',
        handle: 'vegetable-seeds',
        image: 'assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        count: 6,
        description: 'Indigenous high-yield heirloom brinjal, cabbage, moringa, watermelon, and seasonal greens.',
      ),
      BotanicalSubCategory(
        title: 'Flower Seeds',
        handle: 'flower-seeds',
        image: 'assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        count: 6,
        description: 'Vibrant marigold, petunia, dahlia, cosmos, and pollinator-friendly garden blooms.',
      ),
      BotanicalSubCategory(
        title: 'Herb Seeds',
        handle: 'herb-seeds',
        image: 'assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        count: 6,
        description: 'Italian basil, holy tulsi, rocket arugula, parsley, and culinary wellness herbs.',
      ),
    ],
    launches: const [
      BotanicalProductLaunch(
        title: 'Brinjal Banarasi Giant Seeds',
        handle: 'brinjal-banarshi-giant-seeds',
        image: 'assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 99.0,
      ),
      BotanicalProductLaunch(
        title: 'Marigold African Double Seeds',
        handle: 'marigold-african-double-seeds',
        image: 'assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        tag: 'NEW LAUNCH',
        price: 79.0,
      ),
      BotanicalProductLaunch(
        title: 'Italian Basil Seeds',
        handle: 'italian-basil-seeds',
        image: 'assets/images/products/herb-seeds/italian-basil-1000-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 89.0,
      ),
      BotanicalProductLaunch(
        title: 'Dahlia Seeds',
        handle: 'dahlia-seeds',
        image: 'assets/images/products/flower-seeds/dahlia-seeds-1.jpg',
        tag: 'SALE IS LIVE',
        price: 99.0,
      ),
      BotanicalProductLaunch(
        title: 'Chinese Cabbage Seeds',
        handle: 'chinese-cabbage-seeds',
        image: 'assets/images/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 119.0,
      ),
      BotanicalProductLaunch(
        title: 'Marigold African Double Seeds',
        handle: 'marigold-african-double-seeds',
        image: 'assets/images/products/flower-seeds/marigold-african-double-seeds-1.jpg',
        tag: 'BUY NOW',
        price: 79.0,
      ),
    ],
  ),

  // 3. Live Plants (Root Category: 'live-plants')
  CategoryModel(
    id: 'pcat_01M5TXG1AEPW6JPNWC2VNGH22D',
    title: 'Live Plants',
    handle: 'live-plants',
    badge: 'Nursery Dispatched',
    count: 24,
    description: 'Root-safe nursery dispatched indoor, air-purifying, and flowering live botanical specimens.',
    image: 'assets/images/products/indoor-plants/money-plant-golden-1.jpg',
    subCategories: const [
      BotanicalSubCategory(
        title: 'Indoor Plants',
        handle: 'indoor-plants',
        image: 'assets/images/products/indoor-plants/money-plant-golden-1.jpg',
        count: 6,
        description: 'Low-light resilient foliage plants including Money Plant Golden, Aglaonema, and ZZ Plant.',
      ),
      BotanicalSubCategory(
        title: 'Air-Purifying Plants',
        handle: 'air-purifying-plants',
        image: 'assets/images/products/air-purifying-plants/peace-lily-plant-1.jpg',
        count: 6,
        description: 'NASA-evaluated clean air plants including Peace Lily, China Doll, and Pink Beauty.',
      ),
      BotanicalSubCategory(
        title: 'Flowering Plants',
        handle: 'flowering-plants',
        image: 'assets/images/products/flowering-plants/peace-lily-plant-1.jpg',
        count: 6,
        description: 'Ornamental blooming plants including Peace Lily, Aglaonema Snow White, and Red Beauty.',
      ),
      BotanicalSubCategory(
        title: 'Succulents & Bonsai',
        handle: 'succulents-bonsai',
        image: 'assets/images/products/succulents-bonsai/jade-plant-mini-1.jpg',
        count: 6,
        description: 'Compact drought-tolerant jade succulents, Sansevieria Laurentii, and Zeylanica.',
      ),
    ],
    launches: const [
      BotanicalProductLaunch(
        title: 'Golden Money Plant',
        handle: 'money-plant-golden',
        image: 'assets/images/products/indoor-plants/money-plant-golden-1.jpg',
        tag: 'BUY NOW',
        price: 249.0,
      ),
      BotanicalProductLaunch(
        title: 'Peace Lily Plant',
        handle: 'peace-lily-plant',
        image: 'assets/images/products/air-purifying-plants/peace-lily-plant-1.jpg',
        tag: 'SALE IS LIVE',
        price: 299.0,
      ),
      BotanicalProductLaunch(
        title: 'Miniature Jade Plant',
        handle: 'jade-plant-mini',
        image: 'assets/images/products/succulents-bonsai/jade-plant-mini-1.jpg',
        tag: 'NEW LAUNCH',
        price: 199.0,
      ),
      BotanicalProductLaunch(
        title: 'Areca Palm Plant XL',
        handle: 'areca-palm-plant-xl',
        image: 'assets/images/products/indoor-plants/areca-palm-plant-xl-1.jpg',
        tag: 'BUY NOW',
        price: 499.0,
      ),
    ],
  ),

  // 4. Planters & Pots (Root Category: 'planters-pots')
  CategoryModel(
    id: 'pcat_01M5TXG1AJDCXR6H9TZY4APJVH',
    title: 'Planters & Pots',
    handle: 'planters-pots',
    badge: 'Artisan Handcrafted',
    count: 12,
    description: 'Eco-friendly terracotta, ceramic designer pots, and nursery planters with optimal drainage.',
    image: 'assets/images/products/ceramic-planters/diamond-pot-1.jpg',
    subCategories: const [
      BotanicalSubCategory(
        title: 'Ceramic Planters',
        handle: 'ceramic-planters',
        image: 'assets/images/products/ceramic-planters/diamond-pot-1.jpg',
        count: 6,
        description: 'Premium handcrafted glazed ceramic pots with drainage holes and protective saucers.',
      ),
      BotanicalSubCategory(
        title: 'Terracotta Pots',
        handle: 'terracotta-pots',
        image: 'assets/images/products/terracotta-pots/roma-ceramic-pot-1.jpg',
        count: 6,
        description: 'Breathable natural clay terracotta pots ideal for optimal root aeration.',
      ),
    ],
    launches: const [
      BotanicalProductLaunch(
        title: 'Diamond Ceramic Pot',
        handle: 'diamond-pot',
        image: 'assets/images/products/ceramic-planters/diamond-pot-1.jpg',
        tag: 'BUY NOW',
        price: 349.0,
      ),
      BotanicalProductLaunch(
        title: 'Roma Terracotta Pot',
        handle: 'roma-ceramic-pot',
        image: 'assets/images/products/terracotta-pots/roma-ceramic-pot-1.jpg',
        tag: 'SALE IS LIVE',
        price: 299.0,
      ),
      BotanicalProductLaunch(
        title: 'Spiro Ceramic Pot',
        handle: 'spiro-pot',
        image: 'assets/images/products/ceramic-planters/spiro-pot-1.jpg',
        tag: 'BUY NOW',
        price: 379.0,
      ),
      BotanicalProductLaunch(
        title: 'Olivia Ivory Handpainted Pot',
        handle: 'olivia-ivory-handpainted-ceramic-pot',
        image: 'assets/images/products/terracotta-pots/olivia-ivory-handpainted-ceramic-pot-1.jpg',
        tag: 'BUY NOW',
        price: 399.0,
      ),
    ],
  ),

  // 5. Plant Care & Soil (Root Category: 'plant-care-soil')
  CategoryModel(
    id: 'pcat_glorov_plant_care_soil',
    title: 'Plant Care & Soil',
    handle: 'plant-care-soil',
    badge: '100% Organic',
    count: 12,
    description: 'Organic vermicompost, nutrient potting mixes, neem oil repellents, and precision gardening toolkits.',
    image: 'assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
    subCategories: const [
      BotanicalSubCategory(
        title: 'Potting Mix & Fertilizers',
        handle: 'potting-mix-fertilizers',
        image: 'assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
        count: 6,
        description: 'Enriched vermicompost, nutrient cocopeat blocks, and cold-pressed neem cake.',
      ),
      BotanicalSubCategory(
        title: 'Gardening Tools & Kits',
        handle: 'gardening-tools',
        image: 'assets/images/products/gardening-tools/heavy-duty-anvil-pruner-1.jpg',
        count: 6,
        description: 'Ergonomic rust-proof trowels, precision bypass pruners, and brass watering cans.',
      ),
    ],
    launches: const [
      BotanicalProductLaunch(
        title: 'Pot-O-Mix 5 Kg Potting Mix',
        handle: 'pot-o-mix-5-kg-potting-mix',
        image: 'assets/images/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
        tag: 'BUY NOW',
        price: 349.0,
      ),
      BotanicalProductLaunch(
        title: 'Heavy Duty Anvil Pruner',
        handle: 'heavy-duty-anvil-pruner',
        image: 'assets/images/products/gardening-tools/heavy-duty-anvil-pruner-1.jpg',
        tag: 'BUY NOW',
        price: 449.0,
      ),
      BotanicalProductLaunch(
        title: 'Cocopeat Block 5 Kg',
        handle: 'cocopeat-block-5-kg',
        image: 'assets/images/products/potting-mix-fertilizers/cocopeat-block-5-kg-1.jpg',
        tag: 'SALE IS LIVE',
        price: 199.0,
      ),
      BotanicalProductLaunch(
        title: 'Garden Rake Long Handle',
        handle: 'garden-rake-with-long-handle-12-teeth-4-ft',
        image: 'assets/images/products/gardening-tools/garden-rake-with-long-handle-12-teeth-4-ft-1.jpg',
        tag: 'BUY NOW',
        price: 499.0,
      ),
    ],
  ),
];

// Alias for backwards compatibility
final List<CategoryModel> demoCategories = glorovBotanicalCategories;
final List<CategoryModel> demoCategoriesWithImage = glorovBotanicalCategories;
