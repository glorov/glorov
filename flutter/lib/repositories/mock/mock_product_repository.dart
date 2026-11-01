import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_product.dart';
import '../contracts/product_repository.dart';

/// In-Memory Mock Implementation of ProductRepository
/// Powered by GlorovMockData, supporting offline web execution and tests.
class MockProductRepository implements ProductRepository {
  const MockProductRepository();

  @override
  Future<List<GlorovProduct>> getProducts({GlorovProductFilter? filter}) async {
    List<GlorovProduct> results = List.from(GlorovMockData.products);

    if (filter == null) {
      return results;
    }

    if (filter.category != null &&
        filter.category!.isNotEmpty &&
        filter.category != 'All') {
      final cat = filter.category!.toLowerCase();
      results = results
          .where((p) =>
              p.category.toLowerCase() == cat ||
              p.subcategory.toLowerCase() == cat)
          .toList();
    }

    if (filter.subcategory != null && filter.subcategory!.isNotEmpty) {
      final sub = filter.subcategory!.toLowerCase();
      results =
          results.where((p) => p.subcategory.toLowerCase() == sub).toList();
    }

    if (filter.productType != null) {
      results =
          results.where((p) => p.productType == filter.productType).toList();
    }

    if (filter.searchQuery != null && filter.searchQuery!.trim().isNotEmpty) {
      final query = filter.searchQuery!.trim().toLowerCase();
      results = results.where((p) {
        return p.title.toLowerCase().contains(query) ||
            p.botanicalName.toLowerCase().contains(query) ||
            p.category.toLowerCase().contains(query) ||
            p.subcategory.toLowerCase().contains(query) ||
            p.description.toLowerCase().contains(query);
      }).toList();
    }

    if (filter.minPrice != null) {
      results =
          results.where((p) => p.effectivePrice >= filter.minPrice!).toList();
    }

    if (filter.maxPrice != null) {
      results =
          results.where((p) => p.effectivePrice <= filter.maxPrice!).toList();
    }

    if (filter.sunlight != null && filter.sunlight!.isNotEmpty) {
      final sun = filter.sunlight!.toLowerCase();
      results = results
          .where((p) => p.sunlightRequirement.toLowerCase().contains(sun))
          .toList();
    }

    if (filter.inStockOnly == true) {
      results = results.where((p) => p.inStock).toList();
    }

    if (filter.minRating != null) {
      results = results.where((p) => p.rating >= filter.minRating!).toList();
    }

    // Sort order
    if (filter.sortBy != null) {
      switch (filter.sortBy) {
        case 'price_asc':
          results.sort((a, b) => a.effectivePrice.compareTo(b.effectivePrice));
          break;
        case 'price_desc':
          results.sort((a, b) => b.effectivePrice.compareTo(a.effectivePrice));
          break;
        case 'rating':
          results.sort((a, b) => b.rating.compareTo(a.rating));
          break;
        case 'bestseller':
          results.sort((a, b) =>
              (b.isBestSeller ? 1 : 0).compareTo(a.isBestSeller ? 1 : 0));
          break;
        default:
          break;
      }
    }

    return results;
  }

  @override
  Future<GlorovProduct?> getProductById(String id) async {
    return GlorovMockData.getProductById(id);
  }

  @override
  Future<GlorovProduct?> getProductBySlug(String slug) async {
    return GlorovMockData.getProductBySlug(slug);
  }

  @override
  Future<List<GlorovProductCategory>> getCategories() async {
    return GlorovMockData.categories.map((cat) {
      final count = GlorovMockData.products
          .where((p) =>
              p.category.toLowerCase() == cat.title.toLowerCase() ||
              p.subcategory.toLowerCase() == cat.title.toLowerCase())
          .length;
      return GlorovProductCategory(
        id: cat.id,
        name: cat.title,
        slug: cat.slug,
        productCount: count,
      );
    }).toList();
  }

  @override
  Future<List<GlorovProduct>> getFeaturedProducts({String? category}) async {
    return GlorovMockData.products.where((p) {
      final matchesCategory = category == null ||
          p.category.toLowerCase() == category.toLowerCase();
      return (p.isFeatured || p.isBestSeller) && matchesCategory;
    }).toList();
  }

  @override
  Future<List<GlorovProduct>> getRelatedProducts(String productId,
      {int limit = 4}) async {
    final prod = GlorovMockData.getProductById(productId);
    if (prod == null) return [];
    final related = GlorovMockData.getRelatedProducts(prod);
    return related.take(limit).toList();
  }
}
