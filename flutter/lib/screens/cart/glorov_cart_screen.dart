import 'package:flutter/material.dart';
import '../../components/cart/glorov_order_summary.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../components/responsive/glorov_responsive.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_mock_data.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Full Shopping Cart Page
/// Supports desktop 2-column layout and mobile stacked layout with live item updates,
/// variant display, quantity steppers, coupons, and seamless checkout transition.
class GlorovCartScreen extends StatelessWidget {
  const GlorovCartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);

    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.surfaceCream,
      currentRoute: cartScreenRoute,
      showTopNav: false,
      showBottomNav: true,
      alwaysShowBottomNav: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Breadcrumbs & Clean Top Bar
          _buildBreadcrumbs(context),

          // Cart Content
          GlorovContainer(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.lg,
            ),
            child: ListenableBuilder(
              listenable: GlorovCartState.instance,
              builder: (context, _) {
                final items = GlorovCartState.instance.items;

                if (items.isEmpty) {
                  return _buildEmptyCart(context);
                }

                return isDesktop
                    ? _buildDesktopLayout(context, items)
                    : _buildMobileLayout(context, items);
              },
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  // -------------------------------------------------------------
  // Breadcrumbs
  // -------------------------------------------------------------
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
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                InkWell(
                  onTap: () => Navigator.pushNamed(context, homeScreenRoute),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.arrow_back_ios, size: 12, color: AppColors.forestDeep),
                      SizedBox(width: 4),
                      Text(
                        'Home',
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
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right, size: 14, color: AppColors.textMuted),
                const SizedBox(width: 8),
                const Text(
                  'Shopping Cart',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
              ],
            ),
            ListenableBuilder(
              listenable: GlorovCartState.instance,
              builder: (context, _) {
                final count = GlorovCartState.instance.itemCount;
                return Text(
                  '$count item${count == 1 ? '' : 's'}',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textMuted,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Desktop 2-Column Layout
  // -------------------------------------------------------------
  Widget _buildDesktopLayout(BuildContext context, List<GlorovCartItem> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Title Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Your Botanical Bag (${GlorovCartState.instance.itemCount} items)',
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: AppColors.forestDeep,
              ),
            ),
            TextButton.icon(
              onPressed: () => Navigator.pushNamed(
                context,
                discoverScreenRoute,
                arguments: 'All Botanical',
              ),
              icon: const Icon(Icons.arrow_back, size: 16),
              label: const Text('Continue Shopping'),
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.lg),

        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Left Column: Items List (62%)
            Expanded(
              flex: 13,
              child: Column(
                children: [
                  _buildCartItemsList(context, items),
                  const SizedBox(height: AppSpacing.lg),
                  _buildTransitGuaranteeCard(context),
                ],
              ),
            ),

            const SizedBox(width: AppSpacing.xl),

            // Right Column: Sticky Summary & Checkout (38%)
            Expanded(
              flex: 8,
              child: GlorovOrderSummary(
                onCheckoutPressed: () {
                  Navigator.pushNamed(context, checkoutScreenRoute);
                },
              ),
            ),
          ],
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Mobile Stacked Layout
  // -------------------------------------------------------------
  Widget _buildMobileLayout(BuildContext context, List<GlorovCartItem> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Your Botanical Bag (${GlorovCartState.instance.itemCount} items)',
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 20,
            fontWeight: FontWeight.w800,
            color: AppColors.forestDeep,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        _buildCartItemsList(context, items),
        const SizedBox(height: AppSpacing.lg),
        GlorovOrderSummary(
          onCheckoutPressed: () {
            Navigator.pushNamed(context, checkoutScreenRoute);
          },
        ),
        const SizedBox(height: AppSpacing.md),
        _buildTransitGuaranteeCard(context),
      ],
    );
  }

  // -------------------------------------------------------------
  // Cart Items List
  // -------------------------------------------------------------
  Widget _buildCartItemsList(BuildContext context, List<GlorovCartItem> items) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (ctx, i) =>
            const Divider(height: 1, color: AppColors.borderSubtle),
        itemBuilder: (ctx, i) {
          final item = items[i];
          return _buildCartItemTile(context, item);
        },
      ),
    );
  }

  Widget _buildCartItemTile(BuildContext context, GlorovCartItem item) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thumbnail with tap navigation to product details
          InkWell(
            onTap: () {
              Navigator.pushNamed(
                context,
                productDetailsScreenRoute,
                arguments: item.product,
              );
            },
            borderRadius: AppRadii.roundedMd,
            child: ClipRRect(
              borderRadius: AppRadii.roundedMd,
              child: Container(
                width: 80,
                height: 80,
                color: AppColors.surfaceMuted,
                child: Image.network(
                  item.product.primaryImage,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) =>
                      const Icon(Icons.yard_outlined, color: AppColors.sage),
                ),
              ),
            ),
          ),

          const SizedBox(width: AppSpacing.md),

          // Details & Price
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Title
                InkWell(
                  onTap: () {
                    Navigator.pushNamed(
                      context,
                      productDetailsScreenRoute,
                      arguments: item.product,
                    );
                  },
                  child: Text(
                    item.product.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDeep,
                    ),
                  ),
                ),

                const SizedBox(height: 2),

                // Botanical Latin Name
                Text(
                  item.product.botanicalName,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontStyle: FontStyle.italic,
                    color: AppColors.forestMedium,
                  ),
                ),

                const SizedBox(height: 4),

                // Variant Badge (if applicable)
                if (item.variant != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.mintSurface,
                      borderRadius: AppRadii.roundedSm,
                      border: Border.all(
                        color: AppColors.sage.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Text(
                      item.variant!.name,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ),

                const SizedBox(height: 6),

                // Unit Price & Line Total Row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '₹${item.unitPrice.toStringAsFixed(0)} each',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                    GlorovCounter(
                      value: item.totalPrice,
                      prefix: '₹',
                      mode: CounterAnimationMode.count,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.sm),

                // Quantity Controls & Action Buttons Row
                Row(
                  children: [
                    // Quantity Stepper Box with TapFeedback
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: AppRadii.roundedSm,
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          TapFeedback(
                            onTap: () {
                              if (item.quantity > 1) {
                                GlorovCartState.instance.updateQuantity(
                                  item.itemKey,
                                  item.quantity - 1,
                                );
                              } else {
                                _confirmRemoveItem(context, item);
                              }
                            },
                            effect: TapAnimationType.scale,
                            scaleDown: 0.90,
                            child: const Padding(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              child: Icon(Icons.remove, size: 14),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              '${item.quantity}',
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.forestDeep,
                              ),
                            ),
                          ),
                          TapFeedback(
                            onTap: item.quantity < 10
                                ? () {
                                    GlorovCartState.instance.updateQuantity(
                                      item.itemKey,
                                      item.quantity + 1,
                                    );
                                  }
                                : null,
                            effect: TapAnimationType.scale,
                            scaleDown: 0.90,
                            child: const Padding(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              child: Icon(Icons.add, size: 14),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(width: AppSpacing.md),

                    // Move to Wishlist action with bounce feedback
                    TapFeedback(
                      onTap: () {
                        GlorovCartState.instance.moveToWishlist(item.itemKey);
                        GlorovFeedback.showSuccessToast(
                          context,
                          message:
                              'Moved "${item.product.title}" to your Wishlist',
                          actionLabel: 'VIEW',
                          onAction: () =>
                              Navigator.pushNamed(context, bookmarkScreenRoute),
                        );
                      },
                      effect: TapAnimationType.bounce,
                      duration: GlorovInteractionConfig.durationFast,
                      child: const Padding(
                        padding: EdgeInsets.symmetric(
                          vertical: 4,
                          horizontal: 2,
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.favorite_border,
                              size: 14,
                              color: AppColors.textMuted,
                            ),
                            SizedBox(width: 4),
                            Text(
                              'Save for later',
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const Spacer(),

                    // Remove icon with TapFeedback
                    TapFeedback(
                      onTap: () => _confirmRemoveItem(context, item),
                      effect: TapAnimationType.scale,
                      scaleDown: 0.90,
                      child: const Padding(
                        padding: EdgeInsets.all(6.0),
                        child: Icon(
                          Icons.delete_outline,
                          size: 18,
                          color: AppColors.textMuted,
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
    );
  }

  void _confirmRemoveItem(BuildContext context, GlorovCartItem item) {
    GlorovCartState.instance.removeFromCart(item.itemKey);
    GlorovFeedback.showInfoToast(
      context,
      message: 'Removed "${item.product.title}" from bag',
      actionLabel: 'UNDO',
      onAction: () {
        GlorovCartState.instance.addToCart(
          item.product,
          quantity: item.quantity,
          variant: item.variant,
        );
      },
    );
  }

  Widget _buildTransitGuaranteeCard(BuildContext context) {
    return InkWell(
      onTap: () =>
          Navigator.pushNamed(context, shippingAndTrustPolicyScreenRoute),
      borderRadius: AppRadii.roundedLg,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.mintSurface,
          borderRadius: AppRadii.roundedLg,
          border: Border.all(color: AppColors.sage.withValues(alpha: 0.4)),
        ),
        child: const Row(
          children: [
            Icon(Icons.shield_outlined, color: AppColors.forestDeep, size: 22),
            SizedBox(width: AppSpacing.sm),
            Expanded(
              child: Text(
                '100% Safe Transit Guarantee: Custom ventilated, shockproof packaging. Plants arrive fresh and hydrated or we replace them immediately for free.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12,
                  color: AppColors.forestDeep,
                  height: 1.4,
                ),
              ),
            ),
            SizedBox(width: 6),
            Icon(Icons.chevron_right, size: 16, color: AppColors.forestDeep),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Empty Cart State
  // -------------------------------------------------------------
  Widget _buildEmptyCart(BuildContext context) {
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
              Icons.shopping_bag_outlined,
              size: 44,
              color: AppColors.forestDeep,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        const Text(
          'Your Botanical Bag is Empty',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: AppColors.forestDeep,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        const Text(
          'Explore our heirloom seeds, rare houseplants, and artisanal planters to bring nature home.',
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
          leadingIcon: const Icon(Icons.spa_outlined, size: 18),
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
            'POPULAR BOTANICAL PICKS FOR YOU',
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
            return GlorovProductCard(product: suggested[i]);
          },
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Mobile Sticky Bottom Dock
  // -------------------------------------------------------------
  Widget _buildMobileStickyDock(BuildContext context) {
    return ListenableBuilder(
      listenable: GlorovCartState.instance,
      builder: (context, _) {
        final state = GlorovCartState.instance;
        if (state.items.isEmpty) return const SizedBox.shrink();

        return Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: const BoxDecoration(
            color: AppColors.surfacePure,
            border: Border(
              top: BorderSide(color: AppColors.borderSubtle, width: 1),
            ),
            boxShadow: AppShadows.card,
          ),
          child: SafeArea(
            top: false,
            child: Row(
              children: [
                Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total Payable',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                    Text(
                      '₹${state.total.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.pushNamed(context, checkoutScreenRoute);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forestDeep,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: const RoundedRectangleBorder(
                        borderRadius: AppRadii.roundedMd,
                      ),
                    ),
                    child: const Text(
                      'PROCEED TO CHECKOUT',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
