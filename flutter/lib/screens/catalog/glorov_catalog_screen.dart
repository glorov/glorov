import 'package:flutter/material.dart';
import '../../components/common/glorov_y_scroll_pass_through.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../../models/glorov/glorov_product.dart';
import '../../repositories/contracts/product_repository.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_header_scroll_notifier.dart';

enum GlorovSortOption {
  recommended,
  priceAsc,
  priceDesc,
  highestRated,
  bestSelling,
}

/// GLOROV Reusable Product Catalog, Category, and Search Results Screen
class GlorovCatalogScreen extends StatefulWidget {
  final String? initialCategory;
  final String? initialSearchQuery;
  final GlorovProductType? initialProductType;
  final bool initialOffersOnly;
  final bool isLoading;

  const GlorovCatalogScreen({
    super.key,
    this.initialCategory,
    this.initialSearchQuery,
    this.initialProductType,
    this.initialOffersOnly = false,
    this.isLoading = false,
  });

  @override
  State<GlorovCatalogScreen> createState() => _GlorovCatalogScreenState();
}

class _GlorovCatalogScreenState extends State<GlorovCatalogScreen> {
  late String _selectedCategory;
  String _selectedSubcategory = 'All';
  late String _searchQuery;
  GlorovSortOption _currentSort = GlorovSortOption.recommended;
  late bool _offersOnly;
  String _selectedPriceBracket = 'All'; // 'All', '<300', '300-700', '700+'

  // Filter States
  GlorovProductType? _filterProductType;
  double? _maxPrice;
  double? _minPrice;
  bool _inStockOnly = false;
  double? _minRating;

