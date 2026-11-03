import '../../repositories/remote/medusa_api_config.dart';

/// GLOROV Botanical Product Types
enum GlorovProductType {
  seeds,
  plants,
  supplies,
  accessories,
}

/// Optional product variant (e.g. seed pack counts, pot sizes)
class GlorovProductVariant {
  final String id;
  final String name;
  final double price;
  final double? discountPrice;

  const GlorovProductVariant({
    required this.id,
    required this.name,
    required this.price,
    this.discountPrice,
  });

  double get effectivePrice => discountPrice ?? price;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'price': price,
        'discountPrice': discountPrice,
      };

  factory GlorovProductVariant.fromJson(Map<String, dynamic> json) {
    return GlorovProductVariant(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      discountPrice: (json['discountPrice'] as num?)?.toDouble(),
    );
  }

  factory GlorovProductVariant.fromMedusaJson(Map<String, dynamic> json) {
    final prices = json['prices'] as List<dynamic>? ?? [];
    double standardPrice = 0.0;
    if (prices.isNotEmpty) {
      final p = prices.first as Map<String, dynamic>;
      final rawAmount = (p['amount'] as num?)?.toDouble() ?? 0.0;
      // Medusa stores amounts in minor currency units (paise/cents): e.g. 9900 = 99.00 INR
      standardPrice = rawAmount > 500 ? rawAmount / 100.0 : rawAmount;
    }
    final meta = json['metadata'] as Map<String, dynamic>? ?? {};
    final rawDiscount = meta['discount_price'];
    double? discount;
    if (rawDiscount != null) {
      if (rawDiscount is num) {
        discount = rawDiscount.toDouble();
      } else {
        discount = double.tryParse(rawDiscount.toString());
      }
      if (discount != null && discount > 500) {
        discount = discount / 100.0;
      }
    }

    final rawPrice = json['price'];
    double fallbackPrice = 0.0;
    if (rawPrice is num) {
      fallbackPrice = rawPrice.toDouble();
    } else if (rawPrice != null) {
      fallbackPrice = double.tryParse(rawPrice.toString()) ?? 0.0;
    }
    if (fallbackPrice > 500) {
      fallbackPrice = fallbackPrice / 100.0;
    }

    return GlorovProductVariant(
      id: json['id'] as String? ?? '',
      name: json['title'] as String? ?? json['name'] as String? ?? '',
      price: standardPrice > 0 ? standardPrice : fallbackPrice,
      discountPrice: discount,
    );
  }
}

/// GLOROV Botanical Domain Model
/// Centralized model supporting seeds, live houseplants, and gardening essentials.
class GlorovProduct {
  final String id;
  final String slug;
  final String title;
  final String botanicalName;
  final String shortDescription;
  final String description;
  final String category;
  final String subcategory;
  final GlorovProductType productType;
  final double price;
  final double? discountPrice;
  final int? discountPercent;
  final double rating;
  final int reviewCount;
  final List<String> imageUrls;
  final bool inStock;
  final bool isBestSeller;
  final bool isStaffPick;
  final bool isFeatured;
  final List<String> badges;
  final List<GlorovProductVariant> variants;
  final List<String> relatedProductIds;

  // Seed-specific attributes
  final String? germinationPeriod;
  final String? sowingDepth;
  final String? plantingSeason;
  final String? harvestTime;
  final String? packContents;

  // Plant-specific attributes
  final String sunlightRequirement;
  final String wateringNeeds;
  final String difficultyLevel;
  final String? potSize;
  final bool isPetFriendly;

  // Supplies-specific attributes
  final String? material;
  final String? dimensions;

