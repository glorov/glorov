import 'package:flutter/material.dart';
import '../../components/common/glorov_y_scroll_pass_through.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../components/product/glorov_product_gallery.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_product.dart';
import '../../models/glorov/glorov_review.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/glorov_header_scroll_notifier.dart';

/// GLOROV Production-Grade Product Details & Ordering Screen
/// Matches the authentic mobile & desktop ordering experience:
/// - Breadcrumbs & Social proof ("1 Crore + Happy Customers")
/// - Square product gallery with dynamic docked promotional badge and sowing advice overlay
/// - 3 Botanical Lifecycle Metric Cards (Germination %, Sprout Days, Maturity Days)
/// - Variant packet size selection chips
/// - Live pricing with tax note & handwritten gift note option
/// - "Offers for you:" coupon cards carousel
/// - Quantity selector & green "Add To Cart" button
/// - Pincode delivery estimator with instant date calculation
/// - 5-Stage botanical growing tabs (Germination, Transplanting, Growing, Aftercare, Harvesting)
/// - "Frequently bought together" 3-item bundle upsell with live total & 1-tap cart addition
/// - "From a seed..." editorial botanical story banner
/// - "You may also like" related product cards
/// - Customer ratings with "Why customers love this" AI summary & reviews
/// - Sticky mobile bottom bar with price and green ADD TO CART button
class GlorovProductDetailsScreen extends StatefulWidget {
  final GlorovProduct product;

  const GlorovProductDetailsScreen({
    super.key,
    required this.product,
  });

  @override
  State<GlorovProductDetailsScreen> createState() =>
      _GlorovProductDetailsScreenState();
}

