import 'package:flutter/material.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_product.dart';
import '../../repositories/contracts/product_repository.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';
import '../../screens/discover/glorov_categories_screen.dart';

class BotanicalCategoryItem {
  final String id;
  final String title;
  final String description;
  final String imageUrl;
  final int count;
  final String badge;

  const BotanicalCategoryItem({
    required this.id,
    required this.title,
    required this.description,
    required this.imageUrl,
    required this.count,
    this.badge = 'Botanical',
  });
}

/// GLOROV Category Discovery Component
/// Clean, responsive layout tailored for mobile devices and desktop.
/// Directly synchronised with the 4 root seeded botanical database categories.
class GlorovCategoryDiscovery extends StatefulWidget {
  final List<BotanicalCategoryItem>? categories;
  final bool isLoading;

  const GlorovCategoryDiscovery({
    super.key,
    this.categories,
    this.isLoading = false,
  });

  /// Strictly the EXACT 4 Root Seeded Categories (Seeds, Live Plants, Planters & Pots, Plant Care & Soil)
  static const List<BotanicalCategoryItem> defaultCategories = [
    BotanicalCategoryItem(
      id: 'seeds',
      title: 'Seeds',
      description: 'Heirloom Desi Vegetable & Flower Seeds',
      imageUrl:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793571727/glorov/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg',
      count: 18,
      badge: 'High Germination',
    ),
    BotanicalCategoryItem(
      id: 'live-plants',
      title: 'Live Plants',
      description: 'Acclimatized Indoor & Balcony Houseplants',
      imageUrl: 'https://res.cloudinary.com/naodmm8w/image/upload/v1793516579/glorov/products/indoor-plants/money-plant-golden-1.jpg',
      count: 24,
      badge: 'Nursery Dispatched',
    ),
    BotanicalCategoryItem(
      id: 'planters-pots',
      title: 'Planters & Pots',
      description: 'Artisan Terracotta & Glazed Ceramic Pots',
      imageUrl: 'https://res.cloudinary.com/naodmm8w/image/upload/v1793516566/glorov/products/ceramic-planters/diamond-pot-1.jpg',
      count: 12,
      badge: 'Handcrafted',
    ),
    BotanicalCategoryItem(
      id: 'plant-care-soil',
      title: 'Plant Care & Soil',
      description: '100% Organic Potting Mix & Garden Tools',
      imageUrl:
          'https://res.cloudinary.com/naodmm8w/image/upload/v1793516582/glorov/products/potting-mix-fertilizers/pot-o-mix-5-kg-potting-mix-1.jpg',
      count: 15,
      badge: '100% Organic',
    ),
  ];

  @override
  State<GlorovCategoryDiscovery> createState() =>
      _GlorovCategoryDiscoveryState();
}

class _GlorovCategoryDiscoveryState extends State<GlorovCategoryDiscovery> {
  List<BotanicalCategoryItem>? _remoteCategories;
  bool _isLoadingRemote = true;

  @override
  void initState() {
    super.initState();
    if (widget.categories != null) {
      _isLoadingRemote = false;
    } else {
      _loadCategories();
    }
  }