  const GlorovProduct({
    required this.id,
    required this.slug,
    required this.title,
    required this.botanicalName,
    required this.shortDescription,
    required this.description,
    required this.category,
    required this.subcategory,
    required this.productType,
    required this.price,
    this.discountPrice,
    this.discountPercent,
    this.rating = 4.8,
    this.reviewCount = 0,
    required this.imageUrls,
    this.inStock = true,
    this.isBestSeller = false,
    this.isStaffPick = false,
    this.isFeatured = false,
    this.badges = const [],
    this.variants = const [],
    this.relatedProductIds = const [],
    this.germinationPeriod,
    this.sowingDepth,
    this.plantingSeason,
    this.harvestTime,
    this.packContents,
    this.sunlightRequirement = 'Bright Indirect Light',
    this.wateringNeeds = 'Weekly',
    this.difficultyLevel = 'Beginner Friendly',
    this.potSize,
    this.isPetFriendly = false,
    this.material,
    this.dimensions,
  });

  bool get isEmpty => id.isEmpty || title.isEmpty;
  bool get isNotEmpty => !isEmpty;

  static const GlorovProduct empty = GlorovProduct(
    id: '',
    slug: '',
    title: '',
    botanicalName: '',
    shortDescription: '',
    description: '',
    category: '',
    subcategory: '',
    productType: GlorovProductType.plants,
    price: 0.0,
    imageUrls: [],
  );

  double get effectivePrice => discountPrice ?? price;
  bool get hasDiscount => discountPrice != null && discountPrice! < price;
  String get primaryImage => imageUrls.isNotEmpty ? imageUrls.first : '';

  Map<String, dynamic> toJson() => {
        'id': id,
        'slug': slug,
        'title': title,
        'botanicalName': botanicalName,
        'shortDescription': shortDescription,
        'description': description,
        'category': category,
        'subcategory': subcategory,
        'productType': productType.name,
        'price': price,
        'discountPrice': discountPrice,
        'discountPercent': discountPercent,
        'rating': rating,
        'reviewCount': reviewCount,
        'imageUrls': imageUrls,
        'inStock': inStock,
        'isBestSeller': isBestSeller,
        'isStaffPick': isStaffPick,
        'isFeatured': isFeatured,
        'badges': badges,
        'variants': variants.map((v) => v.toJson()).toList(),
        'relatedProductIds': relatedProductIds,
        'germinationPeriod': germinationPeriod,
        'sowingDepth': sowingDepth,
        'plantingSeason': plantingSeason,
        'harvestTime': harvestTime,
        'packContents': packContents,
        'sunlightRequirement': sunlightRequirement,
        'wateringNeeds': wateringNeeds,
        'difficultyLevel': difficultyLevel,
        'potSize': potSize,
        'isPetFriendly': isPetFriendly,
        'material': material,
        'dimensions': dimensions,
      };

