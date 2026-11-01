import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_shadows.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_mock_data.dart';
import '../../../models/glorov/glorov_product.dart';
import '../../../repositories/glorov_repositories.dart';
import '../../../route/route_constants.dart';
import '../../../services/glorov_cart_state.dart';
import '../../../services/glorov_search_service.dart';

/// Custom PageRoute that opens the search page as a silky-smooth full-screen popup
class GlorovSearchPageRoute<T> extends PageRouteBuilder<T> {
  GlorovSearchPageRoute({
    required WidgetBuilder builder,
    super.settings,
  }) : super(
          pageBuilder: (context, animation, secondaryAnimation) =>
              builder(context),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Elegant slide-up + fade-in matching modern e-commerce mobile search UX
            final slideAnimation = Tween<Offset>(
              begin: const Offset(0.0, 0.05),
              end: Offset.zero,
            ).animate(
              CurvedAnimation(
                parent: animation,
                curve: Curves.easeOutCubic,
                reverseCurve: Curves.easeInCubic,
              ),
            );

            final fadeAnimation = Tween<double>(
              begin: 0.0,
              end: 1.0,
            ).animate(
              CurvedAnimation(
                parent: animation,
                curve: Curves.easeOut,
                reverseCurve: Curves.easeIn,
              ),
            );

            return SlideTransition(
              position: slideAnimation,
              child: FadeTransition(
                opacity: fadeAnimation,
                child: child,
              ),
            );
          },
          transitionDuration: const Duration(milliseconds: 240),
          reverseTransitionDuration: const Duration(milliseconds: 180),
          fullscreenDialog: true,
          barrierColor: Colors.black26,
        );
}

/// Full-Screen Pop-Up Botanical Search Experience
/// Delivers zero-query instant suggestions, predictive autocomplete,
/// top closest match card with high-res product image, and full search results.
class GlorovSearchScreen extends StatefulWidget {
  final String? initialQuery;

  const GlorovSearchScreen({
    super.key,
    this.initialQuery,
  });

  @override
  State<GlorovSearchScreen> createState() => _GlorovSearchScreenState();
}

class _GlorovSearchScreenState extends State<GlorovSearchScreen> {
  late final TextEditingController _searchController;
  final FocusNode _focusNode = FocusNode();
  final ScrollController _scrollController = ScrollController();

