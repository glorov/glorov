import '../../models/glorov/glorov_product.dart';
import '../contracts/product_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa v2 Storefront API Implementation of ProductRepository
/// Interacts directly with `/store/products` and `/store/product-categories`.
class MedusaProductRepository implements ProductRepository {
  final MedusaHttpClient client;

  const MedusaProductRepository(this.client);

  @override
  Future<List<GlorovProduct>> getProducts({GlorovProductFilter? filter}) async {
    final queryParams = <String, dynamic>{
      'limit': 50,
      'fields': '*variants,*categories,*images,+metadata',
    };

    if (filter != null) {
      if (filter.searchQuery != null && filter.searchQuery!.trim().isNotEmpty) {
        queryParams['q'] = filter.searchQuery!.trim();
      }
      if (filter.sortBy != null) {
        switch (filter.sortBy) {
          case 'price_asc':
            queryParams['order'] = 'calculated_price';
            break;
          case 'price_desc':
            queryParams['order'] = '-calculated_price';
            break;
          case 'rating':
            queryParams['order'] = '-rating';
            break;
          default:
            break;
        }
      }
    }

    final result = await client.get<List<GlorovProduct>>(
      MedusaEndpoints.products,
      queryParameters: queryParams,
      parser: (json) {
        if (json is Map && json['products'] is List) {
          return (json['products'] as List)
              .map((p) =>
                  GlorovProduct.fromMedusaJson(p as Map<String, dynamic>))
              .toList();
        }
        return <GlorovProduct>[];
      },
    );

    if (result.isFailure) {
      // Propagate empty list on error while logging failure
      return <GlorovProduct>[];
    }

    List<GlorovProduct> products = result.requireData;

    // Apply client-side botanical filter refinements if specified
    if (filter != null) {
      if (filter.category != null &&
          filter.category!.isNotEmpty &&
          filter.category != 'All' &&
          filter.category != 'All Botanical') {
        final cat = filter.category!.toLowerCase();
        products =
            products.where((p) => p.category.toLowerCase() == cat).toList();
      }

      if (filter.subcategory != null && filter.subcategory!.isNotEmpty) {
        final sub = filter.subcategory!.toLowerCase();
        products =
            products.where((p) => p.subcategory.toLowerCase() == sub).toList();
      }

      if (filter.productType != null) {
        products =
            products.where((p) => p.productType == filter.productType).toList();
      }

      if (filter.minPrice != null) {
        products = products
            .where((p) => p.effectivePrice >= filter.minPrice!)
            .toList();
      }

      if (filter.maxPrice != null) {
        products = products
            .where((p) => p.effectivePrice <= filter.maxPrice!)
            .toList();
      }

      if (filter.sunlight != null && filter.sunlight!.isNotEmpty) {
        final sun = filter.sunlight!.toLowerCase();
        products = products
            .where((p) => p.sunlightRequirement.toLowerCase().contains(sun))
            .toList();
      }

      if (filter.inStockOnly == true) {
        products = products.where((p) => p.inStock).toList();
      }

      if (filter.minRating != null) {
        products =
            products.where((p) => p.rating >= filter.minRating!).toList();
      }

      if (filter.sortBy == 'bestseller') {
        products.sort((a, b) =>
            (b.isBestSeller ? 1 : 0).compareTo(a.isBestSeller ? 1 : 0));
      }
    }

    return products;
  }

  @override
  Future<GlorovProduct?> getProductById(String id) async {
    final result = await client.get<GlorovProduct?>(
      MedusaEndpoints.productById(id),
      queryParameters: {
        'fields': '*variants,*categories,*images,+metadata',
      },
      parser: (json) {
        if (json is Map && json['product'] is Map) {
          return GlorovProduct.fromMedusaJson(
              json['product'] as Map<String, dynamic>);
        }
        return null;
      },
    );

    return result.dataOrNull;
  }

  @override
  Future<GlorovProduct?> getProductBySlug(String slug) async {
    final result = await client.get<GlorovProduct?>(
      MedusaEndpoints.products,
      queryParameters: {
        'handle': slug,
        'limit': 1,
        'fields': '*variants,*categories,*images,+metadata',
      },
      parser: (json) {
        if (json is Map &&
            json['products'] is List &&
            (json['products'] as List).isNotEmpty) {
          final first =
              (json['products'] as List).first as Map<String, dynamic>;
          return GlorovProduct.fromMedusaJson(first);
        }
        return null;
      },
    );

    return result.dataOrNull;
  }

  @override
  Future<List<GlorovProductCategory>> getCategories() async {
    final result = await client.get<List<GlorovProductCategory>>(
      MedusaEndpoints.productCategories,
      parser: (json) {
        if (json is Map && json['product_categories'] is List) {
          return (json['product_categories'] as List).map((c) {
            final cat = c as Map<String, dynamic>;
            final name = cat['name']?.toString() ?? 'Botanical';
            final slug = cat['handle']?.toString() ??
                name.toLowerCase().replaceAll(' ', '-');
            return GlorovProductCategory(
              id: cat['id']?.toString() ?? 'cat_$slug',
              name: name,
              slug: slug,
              productCount: (cat['products'] as List?)?.length ?? 0,
            );
          }).toList();
        }
        return <GlorovProductCategory>[];
      },
    );

    return result.dataOrNull ?? <GlorovProductCategory>[];
  }

  @override
  Future<List<GlorovProduct>> getFeaturedProducts({String? category}) async {
    final all = await getProducts();
    return all.where((p) {
      final matchesCategory = category == null ||
          p.category.toLowerCase() == category.toLowerCase();
      return (p.isFeatured || p.isBestSeller) && matchesCategory;
    }).toList();
  }

  @override
  Future<List<GlorovProduct>> getRelatedProducts(String productId,
      {int limit = 4}) async {
    final current = await getProductById(productId);
    if (current == null) return [];

    final categoryProducts = await getProducts(
      filter: GlorovProductFilter(category: current.category),
    );

    return categoryProducts
        .where((p) => p.id != productId)
        .take(limit)
        .toList();
  }
}