  factory GlorovProduct.fromJson(Map<String, dynamic> json) {
    final prod = GlorovProduct(
      id: json['id'] as String? ?? '',
      slug: json['slug'] as String? ?? '',
      title: json['title'] as String? ?? '',
      botanicalName: json['botanicalName'] as String? ?? '',
      shortDescription: json['shortDescription'] as String? ?? '',
      description: json['description'] as String? ?? '',
      category: json['category'] as String? ?? 'Seeds',
      subcategory: json['subcategory'] as String? ?? '',
      productType: GlorovProductType.values.firstWhere(
        (t) => t.name == json['productType'],
        orElse: () => GlorovProductType.seeds,
      ),
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      discountPrice: (json['discountPrice'] as num?)?.toDouble(),
      discountPercent: json['discountPercent'] as int?,
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      reviewCount: json['reviewCount'] as int? ?? 0,
      imageUrls: (json['imageUrls'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      inStock: json['inStock'] as bool? ?? true,
      isBestSeller: json['isBestSeller'] as bool? ?? false,
      isStaffPick: json['isStaffPick'] as bool? ?? false,
      isFeatured: json['isFeatured'] as bool? ?? false,
      badges: (json['badges'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      variants: (json['variants'] as List<dynamic>? ?? [])
          .map((v) => GlorovProductVariant.fromJson(v as Map<String, dynamic>))
          .toList(),
      relatedProductIds: (json['relatedProductIds'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      germinationPeriod: json['germinationPeriod'] as String?,
      sowingDepth: json['sowingDepth'] as String?,
      plantingSeason: json['plantingSeason'] as String?,
      harvestTime: json['harvestTime'] as String?,
      packContents: json['packContents'] as String?,
      sunlightRequirement:
          json['sunlightRequirement'] as String? ?? 'Bright Indirect Light',
      wateringNeeds: json['wateringNeeds'] as String? ?? 'Weekly',
      difficultyLevel:
          json['difficultyLevel'] as String? ?? 'Beginner Friendly',
      potSize: json['potSize'] as String?,
      isPetFriendly: json['isPetFriendly'] as bool? ?? false,
      material: json['material'] as String?,
      dimensions: json['dimensions'] as String?,
    );
    GlorovProductCache.cache(prod);
    return prod;
  }

  /// Deserializes a Medusa v2 Storefront API Product Object into the GLOROV Domain Entity
  factory GlorovProduct.fromMedusaJson(Map<String, dynamic> json) {
    final meta = json['metadata'] != null
        ? Map<String, dynamic>.from(json['metadata'] as Map)
        : <String, dynamic>{};

    // Images parsing
    String resolveImageUrl(String rawUrl) {
      final trimmed = rawUrl.trim();
      if (trimmed.isEmpty) return '';
      if (trimmed.startsWith('http://') ||
          trimmed.startsWith('https://') ||
          trimmed.startsWith('assets/')) {
        return trimmed;
      }
      final cleanPath = trimmed.startsWith('/') ? trimmed : '/$trimmed';
      return '${MedusaApiConfig.defaultBaseUrl}$cleanPath';
    }

    final List<String> images = [];
    if (json['thumbnail'] != null && (json['thumbnail'] as String).isNotEmpty) {
      final resolved = resolveImageUrl(json['thumbnail'] as String);
      if (resolved.isNotEmpty) {
        images.add(resolved);
      }
    }
    if (json['images'] is List) {
      for (final img in json['images'] as List) {
        if (img is Map && img['url'] != null) {
          final url = resolveImageUrl(img['url'] as String);
          if (url.isNotEmpty && !images.contains(url)) {
            images.add(url);
          }
        }
      }
    }

    // Categories parsing
    String categoryName = 'Seeds';
    if (json['categories'] is List && (json['categories'] as List).isNotEmpty) {
      final firstCat = (json['categories'] as List).first;
      if (firstCat is Map && firstCat['name'] != null) {
        categoryName = firstCat['name'] as String;
      }
    } else if (meta['category'] != null) {
      categoryName = meta['category'] as String;
    }

    // Variants parsing
    final List<GlorovProductVariant> variants = [];
    double basePrice = 0.0;
    double? discountPrice;

    if (json['variants'] is List && (json['variants'] as List).isNotEmpty) {
      for (final v in json['variants'] as List) {
        if (v is Map<String, dynamic>) {
          final parsedVariant = GlorovProductVariant.fromMedusaJson(v);
          variants.add(parsedVariant);
        }
      }
      if (variants.isNotEmpty) {
        basePrice = variants.first.price;
        discountPrice = variants.first.discountPrice;
      }
    }

    if (basePrice == 0.0 && json['price'] != null) {
      basePrice = (json['price'] as num).toDouble();
    }

    // Product type resolution
    final typeStr =
        (meta['product_type'] as String? ?? categoryName).toLowerCase();
    GlorovProductType prodType = GlorovProductType.seeds;
    if (typeStr.contains('plant')) {
      prodType = GlorovProductType.plants;
    } else if (typeStr.contains('suppl') ||
        typeStr.contains('pot') ||
        typeStr.contains('tool')) {
      prodType = GlorovProductType.supplies;
    }

    final prod = GlorovProduct(
      id: json['id'] as String? ?? '',
      slug: json['handle'] as String? ?? json['slug'] as String? ?? '',
      title: json['title'] as String? ?? '',
      botanicalName: meta['botanical_name'] as String? ??
          json['subtitle'] as String? ??
          '',
      shortDescription: meta['short_description'] as String? ??
          json['subtitle'] as String? ??
          '',
      description: json['description'] as String? ?? '',
      category: categoryName,
      subcategory: meta['subcategory'] as String? ?? '',
      productType: prodType,
      price: basePrice,
      discountPrice: discountPrice,
      discountPercent: () {
        final val = meta['discount_percent'];
        if (val is num) return val.toInt();
        if (val != null) return int.tryParse(val.toString());
        return null;
      }(),
      rating: () {
        final val = meta['rating'];
        if (val is num) return val.toDouble();
        if (val != null) return double.tryParse(val.toString()) ?? 4.8;
        return 4.8;
      }(),
      reviewCount: () {
        final val = meta['review_count'];
        if (val is num) return val.toInt();
        if (val != null) return int.tryParse(val.toString()) ?? 0;
        return 0;
      }(),
      imageUrls: images,
      inStock:
          json['status'] == 'published' || (meta['in_stock'] as bool? ?? true),
      isBestSeller: meta['is_bestseller'] as bool? ?? false,
      isStaffPick: meta['is_staff_pick'] as bool? ?? false,
      isFeatured: meta['is_featured'] as bool? ?? false,
      badges: () {
        final List<String> list = [];
        if (meta['badges'] is List) {
          list.addAll(
            (meta['badges'] as List)
                .map((e) => e.toString().trim())
                .where((s) => s.isNotEmpty),
          );
        }
        if (json['tags'] is List) {
          for (final t in json['tags'] as List) {
            if (t is Map && t['value'] != null) {
              final val = t['value'].toString().trim();
              if (val.isNotEmpty && !list.contains(val)) list.add(val);
            } else if (t is String && t.trim().isNotEmpty) {
              final val = t.trim();
              if (!list.contains(val)) list.add(val);
            }
          }
        }
        if (meta['badge'] is String &&
            (meta['badge'] as String).trim().isNotEmpty) {
          final val = (meta['badge'] as String).trim();
          if (!list.contains(val)) list.add(val);
        }
        return list;
      }(),
      variants: variants,
      relatedProductIds: (meta['related_product_ids'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      germinationPeriod: meta['germination_time_range'] as String? ??
          meta['germinationPeriod'] as String?,
      sowingDepth:
          meta['sowing_depth'] as String? ?? meta['sowingDepth'] as String?,
      plantingSeason:
          meta['season'] as String? ?? meta['plantingSeason'] as String?,
      harvestTime:
          meta['days_to_harvest'] as String? ?? meta['harvestTime'] as String?,
      packContents: meta['approx_seeds_per_packet']?.toString() ??
          meta['packContents'] as String?,
      sunlightRequirement: meta['sunlight'] as String? ??
          meta['sunlightRequirement'] as String? ??
          'Bright Indirect Light',
      wateringNeeds: meta['watering'] as String? ??
          meta['wateringNeeds'] as String? ??
          'Weekly',
      difficultyLevel: meta['difficulty'] as String? ??
          meta['difficultyLevel'] as String? ??
          'Beginner Friendly',
      potSize: meta['pot_size'] as String? ?? meta['potSize'] as String?,
      isPetFriendly: meta['is_pet_friendly'] as bool? ??
          meta['isPetFriendly'] as bool? ??
          false,
      material: meta['material'] as String?,
      dimensions: meta['dimensions'] as String?,
    );
    GlorovProductCache.cache(prod);
    return prod;
  }
}

/// Global In-Memory Cache for Loaded Botanical Products
class GlorovProductCache {
  static final Map<String, GlorovProduct> _byId = {};
  static final Map<String, GlorovProduct> _bySlug = {};

  static void cache(GlorovProduct p) {
    if (p.id.isNotEmpty) _byId[p.id] = p;
    if (p.slug.isNotEmpty) _bySlug[p.slug] = p;
  }

  static void cacheAll(Iterable<GlorovProduct> products) {
    for (final p in products) {
      cache(p);
    }
  }

  static GlorovProduct? get(String idOrSlug) {
    return _byId[idOrSlug] ?? _bySlug[idOrSlug];
  }
}
