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
  const GlorovFeaturedProducts({super.key});

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
          .take(8)
          .toList();
    }
    if (_selectedCategory == 'Heirloom Seeds') {
      return GlorovMockData.products
          .where((p) =>
              p.category == 'Seeds' ||
              p.productType == GlorovProductType.seeds)
          .take(8)
          .toList();
    }

    // Default 'All Featured': Curated high-converting selection (Max 8)
    const preferredIds = [
      'glr-her-14', // Arugula Seeds (Rocket Leaves) - ⚡ CULINARY HERB
      'glr-plt-01', // Peace Lily Plant - ⚡ NASA AIR PURIFIER
      'glr-her-13', // Italian Basil Seeds - ⚡ CULINARY HERB
      'glr-seed-01', // Green Chilli Seeds - ⚡ 98% GERMINATION
      'glr-plt-02', // Monstera Deliciosa - ⚡ LOW MAINTENANCE
      'glr-flw-01', // Marigold Seeds - ⚡ VIBRANT BLOOMS
      'glr-plt-05', // Snake Plant Golden - ⚡ NASA AIR PURIFIER
      'glr-veg-02', // Coriander Seeds - ⚡ 98% GERMINATION
    ];

    final curated = <GlorovProduct>[];
    for (final id in preferredIds) {
      final match =
          GlorovMockData.products.where((p) => p.id == id).firstOrNull;
      if (match != null) curated.add(match);
    }

    if (curated.length < 8) {
      for (final p in GlorovMockData.products) {
        if (!curated.any((c) => c.id == p.id)) {
          curated.add(p);
          if (curated.length == 8) break;
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
    double childAspectRatio = 0.66;

    if (width > 1150) {
      crossAxisCount = 4;
      childAspectRatio = 0.72;
    } else if (width > 780) {
      crossAxisCount = 3;
      childAspectRatio = 0.68;
    } else if (width < 380) {
      childAspectRatio = 0.58;
    }

    // Filter products strictly capped to 8 items to prevent complex/overwhelming UI
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
              GridView.builder(
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
                          const Row(
                            children: [
                              Icon(
                                Icons.eco_outlined,
                                color: AppColors.forestDeep,
                                size: 20,
                              ),
                              SizedBox(width: 8),
                              Text(
                                'Showing 8 hand-picked botanicals of 60+ specimens',
                                style: TextStyle(
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
                          const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.eco_outlined,
                                color: AppColors.forestDeep,
                                size: 18,
                              ),
                              SizedBox(width: 6),
                              Text(
                                'Showing 8 curated botanicals of 60+',
                                style: TextStyle(
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
                            label: const Text('Explore Full Catalog'),
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
