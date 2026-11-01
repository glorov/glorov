import 'package:flutter/material.dart';
import '../../components/common/glorov_y_scroll_pass_through.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_product.dart';
import '../../route/route_constants.dart';

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

  const GlorovCatalogScreen({
    super.key,
    this.initialCategory,
    this.initialSearchQuery,
    this.initialProductType,
  });

  @override
  State<GlorovCatalogScreen> createState() => _GlorovCatalogScreenState();
}

class _GlorovCatalogScreenState extends State<GlorovCatalogScreen> {
  late String _selectedCategory;
  String _selectedSubcategory = 'All';
  late String _searchQuery;
  GlorovSortOption _currentSort = GlorovSortOption.recommended;

  // Filter States
  GlorovProductType? _filterProductType;
  double? _maxPrice;
  double? _minPrice;
  bool _inStockOnly = false;
  double? _minRating;
  String? _selectedSunlight;

  @override
  void initState() {
    super.initState();
    _selectedCategory = widget.initialCategory ?? 'All Botanical';
    _searchQuery = widget.initialSearchQuery ?? '';
    _filterProductType = widget.initialProductType;
  }

  void _clearAllFilters() {
    setState(() {
      _selectedSubcategory = 'All';
      _filterProductType = null;
      _minPrice = null;
      _maxPrice = null;
      _inStockOnly = false;
      _minRating = null;
      _selectedSunlight = null;
      _searchQuery = '';
    });
  }

  bool get _hasActiveFilters =>
      _selectedSubcategory != 'All' ||
      _filterProductType != null ||
      _minPrice != null ||
      _maxPrice != null ||
      _inStockOnly ||
      _minRating != null ||
      _selectedSunlight != null ||
      _searchQuery.isNotEmpty;

