import 'package:flutter/material.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../services/glorov_cart_state.dart';

/// Reusable GLOROV Order Summary & Coupon Card
/// Computes item subtotal, shipping transit costs, promo discounts, and final payable amount.
class GlorovOrderSummary extends StatefulWidget {
  final VoidCallback? onCheckoutPressed;
  final String checkoutButtonText;
  final bool isCheckoutScreen;

  const GlorovOrderSummary({
    super.key,
    this.onCheckoutPressed,
    this.checkoutButtonText = 'PROCEED TO CHECKOUT',
    this.isCheckoutScreen = false,
  });

  @override
  State<GlorovOrderSummary> createState() => _GlorovOrderSummaryState();
}

class _GlorovOrderSummaryState extends State<GlorovOrderSummary> {
  final TextEditingController _couponController = TextEditingController();
  String? _couponFeedbackMessage;
  bool _isCouponSuccess = false;

  @override
  void dispose() {
    _couponController.dispose();
    super.dispose();
  }

  void _handleApplyCoupon() {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;

    final (success, message) = GlorovCartState.instance.applyCoupon(code);
    setState(() {
      _isCouponSuccess = success;
      _couponFeedbackMessage = message;
      if (success) {
        _couponController.clear();
      }
    });
  }

  void _handleRemoveCoupon() {
    GlorovCartState.instance.removeCoupon();
    setState(() {
      _couponFeedbackMessage = 'Coupon removed.';
      _isCouponSuccess = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GlorovCartState.instance,
      builder: (context, _) {
        final state = GlorovCartState.instance;
        final subtotal = state.subtotal;
        final shipping = state.shippingCost;
        final discount = state.promoDiscountAmount;
        final total = state.total;
        final appliedCoupon = state.appliedPromoCode;

        final amountNeededForFreeShipping =
            GlorovCartState.freeShippingThreshold - subtotal;
        final isFreeShipping = state.isFreeShippingEligible;

        return Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.card,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header
              const Text(
                'ORDER SUMMARY',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: AppColors.forestDeep,
                  letterSpacing: 0.8,
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              // Free Shipping Progress Indicator (if not on checkout page)
              if (!widget.isCheckoutScreen) ...[
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: isFreeShipping
                        ? AppColors.mintSurface
                        : AppColors.surfaceMuted,
                    borderRadius: AppRadii.roundedMd,
                    border: Border.all(
                      color: isFreeShipping
                          ? AppColors.sage.withValues(alpha: 0.5)
                          : AppColors.borderSubtle,
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            isFreeShipping
                                ? Icons.verified_rounded
                                : Icons.local_shipping_outlined,
                            size: 16,
                            color: isFreeShipping
                                ? AppColors.forestDeep
                                : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              isFreeShipping
                                  ? 'You have unlocked FREE Eco Transit!'
                                  : 'Add ₹${amountNeededForFreeShipping.toStringAsFixed(0)} more for FREE Transit!',
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: isFreeShipping
                                    ? AppColors.forestDeep
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: AppRadii.roundedFull,
                        child: LinearProgressIndicator(
                          value:
                              (subtotal / GlorovCartState.freeShippingThreshold)
                                  .clamp(0.0, 1.0),
                          backgroundColor: Colors.black12,
                          color: isFreeShipping
                              ? AppColors.sage
                              : AppColors.forestMedium,
                          minHeight: 5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
              ],

              // Price Breakdown Rows
              _buildSummaryRow(
                'Subtotal (${state.itemCount} items)',
                '₹${subtotal.toStringAsFixed(0)}',
              ),
              const SizedBox(height: AppSpacing.xs),

              _buildSummaryRow(
                'Transit & Packing',
                shipping == 0.0 ? 'FREE' : '₹${shipping.toStringAsFixed(0)}',
                isHighlight: shipping == 0.0,
                highlightColor: AppColors.forestDeep,
              ),

              if (discount > 0) ...[
                const SizedBox(height: AppSpacing.xs),
                _buildSummaryRow(
                  'Promo Discount ($appliedCoupon)',
                  '-₹${discount.toStringAsFixed(0)}',
                  isHighlight: true,
                  highlightColor: AppColors.terracotta,
                ),
              ],

              const SizedBox(height: AppSpacing.md),
              const Divider(height: 1, color: AppColors.borderSubtle),
              const SizedBox(height: AppSpacing.md),

              // Total Payable
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total Payable',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                      color: AppColors.forestDeep,
                    ),
                  ),
                  GlorovCounter(
                    value: total,
                    prefix: '₹',
                    mode: CounterAnimationMode.count,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppColors.forestDeep,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 2),
              const Text(
                'Inclusive of GST and botanical packaging insurance.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 11,
                  color: AppColors.textMuted,
                ),
              ),

              const SizedBox(height: AppSpacing.lg),

              // Coupon Input Section
              if (appliedCoupon == null) ...[
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 40,
                        child: InputFocus(
                          borderRadius: AppRadii.roundedMd,
                          scale: GlorovInteractionConfig.focusScale,
                          elevation: GlorovInteractionConfig.focusElevation,
                          shadowColor:
                              AppColors.forestDeep.withValues(alpha: 0.12),
                          duration: GlorovInteractionConfig.durationFast,
                          child: TextField(
                            controller: _couponController,
                            textCapitalization: TextCapitalization.characters,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                            ),
                            decoration: const InputDecoration(
                              hintText: 'Coupon (e.g. GLOROV10)',
                              hintStyle: TextStyle(
                                fontSize: 12,
                                color: AppColors.textMuted,
                              ),
                              filled: true,
                              fillColor: AppColors.surfaceMuted,
                              contentPadding: EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 8,
                              ),
                              border: OutlineInputBorder(
                                borderRadius: AppRadii.roundedMd,
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    GlorovButton.primary(
                      size: GlorovButtonSize.small,
                      label: 'APPLY',
                      onPressed: _handleApplyCoupon,
                    ),
                  ],
                ),
              ] else ...[
                // Applied Coupon Pill
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.mintBadge,
                    borderRadius: AppRadii.roundedMd,
                    border: Border.all(color: AppColors.sage),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(
                            Icons.discount_outlined,
                            size: 16,
                            color: AppColors.forestDeep,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            appliedCoupon,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.forestDeep,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      InkWell(
                        onTap: _handleRemoveCoupon,
                        child: const Text(
                          'Remove',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.terracotta,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // Coupon feedback message
              if (_couponFeedbackMessage != null) ...[
                const SizedBox(height: 6),
                Text(
                  _couponFeedbackMessage!,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: _isCouponSuccess
                        ? AppColors.forestDeep
                        : AppColors.terracotta,
                  ),
                ),
              ],

              const SizedBox(height: AppSpacing.lg),

              // Action Button
              if (widget.onCheckoutPressed != null)
                GlorovButton.primary(
                  isFullWidth: true,
                  size: GlorovButtonSize.large,
                  label: widget.checkoutButtonText,
                  onPressed: subtotal > 0 ? widget.onCheckoutPressed : null,
                ),

              const SizedBox(height: AppSpacing.md),

              // Trust Badges Footer
              const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.security_outlined,
                    size: 14,
                    color: AppColors.textMuted,
                  ),
                  SizedBox(width: 4),
                  Text(
                    'Simulated Demonstration Checkout',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryRow(
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
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: isHighlight ? FontWeight.w800 : FontWeight.w600,
            color: highlightColor ?? AppColors.textPrimary,
          ),
        ),
      ],
    );
  }
}
