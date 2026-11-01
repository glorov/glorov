import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_mobile_bottom_nav.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/category_model.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Full-Page Botanical Category Screen
///
/// Features:
/// - Mobile Viewport (< 800px): Clean split dual-column layout with left category rail and right 3-column subcategory & product launch grids.
///   Features buttery-smooth animated slide & cross-fade transitions when switching categories, tactile active indicator bars, and crisp image cards.
/// - Desktop Viewport (>= 800px): Expansive full-width botanical taxonomy layout with hero banner, animated category filter tabs with icons,
///   deep-dive category showcase view, rich responsive cards grid, and seasonal sowing guide.
/// - Strictly displays ONLY seeded database categories (Seeds, Live Plants, Planters & Pots, Plant Care & Soil).
class GlorovCategoriesScreen extends StatefulWidget {
  final String? initialCategoryHandle;

  const GlorovCategoriesScreen({
    super.key,
    this.initialCategoryHandle,
  });

  @override
  State<GlorovCategoriesScreen> createState() => _GlorovCategoriesScreenState();
}

class _GlorovCategoriesScreenState extends State<GlorovCategoriesScreen> {
  late int _selectedCategoryIndex;
  final ScrollController _rightScrollController = ScrollController();
  final ScrollController _leftRailScrollController = ScrollController();
  final TextEditingController _desktopSearchController = TextEditingController();
  String _desktopSearchQuery = '';
  String _selectedDesktopGroup = 'All Categories';

  @override
  void initState() {
    super.initState();
    _selectedCategoryIndex = 0; // Default to "For You" on mobile
    if (widget.initialCategoryHandle != null) {
      final idx = glorovBotanicalCategories.indexWhere(
        (c) => c.handle == widget.initialCategoryHandle,
      );
      if (idx != -1) {
        _selectedCategoryIndex = idx;
        final selectedCat = glorovBotanicalCategories[idx];
        if (selectedCat.handle != 'for-you') {
          _selectedDesktopGroup = selectedCat.title;
        }
      }
    }

    _desktopSearchController.addListener(() {
      setState(() {
        _desktopSearchQuery = _desktopSearchController.text.trim().toLowerCase();
      });
    });
  }

  @override
  void dispose() {
    _rightScrollController.dispose();
    _leftRailScrollController.dispose();
    _desktopSearchController.dispose();
    super.dispose();
  }