  List<GlorovProduct> _getFilteredProducts() {
    List<GlorovProduct> list = List.from(GlorovMockData.products);

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
    if (_selectedCategory != 'All Botanical' && _selectedCategory != 'All') {
      final selectedCat = _selectedCategory.toLowerCase();
      list = list
          .where((p) =>
              p.category.toLowerCase() == selectedCat ||
              p.subcategory.toLowerCase() == selectedCat)
          .toList();
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

    // Sunlight filter
    if (_selectedSunlight != null) {
      list = list
          .where((p) => p.sunlightRequirement
              .toLowerCase()
              .contains(_selectedSunlight!.toLowerCase()))
          .toList();
    }

    // Sorting
    switch (_currentSort) {
      case GlorovSortOption.recommended:
        // Featured and bestsellers first
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

  GlorovCategory? get _currentCategoryData {
    try {
      return GlorovMockData.categories.firstWhere(
        (c) => c.title.toLowerCase() == _selectedCategory.toLowerCase(),
      );
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

          // 2. Main Catalog Body with Responsive Layout
          Container(
            width: double.infinity,
            padding: EdgeInsets.symmetric(
              horizontal: isDesktop ? AppSpacing.lg : AppSpacing.md,
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
                    // Toolbar: Results Count, Mobile Filter Trigger, Sort Dropdown
                    _buildToolbar(
                        context, filtered.length, isDesktop),

                    // Active Filter Chips Bar
                    if (_hasActiveFilters) _buildActiveFilterChips(),

                    const SizedBox(height: AppSpacing.lg),

                    // Grid + Sidebar
                    isDesktop
                        ? Row(
                            crossAxisAlignment:
                                CrossAxisAlignment.start,
                            children: [
                              // Sidebar Filters (260px)
                              SizedBox(
                                width: 260,
                                child: _buildFilterSidebarContent(),
                              ),
                              const SizedBox(width: AppSpacing.xl),
                              // Product Grid
                              Expanded(
                                child: _buildProductGrid(
                                    filtered, isDesktop),
                              ),
                            ],
                          )
                        : _buildProductGrid(filtered, isDesktop),
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

    String title;
    String subtitle;
    if (isSearch) {
      title = 'Search Results';
      subtitle = 'Showing matching results for "$_searchQuery"';
    } else if (catData != null) {
      title = catData.title;
      subtitle = catData.description;
    } else {
      title = 'All Seeds & Live Plants';
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
                    onTap: () => Navigator.pushNamed(context, homeScreenRoute),
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
                      _selectedCategory,
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
              if (catData != null && catData.subcategories.isNotEmpty) ...[
                const SizedBox(height: AppSpacing.md),
                GlorovYScrollPassThrough(
                  child: ScrollConfiguration(
                    behavior: const GlorovHorizontalScrollBehavior(),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        children: catData.subcategories.map((sub) {
                          final isSelected = _selectedSubcategory == sub;
                          return GlorovYScrollPassThrough(
                            child: Padding(
                              padding: const EdgeInsets.only(right: AppSpacing.sm),
                              child: ChoiceChip(
                                label: Text(sub),
                                selected: isSelected,
                                onSelected: (selected) {
                                  setState(() {
                                    _selectedSubcategory = selected ? sub : 'All';
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

        // Actions: Mobile Filter Modal Trigger + Sort Dropdown
        Row(
          children: [
            if (!isDesktop) ...[
              OutlinedButton.icon(
                onPressed: () => _openMobileFilterSheet(context),
                icon: const Icon(Icons.tune, size: 16),
                label: Text(
                  _hasActiveFilters ? 'Filters (Active)' : 'Filters',
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.forestDeep,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  side: BorderSide(
                    color: _hasActiveFilters
                        ? AppColors.forestDeep
                        : AppColors.borderMedium,
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
            ],

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
        ),
      ],
    );
  }

  Widget _buildActiveFilterChips() {
    return Padding(
      padding: const EdgeInsets.only(top: AppSpacing.md),
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
          if (_filterProductType != null)
            _filterChip('Type: ${_filterProductType!.name.toUpperCase()}', () {
              setState(() => _filterProductType = null);
            }),
          if (_minPrice != null || _maxPrice != null)
            _filterChip(
              '₹${_minPrice?.toInt() ?? 0} - ₹${_maxPrice?.toInt() ?? '2000+'}',
              () {
                setState(() {
                  _minPrice = null;
                  _maxPrice = null;
                });
              },
            ),
          if (_inStockOnly)
            _filterChip('In Stock Only', () {
              setState(() => _inStockOnly = false);
            }),
          if (_minRating != null)
            _filterChip('⭐ ${_minRating!.toInt()}+ Stars', () {
              setState(() => _minRating = null);
            }),
          if (_selectedSunlight != null)
            _filterChip('Light: $_selectedSunlight', () {
              setState(() => _selectedSunlight = null);
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

  Widget _buildFilterSidebarContent() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Filter Products',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              if (_hasActiveFilters)
                InkWell(
                  onTap: _clearAllFilters,
                  child: const Text(
                    'Reset',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.forestDeep,
                    ),
                  ),
                ),
            ],
          ),
          const Divider(height: AppSpacing.lg),

          // Categories Selection
          _sidebarSectionTitle('Categories'),
          ...GlorovMockData.categories.map((cat) {
            final isSelected = _selectedCategory == cat.title;
            return InkWell(
              onTap: () {
                setState(() {
                  _selectedCategory = cat.title;
                  _selectedSubcategory = 'All';
                });
              },
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    Icon(
                      isSelected
                          ? Icons.radio_button_checked
                          : Icons.radio_button_off,
                      size: 16,
                      color: isSelected
                          ? AppColors.forestDeep
                          : AppColors.textMuted,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        cat.title,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          fontWeight:
                              isSelected ? FontWeight.w700 : FontWeight.w400,
                          color: isSelected
                              ? AppColors.forestDeep
                              : AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }),

          const Divider(height: AppSpacing.lg),

          // Product Type
          _sidebarSectionTitle('Product Type'),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: GlorovProductType.values.map((type) {
              final isSel = _filterProductType == type;
              return ChoiceChip(
                label: Text(type.name.toUpperCase()),
                selected: isSel,
                onSelected: (selected) {
                  setState(() {
                    _filterProductType = selected ? type : null;
                  });
                },
                selectedColor: AppColors.forestDeep,
                backgroundColor: AppColors.surfaceCream,
                labelStyle: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isSel ? Colors.white : AppColors.textSecondary,
                ),
              );
            }).toList(),
          ),

          const Divider(height: AppSpacing.lg),

          // Price Ranges
          _sidebarSectionTitle('Price Range'),
          _priceRangeTile('Under ₹500', 0, 500),
          _priceRangeTile('₹500 - ₹1,000', 500, 1000),
          _priceRangeTile('₹1,000 - ₹2,000', 1000, 2000),
          _priceRangeTile('Above ₹2,000', 2000, 10000),

          const Divider(height: AppSpacing.lg),

          // Sunlight Requirements
          _sidebarSectionTitle('Sunlight Requirements'),
          _sunlightTile('Full Sun'),
          _sunlightTile('Bright, Indirect Light'),
          _sunlightTile('Low to Medium Indirect Light'),

          const Divider(height: AppSpacing.lg),

          // Availability
          CheckboxListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text(
              'In Stock Only',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
            ),
            value: _inStockOnly,
            activeColor: AppColors.forestDeep,
            onChanged: (val) {
              setState(() {
                _inStockOnly = val ?? false;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _sidebarSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.xs),
      child: Text(
        title,
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 13,
          fontWeight: FontWeight.w700,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _priceRangeTile(String label, double min, double max) {
    final isSelected = _minPrice == min && _maxPrice == max;
    return InkWell(
      onTap: () {
        setState(() {
          if (isSelected) {
            _minPrice = null;
            _maxPrice = null;
          } else {
            _minPrice = min;
            _maxPrice = max;
          }
        });
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.check_box : Icons.check_box_outline_blank,
              size: 16,
              color: isSelected ? AppColors.forestDeep : AppColors.textMuted,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color:
                    isSelected ? AppColors.forestDeep : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sunlightTile(String light) {
    final isSelected = _selectedSunlight == light;
    return InkWell(
      onTap: () {
        setState(() {
          _selectedSunlight = isSelected ? null : light;
        });
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            Icon(
              isSelected ? Icons.radio_button_checked : Icons.radio_button_off,
              size: 16,
              color: isSelected ? AppColors.forestDeep : AppColors.textMuted,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                light,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: isSelected
                      ? AppColors.forestDeep
                      : AppColors.textSecondary,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductGrid(List<GlorovProduct> products, bool isDesktop) {
    if (products.isEmpty) {
      return _buildEmptyState();
    }

    final width = MediaQuery.of(context).size.width;
    int crossAxisCount = 2;
    double childAspectRatio = 0.68;

    if (isDesktop) {
      crossAxisCount = width > 1200 ? 3 : 2;
      childAspectRatio = 0.72;
    } else if (width > 600) {
      crossAxisCount = 2;
      childAspectRatio = 0.70;
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: products.length,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: crossAxisCount,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
        childAspectRatio: childAspectRatio,
      ),
      itemBuilder: (context, index) {
        return GlorovStaggeredItem(
          index: index < 6 ? index : 5,
          child: GlorovProductCard(product: products[index]),
        );
      },
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

  void _openMobileFilterSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) {
        return Container(
          height: MediaQuery.of(context).size.height * 0.85,
          decoration: const BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: BorderRadius.only(
              topLeft: Radius.circular(AppRadii.lg),
              topRight: Radius.circular(AppRadii.lg),
            ),
          ),
          child: Column(
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Filter Botanical Products',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: _buildFilterSidebarContent(),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pop(ctx),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forestDeep,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('Apply Filters'),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
