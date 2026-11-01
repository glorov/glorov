import 'package:flutter/material.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../components/responsive/glorov_responsive.dart';
import '../../core/icons/glorov_custom_icons.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_product.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Dedicated Botanical Wishlist Screen
/// Synchronized with global wishlist IDs, providing 1-click add to cart,
/// individual removals, and graceful empty state recovery.
class GlorovWishlistScreen extends StatelessWidget {
  final bool isLoading;

  const GlorovWishlistScreen({
    super.key,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.surfaceCream,
      currentRoute: bookmarkScreenRoute,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Breadcrumbs
          _buildBreadcrumbs(context),

          // Main Wishlist Content
          GlorovContainer(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.lg,
            ),
            child: ListenableBuilder(
              listenable: GlorovCartState.instance,
              builder: (context, _) {
                final wishlistIds =
                    GlorovCartState.instance.wishlistIds;

                // Resolve wishlist IDs to actual products
                final List<GlorovProduct> products = wishlistIds
                    .map((id) => GlorovMockData.getProductById(id))
                    .whereType<GlorovProduct>()
                    .toList();

                if (isLoading) {
                  final isDesktop = AppBreakpoints.isDesktop(context);
                  return GlorovProductGridSkeleton(
                    count: 6,
                    crossAxisCount: isDesktop ? 4 : 2,
                  );
                }

                if (products.isEmpty) {
                  return _buildEmptyWishlist(context);
                }

                return _buildWishlistContent(context, products);
              },
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),

          // Storefront Footer
          const GlorovFooter(),
        ],
      ),
    );
  }

  Widget _buildBreadcrumbs(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.surfacePure,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      child: GlorovContainer(
        padding: EdgeInsets.zero,
        child: Row(
          children: [
            InkWell(
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
                        fontSize: 13,
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
                  fontSize: 13,
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
                  fontSize: 13,
                  color: AppColors.textMuted,
                ),
              ),
            ),
            const Icon(Icons.chevron_right,
                size: 14, color: AppColors.textMuted),
            const Text(
              'Botanical Wishlist',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.forestDeep,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWishlistContent(
      BuildContext context, List<GlorovProduct> products) {
    final width = MediaQuery.of(context).size.width;
    int crossAxisCount = 2;
    if (width > 1100) {
      crossAxisCount = 4;
    } else if (width > 768) {
      crossAxisCount = 3;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'My Botanical Wishlist (${products.length} saved)',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppColors.forestDeep,
                  ),
                ),
                const SizedBox(height: 2),
                const Text(
                  'Your curated collection of rare plants and certified organic heirloom seeds.',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            ElevatedButton.icon(
              onPressed: () {
                for (final p in products) {
                  GlorovCartState.instance.addToCart(p);
                }
                GlorovFeedback.showSuccessToast(
                  context,
                  message:
                      'Added all ${products.length} items to your shopping bag!',
                  actionLabel: 'VIEW BAG',
                  onAction: () => Navigator.pushNamed(context, cartScreenRoute),
                );
              },
              icon: GlorovCustomIcons.cart(size: 16, color: Colors.white, isFilled: true),
              label: const Text('ADD ALL TO BAG'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forestDeep,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: 12,
                ),
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd,
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),

        // Products Grid
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: products.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: AppBreakpoints.isMobile(context) ? 8.0 : AppSpacing.md,
            mainAxisSpacing: AppBreakpoints.isMobile(context) ? 10.0 : AppSpacing.md,
            childAspectRatio: 0.72,
          ),
          itemBuilder: (ctx, i) {
            final p = products[i];
            return GlorovStaggeredItem(
              index: i < 6 ? i : 5,
              child: GlorovProductCard(product: p),
            );
          },
        ),
      ],
    );
  }

  Widget _buildEmptyWishlist(BuildContext context) {
    final suggested = GlorovMockData.products.take(4).toList();

    return Column(
      children: [
        const SizedBox(height: AppSpacing.xl),
        Container(
          width: 90,
          height: 90,
          decoration: const BoxDecoration(
            color: AppColors.mintSurface,
            shape: BoxShape.circle,
          ),
          child: const Center(
            child: Icon(
              Icons.favorite_border_rounded,
              size: 44,
              color: AppColors.forestDeep,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        const Text(
          'Your Botanical Wishlist is Empty',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.forestDeep,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        const Text(
          'Save your favorite heirloom seeds and rare tropical foliage plants to revisit whenever you are ready to plant.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            color: AppColors.textMuted,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        GlorovButton.primary(
          label: 'EXPLORE CATALOG',
          leadingIcon: const Icon(Icons.eco_outlined, size: 16),
          onPressed: () => Navigator.pushNamed(
            context,
            discoverScreenRoute,
            arguments: 'All Botanical',
          ),
        ),
        const SizedBox(height: AppSpacing.xxl),

        // Suggested Botanical Products
        const Align(
          alignment: Alignment.centerLeft,
          child: Text(
            'FEATURED BOTANICAL BESTSELLERS',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12,
              fontWeight: FontWeight.w800,
              color: AppColors.forestMedium,
              letterSpacing: 0.8,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: suggested.length,
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: AppBreakpoints.isDesktop(context) ? 4 : 2,
            crossAxisSpacing: AppSpacing.md,
            mainAxisSpacing: AppSpacing.md,
            childAspectRatio: 0.72,
          ),
          itemBuilder: (ctx, i) {
            return GlorovStaggeredItem(
              index: i,
              child: GlorovProductCard(product: suggested[i]),
            );
          },
        ),
      ],
    );
  }
}
