import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_product.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';

/// Reusable GLOROV Botanical Product Card
/// Premium e-commerce card with editorial serif typography, image overlays,
/// sale badging, rating chips, and tactile micro-interactions (press scale,
/// botanical hover glow, animated wishlist heart, image zoom, and keyboard focus).
class GlorovProductCard extends StatefulWidget {
  final GlorovProduct product;
  final VoidCallback? onTap;
  final bool showWishlistButton;
  final bool forceCircularAction;

  const GlorovProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.showWishlistButton = false,
    this.forceCircularAction = false,
  });

  @override
  State<GlorovProductCard> createState() => _GlorovProductCardState();
}

class _GlorovProductCardState extends State<GlorovProductCard> {
  bool _isHovered = false;
  bool _isFocused = false;

  void _navigateToProduct() {
    if (widget.onTap != null) {
      widget.onTap!();
    } else {
      Navigator.pushNamed(
        context,
        productDetailsScreenRoute,
        arguments: widget.product,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final product = widget.product;
    final mediaWidth = MediaQuery.maybeOf(context)?.size.width ?? 1200.0;
    final isMobileDevice = mediaWidth <= AppBreakpoints.mobileMax;
    final isDesktopDevice = mediaWidth >= AppBreakpoints.desktopMin;
    final isTabletDevice = !isMobileDevice && !isDesktopDevice;

    // Responsive Card Border Radius:
    // Mobile: 12.0 (smaller border radius matching Image 1)
    // Tablet: 16.0 (medium border radius matching Image 2)
    // Desktop: 20.0 (prominent larger border radius matching Image 3)
    final double cardRadius = isDesktopDevice
        ? 20.0
        : (isTabletDevice ? 16.0 : 12.0);

    Widget cardBody = AnimatedContainer(
      duration: const Duration(milliseconds: 180),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(cardRadius),
        border: Border.all(
          color: _isFocused
              ? AppColors.forestDeep
              : (_isHovered
                  ? AppColors.forestDeep.withValues(alpha: 0.35)
                  : const Color(0xFFE5E7EB)),
          width: _isFocused ? 2.0 : 1.0,
        ),
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: AppColors.forestDeep.withValues(alpha: 0.25),
                  blurRadius: 8,
                  spreadRadius: 2,
                ),
              ]
            : (_isHovered
                ? [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ]
                : AppShadows.card),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Media Area with Overlays (Aspect Ratio ~1.05 for balanced product imagery)
          AspectRatio(
            aspectRatio: 1.05,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Product Image with subtle botanical hover zoom
                ClipRRect(
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(cardRadius),
                  ),
                  child: AnimatedScale(
                    scale: _isHovered ? 1.04 : 1.0,
                    duration: const Duration(milliseconds: 250),
                    curve: Curves.easeOutCubic,
                    child: product.primaryImage.startsWith('assets/')
                        ? Image.asset(
                            product.primaryImage,
                            fit: BoxFit.cover,
                            cacheWidth: 600,
                            filterQuality: FilterQuality.medium,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: AppColors.mintSurface,
                                child: const Center(
                                  child: Icon(
                                    Icons.yard_outlined,
                                    size: 44,
                                    color: AppColors.sage,
                                  ),
                                ),
                              );
                            },
                          )
                        : Image.network(
                            product.primaryImage,
                            fit: BoxFit.cover,
                            cacheWidth: 600,
                            filterQuality: FilterQuality.medium,
                            loadingBuilder: (context, child, progress) {
                              if (progress == null) return child;
                              return Container(
                                color: AppColors.mintSurface,
                                child: const Center(
                                  child: Icon(
                                    Icons.yard_outlined,
                                    size: 32,
                                    color: AppColors.sage,
                                  ),
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                color: AppColors.mintSurface,
                                child: const Center(
                                  child: Icon(
                                    Icons.yard_outlined,
                                    size: 44,
                                    color: AppColors.sage,
                                  ),
                                ),
                              );
                            },
                          ),
                  ),
                ),

                // Top-Left Promotional / Custom Badge: Themed compact dark blue tag with bolt icon
                if (product.badges.isNotEmpty &&
                    product.badges.first.trim().isNotEmpty)
                  Positioned(
                    top: 0,
                    left: 0,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 3.5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.tagDarkBlue, // Theme dark blue #0c2340
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(cardRadius),
                          topRight: const Radius.circular(8),
                          bottomRight: const Radius.circular(8),
                          bottomLeft: Radius.zero,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.bolt,
                            size: 11,
                            color: Color(0xFFF9C74F), // Bright yellow/gold bolt
                          ),
                          const SizedBox(width: 3),
                          Text(
                            product.badges.first.trim().toUpperCase(),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 9.5,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Top-Right Wishlist Heart Toggle (ONLY shown if showWishlistButton is enabled)
                if (widget.showWishlistButton)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: ListenableBuilder(
                      listenable: GlorovCartState.instance,
                      builder: (context, _) {
                        final isSaved =
                            GlorovCartState.instance.isInWishlist(product.id);

                        return TapFeedback(
                          onTap: () {
                            GlorovCartState.instance.toggleWishlist(product.id);
                            if (isSaved) {
                              GlorovFeedback.showInfoToast(
                                context,
                                message: 'Removed from wishlist',
                              );
                            } else {
                              GlorovFeedback.showSuccessToast(
                                context,
                                message: 'Saved "${product.title}" to wishlist!',
                              );
                            }
                          },
                          effect: TapAnimationType.bounce,
                          scaleUp: 1.25,
                          semanticLabel: isSaved
                              ? 'Remove ${product.title} from wishlist'
                              : 'Add ${product.title} to wishlist',
                          child: Material(
                            color: Colors.white.withValues(alpha: 0.94),
                            shape: const CircleBorder(),
                            elevation: 1.5,
                            child: Padding(
                              padding: const EdgeInsets.all(6.0),
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 200),
                                transitionBuilder: (child, anim) =>
                                    ScaleTransition(scale: anim, child: child),
                                child: Icon(
                                  isSaved
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                  key: ValueKey<bool>(isSaved),
                                  size: 17,
                                  color: isSaved
                                      ? const Color(0xFF85102F)
                                      : const Color(0xFF4B5563),
                                ),
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                // Bottom-Left Rating Pill (Translucent Frosted Glass matching Reference Images 3 & 4)
                Positioned(
                  left: 6,
                  bottom: 6,
                  child: RepaintBoundary(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(5),
                      child: BackdropFilter(
                        filter: ui.ImageFilter.blur(sigmaX: 6, sigmaY: 6),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2.5,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.85),
                            borderRadius: BorderRadius.circular(5),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.90),
                              width: 0.8,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.08),
                                blurRadius: 4,
                                offset: const Offset(0, 1),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              Text(
                                product.rating.toStringAsFixed(1),
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0F172A),
                                  height: 1.0,
                                ),
                              ),
                              const SizedBox(width: 3),
                              const Icon(
                                Icons.star_rounded,
                                size: 13,
                                color: Color(0xFF16A34A), // Rich green star
                              ),
                              const Padding(
                                padding: EdgeInsets.symmetric(horizontal: 3),
                                child: Text(
                                  '|',
                                  style: TextStyle(
                                    fontSize: 10,
                                    color: Color(0xFFCBD5E1),
                                    height: 1.0,
                                  ),
                                ),
                              ),
                              Text(
                                '${product.reviewCount}',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: Color(0xFF475569),
                                  height: 1.0,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Card Body: Title, Prices & Green Action Button
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 230 || widget.forceCircularAction || isMobileDevice;
                final isTabletCard = !isCompact && (isTabletDevice || constraints.maxWidth < 275);
                final isDesktopCard = !isCompact && !isTabletCard;

                // Responsive Title Font Size:
                // Mobile: 13.5 (small font size matching Image 1)
                // Tablet: 16.5 (medium font size matching Image 2)
                // Desktop: 18.5 (large prominent font size matching Image 3)
                final double titleFontSize = isCompact
                    ? 13.5
                    : (isTabletCard ? 16.5 : 18.5);

                final double priceFontSize = isCompact
                    ? 15.5
                    : (isTabletCard ? 17.5 : 19.5);

                final double originalPriceFontSize = isCompact
                    ? 11.0
                    : (isTabletCard ? 12.5 : 13.5);

                final double subtitleFontSize = isDesktopCard ? 12.5 : 11.5;

                final availableHeight = constraints.maxHeight;
                final showSubtitle = !isCompact &&
                    availableHeight >= 135 &&
                    product.shortDescription.isNotEmpty;

                final bodyPadding = isCompact
                    ? const EdgeInsets.fromLTRB(9, 6, 9, 8)
                    : (isTabletCard
                        ? const EdgeInsets.fromLTRB(12, 6, 12, 8)
                        : const EdgeInsets.fromLTRB(12, 8, 12, 8));

                return Padding(
                  padding: bodyPadding,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Product Title & Subtitle (Display Serif matching Reference Images 1, 3, & 4)
                      Flexible(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              product.title,
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: AppTypography.displayFont,
                                fontSize: titleFontSize,
                                fontWeight: FontWeight.w700,
                                color: const Color(0xFF0F2F24),
                                height: 1.22,
                                letterSpacing: -0.2,
                              ),
                            ),
                            if (showSubtitle) ...[
                              const SizedBox(height: 2),
                              Text(
                                product.shortDescription,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: subtitleFontSize,
                                  fontWeight: FontWeight.w400,
                                  color: const Color(0xFF6B7280),
                                  height: 1.2,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),

                      // Bottom Row: Price on Left, Green Button on Right
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Pricing Section
                          Expanded(
                            child: Wrap(
                              crossAxisAlignment: WrapCrossAlignment.center,
                              alignment: WrapAlignment.start,
                              spacing: 5,
                              runSpacing: 2,
                              children: [
                                Text(
                                  '₹${product.effectivePrice.toStringAsFixed(0)}',
                                  style: TextStyle(
                                    fontFamily: AppTypography.displayFont,
                                    fontSize: priceFontSize,
                                    fontWeight: FontWeight.w800,
                                    color: const Color(0xFF111827),
                                    height: 1.0,
                                  ),
                                ),
                                if (product.hasDiscount)
                                  Text(
                                    '₹${product.price.toStringAsFixed(0)}',
                                    style: TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontSize: originalPriceFontSize,
                                      color: const Color(0xFF94A3B8),
                                      decoration: TextDecoration.lineThrough,
                                      fontWeight: FontWeight.w500,
                                      height: 1.0,
                                    ),
                                  ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 6),

                          // Green Action Button (Circular Bag or Pill Add to Cart)
                          _buildGreenActionButton(context, isCompact, isDesktopDevice),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );

    // Apply Botanical Hover Glow
    if (GlorovInteractionConfig.enabled) {
      cardBody = HoverGlow(
        glowColor: AppColors.sage,
        glowRadius: 10.0,
        spreadRadius: 2.0,
        glowOpacity: 0.22,
        borderRadius: BorderRadius.circular(14),
        child: cardBody,
      );
    }

    // Apply Tactile Press Scale to card
    cardBody = TapFeedback(
      onTap: _navigateToProduct,
      effect: TapAnimationType.scale,
      scaleDown: GlorovInteractionConfig.cardPressScale,
      duration: GlorovInteractionConfig.durationFast,
      semanticLabel: 'View details for ${product.title}',
      child: cardBody,
    );

    // Keyboard focus & mouse region wrapper with RepaintBoundary for isolated rendering
    return RepaintBoundary(
      child: FocusableActionDetector(
        enabled: true,
        onShowFocusHighlight: (v) => setState(() => _isFocused = v),
        onShowHoverHighlight: (v) => setState(() => _isHovered = v),
        mouseCursor: SystemMouseCursors.click,
        actions: {
          ActivateIntent: CallbackAction<ActivateIntent>(
            onInvoke: (_) {
              _navigateToProduct();
              return null;
            },
          ),
        },
        child: cardBody,
      ),
    );
  }

  /// Builds the signature green button requested by the user with tactile press feedback
  Widget _buildGreenActionButton(BuildContext context, bool isCompact, [bool isDesktop = false]) {
    const greenColor = AppColors.forestDeep; // Rich botanical forest green

    if (isCompact) {
      // Circular shopping bag button for compact widths (Image 1 style)
      return TapFeedback(
        onTap: () => _handleAddToCart(context),
        effect: TapAnimationType.scale,
        scaleDown: 0.92,
        duration: GlorovInteractionConfig.durationFast,
        semanticLabel: 'Add ${widget.product.title} to cart',
        child: Container(
          width: 36,
          height: 36,
          decoration: const BoxDecoration(
            color: greenColor,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Color(0x22000000),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: const Center(
            child: Icon(
              Icons.shopping_bag_outlined,
              size: 18,
              color: Colors.white,
            ),
          ),
        ),
      );
    } else {
      // Pill "Add To Cart" button for wider widths (Image 2 & 3 style)
      return TapFeedback(
        onTap: () => _handleAddToCart(context),
        effect: TapAnimationType.scale,
        scaleDown: 0.94,
        duration: GlorovInteractionConfig.durationFast,
        semanticLabel: 'Add ${widget.product.title} to cart',
        child: Container(
          padding: EdgeInsets.symmetric(
            horizontal: isDesktop ? 16 : 13,
            vertical: isDesktop ? 8 : 6.5,
          ),
          decoration: BoxDecoration(
            color: greenColor,
            borderRadius: BorderRadius.circular(20),
            boxShadow: const [
              BoxShadow(
                color: Color(0x20000000),
                blurRadius: 4,
                offset: Offset(0, 1),
              ),
            ],
          ),
          child: Text(
            'Add To Cart',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: isDesktop ? 13.0 : 12.0,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.2,
              color: Colors.white,
            ),
          ),
        ),
      );
    }
  }

  void _handleAddToCart(BuildContext context) {
    GlorovCartState.instance.addToCart(widget.product);

    // Show accessible GLOROV toast notification
    GlorovFeedback.showSuccessToast(
      context,
      message: 'Added "${widget.product.title}" to cart!',
      actionLabel: 'VIEW CART',
      onAction: () => Navigator.pushNamed(
        context,
        cartScreenRoute,
      ),
    );
  }
}
