import '../../models/glorov/glorov_product.dart';

/// Product Filter Criteria for Storefront Discovery
class GlorovProductFilter {
  final String? category;
  final String? subcategory;
  final GlorovProductType? productType;
  final String? searchQuery;
  final double? minPrice;
  final double? maxPrice;
  final String? sunlight;
  final bool? inStockOnly;
  final double? minRating;
  final String?
      sortBy; // 'recommended', 'price_asc', 'price_desc', 'rating', 'bestseller'

  const GlorovProductFilter({
    this.category,
    this.subcategory,
    this.productType,
    this.searchQuery,
    this.minPrice,
    this.maxPrice,
    this.sunlight,
    this.inStockOnly,
    this.minRating,
    this.sortBy,
  });
}

/// Category metadata entity
class GlorovProductCategory {
  final String id;
  final String name;
  final String slug;
  final String? iconName;
  final int productCount;

  const GlorovProductCategory({
    required this.id,
    required this.name,
    required this.slug,
    this.iconName,
    this.productCount = 0,
  });
}

/// Abstract Product Catalog Repository Contract
/// Decouples UI screens from data sources (Mock vs Medusa Store API).
abstract class ProductRepository {
  Future<List<GlorovProduct>> getProducts({GlorovProductFilter? filter});
  Future<GlorovProduct?> getProductById(String id);
  Future<GlorovProduct?> getProductBySlug(String slug);
  Future<List<GlorovProductCategory>> getCategories();
  Future<List<GlorovProduct>> getFeaturedProducts({String? category});
  Future<List<GlorovProduct>> getRelatedProducts(String productId,
      {int limit = 4});
}
