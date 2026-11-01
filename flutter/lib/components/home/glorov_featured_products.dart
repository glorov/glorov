import 'package:flutter/material.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../../models/glorov/glorov_mock_data.dart';
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
  String _selectedCategory = 'All Botanical';

  final List<String> _tabs = [
    'All Botanical',
    'Indoor Plants',
    'Heirloom Seeds',
    'Planters & Tools',
  ];

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

    // Filter products
    final displayedProducts = _selectedCategory == 'All Botanical'
        ? GlorovMockData.products
        : GlorovMockData.products
            .where((p) => p.category == _selectedCategory)
            .toList();

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

              // Product Grid
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
            ],
          ),
        ),
      ),
    );
  }
}