class _GlorovProductDetailsScreenState
    extends State<GlorovProductDetailsScreen> {
  late int _selectedImageIndex;
  late int _quantity;
  GlorovProductVariant? _selectedVariant;
  bool _isAddingToCart = false;

  // Single unified page scroll controller for smooth, responsive desktop & mobile navigation
  final ScrollController _pageScrollController = ScrollController();
  final GlobalKey _rightColumnKey = GlobalKey();
  final GlobalKey _galleryKey = GlobalKey();

  // Pincode estimator state
  final TextEditingController _pincodeController =
      TextEditingController(text: '700059');
  bool _isPincodeChecked = true;
  String _deliveryEstimateText = 'Delivered by: Mon, 2 Nov';

  // Frequently bought together bundle state
  bool _bundleMainChecked = true;
  bool _bundleTrayChecked = true;
  bool _bundleBagChecked = true;

  // Growing lifecycle stages
  int _selectedStageIndex = 0;
  static const List<String> _growingStages = [
    'Germination',
    'Transplanting',
    'Growing',
    'Aftercare',
    'Harvesting',
  ];

  // Dynamic Customer Reviews State
  List<GlorovReview> _reviews = [];
  GlorovReviewSummary? _reviewSummary;
  bool _isLoadingReviews = true;
  String _reviewsSort = 'Most Recent';
  int? _selectedStarFilter;
  bool _photosOnlyFilter = false;

  Future<void> _fetchReviews() async {
    if (!mounted) return;
    setState(() => _isLoadingReviews = true);
    try {
      final summary =
          await GlorovRepositories.reviews.getSummary(widget.product.id);
      final list = await GlorovRepositories.reviews.getReviews(
        widget.product.id,
        sortBy: _reviewsSort,
        starFilter: _selectedStarFilter,
        photosOnly: _photosOnlyFilter,
      );
      if (mounted) {
        setState(() {
          _reviewSummary = summary;
          _reviews = list;
          _isLoadingReviews = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingReviews = false);
      }
    }
  }

  @override
  void initState() {
    super.initState();
    // Guarantee header and announcement bar are visible at the top upon opening any product
    GlorovHeaderScrollNotifier.instance.reset();
    _selectedImageIndex = 0;
    _quantity = 1;
    if (widget.product.variants.isNotEmpty) {
      _selectedVariant = widget.product.variants.first;
    }
    _fetchReviews();
  }

  @override
  void didUpdateWidget(covariant GlorovProductDetailsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.product.id != widget.product.id) {
      GlorovHeaderScrollNotifier.instance.reset();
      _selectedImageIndex = 0;
      _quantity = 1;
      _selectedVariant = widget.product.variants.isNotEmpty
          ? widget.product.variants.first
          : null;
      _selectedStageIndex = 0;
      _fetchReviews();
    }
  }

  @override
  void dispose() {
    _pincodeController.dispose();
    _pageScrollController.dispose();
    super.dispose();
  }

  double get _currentPrice =>
      _selectedVariant?.effectivePrice ?? widget.product.effectivePrice;

  double? get _currentOriginalPrice => _selectedVariant != null
      ? (_selectedVariant!.discountPrice != null
          ? _selectedVariant!.price
          : null)
      : (widget.product.hasDiscount ? widget.product.price : null);

  void _handleAddToCart({bool navigateToCart = false}) {
    if (_isAddingToCart) return;
    setState(() => _isAddingToCart = true);

    GlorovCartState.instance.addToCart(
      widget.product,
      variant: _selectedVariant,
      quantity: _quantity,
    );

    if (navigateToCart) {
      if (mounted) setState(() => _isAddingToCart = false);
      Navigator.pushNamed(context, cartScreenRoute);
      return;
    }

    GlorovFeedback.showSuccessToast(
      context,
      message: 'Added $_quantity x ${widget.product.title} to your bag!',
      actionLabel: 'VIEW BAG',
      onAction: () => Navigator.pushNamed(context, cartScreenRoute),
    );

    Future.delayed(const Duration(milliseconds: 300), () {
      if (mounted) setState(() => _isAddingToCart = false);
    });
  }

  void _handleCheckPincode() {
    final code = _pincodeController.text.trim();
    if (code.length >= 6) {
      setState(() {
        _isPincodeChecked = true;
        _deliveryEstimateText = 'Delivered by: Mon, 2 Nov • Express Dispatch';
      });
    } else {
      setState(() {
        _isPincodeChecked = false;
        _deliveryEstimateText = 'Please enter a valid 6-digit Indian PIN code';
      });
    }
  }

  void _handleAddBundleToCart() {
    int itemsAdded = 0;
    if (_bundleMainChecked) {
      GlorovCartState.instance
          .addToCart(widget.product, variant: _selectedVariant);
      itemsAdded++;
    }
    if (_bundleTrayChecked) {
      final tray = GlorovMockData.products.firstWhere(
        (p) => p.productType == GlorovProductType.supplies,
        orElse: () => widget.product,
      );
      GlorovCartState.instance.addToCart(tray);
      itemsAdded++;
    }
    if (_bundleBagChecked) {
      final bag = GlorovMockData.products.firstWhere(
        (p) => p.category == 'Gardening Essentials',
        orElse: () => widget.product,
      );
      GlorovCartState.instance.addToCart(bag);
      itemsAdded++;
    }

    GlorovFeedback.showSuccessToast(
      context,
      message: 'Added $itemsAdded bundle items to your shopping bag!',
      actionLabel: 'VIEW BAG',
      onAction: () => Navigator.pushNamed(context, cartScreenRoute),
    );
  }

  @override
  Widget build(BuildContext context) {
    final mediaWidth = MediaQuery.of(context).size.width;
    final isSticky = AppBreakpoints.isProductStickyLayout(mediaWidth);

    return GlorovStorefrontScaffold(
      backgroundColor: Colors.white,
      currentRoute: discoverScreenRoute,
      scrollController: _pageScrollController,
      isContentScrollable: true,
      bottomNavigationBar: !isSticky && mediaWidth <= AppBreakpoints.productMobileMax
          ? _buildMobileStickyBottomBar()
          : null,
      child: isSticky
          ? _buildStickyDesktopLayout(context, mediaWidth)
          : _buildStackedLayout(context, mediaWidth),
    );
  }

  // ---------------------------------------------------------------------------
  // Breadcrumbs: Home / Category / Title
  // ---------------------------------------------------------------------------
  Widget _buildBreadcrumbs(BuildContext context) {
    return Container(
      width: double.infinity,
      color: const Color(0xFFF9FAF8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Row(
            children: [
              InkWell(
                onTap: () => Navigator.pushNamed(context, homeScreenRoute),
                child: const Text(
                  'Home',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 6),
                child: Text('/',
                    style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 11)),
              ),
              InkWell(
                onTap: () => Navigator.pushNamed(
                  context,
                  discoverScreenRoute,
                  arguments: widget.product.category,
                ),
                child: Text(
                  widget.product.category,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 6),
                child: Text('/',
                    style: TextStyle(color: Color(0xFF9CA3AF), fontSize: 11)),
              ),
              Flexible(
                child: Text(
                  widget.product.title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Desktop & Landscape Tablet 2-Column Layout (Sticky Gallery + Scrollable Details)
  // ---------------------------------------------------------------------------
  Widget _buildStickyDesktopLayout(BuildContext context, double mediaWidth) {
    final isLargeDesktop = AppBreakpoints.isProductLargeDesktop(mediaWidth);
    final isTabletLandscape =
        AppBreakpoints.isProductTabletLandscape(mediaWidth);

    final double maxContainerWidth = isLargeDesktop
        ? AppBreakpoints.maxLargeDesktopContentWidth
        : (isTabletLandscape ? 1120.0 : 1340.0);

    final double galleryWidth = isLargeDesktop
        ? 620.0
        : (isTabletLandscape ? 410.0 : 520.0);

    final double columnSpacing =
        isLargeDesktop ? 40.0 : (isTabletLandscape ? 24.0 : 32.0);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Top Breadcrumb Bar
        _buildBreadcrumbs(context),

        // Primary 2-Column Buying Section (Left: Sticky Floating Gallery, Right: Main Purchase Details)
        Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxContainerWidth),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: isTabletLandscape ? 18.0 : 24.0,
                vertical: 16.0,
              ),
              child: _buildDesktopTwoColumnBuyingSection(
                context,
                galleryWidth: galleryWidth,
                columnSpacing: columnSpacing,
              ),
            ),
          ),
        ),

        const SizedBox(height: 24),

        // Full-Width Post-Purchase Information Sections
        Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: maxContainerWidth),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: isTabletLandscape ? 18.0 : 24.0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 9. Botanical Growing Lifecycle Stages
                  _buildBotanicalLifecycleTabs(),

                  const SizedBox(height: 36),

                  // 10. Frequently Bought Together Bundle Upsell
                  _buildFrequentlyBoughtTogether(),

                  const SizedBox(height: 36),

                  // 11. "From a seed..." Editorial Brand Story Banner
                  _buildBotanicalStoryBanner(),

                  const SizedBox(height: 40),

                  // 12. "You May Also Like" Related Products
                  _buildYouMayAlsoLikeSection(),

                  const SizedBox(height: 40),

                  // 13. Customer Reviews Section with Ratings Breakdown
                  _buildCustomerReviewsSection(),

                  const SizedBox(height: 40),

                  // 14. Frequently Asked Questions
                  _buildFaqSection(),

                  const SizedBox(height: 48),
                ],
              ),
            ),
          ),
        ),

        // 15. Storefront Footer (Full width at bottom of entire page)
        const GlorovFooter(),
      ],
    );
  }

  /// Two-Column Product Buying Viewport:
  /// Left gallery floats stickily while browsing main buying options,
  /// then seamlessly scrolls up with the page when reaching the full-width discovery sections below.
  Widget _buildDesktopTwoColumnBuyingSection(
    BuildContext context, {
    required double galleryWidth,
    required double columnSpacing,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // LEFT COLUMN: Sticky Product Gallery that floats during the 2-column buying area,
        // and scrolls up smoothly when transitioning to the full-width post-purchase sections.
        SizedBox(
          width: galleryWidth,
          child: AnimatedBuilder(
            animation: _pageScrollController,
            builder: (context, child) {
              double maxTranslation = 0.0;
              final rightContext = _rightColumnKey.currentContext;
              final galleryContext = _galleryKey.currentContext;

              if (rightContext?.findRenderObject() is RenderBox &&
                  galleryContext?.findRenderObject() is RenderBox) {
                final rightBox =
                    rightContext!.findRenderObject() as RenderBox;
                final galleryBox =
                    galleryContext!.findRenderObject() as RenderBox;
                maxTranslation = (rightBox.size.height - galleryBox.size.height)
                    .clamp(0.0, 1500.0);
              } else {
                maxTranslation = 320.0;
              }

              final scrollOffset = _pageScrollController.hasClients
                  ? _pageScrollController.offset
                  : 0.0;
              final translation = scrollOffset.clamp(0.0, maxTranslation);

              return Transform.translate(
                offset: Offset(0, translation),
                child: child,
              );
            },
            child: Container(
              key: _galleryKey,
              child: _buildGallery(context, isSticky: true),
            ),
          ),
        ),

        SizedBox(width: columnSpacing),

        // RIGHT COLUMN: Main Product Buying Information
        Expanded(
          child: Container(
            key: _rightColumnKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 1. Title, Social Proof & Wishlist
                _buildTitleAndSocialProof(),

                const SizedBox(height: 16),

                // 2. Select Packet Size (Variant Selector)
                _buildVariantSelector(),

                const SizedBox(height: 16),

                // 3. Pricing & Taxes (Clean pricing without handwritten gift note)
                _buildPricingSection(),

                const SizedBox(height: 18),

                // 4. "Offers for you:" Coupon Carousel
                _buildOffersCarousel(),

                const SizedBox(height: 20),

                // 5. Quantity Stepper, Add to Cart & Buy Now
                _buildQuantityAndAddToCart(context),

                const SizedBox(height: 20),

                // 6. Delivery Estimate Pincode Checker
                _buildDeliveryEstimatePincode(),

                const SizedBox(height: 24),

                // 7. 3 Botanical Lifecycle Metric Cards
                _buildBotanicalMetricCards(),

                const SizedBox(height: 24),

                // 8. Product Specifications
                _buildProductSpecifications(),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Tablet Portrait & Mobile Stacked Layout (Normal Vertical Page Scrolling)
  // ---------------------------------------------------------------------------
  Widget _buildStackedLayout(BuildContext context, double mediaWidth) {
    final isMobile = mediaWidth <= AppBreakpoints.productMobileMax;
    final isTabletPortrait = !isMobile;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Breadcrumb Bar
        _buildBreadcrumbs(context),

        Center(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: isTabletPortrait ? 760.0 : double.infinity,
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: isTabletPortrait ? 20.0 : 14.0,
                vertical: 8.0,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title on Mobile (rendered above gallery)
                  if (isMobile) ...[
                    _buildTitleAndSocialProof(),
                    const SizedBox(height: 12),
                  ],

                  // Product Gallery (Full Width in stacked layout)
                  _buildGallery(context, isSticky: false),

                  const SizedBox(height: 14),

                  // Title on Tablet Portrait (rendered below gallery)
                  if (!isMobile) ...[
                    _buildTitleAndSocialProof(),
                    const SizedBox(height: 14),
                  ],

                  // 3 Botanical Lifecycle Metric Cards
                  _buildBotanicalMetricCards(),

                  const SizedBox(height: 18),

                  // Select Packet Size (Variant Selector)
                  _buildVariantSelector(),

                  const SizedBox(height: 16),

                  // Pricing & Taxes
                  _buildPricingSection(),

                  const SizedBox(height: 16),

                  // Offers Carousel
                  _buildOffersCarousel(),

                  const SizedBox(height: 16),

                  // Quantity Stepper, Add to Cart & Buy Now
                  _buildQuantityAndAddToCart(context),

                  const SizedBox(height: 18),

                  // Delivery Estimate Pincode Checker
                  _buildDeliveryEstimatePincode(),

                  const SizedBox(height: 20),

                  // Product Specifications
                  _buildProductSpecifications(),

                  const SizedBox(height: 20),

                  // Botanical Growing Lifecycle Stages
                  _buildBotanicalLifecycleTabs(),

                  const SizedBox(height: 24),

                  // Frequently Bought Together Bundle Upsell
                  _buildFrequentlyBoughtTogether(),

                  const SizedBox(height: 24),

                  // "From a seed..." Editorial Brand Story Banner
                  _buildBotanicalStoryBanner(),

                  const SizedBox(height: 24),

                  // "You May Also Like" Related Products
                  _buildYouMayAlsoLikeSection(),

                  const SizedBox(height: 24),

                  // Customer Reviews Section
                  _buildCustomerReviewsSection(),

                  const SizedBox(height: 24),

                  // Frequently Asked Questions
                  _buildFaqSection(),

                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ),

        const SizedBox(height: 32),

        // Storefront Footer
        const GlorovFooter(),
      ],
    );
  }

  // Compatibility aliases
  Widget _buildDesktopLayout(BuildContext context) =>
      _buildStickyDesktopLayout(context, MediaQuery.of(context).size.width);

  Widget _buildMobileLayout(BuildContext context) =>
      _buildStackedLayout(context, MediaQuery.of(context).size.width);

  // ---------------------------------------------------------------------------
  // Component 1: Title & Social Proof Rating Bar
  // ---------------------------------------------------------------------------
  Widget _buildTitleAndSocialProof() {
    return ListenableBuilder(
      listenable: GlorovCartState.instance,
      builder: (context, _) {
        final isWishlisted =
            GlorovCartState.instance.isWishlisted(widget.product.id);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    widget.product.title,
                    style: const TextStyle(
                      fontFamily: 'serif',
                      fontFamilyFallback: [
                        'Georgia',
                        'Cambria',
                        'Playfair Display'
                      ],
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF111827),
                      height: 1.25,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Synchronized Wishlist Toggle with Bounce Tap Feedback
                TapFeedback(
                  key: const ValueKey('pdp_wishlist_toggle'),
                  onTap: () {
                    GlorovCartState.instance.toggleWishlist(widget.product.id);
                    if (!isWishlisted) {
                      GlorovFeedback.showSuccessToast(
                        context,
                        message:
                            'Added ${widget.product.title} to your Wishlist!',
                        actionLabel: 'VIEW',
                        onAction: () =>
                            Navigator.pushNamed(context, bookmarkScreenRoute),
                      );
                    } else {
                      GlorovFeedback.showInfoToast(
                        context,
                        message: 'Removed from your Wishlist',
                      );
                    }
                  },
                  effect: TapAnimationType.bounce,
                  duration: GlorovInteractionConfig.durationFast,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isWishlisted
                          ? const Color(0xFFFEE2E2)
                          : const Color(0xFFF3F4F6),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isWishlisted
                            ? const Color(0xFFFCA5A5)
                            : const Color(0xFFE5E7EB),
                      ),
                    ),
                    child: Icon(
                      isWishlisted
                          ? Icons.favorite
                          : Icons.favorite_border_rounded,
                      size: 20,
                      color: isWishlisted
                          ? const Color(0xFFE11D48)
                          : const Color(0xFF4B5563),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 6,
              runSpacing: 4,
              children: [
                // Star rating
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.star_rounded,
                        size: 18, color: Color(0xFFEAB308)),
                    const SizedBox(width: 3),
                    Text(
                      '${widget.product.rating.toStringAsFixed(1)} (${widget.product.reviewCount} reviews)',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ],
                ),
                const Text('|',
                    style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13)),
                // Social proof badge
                const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.verified, size: 15, color: Color(0xFF16A34A)),
                    SizedBox(width: 4),
                    Text(
                      '1 Crore + Happy Customers',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF15803D),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Component 2: Reusable Production Product Image Gallery with Badges & Zoom
  // ---------------------------------------------------------------------------
  Widget _buildGallery(BuildContext context, {bool isSticky = false}) {
    final images = widget.product.imageUrls.isNotEmpty
        ? widget.product.imageUrls
        : [widget.product.primaryImage];

    final String? badgeText = widget.product.badges.isNotEmpty &&
            widget.product.badges.first.trim().isNotEmpty
        ? widget.product.badges.first.trim().toUpperCase()
        : null;

    return GlorovProductGallery(
      imageUrls: images,
      selectedIndex: _selectedImageIndex,
      onImageSelected: (idx) => setState(() => _selectedImageIndex = idx),
      badgeText: badgeText,
      sowingAdvice: widget.product.sowingDepth != null
          ? 'How to sow: ${widget.product.sowingDepth} • ${widget.product.sunlightRequirement}'
          : null,
      delegateScrollController: _pageScrollController,
      isSticky: isSticky,
    );
  }

  // ---------------------------------------------------------------------------
  // Component 3: 3 Botanical Lifecycle Metric Cards
  // ---------------------------------------------------------------------------
  Widget _buildBotanicalMetricCards() {
    return Row(
      children: [
        Expanded(
          child: _metricCard(
            icon: Icons.eco,
            iconColor: const Color(0xFF16A34A),
            stat: '70%',
            label: 'Germination',
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _metricCard(
            icon: Icons.calendar_month,
            iconColor: const Color(0xFFD97706),
            stat: widget.product.germinationPeriod ?? '3-4 Days',
            label: 'Sprout',
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _metricCard(
            icon: Icons.local_florist,
            iconColor: const Color(0xFFDC2626),
            stat: widget.product.harvestTime ?? '80-90 Days',
            label: 'to Maturity',
          ),
        ),
      ],
    );
  }

  Widget _metricCard({
    required IconData icon,
    required Color iconColor,
    required String stat,
    required String label,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAF8),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        children: [
          Icon(icon, size: 20, color: iconColor),
          const SizedBox(height: 4),
          Text(
            stat,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 10.5,
              fontWeight: FontWeight.w500,
              color: Color(0xFF6B7280),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Component 4: Select Packet Size (Variant Selector)
  // ---------------------------------------------------------------------------
  Widget _buildVariantSelector() {
    final variants = widget.product.variants.isNotEmpty
        ? widget.product.variants
        : [
            GlorovProductVariant(
              id: 'v-1gm',
              name: '1gm',
              price: widget.product.price,
              discountPrice: widget.product.discountPrice,
            ),
            const GlorovProductVariant(
              id: 'v-25gm',
              name: '25GM',
              price: 375,
              discountPrice: 275,
            ),
          ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Packet Size',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          runSpacing: 8,
          children: variants.map((v) {
            final isSelected = (_selectedVariant?.id == v.id) ||
                (_selectedVariant == null && v == variants.first);

            return TapFeedback(
              onTap: () {
                setState(() {
                  _selectedVariant = v;
                });
              },
              effect: TapAnimationType.scale,
              scaleDown: 0.96,
              duration: GlorovInteractionConfig.durationFast,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? const Color(0xFFE8F5E9) : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.forestDeep
                        : const Color(0xFFD1D5DB),
                    width: isSelected ? 1.6 : 1.0,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isSelected) ...[
                      const Icon(Icons.check,
                          size: 14, color: AppColors.forestDeep),
                      const SizedBox(width: 4),
                    ],
                    Flexible(
                      child: Text(
                        v.name,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          fontWeight:
                              isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected
                              ? AppColors.forestDeep
                              : const Color(0xFF374151),
                        ),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '₹${v.effectivePrice.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: isSelected
                            ? AppColors.forestDeep
                            : const Color(0xFF6B7280),
                      ),
                    ),
                  ],
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 5: Pricing & Taxes
  // ---------------------------------------------------------------------------
  Widget _buildPricingSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              '₹${_currentPrice.toStringAsFixed(0)}',
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 30,
                fontWeight: FontWeight.w900,
                color: Color(0xFF111827),
              ),
            ),
            if (_currentOriginalPrice != null) ...[
              const SizedBox(width: 8),
              Text(
                '₹${_currentOriginalPrice!.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 16,
                  color: Color(0xFF9CA3AF),
                  decoration: TextDecoration.lineThrough,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFFEF2F2),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFFFCA5A5)),
                ),
                child: Text(
                  '${widget.product.discountPercent ?? 36}% OFF',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFFDC2626),
                  ),
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 2),
        const Text(
          'Inclusive of all taxes.',
          style: TextStyle(
            fontSize: 12,
            color: Color(0xFF6B7280),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 6: "Offers for you:" Coupon Cards Carousel
  // ---------------------------------------------------------------------------
  Widget _buildOffersCarousel() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Offers for you:',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13.5,
            fontWeight: FontWeight.w700,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 8),
        GlorovYScrollPassThrough(
          child: SizedBox(
            height: 78,
            child: ScrollConfiguration(
              behavior: const GlorovHorizontalScrollBehavior(),
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  GlorovYScrollPassThrough(
                    child: _couponCard(
                      title: 'Get 10% off with welcome coupon',
                      code: 'GLOROV10',
                      subtext: 'Offer applied at checkout',
                    ),
                  ),
                  const SizedBox(width: 10),
                  GlorovYScrollPassThrough(
                    child: _couponCard(
                      title: 'Free shipping on all orders',
                      code: 'FREESHIP',
                      subtext: 'Unlocked on orders above ₹499',
                    ),
                  ),
                  const SizedBox(width: 10),
                  GlorovYScrollPassThrough(
                    child: _couponCard(
                      title: 'Extra 20% off on Seeds',
                      code: 'SEEDS20',
                      subtext: 'Minimum order ₹599',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _couponCard({
    required String title,
    required String code,
    required String subtext,
  }) {
    return Container(
      width: 220,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: Color(0xFF92400E),
            ),
          ),
          const SizedBox(height: 3),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: const Color(0xFFF59E0B)),
                ),
                child: Text(
                  code,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFFB45309),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  subtext,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style:
                      const TextStyle(fontSize: 10, color: Color(0xFF78350F)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Component 7: Quantity Stepper & Green "Add To Cart" Button
  // ---------------------------------------------------------------------------
  Widget _buildQuantityAndAddToCart(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);

    final quantityStepper = Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFD1D5DB)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove, size: 16),
            onPressed:
                _quantity > 1 ? () => setState(() => _quantity--) : null,
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Text(
              '$_quantity',
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 15,
                fontWeight: FontWeight.w700,
                color: Color(0xFF111827),
              ),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.add, size: 16),
            onPressed: () => setState(() => _quantity++),
          ),
        ],
      ),
    );

    final addToCartBtn = ElevatedButton(
      onPressed:
          _isAddingToCart ? null : () => _handleAddToCart(navigateToCart: false),
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.forestDeep, // Signature Green
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14),
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.shopping_bag_outlined, size: 18),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              _isAddingToCart ? 'Adding...' : 'Add To Cart',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 14,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ),
    );

    final buyNowBtn = ElevatedButton(
      onPressed:
          _isAddingToCart ? null : () => _handleAddToCart(navigateToCart: true),
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFFD97706), // Warm Amber
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 14),
        elevation: 1,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
      child: const Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.flash_on, size: 18),
          SizedBox(width: 6),
          Flexible(
            child: Text(
              'Buy Now',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 14,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.2,
              ),
            ),
          ),
        ],
      ),
    );

    return Column(
      children: [
        if (isDesktop)
          Row(
            children: [
              quantityStepper,
              const SizedBox(width: 12),
              Expanded(flex: 5, child: addToCartBtn),
              const SizedBox(width: 8),
              Expanded(flex: 4, child: buyNowBtn),
            ],
          )
        else ...[
          Row(
            children: [
              quantityStepper,
              const SizedBox(width: 10),
              Expanded(child: addToCartBtn),
            ],
          ),
          const SizedBox(height: 10),
          SizedBox(
            width: double.infinity,
            child: buyNowBtn,
          ),
        ],

        const SizedBox(height: 8),

        // Sale callout banner (Video frame 5 style)
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFECFDF5),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: const Color(0xFFA7F3D0)),
          ),
          child: const Row(
            children: [
              Icon(Icons.bolt, size: 16, color: Color(0xFF059669)),
              SizedBox(width: 4),
              Flexible(
                child: Text(
                  'Additional ₹100 OFF on app is live • Pan-India Botanical Delivery',
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF065F46),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 8: Delivery Estimate Pincode Checker (Video frame 5 style)
  // ---------------------------------------------------------------------------
  Widget _buildDeliveryEstimatePincode() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAF8),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.local_shipping_outlined,
                  size: 18, color: AppColors.forestDeep),
              SizedBox(width: 6),
              Text(
                'Delivery Estimate',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF111827),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFD1D5DB)),
                  ),
                  child: TextField(
                    controller: _pincodeController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(
                        fontSize: 13, fontWeight: FontWeight.w600),
                    decoration: const InputDecoration(
                      hintText: 'Enter 6-digit Pincode',
                      hintStyle:
                          TextStyle(fontSize: 12, color: Color(0xFF9CA3AF)),
                      border: InputBorder.none,
                      contentPadding:
                          EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              TapFeedback(
                onTap: _handleCheckPincode,
                effect: TapAnimationType.scale,
                scaleDown: 0.92,
                duration: GlorovInteractionConfig.durationFast,
                child: Container(
                  height: 38,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.forestDeep,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'CHECK',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(
                _isPincodeChecked ? Icons.check_circle : Icons.error_outline,
                size: 14,
                color: _isPincodeChecked ? const Color(0xFF16A34A) : Colors.red,
              ),
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  _deliveryEstimateText,
                  style: TextStyle(
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: _isPincodeChecked
                        ? const Color(0xFF15803D)
                        : Colors.red,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Component 9: 5-Stage Botanical Lifecycle Growing Tabs (Video frame 6 style)
  // ---------------------------------------------------------------------------
  Widget _buildBotanicalLifecycleTabs() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tab Pills
        GlorovYScrollPassThrough(
          child: SizedBox(
            height: 36,
            child: ScrollConfiguration(
              behavior: const GlorovHorizontalScrollBehavior(),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _growingStages.length,
                itemBuilder: (context, idx) {
                  final stage = _growingStages[idx];
                  final isSel = idx == _selectedStageIndex;
                  return GlorovYScrollPassThrough(
                    child: TapFeedback(
                      onTap: () => setState(() => _selectedStageIndex = idx),
                      effect: TapAnimationType.scale,
                      scaleDown: 0.94,
                      duration: GlorovInteractionConfig.durationFast,
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding:
                            const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                        decoration: BoxDecoration(
                          color:
                              isSel ? AppColors.forestDeep : const Color(0xFFF3F4F6),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Center(
                          child: Text(
                            stage,
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: isSel ? Colors.white : const Color(0xFF4B5563),
                            ),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Stage description card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF9FAF8),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Stage ${_selectedStageIndex + 1}: ${_growingStages[_selectedStageIndex]}',
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.forestDeep,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                _getStageDescription(_selectedStageIndex),
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12.5,
                  height: 1.5,
                  color: Color(0xFF374151),
                ),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  _certBadge('🌱 Non-GMO Certified'),
                  _certBadge('🇮🇳 Made in India'),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _certBadge(String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: const Color(0xFFD1D5DB)),
      ),
      child: Text(
        label,
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          color: Color(0xFF1E293B),
        ),
      ),
    );
  }

  String _getStageDescription(int idx) {
    switch (idx) {
      case 0:
        return 'Sow seeds 1/4 inch deep in seed-starter coco peat mix. Keep moist with gentle daily misting. Germination starts within 3-4 days at 20-28°C.';
      case 1:
        return 'Once seedlings develop 2-3 sets of true leaves, gently transplant them into individual 6-inch planters or seedling trays with organic compost.';
      case 2:
        return 'Provide 6+ hours of direct morning sunlight. Water weekly or when the top 1 inch of soil feels dry to the touch.';
      case 3:
        return 'Pinch terminal shoots once to encourage lateral branching and thicker foliage. Feed with seaweed liquid fertilizer every 15 days.';
      case 4:
        return 'Expect continuous flowering from day 65 to 90. Deadhead spent blooms regularly to promote continuous fresh bud formation.';
      default:
        return 'Follow standard GLOROV botanical care protocols for optimal harvest vigor.';
    }
  }

  // ---------------------------------------------------------------------------
  // Component 10: Frequently Bought Together Bundle Upsell (Video frame 6 & 7)
  // ---------------------------------------------------------------------------
  Widget _buildFrequentlyBoughtTogether() {
    double total = 0.0;
    if (_bundleMainChecked) total += _currentPrice;
    if (_bundleTrayChecked) total += 295.0;
    if (_bundleBagChecked) total += 449.0;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Frequently bought together',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 15,
              fontWeight: FontWeight.w800,
              color: Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 12),

          // 3 Bundle Items
          _bundleItemRow(
            checked: _bundleMainChecked,
            onChanged: (v) => setState(() => _bundleMainChecked = v ?? false),
            title: widget.product.title,
            price: _currentPrice,
            image: widget.product.primaryImage,
          ),
          const Divider(height: 16, color: Color(0xFFF3F4F6)),
          _bundleItemRow(
            checked: _bundleTrayChecked,
            onChanged: (v) => setState(() => _bundleTrayChecked = v ?? false),
            title: 'Reusable 104 Holes Seedling Tray',
            price: 295,
            image:
                'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=400&q=80',
          ),
          const Divider(height: 16, color: Color(0xFFF3F4F6)),
          _bundleItemRow(
            checked: _bundleBagChecked,
            onChanged: (v) => setState(() => _bundleBagChecked = v ?? false),
            title: 'HDPE Round Grow Bag (Set of 3)',
            price: 449,
            image:
                'https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=400&q=80',
          ),

          const SizedBox(height: 14),

          // Total Price & Add to Cart button
          Wrap(
            alignment: WrapAlignment.spaceBetween,
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 12,
            runSpacing: 10,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Total Amount',
                      style: TextStyle(fontSize: 11, color: Color(0xFF6B7280))),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '₹${total.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 20,
                          fontWeight: FontWeight.w900,
                          color: Color(0xFF111827),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '₹${(total * 1.25).toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: Color(0xFF9CA3AF),
                          decoration: TextDecoration.lineThrough,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              ElevatedButton(
                onPressed: _handleAddBundleToCart,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.forestDeep,
                  foregroundColor: Colors.white,
                  padding:
                      const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Add to Cart',
                        style: TextStyle(
                            fontWeight: FontWeight.w700, fontSize: 13)),
                    SizedBox(width: 4),
                    Icon(Icons.chevron_right, size: 16),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _bundleItemRow({
    required bool checked,
    required ValueChanged<bool?> onChanged,
    required String title,
    required double price,
    required String image,
  }) {
    return Row(
      children: [
        SizedBox(
          width: 24,
          height: 24,
          child: Checkbox(
            value: checked,
            activeColor: AppColors.forestDeep,
            onChanged: onChanged,
          ),
        ),
        const SizedBox(width: 8),
        ClipRRect(
          borderRadius: BorderRadius.circular(6),
          child: Image.network(
            image,
            width: 42,
            height: 42,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => Container(
              width: 42,
              height: 42,
              color: const Color(0xFFE5E7EB),
              child: const Icon(Icons.yard, size: 20, color: Color(0xFF9CA3AF)),
            ),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: Color(0xFF1F2937)),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          '₹${price.toStringAsFixed(0)}',
          style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w800,
              color: Color(0xFF111827)),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 11: "From a seed..." Editorial Brand Story Banner (Video frame 7 & 8)
  // ---------------------------------------------------------------------------
  Widget _buildBotanicalStoryBanner() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F6F0),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8DD)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  color: AppColors.forestDeep,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(Icons.spa, size: 16, color: Color(0xFFD8F3DC)),
                ),
              ),
              const SizedBox(width: 10),
              const Text(
                'From a seed...',
                style: TextStyle(
                  fontFamily: 'serif',
                  fontFamilyFallback: ['Georgia', 'serif'],
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  fontStyle: FontStyle.italic,
                  color: AppColors.forestDeep,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'A tiny seed, your own hands, a little patience, and it becomes something you can eat, smell, or simply admire. A small ritual in your space that grows into something much more.',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              height: 1.5,
              color: Color(0xFF374151),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Your harvest, your hands care. No chemicals, clean veggies, fruits, or blooms.',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: Color(0xFF1E293B),
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Component 12: "You May Also Like" Related Products (Video frame 10 & 11)
  // ---------------------------------------------------------------------------
  Widget _buildYouMayAlsoLikeSection() {
    final related = GlorovMockData.products
        .where((p) => p.id != widget.product.id)
        .take(6)
        .toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'You may also like',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 14),
        GlorovYScrollPassThrough(
          child: SizedBox(
            height: 310,
            child: ScrollConfiguration(
              behavior: const GlorovHorizontalScrollBehavior(),
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: related.length,
                itemBuilder: (context, idx) {
                  final prod = related[idx];
                  return GlorovYScrollPassThrough(
                    child: Container(
                      width: 200,
                      margin: const EdgeInsets.only(right: 14),
                      child: GlorovProductCard(
                        product: prod,
                        onTap: () {
                          Navigator.pushReplacementNamed(
                            context,
                            productDetailsScreenRoute,
                            arguments: prod,
                          );
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 13: Database-Connected Ratings & Reviews with AI Summary
  // ---------------------------------------------------------------------------
  Widget _buildCustomerReviewsSection() {
    final double avgRating =
        _reviewSummary?.averageRating ?? widget.product.rating;
    final int totalCount =
        _reviewSummary?.totalReviews ?? widget.product.reviewCount;

    // Collect all customer review photos across reviews
    final List<String> allReviewImages = [];
    for (final r in _reviews) {
      for (final img in r.images) {
        if (!allReviewImages.contains(img)) {
          allReviewImages.add(img);
        }
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Header Row
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 12,
          runSpacing: 10,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Ratings & Reviews',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF111827),
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    ...List.generate(
                      5,
                      (i) => Icon(
                        i < avgRating.floor()
                            ? Icons.star_rounded
                            : (i < avgRating
                                ? Icons.star_half_rounded
                                : Icons.star_border_rounded),
                        size: 18,
                        color: const Color(0xFFEAB308),
                      ),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '${avgRating.toStringAsFixed(1)} ($totalCount reviews)',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            OutlinedButton.icon(
              onPressed: _showWriteReviewDialog,
              icon: const Icon(Icons.rate_review_outlined, size: 16),
              label: const Text('Write a review',
                  style:
                      TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.forestDeep,
                side: const BorderSide(color: AppColors.forestDeep),
                padding:
                    const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8)),
              ),
            ),
          ],
        ),

        const SizedBox(height: 16),

        // 2. Interactive Ratings Breakdown & Aggregate Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE5E7EB)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Wrap(
                alignment: WrapAlignment.spaceBetween,
                crossAxisAlignment: WrapCrossAlignment.center,
                spacing: 20,
                runSpacing: 16,
                children: [
                  // Overall Big Score
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            avgRating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 36,
                              fontWeight: FontWeight.w800,
                              color: Color(0xFF111827),
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Text(
                            '/ 5',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF6B7280),
                            ),
                          ),
                        ],
                      ),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: List.generate(
                          5,
                          (i) => Icon(
                            i < avgRating.floor()
                                ? Icons.star_rounded
                                : (i < avgRating
                                    ? Icons.star_half_rounded
                                    : Icons.star_border_rounded),
                            size: 20,
                            color: const Color(0xFFEAB308),
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Based on $totalCount verified reviews',
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11.5,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),

                  // 5-Star to 1-Star Rating Bars
                  ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 320),
                    child: Column(
                      children: [5, 4, 3, 2, 1].map((star) {
                        final count = _reviewSummary?.getCountForStar(star) ?? 0;
                        final double pct =
                            _reviewSummary?.getPercentageForStar(star) ??
                                (star == 5
                                    ? 0.78
                                    : (star == 4 ? 0.16 : 0.02));
                        final bool isSelected = _selectedStarFilter == star;

                        return InkWell(
                          onTap: () {
                            setState(() {
                              _selectedStarFilter =
                                  _selectedStarFilter == star ? null : star;
                            });
                            _fetchReviews();
                          },
                          borderRadius: BorderRadius.circular(6),
                          child: Padding(
                            padding: const EdgeInsets.symmetric(vertical: 2.5),
                            child: Row(
                              children: [
                                SizedBox(
                                  width: 28,
                                  child: Text(
                                    '$star ★',
                                    style: TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontSize: 11.5,
                                      fontWeight: isSelected
                                          ? FontWeight.w800
                                          : FontWeight.w600,
                                      color: isSelected
                                          ? AppColors.forestDeep
                                          : const Color(0xFF374151),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(4),
                                    child: LinearProgressIndicator(
                                      value: pct,
                                      minHeight: 7,
                                      backgroundColor: const Color(0xFFF3F4F6),
                                      valueColor:
                                          AlwaysStoppedAnimation<Color>(
                                        isSelected
                                            ? AppColors.forestDeep
                                            : const Color(0xFF16A34A),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                SizedBox(
                                  width: 38,
                                  child: Text(
                                    count > 0 ? '$count' : '${(pct * 100).toInt()}%',
                                    textAlign: TextAlign.right,
                                    style: TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontSize: 11,
                                      fontWeight: isSelected
                                          ? FontWeight.w700
                                          : FontWeight.w500,
                                      color: isSelected
                                          ? AppColors.forestDeep
                                          : const Color(0xFF6B7280),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ],
              ),

              // Active filter indicator if star filter selected
              if (_selectedStarFilter != null) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: const Color(0xFFA7F3D0)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Showing only $_selectedStarFilter ★ reviews',
                            style: const TextStyle(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF065F46),
                            ),
                          ),
                          const SizedBox(width: 6),
                          InkWell(
                            onTap: () {
                              setState(() => _selectedStarFilter = null);
                              _fetchReviews();
                            },
                            child: const Icon(Icons.close_rounded,
                                size: 14, color: Color(0xFF065F46)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),

        const SizedBox(height: 14),

        // 3. "Why customers love this" Dynamic AI Summary Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF), // Soft blue tint
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: const Color(0xFFBFDBFE)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.auto_awesome,
                      size: 16, color: Color(0xFF2563EB)),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      _reviewSummary?.aiSummaryTitle ??
                          'Why customers love this',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1E40AF),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              Text(
                _reviewSummary?.aiSummaryText ??
                    'Customers consistently praise this botanical product for its exceptional quality, packaging integrity, and vigorous growth. Reviewers highlight high satisfaction and great results.',
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12.5,
                  height: 1.5,
                  color: Color(0xFF1E3A8A),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                '✨ Summarized and selected by AI from recent customer reviews',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 10.5,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF3B82F6),
                ),
              ),
            ],
          ),
        ),

        // 4. Customer Review Photos Carousel (if available)
        if (allReviewImages.isNotEmpty) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.photo_library_outlined,
                  size: 16, color: Color(0xFF374151)),
              const SizedBox(width: 6),
              Text(
                'Customer Photos (${allReviewImages.length})',
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13.5,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF1F2937),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 76,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: allReviewImages.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                final imgUrl = allReviewImages[idx];
                return InkWell(
                  onTap: () => _showImageLightbox(imgUrl, 'Customer Photo #${idx + 1}'),
                  borderRadius: BorderRadius.circular(8),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Container(
                      width: 76,
                      height: 76,
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                      ),
                      child: imgUrl.startsWith('assets/')
                          ? Image.asset(imgUrl, fit: BoxFit.cover)
                          : Image.network(
                              imgUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                  Icons.image_not_supported_outlined,
                                  size: 20,
                                  color: Color(0xFF9CA3AF)),
                            ),
                    ),
                  ),
                );
              },
            ),
          ),
        ],

        const SizedBox(height: 16),

        // 5. Filter Chips & Sort Controls Toolbar
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 10,
          runSpacing: 10,
          children: [
            // Filter Pills
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _filterChip('All', _selectedStarFilter == null && !_photosOnlyFilter, () {
                  setState(() {
                    _selectedStarFilter = null;
                    _photosOnlyFilter = false;
                  });
                  _fetchReviews();
                }),
                _filterChip('5 ★', _selectedStarFilter == 5, () {
                  setState(() {
                    _selectedStarFilter = _selectedStarFilter == 5 ? null : 5;
                  });
                  _fetchReviews();
                }),
                _filterChip('4 ★', _selectedStarFilter == 4, () {
                  setState(() {
                    _selectedStarFilter = _selectedStarFilter == 4 ? null : 4;
                  });
                  _fetchReviews();
                }),
                _filterChip('Photos 📷', _photosOnlyFilter, () {
                  setState(() {
                    _photosOnlyFilter = !_photosOnlyFilter;
                  });
                  _fetchReviews();
                }),
              ],
            ),

            // Sort Dropdown
            PopupMenuButton<String>(
              initialValue: _reviewsSort,
              tooltip: 'Sort reviews',
              onSelected: (val) {
                setState(() {
                  _reviewsSort = val;
                });
                _fetchReviews();
              },
              itemBuilder: (context) => const [
                PopupMenuItem(value: 'Most Recent', child: Text('Most Recent')),
                PopupMenuItem(
                    value: 'Highest Rating', child: Text('Highest Rating')),
                PopupMenuItem(
                    value: 'Lowest Rating', child: Text('Lowest Rating')),
                PopupMenuItem(
                    value: 'With Photos', child: Text('With Photos')),
              ],
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD1D5DB)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _reviewsSort,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF374151),
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.keyboard_arrow_down, size: 16),
                  ],
                ),
              ),
            ),
          ],
        ),

        const SizedBox(height: 14),

        // 6. Dynamic Customer Reviews List
        if (_isLoadingReviews)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 32),
            child: Center(
              child: SizedBox(
                width: 28,
                height: 28,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(AppColors.forestDeep),
                ),
              ),
            ),
          )
        else if (_reviews.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Column(
              children: [
                const Icon(Icons.rate_review_outlined,
                    size: 36, color: Color(0xFF9CA3AF)),
                const SizedBox(height: 8),
                const Text(
                  'No reviews matching your filter',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF374151),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Try resetting filters or be the first to share your experience.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _selectedStarFilter = null;
                      _photosOnlyFilter = false;
                    });
                    _fetchReviews();
                  },
                  child: const Text('Reset Filters'),
                ),
              ],
            ),
          )
        else
          Column(
            children: [
              ..._reviews.map((rev) => Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: _databaseReviewCard(rev),
                  )),
              const SizedBox(height: 6),
              Center(
                child: TextButton.icon(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      productReviewsScreenRoute,
                      arguments: widget.product,
                    );
                  },
                  icon: const Icon(Icons.arrow_forward_rounded,
                      size: 16, color: AppColors.forestDeep),
                  label: Text(
                    'View all $totalCount verified customer reviews',
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDeep,
                    ),
                  ),
                ),
              ),
            ],
          ),
      ],
    );
  }

  Widget _filterChip(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.forestDeep : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.forestDeep : const Color(0xFFD1D5DB),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF374151),
          ),
        ),
      ),
    );
  }

  Widget _databaseReviewCard(GlorovReview review) {
    // Generate initials for avatar circle
    final names = review.author.trim().split(' ');
    final initials = names.isNotEmpty
        ? (names.length > 1
            ? '${names.first[0]}${names.last[0]}'
            : names.first[0])
        : 'VB';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Author Header Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: const Color(0xFFE0E7FF),
                      child: Text(
                        initials.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 10.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF3730A3),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            review.author,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827),
                            ),
                          ),
                          if (review.isVerified)
                            const Row(
                              children: [
                                Icon(Icons.verified,
                                    size: 12, color: Color(0xFF16A34A)),
                                SizedBox(width: 2),
                                Text(
                                  'Verified Buyer',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF15803D),
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
              const SizedBox(width: 8),
              Text(
                review.date,
                style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Rating Stars & Title
          Row(
            children: [
              ...List.generate(
                5,
                (i) => Icon(
                  i < review.rating
                      ? Icons.star_rounded
                      : Icons.star_border_rounded,
                  size: 15,
                  color: const Color(0xFF16A34A),
                ),
              ),
              const SizedBox(width: 6),
              if (review.title.isNotEmpty)
                Expanded(
                  child: Text(
                    review.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 6),

          // Review Content
          Text(
            review.content,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12.5,
              height: 1.5,
              color: Color(0xFF374151),
            ),
          ),

          // Customer Review Photos (if any)
          if (review.hasImages) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: review.images.map((img) {
                return InkWell(
                  onTap: () => _showImageLightbox(
                      img, review.title.isNotEmpty ? review.title : 'Customer Photo'),
                  borderRadius: BorderRadius.circular(6),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                      ),
                      child: img.startsWith('assets/')
                          ? Image.asset(img, fit: BoxFit.cover)
                          : Image.network(
                              img,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(
                                  Icons.image_not_supported_outlined,
                                  size: 18,
                                  color: Color(0xFF9CA3AF)),
                            ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],

          // Seller Reply (if available)
          if (review.hasSellerReply) ...[
            const SizedBox(height: 10),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(6),
                border: const Border(
                  left: BorderSide(color: AppColors.forestDeep, width: 3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'GLOROV Botanical Team',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDeep,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    review.sellerReply!,
                    style: const TextStyle(
                      fontSize: 11.5,
                      height: 1.4,
                      color: Color(0xFF4B5563),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 10),

          // Helpful Action Button
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              InkWell(
                onTap: () async {
                  await GlorovRepositories.reviews.markHelpful(review.id);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Thank you! Helpful vote recorded.'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                    _fetchReviews();
                  }
                },
                borderRadius: BorderRadius.circular(4),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        review.isHelpfulTapped
                            ? Icons.thumb_up_alt_rounded
                            : Icons.thumb_up_alt_outlined,
                        size: 14,
                        color: review.isHelpfulTapped
                            ? AppColors.forestDeep
                            : const Color(0xFF6B7280),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Helpful (${review.helpfulCount})',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: review.isHelpfulTapped
                              ? AppColors.forestDeep
                              : const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Dialog: Interactive Write a Review Modal
  // ---------------------------------------------------------------------------
  void _showWriteReviewDialog() {
    int selectedRating = 5;
    final nameCtrl = TextEditingController();
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    final photoUrlCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            const ratingLabels = {
              1: '1 - Poor',
              2: '2 - Fair',
              3: '3 - Average',
              4: '4 - Good',
              5: '5 - Excellent'
            };

            return AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
              contentPadding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
              title: Row(
                children: [
                  const Icon(Icons.rate_review,
                      color: AppColors.forestDeep, size: 22),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Review ${widget.product.title}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                      ),
                    ),
                  ),
                ],
              ),
              content: SizedBox(
                width: 440,
                child: SingleChildScrollView(
                  child: Form(
                    key: formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Star Rating Picker
                        const Text(
                          'Your Overall Rating *',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF374151),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            ...List.generate(5, (index) {
                              final starVal = index + 1;
                              return InkWell(
                                onTap: () {
                                  setDialogState(() {
                                    selectedRating = starVal;
                                  });
                                },
                                child: Padding(
                                  padding: const EdgeInsets.only(right: 4),
                                  child: Icon(
                                    starVal <= selectedRating
                                        ? Icons.star_rounded
                                        : Icons.star_border_rounded,
                                    size: 32,
                                    color: const Color(0xFFEAB308),
                                  ),
                                ),
                              );
                            }),
                            const SizedBox(width: 8),
                            Text(
                              ratingLabels[selectedRating] ?? '',
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF4B5563),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 14),

                        // Name Field
                        TextFormField(
                          controller: nameCtrl,
                          decoration: InputDecoration(
                            labelText: 'Your Full Name *',
                            hintText: 'e.g. Shalini Mukherjee',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Please enter your name';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 12),

                        // Title Field
                        TextFormField(
                          controller: titleCtrl,
                          decoration: InputDecoration(
                            labelText: 'Review Headline *',
                            hintText: 'e.g. Great germination vigor!',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Please provide a short headline';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 12),

                        // Detailed Content Field
                        TextFormField(
                          controller: contentCtrl,
                          maxLines: 3,
                          decoration: InputDecoration(
                            labelText: 'Detailed Experience *',
                            hintText:
                                'Share details about growth, soil mix, packaging, and care results...',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.all(12),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().length < 8) {
                              return 'Please write at least 8 characters';
                            }
                            return null;
                          },
                        ),

                        const SizedBox(height: 12),

                        // Photo URL / Asset (optional)
                        TextFormField(
                          controller: photoUrlCtrl,
                          decoration: InputDecoration(
                            labelText: 'Photo Link or Asset Path (Optional)',
                            hintText: 'e.g. assets/images/products/... or http://...',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
              actions: [
                TextButton(
                  onPressed: isSubmitting ? null : () => Navigator.pop(ctx),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          if (formKey.currentState?.validate() ?? false) {
                            setDialogState(() => isSubmitting = true);

                            // Strict competitor brand sanitization on input
                            String cleanTitle = titleCtrl.text.trim();
                            String cleanContent = contentCtrl.text.trim();
                            final brandRegex = RegExp(
                                r'\b(ugaoo|trustbasket|trust\s*basket|nurserylive|nursery\s*live|amazon|flipkart|kraft\s*seeds)\b',
                                caseSensitive: false);
                            cleanTitle =
                                cleanTitle.replaceAll(brandRegex, 'GLOROV');
                            cleanContent =
                                cleanContent.replaceAll(brandRegex, 'GLOROV');

                            final now = DateTime.now();
                            final dateStr =
                                '${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}';

                            final newReview = GlorovReview(
                              id: 'rev_${widget.product.id}_${now.millisecondsSinceEpoch}',
                              productId: widget.product.id,
                              author: nameCtrl.text.trim(),
                              date: dateStr,
                              rating: selectedRating,
                              title: cleanTitle,
                              content: cleanContent,
                              isVerified: true,
                              helpfulCount: 0,
                              images: photoUrlCtrl.text.trim().isNotEmpty
                                  ? [photoUrlCtrl.text.trim()]
                                  : [],
                              sellerReply:
                                  'GLOROV Care Team: Thank you for growing with GLOROV botanical standards!',
                            );

                            await GlorovRepositories.reviews
                                .addReview(newReview);

                            if (mounted) {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                      'Review submitted successfully! Thank you for your feedback.'),
                                  backgroundColor: AppColors.forestDeep,
                                ),
                              );
                              _fetchReviews();
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDeep,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8)),
                  ),
                  child: isSubmitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Submit Review'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Dialog: Full-Screen Customer Photo Lightbox Viewer
  // ---------------------------------------------------------------------------
  void _showImageLightbox(String imageUrl, String title) {
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.black.withOpacity(0.92),
          insetPadding: const EdgeInsets.all(16),
          child: Stack(
            alignment: Alignment.center,
            children: [
              InteractiveViewer(
                minScale: 0.8,
                maxScale: 3.5,
                child: imageUrl.startsWith('assets/')
                    ? Image.asset(imageUrl, fit: BoxFit.contain)
                    : Image.network(imageUrl, fit: BoxFit.contain),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: IconButton(
                  onPressed: () => Navigator.pop(ctx),
                  icon: const Icon(Icons.close_rounded,
                      color: Colors.white, size: 28),
                ),
              ),
              Positioned(
                bottom: 16,
                left: 16,
                right: 16,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.65),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ---------------------------------------------------------------------------
  // Component: Product Specifications Table (Botanical Data)
  // ---------------------------------------------------------------------------
  Widget _buildProductSpecifications() {
    final specs = <MapEntry<String, String>>[
      MapEntry(
        'Botanical Name',
        widget.product.botanicalName.isNotEmpty
            ? widget.product.botanicalName
            : 'Capsicum annuum',
      ),
      MapEntry('Category', widget.product.category),
      MapEntry('Sowing Depth', widget.product.sowingDepth ?? '1 - 2 cm'),
      MapEntry('Germination Time',
          widget.product.germinationPeriod ?? '6 - 10 Days'),
      MapEntry('Sunlight Requirement', widget.product.sunlightRequirement),
      MapEntry('Watering Schedule', widget.product.wateringNeeds),
      MapEntry('Difficulty Level', widget.product.difficultyLevel),
      MapEntry('Season / Planting',
          widget.product.plantingSeason ?? 'Year Round / All Seasons'),
      if (widget.product.harvestTime != null)
        MapEntry('Days to Harvest', widget.product.harvestTime!),
      if (widget.product.packContents != null)
        MapEntry('Pack Contents', widget.product.packContents!),
    ];

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAF8),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.format_list_bulleted,
                  size: 18, color: AppColors.forestDeep),
              SizedBox(width: 8),
              Flexible(
                child: Text(
                  'Product Specifications',
                  style: TextStyle(
                    fontFamily: 'serif',
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, color: Color(0xFFE5E7EB)),
          const SizedBox(height: 8),
          ...specs.map((s) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 5.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 4,
                      child: Text(
                        s.key,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6B7280),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      flex: 6,
                      child: Text(
                        s.value,
                        style: const TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Component: Frequently Asked Questions Accordion
  // ---------------------------------------------------------------------------
  Widget _buildFaqSection() {
    final faqs = [
      MapEntry(
        'When is the best time to sow ${widget.product.title}?',
        'Plant seeds during ${widget.product.plantingSeason ?? "mild sunny weather"}. They thrive in ${widget.product.sunlightRequirement.toLowerCase()} with well-drained, aerated potting soil.',
      ),
      MapEntry(
        'How deep should I sow the seeds?',
        'Sow seeds at a depth of ${widget.product.sowingDepth ?? "1-2 cm"}. Gently cover with fine soil mix and mist lightly with water to keep the soil moist without displacing the seeds.',
      ),
      MapEntry(
        'How often should I water the seedling?',
        'Follow a ${widget.product.wateringNeeds.toLowerCase()} routine. Keep the upper layer moist during germination, then water only when the top 1 inch of soil feels dry to the touch.',
      ),
      MapEntry(
        'What is GLOROV\'s guarantee & replacement policy?',
        'All GLOROV botanical seeds and plants are protected by our 100% "Arrives Healthy" guarantee. In the rare event of damage or non-germination, we provide free replacement support.',
      ),
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.help_outline, size: 20, color: AppColors.forestDeep),
            SizedBox(width: 8),
            Flexible(
              child: Text(
                'Frequently Asked Questions',
                style: TextStyle(
                  fontFamily: 'serif',
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.forestDeep,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        ...faqs.map((f) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: const Color(0xFFE5E7EB)),
              ),
              child: Material(
                color: Colors.white,
                borderRadius: BorderRadius.circular(10),
                child: Theme(
                  data: Theme.of(context)
                      .copyWith(dividerColor: Colors.transparent),
                  child: ExpansionTile(
                    title: Text(
                      f.key,
                      style: const TextStyle(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(
                            left: 16, right: 16, bottom: 14),
                        child: Text(
                          f.value,
                          style: const TextStyle(
                            fontSize: 12.5,
                            height: 1.5,
                            color: Color(0xFF4B5563),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            )),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 14: Mobile Sticky Bottom Bar (Video frame 10 & 11 style)
  // ---------------------------------------------------------------------------
  Widget _buildMobileStickyBottomBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB), width: 1)),
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
                GlorovCounter(
                  value: _currentPrice,
                  prefix: '₹',
                  mode: CounterAnimationMode.count,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 22,
                    fontWeight: FontWeight.w900,
                    color: Color(0xFF111827),
                  ),
                ),
                Text(
                  _selectedVariant?.name ?? '1gm Pack',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: _isAddingToCart
                    ? null
                    : () => _handleAddToCart(navigateToCart: false),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.forestDeep, // Signature Green
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  elevation: 1,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
                child: Text(
                  _isAddingToCart ? 'ADDING...' : 'ADD TO CART',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.4,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