  List<GlorovProduct>? _remoteProducts;
  List<GlorovProductCategory>? _remoteCategories;
  bool _isLoadingProducts = true;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All Botanical';
    _searchQuery = widget.initialSearchQuery ?? '';
    _filterProductType = widget.initialProductType;
    _offersOnly =
        widget.initialOffersOnly || _selectedCategory.toLowerCase() == 'offers';
    _syncNavCategory();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final results = await Future.wait([
        GlorovRepositories.products.getProducts(),
        GlorovRepositories.products.getCategories(),
      ]);
      if (mounted) {
        setState(() {
          _remoteProducts = results[0] as List<GlorovProduct>;
          _remoteCategories = results[1] as List<GlorovProductCategory>;
          _isLoadingProducts = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _remoteProducts = [];
          _remoteCategories = [];
          _isLoadingProducts = false;
        });
      }
    }
  }

  @override
  void didUpdateWidget(GlorovCatalogScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialCategory != widget.initialCategory ||
        oldWidget.initialOffersOnly != widget.initialOffersOnly) {
      setState(() {
        _selectedCategory = widget.initialCategory ?? 'All Botanical';
        _selectedSubcategory = 'All';
        _offersOnly = widget.initialOffersOnly ||
            _selectedCategory.toLowerCase() == 'offers';
      });
      _syncNavCategory();
    }
  }

  void _syncNavCategory() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      String navCat = 'Seeds';
      final c = _selectedCategory.toLowerCase();
      if (_offersOnly || c == 'offers') {
        navCat = 'Offers';
      } else if (c.contains('live plant') || c == 'plants') {
        navCat = 'Live Plants';
      } else if (c.contains('flowering')) {
        navCat = 'Flowering';
      } else if (c.contains('planter') || c.contains('pot')) {
        navCat = 'Planters';
      } else if (c.contains('care') || c.contains('soil')) {
        navCat = 'Plant Care';
      } else if (c.contains('herb')) {
        navCat = 'Herbs';
      } else if (c.contains('vegetable')) {
        navCat = 'Vegetables';
      } else if (c.contains('seed')) {
        navCat = 'Seeds';
      }
      GlorovHeaderScrollNotifier.instance.selectCategory(navCat);
    });
  }

  void _setPriceBracket(String bracket) {
    setState(() {
      _selectedPriceBracket = bracket;
      switch (bracket) {
        case '<300':
          _minPrice = null;
          _maxPrice = 300;
          break;
        case '300-700':
          _minPrice = 300;
          _maxPrice = 700;
          break;
        case '700+':
          _minPrice = 700;
          _maxPrice = null;
          break;
        default:
          _minPrice = null;
          _maxPrice = null;
          break;
      }
    });
  }

  void _clearAllFilters() {
    setState(() {
      _selectedSubcategory = 'All';
      _selectedPriceBracket = 'All';
      _filterProductType = null;
      _minPrice = null;
      _maxPrice = null;
      _inStockOnly = false;
      _minRating = null;
      _searchQuery = '';
    });
  }

  bool get _hasActiveFilters =>
      _selectedSubcategory != 'All' ||
      _selectedPriceBracket != 'All' ||
      _filterProductType != null ||
      _minPrice != null ||
      _maxPrice != null ||
      _inStockOnly ||
      _minRating != null ||
      _searchQuery.isNotEmpty;

  List<GlorovProduct> _getFilteredProducts() {
    List<GlorovProduct> list = List.from(_remoteProducts ?? const []);

    // Offers filter
    if (_offersOnly || _selectedCategory.toLowerCase() == 'offers') {
      list = list
          .where((p) =>
              (p.discountPercent != null && p.discountPercent! > 0) ||
              p.effectivePrice < p.price)
          .toList();
    }

    // Search query filter
    if (_searchQuery.trim().isNotEmpty) {
      final q = _searchQuery.trim().toLowerCase();
      list = list.where((p) {
        final title = p.title.toLowerCase();
        final bot = p.botanicalName.toLowerCase();
        final cat = p.category.toLowerCase();
        final sub = p.subcategory.toLowerCase();
        final desc = p.shortDescription.toLowerCase();
        final badges = p.badges.any((b) => b.toLowerCase().contains(q));
        return title.contains(q) ||
            bot.contains(q) ||
            cat.contains(q) ||
            sub.contains(q) ||
            desc.contains(q) ||
            badges;
      }).toList();
    }

    // Category filter
    final catNormalized = _selectedCategory.toLowerCase();
    if (catNormalized != 'all botanical' &&
        catNormalized != 'all' &&
        catNormalized != 'offers') {
      list = list.where((p) {
        final cat = p.category.toLowerCase();
        final sub = p.subcategory.toLowerCase();
        if (catNormalized == 'flowering' ||
            catNormalized == 'flowering plants') {
          return sub.contains('flowering') || cat.contains('flowering');
        }
        if (catNormalized == 'herbs' || catNormalized == 'fruit & herb seeds') {
          return sub.contains('herb') ||
              cat.contains('herb') ||
              p.title.toLowerCase().contains('herb');
        }
        if (catNormalized == 'vegetables' ||
            catNormalized == 'vegetable seeds') {
          return sub.contains('vegetable') || cat.contains('vegetable');
        }
        if (catNormalized == 'planters' || catNormalized == 'planters & pots') {
          return cat.contains('planter') || cat.contains('pot');
        }
        if (catNormalized == 'plant care' ||
            catNormalized == 'plant care & soil') {
          return cat.contains('care') || cat.contains('soil');
        }
        if (catNormalized == 'live plants' || catNormalized == 'plants') {
          return cat.contains('plant') || cat.contains('live');
        }
        if (catNormalized == 'seeds') {
          return cat.contains('seed');
        }
        return cat == catNormalized || sub == catNormalized;
      }).toList();
    }

    // Subcategory filter
    if (_selectedSubcategory != 'All') {
      list = list
          .where((p) =>
              p.subcategory.toLowerCase() == _selectedSubcategory.toLowerCase())
          .toList();
    }

    // Product Type filter
    if (_filterProductType != null) {
      list = list.where((p) => p.productType == _filterProductType).toList();
    }

    // Price filters
    if (_minPrice != null) {
      list = list.where((p) => p.effectivePrice >= _minPrice!).toList();
    }
    if (_maxPrice != null) {
      list = list.where((p) => p.effectivePrice <= _maxPrice!).toList();
    }

    // In Stock filter
    if (_inStockOnly) {
      list = list.where((p) => p.inStock).toList();
    }

    // Rating filter
    if (_minRating != null) {
      list = list.where((p) => p.rating >= _minRating!).toList();
    }

    // Sorting
    switch (_currentSort) {
      case GlorovSortOption.recommended:
        list.sort((a, b) {
          if (a.isBestSeller && !b.isBestSeller) return -1;
          if (!a.isBestSeller && b.isBestSeller) return 1;
          return 0;
        });
        break;
      case GlorovSortOption.priceAsc:
        list.sort((a, b) => a.effectivePrice.compareTo(b.effectivePrice));
        break;
      case GlorovSortOption.priceDesc:
        list.sort((a, b) => b.effectivePrice.compareTo(a.effectivePrice));
        break;
      case GlorovSortOption.highestRated:
        list.sort((a, b) => b.rating.compareTo(a.rating));
        break;
      case GlorovSortOption.bestSelling:
        list.sort((a, b) => b.reviewCount.compareTo(a.reviewCount));
        break;
    }

    return list;
  }

  GlorovProductCategory? get _currentCategoryData {
    if (_remoteCategories == null) return null;
    final catNorm = _selectedCategory.toLowerCase();
    try {
      return _remoteCategories!.firstWhere((c) {
        final ct = c.name.toLowerCase();
        final cs = c.slug.toLowerCase();
        return ct == catNorm ||
            cs == catNorm ||
            (catNorm == 'planters' && cs.contains('planter')) ||
            (catNorm == 'plant care' && cs.contains('plant-care')) ||
            (catNorm == 'live plants' && cs.contains('live-plants')) ||
            (catNorm == 'seeds' && cs.contains('seeds'));
      });
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final filtered = _getFilteredProducts();

    return GlorovStorefrontScaffold(
      currentRoute: discoverScreenRoute,
      backgroundColor: AppColors.surfaceCream,
      onSearchSubmitted: (q) {
        setState(() {
          _searchQuery = q;
        });
      },
      child: Column(
        children: [
          // 1. Breadcrumbs & Banner
          _buildHeaderBanner(context, filtered.length, isDesktop),

          // 2. Main Catalog Body with Responsive Full-Width Layout
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: isDesktop ? AppSpacing.xl : AppSpacing.md,
              vertical: AppSpacing.lg,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: AppBreakpoints.maxContentWidth,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Toolbar: Results Count & Sort Dropdown
                    _buildToolbar(context, filtered.length, isDesktop),

                    const SizedBox(height: AppSpacing.sm),

                    // Minimalist Top Filter Bar (Price brackets, In Stock, Rating)
                    _buildTopFilterBar(isDesktop),

                    // Active Filter Chips Bar
                    if (_hasActiveFilters) _buildActiveFilterChips(),

                    const SizedBox(height: AppSpacing.md),

                    // Full-width Responsive Product Grid (Zero 260px sidebar clutter!)
                    _buildProductGrid(filtered, isDesktop),
                  ],
                ),
              ),
            ),
          ),

          // 3. Footer
          const GlorovFooter(),
        ],
      ),
    );
  }

  Widget _buildHeaderBanner(BuildContext context, int count, bool isDesktop) {
    final catData = _currentCategoryData;
    final isSearch = _searchQuery.isNotEmpty;
    final catNormalized = _selectedCategory.toLowerCase();
    final categorySubcategories = (_remoteProducts ?? [])
        .where((p) =>
            p.category.toLowerCase() == _selectedCategory.toLowerCase() &&
            p.subcategory.trim().isNotEmpty)
        .map((p) => p.subcategory.trim())
        .toSet()
        .toList();

    String title;
    String subtitle;
    if (isSearch) {
      title = 'Search Results';
      subtitle = 'Showing matching results for "$_searchQuery"';
    } else if (catData != null) {
      title = catData.name;
      subtitle =
          'Discover botanical ${catData.name.toLowerCase()} curated for home and garden cultivation.';
    } else if (catNormalized == 'flowering' ||
        catNormalized == 'flowering plants') {
      title = 'Flowering Plants';
      subtitle =
          'Vibrant seasonal blooms and elegant perennial flowering plants for your home and garden.';
    } else if (catNormalized == 'herbs' ||
        catNormalized == 'fruit & herb seeds') {
      title = 'Fruit & Herb Seeds';
      subtitle =
          'Fragrant culinary kitchen herbs and high-yield fruit seeds tested for maximum germination.';
    } else if (catNormalized == 'vegetables' ||
        catNormalized == 'vegetable seeds') {
      title = 'Vegetable Seeds';
      subtitle =
          'Certified organic, high-germination Desi heirloom vegetable seeds for your kitchen garden.';
    } else if (_offersOnly || catNormalized == 'offers') {
      title = 'Botanical Offers & Deals';
      subtitle =
          'Exclusive discounts, curated bundles, and seasonal deals on live plants, seeds, and gardening tools.';
    } else {
      title =
          _selectedCategory.isNotEmpty && _selectedCategory != 'All Botanical'
              ? _selectedCategory
              : 'All Seeds & Live Plants';
      subtitle =
          'Browse our entire harvest of certified organic heirloom seeds, acclimatized foliage, and planters.';
    }

    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        color: AppColors.surfacePure,
        border: Border(
          bottom: BorderSide(color: AppColors.borderSubtle, width: 1),
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.xl : AppSpacing.md,
        vertical: AppSpacing.lg,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Breadcrumb Navigation
              Row(
                children: [
                  InkWell(
                    key: const Key('catalog_back_button'),
                    onTap: () {
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      } else {
                        Navigator.pushReplacementNamed(context, homeScreenRoute);
                      }
                    },
                    borderRadius: BorderRadius.circular(4),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 2),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.arrow_back_ios,
                              size: 11, color: AppColors.forestDark),
                          SizedBox(width: 4),
                          Text(
                            'Back',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.forestDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      '|',
                      style: TextStyle(
                        color: AppColors.borderSubtle,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  InkWell(
                    onTap: () {
                      if (Navigator.canPop(context)) {
                        Navigator.popUntil(context, (route) => route.isFirst);
                      } else {
                        Navigator.pushReplacementNamed(context, homeScreenRoute);
                      }
                    },
                    child: const Text(
                      'Home',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                  const Text('  /  ',
                      style:
                          TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  InkWell(
                    onTap: () {
                      setState(() {
                        _selectedCategory = 'All Botanical';
                        _searchQuery = '';
                      });
                    },
                    child: const Text(
                      'Catalog',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                  if (_selectedCategory != 'All Botanical' && !isSearch) ...[
                    const Text('  /  ',
                        style: TextStyle(
                            color: AppColors.textMuted, fontSize: 12)),
                    Text(
                      title,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Title and Subtitle
              Text(
                title,
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: isDesktop ? 32 : 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: isDesktop ? 14 : 13,
                  color: AppColors.textSecondary,
                ),
              ),

              // Subcategory Pills (if available for current category)
              if (categorySubcategories.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.md),
                GlorovYScrollPassThrough(
                  child: ScrollConfiguration(
                    behavior: const GlorovHorizontalScrollBehavior(),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: categorySubcategories.map((sub) {
                          final isSelected = _selectedSubcategory == sub;
                          return GlorovYScrollPassThrough(
                            child: Padding(
                              padding:
                                  const EdgeInsets.only(right: AppSpacing.sm),
                              child: ChoiceChip(
                                label: Text(sub),
                                selected: isSelected,
                                onSelected: (selected) {
                                  setState(() {
                                    _selectedSubcategory =
                                        selected ? sub : 'All';
                                  });
                                },
                                selectedColor: AppColors.forestDeep,
                                backgroundColor: AppColors.surfacePure,
                                labelStyle: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w600,
                                  color: isSelected
                                      ? Colors.white
                                      : AppColors.textSecondary,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: AppRadii.roundedFull,
                                  side: BorderSide(
                                    color: isSelected
                                        ? AppColors.forestDeep
                                        : AppColors.borderSubtle,
                                  ),
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToolbar(BuildContext context, int count, bool isDesktop) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Product Count
        Text(
          '$count botanical items available',
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),

        // Sorting Dropdown
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedMd,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<GlorovSortOption>(
              value: _currentSort,
              icon: const Icon(Icons.keyboard_arrow_down, size: 18),
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              onChanged: (val) {
                if (val != null) {
                  setState(() {
                    _currentSort = val;
                  });
                }
              },
              items: const [
                DropdownMenuItem(
                  value: GlorovSortOption.recommended,
                  child: Text('Sort: Recommended'),
                ),
                DropdownMenuItem(
                  value: GlorovSortOption.priceAsc,
                  child: Text('Price: Low to High'),
                ),
                DropdownMenuItem(
                  value: GlorovSortOption.priceDesc,
                  child: Text('Price: High to Low'),
                ),
                DropdownMenuItem(
                  value: GlorovSortOption.highestRated,
                  child: Text('Highest Rated'),
                ),
                DropdownMenuItem(
                  value: GlorovSortOption.bestSelling,
                  child: Text('Bestselling'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  /// Minimalist Top Filter Bar (Price brackets, In Stock, Rating, Clear)
  Widget _buildTopFilterBar(bool isDesktop) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(top: 4, bottom: AppSpacing.xs),
      child: GlorovYScrollPassThrough(
        child: ScrollConfiguration(
          behavior: const GlorovHorizontalScrollBehavior(),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                // Price Range Filter Chips
                _buildPriceChip('All Prices', 'All'),
                const SizedBox(width: 8),
                _buildPriceChip('Under ₹300', '<300'),
                const SizedBox(width: 8),
                _buildPriceChip('₹300 - ₹700', '300-700'),
                const SizedBox(width: 8),
                _buildPriceChip('₹700+', '700+'),
                const SizedBox(width: 12),

                // Vertical Divider
                Container(
                  height: 20,
                  width: 1,
                  color: AppColors.borderSubtle,
                ),
                const SizedBox(width: 12),

                // In Stock Toggle Chip
                FilterChip(
                  label: const Text('In Stock Only'),
                  selected: _inStockOnly,
                  onSelected: (val) {
                    setState(() => _inStockOnly = val);
                  },
                  selectedColor: const Color(0xFFE8F5E9),
                  backgroundColor: AppColors.surfacePure,
                  checkmarkColor: AppColors.forestDeep,
                  labelStyle: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight:
                        _inStockOnly ? FontWeight.w700 : FontWeight.w500,
                    color: _inStockOnly
                        ? AppColors.forestDeep
                        : AppColors.textSecondary,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: AppRadii.roundedFull,
                    side: BorderSide(
                      color: _inStockOnly
                          ? AppColors.forestDeep
                          : AppColors.borderSubtle,
                    ),
                  ),
                ),
                const SizedBox(width: 8),

                // 4.5+ Rating Filter Chip
                FilterChip(
                  label: const Text('★ 4.5+ Stars'),
                  selected: _minRating != null && _minRating! >= 4.5,
                  onSelected: (val) {
                    setState(() => _minRating = val ? 4.5 : null);
                  },
                  selectedColor: const Color(0xFFFEF3C7),
                  backgroundColor: AppColors.surfacePure,
                  checkmarkColor: const Color(0xFFD97706),
                  labelStyle: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight: (_minRating != null && _minRating! >= 4.5)
                        ? FontWeight.w700
                        : FontWeight.w500,
                    color: (_minRating != null && _minRating! >= 4.5)
                        ? const Color(0xFFB45309)
                        : AppColors.textSecondary,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: AppRadii.roundedFull,
                    side: BorderSide(
                      color: (_minRating != null && _minRating! >= 4.5)
                          ? const Color(0xFFF59E0B)
                          : AppColors.borderSubtle,
                    ),
                  ),
                ),

                if (_hasActiveFilters) ...[
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: _clearAllFilters,
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 10),
                      minimumSize: const Size(40, 32),
                    ),
                    child: const Text(
                      'Clear',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: AppColors.error,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPriceChip(String label, String bracket) {
    final isSelected = _selectedPriceBracket == bracket;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => _setPriceBracket(bracket),
      selectedColor: AppColors.forestDeep,
      backgroundColor: AppColors.surfacePure,
      labelStyle: TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 12,
        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
        color: isSelected ? Colors.white : AppColors.textSecondary,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: AppRadii.roundedFull,
        side: BorderSide(
          color: isSelected ? AppColors.forestDeep : AppColors.borderSubtle,
        ),
      ),
    );
  }

  Widget _buildActiveFilterChips() {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.xs, bottom: AppSpacing.xs),
      child: Wrap(
        spacing: AppSpacing.xs,
        runSpacing: AppSpacing.xs,
        crossAxisAlignment: WrapCrossAlignment.center,
        children: [
          const Text(
            'Active Filters:',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
          if (_searchQuery.isNotEmpty)
            _filterChip('Query: "$_searchQuery"', () {
              setState(() => _searchQuery = '');
            }),
          if (_selectedSubcategory != 'All')
            _filterChip('Subcategory: $_selectedSubcategory', () {
              setState(() => _selectedSubcategory = 'All');
            }),
          if (_selectedPriceBracket != 'All')
            _filterChip('Price: $_selectedPriceBracket', () {
              _setPriceBracket('All');
            }),
          if (_inStockOnly)
            _filterChip('In Stock Only', () {
              setState(() => _inStockOnly = false);
            }),
          if (_minRating != null)
            _filterChip('⭐ ${_minRating!.toInt()}+ Stars', () {
              setState(() => _minRating = null);
            }),
          TextButton(
            onPressed: _clearAllFilters,
            child: const Text(
              'Clear All',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: AppColors.error,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _filterChip(String label, VoidCallback onRemove) {
    return Chip(
      label: Text(label),
      deleteIcon: const Icon(Icons.close, size: 14),
      onDeleted: onRemove,
      backgroundColor: AppColors.mintBadge,
      labelStyle: const TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppColors.forestDeep,
      ),
      shape: const RoundedRectangleBorder(
        borderRadius: AppRadii.roundedFull,
        side: BorderSide(color: AppColors.borderSubtle),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }

  Widget _buildProductGrid(List<GlorovProduct> products, bool isDesktop) {
    final width = MediaQuery.of(context).size.width;
    int crossAxisCount = 2;
    double childAspectRatio = 0.63;

    if (isDesktop) {
      crossAxisCount = width >= 1200 ? 4 : (width >= 800 ? 3 : 2);
      childAspectRatio = 0.70;
    } else if (width >= 640) {
      crossAxisCount = 3;
      childAspectRatio = 0.66;
    }

    if (widget.isLoading || _isLoadingProducts || _remoteProducts == null) {
      return GlorovProductGridSkeleton(
        count: 8,
        crossAxisCount: crossAxisCount,
        childAspectRatio: childAspectRatio,
      );
    }

    if (products.isEmpty) {
      return _buildEmptyState();
    }

    final isMobile = width < 640;
    final double crossAxisSpacing = isMobile ? 8.0 : AppSpacing.md;
    final double mainAxisSpacing = isMobile ? 10.0 : AppSpacing.md;

    return GlorovSkeletonLoader(
      loading: widget.isLoading || _isLoadingProducts || _remoteProducts == null,
      skeleton: GlorovProductGridSkeleton(
        count: 8,
        crossAxisCount: crossAxisCount,
        childAspectRatio: childAspectRatio,
      ),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: products.length,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: crossAxisSpacing,
          mainAxisSpacing: mainAxisSpacing,
          childAspectRatio: childAspectRatio,
        ),
        itemBuilder: (context, index) {
          return GlorovStaggeredItem(
            index: index < 6 ? index : 5,
            child: GlorovProductCard(product: products[index]),
          );
        },
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.xxl),
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.mintSurface,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.search_off_rounded,
              size: 48,
              color: AppColors.forestDeep,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'No botanical items match your filters',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'Try expanding your price range, clearing active search queries, or exploring our general seed collection.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton.icon(
            onPressed: _clearAllFilters,
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Reset All Filters'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDeep,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}
