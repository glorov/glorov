import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../core/icons/glorov_category_svg_icons.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../common/glorov_y_scroll_pass_through.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/glorov_header_scroll_notifier.dart';

/// Data class representing a category navigation item
class _CategoryNavItem {
  final String label;
  final String? svgXml;
  final IconData icon;
  final String categoryFilter;
  final String route;

  const _CategoryNavItem({
    required this.label,
    this.svgXml,
    required this.icon,
    required this.categoryFilter,
    required this.route,
  });
}

/// GLOROV Main Storefront Navigation Header
/// Implements true sticky header behaviors:
/// 1. Top of page ("full up", pixels <= 8): Full height with centered category icons (Image 1 & 2)
/// 2. Scrolling down (pixels > 8): Stays sticky at the top in sleek compact mode (no icons, smooth height reduction)
///    Eliminates jarring open/close flickering on scroll direction reversals.
/// 3. Center-aligned categories with high-craft spring micro-interactions (NO "For You")
/// 4. Top wine accent line + User brand SVG logo + Pill search bar + Badged actions (Image 1)
class GlorovHeader extends StatefulWidget implements PreferredSizeWidget {
  final VoidCallback? onMenuPressed;
  final ValueChanged<String>? onSearchSubmitted;
  final ScrollController? pageScrollController;
  final String? currentRoute;

  const GlorovHeader({
    super.key,
    this.onMenuPressed,
    this.onSearchSubmitted,
    this.pageScrollController,
    this.currentRoute,
  });

  @override
  State<GlorovHeader> createState() => _GlorovHeaderState();

  @override
  Size get preferredSize => const Size.fromHeight(132.0);
}

class _GlorovHeaderState extends State<GlorovHeader> {
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _categoryScrollController = ScrollController();