  void _onCategorySelected(int index) {
    if (_selectedCategoryIndex == index) return;
    HapticFeedback.selectionClick();
    setState(() {
      _selectedCategoryIndex = index;
    });

    // Reset right scroll offset to top smoothly on category switch
    if (_rightScrollController.hasClients) {
      _rightScrollController.jumpTo(0.0);
    }

    // Ensure selected item in left rail is visible
    if (_leftRailScrollController.hasClients) {
      final targetOffset = (index * 84.0).clamp(
        0.0,
        _leftRailScrollController.position.maxScrollExtent,
      );
      _leftRailScrollController.animateTo(
        targetOffset,
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final width = MediaQuery.of(context).size.width;

    if (width >= 800 || isDesktop) {
      return _buildDesktopLayout(context);
    } else {
      return _buildMobileDualColumnLayout(context);
    }
  }

  // =========================================================================
  // 1. MOBILE DUAL-COLUMN LAYOUT (With Silky Smooth Category Transitions)
  // =========================================================================
  Widget _buildMobileDualColumnLayout(BuildContext context) {
    final activeCategory = glorovBotanicalCategories[_selectedCategoryIndex];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: _buildMobileAppBar(context),
      body: SafeArea(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Left Category Navigation Rail
            _buildLeftCategoryRail(),

            // Right Category & Subcategory Content (Animated Switcher for buttery smooth transitions)
            Expanded(
              child: AnimatedSwitcher(
                duration: const Duration(milliseconds: 280),
                switchInCurve: Curves.easeOutCubic,
                switchOutCurve: Curves.easeInCubic,
                layoutBuilder: (currentChild, previousChildren) {
                  return Stack(
                    fit: StackFit.expand,
                    children: <Widget>[
                      ...previousChildren,
                      if (currentChild != null) currentChild,
                    ],
                  );
                },
                transitionBuilder: (child, animation) {
                  final slideAnimation = Tween<Offset>(
                    begin: const Offset(0.0, 0.035),
                    end: Offset.zero,
                  ).animate(CurvedAnimation(
                    parent: animation,
                    curve: Curves.easeOutCubic,
                  ));

                  return FadeTransition(
                    opacity: animation,
                    child: SlideTransition(
                      position: slideAnimation,
                      child: child,
                    ),
                  );
                },
                child: KeyedSubtree(
                  key: ValueKey<String>(activeCategory.handle),
                  child: _buildRightContentArea(activeCategory),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: const GlorovMobileBottomNav(
        currentRoute: discoverScreenRoute,
        isVisible: true,
      ),
    );
  }

  /// Mobile Clean Top App Bar
  PreferredSizeWidget _buildMobileAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0.5,
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_rounded,
          color: AppColors.textPrimary,
        ),
        onPressed: () {
          if (Navigator.canPop(context)) {
            Navigator.pop(context);
          } else {
            Navigator.pushNamedAndRemoveUntil(
              context,
              homeScreenRoute,
              (route) => false,
            );
          }
        },
      ),
      title: const Text(
        'All Categories',
        style: TextStyle(
          color: AppColors.textPrimary,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.2,
        ),
      ),
      centerTitle: false,
      actions: [
        IconButton(
          icon: const Icon(
            Icons.search_rounded,
            color: AppColors.textPrimary,
          ),
          onPressed: () {
            Navigator.pushNamed(context, searchScreenRoute);
          },
        ),
        ListenableBuilder(
          listenable: GlorovCartState.instance,
          builder: (context, _) {
            final cartCount = GlorovCartState.instance.itemCount;
            return Stack(
              alignment: Alignment.center,
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  icon: const Icon(
                    Icons.shopping_cart_outlined,
                    color: AppColors.textPrimary,
                  ),
                  onPressed: () {
                    Navigator.pushNamed(context, cartScreenRoute);
                  },
                ),
                if (cartCount > 0)
                  Positioned(
                    top: 6,
                    right: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 4.5,
                        vertical: 1.5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.forestDeep, // Match GLOROV theme
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white, width: 1.2),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x22000000),
                            blurRadius: 3,
                            offset: Offset(0, 1),
                          ),
                        ],
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 15,
                        minHeight: 15,
                      ),
                      child: Center(
                        child: Text(
                          cartCount > 99 ? '99+' : '$cartCount',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 8.5,
                            fontWeight: FontWeight.w800,
                            height: 1.0,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  /// Left Vertical Category Selector Rail with Tactile Animated Indicators
  Widget _buildLeftCategoryRail() {
    return Container(
      width: 88,
      decoration: const BoxDecoration(
        color: Color(0xFFF8FAF9), // Soft botanical tinted background
        border: Border(
          right: BorderSide(
            color: Color(0xFFE5E7EB),
            width: 1,
          ),
        ),
      ),
      child: ListView.builder(
        controller: _leftRailScrollController,
        padding: const EdgeInsets.symmetric(vertical: 4),
        itemCount: glorovBotanicalCategories.length,
        itemBuilder: (context, index) {
          final cat = glorovBotanicalCategories[index];
          final isSelected = index == _selectedCategoryIndex;
          final isForYou = cat.handle == 'for-you';

          return InkWell(
            onTap: () => _onCategorySelected(index),
            splashColor: AppColors.forestDeep.withOpacity(0.06),
            highlightColor: AppColors.forestDeep.withOpacity(0.04),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 220),
              curve: Curves.easeOutCubic,
              color: isSelected ? Colors.white : Colors.transparent,
              padding: const EdgeInsets.symmetric(vertical: 11, horizontal: 4),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Active Left Vertical Indicator Bar
                  if (isSelected)
                    Positioned(
                      left: 0,
                      top: 4,
                      bottom: 4,
                      child: Container(
                        width: 3.8,
                        decoration: BoxDecoration(
                          color: AppColors.forestDeep,
                          borderRadius: const BorderRadius.horizontal(
                            right: Radius.circular(3),
                          ),
                        ),
                      ),
                    ),

                  // Category Icon / Thumbnail and Label
                  Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Icon / Image container with active subtle ring
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          curve: Curves.easeOutCubic,
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: isForYou
                                ? (isSelected
                                    ? const Color(0xFFD8F3DC)
                                    : const Color(0xFFE8F5E9))
                                : Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                              color: isSelected
                                  ? AppColors.forestDeep
                                  : const Color(0xFFE5E7EB),
                              width: isSelected ? 1.8 : 1.0,
                            ),
                            boxShadow: isSelected
                                ? [
                                    BoxShadow(
                                      color: AppColors.forestDeep.withOpacity(0.12),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ]
                                : const [],
                          ),
                          clipBehavior: Clip.antiAlias,
                          child: isForYou
                              ? const Center(
                                  child: Icon(
                                    Icons.auto_awesome_rounded,
                                    color: AppColors.forestDeep,
                                    size: 22,
                                  ),
                                )
                              : (cat.image.startsWith('assets/')
                                  ? Image.asset(
                                      cat.image,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              const Center(
                                        child: Icon(
                                          Icons.eco_rounded,
                                          color: AppColors.forestDeep,
                                          size: 20,
                                        ),
                                      ),
                                    )
                                  : Image.network(
                                      cat.image,
                                      fit: BoxFit.cover,
                                      errorBuilder:
                                          (context, error, stackTrace) =>
                                              const Center(
                                        child: Icon(
                                          Icons.eco_rounded,
                                          color: AppColors.forestDeep,
                                          size: 20,
                                        ),
                                      ),
                                    )),
                        ),
                        const SizedBox(height: 6),

                        // Title text
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 2),
                          child: Text(
                            cat.title,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 10.5,
                              fontWeight: isSelected
                                  ? FontWeight.w800
                                  : FontWeight.w600,
                              color: isSelected
                                  ? AppColors.forestDeep
                                  : const Color(0xFF4B5563),
                              height: 1.2,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Right Area displaying the Subcategory 3-Column Grid and Launches Grid
  Widget _buildRightContentArea(CategoryModel activeCategory) {
    final isForYou = activeCategory.handle == 'for-you';
    final sectionTitle = isForYou
        ? 'Popular Collections'
        : '${activeCategory.title} Collections';

    return Container(
      color: Colors.white,
      child: SingleChildScrollView(
        controller: _rightScrollController,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. First Section: Subcategories / Popular Collections Grid Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    sectionTitle,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF111827),
                      letterSpacing: -0.2,
                    ),
                  ),
                ),
                Text(
                  '${activeCategory.subCategories.length} Collections',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // 3-Column Grid of Subcategories
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: activeCategory.subCategories.length,
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                crossAxisSpacing: 10,
                mainAxisSpacing: 12,
                childAspectRatio: 0.69,
              ),
              itemBuilder: (context, index) {
                final sub = activeCategory.subCategories[index];
                return _buildSubcategoryCard(context, sub);
              },
            ),

            const SizedBox(height: 24),

            // 2. Second Section: Top Varieties / New & Upcoming Launches Header
            if (activeCategory.launches.isNotEmpty) ...[
              Row(
                children: [
                  const Icon(
                    Icons.local_fire_department_rounded,
                    size: 16,
                    color: AppColors.terracotta,
                  ),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      isForYou ? 'New & Upcoming Launches' : 'Top Seeded Varieties',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                        letterSpacing: -0.2,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              // 3-Column Grid of Product Launches
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: activeCategory.launches.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 10,
                  mainAxisSpacing: 14,
                  childAspectRatio: 0.54,
                ),
                itemBuilder: (context, index) {
                  final launch = activeCategory.launches[index];
                  return _buildLaunchCard(context, launch);
                },
              ),
            ],
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  /// 3-Column Subcategory Item (Clean rounded squircle with crisp botanical image and label)
  Widget _buildSubcategoryCard(BuildContext context, BotanicalSubCategory sub) {
    return InkWell(
      onTap: () {
        // Direct navigation to catalog filtered by this exact subcategory
        Navigator.pushNamed(
          context,
          discoverScreenRoute,
          arguments: sub.title,
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Rounded image container
          AspectRatio(
            aspectRatio: 1.0,
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAF8),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFECEEEB), width: 1),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x06000000),
                    blurRadius: 4,
                    offset: Offset(0, 1),
                  ),
                ],
              ),
              clipBehavior: Clip.antiAlias,
              child: sub.image.startsWith('assets/')
                  ? Image.asset(
                      sub.image,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(
                        child: Icon(
                          Icons.eco_rounded,
                          color: AppColors.forestDeep,
                          size: 24,
                        ),
                      ),
                    )
                  : Image.network(
                      sub.image,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(
                        child: Icon(
                          Icons.eco_rounded,
                          color: AppColors.forestDeep,
                          size: 24,
                        ),
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 6),

          // Subcategory Name Label
          Text(
            sub.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1F2937),
              height: 1.25,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  /// 3-Column Launch Product Item (With Status Tag & Price indication)
  Widget _buildLaunchCard(BuildContext context, BotanicalProductLaunch launch) {
    Color tagColor;
    if (launch.tag == 'SALE IS LIVE') {
      tagColor = AppColors.terracotta;
    } else if (launch.tag == 'NEW LAUNCH') {
      tagColor = AppColors.sage;
    } else {
      tagColor = AppColors.forestDeep;
    }

    return InkWell(
      onTap: () {
        Navigator.pushNamed(
          context,
          discoverScreenRoute,
          arguments: launch.title,
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Image Container with Overlay Tag
          AspectRatio(
            aspectRatio: 1.0,
            child: Stack(
              children: [
                Container(
                  width: double.infinity,
                  height: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAF8),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: const Color(0xFFECEEEB),
                      width: 1,
                    ),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: launch.image.startsWith('assets/')
                      ? Image.asset(
                          launch.image,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Center(
                            child: Icon(
                              Icons.eco_rounded,
                              color: AppColors.forestDeep,
                              size: 24,
                            ),
                          ),
                        )
                      : Image.network(
                          launch.image,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Center(
                            child: Icon(
                              Icons.eco_rounded,
                              color: AppColors.forestDeep,
                              size: 24,
                            ),
                          ),
                        ),
                ),

                // "BUY NOW" / "NEW LAUNCH" Tag at bottom of image
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 2.5),
                    decoration: BoxDecoration(
                      color: tagColor,
                      borderRadius: const BorderRadius.only(
                        bottomLeft: Radius.circular(13),
                        bottomRight: Radius.circular(13),
                      ),
                    ),
                    child: Text(
                      launch.tag,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.3,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 5),

          // Title
          Text(
            launch.title,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Color(0xFF1F2937),
              height: 1.2,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),

          // Price Tag
          if (launch.formattedPrice.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(
              launch.formattedPrice,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 11.5,
                fontWeight: FontWeight.w800,
                color: AppColors.forestDeep,
              ),
            ),
          ],
        ],
      ),
    );
  }

  // =========================================================================
  // 2. DESKTOP VIEWPORT LAYOUT (>= 800px)
  // =========================================================================
  Widget _buildDesktopLayout(BuildContext context) {
    final categories = _filteredDesktopCategories;

    return GlorovStorefrontScaffold(
      currentRoute: discoverScreenRoute,
      backgroundColor: AppColors.surfaceCream,
      child: SingleChildScrollView(
        child: Column(
          children: [
            // 1. Desktop Hero Banner Header
            _buildDesktopHeroHeader(),

            // 2. Main Content Container
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1280),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.lg,
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Desktop Search and Filter Tabs
                      _buildDesktopSearchAndFilters(),

                      const SizedBox(height: AppSpacing.lg),

                      // Desktop Animated Content Switcher
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 280),
                        switchInCurve: Curves.easeOutCubic,
                        switchOutCurve: Curves.easeInCubic,
                        transitionBuilder: (child, animation) {
                          return FadeTransition(
                            opacity: animation,
                            child: child,
                          );
                        },
                        child: KeyedSubtree(
                          key: ValueKey<String>('$_selectedDesktopGroup-$_desktopSearchQuery'),
                          child: _selectedDesktopGroup == 'All Categories'
                              ? _buildDesktopAllCategoriesGrid(context, categories)
                              : _buildDesktopSingleCategoryShowcase(context),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.xxl),

                      // Seasonal Sowing Spotlight Banner
                      _buildDesktopSeasonalBanner(context),

                      const SizedBox(height: AppSpacing.xxl),
                    ],
                  ),
                ),
              ),
            ),

