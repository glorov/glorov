import 'package:flutter/material.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../components/responsive/glorov_responsive.dart';
import '../../core/icons/glorov_custom_icons.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_product.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Botanical Shopping Cart Screen
/// Features signature botanical forest green theme, modern rounded geometry,
/// shifted express delivery estimation strip, dynamic milestone roadmap,
/// compact cart items, in-flow coupon voucher card, and sticky checkout bar.
class GlorovCartScreen extends StatefulWidget {
  final bool initialShowOffers;
  final bool isLoading;
  const GlorovCartScreen({
    super.key,
    this.initialShowOffers = false,
    this.isLoading = false,
  });

  @override
  State<GlorovCartScreen> createState() => _GlorovCartScreenState();
}

class _GlorovCartScreenState extends State<GlorovCartScreen> {
  final ScrollController _recommendedScrollController = ScrollController();
  final TextEditingController _pincodeController = TextEditingController(text: '411001');
  String _activePincode = '411001 (Pune)';
  String? _pincodeStatus;
  bool _isPincodeValid = true;
  bool _isPincodeExpanded = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialShowOffers) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _showAvailableOffersModal(context, GlorovCartState.instance);
        }
      });
    }
  }

  @override
  void dispose() {
    _recommendedScrollController.dispose();
    _pincodeController.dispose();
    super.dispose();
  }

  void _scrollRecommended(bool forward) {
    if (!_recommendedScrollController.hasClients) return;
    final target = _recommendedScrollController.offset + (forward ? 220.0 : -220.0);
    _recommendedScrollController.animateTo(
      target.clamp(0.0, _recommendedScrollController.position.maxScrollExtent),
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
  }

  void _checkPincode() {
    final pin = _pincodeController.text.trim();
    if (pin.length == 6 && int.tryParse(pin) != null) {
      setState(() {
        _isPincodeValid = true;
        _activePincode = pin;
        _pincodeStatus = 'Delivering to $pin in 2-3 business days • Free Delivery unlocked';
        _isPincodeExpanded = false;
      });
    } else {
      setState(() {
        _isPincodeValid = false;
        _pincodeStatus = 'Please enter a valid 6-digit postal pincode';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    final isDesktop = width >= 1024.0;
    final isTablet = width >= 640.0 && width < 1024.0;
    final isMobile = width < 640.0;

    return ListenableBuilder(
      listenable: GlorovCartState.instance,
      builder: (context, _) {
        final state = GlorovCartState.instance;
        final items = state.items;

        return GlorovStorefrontScaffold(
          backgroundColor: const Color(0xFFF9FAF8), // Soft botanical warm cream
          currentRoute: cartScreenRoute,
          showTopNav: false,
          showBottomNav: false, // Dedicated placement for sticky checkout bar
          alwaysShowBottomNav: false,
          bottomNavigationBar: (isMobile && items.isNotEmpty)
              ? _buildStickyCheckoutBar(context, state)
              : null,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Clean Cart Top Bar
              _buildTopHeader(context, state),

              if (widget.isLoading)
                GlorovContainer(
                  padding: EdgeInsets.symmetric(
                    horizontal: isDesktop ? AppSpacing.md : (isTablet ? AppSpacing.md : 10.0),
                    vertical: isDesktop ? AppSpacing.sm : 6.0,
                  ),
                  child: GlorovCartSkeleton(isDesktop: isDesktop || isTablet),
                )
              else if (items.isEmpty)
                _buildEmptyCart(context)
              else
                GlorovContainer(
                  padding: EdgeInsets.symmetric(
                    horizontal: isDesktop ? AppSpacing.md : (isTablet ? AppSpacing.md : 10.0),
                    vertical: isDesktop ? AppSpacing.sm : 6.0,
                  ),
                  child: isDesktop
                      ? _buildDesktopLayout(context, items, state)
                      : (isTablet
                          ? _buildTabletLayout(context, items, state)
                          : _buildMobileLayout(context, items, state)),
                ),

              const SizedBox(height: AppSpacing.xxl),
            ],
          ),
        );
      },
    );
  }

  // -------------------------------------------------------------
  // Header: Clean title with back/close action
  // -------------------------------------------------------------
  Widget _buildTopHeader(BuildContext context, GlorovCartState state) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: Color(0xFFEBEFEA), width: 1),
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: AppBreakpoints.maxContentWidth),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  InkWell(
                    key: const Key('cart_back_button'),
                    onTap: () {
                      if (Navigator.canPop(context)) {
                        Navigator.pop(context);
                      } else {
                        Navigator.pushReplacementNamed(context, homeScreenRoute);
                      }
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: const Padding(
                      padding: EdgeInsets.all(4.0),
                      child: Icon(Icons.arrow_back, size: 20, color: Color(0xFF0A4C36)),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text(
                    'Cart',
                    style: TextStyle(
                      fontFamily: AppTypography.displayFont,
                      fontSize: 21,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0A4C36),
                      letterSpacing: -0.3,
                    ),
                  ),
                  if (state.itemCount > 0) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        '${state.itemCount}',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0A4C36),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              InkWell(
                onTap: () => Navigator.maybePop(context),
                borderRadius: BorderRadius.circular(20),
                child: const Padding(
                  padding: EdgeInsets.all(6.0),
                  child: Icon(Icons.close, size: 20, color: Color(0xFF4B5563)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Compact Botanical Milestone Progress Meter (~48px height)
  // -------------------------------------------------------------
  Widget _buildMilestoneProgressBar(BuildContext context, GlorovCartState state) {
    final headlineInfo = state.milestoneHeadlineInfo;
    final fraction = state.milestoneProgressFraction.clamp(0.0, 1.0);
    final subtotal = state.subtotal;

    return InkWell(
      onTap: () => _showAvailableOffersModal(context, state),
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        decoration: BoxDecoration(
          color: const Color(0xFFF2FAF5),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFFC7EBD8), width: 1.0),
          boxShadow: const [
            BoxShadow(
              color: Color(0x060A4C36),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Top Row: Headline on left, View Offers link on right
            Row(
              children: [
                Expanded(
                  child: RichText(
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    text: TextSpan(
                      text: headlineInfo.$1,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1F2937),
                      ),
                      children: [
                        TextSpan(
                          text: headlineInfo.$2,
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0A4C36),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'View Offers',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0A4C36),
                      ),
                    ),
                    SizedBox(width: 2),
                    Icon(Icons.arrow_forward_ios, size: 9, color: Color(0xFF0A4C36)),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 7),

            // Continuous Horizontal Roadmap Track with Milestone Nodes
            LayoutBuilder(
              builder: (context, constraints) {
                final trackWidth = constraints.maxWidth;
                const nodeSize = 25.0;
                final availableWidth = trackWidth - nodeSize;

                final node1Reached = subtotal >= 999.0;
                final node2Reached = subtotal >= 1599.0;
                final node3Reached = subtotal >= 2299.0;

                final fillWidth = fraction * availableWidth;

                return SizedBox(
                  height: 27,
                  child: Stack(
                    alignment: Alignment.centerLeft,
                    children: [
                      // Base Track Line
                      Positioned(
                        left: nodeSize / 2,
                        right: nodeSize / 2,
                        child: Container(
                          height: 3,
                          decoration: BoxDecoration(
                            color: const Color(0xFFD6EAE0),
                            borderRadius: BorderRadius.circular(1.5),
                          ),
                        ),
                      ),

                      // Active Filled Track Line
                      Positioned(
                        left: nodeSize / 2,
                        child: Container(
                          width: fillWidth,
                          height: 3,
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              colors: [Color(0xFF008C4B), Color(0xFF0A4C36)],
                            ),
                            borderRadius: BorderRadius.circular(1.5),
                          ),
                        ),
                      ),

                      // Milestone Node 1: 10%
                      Positioned(
                        left: availableWidth * 0.33,
                        child: _milestoneNodeCircle('10%', node1Reached, size: nodeSize),
                      ),

                      // Milestone Node 2: 15%
                      Positioned(
                        left: availableWidth * 0.66,
                        child: _milestoneNodeCircle('15%', node2Reached, size: nodeSize),
                      ),

                      // Milestone Node 3: 20%
                      Positioned(
                        right: 0,
                        child: _milestoneNodeCircle('20%', node3Reached, size: nodeSize),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _milestoneNodeCircle(String label, bool isReached, {double size = 25}) {
    return Container(
      width: size,
      height: size,
      padding: const EdgeInsets.all(2),
      decoration: BoxDecoration(
        color: isReached ? const Color(0xFF0A4C36) : Colors.white,
        shape: BoxShape.circle,
        border: Border.all(
          color: const Color(0xFF0A4C36),
          width: 1.4,
        ),
        boxShadow: [
          BoxShadow(
            color: isReached ? const Color(0x330A4C36) : const Color(0x10000000),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Center(
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Text(
            label,
            maxLines: 1,
            softWrap: false,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 9.5,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.2,
              color: isReached ? Colors.white : const Color(0xFF0A4C36),
              height: 1.0,
            ),
          ),
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Shifted Interactive Delivery & Pincode Strip (Top Placement)
  // -------------------------------------------------------------
  Widget _buildPincodeBox() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE5ECE8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x060A4C36),
            blurRadius: 6,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(5),
                decoration: const BoxDecoration(
                  color: Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.local_shipping_outlined, size: 15, color: Color(0xFF0A4C36)),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: RichText(
                  text: TextSpan(
                    text: 'Deliver to ',
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 12,
                      color: Color(0xFF4B5563),
                    ),
                    children: [
                      TextSpan(
                        text: _activePincode,
                        style: const TextStyle(
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const TextSpan(
                        text: ' • Free Express (2-3 Days)',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              InkWell(
                onTap: () {
                  setState(() {
                    _isPincodeExpanded = !_isPincodeExpanded;
                  });
                },
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF0FDF4),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Text(
                    _isPincodeExpanded ? 'Close' : 'Change',
                    style: const TextStyle(
                      fontSize: 10.5,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF0A4C36),
                    ),
                  ),
                ),
              ),
            ],
          ),

          if (_isPincodeExpanded) ...[
            const SizedBox(height: 10),
            Container(
              height: 40,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFCBD5E1), width: 1.2),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _pincodeController,
                      keyboardType: TextInputType.number,
                      maxLength: 6,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF111827),
                      ),
                      decoration: const InputDecoration(
                        counterText: '',
                        hintText: 'Enter 6-digit Pincode',
                        hintStyle: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          color: Color(0xFF9CA3AF),
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                      onSubmitted: (_) => _checkPincode(),
                    ),
                  ),
                  TapFeedback(
                    onTap: _checkPincode,
                    effect: TapAnimationType.scale,
                    scaleDown: 0.94,
                    child: Container(
                      height: 40,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: const BoxDecoration(
                        color: Color(0xFF0A4C36),
                        borderRadius: BorderRadius.only(
                          topRight: Radius.circular(7),
                          bottomRight: Radius.circular(7),
                        ),
                      ),
                      alignment: Alignment.center,
                      child: const Text(
                        'CHECK',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          if (_pincodeStatus != null) ...[
            const SizedBox(height: 6),
            Text(
              _pincodeStatus!,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: _isPincodeValid ? const Color(0xFF059669) : const Color(0xFFDC2626),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // -------------------------------------------------------------
  // Mobile Stacked Layout (Compact Botanical Hierarchy)
  // -------------------------------------------------------------
  Widget _buildMobileLayout(
    BuildContext context,
    List<GlorovCartItem> items,
    GlorovCartState state,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Ultra-Compact Milestone Roadmap Progress Ribbon
        _buildMilestoneProgressBar(context, state),

        const SizedBox(height: 8),

        // 2. Compact Cart Items List (Very small, sleek cards)
        _buildCartItemsList(context, items, state),

        const SizedBox(height: 12),

        // 3. Recommended Products Carousel (HIGH PRIORITY - Prominently visible)
        _buildRecommendedProductsSection(context),

        const SizedBox(height: 12),

        // 4. In-Flow Coupon Voucher Card (Smart Direct Apply)
        _buildCouponVoucherCard(context, state),

        const SizedBox(height: 10),

        // 5. Express Delivery & Pincode Strip (Relocated to bottom section)
        _buildPincodeBox(),

        const SizedBox(height: 10),

        // 6. Safe Botanical Transit & Care Guarantee Strip
        _buildTransitGuaranteeCard(context),
      ],
    );
  }

  // -------------------------------------------------------------
  // Desktop 2-Column Layout (Matching Image 5 & Green Theme)
  // -------------------------------------------------------------
  Widget _buildDesktopLayout(
    BuildContext context,
    List<GlorovCartItem> items,
    GlorovCartState state,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left Column: Milestone, Items, Recommendations (Flex 13)
        Expanded(
          flex: 13,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildMilestoneProgressBar(context, state),
              const SizedBox(height: 12),
              _buildCartItemsList(context, items, state),
              const SizedBox(height: 18),
              _buildRecommendedProductsSection(context),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.xl),

        // Right Column: Coupon Card, Pincode, Order Summary & Guarantee (Flex 8)
        Expanded(
          flex: 8,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCouponVoucherCard(context, state),
              const SizedBox(height: 14),
              _buildPincodeBox(),
              const SizedBox(height: 16),
              _buildDesktopOrderSummaryCard(context, state),
              const SizedBox(height: 12),
              _buildTransitGuaranteeCard(context),
            ],
          ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Tablet 2-Column Responsive Layout (640px to 1023px)
  // -------------------------------------------------------------
  Widget _buildTabletLayout(
    BuildContext context,
    List<GlorovCartItem> items,
    GlorovCartState state,
  ) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left Column: Milestone Progress, Items List, Recommendations (Flex 12, ~57%)
        Expanded(
          flex: 12,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildMilestoneProgressBar(context, state),
              const SizedBox(height: 10),
              _buildCartItemsList(context, items, state),
              const SizedBox(height: 16),
              _buildRecommendedProductsSection(context),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.md),

        // Right Column: Coupon, Delivery/Pincode, Order Summary, Guarantee (Flex 9, ~43%)
        Expanded(
          flex: 9,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildCouponVoucherCard(context, state),
              const SizedBox(height: 12),
              _buildPincodeBox(),
              const SizedBox(height: 14),
              _buildDesktopOrderSummaryCard(context, state),
              const SizedBox(height: 12),
              _buildTransitGuaranteeCard(context),
            ],
          ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Compact Cart Items List (Very Small & Clean Cards)
  // -------------------------------------------------------------
  Widget _buildCartItemsList(
    BuildContext context,
    List<GlorovCartItem> items,
    GlorovCartState state,
  ) {
    return Column(
      children: items.map((item) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 7),
          child: _buildCompactCartItemCard(context, item, state),
        );
      }).toList(),
    );
  }

  Widget _buildCompactCartItemCard(
    BuildContext context,
    GlorovCartItem item,
    GlorovCartState state,
  ) {
    final variantText = item.variant?.name ?? '1 gm';
    final appliedPromo = state.appliedPromoCode;
    final itemDiscountPercent = item.originalUnitPrice > item.unitPrice
        ? (((item.originalUnitPrice - item.unitPrice) / item.originalUnitPrice) * 100).round()
        : 0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5ECE8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x05000000),
            blurRadius: 6,
            offset: Offset(0, 1.5),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 56px Square Thumbnail with 10px rounded corners
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: Container(
              width: 56,
              height: 56,
              color: const Color(0xFFF3F4F6),
              child: item.product.primaryImage.startsWith('assets/')
                  ? Image.asset(
                      item.product.primaryImage,
                      fit: BoxFit.cover,
                      cacheWidth: 120,
                      cacheHeight: 120,
                      filterQuality: FilterQuality.medium,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.yard_outlined,
                        color: Color(0xFF16A34A),
                        size: 24,
                      ),
                    )
                  : Image.network(
                      item.product.primaryImage,
                      fit: BoxFit.cover,
                      cacheWidth: 120,
                      cacheHeight: 120,
                      filterQuality: FilterQuality.medium,
                      errorBuilder: (_, __, ___) => const Icon(
                        Icons.yard_outlined,
                        color: Color(0xFF16A34A),
                        size: 24,
                      ),
                    ),
            ),
          ),

          const SizedBox(width: 10),

          // Details Column
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Title and Top-Right Trash Button
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        item.product.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: AppTypography.displayFont,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827),
                          height: 1.2,
                        ),
                      ),
                    ),
                    const SizedBox(width: 4),
                    TapFeedback(
                      onTap: () => _confirmRemoveItem(context, item),
                      effect: TapAnimationType.scale,
                      scaleDown: 0.90,
                      child: const Padding(
                        padding: EdgeInsets.all(2.0),
                        child: Icon(
                          Icons.delete_outline,
                          size: 16,
                          color: Color(0xFF9CA3AF),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 2),

                // Variant chip + applied promo badge + Save for later
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        variantText,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF4B5563),
                        ),
                      ),
                    ),
                    if (appliedPromo != null) ...[
                      const SizedBox(width: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(4),
                          border: Border.all(color: const Color(0xFFA7F3D0)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.bolt, size: 9, color: Color(0xFF059669)),
                            const SizedBox(width: 2),
                            Text(
                              appliedPromo,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 9,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF047857),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const Spacer(),
                    // Subtle "Save for later" action
                    TapFeedback(
                      onTap: () {
                        GlorovCartState.instance.moveToWishlist(item.itemKey);
                        GlorovFeedback.showSuccessToast(
                          context,
                          message: 'Moved "${item.product.title}" to wishlist',
                          actionLabel: 'VIEW',
                          onAction: () => Navigator.pushNamed(context, bookmarkScreenRoute),
                        );
                      },
                      effect: TapAnimationType.bounce,
                      child: const Text(
                        'Save for later',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 10,
                          color: Color(0xFF6B7280),
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 5),

                // Bottom Row: Price on Left, Compact Forest Green Stepper on Right
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // Price Stack with Emerald Discount Pill
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(
                          '₹${item.unitPrice.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: 14.5,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0A4C36),
                          ),
                        ),
                        if (item.originalUnitPrice > item.unitPrice) ...[
                          const SizedBox(width: 4),
                          Text(
                            '₹${item.originalUnitPrice.toStringAsFixed(0)}',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              color: Color(0xFF9CA3AF),
                              decoration: TextDecoration.lineThrough,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          if (itemDiscountPercent > 0) ...[
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE8F5E9),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                '$itemDiscountPercent% off',
                                style: const TextStyle(
                                  fontSize: 8.5,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0A4C36),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ],
                    ),

                    // Compact Botanical Green Outlined Pill Stepper [- 3 +]
                    Container(
                      height: 24,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF4F9F6),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: const Color(0xFF0A4C36),
                          width: 1.1,
                        ),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 3),
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
                              padding: EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              child: Icon(Icons.remove, size: 11, color: Color(0xFF0A4C36)),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Text(
                              '${item.quantity}',
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 11.5,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0A4C36),
                              ),
                            ),
                          ),
                          TapFeedback(
                            onTap: item.quantity < 20
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
                              padding: EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              child: Icon(Icons.add, size: 11, color: Color(0xFF0A4C36)),
                            ),
                          ),
                        ],
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
      message: 'Removed "${item.product.title}" from cart',
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

  // -------------------------------------------------------------
  // Recommended Products Carousel (Botanical Green Design)
  // -------------------------------------------------------------
  Widget _buildRecommendedProductsSection(BuildContext context) {
    final allProducts = GlorovMockData.products;
    final npk = allProducts.firstWhere(
      (p) => p.title.contains('Instagrow') || p.title.contains('NPK'),
      orElse: () => allProducts.first,
    );
    final jade = allProducts.firstWhere(
      (p) => p.title.contains('Jade Mini'),
      orElse: () => allProducts.length > 1 ? allProducts[1] : allProducts.first,
    );
    final others = allProducts
        .where((p) => p.id != npk.id && p.id != jade.id)
        .take(6)
        .toList();

    final recommendedList = [npk, jade, ...others];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header with < > Controls
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(
              child: Row(
                children: [
                  Icon(Icons.spa_outlined, size: 18, color: Color(0xFF0A4C36)),
                  SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      'Recommended Products',
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF0A4C36),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            Row(
              children: [
                InkWell(
                  onTap: () => _scrollRecommended(false),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: const Icon(Icons.chevron_left, size: 16, color: Color(0xFF0A4C36)),
                  ),
                ),
                const SizedBox(width: 8),
                InkWell(
                  onTap: () => _scrollRecommended(true),
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.all(5),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: const Icon(Icons.chevron_right, size: 16, color: Color(0xFF0A4C36)),
                  ),
                ),
              ],
            ),
          ],
        ),

        const SizedBox(height: 12),

        // Horizontal Carousel
        SizedBox(
          height: 254,
          child: ListView.separated(
            controller: _recommendedScrollController,
            scrollDirection: Axis.horizontal,
            itemCount: recommendedList.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (ctx, i) {
              final product = recommendedList[i];
              return _buildRecommendedCard(context, product);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildRecommendedCard(BuildContext context, GlorovProduct product) {
    return Container(
      width: 162,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5ECE8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Media with Overlays
          AspectRatio(
            aspectRatio: 1.08,
            child: Stack(
              fit: StackFit.expand,
              children: [
                product.primaryImage.startsWith('assets/')
                    ? Image.asset(
                        product.primaryImage,
                        fit: BoxFit.cover,
                        cacheWidth: 360,
                        filterQuality: FilterQuality.medium,
                        errorBuilder: (_, __, ___) => Container(
                          color: const Color(0xFFF3F4F6),
                          child: const Icon(Icons.yard_outlined, color: Color(0xFF16A34A)),
                        ),
                      )
                    : Image.network(
                        product.primaryImage,
                        fit: BoxFit.cover,
                        cacheWidth: 360,
                        filterQuality: FilterQuality.medium,
                        errorBuilder: (_, __, ___) => Container(
                          color: const Color(0xFFF3F4F6),
                          child: const Icon(Icons.yard_outlined, color: Color(0xFF16A34A)),
                        ),
                      ),

                // Top-Left BESTSELLER Badge
                if (product.isBestSeller)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFACC15), // Yellow bestseller pill
                        borderRadius: BorderRadius.circular(5),
                      ),
                      child: const Text(
                        'BESTSELLER',
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF78350F),
                          letterSpacing: 0.5,
                        ),
                      ),
                    ),
                  ),

                // Bottom-Left Translucent Frosted Rating Badge
                if (product.id != 'glr-npk-65')
                  Positioned(
                    left: 8,
                    bottom: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.88),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.95),
                          width: 0.8,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            product.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF0F172A),
                            ),
                          ),
                          const SizedBox(width: 3),
                          const Icon(Icons.star_rounded, size: 12, color: Color(0xFF16A34A)),
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 3),
                            child: Text('|', style: TextStyle(fontSize: 10, color: Color(0xFFCBD5E1))),
                          ),
                          Text(
                            '${product.reviewCount}',
                            style: const TextStyle(
                              fontSize: 10.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF334155),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),

          // Content
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    product.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF111827),
                      height: 1.25,
                    ),
                  ),

                  // Price & Circular Forest Green Quick-Add Button
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Expanded(
                        child: Wrap(
                          crossAxisAlignment: WrapCrossAlignment.center,
                          spacing: 4,
                          children: [
                            Text(
                              '₹${product.effectivePrice.toStringAsFixed(0)}',
                              style: const TextStyle(
                                fontFamily: AppTypography.displayFont,
                                fontSize: 14.5,
                                fontWeight: FontWeight.w800,
                                color: Color(0xFF0A4C36),
                              ),
                            ),
                            if (product.hasDiscount)
                              Text(
                                '₹${product.price.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF94A3B8),
                                  decoration: TextDecoration.lineThrough,
                                ),
                              ),
                          ],
                        ),
                      ),

                      // Circular Botanical Green Quick-Add Button
                      TapFeedback(
                        onTap: () {
                          GlorovCartState.instance.addToCart(product);
                          GlorovFeedback.showSuccessToast(
                            context,
                            message: 'Added "${product.title}" to cart!',
                          );
                        },
                        effect: TapAnimationType.scale,
                        scaleDown: 0.90,
                        child: Container(
                          width: 34,
                          height: 34,
                          decoration: const BoxDecoration(
                            color: Color(0xFF0A4C36), // Glorov Forest Green
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: Color(0x280A4C36),
                                blurRadius: 6,
                                offset: Offset(0, 2),
                              ),
                            ],
                          ),
                          child: Center(
                            child: GlorovCustomIcons.cart(
                              size: 18,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  // -------------------------------------------------------------
  // In-Flow Coupon Voucher Card (Botanical Green Ticket)
  // -------------------------------------------------------------
  Widget _buildCouponVoucherCard(BuildContext context, GlorovCartState state) {
    final appliedPromo = state.appliedPromoCode;

    if (appliedPromo != null) {
      // Applied State
      final promoTitle = appliedPromo == 'DIWALI10'
          ? '10% OFF On orders above ₹999'
          : (appliedPromo == 'DIWALI15'
              ? '15% OFF On orders above ₹1,599'
              : (appliedPromo == 'DIWALI20'
                  ? '20% OFF On orders above ₹2,299'
                  : '$appliedPromo Active'));

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF2FAF5), // Soft mint tint
          borderRadius: BorderRadius.circular(18),
          border: Border.all(color: const Color(0xFFB7E4C7), width: 1.2),
          boxShadow: const [
            BoxShadow(
              color: Color(0x060A4C36),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                // Discount Icon
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: const BoxDecoration(
                    color: Color(0xFF0A4C36),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.percent, size: 14, color: Colors.white),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        promoTitle,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0A4C36),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Code: $appliedPromo',
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11.5,
                          color: Color(0xFF4B5563),
                        ),
                      ),
                    ],
                  ),
                ),
                // Outlined Remove Button (Forest Green)
                TapFeedback(
                  onTap: () {
                    state.removeCoupon();
                    GlorovFeedback.showInfoToast(context, message: 'Coupon removed');
                  },
                  effect: TapAnimationType.scale,
                  scaleDown: 0.94,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF0A4C36), width: 1.2),
                    ),
                    child: const Text(
                      'Remove',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0A4C36),
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 10),
            const Divider(color: Color(0xFFD6ECE0), height: 1),
            const SizedBox(height: 8),

            // View all coupons link
            InkWell(
              onTap: () => _showAvailableOffersModal(context, state),
              borderRadius: BorderRadius.circular(6),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 4),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'View all available coupons',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF0A4C36),
                        ),
                      ),
                      SizedBox(width: 4),
                      Icon(Icons.arrow_forward, size: 14, color: Color(0xFF0A4C36)),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      );
    } else {
      // Find the highest eligible milestone offer based on cart subtotal
      final eligibleOffers = GlorovCartState.milestoneOffers
          .where((o) => state.subtotal >= o.minSpend)
          .toList();
      final GlorovMilestoneOffer? bestApplicable =
          eligibleOffers.isNotEmpty ? eligibleOffers.last : null;

      final title = bestApplicable != null
          ? 'Apply ${bestApplicable.code} (${bestApplicable.discountPercent.toInt()}% OFF)'
          : 'Apply Coupon & Save More';

      final subtitle = bestApplicable != null
          ? 'Tap to save ₹${(state.subtotal * bestApplicable.discountPercent / 100).toStringAsFixed(0)} on this order'
          : (state.subtotal > 0
              ? 'Add ₹${(999 - state.subtotal).clamp(0, double.infinity).toInt()} more to unlock 10% OFF'
              : 'Milestone offers up to 20% off available');

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: bestApplicable != null
                ? const Color(0xFFB7E4C7)
                : const Color(0xFFE5ECE8),
            width: bestApplicable != null ? 1.2 : 1.0,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(7),
                  decoration: BoxDecoration(
                    color: bestApplicable != null
                        ? const Color(0xFF0A4C36)
                        : const Color(0xFFE8F5E9),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.percent,
                    size: 14,
                    color: bestApplicable != null
                        ? Colors.white
                        : const Color(0xFF0A4C36),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: bestApplicable != null
                              ? const Color(0xFF0A4C36)
                              : const Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11.5,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
                // Show APPLY button ONLY if a coupon is applicable
                if (bestApplicable != null) ...[
                  const SizedBox(width: 8),
                  TapFeedback(
                    onTap: () {
                      final (ok, msg) = state.applyCoupon(bestApplicable.code);
                      if (ok) {
                        GlorovFeedback.showSuccessToast(context, message: msg);
                      } else {
                        GlorovFeedback.showErrorToast(context, message: msg);
                      }
                    },
                    effect: TapAnimationType.scale,
                    scaleDown: 0.94,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0A4C36),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Text(
                        'APPLY',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ),
                ] else ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3FAF6),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFD6EAE0)),
                    ),
                    child: const Text(
                      '10% at ₹999',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0A4C36),
                      ),
                    ),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 8),
            const Divider(color: Color(0xFFF3F4F6), height: 1),
            const SizedBox(height: 6),
            InkWell(
              onTap: () => _showAvailableOffersModal(context, state),
              child: const FittedBox(
                fit: BoxFit.scaleDown,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'View all available coupons',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF0A4C36),
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.arrow_forward, size: 13, color: Color(0xFF0A4C36)),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }
  }

  // -------------------------------------------------------------
  // Safe Transit & Quality Guarantee Strip (3 Pillars)
  // -------------------------------------------------------------
  Widget _buildTransitGuaranteeCard(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFF2FAF5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFC7EBD8)),
      ),
      child: const Center(
        child: Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 4,
          children: [
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.shield_outlined, size: 13, color: Color(0xFF0A4C36)),
                SizedBox(width: 4),
                Text(
                  '100% Safe Transit',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF0A4C36)),
                ),
              ],
            ),
            Text('•', style: TextStyle(color: Color(0xFFA7F3D0))),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.eco_outlined, size: 13, color: Color(0xFF0A4C36)),
                SizedBox(width: 4),
                Text(
                  'Live Plant Guarantee',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF0A4C36)),
                ),
              ],
            ),
            Text('•', style: TextStyle(color: Color(0xFFA7F3D0))),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.recycling_outlined, size: 13, color: Color(0xFF0A4C36)),
                SizedBox(width: 4),
                Text(
                  'Eco Packaging',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF0A4C36)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Protected Checkout Navigation Guard
  // -------------------------------------------------------------
  void _handleProceedToCheckout(BuildContext context) {
    if (!GlorovAccountState.instance.isAuthenticated) {
      GlorovFeedback.showInfoToast(
        context,
        message: 'Please sign in to proceed to checkout',
      );
      Navigator.pushNamed(
        context,
        logInScreenRoute,
        arguments: {
          'redirectTo': checkoutScreenRoute,
          'reason':
              'Please sign in to complete your checkout and secure your botanical order.',
        },
      );
      return;
    }
    Navigator.pushNamed(context, checkoutScreenRoute);
  }

  // -------------------------------------------------------------
  // Sticky Bottom Checkout Bar (Botanical Green Theme)
  // -------------------------------------------------------------
  Widget _buildStickyCheckoutBar(BuildContext context, GlorovCartState state) {
    final comparePrice = state.compareSubtotal > state.total
        ? state.compareSubtotal
        : (state.total * 1.35);
    final discountPercent = state.overallDiscountPercent > 0
        ? state.overallDiscountPercent
        : 31;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(
          top: BorderSide(color: Color(0xFFE5ECE8), width: 1.2),
        ),
        boxShadow: [
          BoxShadow(
            color: Color(0x100A4C36),
            blurRadius: 12,
            offset: Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Left: Price Stack & Inclusive of taxes toggle (scales down smoothly on narrow screens)
            Expanded(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        // Total Payable
                        Text(
                          '₹${state.total.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Color(0xFF0A4C36),
                            height: 1.0,
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Compare Price Strikethrough
                        Text(
                          '₹${comparePrice.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12.5,
                            color: Color(0xFF9CA3AF),
                            decoration: TextDecoration.lineThrough,
                            fontWeight: FontWeight.w500,
                            height: 1.0,
                          ),
                        ),
                        const SizedBox(width: 6),
                        // Discount Pill
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF008C4B), // Vivid green badge
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '$discountPercent% off',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.0,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),

                    // Inclusive of all taxes with down caret
                    InkWell(
                      onTap: () => _showTaxBreakdownSheet(context, state),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Inclusive of all taxes',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF4B5563),
                            ),
                          ),
                          SizedBox(width: 2),
                          Icon(
                            Icons.keyboard_arrow_down,
                            size: 14,
                            color: Color(0xFF4B5563),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(width: 12),

            // Right: Signature Forest Green Checkout Button
            TapFeedback(
              onTap: () => _handleProceedToCheckout(context),
              effect: TapAnimationType.scale,
              scaleDown: 0.94,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 26, vertical: 13),
                decoration: BoxDecoration(
                  color: const Color(0xFF0A4C36), // Deep Forest Green
                  borderRadius: BorderRadius.circular(28),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x330A4C36),
                      blurRadius: 10,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'CHECKOUT',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.8,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(width: 6),
                    Icon(Icons.arrow_forward_rounded, size: 15, color: Colors.white),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Desktop Order Summary Card (Botanical Green Theme)
  // -------------------------------------------------------------
  Widget _buildDesktopOrderSummaryCard(BuildContext context, GlorovCartState state) {
    final comparePrice = state.compareSubtotal > state.total
        ? state.compareSubtotal
        : (state.total * 1.35);
    final discountPercent = state.overallDiscountPercent > 0
        ? state.overallDiscountPercent
        : 31;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE5ECE8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.receipt_long_outlined, size: 16, color: Color(0xFF0A4C36)),
              SizedBox(width: 6),
              Text(
                'ORDER SUMMARY',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF0A4C36),
                  letterSpacing: 0.8,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),

          _summaryLine('Items Subtotal', '₹${state.subtotal.toStringAsFixed(0)}'),
          if (state.promoDiscountAmount > 0) ...[
            const SizedBox(height: 8),
            _summaryLine(
              'Coupon Discount (${state.appliedPromoCode})',
              '-₹${state.promoDiscountAmount.toStringAsFixed(0)}',
              isDiscount: true,
            ),
          ],
          const SizedBox(height: 8),
          _summaryLine(
            'Shipping Transit',
            state.shippingCost == 0 ? 'FREE' : '₹${state.shippingCost.toStringAsFixed(0)}',
            isFree: state.shippingCost == 0,
          ),
          const SizedBox(height: 8),
          _summaryLine('Taxes & Packaging', 'Included in MRP'),

          const Divider(height: 24, color: Color(0xFFE5ECE8)),

          // Payable Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Total Payable',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF111827),
                      ),
                    ),
                    Wrap(
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(
                          '₹${comparePrice.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF9CA3AF),
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '($discountPercent% OFF)',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF008C4B),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '₹${state.total.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: Color(0xFF0A4C36),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Checkout Button
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _handleProceedToCheckout(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0A4C36),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 15),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(28),
                ),
                elevation: 2,
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Flexible(
                    child: Text(
                      'PROCEED TO CHECKOUT',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  SizedBox(width: 6),
                  Icon(Icons.arrow_forward_rounded, size: 16),
                ],
              ),
            ),
          ),

          const SizedBox(height: 12),

          // Security & Trust Badging
          const Center(
            child: Wrap(
              alignment: WrapAlignment.center,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Icon(Icons.lock_outline, size: 12, color: Color(0xFF6B7280)),
                SizedBox(width: 4),
                Text(
                  '256-bit Secure Checkout',
                  style: TextStyle(
                    fontSize: 10.5,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryLine(String label, String value, {bool isDiscount = false, bool isFree = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12.5,
              color: Color(0xFF6B7280),
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          value,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            fontWeight: FontWeight.w700,
            color: isDiscount || isFree ? const Color(0xFF059669) : const Color(0xFF111827),
          ),
        ),
      ],
    );
  }

  // -------------------------------------------------------------
  // Available Offers Modal Sheet / Dialog (Botanical Green Theme)
  // -------------------------------------------------------------
  void _showAvailableOffersModal(BuildContext context, GlorovCartState state) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            final offers = GlorovCartState.milestoneOffers;
            final subtotal = state.subtotal;
            final appliedPromo = state.appliedPromoCode;

            return SafeArea(
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(ctx).size.height * 0.88,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Header with close button
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.local_offer_outlined, size: 20, color: Color(0xFF0A4C36)),
                              SizedBox(width: 8),
                              Text(
                                'Available Offers',
                                style: TextStyle(
                                  fontFamily: AppTypography.displayFont,
                                  fontSize: 19,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF0A4C36),
                                ),
                              ),
                            ],
                          ),
                          InkWell(
                            onTap: () => Navigator.pop(ctx),
                            borderRadius: BorderRadius.circular(20),
                            child: const Padding(
                              padding: EdgeInsets.all(4.0),
                              child: Icon(Icons.close, size: 20, color: Color(0xFF4B5563)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1, color: Color(0xFFF3F4F6)),

                    // Offers List
                    Flexible(
                      child: ListView.separated(
                        shrinkWrap: true,
                        padding: const EdgeInsets.all(16),
                        itemCount: offers.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 14),
                        itemBuilder: (ctx, i) {
                          final offer = offers[i];
                          final isApplied = appliedPromo == offer.code;
                          final isEligible = subtotal >= offer.minSpend;
                          final shortfall = (offer.minSpend - subtotal).clamp(0.0, double.infinity);

                          return Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: isApplied ? const Color(0xFFF2FAF5) : const Color(0xFFF9FAFB),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: isApplied
                                    ? const Color(0xFF0A4C36) // Forest Green outline for active offer
                                    : const Color(0xFFE5E7EB),
                                width: isApplied ? 1.8 : 1.0,
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        offer.title,
                                        style: const TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 15,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF0A4C36), // Deep botanical green
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        offer.description,
                                        style: const TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 12.5,
                                          color: Color(0xFF4B5563),
                                        ),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        'Code: ${offer.code}',
                                        style: const TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: Color(0xFF1F2937),
                                        ),
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        offer.disclaimer,
                                        style: const TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 10.5,
                                          fontStyle: FontStyle.italic,
                                          color: Color(0xFF9CA3AF),
                                        ),
                                      ),
                                      if (!isEligible) ...[
                                        const SizedBox(height: 4),
                                        Text(
                                          'Add ₹${shortfall.toStringAsFixed(0)} more to unlock',
                                          style: const TextStyle(
                                            fontFamily: AppTypography.primaryFont,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFFDC2626),
                                          ),
                                        ),
                                      ],
                                    ],
                                  ),
                                ),

                                const SizedBox(width: 10),

                                // Action Button
                                if (isApplied)
                                  TapFeedback(
                                    onTap: () {
                                      state.removeCoupon();
                                      setModalState(() {});
                                      GlorovFeedback.showInfoToast(
                                        context,
                                        message: 'Coupon removed',
                                      );
                                    },
                                    effect: TapAnimationType.scale,
                                    scaleDown: 0.94,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        borderRadius: BorderRadius.circular(10),
                                        border: Border.all(color: const Color(0xFF0A4C36), width: 1.4),
                                      ),
                                      child: const Text(
                                        'REMOVE',
                                        style: TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: Color(0xFF0A4C36),
                                        ),
                                      ),
                                    ),
                                  )
                                else
                                  TapFeedback(
                                    onTap: isEligible
                                        ? () {
                                            final (ok, msg) = state.applyCoupon(offer.code);
                                            setModalState(() {});
                                            if (ok) {
                                              GlorovFeedback.showSuccessToast(context, message: msg);
                                            } else {
                                              GlorovFeedback.showErrorToast(context, message: msg);
                                            }
                                          }
                                        : null,
                                    effect: TapAnimationType.scale,
                                    scaleDown: 0.94,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
                                      decoration: BoxDecoration(
                                        color: isEligible
                                            ? const Color(0xFF0A4C36)
                                            : const Color(0xFFA3C4B8), // Muted sage when locked
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Text(
                                        'APPLY',
                                        style: TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w800,
                                          color: Colors.white,
                                        ),
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),

                    // Sticky Bottom Bar inside modal
                    _buildStickyCheckoutBar(context, state),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  // -------------------------------------------------------------
  // Tax Breakdown Bottom Sheet (Inclusive of all taxes ⌵)
  // -------------------------------------------------------------
  void _showTaxBreakdownSheet(BuildContext context, GlorovCartState state) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
      ),
      builder: (ctx) {
        final comparePrice = state.compareSubtotal > state.total
            ? state.compareSubtotal
            : (state.total * 1.35);
        final totalSavings = comparePrice - state.total;

        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.receipt_outlined, size: 20, color: Color(0xFF0A4C36)),
                        SizedBox(width: 8),
                        Text(
                          'Price & Tax Breakdown',
                          style: TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: 19,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF0A4C36),
                          ),
                        ),
                      ],
                    ),
                    InkWell(
                      onTap: () => Navigator.pop(ctx),
                      borderRadius: BorderRadius.circular(20),
                      child: const Icon(Icons.close, size: 20, color: Color(0xFF4B5563)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _summaryLine('Items Subtotal', '₹${state.subtotal.toStringAsFixed(0)}'),
                const SizedBox(height: 8),
                _summaryLine('Original Catalog Value', '₹${comparePrice.toStringAsFixed(0)}'),
                if (state.promoDiscountAmount > 0) ...[
                  const SizedBox(height: 8),
                  _summaryLine(
                    'Promotional Savings (${state.appliedPromoCode})',
                    '-₹${state.promoDiscountAmount.toStringAsFixed(0)}',
                    isDiscount: true,
                  ),
                ],
                const SizedBox(height: 8),
                _summaryLine(
                  'Botanical Delivery Fee',
                  state.shippingCost == 0 ? 'FREE' : '₹${state.shippingCost.toStringAsFixed(0)}',
                  isFree: state.shippingCost == 0,
                ),
                const SizedBox(height: 8),
                _summaryLine('GST & Agricultural Packaging', 'Included in MRP'),

                const Divider(height: 24, color: Color(0xFFE5ECE8)),

                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Total Payable',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                      ),
                    ),
                    Text(
                      '₹${state.total.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Color(0xFF0A4C36),
                      ),
                    ),
                  ],
                ),

                if (totalSavings > 0) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                    decoration: BoxDecoration(
                      color: const Color(0xFFECFDF5),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFA7F3D0)),
                    ),
                    child: Text(
                      '🎉 You are saving ₹${totalSavings.toStringAsFixed(0)} on this order!',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF047857),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  // -------------------------------------------------------------
  // Empty Cart State (Botanical Theme)
  // -------------------------------------------------------------
  Widget _buildEmptyCart(BuildContext context) {
    final suggested = GlorovMockData.products.take(4).toList();

    return GlorovContainer(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.xl),
      child: Column(
        children: [
          const SizedBox(height: AppSpacing.lg),
          Container(
            width: 84,
            height: 84,
            decoration: const BoxDecoration(
              color: Color(0xFFEAF5EE),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: GlorovCustomIcons.cart(
                size: 40,
                color: const Color(0xFF0A4C36),
                isFilled: true,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'Your Botanical Bag is Empty',
            style: TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Color(0xFF0A4C36),
            ),
          ),
          const SizedBox(height: AppSpacing.xs),
          const Text(
            'Explore our heirloom seeds, rare houseplants, and artisanal planters to bring nature home.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13.5,
              color: Color(0xFF6B7280),
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton.icon(
            onPressed: () => Navigator.pushNamed(
              context,
              discoverScreenRoute,
              arguments: 'All Botanical',
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF0A4C36),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 13),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            ),
            icon: const Icon(Icons.spa_outlined, size: 18),
            label: const Text(
              'EXPLORE CATALOG',
              style: TextStyle(fontWeight: FontWeight.w800, letterSpacing: 0.6),
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
                color: Color(0xFF0A4C36),
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
              crossAxisSpacing: AppBreakpoints.isMobile(context) ? 8.0 : AppSpacing.md,
              mainAxisSpacing: AppBreakpoints.isMobile(context) ? 10.0 : AppSpacing.md,
              childAspectRatio: AppBreakpoints.isDesktop(context) ? 0.70 : 0.65,
            ),
            itemBuilder: (ctx, i) {
              return GlorovProductCard(product: suggested[i]);
            },
          ),
        ],
      ),
    );
  }
}