  // 8 Botanical Categories (Centered, with custom SVG icons matching user specifications)
  static const List<_CategoryNavItem> _categories = [
    _CategoryNavItem(
      label: 'Seeds',
      svgXml: GlorovCategorySvgIcons.seeds,
      icon: Icons.eco_outlined,
      categoryFilter: 'Seeds',
      route: seedsScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Live Plants',
      svgXml: GlorovCategorySvgIcons.livePlants,
      icon: Icons.yard_outlined,
      categoryFilter: 'Live Plants',
      route: livePlantsScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Planters',
      svgXml: GlorovCategorySvgIcons.planters,
      icon: Icons.inventory_2_outlined,
      categoryFilter: 'Planters & Pots',
      route: plantersScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Plant Care',
      svgXml: GlorovCategorySvgIcons.plantCare,
      icon: Icons.water_drop_outlined,
      categoryFilter: 'Plant Care & Soil',
      route: plantCareScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Flowering',
      svgXml: GlorovCategorySvgIcons.flowering,
      icon: Icons.local_florist_outlined,
      categoryFilter: 'Flowering Plants',
      route: floweringScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Herbs',
      svgXml: GlorovCategorySvgIcons.herbs,
      icon: Icons.grass_outlined,
      categoryFilter: 'Fruit & Herb Seeds',
      route: herbsScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Vegetables',
      svgXml: GlorovCategorySvgIcons.vegetables,
      icon: Icons.agriculture_outlined,
      categoryFilter: 'Vegetable Seeds',
      route: vegetablesScreenRoute,
    ),
    _CategoryNavItem(
      label: 'Offers',
      svgXml: GlorovCategorySvgIcons.offers,
      icon: Icons.percent_outlined,
      categoryFilter: 'Offers',
      route: offersScreenRoute,
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    _categoryScrollController.dispose();
    super.dispose();
  }

  void _navigateToHome() {
    GlorovHeaderScrollNotifier.instance.clearCategory();
    final currentRoute = ModalRoute.of(context)?.settings.name;
    if (currentRoute == homeScreenRoute ||
        currentRoute == '/' ||
        currentRoute == '' ||
        currentRoute == '/home') {
      return;
    }
    if (Navigator.canPop(context)) {
      Navigator.popUntil(context, (route) => route.isFirst);
    } else {
      Navigator.pushReplacementNamed(context, homeScreenRoute);
    }
  }

  void _openSearchScreen([String? query]) {
    final currentRoute = ModalRoute.of(context)?.settings.name;
    if (currentRoute == searchScreenRoute) return;

    final initial = query ?? _searchController.text;
    Navigator.pushNamed(
      context,
      searchScreenRoute,
      arguments: initial.trim().isNotEmpty ? initial.trim() : null,
    );
  }

  void _handleSearchSubmit(String query) {
    if (widget.onSearchSubmitted != null) {
      widget.onSearchSubmitted!(query);
    } else {
      _openSearchScreen(query);
    }
  }

  void _onCategoryTapped(_CategoryNavItem item) {
    // Select category in coordinator
    GlorovHeaderScrollNotifier.instance.selectCategory(item.label);

    final currentRoute = ModalRoute.of(context)?.settings.name;
    if (currentRoute == item.route) return;

    // Direct click navigation to dedicated category route
    Navigator.pushNamed(
      context,
      item.route,
      arguments: item.categoryFilter,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);

    return ListenableBuilder(
      listenable: GlorovHeaderScrollNotifier.instance,
      builder: (context, _) {
        final showIcons = GlorovHeaderScrollNotifier.instance.showIcons;
        final currentRouteName =
            widget.currentRoute ?? ModalRoute.of(context)?.settings.name;
        final isHomeRoute = currentRouteName == homeScreenRoute ||
            currentRouteName == '/' ||
            currentRouteName == '' ||
            currentRouteName == '/home';
        final selectedCategory = isHomeRoute
            ? ''
            : GlorovHeaderScrollNotifier.instance.selectedCategory;

        // Heights
        final double fullHeight = isDesktop ? 132.0 : 124.0;
        final double compactHeight = isDesktop ? 96.0 : 94.0;
        final double targetHeight = showIcons ? fullHeight : compactHeight;

        return AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOutCubic,
          height: targetHeight,
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(
              bottom: BorderSide(color: Color(0xFFE5E7EB), width: 1),
            ),
            boxShadow: AppShadows.header,
          ),
          clipBehavior: Clip.antiAlias,
          child: OverflowBox(
            alignment: Alignment.topCenter,
            minHeight: 0,
            maxHeight: fullHeight,
            child: SafeArea(
              top: false,
              bottom: false,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Top Accent Strip
                  Container(
                    height: 3.0,
                    width: double.infinity,
                    color: AppColors.forestDeep,
                  ),

                  // 1. Top Row (Logo + Pill Search + Badged Actions)
                  if (isDesktop)
                    _buildDesktopTopRow(context)
                  else
                    _buildMobileTopRow(context),

                  // Divider
                  const Divider(
                    height: 1,
                    thickness: 1,
                    color: Color(0xFFF3F4F6),
                  ),

                  // 2. Category Navigation Bar (Centered with spring micro-interactions)
                  _buildCategoryStrip(
                    context,
                    showIcons: showIcons,
                    selectedCategory: selectedCategory,
                    isDesktop: isDesktop,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Desktop Top Row: SVG Logo + Pill Search Bar + Badged Actions (Image 1)
  // ---------------------------------------------------------------------------
  Widget _buildDesktopTopRow(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 6),
      color: Colors.white,
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1360),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // GLOROV Brand SVG Logo (from root directory assets)
              InkWell(
                onTap: _navigateToHome,
                borderRadius: BorderRadius.circular(8),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(vertical: 2, horizontal: 4),
                  child: SvgPicture.asset(
                    'assets/logo/glorov-logo.svg',
                    height: 36,
                    fit: BoxFit.contain,
                    placeholderBuilder: (context) => _buildLogoFallback(36),
                  ),
                ),
              ),

              const SizedBox(width: 32),

              // Central Rounded Pill Search Bar (Image 1 style)
              Expanded(
                child: InputFocus(
                  borderRadius: BorderRadius.circular(22),
                  scale: 1.005,
                  elevation: 2.0,
                  shadowColor: AppColors.forestDeep.withValues(alpha: 0.12),
                  duration: GlorovInteractionConfig.durationFast,
                  child: Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: const Color(
                          0xFFF4F4F5), // Soft grey background matching Image 1
                      borderRadius: BorderRadius.circular(22), // Sleek pill
                    ),
                    child: TextField(
                      controller: _searchController,
                      textInputAction: TextInputAction.search,
                      onSubmitted: _handleSearchSubmit,
                      onTap: () => _openSearchScreen(),
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13.5,
                        color: AppColors.textPrimary,
                      ),
                      decoration: InputDecoration(
                        hintText:
                            'Search for plants, seeds, fertilizers & pots...',
                        hintStyle: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          color: Color(0xFF9CA3AF),
                          fontSize: 13.5,
                        ),
                        prefixIcon: InkWell(
                          onTap: () => _openSearchScreen(_searchController.text),
                          borderRadius: BorderRadius.circular(20),
                          child: const Icon(
                            Icons.search,
                            color: AppColors.forestDeep, // Match botanical theme
                            size: 20,
                          ),
                        ),
                        suffixIcon: _searchController.text.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear,
                                    size: 16, color: Color(0xFF9CA3AF)),
                                onPressed: () {
                                  setState(() {
                                    _searchController.clear();
                                  });
                                },
                              )
                            : null,
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        errorBorder: InputBorder.none,
                        disabledBorder: InputBorder.none,
                        focusedErrorBorder: InputBorder.none,
                        filled: false,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                      ),
                    ),
                  ),
                ),
              ),

              const SizedBox(width: 32),

              // Action 1: User / Profile: Dynamic based on authentication status
              ListenableBuilder(
                listenable: GlorovAccountState.instance,
                builder: (context, _) {
                  final accountState = GlorovAccountState.instance;
                  final isAuthenticated = accountState.isAuthenticated;
                  final profile = accountState.profile;

                  if (isAuthenticated) {
                    // Logged in: Profile avatar with user initials and active status dot
                    return _HeaderActionButton(
                      tooltip: profile.displayName.isNotEmpty
                          ? 'Account (${profile.displayName})'
                          : 'Customer Account',
                      customIcon: Container(
                        width: 26,
                        height: 26,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.forestDark,
                          border: Border.all(color: AppColors.sage, width: 1.5),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          profile.initials,
                          style: const TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      badge: Container(
                        width: 8,
                        height: 8,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF10B981),
                          border: Border.all(color: Colors.white, width: 1.5),
                        ),
                      ),
                      onTap: () =>
                          Navigator.pushNamed(context, profileScreenRoute),
                    );
                  }

                  // Not Logged In: Custom Guest SVG Icon
                  return _HeaderActionButton(
                    tooltip: 'Sign In / Register',
                    customIcon: GlorovCategorySvgIcons.buildSvgIcon(
                      GlorovCategorySvgIcons.guestUser,
                      size: 22,
                      color: const Color(0xFF1E293B),
                    ),
                    onTap: () =>
                        Navigator.pushNamed(context, logInScreenRoute),
                  );
                },
              ),

              const SizedBox(width: 12),

              // Action 2: More / Wishlist
              ListenableBuilder(
                listenable: GlorovCartState.instance,
                builder: (context, _) {
                  final count = GlorovCartState.instance.wishlistIds.length;
                  return _HeaderActionButton(
                    icon: Icons.favorite_border_rounded,
                    tooltip: 'Wishlist',
                    badgeText: count > 0 ? '$count' : null,
                    badgeColor: AppColors.sage,
                    onTap: () =>
                        Navigator.pushNamed(context, bookmarkScreenRoute),
                  );
                },
              ),

              const SizedBox(width: 12),

              // Action 3: Cart with solid counter badge
              ListenableBuilder(
                listenable: GlorovCartState.instance,
                builder: (context, _) {
                  final count = GlorovCartState.instance.itemCount;
                  return _HeaderActionButton(
                    icon: Icons.shopping_cart_outlined,
                    tooltip: 'Cart',
                    badgeText: count > 0 ? '$count' : null,
                    badgeColor: AppColors.forestDeep, // Match GLOROV theme
                    onTap: () => Navigator.pushNamed(context, cartScreenRoute),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Mobile Top Row: Left-side SVG Logo + Expanded Pill Search Bar ONLY
  // (Cart and Login icons removed as they are housed in the Mobile Bottom Nav)
  // ---------------------------------------------------------------------------
  Widget _buildMobileTopRow(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 14.0, vertical: 7.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 1. Left-Side Glorov Brand SVG Logo
          InkWell(
            onTap: _navigateToHome,
            borderRadius: BorderRadius.circular(6),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 2.0),
              child: SvgPicture.asset(
                'assets/logo/glorov-logo.svg',
                height: 25,
                fit: BoxFit.contain,
                placeholderBuilder: (context) => _buildLogoFallback(25),
              ),
            ),
          ),

          const SizedBox(width: 10),

          // 2. Expanded Rounded Pill Search Field (fills remaining row width)
          Expanded(
            child: Container(
              height: 38,
              decoration: BoxDecoration(
                color: const Color(0xFFF4F4F5), // Soft gray pill
                borderRadius: BorderRadius.circular(20),
              ),
              child: TextField(
                controller: _searchController,
                textInputAction: TextInputAction.search,
                onSubmitted: _handleSearchSubmit,
                onTap: () => _openSearchScreen(),
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  color: AppColors.textPrimary,
                ),
                decoration: InputDecoration(
                  hintText: 'Search for plants, seeds, pots...',
                  hintStyle: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    color: Color(0xFF9CA3AF),
                    fontSize: 12.5,
                  ),
                  prefixIcon: InkWell(
                    onTap: () => _openSearchScreen(_searchController.text),
                    borderRadius: BorderRadius.circular(20),
                    child: const Icon(
                      Icons.search,
                      color: AppColors.forestDeep, // Match botanical theme
                      size: 19,
                    ),
                  ),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  errorBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  focusedErrorBorder: InputBorder.none,
                  filled: false,
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 8,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Category Navigation Strip: Responsive, Free-Scrolling on Mobile with No Jitter
  // ---------------------------------------------------------------------------
  Widget _buildCategoryStrip(
    BuildContext context, {
    required bool showIcons,
    required String selectedCategory,
    required bool isDesktop,
  }) {
    return GlorovYScrollPassThrough(
      parentScrollController: widget.pageScrollController,
      child: Container(
        color: Colors.white,
        height: showIcons ? (isDesktop ? 62.0 : 66.0) : (isDesktop ? 38.0 : 38.0),
        alignment: isDesktop ? Alignment.center : Alignment.centerLeft,
        child: ScrollConfiguration(
          behavior: const GlorovHorizontalScrollBehavior(),
          child: SingleChildScrollView(
            key: const PageStorageKey<String>('glorov_header_categories_scroll'),
            controller: _categoryScrollController,
            scrollDirection: Axis.horizontal,
            physics: const ClampingScrollPhysics(), // Stays where user scrolls; no snap-back!
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment:
                  isDesktop ? MainAxisAlignment.center : MainAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: _categories.map((cat) {
                final isSelected = selectedCategory == cat.label;
                return GlorovYScrollPassThrough(
                  parentScrollController: widget.pageScrollController,
                  child: _HeaderCategoryNavItem(
                    item: cat,
                    isSelected: isSelected,
                    showIcons: showIcons,
                    isDesktop: isDesktop,
                    onTap: () => _onCategoryTapped(cat),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLogoFallback(double height) {
    return SvgPicture.asset(
      'assets/logo/glorov-g-symbol.svg',
      height: height,
      fit: BoxFit.contain,
    );
  }
}

// -----------------------------------------------------------------------------
// Interactive Category Item Widget with Fluid Spring Micro-Interactions
// -----------------------------------------------------------------------------
class _HeaderCategoryNavItem extends StatefulWidget {
  final _CategoryNavItem item;
  final bool isSelected;
  final bool showIcons;
  final bool isDesktop;
  final VoidCallback onTap;

  const _HeaderCategoryNavItem({
    required this.item,
    required this.isSelected,
    required this.showIcons,
    required this.isDesktop,
    required this.onTap,
  });

  @override
  State<_HeaderCategoryNavItem> createState() => _HeaderCategoryNavItemState();
}

class _HeaderCategoryNavItemState extends State<_HeaderCategoryNavItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _bounceController;
  late final Animation<double> _bounceAnimation;
  bool _isHovered = false;
  bool _isPressed = false;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _bounceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 320),
    );
    _bounceAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.20)
            .chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 35,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.20, end: 1.05)
            .chain(CurveTween(curve: Curves.elasticOut)),
        weight: 65,
      ),
    ]).animate(_bounceController);

    if (widget.isSelected) {
      _bounceController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant _HeaderCategoryNavItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.isSelected && widget.isSelected) {
      // Switched to selected — trigger spring bounce micro-interaction!
      _bounceController.forward(from: 0.0);
    } else if (oldWidget.isSelected && !widget.isSelected) {
      _bounceController.animateTo(0.0,
          duration: const Duration(milliseconds: 180), curve: Curves.easeOut);
    }
  }

  @override
  void dispose() {
    _bounceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = widget.isSelected;
    final showIcons = widget.showIcons;
    final isHovered = _isHovered;
    final isPressed = _isPressed;

    // Hover vertical lift micro-interaction
    final double translateY = isHovered && !isPressed ? -2.5 : 0.0;

    // Scale on press or hover
    final double baseScale =
        isPressed ? 0.93 : (isHovered && !isSelected ? 1.04 : 1.0);

    return FocusableActionDetector(
      onShowFocusHighlight: (f) => setState(() => _isFocused = f),
      mouseCursor: SystemMouseCursors.click,
      onShowHoverHighlight: (h) => setState(() => _isHovered = h),
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) => widget.onTap(),
        ),
      },
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutCubic,
          transform: Matrix4.translationValues(0, translateY, 0),
          padding: EdgeInsets.symmetric(
            horizontal: widget.isDesktop ? 18 : 10,
            vertical: showIcons ? 4 : 3,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: _isFocused
                ? Border.all(color: AppColors.forestDeep, width: 1.5)
                : null,
          ),
          child: AnimatedScale(
            scale: baseScale,
            duration: const Duration(milliseconds: 160),
            curve: Curves.easeOutBack,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Icon Mode (Rendered when full up at page top)
                if (showIcons) ...[
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 240),
                    curve: Curves.easeOutCubic,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(
                              0xFFD8F3DC) // Mint active pill highlight (Image 2 style)
                          : (isHovered
                              ? const Color(0xFFF0FDF4) // Soft hover green wash
                              : Colors.transparent),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: AnimatedBuilder(
                      animation: _bounceAnimation,
                      builder: (context, child) {
                        final double iconScale = isSelected
                            ? _bounceAnimation.value
                            : (isHovered ? 1.06 : 1.0);
                        final Color iconColor = isSelected
                            ? AppColors.forestDeep
                            : (isHovered
                                ? const Color(0xFF1B4332)
                                : const Color(0xFF4B5563));
                        return Transform.scale(
                          scale: iconScale,
                          child: widget.item.svgXml != null
                              ? GlorovCategorySvgIcons.buildSvgIcon(
                                  widget.item.svgXml!,
                                  size: 21,
                                  color: iconColor,
                                )
                              : Icon(
                                  widget.item.icon,
                                  size: 21,
                                  color: iconColor,
                                ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 3),
                ],

                // Category Label Text
                AnimatedDefaultTextStyle(
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOutCubic,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: showIcons ? (widget.isDesktop ? 12 : 11) : 12.5,
                    fontWeight: isSelected
                        ? FontWeight.w800
                        : (isHovered ? FontWeight.w700 : FontWeight.w600),
                    color: isSelected
                        ? const Color(0xFF0F5132)
                        : (isHovered
                            ? const Color(0xFF111827)
                            : const Color(0xFF4B5563)),
                  ),
                  child: Text(widget.item.label),
                ),

                // Animated Bottom Active Indicator Bar (Smooth spring width expansion on switch)
                const SizedBox(height: 3),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 240),
                  curve: Curves.easeOutCubic,
                  height: 2.8,
                  width: isSelected
                      ? (showIcons ? 28.0 : 26.0)
                      : (isHovered ? 14.0 : 0.0),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF1B4332) // Forest green active line
                        : (isHovered
                            ? const Color(
                                0xFF86EFAC) // Gentle mint preview line
                            : Colors.transparent),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// Desktop Header Action Button with Soft Ripple & Badges
// -----------------------------------------------------------------------------
class _HeaderActionButton extends StatefulWidget {
  final IconData? icon;
  final Widget? customIcon;
  final String tooltip;
  final String? badgeText;
  final Color? badgeColor;
  final Widget? badge;
  final VoidCallback onTap;

  const _HeaderActionButton({
    this.icon,
    this.customIcon,
    required this.tooltip,
    this.badgeText,
    this.badgeColor,
    this.badge,
    required this.onTap,
  }) : assert(icon != null || customIcon != null);

  @override
  State<_HeaderActionButton> createState() => _HeaderActionButtonState();
}

class _HeaderActionButtonState extends State<_HeaderActionButton> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: SystemMouseCursors.click,
        child: TapFeedback(
          onTap: widget.onTap,
          effect: TapAnimationType.scale,
          scaleDown: 0.90,
          duration: GlorovInteractionConfig.durationFast,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 150),
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _isHovered ? const Color(0xFFF3F4F6) : Colors.transparent,
              shape: BoxShape.circle,
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                widget.customIcon ??
                    Icon(
                      widget.icon!,
                      size: 22,
                      color: _isHovered
                          ? AppColors.forestDeep
                          : const Color(0xFF1E293B),
                    ),
                if (widget.badge != null)
                  Positioned(
                    right: -4,
                    top: -4,
                    child: widget.badge!,
                  )
                else if (widget.badgeText != null)
                  Positioned(
                    right: -7,
                    top: -6,
                    child: AnimatedSwitcher(
                      duration: const Duration(milliseconds: 200),
                      transitionBuilder: (child, animation) =>
                          ScaleTransition(scale: animation, child: child),
                      child: Container(
                        key: ValueKey<String>(widget.badgeText!),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 4.5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: widget.badgeColor ?? AppColors.forestDeep,
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
                        child: Text(
                          widget.badgeText!,
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 9.5,
                            fontWeight: FontWeight.bold,
                            height: 1,
                          ),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
