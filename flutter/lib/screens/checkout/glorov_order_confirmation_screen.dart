import 'package:flutter/material.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/responsive/glorov_responsive.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_order.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Order Confirmation & Success Screen
/// Replaces upstream thanks_order screen with a rich receipt, itemized list,
/// address verification, delivery timeframe, and transit reassurance.
class GlorovOrderConfirmationScreen extends StatelessWidget {
  final GlorovOrder? order;

  const GlorovOrderConfirmationScreen({
    super.key,
    this.order,
  });

  @override
  Widget build(BuildContext context) {
    // Resolve order from passed instance or fallback to latest order
    final resolvedOrder = order ??
        (GlorovCartState.instance.orders.isNotEmpty
            ? GlorovCartState.instance.orders.first
            : null);

    if (resolvedOrder == null) {
      return GlorovStorefrontScaffold(
        backgroundColor: AppColors.surfaceCream,
        currentRoute: homeScreenRoute,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 80),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.receipt_long_outlined,
                  size: 64,
                  color: AppColors.textMuted,
                ),
                const SizedBox(height: 16),
                const Text(
                  'No recent orders found',
                  style: TextStyle(
                    fontFamily: AppTypography.displayFont,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDark,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Explore our authentic botanical collection to place an order.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.pushReplacementNamed(
                    context,
                    discoverScreenRoute,
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDeep,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 28,
                      vertical: 14,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadii.roundedMd,
                    ),
                  ),
                  child: const Text('EXPLORE CATALOG'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.surfaceCream,
      currentRoute: homeScreenRoute,
      child: Column(
        children: [
          GlorovContainer(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.xl,
            ),
            child: _buildConfirmationContent(context, resolvedOrder),
          ),
          const SizedBox(height: AppSpacing.xxl),
          const GlorovFooter(),
        ],
      ),
    );
  }

  Widget _buildConfirmationContent(BuildContext context, GlorovOrder order) {
    return Column(
      children: [
        // Success Celebration Badge with Animated Draw Check & Particle Burst
        SuccessBurst(
          colors: GlorovFeedback.botanicalBurstColors,
          child: Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.mintBadge,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.sage, width: 2),
              boxShadow: AppShadows.card,
            ),
            child: const Center(
              child: GlorovAnimatedCheck(
                autoPlay: true,
                size: 44,
                color: AppColors.forestDeep,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Headline
        const Text(
          'Order Successfully Placed!',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 26,
            fontWeight: FontWeight.w900,
            color: AppColors.forestDeep,
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        const Text(
          'Thank you for growing with GLOROV. Your botanical seeds & plants are being prepared in our climate-controlled nursery.',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        // Main Receipt Box
        Container(
          constraints: const BoxConstraints(maxWidth: 720),
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.card,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Order Metadata Header
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: const BoxDecoration(
                  color: AppColors.surfaceMuted,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(AppRadii.lg),
                    topRight: Radius.circular(AppRadii.lg),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'ORDER REFERENCE',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppColors.forestMedium,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          order.id,
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.forestDeep,
                          ),
                        ),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'PLACED ON',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textMuted,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          order.formattedDate,
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Items List
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'PURCHASED BOTANICAL ITEMS (${order.totalItemCount})',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: AppColors.forestDeep,
                        letterSpacing: 0.8,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ListView.separated(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: order.items.length,
                      separatorBuilder: (ctx, i) => const Divider(
                          height: 1, color: AppColors.borderSubtle),
                      itemBuilder: (ctx, i) {
                        final item = order.items[i];
                        return Padding(
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          child: Row(
                            children: [
                              ClipRRect(
                                borderRadius: AppRadii.roundedSm,
                                child: Image.network(
                                  item.imageUrl,
                                  width: 44,
                                  height: 44,
                                  fit: BoxFit.cover,
                                  errorBuilder: (ctx, err, stack) => const Icon(
                                      Icons.yard,
                                      color: AppColors.sage),
                                ),
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.title,
                                      style: const TextStyle(
                                        fontFamily: AppTypography.primaryFont,
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.textPrimary,
                                      ),
                                    ),
                                    Text(
                                      '${item.variantName != null ? "${item.variantName}  •  " : ""}Qty: ${item.quantity}',
                                      style: const TextStyle(
                                        fontFamily: AppTypography.primaryFont,
                                        fontSize: 11,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Text(
                                '₹${item.lineTotal.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.forestDeep,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, color: AppColors.borderSubtle),

              // Delivery & Payment Details Row
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Address
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'DELIVERY ADDRESS',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppColors.forestMedium,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            order.address.fullName,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            order.address.formattedAddress,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            'Phone: +91 ${order.address.phoneNumber}',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    // Payment & Delivery Speed
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'PAYMENT & DELIVERY',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: AppColors.forestMedium,
                              letterSpacing: 0.8,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            order.paymentMethod.title,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            order.deliveryOption.title,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          Text(
                            'Est: ${order.deliveryOption.estimatedDays}',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              color: AppColors.sage,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Divider(height: 1, color: AppColors.borderSubtle),

              // Final Totals Table
              Padding(
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  children: [
                    _buildSummaryLine(
                        'Subtotal', '₹${order.subtotal.toStringAsFixed(0)}'),
                    const SizedBox(height: 4),
                    _buildSummaryLine(
                      'Delivery & Packing',
                      order.shippingCost == 0
                          ? 'FREE'
                          : '₹${order.shippingCost.toStringAsFixed(0)}',
                      isHighlight: order.shippingCost == 0,
                    ),
                    if (order.discountAmount > 0) ...[
                      const SizedBox(height: 4),
                      _buildSummaryLine(
                        'Coupon Discount (${order.appliedCoupon ?? "PROMO"})',
                        '-₹${order.discountAmount.toStringAsFixed(0)}',
                        isHighlight: true,
                        highlightColor: AppColors.terracotta,
                      ),
                    ],
                    const SizedBox(height: AppSpacing.sm),
                    const Divider(height: 1, color: AppColors.borderSubtle),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Total Paid / Payable',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: AppColors.forestDeep,
                          ),
                        ),
                        GlorovCounter(
                          value: order.totalAmount,
                          prefix: '₹',
                          mode: CounterAnimationMode.count,
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: AppColors.forestDeep,
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

        const SizedBox(height: AppSpacing.xl),

        // Action Buttons Row with Tactile Feedback
        Wrap(
          spacing: AppSpacing.md,
          runSpacing: AppSpacing.sm,
          alignment: WrapAlignment.center,
          children: [
            GlorovButton.primary(
              label: 'VIEW ORDER HISTORY & TRACKING',
              leadingIcon: const Icon(Icons.local_shipping_outlined, size: 18),
              onPressed: () => Navigator.pushNamed(context, ordersScreenRoute),
            ),
            GlorovButton.outlined(
              label: 'CONTINUE SHOPPING',
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.popUntil(context, (route) => route.isFirst);
                } else {
                  Navigator.pushReplacementNamed(context, homeScreenRoute);
                }
              },
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSummaryLine(
    String label,
    String value, {
    bool isHighlight = false,
    Color? highlightColor,
  }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 12,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 12,
            fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
            color: highlightColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
