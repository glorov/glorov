import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/interactions/interaction_feedback.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_offer.dart';
import '../../repositories/glorov_repositories.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Dynamic Offer Section & Welcome Banner
/// Directly controlled by Medusa Admin Dashboard (/admin/offers).
/// Features real-time API sync, click-to-copy micro-interaction,
/// and cart promo auto-apply coordination.
class GlorovOfferBanner extends StatefulWidget {
  final GlorovOffer? initialOffer;
  final VoidCallback? onOfferApplied;

  const GlorovOfferBanner({
    super.key,
    this.initialOffer,
    this.onOfferApplied,
  });

  @override
  State<GlorovOfferBanner> createState() => _GlorovOfferBannerState();
}

class _GlorovOfferBannerState extends State<GlorovOfferBanner>
    with WidgetsBindingObserver {
  GlorovOffer? _offer;
  bool _isLoading = true;
  bool _isCopied = false;
  bool _isHovered = false;
  Timer? _copiedTimer;

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _copiedTimer?.cancel();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.initialOffer != null) {
      _offer = widget.initialOffer;
      _isLoading = false;
    } else {
      _loadOffer();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted && widget.initialOffer == null) {
      _loadOffer();
    }
  }

  Future<void> _loadOffer() async {
    try {
      final offer = await GlorovRepositories.offers.fetchHighlightedOffer();
      if (mounted) {
        setState(() {
          _offer = offer;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _offer = null;
          _isLoading = false;
        });
      }
    }
  }

  Widget _buildSkeleton(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 768;
    return Container(
      width: double.infinity,
      height: isDesktop ? 68.0 : 86.0,
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(12),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: const Color(0xFFE5E7EB),
              borderRadius: BorderRadius.circular(16),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 12,
                  width: 140,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE5E7EB),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 6),
                Container(
                  height: 10,
                  width: 220,
                  decoration: BoxDecoration(
                    color: const Color(0xFFE5E7EB),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _copyCouponCode(String code) async {
    if (code.isEmpty) return;

    await Clipboard.setData(ClipboardData(text: code));
    HapticFeedback.lightImpact();

    if (!mounted) return;

    setState(() {
      _isCopied = true;
    });

    // Provide friendly feedback
    GlorovFeedback.showSuccessToast(
      context,
      message: 'Coupon code $code copied to clipboard!',
    );

    // If cart has items and coupon is not yet applied, offer auto-apply
    final cartState = GlorovCartState.instance;
    if (cartState.itemCount > 0 && cartState.appliedPromoCode != code) {
      cartState.applyCoupon(code);
    }

    widget.onOfferApplied?.call();

    // Reset copied state after 2.5s
    _copiedTimer?.cancel();
    _copiedTimer = Timer(const Duration(milliseconds: 2500), () {
      if (mounted) {
        setState(() {
          _isCopied = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return _buildSkeleton(context);
    }

    final offer = _offer;
    if (offer == null || !offer.isActive) {
      return const SizedBox.shrink();
    }

    return _buildCard(offer);
  }

  Widget _buildCard(GlorovOffer offer) {
    final bgColor = offer.backgroundColorValue;
    final accentColor = offer.accentColorValue;
    final textColor = offer.textColorValue;
    final isDesktop = MediaQuery.of(context).size.width >= 768;

    return Semantics(
      label: '${offer.tag}: ${offer.description}. Tap to copy code ${offer.code}.',
      button: true,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: double.infinity,
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? AppSpacing.xl : 10.0,
            vertical: isDesktop ? AppSpacing.lg : 7.0,
          ),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: isDesktop ? AppRadii.roundedLg : BorderRadius.circular(10),
            border: Border.all(
              color: _isHovered
                  ? accentColor.withValues(alpha: 0.5)
                  : accentColor.withValues(alpha: 0.25),
              width: _isHovered ? 1.5 : 1.0,
            ),
            boxShadow: _isHovered
                ? [
                    BoxShadow(
                      color: accentColor.withValues(alpha: 0.08),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ]
                : [],
          ),
          child: isDesktop
              ? _buildDesktopLayout(offer, accentColor, textColor)
              : _buildMobileLayout(offer, accentColor, textColor),
        ),
      ),
    );
  }

  /// Desktop Layout (Horizontal alignment with right coupon action)
  Widget _buildDesktopLayout(
    GlorovOffer offer,
    Color accentColor,
    Color textColor,
  ) {
    return Row(
      children: [
        // Circular Icon (Matches exact user image)
        Container(
          width: 44,
          height: 44,
          padding: const EdgeInsets.all(AppSpacing.sm),
          decoration: BoxDecoration(
            color: accentColor,
            shape: BoxShape.circle,
          ),
          child: Icon(
            offer.iconData,
            color: Colors.white,
            size: 22,
          ),
        ),
        const SizedBox(width: AppSpacing.lg),

        // Text Info (Eyebrow & Headline)
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                offer.tag,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.6,
                  color: accentColor,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                offer.description,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: AppSpacing.lg),

        // Interactive Coupon Pill
        _buildCouponPill(offer, accentColor),
      ],
    );
  }

  /// Mobile Layout (Compact, sleek single horizontal row)
  Widget _buildMobileLayout(
    GlorovOffer offer,
    Color accentColor,
    Color textColor,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Compact Circular Icon
        Container(
          width: 30,
          height: 30,
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: accentColor,
            shape: BoxShape.circle,
          ),
          child: Icon(
            offer.iconData,
            color: Colors.white,
            size: 16,
          ),
        ),
        const SizedBox(width: 8),

        // Concise Text Info (Eyebrow & Headline)
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                offer.tag,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 9.5,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                  color: accentColor,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                offer.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: textColor,
                  height: 1.25,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 8),

        // Compact Interactive Coupon Pill
        _buildCouponPill(offer, accentColor, isCompact: true),
      ],
    );
  }

  /// Interactive Coupon Pill with One-Tap Copy
  Widget _buildCouponPill(GlorovOffer offer, Color accentColor,
      {bool isCompact = false}) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _copyCouponCode(offer.code),
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: EdgeInsets.symmetric(
            horizontal: isCompact ? 8.0 : AppSpacing.md,
            vertical: isCompact ? 4.0 : AppSpacing.sm - 2,
          ),
          decoration: BoxDecoration(
            color: _isCopied
                ? accentColor.withValues(alpha: 0.15)
                : Colors.white.withValues(alpha: 0.9),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _isCopied
                  ? accentColor
                  : accentColor.withValues(alpha: 0.3),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                offer.code,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: isCompact ? 11.0 : 12.0,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.8,
                  color: accentColor,
                ),
              ),
              SizedBox(width: isCompact ? 4.0 : AppSpacing.sm),
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 200),
                child: _isCopied
                    ? Row(
                        key: const ValueKey('copied'),
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle,
                              size: isCompact ? 13 : 14, color: accentColor),
                          const SizedBox(width: 3),
                          Text(
                            'COPIED',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: isCompact ? 9.0 : 10.0,
                              fontWeight: FontWeight.w700,
                              color: accentColor,
                            ),
                          ),
                        ],
                      )
                    : Row(
                        key: const ValueKey('copy'),
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.copy,
                            size: isCompact ? 12 : 13,
                            color: accentColor,
                          ),
                          const SizedBox(width: 3),
                          Text(
                            'COPY',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: isCompact ? 9.0 : 10.0,
                              fontWeight: FontWeight.w700,
                              color: accentColor,
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