            // 3. Storefront Footer
            const GlorovFooter(),
          ],
        ),
      ),
    );
  }

  /// Categories filtered for Desktop (only the 4 root seeded categories: Seeds, Plants, Pots, Care)
  List<CategoryModel> get _filteredDesktopCategories {
    List<CategoryModel> list = glorovBotanicalCategories
        .where((c) => c.handle != 'for-you') // Skip mobile-only "For You"
        .toList();

    if (_selectedDesktopGroup != 'All Categories') {
      list = list.where((cat) => cat.title == _selectedDesktopGroup).toList();
    }

    if (_desktopSearchQuery.isNotEmpty) {
      list = list.where((cat) {
        final title = cat.title.toLowerCase();
        final desc = cat.description.toLowerCase();
        final subMatch = cat.subCategories.any(
          (sub) => sub.title.toLowerCase().contains(_desktopSearchQuery),
        );
        return title.contains(_desktopSearchQuery) ||
            desc.contains(_desktopSearchQuery) ||
            subMatch;
      }).toList();
    }

    return list;
  }

  Widget _buildDesktopHeroHeader() {
    return Container(
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF042018), // Deep Forest
            Color(0xFF0A3729), // Rich Nursery Green
            Color(0xFF144D3A),
          ],
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl, vertical: AppSpacing.xxl),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              InkWell(
                onTap: () => Navigator.pushNamed(context, homeScreenRoute),
                child: const Padding(
                  padding: EdgeInsets.only(bottom: 12),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.arrow_back_ios, size: 12, color: Colors.white70),
                      SizedBox(width: 4),
                      Text(
                        'Back to Store',
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4E79E).withOpacity(0.18),
                  borderRadius: AppRadii.roundedFull,
                  border: Border.all(
                    color: const Color(0xFFD4E79E).withOpacity(0.35),
                  ),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.eco_rounded, size: 15, color: Color(0xFFD4E79E)),
                    SizedBox(width: 6),
                    Text(
                      'PUNE CENTRAL NURSERY DIRECTORY',
                      style: TextStyle(
                        color: Color(0xFFD4E79E),
                        fontWeight: FontWeight.w700,
                        fontSize: 11,
                        letterSpacing: 0.8,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const Text(
                'Explore Botanical Categories',
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  fontSize: 36,
                  height: 1.2,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 720),
                child: Text(
                  'Browse acclimatized live indoor houseplants, germination-tested Desi heirloom seeds, artisanal terracotta planters, and certified organic soil blends.',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    color: Colors.white.withOpacity(0.85),
                    fontSize: 16,
                    height: 1.5,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              Wrap(
                spacing: AppSpacing.md,
                runSpacing: AppSpacing.sm,
                children: [
                  _statChip(Icons.verified_rounded, '100+ Verified Seeded Varieties'),
                  _statChip(Icons.local_shipping_rounded, 'Pan-India Transit Safe'),
                  _statChip(Icons.published_with_changes_rounded, '7-Day Live Replacement'),
                  _statChip(Icons.auto_stories_rounded, 'Free Care Guide Included'),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.08),
        borderRadius: AppRadii.roundedFull,
        border: Border.all(color: Colors.white.withOpacity(0.12)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: const Color(0xFFD4E79E)),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopSearchAndFilters() {
    final groups = [
      _DesktopTabItem(label: 'All Categories', icon: Icons.grid_view_rounded),
      _DesktopTabItem(label: 'Seeds', icon: Icons.grain_rounded),
      _DesktopTabItem(label: 'Live Plants', icon: Icons.local_florist_rounded),
      _DesktopTabItem(label: 'Planters & Pots', icon: Icons.inventory_2_outlined),
      _DesktopTabItem(label: 'Plant Care & Soil', icon: Icons.spa_rounded),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedLg,
            boxShadow: AppShadows.card,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: TextField(
            key: const Key('category_search_field'),
            controller: _desktopSearchController,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              color: AppColors.textPrimary,
              fontSize: 15,
            ),
            onSubmitted: (query) {
              if (query.trim().isNotEmpty) {
                Navigator.pushNamed(
                  context,
                  searchScreenRoute,
                  arguments: query.trim(),
                );
              }
            },
            decoration: InputDecoration(
              hintText: 'Search categories, seeds, houseplants, pots...',
              hintStyle: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                color: AppColors.textMuted,
                fontSize: 14,
              ),
              prefixIcon: IconButton(
                icon: const Icon(Icons.search_rounded, color: AppColors.forestDeep),
                tooltip: 'Search botanical collection',
                onPressed: () {
                  Navigator.pushNamed(
                    context,
                    searchScreenRoute,
                    arguments: _desktopSearchController.text.trim().isNotEmpty
                        ? _desktopSearchController.text.trim()
                        : null,
                  );
                },
              ),
              suffixIcon: _desktopSearchQuery.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded, size: 18),
                      onPressed: () => _desktopSearchController.clear(),
                    )
                  : null,
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: 14),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: groups.map((g) {
              final isSelected = _selectedDesktopGroup == g.label;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: FilterChip(
                  avatar: Icon(
                    g.icon,
                    size: 16,
                    color: isSelected ? Colors.white : AppColors.forestDeep,
                  ),
                  label: Text(g.label),
                  selected: isSelected,
                  onSelected: (val) {
                    HapticFeedback.selectionClick();
                    setState(() => _selectedDesktopGroup = g.label);
                  },
                  backgroundColor: AppColors.surfacePure,
                  selectedColor: AppColors.forestDeep,
                  labelStyle: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                    fontSize: 13,
                  ),
                  side: BorderSide(
                    color: isSelected ? AppColors.forestDeep : AppColors.borderSubtle,
                    width: 1.2,
                  ),
                  shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedFull),
                  showCheckmark: false,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  /// Desktop All Categories Overview 3-Column Grid
  Widget _buildDesktopAllCategoriesGrid(BuildContext context, List<CategoryModel> categories) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: categories.length,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        crossAxisSpacing: AppSpacing.lg,
        mainAxisSpacing: AppSpacing.lg,
        childAspectRatio: 0.74,
      ),
      itemBuilder: (context, index) {
        final cat = categories[index];
        return _buildDesktopCategoryCard(context, cat);
      },
    );
  }

  /// Desktop Dedicated Single Category Showcase (Subcategories + Top Seeded Launches)
  Widget _buildDesktopSingleCategoryShowcase(BuildContext context) {
    final category = glorovBotanicalCategories.firstWhere(
      (c) => c.title == _selectedDesktopGroup,
      orElse: () => glorovBotanicalCategories[1],
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category Spotlight Hero Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadii.roundedXl,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.card,
          ),
          child: Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: SizedBox(
                  width: 120,
                  height: 120,
                  child: category.image.startsWith('assets/')
                      ? Image.asset(category.image, fit: BoxFit.cover)
                      : Image.network(category.image, fit: BoxFit.cover),
                ),
              ),
              const SizedBox(width: AppSpacing.xl),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: const Color(0xFFD8F3DC),
                            borderRadius: AppRadii.roundedFull,
                          ),
                          child: Text(
                            category.badge,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.forestDeep,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '${category.count} Botanical Varieties',
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      category.title,
                      style: const TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 26,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.4,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      category.description,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 14,
                        color: Color(0xFF4B5563),
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Subcategories Section
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              '${category.title} Collections',
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
              ),
            ),
            TextButton.icon(
              onPressed: () {
                Navigator.pushNamed(context, discoverScreenRoute, arguments: category.title);
              },
              icon: const Icon(Icons.arrow_forward_rounded, size: 15),
              label: const Text('View All in Catalog'),
              style: TextButton.styleFrom(
                foregroundColor: AppColors.forestDeep,
                textStyle: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),

        // Subcategory Cards Row
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: category.subCategories.length,
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: AppSpacing.lg,
            mainAxisSpacing: AppSpacing.lg,
            childAspectRatio: 2.5,
          ),
          itemBuilder: (context, index) {
            final sub = category.subCategories[index];
            return InkWell(
              onTap: () {
                Navigator.pushNamed(context, discoverScreenRoute, arguments: sub.title);
              },
              borderRadius: BorderRadius.circular(16),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppShadows.card,
                ),
                clipBehavior: Clip.antiAlias,
                child: Row(
                  children: [
                    SizedBox(
                      width: 120,
                      height: double.infinity,
                      child: sub.image.startsWith('assets/')
                          ? Image.asset(
                              sub.image,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: const Color(0xFFE8F0EA),
                                child: const Center(
                                  child: Icon(Icons.eco_rounded, color: AppColors.forestDeep, size: 28),
                                ),
                              ),
                            )
                          : Image.network(
                              sub.image,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(
                                color: const Color(0xFFE8F0EA),
                                child: const Center(
                                  child: Icon(Icons.eco_rounded, color: AppColors.forestDeep, size: 28),
                                ),
                              ),
                            ),
                    ),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              sub.title,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 15.5,
                                fontWeight: FontWeight.w800,
                                color: AppColors.textPrimary,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${sub.count} curated varieties',
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12.5,
                                color: AppColors.textMuted,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Row(
                              children: [
                                Text(
                                  'Explore Collection',
                                  style: TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.forestDeep,
                                  ),
                                ),
                                SizedBox(width: 4),
                                Icon(
                                  Icons.arrow_forward_rounded,
                                  size: 13,
                                  color: AppColors.forestDeep,
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),

        const SizedBox(height: AppSpacing.xl),

        // Featured Launches Section
        if (category.launches.isNotEmpty) ...[
          const Text(
            'Featured Varieties & Launches',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: category.launches.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              crossAxisSpacing: AppSpacing.md,
              mainAxisSpacing: AppSpacing.md,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, index) {
              final launch = category.launches[index];
              return InkWell(
                onTap: () {
                  Navigator.pushNamed(context, discoverScreenRoute, arguments: launch.title);
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.borderSubtle),
                    boxShadow: AppShadows.card,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      AspectRatio(
                        aspectRatio: 1.15,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            launch.image.startsWith('assets/')
                                ? Image.asset(
                                    launch.image,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      color: const Color(0xFFF0F4F1),
                                      child: const Center(
                                        child: Icon(Icons.eco_rounded, color: AppColors.forestDeep, size: 24),
                                      ),
                                    ),
                                  )
                                : Image.network(
                                    launch.image,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => Container(
                                      color: const Color(0xFFF0F4F1),
                                      child: const Center(
                                        child: Icon(Icons.eco_rounded, color: AppColors.forestDeep, size: 24),
                                      ),
                                    ),
                                  ),
                            Positioned(
                              top: 8,
                              left: 8,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                                decoration: BoxDecoration(
                                  color: launch.tag == 'SALE IS LIVE'
                                      ? AppColors.terracotta
                                      : (launch.tag == 'NEW LAUNCH'
                                          ? AppColors.sage
                                          : AppColors.forestDeep),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  launch.tag,
                                  style: const TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    color: Colors.white,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(AppSpacing.sm),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              launch.title,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            if (launch.formattedPrice.isNotEmpty) ...[
                              const SizedBox(height: 3),
                              Text(
                                launch.formattedPrice,
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.forestDeep,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ],
    );
  }

  Widget _buildDesktopCategoryCard(BuildContext context, CategoryModel cat) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedXl,
        boxShadow: AppShadows.card,
        border: Border.all(color: AppColors.borderSubtle, width: 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.pushNamed(context, discoverScreenRoute, arguments: cat.title);
          },
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  AspectRatio(
                    aspectRatio: 16 / 9,
                    child: cat.image.startsWith('assets/')
                        ? Image.asset(
                            cat.image,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: AppColors.surfaceMuted,
                              child: const Center(
                                child: Icon(Icons.eco_rounded,
                                    size: 36, color: AppColors.forestDeep),
                              ),
                            ),
                          )
                        : Image.network(
                            cat.image,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(
                              color: AppColors.surfaceMuted,
                              child: const Center(
                                child: Icon(Icons.eco_rounded,
                                    size: 36, color: AppColors.forestDeep),
                              ),
                            ),
                          ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFFD51F),
                        borderRadius: AppRadii.roundedFull,
                      ),
                      child: Text(
                        cat.badge,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          color: Color(0xFF042018),
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.65),
                        borderRadius: AppRadii.roundedFull,
                      ),
                      child: Text(
                        '${cat.count} Varieties',
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        cat.title,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w800,
                          fontSize: 18,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        cat.description,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          color: AppColors.textMuted,
                          fontSize: 13,
                          height: 1.4,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const Spacer(),
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: cat.subCategories.take(3).map((sub) {
                          return InkWell(
                            onTap: () {
                              Navigator.pushNamed(context, discoverScreenRoute, arguments: sub.title);
                            },
                            borderRadius: AppRadii.roundedFull,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceMuted,
                                borderRadius: AppRadii.roundedFull,
                                border: Border.all(color: AppColors.borderSubtle),
                              ),
                              child: Text(
                                sub.title,
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 11,
                                  color: AppColors.forestDeep,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Explore Collection',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              color: AppColors.forestDeep,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                          Container(
                            width: 28,
                            height: 28,
                            decoration: const BoxDecoration(
                              color: Color(0xFFFFF3D9),
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.arrow_forward_rounded,
                              size: 15,
                              color: AppColors.forestDeep,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDesktopSeasonalBanner(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFFF9F5EC),
        borderRadius: AppRadii.roundedXl,
        border: Border.all(color: const Color(0xFFE2D6C3)),
      ),
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: const BoxDecoration(
              color: AppColors.forestDeep,
              borderRadius: AppRadii.roundedFull,
            ),
            child: const Text(
              'SEASONAL SOWING GUIDE',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                color: Colors.white,
                fontSize: 10.5,
                fontWeight: FontWeight.w800,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Text(
            'Need Help Choosing What to Plant This Month?',
            style: TextStyle(
              fontFamily: AppTypography.displayFont,
              color: AppColors.textPrimary,
              fontWeight: FontWeight.w800,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'Explore our month-by-month Indian Sowing Calendar designed for Kharif, Rabi, and Zaid cultivation across Indian agro-climatic zones.',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              color: AppColors.textMuted,
              fontSize: 13.5,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          ElevatedButton.icon(
            onPressed: () {
              Navigator.pushNamed(context, discoverScreenRoute, arguments: 'Seeds');
            },
            icon: const Icon(Icons.calendar_month_rounded, size: 16),
            label: const Text('View All Seed Varieties'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDeep,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedFull),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }
}

class _DesktopTabItem {
  final String label;
  final IconData icon;

  const _DesktopTabItem({required this.label, required this.icon});
}