  Future<void> _loadCategories() async {
    try {
      final results = await Future.wait([
        GlorovRepositories.products.getCategories(),
        GlorovRepositories.products.getProducts(),
      ]);
      final cats = results[0] as List<GlorovProductCategory>;
      final prods = results[1] as List<GlorovProduct>;

      if (mounted) {
        if (cats.isNotEmpty) {
          final items = cats.map((c) {
            final matchingProd = prods.where((p) =>
                p.category.toLowerCase() == c.name.toLowerCase() ||
                p.category.toLowerCase().contains(c.slug.toLowerCase())
            ).firstOrNull;

            String desc = '${c.productCount} Botanical Varieties';
            if (c.slug.contains('seed')) {
              desc = 'Heirloom Desi Vegetable & Flower Seeds';
            } else if (c.slug.contains('plant')) {
              desc = 'Acclimatized Indoor & Balcony Houseplants';
            } else if (c.slug.contains('planter') || c.slug.contains('pot')) {
              desc = 'Artisan Terracotta & Glazed Ceramic Pots';
            } else if (c.slug.contains('care') || c.slug.contains('soil')) {
              desc = '100% Organic Potting Mix & Garden Tools';
            }

            return BotanicalCategoryItem(
              id: c.slug,
              title: c.name,
              description: desc,
              imageUrl: matchingProd?.primaryImage ?? '',
              count: c.productCount > 0 ? c.productCount : (matchingProd != null ? 12 : 0),
              badge: c.name == 'Seeds'
                  ? 'High Germination'
                  : (c.name.contains('Plant')
                      ? 'Nursery Dispatched'
                      : 'Handcrafted'),
            );
          }).toList();

          setState(() {
            _remoteCategories = items;
            _isLoadingRemote = false;
          });
        } else {
          setState(() {
            _remoteCategories = [];
            _isLoadingRemote = false;
          });
        }
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _remoteCategories = [];
          _isLoadingRemote = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final categories = widget.categories ?? _remoteCategories ?? const [];
    final bool isCurrentlyLoading = widget.isLoading ||
        (widget.categories == null && _isLoadingRemote && _remoteCategories == null);

    if (categories.isEmpty && !isCurrentlyLoading) {
      return const SizedBox.shrink();
    }
    final isDesktop = AppBreakpoints.isDesktop(context);
    final width = MediaQuery.of(context).size.width;

    final crossAxisCount = width > 800 ? 4 : 2;
    final childAspectRatio = width > 800 ? 0.95 : 1.05;

    return Container(
      width: double.infinity,
      color: AppColors.surfacePure,
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.lg : AppSpacing.md,
        vertical: isDesktop ? AppSpacing.xl : AppSpacing.md,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Section Header Row (Optimized to never truncate on narrow mobile screens)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'CURATED FOR GROWERS',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 10.5,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: AppColors.sage,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          'Explore by Category',
                          style: TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: isDesktop ? 24 : 19,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                            letterSpacing: -0.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () =>
                        Navigator.pushNamed(context, discoverScreenRoute),
                    icon: const Icon(Icons.arrow_forward_rounded, size: 14),
                    label: const Text('View All'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.forestDeep,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      textStyle: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // 2. Direct Category Touch Pill Filter Row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                child: Row(
                  children: [
                    _buildTouchPill(
                      context,
                      title: 'For You',
                      handle: 'for-you',
                      icon: Icons.auto_awesome_rounded,
                      isSpecial: true,
                    ),
                    const SizedBox(width: 6),
                    _buildTouchPill(
                      context,
                      title: 'Seeds',
                      handle: 'seeds',
                      icon: Icons.grain_rounded,
                    ),
                    const SizedBox(width: 6),
                    _buildTouchPill(
                      context,
                      title: 'Live Plants',
                      handle: 'live-plants',
                      icon: Icons.local_florist_rounded,
                    ),
                    const SizedBox(width: 6),
                    _buildTouchPill(
                      context,
                      title: 'Planters & Pots',
                      handle: 'planters-pots',
                      icon: Icons.inventory_2_outlined,
                    ),
                    const SizedBox(width: 6),
                    _buildTouchPill(
                      context,
                      title: 'Plant Care & Soil',
                      handle: 'plant-care-soil',
                      icon: Icons.spa_rounded,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // 3. Responsive 4-Category Grid (Clean 2x2 on Mobile, 4 across on Desktop)
              GlorovSkeletonLoader(
                loading: isCurrentlyLoading,
                skeleton: SkeletonScope(
                  child: GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: 4,
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: crossAxisCount,
                      crossAxisSpacing: 10,
                      mainAxisSpacing: 10,
                      childAspectRatio: childAspectRatio,
                    ),
                    itemBuilder: (context, index) {
                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: AppColors.sage.withValues(alpha: 0.15),
                          ),
                        ),
                        child: const LoadingSkeleton(
                          borderRadius: BorderRadius.all(Radius.circular(14)),
                        ),
                      );
                    },
                  ),
                ),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: categories.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    crossAxisSpacing: 10,
                    mainAxisSpacing: 10,
                    childAspectRatio: childAspectRatio,
                  ),
                  itemBuilder: (context, index) {
                    return GlorovStaggeredItem(
                      index: index < 4 ? index : 3,
                      child: _buildCategoryCard(context, categories[index]),
                    );
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTouchPill(
    BuildContext context, {
    required String title,
    required String handle,
    required IconData icon,
    bool isSpecial = false,
  }) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GlorovCategoriesScreen(
              initialCategoryHandle: handle,
            ),
          ),
        );
      },
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: isSpecial
              ? const Color(0xFFEFF6FF)
              : const Color(0xFFF3F4F6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSpecial
                ? const Color(0xFFBFDBFE)
                : const Color(0xFFE5E7EB),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 13,
              color: isSpecial ? const Color(0xFF2563EB) : AppColors.forestDeep,
            ),
            const SizedBox(width: 5),
            Text(
              title,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 11.5,
                fontWeight: isSpecial ? FontWeight.w800 : FontWeight.w600,
                color: isSpecial ? const Color(0xFF1D4ED8) : AppColors.textPrimary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryCard(
      BuildContext context, BotanicalCategoryItem category) {
    return InkWell(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => GlorovCategoriesScreen(
              initialCategoryHandle: category.id,
            ),
          ),
        );
      },
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surfacePure,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0F000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
          border: Border.all(color: const Color(0xFFE5E7EB)),
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Background Category Image with Asset/Network Fallback
            category.imageUrl.startsWith('assets/')
                ? Image.asset(
                    category.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        _buildPlaceholder(),
                  )
                : Image.network(
                    category.imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        _buildPlaceholder(),
                  ),

            // Subtle dark overlay gradient for high readability
            Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.05),
                    Colors.black.withValues(alpha: 0.82),
                  ],
                  stops: const [0.4, 1.0],
                ),
              ),
            ),

            // Item count pill at top right
            Positioned(
              top: 7,
              right: 7,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 2.5,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.92),
                  borderRadius: AppRadii.roundedFull,
                ),
                child: Text(
                  '${category.count} items',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w800,
                    color: AppColors.forestDeep,
                  ),
                ),
              ),
            ),

            // Category title & sub-description at bottom
            Positioned(
              left: 10,
              right: 10,
              bottom: 10,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    category.title,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    category.description,
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withValues(alpha: 0.88),
                      height: 1.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.mintSurface,
      child: const Center(
        child: Icon(Icons.eco_rounded, color: AppColors.sage, size: 32),
      ),
    );
  }
}