  GlorovSearchResult _searchResult = const GlorovSearchResult(query: '');
  List<String> _recentSearches = [];
  List<GlorovProduct> _popularPicks = GlorovMockData.products.take(6).toList();
  String _selectedCategory = 'All';
  String _selectedSort = 'relevance';
  bool _isLoading = false;
  bool _isSubmitted = false;
  Timer? _debounceTimer;
  int _searchRequestId = 0;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.initialQuery ?? '');
    _loadRecentSearches();
    _loadPopularPicks();

    if (widget.initialQuery != null && widget.initialQuery!.trim().isNotEmpty) {
      _executeSearch(widget.initialQuery!.trim(), isSubmitted: true);
    } else {
      // Auto-focus after the build phase for immediate keyboard popup
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _focusNode.requestFocus();
        }
      });
    }
  }

  Future<void> _loadPopularPicks() async {
    try {
      final products = await GlorovRepositories.products.getProducts();
      if (mounted && products.isNotEmpty) {
        setState(() {
          _popularPicks = products.take(6).toList();
        });
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    _focusNode.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _loadRecentSearches() {
    final history = GlorovSearchService.instance.getRecentSearches();
    setState(() {
      _recentSearches = history;
    });
  }

  void _onQueryChanged(String query) {
    _debounceTimer?.cancel();

    if (query.trim().isEmpty) {
      setState(() {
        _searchResult = const GlorovSearchResult(query: '');
        _isSubmitted = false;
        _isLoading = false;
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _isSubmitted = false;
    });

    _debounceTimer = Timer(const Duration(milliseconds: 250), () {
      _executeSearch(query, isSubmitted: false);
    });
  }

  Future<void> _executeSearch(String query, {required bool isSubmitted}) async {
    final clean = query.trim();
    if (clean.isEmpty) {
      setState(() {
        _searchResult = const GlorovSearchResult(query: '');
        _isLoading = false;
        _isSubmitted = false;
      });
      return;
    }

    final currentRequestId = ++_searchRequestId;
    setState(() => _isLoading = true);

    try {
      final result = await GlorovSearchService.instance.search(
        clean,
        categoryFilter: _selectedCategory != 'All' ? _selectedCategory : null,
        sortBy: _selectedSort,
      );

      // Discard stale out-of-order responses
      if (!mounted || currentRequestId != _searchRequestId) return;

      setState(() {
        _searchResult = result;
        _isLoading = false;
        _isSubmitted = isSubmitted;
      });

      if (isSubmitted) {
        GlorovSearchService.instance.addRecentSearch(clean);
        _loadRecentSearches();
      }
    } catch (e) {
      if (mounted && currentRequestId == _searchRequestId) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _submitSearch(String query) {
    _debounceTimer?.cancel();
    final clean = query.trim();
    if (clean.isEmpty) return;

    _focusNode.unfocus();
    _executeSearch(clean, isSubmitted: true);
  }

  void _selectSuggestion(String term) {
    _searchController.text = term;
    _searchController.selection = TextSelection.fromPosition(
      TextPosition(offset: term.length),
    );
    _submitSearch(term);
  }

  void _fillSearchInput(String term) {
    _searchController.text = term;
    _searchController.selection = TextSelection.fromPosition(
      TextPosition(offset: term.length),
    );
    _focusNode.requestFocus();
    _onQueryChanged(term);
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() {
      _searchResult = const GlorovSearchResult(query: '');
      _isSubmitted = false;
      _isLoading = false;
    });
    _focusNode.requestFocus();
  }

  void _removeRecentSearch(String term) {
    GlorovSearchService.instance.removeRecentSearch(term);
    _loadRecentSearches();
  }

  void _clearAllRecentSearches() {
    GlorovSearchService.instance.clearRecentSearches();
    _loadRecentSearches();
  }

  void _openProductDetails(GlorovProduct product) {
    Navigator.pushNamed(
      context,
      productDetailsScreenRoute,
      arguments: product,
    );
  }

  void _addToCart(GlorovProduct product) {
    HapticFeedback.lightImpact();
    GlorovCartState.instance.addToCart(product);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'Added "${product.title}" to cart',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.forestDeep,
        behavior: SnackBarBehavior.floating,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDesktop = MediaQuery.of(context).size.width >= 900;

    return Scaffold(
      backgroundColor: AppColors.surfacePure,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: isDesktop ? 960 : double.infinity,
            ),
            child: Column(
              children: [
                // 1. Top Search Navigation Header
                _buildSearchHeader(context),

                // 2. Main Search Body Area
                Expanded(
                  child: NotificationListener<ScrollNotification>(
                    onNotification: (scrollInfo) {
                      if (scrollInfo is UserScrollNotification &&
                          _focusNode.hasFocus) {
                        _focusNode.unfocus();
                      }
                      return false;
                    },
                    child: _buildBodyContent(theme),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Top Search Bar Header
  // ---------------------------------------------------------------------------

  Widget _buildSearchHeader(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xs,
      ),
      decoration: const BoxDecoration(
        color: AppColors.surfacePure,
        border: Border(
          bottom: BorderSide(
            color: AppColors.borderSubtle,
            width: 1.0,
          ),
        ),
      ),
      child: Row(
        children: [
          // Close / Back button
          IconButton(
            key: const Key('search_back_button'),
            icon: const Icon(
              Icons.arrow_back_rounded,
              color: AppColors.textPrimary,
              size: 24,
            ),
            tooltip: 'Close search',
            onPressed: () {
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                Navigator.pushReplacementNamed(context, homeScreenRoute);
              }
            },
          ),

          // Search Input Pill
          Expanded(
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: const Color(0xFFF4F4F5), // Soft subtle grey
                borderRadius: BorderRadius.circular(22),
              ),
              child: TextField(
                key: const Key('glorov_search_text_field'),
                controller: _searchController,
                focusNode: _focusNode,
                autofocus: widget.initialQuery == null ||
                    widget.initialQuery!.isEmpty,
                textInputAction: TextInputAction.search,
                textAlignVertical: TextAlignVertical.center,
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14.0,
                  color: AppColors.textPrimary,
                  height: 1.1,
                  leadingDistribution: TextLeadingDistribution.even,
                ),
                onChanged: _onQueryChanged,
                onSubmitted: _submitSearch,
                decoration: InputDecoration(
                  hintText: 'Search plants, seeds, fertilizers, pots...',
                  hintStyle: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    color: Color(0xFF9CA3AF),
                    fontSize: 13.5,
                    height: 1.1,
                    leadingDistribution: TextLeadingDistribution.even,
                  ),
                  isDense: true,
                  prefixIconConstraints: const BoxConstraints(
                    minWidth: 40,
                    minHeight: 44,
                  ),
                  prefixIcon: const Icon(
                    Icons.search_rounded,
                    color: AppColors.forestDeep, // Match botanical theme
                    size: 20,
                  ),
                  suffixIconConstraints: const BoxConstraints(
                    minWidth: 36,
                    minHeight: 44,
                  ),
                  suffixIcon: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_isLoading)
                        const Padding(
                          padding: EdgeInsets.symmetric(horizontal: 10),
                          child: SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                AppColors.forestDeep,
                              ),
                            ),
                          ),
                        )
                      else if (_searchController.text.isNotEmpty)
                        IconButton(
                          key: const Key('search_clear_button'),
                          icon: const Icon(
                            Icons.clear_rounded,
                            size: 18,
                            color: Color(0xFF9CA3AF),
                          ),
                          onPressed: _clearSearch,
                        ),
                    ],
                  ),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  errorBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  focusedErrorBorder: InputBorder.none,
                  filled: false,
                  contentPadding: const EdgeInsets.only(
                    left: 0,
                    right: 12,
                    top: 0,
                    bottom: 1.5,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(width: 4),

          // Search Action Button
          IconButton(
            key: const Key('search_submit_button'),
            icon: const Icon(
              Icons.search_rounded,
              color: AppColors.forestDeep,
              size: 24,
            ),
            tooltip: 'Search',
            onPressed: () => _submitSearch(_searchController.text),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Main Body Content Switcher
  // ---------------------------------------------------------------------------

  Widget _buildBodyContent(ThemeData theme) {
    final query = _searchController.text.trim();

    // 1. Initial Zero-Query State (History + Trending + Categories)
    if (query.isEmpty) {
      return _buildZeroQueryView(theme);
    }

    // 2. Full Submitted Results Grid View
    if (_isSubmitted) {
      return _buildSubmittedResultsView(theme);
    }

    // 3. As-You-Type Live Suggestions View (With Closest Match Card!)
    return _buildLiveSuggestionsView(theme);
  }

  // ---------------------------------------------------------------------------
  // View 1: Zero-Query State (Initial Screen)
  // ---------------------------------------------------------------------------

  Widget _buildZeroQueryView(ThemeData theme) {
    return ListView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      children: [
        // 1. Recent Searches (If Any)
        if (_recentSearches.isNotEmpty) ...[
          Row(
            children: [
              const Icon(
                Icons.history_rounded,
                size: 18,
                color: AppColors.textMuted,
              ),
              const SizedBox(width: 6),
              const Expanded(
                child: Text(
                  'Recent Searches',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              TextButton(
                onPressed: _clearAllRecentSearches,
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text(
                  'Clear All',
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
          const SizedBox(height: 6),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _recentSearches.map((term) {
              return Container(
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                ),
                child: InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () => _selectSuggestion(term),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.history_rounded,
                          size: 14,
                          color: AppColors.textMuted,
                        ),
                        const SizedBox(width: 6),
                        ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 160),
                          child: Text(
                            term,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12.5,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        GestureDetector(
                          onTap: () => _removeRecentSearch(term),
                          child: const Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: AppSpacing.lg),
        ],

        // 2. Trending Searches
        const Row(
          children: [
            Icon(
              Icons.local_fire_department_rounded,
              size: 20,
              color: Color(0xFFE11D48), // Flame red
            ),
            SizedBox(width: 6),
            Flexible(
              child: Text(
                'Trending Searches',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: GlorovSearchService.trendingSearches.map((trend) {
            return ActionChip(
              avatar: const Icon(
                Icons.trending_up_rounded,
                size: 15,
                color: AppColors.forestDeep,
              ),
              label: Text(
                trend,
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w500,
                  color: AppColors.textPrimary,
                ),
              ),
              backgroundColor: AppColors.surfacePure,
              side: const BorderSide(color: Color(0xFFE4E4E7)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              onPressed: () => _selectSuggestion(trend),
            );
          }).toList(),
        ),

        const SizedBox(height: AppSpacing.lg),

        // 3. Browse Botanical Categories
        const Row(
          children: [
            Icon(
              Icons.grid_view_rounded,
              size: 18,
              color: AppColors.forestDeep,
            ),
            SizedBox(width: 6),
            Flexible(
              child: Text(
                'Browse by Category',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: GlorovSearchService.categoryFilters.map((cat) {
              final isAll = cat == 'All';
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  label: Text(cat),
                  selected: _selectedCategory == cat,
                  selectedColor: AppColors.forestDeep.withOpacity(0.12),
                  checkmarkColor: AppColors.forestDeep,
                  backgroundColor: AppColors.surfaceSubtle,
                  side: BorderSide(
                    color: _selectedCategory == cat
                        ? AppColors.forestDeep
                        : const Color(0xFFE4E4E7),
                  ),
                  labelStyle: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    fontWeight: _selectedCategory == cat
                        ? FontWeight.w700
                        : FontWeight.w500,
                    color: _selectedCategory == cat
                        ? AppColors.forestDeep
                        : AppColors.textPrimary,
                  ),
                  onSelected: (selected) {
                    setState(() {
                      _selectedCategory = isAll ? 'All' : cat;
                    });
                    if (!isAll) {
                      _selectSuggestion(cat);
                    }
                  },
                ),
              );
            }).toList(),
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // 4. Botanical Picks (Popular Plants Preview with Images)
        const Row(
          children: [
            Icon(
              Icons.spa_rounded,
              size: 18,
              color: AppColors.forestDeep,
            ),
            SizedBox(width: 6),
            Flexible(
              child: Text(
                'Popular Botanical Picks',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.sm),
        ..._popularPicks.map((product) {
          return _buildProductListTile(product);
        }),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // View 2: As-You-Type Live Suggestions (With Closest Match Card!)
  // ---------------------------------------------------------------------------

  Widget _buildLiveSuggestionsView(ThemeData theme) {
    if (_isLoading && _searchResult.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.md),
        child: GlorovSearchSkeleton(count: 6),
      );
    }

    if (_searchResult.isEmpty && !_isLoading) {
      return _buildNoResultsState();
    }

    final closest = _searchResult.closestProduct;
    final otherProducts = _searchResult.products
        .where((p) => p.id != closest?.id)
        .take(5)
        .toList();

    return ListView(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      children: [
        // A. FEATURED CLOSEST RESULT / BEST MATCH CARD (With High-Res Image!)
        if (closest != null) ...[
          const Row(
            children: [
              Icon(
                Icons.verified_rounded,
                size: 18,
                color: AppColors.forestDeep,
              ),
              SizedBox(width: 6),
              Flexible(
                child: Text(
                  'Closest Result / Best Match',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.forestDeep,
                    letterSpacing: -0.2,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _buildClosestMatchCard(closest),
          const SizedBox(height: AppSpacing.lg),
        ],

        // B. Autocomplete Keyword Suggestions
        if (_searchResult.keywordSuggestions.isNotEmpty) ...[
          const Text(
            'Search Suggestions',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: 6),
          ..._searchResult.keywordSuggestions.take(4).map((keyword) {
            return ListTile(
              dense: true,
              contentPadding: EdgeInsets.zero,
              leading: const Icon(
                Icons.search_rounded,
                size: 20,
                color: AppColors.textMuted,
              ),
              title: _buildHighlightedText(
                keyword,
                _searchController.text.trim(),
              ),
              trailing: IconButton(
                icon: const Icon(
                  Icons.north_west_rounded,
                  size: 16,
                  color: AppColors.textMuted,
                ),
                tooltip: 'Insert into search',
                onPressed: () => _fillSearchInput(keyword),
              ),
              onTap: () => _selectSuggestion(keyword),
            );
          }),
          const Divider(height: 24, color: AppColors.borderSubtle),
        ],

        // C. Matching Products List (Thumbnails + Price + Details)
        if (otherProducts.isNotEmpty) ...[
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Matching Products (${_searchResult.products.length})',
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMuted,
                ),
              ),
              TextButton(
                onPressed: () => _submitSearch(_searchController.text),
                child: const Text(
                  'View All',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ...otherProducts.map((p) => _buildProductListTile(p)),
        ],

        const SizedBox(height: AppSpacing.lg),

        // Quick button to view all matching results in grid
        ElevatedButton.icon(
          key: const Key('view_all_results_button'),
          icon: const Icon(Icons.arrow_forward_rounded, size: 18),
          label: Text('See all ${_searchResult.products.length} results'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.forestDeep,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          onPressed: () => _submitSearch(_searchController.text),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // View 3: Full Submitted Results Grid View
  // ---------------------------------------------------------------------------

  Widget _buildSubmittedResultsView(ThemeData theme) {
    if (_isLoading && _searchResult.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(AppSpacing.md),
        child: GlorovProductGridSkeleton(count: 6, crossAxisCount: 2),
      );
    }

    if (_searchResult.isEmpty && !_isLoading) {
      return _buildNoResultsState();
    }

    return Column(
      children: [
        // Filter & Sort Filter Bar
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: 8,
          ),
          decoration: const BoxDecoration(
            color: AppColors.surfaceSubtle,
            border: Border(
              bottom: BorderSide(
                color: AppColors.borderSubtle,
                width: 1.0,
              ),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '${_searchResult.products.length} results for "${_searchResult.query}"',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              // Sort dropdown
              DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedSort,
                  icon: const Icon(
                    Icons.sort_rounded,
                    size: 18,
                    color: AppColors.forestDeep,
                  ),
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.w600,
                  ),
                  items: const [
                    DropdownMenuItem(
                      value: 'relevance',
                      child: Text('Relevance'),
                    ),
                    DropdownMenuItem(
                      value: 'price_asc',
                      child: Text('Price: Low to High'),
                    ),
                    DropdownMenuItem(
                      value: 'price_desc',
                      child: Text('Price: High to Low'),
                    ),
                    DropdownMenuItem(
                      value: 'rating',
                      child: Text('Top Rated'),
                    ),
                  ],
                  onChanged: (newSort) {
                    if (newSort != null) {
                      setState(() => _selectedSort = newSort);
                      _executeSearch(_searchController.text, isSubmitted: true);
                    }
                  },
                ),
              ),
            ],
          ),
        ),

        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: 8,
          ),
          child: Row(
            children: GlorovSearchService.categoryFilters.map((cat) {
              final isSelected = _selectedCategory == cat;
              return Padding(
                padding: const EdgeInsets.only(right: 6),
                child: ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppColors.forestDeep,
                  backgroundColor: AppColors.surfacePure,
                  labelStyle: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight:
                        isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                  ),
                  onSelected: (val) {
                    setState(() => _selectedCategory = cat);
                    _executeSearch(_searchController.text, isSubmitted: true);
                  },
                ),
              );
            }).toList(),
          ),
        ),

        // Product Grid
        Expanded(
          child: GridView.builder(
            controller: _scrollController,
            padding: const EdgeInsets.all(AppSpacing.md),
            gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
              maxCrossAxisExtent: 240,
              mainAxisSpacing: AppSpacing.md,
              crossAxisSpacing: AppSpacing.md,
              childAspectRatio: 0.69,
            ),
            itemCount: _searchResult.products.length,
            itemBuilder: (context, index) {
              final product = _searchResult.products[index];
              return _buildProductGridCard(product);
            },
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Card 1: Closest Match / Best Match Card (Featured Rich Preview)
  // ---------------------------------------------------------------------------

  Widget _buildClosestMatchCard(GlorovProduct product) {
    final hasDiscount = product.discountPrice != null &&
        product.discountPrice! < product.price;

    return Container(
      key: const Key('closest_match_card'),
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.forestDeep.withOpacity(0.3),
          width: 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.forestDeep.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () => _openProductDetails(product),
          child: Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Product Image (With Fallback)
                    _buildImageThumbnail(
                      product.imageUrls.isNotEmpty
                          ? product.imageUrls.first
                          : null,
                      width: 90,
                      height: 90,
                    ),

                    const SizedBox(width: AppSpacing.md),

                    // Product Details
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Category & In Stock pill
                          Wrap(
                            spacing: 6,
                            runSpacing: 4,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.forestDeep.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Text(
                                  product.category,
                                  style: const TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.forestDeep,
                                  ),
                                ),
                              ),
                              if (product.inStock)
                                const Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.circle,
                                      size: 8,
                                      color: Colors.green,
                                    ),
                                    SizedBox(width: 4),
                                    Text(
                                      'In Stock',
                                      style: TextStyle(
                                        fontFamily: AppTypography.primaryFont,
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w600,
                                        color: Colors.green,
                                      ),
                                    ),
                                  ],
                                ),
                            ],
                          ),

                          const SizedBox(height: 6),

                          // Product Title
                          Text(
                            product.title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 15,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                              height: 1.2,
                            ),
                          ),

                          if (product.botanicalName.isNotEmpty) ...[
                            const SizedBox(height: 3),
                            Text(
                              product.botanicalName,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],

                          const SizedBox(height: 6),

                          // Price & Discount
                          Wrap(
                            spacing: 6,
                            runSpacing: 2,
                            crossAxisAlignment: WrapCrossAlignment.center,
                            children: [
                              Text(
                                '₹${product.effectivePrice.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.forestDeep,
                                ),
                              ),
                              if (hasDiscount) ...[
                                Text(
                                  '₹${product.price.toStringAsFixed(0)}',
                                  style: const TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 12,
                                    decoration: TextDecoration.lineThrough,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                                if (product.discountPercent != null)
                                  Text(
                                    '${product.discountPercent}% OFF',
                                    style: const TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.terracotta,
                                    ),
                                  ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        key: const Key('closest_match_details_button'),
                        icon: const Icon(
                          Icons.visibility_rounded,
                          size: 15,
                          color: AppColors.forestDeep,
                        ),
                        label: const Text(
                          'View Details',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.forestDeep,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.forestDeep),
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () => _openProductDetails(product),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        key: const Key('closest_match_add_to_cart_button'),
                        icon: const Icon(
                          Icons.add_shopping_cart_rounded,
                          size: 15,
                          color: Colors.white,
                        ),
                        label: const Text(
                          'Add to Cart',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.forestDeep,
                          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                          ),
                        ),
                        onPressed: () => _addToCart(product),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Tile: Product List Tile (Suggestions & Quick Browse)
  // ---------------------------------------------------------------------------

  Widget _buildProductListTile(GlorovProduct product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _openProductDetails(product),
          child: Padding(
            padding: const EdgeInsets.all(10),
            child: Row(
              children: [
                // Product Thumbnail
                _buildImageThumbnail(
                  product.imageUrls.isNotEmpty ? product.imageUrls.first : null,
                  width: 58,
                  height: 58,
                ),

                const SizedBox(width: 12),

                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        product.category,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Text(
                            '₹${product.effectivePrice.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13.5,
                              fontWeight: FontWeight.w800,
                              color: AppColors.forestDeep,
                            ),
                          ),
                          if (product.discountPrice != null &&
                              product.discountPrice! < product.price) ...[
                            const SizedBox(width: 6),
                            Text(
                              '₹${product.price.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 11,
                                decoration: TextDecoration.lineThrough,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),

                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 14,
                  color: AppColors.textMuted,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Grid Card: Product Grid Card for Full Search Results
  // ---------------------------------------------------------------------------

  Widget _buildProductGridCard(GlorovProduct product) {
    final hasDiscount = product.discountPrice != null &&
        product.discountPrice! < product.price;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: () => _openProductDetails(product),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Expanded(
                child: Stack(
                  children: [
                    Positioned.fill(
                      child: ClipRRect(
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(14),
                        ),
                        child: _buildImageThumbnail(
                          product.imageUrls.isNotEmpty
                              ? product.imageUrls.first
                              : null,
                          width: double.infinity,
                          height: double.infinity,
                          borderRadius: 0,
                        ),
                      ),
                    ),
                    if (hasDiscount && product.discountPercent != null)
                      Positioned(
                        top: 8,
                        left: 8,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.terracotta,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            '${product.discountPercent}% OFF',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),

              // Product Info
              Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.category,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 10.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      product.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                        height: 1.2,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '₹${product.effectivePrice.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: AppColors.forestDeep,
                              ),
                            ),
                            if (hasDiscount)
                              Text(
                                '₹${product.price.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 10.5,
                                  decoration: TextDecoration.lineThrough,
                                  color: AppColors.textMuted,
                                ),
                              ),
                          ],
                        ),
                        // Mini Add to Cart
                        InkWell(
                          onTap: () => _addToCart(product),
                          borderRadius: BorderRadius.circular(8),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: AppColors.forestDeep.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(
                              Icons.add_shopping_cart_rounded,
                              size: 16,
                              color: AppColors.forestDeep,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Helper: Image Thumbnail with Graceful Fallback (Local Assets + Network)
  // ---------------------------------------------------------------------------

  Widget _buildImageThumbnail(
    String? url, {
    required double width,
    required double height,
    double borderRadius = 10,
  }) {
    final imageWidget = (url != null && url.isNotEmpty)
        ? (url.startsWith('assets/') || !url.startsWith('http')
            ? Image.asset(
                url,
                width: width,
                height: height,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    _buildImagePlaceholder(width, height),
              )
            : Image.network(
                url,
                width: width,
                height: height,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    _buildImagePlaceholder(width, height),
                loadingBuilder: (context, child, loadingProgress) {
                  if (loadingProgress == null) return child;
                  return SkeletonScope(
                    child: LoadingSkeleton(
                      width: width,
                      height: height,
                    ),
                  );
                },
              ))
        : _buildImagePlaceholder(width, height);

    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: Container(
        width: width,
        height: height,
        color: const Color(0xFFF4F4F5),
        child: imageWidget,
      ),
    );
  }

  Widget _buildImagePlaceholder(double width, double height) {
    return Container(
      width: width,
      height: height,
      color: const Color(0xFFF4F4F5),
      child: const Center(
        child: Icon(
          Icons.local_florist_rounded,
          color: Color(0xFFCBD5E1),
          size: 24,
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Helper: Highlighted Query Substring in Text
  // ---------------------------------------------------------------------------

  Widget _buildHighlightedText(String text, String query) {
    if (query.isEmpty) {
      return Text(
        text,
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 13.5,
          color: AppColors.textPrimary,
        ),
      );
    }

    final lowerText = text.toLowerCase();
    final lowerQuery = query.toLowerCase();
    final index = lowerText.indexOf(lowerQuery);

    if (index < 0) {
      return Text(
        text,
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 13.5,
          color: AppColors.textPrimary,
        ),
      );
    }

    final before = text.substring(0, index);
    final match = text.substring(index, index + query.length);
    final after = text.substring(index + query.length);

    return RichText(
      text: TextSpan(
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 13.5,
          color: AppColors.textPrimary,
        ),
        children: [
          if (before.isNotEmpty) TextSpan(text: before),
          TextSpan(
            text: match,
            style: const TextStyle(
              fontWeight: FontWeight.w800,
              color: AppColors.forestDeep,
            ),
          ),
          if (after.isNotEmpty) TextSpan(text: after),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // State: No Results Found
  // ---------------------------------------------------------------------------

  Widget _buildNoResultsState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.forestDeep.withOpacity(0.08),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off_rounded,
                size: 54,
                color: AppColors.forestDeep,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              'No Botanical Results Found for "${_searchController.text.trim()}"',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 8),
            const Text(
              'Try searching with broader terms or choose one of our trending botanical collections:',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.center,
              children: [
                'Monstera',
                'Seeds',
                'Houseplants',
                'Pots',
                'Soil',
              ].map((term) {
                return ActionChip(
                  label: Text(term),
                  backgroundColor: AppColors.surfaceSubtle,
                  side: const BorderSide(color: AppColors.borderSubtle),
                  onPressed: () => _selectSuggestion(term),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}
