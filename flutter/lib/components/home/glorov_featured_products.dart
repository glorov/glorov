import 'package:flutter/material.dart';
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
import '../../core/interactions/interactions.dart';
import '../common/glorov_y_scroll_pass_through.dart';
import '../product/glorov_product_card.dart';

/// GLOROV Featured Products Section with Interactive Filter Tabs
class GlorovFeaturedProducts extends StatefulWidget {
  final bool isLoading;

  const GlorovFeaturedProducts({
    super.key,
    this.isLoading = false,
  });

  @override
  State<GlorovFeaturedProducts> createState() => _GlorovFeaturedProductsState();
}

class _GlorovFeaturedProductsState extends State<GlorovFeaturedProducts> {
  String _selectedCategory = 'All Featured';

  final List<String> _tabs = [
    'All Featured',
    'Live Plants',
    'Heirloom Seeds',
  ];

  List<GlorovProduct> _getCuratedProducts() {
    if (_selectedCategory == 'Live Plants') {
      return GlorovMockData.products
          .where((p) =>
              p.category == 'Live Plants' ||
              p.productType == GlorovProductType.plants)
          .take(16)
          .toList();
    }
    if (_selectedCategory == 'Heirloom Seeds') {
      return GlorovMockData.products
          .where((p) =>
              p.category == 'Seeds' ||
              p.productType == GlorovProductType.seeds)
          .take(16)
          .toList();
    }

    // Default 'All Featured': Curated high-converting selection (16 items)
    const preferredIds = [
      'glr-her-14', // Fenugreek Seeds - Culinary Herb
      'glr-ind-19', // Peace Lily Plant - Low Maintenance
      'glr-her-13', // Coriander Seeds - Culinary Herb
      'glr-seed-01', // Green Chilli Seeds - 98% Germination
      'glr-air-30', // ZZ Plant - NASA Air Purifier
      'glr-flo-09', // Marigold Flower Seeds - Vibrant Blooms
      'glr-suc-39', // Snake Plant - Golden Hahnii - Drought Tolerant
      'glr-veg-02', // Green Head Cabbage Seeds - 98% Germination
      'glr-flo-36', // Petunia Grandiflora Mixed Cascade - Continuous Blooms
      'glr-air-28', // Aglaonema Pink Beauty Plant - NASA Air Purifier
      'glr-veg-01', // Brinjal Banarasi Giant Seeds - 98% Germination
      'glr-ind-21', // Jade Mini Plant - Low Maintenance
      'glr-flo-35', // Bird of Paradise Plant - Continuous Blooms
      'glr-her-15', // Holy Basil Seeds - Culinary Herb
      'glr-ind-24', // Areca Palm Plant XL - Low Maintenance
      'glr-veg-05', // Heirloom Tomato Seeds - 98% Germination
    ];

    final curated = <GlorovProduct>[];
    for (final id in preferredIds) {
      final match =
          GlorovMockData.products.where((p) => p.id == id).firstOrNull;
      if (match != null) curated.add(match);
    }

    if (curated.length < 16) {
      for (final p in GlorovMockData.products) {
        if (!curated.any((c) => c.id == p.id)) {
          curated.add(p);
          if (curated.length == 16) break;
        }
      }
    }
    return curated;
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final width = MediaQuery.of(context).size.width;

    int crossAxisCount = 2;
    double childAspectRatio = 0.65;

    if (width > 1150) {
      crossAxisCount = 4;
      childAspectRatio = 0.65;
    } else if (width >= 640) {
      crossAxisCount = 3;
      childAspectRatio = 0.60;
    } else {
      childAspectRatio = 0.65;
    }

    // Filter products (showing at least 16 curated botanicals)
    final displayedProducts = _getCuratedProducts();

    return Container(
      width: double.infinity,
      color: AppColors.surfaceCream,
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.lg : AppSpacing.md,
        vertical: AppSpacing.xxl,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header & Filter Tabs
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'HANDPICKED FOR YOUR GARDEN',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.8,
                          color: AppColors.sage,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Featured Seeds & Plants',
                        style: TextStyle(
                          fontFamily: AppTypography.displayFont,
                          fontSize: isDesktop ? 28 : 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  if (isDesktop)
                    TextButton.icon(
                      onPressed: () =>
                          Navigator.pushNamed(context, discoverScreenRoute),
                      icon: const Icon(Icons.arrow_forward, size: 16),
                      label: const Text('View Full Catalog'),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.forestDeep,
                        textStyle: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Filter Chips
              GlorovYScrollPassThrough(
                child: ScrollConfiguration(
                  behavior: const GlorovHorizontalScrollBehavior(),
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _tabs.map((tab) {
                        final isSelected = _selectedCategory == tab;
                        return GlorovYScrollPassThrough(
                          child: Padding(
                            padding: const EdgeInsets.only(right: AppSpacing.sm),
                            child: ChoiceChip(
                              label: Text(tab),
                              selected: isSelected,
                              onSelected: (selected) {
                                if (selected) {
                                  setState(() {
                                    _selectedCategory = tab;
                                  });
                                }
                              },
                              selectedColor: AppColors.forestDeep,
                              backgroundColor: AppColors.surfacePure,
                              labelStyle: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 13,
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
              const SizedBox(height: AppSpacing.lg),

              // Product Grid (Strictly capped to 8 curated items)
              GlorovSkeletonLoader(
                loading: widget.isLoading,
                skeleton: GlorovProductGridSkeleton(
                  count: 8,
                  crossAxisCount: crossAxisCount,
                  childAspectRatio: childAspectRatio,
                ),
                child: GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: displayedProducts.length,
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    crossAxisSpacing: AppSpacing.md,
                    mainAxisSpacing: AppSpacing.md,
                    childAspectRatio: childAspectRatio,
                  ),
                  itemBuilder: (context, index) {
                    return GlorovStaggeredItem(
                      index: index < 6 ? index : 5,
                      child: GlorovProductCard(
                        product: displayedProducts[index],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: AppSpacing.xl),

              // Curated Storefront Discovery Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppRadii.roundedLg,
                  border: Border.all(color: AppColors.borderSubtle),
                  boxShadow: AppShadows.card,
                ),
                child: isDesktop
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.eco_outlined,
                                color: AppColors.forestDeep,
                                size: 20,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Showing ${displayedProducts.length} hand-picked botanicals of 60+ specimens',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          ElevatedButton.icon(
                            onPressed: () => Navigator.pushNamed(
                              context,
                              discoverScreenRoute,
                            ),
                            icon: const Icon(Icons.arrow_forward, size: 16),
                            label: const Text('Explore Full Catalog (60+)'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.forestDeep,
                              foregroundColor: Colors.white,
                              shape: const RoundedRectangleBorder(
                                borderRadius: AppRadii.roundedFull,
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 20,
                                vertical: 12,
                              ),
                            ),
                          ),
                        ],
                      )
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.eco_outlined,
                                color: AppColors.forestDeep,
                                size: 18,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'Showing ${displayedProducts.length} hand-picked botanicals of 60+ specimens',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 12),
                          ElevatedButton.icon(
                            onPressed: () => Navigator.pushNamed(
                              context,
                              discoverScreenRoute,
                            ),
                            icon: const Icon(Icons.arrow_forward, size: 16),
                            label: const Text('Explore Full Catalog (60+)'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.forestDeep,
                              foregroundColor: Colors.white,
                              shape: const RoundedRectangleBorder(
                                borderRadius: AppRadii.roundedFull,
                              ),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 11,
                              ),
                            ),
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
}
