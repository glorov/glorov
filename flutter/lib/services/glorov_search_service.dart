import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/glorov/glorov_product.dart';
import '../repositories/contracts/product_repository.dart';
import '../repositories/glorov_repositories.dart';
import 'storage/local_storage.dart';

/// Aggregated search result container containing ranked products,
/// closest best match, autocomplete keyword suggestions, and matched categories.
class GlorovSearchResult {
  final String query;
  final GlorovProduct? closestProduct;
  final List<GlorovProduct> products;
  final List<String> keywordSuggestions;
  final List<String> matchedCategories;

  const GlorovSearchResult({
    required this.query,
    this.closestProduct,
    this.products = const [],
    this.keywordSuggestions = const [],
    this.matchedCategories = const [],
  });

  bool get isEmpty => products.isEmpty && closestProduct == null;
  bool get hasResults => products.isNotEmpty || closestProduct != null;
  int get totalCount => products.length;
}

/// Centralized Botanical Search & Suggestion Service for GLOROV
/// Handles search history persistence, trending searches, predictive autocomplete,
/// and relevance ranking to identify the closest match.
class GlorovSearchService {
  GlorovSearchService._();

  static final GlorovSearchService instance = GlorovSearchService._();

  static const String _storageKey = 'glorov_recent_searches';
  static const int _maxRecentSearches = 10;

  static const List<String> trendingSearches = [
    'Monstera Deliciosa',
    'Snake Plant',
    'Bonsai Tree',
    'Ceramic Pots',
    'Organic Neem Oil',
    'Cherry Tomato Seeds',
    'Basil Seeds',
    'Peace Lily',
    'Succulents',
    'Vegetable Seeds',
  ];

  static const List<String> categoryFilters = [
    'All',
    'Seeds',
    'Live Plants',
    'Planters & Pots',
    'Plant Care & Soil',
  ];

  // ---------------------------------------------------------------------------
  // Search History Persistence (Cross-Platform)
  // ---------------------------------------------------------------------------

  List<String> getRecentSearches() {
    try {
      final raw = GlorovLocalStorage.instance.getItem(_storageKey);
      if (raw != null && raw.isNotEmpty) {
        final decoded = jsonDecode(raw);
        if (decoded is List) {
          return decoded.map((e) => e.toString().trim()).where((s) => s.isNotEmpty).toList();
        }
      }
    } catch (e) {
      debugPrint('GlorovSearchService: Failed to read recent searches: $e');
    }
    return [];
  }

  void addRecentSearch(String term) {
    final clean = term.trim();
    if (clean.isEmpty) return;

    try {
      final current = getRecentSearches();
      // Remove if already exists so it jumps to top
      current.removeWhere((item) => item.toLowerCase() == clean.toLowerCase());
      current.insert(0, clean);

      if (current.length > _maxRecentSearches) {
        current.removeRange(_maxRecentSearches, current.length);
      }

      GlorovLocalStorage.instance.setItem(_storageKey, jsonEncode(current));
    } catch (e) {
      debugPrint('GlorovSearchService: Failed to persist recent search: $e');
    }
  }

  void removeRecentSearch(String term) {
    try {
      final current = getRecentSearches();
      current.removeWhere((item) => item.toLowerCase() == term.trim().toLowerCase());
      GlorovLocalStorage.instance.setItem(_storageKey, jsonEncode(current));
    } catch (e) {
      debugPrint('GlorovSearchService: Failed to remove search term: $e');
    }
  }

  void clearRecentSearches() {
    try {
      GlorovLocalStorage.instance.removeItem(_storageKey);
    } catch (e) {
      debugPrint('GlorovSearchService: Failed to clear recent searches: $e');
    }
  }

  // ---------------------------------------------------------------------------
  // Core Search Execution & Relevance Scoring
  // ---------------------------------------------------------------------------

  /// Performs full search and computes closest product match, ranked products,
  /// predictive keywords, and matching categories.
  Future<GlorovSearchResult> search(
    String rawQuery, {
    String? categoryFilter,
    String? sortBy,
  }) async {
    final query = rawQuery.trim();

    // 1. Fetch matching products from repository
    final filter = GlorovProductFilter(
      searchQuery: query.isNotEmpty ? query : null,
      category: (categoryFilter != null && categoryFilter != 'All')
          ? categoryFilter
          : null,
      sortBy: sortBy,
    );

    final allMatched = await GlorovRepositories.products.getProducts(filter: filter);

    if (query.isEmpty) {
      return GlorovSearchResult(
        query: '',
        products: allMatched,
        matchedCategories: const [],
        keywordSuggestions: const [],
      );
    }

    final queryLower = query.toLowerCase();

    // 2. Score products for closest match relevance
    final scoredProducts = <_ScoredProduct>[];
    final categoryMatches = <String>{};

    for (final product in allMatched) {
      int score = 0;
      final titleLower = product.title.toLowerCase();
      final botLower = product.botanicalName.toLowerCase();
      final catLower = product.category.toLowerCase();
      final subLower = product.subcategory.toLowerCase();
      final descLower = product.description.toLowerCase();

      if (titleLower == queryLower) {
        score += 100;
      } else if (titleLower.startsWith(queryLower)) {
        score += 60;
      } else if (titleLower.contains(queryLower)) {
        score += 35;
      }

      if (botLower == queryLower) {
        score += 50;
      } else if (botLower.contains(queryLower)) {
        score += 25;
      }

      if (catLower.contains(queryLower) || subLower.contains(queryLower)) {
        score += 20;
        categoryMatches.add(product.category);
      }

      if (descLower.contains(queryLower)) {
        score += 10;
      }

      if (product.isBestSeller) score += 5;
      if (product.rating >= 4.5) score += 5;
      if (product.inStock) score += 10;

      scoredProducts.add(_ScoredProduct(product, score));
    }

    // Sort by relevance score descending
    scoredProducts.sort((a, b) => b.score.compareTo(a.score));

    final rankedProducts = scoredProducts.map((sp) => sp.product).toList();
    final closest = rankedProducts.isNotEmpty ? rankedProducts.first : null;

    // 3. Generate keyword suggestions
    final suggestionSet = <String>{};

    // Include closest product title as primary suggestion
    if (closest != null) {
      suggestionSet.add(closest.title);
    }

    // Include matching trending searches
    for (final trending in trendingSearches) {
      if (trending.toLowerCase().contains(queryLower)) {
        suggestionSet.add(trending);
      }
    }

    // Include titles of other top matched products
    for (final p in rankedProducts.take(4)) {
      suggestionSet.add(p.title);
      if (p.botanicalName.isNotEmpty &&
          p.botanicalName.toLowerCase().contains(queryLower)) {
        suggestionSet.add(p.botanicalName);
      }
    }

    return GlorovSearchResult(
      query: query,
      closestProduct: closest,
      products: rankedProducts,
      keywordSuggestions: suggestionSet.toList(),
      matchedCategories: categoryMatches.toList(),
    );
  }
}

class _ScoredProduct {
  final GlorovProduct product;
  final int score;

  const _ScoredProduct(this.product, this.score);
}
