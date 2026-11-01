import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../components/common/glorov_y_scroll_pass_through.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/product/glorov_product_card.dart';
import '../../components/product/glorov_product_gallery.dart';
import '../../core/icons/glorov_custom_icons.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_offer.dart';
import '../../models/glorov/glorov_product.dart';
import '../../models/glorov/glorov_review.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/glorov_header_scroll_notifier.dart';
import '../../services/meta/glorov_meta_service.dart';

/// GLOROV Production-Grade Product Details & Ordering Screen
/// Matches the authentic mobile & desktop ordering experience:
/// - Breadcrumbs & clean verified rating/reviews
/// - Square product gallery with dynamic docked promotional badge and sowing advice overlay
/// - Contextual Botanical Lifecycle Metric Cards tailored to seeds, plants, or supplies
/// - Variant size selection chips
/// - Live pricing with tax note & clean discount breakdown
/// - Backend-connected "Offers for you:" coupon cards carousel
/// - Quantity selector & green "Add To Cart" button
/// - Pincode delivery estimator with dynamic date calculation
/// - Botanical growing tabs for seeds & live plants
/// - "Frequently bought together" 3-item bundle upsell with live total & 1-tap cart addition
/// - Editorial botanical story banner
/// - Backend-connected related product recommendations
/// - Customer ratings with AI summary & reviews
/// - Sticky mobile bottom bar with price and green ADD TO CART button
class GlorovProductDetailsScreen extends StatefulWidget {
  final GlorovProduct product;
  final bool isLoading;

  const GlorovProductDetailsScreen({
    super.key,
    required this.product,
    this.isLoading = false,
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
  double _lastRightColumnHeight = 0.0;
  double _lastGalleryHeight = 0.0;

  double _getWidgetHeight(GlobalKey key, bool isRight) {
    final ctx = key.currentContext;
    if (ctx != null) {
      final renderBox = ctx.findRenderObject() as RenderBox?;
      if (renderBox != null && renderBox.hasSize && renderBox.size.height > 0) {
        if (isRight) {
          _lastRightColumnHeight = renderBox.size.height;
        } else {
          _lastGalleryHeight = renderBox.size.height;
        }
        return renderBox.size.height;
      }
    }
    return isRight ? _lastRightColumnHeight : _lastGalleryHeight;
  }

  // Dynamic Sticky Cart Bar visibility (only shown when scrolled past in-page button)
  bool _showStickyBottomBar = false;
  final GlobalKey _inPageCartKey = GlobalKey();

  // Multi-attribute variant selection state (Plant Size, Planter, Color)
  String? _selectedPlantSize;
  String? _selectedPlanterName;
  String? _selectedColorName;

  // Gift option & accordion state
  bool _isGiftOptionSelected = false;
  bool _isSpecsExpanded = false;

  void _onPageScroll() {
    if (!mounted) return;

    final ctx = _inPageCartKey.currentContext;
    if (ctx != null) {
      final box = ctx.findRenderObject() as RenderBox?;
      if (box != null && box.hasSize) {
        final pos = box.localToGlobal(Offset.zero);
        final isPast = (pos.dy + box.size.height) < 120;
        if (isPast != _showStickyBottomBar) {
          setState(() {
            _showStickyBottomBar = isPast;
          });
        }
        return;
      }
    }

    if (_pageScrollController.hasClients) {
      final isPast = _pageScrollController.offset > 450;
      if (isPast != _showStickyBottomBar) {
        setState(() {
          _showStickyBottomBar = isPast;
        });
      }
    }
  }

  void _initVariantState() {
    if (widget.product.variants.isEmpty) return;
    _selectedVariant ??= widget.product.variants.first;
    final parts =
        _selectedVariant!.name.split('/').map((s) => s.trim()).toList();
    if (parts.length >= 3) {
      _selectedPlantSize = parts[0];
      _selectedPlanterName = parts[1];
      _selectedColorName = parts[2];
    } else if (parts.length == 2) {
      if (parts[0].toLowerCase().contains('small') ||
          parts[0].toLowerCase().contains('medium') ||
          parts[0].toLowerCase().contains('large') ||
          parts[0].toLowerCase().contains('inch')) {
        _selectedPlantSize = parts[0];
        _selectedColorName = parts[1];
      } else {
        _selectedPlanterName = parts[0];
        _selectedColorName = parts[1];
      }
    } else {
      _selectedPlantSize = _selectedVariant!.name;
    }
  }

  void _onSelectSize(String size) {
    _selectedPlantSize = size;
    GlorovProductVariant? match;
    for (final v in widget.product.variants) {
      final p = v.name.split('/').map((s) => s.trim()).toList();
      if (p.isNotEmpty && p[0] == size) {
        if (_selectedPlanterName != null &&
            p.length >= 2 &&
            p[1] == _selectedPlanterName) {
          if (_selectedColorName != null &&
              p.length >= 3 &&
              p[2] == _selectedColorName) {
            match = v;
            break;
          }
          match ??= v;
        }
        match ??= v;
      }
    }
    match ??= widget.product.variants.firstWhere(
      (v) => v.name.contains(size),
      orElse: () => widget.product.variants.first,
    );
    setState(() {
      _selectedVariant = match;
      _initVariantState();
    });
  }

  void _onSelectPlanter(String planter) {
    _selectedPlanterName = planter;
    GlorovProductVariant? match;
    for (final v in widget.product.variants) {
      if (v.name.contains(planter)) {
        if (_selectedPlantSize != null &&
            v.name.contains(_selectedPlantSize!)) {
          if (_selectedColorName != null &&
              v.name.contains(_selectedColorName!)) {
            match = v;
            break;
          }
          match ??= v;
        }
        match ??= v;
      }
    }
    match ??= widget.product.variants.firstWhere(
      (v) => v.name.contains(planter),
      orElse: () => widget.product.variants.first,
    );
    setState(() {
      _selectedVariant = match;
      _initVariantState();
    });
  }

  void _onSelectColor(String color) {
    _selectedColorName = color;
    GlorovProductVariant? match;
    for (final v in widget.product.variants) {
      if (v.name.contains(color)) {
        if (_selectedPlanterName != null &&
            v.name.contains(_selectedPlanterName!)) {
          if (_selectedPlantSize != null &&
              v.name.contains(_selectedPlantSize!)) {
            match = v;
            break;
          }
          match ??= v;
        }
        match ??= v;
      }
    }
    match ??= widget.product.variants.firstWhere(
      (v) => v.name.contains(color),
      orElse: () => widget.product.variants.first,
    );
    setState(() {
      _selectedVariant = match;
      _initVariantState();
    });
  }

  Color _getColorForName(String name) {
    final lower = name.toLowerCase().trim();
    if (lower.contains('mocca') || lower.contains('mocha')) {
      return const Color(0xFF8B5A2B);
    } else if (lower.contains('ivory') || lower.contains('cream')) {
      return const Color(0xFFFDFBF7);
    } else if (lower.contains('white')) {
      return const Color(0xFFFFFFFF);
    } else if (lower.contains('brown')) {
      return const Color(0xFF5D4037);
    } else if (lower.contains('red') ||
        lower.contains('terracotta') ||
        lower.contains('rust')) {
      return const Color(0xFFB91C1C);
    } else if (lower.contains('grey') || lower.contains('gray')) {
      return const Color(0xFF9E9E9E);
    } else if (lower.contains('black') || lower.contains('charcoal')) {
      return const Color(0xFF212121);
    } else if (lower.contains('blue')) {
      return const Color(0xFF0284C7);
    } else if (lower.contains('green') || lower.contains('jade')) {
      return const Color(0xFF15803D);
    } else if (lower.contains('pink') || lower.contains('magenta')) {
      return const Color(0xFFDB2777);
    } else if (lower.contains('yellow')) {
      return const Color(0xFFEAB308);
    }
    return const Color(0xFF6B7280);
  }

  void _showSizeGuideModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Plant Size Guide',
                    style: TextStyle(
                      fontFamily: 'serif',
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF111827),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Text(
                'Our plants are measured from the base of the grower pot to the tip of the highest leaf:',
                style: TextStyle(fontSize: 13, color: Color(0xFF4B5563)),
              ),
              const SizedBox(height: 16),
              _sizeGuideRow(
                  'Small', '6 - 10 inches', 'Desks, shelves, tabletops'),
              const Divider(height: 20, color: Color(0xFFE5E7EB)),
              _sizeGuideRow('Medium', '12 - 18 inches',
                  'Coffee tables, side stands, balconies'),
              const Divider(height: 20, color: Color(0xFFE5E7EB)),
              _sizeGuideRow('Large', '24 - 36+ inches',
                  'Living room corners, patios, entrance lobbies'),
            ],
          ),
        );
      },
    );
  }

  Widget _sizeGuideRow(String size, String height, String bestFor) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 70,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFE8F5E9),
            borderRadius: BorderRadius.circular(6),
          ),
          child: Text(
            size,
            textAlign: TextAlign.center,
            style: const TextStyle(
              fontWeight: FontWeight.w700,
              fontSize: 12,
              color: AppColors.forestDeep,
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                height,
                style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 13,
                    color: Color(0xFF111827)),
              ),
              Text(
                bestFor,
                style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showGuaranteeTermsModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.verified_user_outlined,
                      size: 20, color: Color(0xFF854D0E)),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Guarantee Terms & Conditions',
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const Divider(height: 20, color: Color(0xFFE5E7EB)),
              const Text(
                'At GLOROV, every botanical product is carefully verified and packaged in transit-safe breathable containers. Our terms & conditions include:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  color: Color(0xFF4B5563),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 12),
              _buildTermsBullet(
                title: 'Transit & Delivery Guarantee',
                description:
                    'If your plant or seeds arrive damaged or stressed from travel, notify us within 48 hours for an immediate free replacement.',
              ),
              const SizedBox(height: 10),
              _buildTermsBullet(
                title: '30-Day Health Warranty',
                description:
                    'Follow our plant care instructions. If your plant declines within 30 days despite proper care, our botanists will assist you or replace it.',
              ),
              const SizedBox(height: 10),
              _buildTermsBullet(
                title: 'Hassle-Free Replacement',
                description:
                    'Share 2 clear photos and your order number via WhatsApp or support to initiate an instant claim.',
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pushNamed(
                        context, shippingAndTrustPolicyScreenRoute);
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppColors.forestDeep),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'View Full Policies & Guarantee Details',
                    style: TextStyle(
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
        );
      },
    );
  }

  Widget _buildTermsBullet(
      {required String title, required String description}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.only(top: 2),
          child: Icon(Icons.check_circle_outline,
              size: 16, color: Color(0xFF16A34A)),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF111827),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12,
                  color: Color(0xFF6B7280),
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  // Pincode estimator state
  final TextEditingController _pincodeController =
      TextEditingController(text: '700059');
  bool _isPincodeChecked = true;
  late String _deliveryEstimateText = _formatDeliveryEstimate();

  static String _formatDeliveryEstimate() {
    final deliveryDate = DateTime.now().add(const Duration(days: 4));
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final weekday = days[deliveryDate.weekday - 1];
    final month = months[deliveryDate.month - 1];
    return 'Delivered by: $weekday, ${deliveryDate.day} $month';
  }

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

  // Backend Connected Offers & Recommendations State
  List<GlorovOffer> _backendOffers = [];
  List<GlorovProduct> _relatedProducts = [];

  Future<void> _fetchOffers() async {
    try {
      final offers = await GlorovRepositories.offers.fetchOffers();
      if (mounted) {
        setState(() {
          _backendOffers = offers.where((o) => o.isActive).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _fetchRelatedProducts() async {
    try {
      final related = await GlorovRepositories.products
          .getRelatedProducts(widget.product.id, limit: 6);
      if (mounted && related.isNotEmpty) {
        setState(() => _relatedProducts = related);
      }
    } catch (_) {}
  }

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
    _initVariantState();
    _fetchReviews();
    _fetchOffers();
    _fetchRelatedProducts();
    _pageScrollController.addListener(_onPageScroll);
    _updateMetadata();
  }

  void _updateMetadata() {
    final slugOrId = widget.product.slug.isNotEmpty
        ? widget.product.slug
        : widget.product.id;
    GlorovMetaService.instance.setProductMeta(
      title: widget.product.title,
      description: widget.product.description,
      imageUrl: widget.product.imageUrls.isNotEmpty
          ? widget.product.imageUrls.first
          : GlorovMetaService.defaultOgImage,
      productSlugOrId: slugOrId,
      price: _currentPrice,
    );
  }

  Future<void> _handleShareProduct() async {
    final slugOrId = widget.product.slug.isNotEmpty
        ? widget.product.slug
        : widget.product.id;
    final didShareNative = await GlorovMetaService.instance.shareProduct(
      title: widget.product.title,
      productSlugOrId: slugOrId,
    );
    if (!didShareNative && mounted) {
      GlorovFeedback.showSuccessToast(
        context,
        message: 'Product link copied to clipboard! Ready to share.',
      );
    }
  }

  @override
  void didUpdateWidget(covariant GlorovProductDetailsScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.product.id != widget.product.id) {
      GlorovHeaderScrollNotifier.instance.reset();
      _lastRightColumnHeight = 0.0;
      _lastGalleryHeight = 0.0;
      _selectedImageIndex = 0;
      _quantity = 1;
      _selectedVariant = widget.product.variants.isNotEmpty
          ? widget.product.variants.first
          : null;
      _initVariantState();
      _showStickyBottomBar = false;
      _isSpecsExpanded = false;
      _selectedStageIndex = 0;
      _fetchReviews();
      _fetchOffers();
      _fetchRelatedProducts();
      _updateMetadata();
    }
  }

  @override
  void dispose() {
    GlorovMetaService.instance.resetToDefault();
    _pageScrollController.removeListener(_onPageScroll);
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
    if (code.length == 6 && int.tryParse(code) != null) {
      final deliveryDate = DateTime.now().add(const Duration(days: 4));
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      final weekday = days[deliveryDate.weekday - 1];
      final month = months[deliveryDate.month - 1];

      setState(() {
        _isPincodeChecked = true;
        _deliveryEstimateText =
            'Delivered by: $weekday, ${deliveryDate.day} $month • Express Dispatch';
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

    if (widget.isLoading) {
      return GlorovStorefrontScaffold(
        backgroundColor: Colors.white,
        currentRoute: productDetailsScreenRoute,
        showBottomNav: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppBreakpoints.maxContentWidth,
              ),
              child: GlorovProductDetailsSkeleton(
                isMobile: !isSticky,
              ),
            ),
          ),
        ),
      );
    }

    return GlorovStorefrontScaffold(
      backgroundColor: Colors.white,
      currentRoute: productDetailsScreenRoute,
      showBottomNav: false,
      scrollController: _pageScrollController,
      isContentScrollable: true,
      bottomNavigationBar:
          (!isSticky && mediaWidth <= AppBreakpoints.productMobileMax)
              ? AnimatedSize(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeOutCubic,
                  child: _showStickyBottomBar
                      ? _buildMobileStickyBottomBar()
                      : const SizedBox.shrink(),
                )
              : null,
      child: NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          _onPageScroll();
          return false;
        },
        child: isSticky
            ? _buildStickyDesktopLayout(context, mediaWidth)
            : _buildStackedLayout(context, mediaWidth),
      ),
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
                key: const Key('pdp_back_button'),
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
                          fontSize: 12,
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
                child: Text('|',
                    style: TextStyle(color: Color(0xFFD1D5DB), fontSize: 12)),
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
                onTap: () {
                  if (Navigator.canPop(context)) {
                    Navigator.pop(context);
                  } else {
                    Navigator.pushNamed(
                      context,
                      discoverScreenRoute,
                      arguments: widget.product.category,
                    );
                  }
                },
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
              const SizedBox(width: 8),
              // 1-Tap Social Share Button in Breadcrumbs
              InkWell(
                key: const Key('pdp_breadcrumbs_share_button'),
                onTap: _handleShareProduct,
                borderRadius: BorderRadius.circular(6),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: const Color(0xFFC8E6C9)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.share_outlined,
                          size: 13, color: AppColors.forestDeep),
                      SizedBox(width: 4),
                      Text(
                        'Share',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.forestDeep,
                        ),
                      ),
                    ],
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
  /// Left gallery starts cleanly at the top aligned with product title and variants,
  /// with zero empty gaps, and naturally scrolls up when moving to the full-width discovery sections below.
  Widget _buildDesktopTwoColumnBuyingSection(
    BuildContext context, {
    required double galleryWidth,
    required double columnSpacing,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // LEFT COLUMN: Sticky Product Gallery that pins smoothly during scroll
        // and scrolls naturally with page once right-column buying details finish.
        SizedBox(
          width: galleryWidth,
          child: AnimatedBuilder(
            animation: _pageScrollController,
            builder: (context, child) {
              double stickyOffset = 0.0;
              if (_pageScrollController.hasClients) {
                final scrollOffset = _pageScrollController.offset;
                final rightHeight = _getWidgetHeight(_rightColumnKey, true);
                final galleryHeight = _getWidgetHeight(_galleryKey, false);

                if (rightHeight > galleryHeight && galleryHeight > 0) {
                  final maxStickyOffset = rightHeight - galleryHeight;
                  // Breadcrumbs height is ~34px. When scrolled past, smoothly pin gallery in viewport!
                  const triggerOffset = 34.0;
                  if (scrollOffset > triggerOffset) {
                    stickyOffset =
                        (scrollOffset - triggerOffset).clamp(0.0, maxStickyOffset);
                  }
                }
              }
              return Padding(
                padding: EdgeInsets.only(top: stickyOffset),
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

                // 3. Pricing & Taxes
                _buildPricingSection(),

                const SizedBox(height: 12),

                // 4. Gift Option Checkbox
                _buildGiftOptionCheckbox(),

                const SizedBox(height: 16),

                // 5. Quantity Stepper, Add to Cart & Buy Now
                _buildQuantityAndAddToCart(context),

                const SizedBox(height: 18),

                // 6. "Offers for you:" Coupon Carousel
                _buildOffersCarousel(),

                const SizedBox(height: 16),

                // 7. Trust Reassurance Badges
                _buildTrustReassuranceBadges(),

                const SizedBox(height: 18),

                // 8. Delivery Estimate Pincode Checker
                _buildDeliveryEstimatePincode(),

                const SizedBox(height: 20),

                // 9. Care Highlights Card / Botanical Metric Cards
                if (widget.product.productType == GlorovProductType.plants) ...[
                  _buildCareHighlightsCard(),
                  const SizedBox(height: 20),
                ] else ...[
                  _buildBotanicalMetricCards(),
                  const SizedBox(height: 20),
                ],

                // 10. Product Specifications
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

                  // Select Packet Size (Variant Selector)
                  _buildVariantSelector(),

                  const SizedBox(height: 16),

                  // Pricing & Taxes
                  _buildPricingSection(),

                  const SizedBox(height: 12),

                  // Gift Option Checkbox
                  _buildGiftOptionCheckbox(),

                  const SizedBox(height: 14),

                  // Quantity Stepper, Add to Cart & Buy Now
                  _buildQuantityAndAddToCart(context),

                  const SizedBox(height: 16),

                  // Offers Carousel
                  _buildOffersCarousel(),

                  const SizedBox(height: 14),

                  // Trust & Reassurance Strip (30-day guarantee & support)
                  _buildTrustReassuranceBadges(),

                  const SizedBox(height: 16),

                  // Delivery Estimate Pincode Checker
                  _buildDeliveryEstimatePincode(),

                  const SizedBox(height: 18),

                  // Care Highlights Card ("How easy it is to care?")
                  if (widget.product.productType == GlorovProductType.plants) ...[
                    _buildCareHighlightsCard(),
                    const SizedBox(height: 18),
                  ] else ...[
                    _buildBotanicalMetricCards(),
                    const SizedBox(height: 18),
                  ],

                  // Product Specifications (Collapsible Accordion)
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
                const SizedBox(width: 8),
                // 1-Tap Social Share Button next to Wishlist
                TapFeedback(
                  key: const ValueKey('pdp_header_share_button'),
                  onTap: _handleShareProduct,
                  effect: TapAnimationType.bounce,
                  duration: GlorovInteractionConfig.durationFast,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F4F6),
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                    ),
                    child: const Icon(
                      Icons.share_outlined,
                      size: 20,
                      color: Color(0xFF4B5563),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 8,
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
                const Text('•',
                    style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 13)),
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      widget.product.inStock
                          ? Icons.check_circle_outline
                          : Icons.remove_circle_outline,
                      size: 14,
                      color: widget.product.inStock
                          ? const Color(0xFF16A34A)
                          : const Color(0xFFDC2626),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      widget.product.inStock ? 'In Stock' : 'Out of Stock',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: widget.product.inStock
                            ? const Color(0xFF15803D)
                            : const Color(0xFFDC2626),
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
  // Component 3: Contextual Botanical Lifecycle & Specification Metric Cards
  // ---------------------------------------------------------------------------
  Widget _buildBotanicalMetricCards() {
    if (widget.product.productType == GlorovProductType.plants) {
      return Row(
        children: [
          Expanded(
            child: _metricCard(
              icon: Icons.wb_sunny_outlined,
              iconColor: const Color(0xFFD97706),
              stat: widget.product.sunlightRequirement,
              label: 'Sunlight',
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _metricCard(
              icon: Icons.water_drop_outlined,
              iconColor: const Color(0xFF2563EB),
              stat: widget.product.wateringNeeds,
              label: 'Watering',
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: _metricCard(
              icon: Icons.favorite_border,
              iconColor: const Color(0xFF16A34A),
              stat: widget.product.difficultyLevel,
              label: 'Care Level',
            ),
          ),
        ],
      );
    }

    if (widget.product.productType == GlorovProductType.supplies ||
        widget.product.productType == GlorovProductType.accessories) {
      final hasSpecs = widget.product.material != null ||
          widget.product.dimensions != null;
      if (!hasSpecs) return const SizedBox.shrink();

      return Row(
        children: [
          if (widget.product.material != null)
            Expanded(
              child: _metricCard(
                icon: Icons.shield_outlined,
                iconColor: const Color(0xFF4B5563),
                stat: widget.product.material!,
                label: 'Material',
              ),
            ),
          if (widget.product.dimensions != null) ...[
            const SizedBox(width: 8),
            Expanded(
              child: _metricCard(
                icon: Icons.square_foot_outlined,
                iconColor: const Color(0xFF059669),
                stat: widget.product.dimensions!,
                label: 'Dimensions',
              ),
            ),
          ],
          const SizedBox(width: 8),
          Expanded(
            child: _metricCard(
              icon: Icons.verified_outlined,
              iconColor: const Color(0xFF16A34A),
              stat: 'Durable',
              label: 'Build Quality',
            ),
          ),
        ],
      );
    }

    // Default for Seeds
    final String germStat = () {
      for (final b in widget.product.badges) {
        if (b.contains('%')) {
          return b
              .replaceAll('GERMINATION', '')
              .replaceAll('Germination', '')
              .trim();
        }
      }
      return '85%+';
    }();

    return Row(
      children: [
        Expanded(
          child: _metricCard(
            icon: Icons.eco,
            iconColor: const Color(0xFF16A34A),
            stat: germStat,
            label: 'Germination',
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _metricCard(
            icon: Icons.calendar_month,
            iconColor: const Color(0xFFD97706),
            stat: widget.product.germinationPeriod ?? '3-5 Days',
            label: 'Sprout',
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: _metricCard(
            icon: Icons.local_florist,
            iconColor: const Color(0xFFDC2626),
            stat: widget.product.harvestTime ?? '60-80 Days',
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
  // Component 4: Contextual Variant Selector (Packet / Pot / Option)
  // ---------------------------------------------------------------------------
  bool get _hasMultiAttributeVariants =>
      widget.product.variants.any((v) => v.name.contains('/'));

  Widget _buildVariantSelector() {
    if (widget.product.variants.isEmpty ||
        (widget.product.variants.length == 1 &&
            (widget.product.variants.first.name
                    .toLowerCase()
                    .contains('standard') ||
                widget.product.variants.first.name.trim().isEmpty))) {
      return const SizedBox.shrink();
    }

    if (_hasMultiAttributeVariants) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildPlantSizeSelector(),
          const SizedBox(height: 14),
          _buildPlanterSelector(),
          const SizedBox(height: 14),
          _buildColorSwatches(),
        ],
      );
    }

    return _buildStandardVariantSelector();
  }

  Widget _buildPlantSizeSelector() {
    final sizes = <String>{};
    for (final v in widget.product.variants) {
      final p = v.name.split('/').map((s) => s.trim()).toList();
      if (p.length >= 3) {
        sizes.add(p[0]);
      } else if (p.length == 2 &&
          (p[0].toLowerCase().contains('small') ||
              p[0].toLowerCase().contains('medium') ||
              p[0].toLowerCase().contains('large') ||
              p[0].toLowerCase().contains('inch'))) {
        sizes.add(p[0]);
      }
    }
    if (sizes.isEmpty) {
      sizes.addAll(['Small', 'Medium']);
    } else if (sizes.length == 1 && sizes.contains('Small')) {
      sizes.add('Medium');
    }

    final activeSize = _selectedPlantSize ?? sizes.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Expanded(
              child: Text(
                'Select Plant Size',
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: Color(0xFF111827),
                ),
              ),
            ),
            TapFeedback(
              onTap: _showSizeGuideModal,
              child: const Text(
                'Size Guide',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.forestDeep,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 10,
          runSpacing: 8,
          children: sizes.map((s) {
            final isSelected = s == activeSize;
            return TapFeedback(
              onTap: () => _onSelectSize(s),
              effect: TapAnimationType.scale,
              scaleDown: 0.96,
              duration: GlorovInteractionConfig.durationFast,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                padding:
                    const EdgeInsets.symmetric(horizontal: 18, vertical: 9),
                decoration: BoxDecoration(
                  color: isSelected ? AppColors.forestDeep : Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.forestDeep
                        : const Color(0xFFD1D5DB),
                    width: 1.2,
                  ),
                ),
                child: Text(
                  s,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                    color: isSelected ? Colors.white : const Color(0xFF374151),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildPlanterSelector() {
    final plantersMap = <String, double>{};
    for (final v in widget.product.variants) {
      final p = v.name.split('/').map((s) => s.trim()).toList();
      String? name;
      if (p.length >= 3) {
        name = p[1];
      } else if (p.length == 2 &&
          !p[0].toLowerCase().contains('small') &&
          !p[0].toLowerCase().contains('medium') &&
          !p[0].toLowerCase().contains('inch')) {
        name = p[0];
      }
      if (name != null) {
        plantersMap.putIfAbsent(name, () => v.effectivePrice);
      }
    }

    if (plantersMap.isEmpty) return const SizedBox.shrink();

    final activePlanter = _selectedPlanterName ?? plantersMap.keys.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Select Planter',
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
          children: plantersMap.entries.map((entry) {
            final planter = entry.key;
            final price = entry.value;
            final isSelected = planter == activePlanter;

            return TapFeedback(
              onTap: () => _onSelectPlanter(planter),
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
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.inventory_2_outlined,
                      size: 20,
                      color: isSelected
                          ? AppColors.forestDeep
                          : const Color(0xFF6B7280),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      planter,
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12.5,
                        fontWeight:
                            isSelected ? FontWeight.w800 : FontWeight.w600,
                        color: isSelected
                            ? AppColors.forestDeep
                            : const Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '₹${price.toStringAsFixed(0)}',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11.5,
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

  Widget _buildColorSwatches() {
    final colors = <String>{};
    for (final v in widget.product.variants) {
      final p = v.name.split('/').map((s) => s.trim()).toList();
      if (p.length >= 3) {
        colors.add(p[2]);
      } else if (p.length == 2) {
        colors.add(p[1]);
      }
    }

    if (colors.isEmpty) return const SizedBox.shrink();

    final activeColor = _selectedColorName ?? colors.first;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Color – $activeColor',
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w700,
            color: Color(0xFF111827),
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: colors.map((c) {
            final isSelected = c == activeColor;
            final colorVal = _getColorForName(c);
            final isLight = colorVal == Colors.white ||
                colorVal == const Color(0xFFFDFBF7);

            return Padding(
              padding: const EdgeInsets.only(right: 12),
              child: TapFeedback(
                onTap: () => _onSelectColor(c),
                effect: TapAnimationType.scale,
                scaleDown: 0.92,
                duration: GlorovInteractionConfig.durationFast,
                child: Container(
                  width: 34,
                  height: 34,
                  padding: const EdgeInsets.all(2.5),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? AppColors.forestDeep
                          : Colors.transparent,
                      width: 2,
                    ),
                  ),
                  child: Container(
                    decoration: BoxDecoration(
                      color: colorVal,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isLight
                            ? const Color(0xFFD1D5DB)
                            : Colors.transparent,
                        width: 1,
                      ),
                    ),
                    child: isSelected
                        ? Icon(
                            Icons.check,
                            size: 14,
                            color: isLight
                                ? AppColors.forestDeep
                                : Colors.white,
                          )
                        : null,
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildStandardVariantSelector() {
    final variants = widget.product.variants;

    final String selectorTitle;
    switch (widget.product.productType) {
      case GlorovProductType.plants:
        selectorTitle = 'Select Plant Size';
        break;
      case GlorovProductType.supplies:
      case GlorovProductType.accessories:
        selectorTitle = widget.product.category.toLowerCase().contains('pot') ||
                widget.product.category.toLowerCase().contains('planter')
            ? 'Select Pot Size'
            : (widget.product.variants
                    .any((v) => v.name.toLowerCase().contains('teeth'))
                ? 'Select Teeth / Size'
                : 'Select Option');
        break;
      case GlorovProductType.seeds:
        selectorTitle = 'Select Packet Size';
        break;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          selectorTitle,
          style: const TextStyle(
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
              () {
                int? pct = widget.product.discountPercent;
                if (pct == null &&
                    _currentOriginalPrice != null &&
                    _currentOriginalPrice! > _currentPrice) {
                  pct = (((_currentOriginalPrice! - _currentPrice) /
                              _currentOriginalPrice!) *
                          100)
                      .round();
                }
                if (pct == null || pct <= 0) return const SizedBox.shrink();

                return Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: const Color(0xFFFCA5A5)),
                  ),
                  child: Text(
                    '$pct% OFF',
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFFDC2626),
                    ),
                  ),
                );
              }(),
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
  // Component 6: Backend-Connected "Offers for you:" Coupon Cards Carousel
  // ---------------------------------------------------------------------------
  Widget _buildOffersCarousel() {
    if (_backendOffers.isEmpty) return const SizedBox.shrink();

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
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _backendOffers.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (context, index) {
                  final offer = _backendOffers[index];
                  return GlorovYScrollPassThrough(
                    child: _couponCard(
                      title: offer.title,
                      code: offer.code,
                      subtext: offer.minSpendText ?? offer.description,
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

  Widget _couponCard({
    required String title,
    required String code,
    required String subtext,
  }) {
    return TapFeedback(
      onTap: () {
        Clipboard.setData(ClipboardData(text: code));
        GlorovFeedback.showSuccessToast(
          context,
          message: 'Coupon code $code copied to clipboard!',
        );
      },
      effect: TapAnimationType.scale,
      scaleDown: 0.96,
      duration: GlorovInteractionConfig.durationFast,
      child: Container(
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
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
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
      ),
    );
  }

  Widget _buildGiftOptionCheckbox() {
    return InkWell(
      onTap: () =>
          setState(() => _isGiftOptionSelected = !_isGiftOptionSelected),
      borderRadius: BorderRadius.circular(6),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          children: [
            SizedBox(
              width: 22,
              height: 22,
              child: Checkbox(
                value: _isGiftOptionSelected,
                onChanged: (val) =>
                    setState(() => _isGiftOptionSelected = val ?? false),
                activeColor: AppColors.forestDeep,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(4),
                ),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: const Text.rich(
                TextSpan(
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    color: Color(0xFF374151),
                  ),
                  children: [
                    TextSpan(
                      text: 'Make this a gift ',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    TextSpan(
                      text: '• Add a hand-written note free',
                      style: TextStyle(color: Color(0xFF6B7280)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrustReassuranceBadges() {
    final isPlant = widget.product.productType == GlorovProductType.plants;
    final isSeeds = widget.product.productType == GlorovProductType.seeds;

    final String guaranteeTitle = isPlant
        ? '30-Day Plant Guarantee'
        : (isSeeds
            ? 'Verified Germination Guarantee'
            : 'Safe Transit Guarantee');

    return Column(
      children: [
        // 1. Guarantee Row (Service specific to product type with clickable T&C)
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFFEF9C3),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFFEF08A)),
          ),
          child: Row(
            children: [
              const Icon(Icons.verified_user_outlined,
                  size: 18, color: Color(0xFF854D0E)),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  guaranteeTitle,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: Color(0xFF713F12),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              InkWell(
                onTap: _showGuaranteeTermsModal,
                borderRadius: BorderRadius.circular(4),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  child: Text(
                    'T&C',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF854D0E),
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),

        // 2. Additional Services (Only available services shown)
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFFEF9C3),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: const Color(0xFFFEF08A)),
          ),
          child: Row(
            children: [
              if (isPlant) ...[
                const Expanded(
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.chat_bubble_outline,
                          size: 17, color: Color(0xFF854D0E)),
                      SizedBox(width: 6),
                      Flexible(
                        child: Text(
                          'Plant Care Support',
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: Color(0xFF713F12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
              ],
              const Expanded(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.local_shipping_outlined,
                        size: 18, color: Color(0xFF854D0E)),
                    SizedBox(width: 6),
                    Flexible(
                      child: Text(
                        'Pan-India Delivery',
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF713F12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildCareHighlightsCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF4F7F2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'How easy it is to care?',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 14,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1E293B),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.water_drop_outlined,
                        color: Color(0xFF0284C7), size: 24),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Water',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          Text(
                            widget.product.wateringNeeds,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                height: 32,
                width: 1,
                color: const Color(0xFFCBD5E1),
                margin: const EdgeInsets.symmetric(horizontal: 10),
              ),
              Expanded(
                child: Row(
                  children: [
                    const Icon(Icons.wb_sunny_outlined,
                        color: Color(0xFFEAB308), size: 24),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Light',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                          Text(
                            widget.product.sunlightRequirement,
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF64748B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
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
    const double buttonHeight = 48.0;

    final quantityStepper = Container(
      height: buttonHeight,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFD1D5DB), width: 1.2),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          IconButton(
            icon: const Icon(Icons.remove, size: 16),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            constraints:
                const BoxConstraints(minWidth: 36, minHeight: buttonHeight),
            splashRadius: 18,
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
            padding: const EdgeInsets.symmetric(horizontal: 8),
            constraints:
                const BoxConstraints(minWidth: 36, minHeight: buttonHeight),
            splashRadius: 18,
            onPressed: () => setState(() => _quantity++),
          ),
        ],
      ),
    );

    final addToCartBtn = SizedBox(
      height: buttonHeight,
      child: ElevatedButton(
        onPressed: _isAddingToCart
            ? null
            : () => _handleAddToCart(navigateToCart: false),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.forestDeep, // Signature Green
          foregroundColor: Colors.white,
          minimumSize: const Size(0, buttonHeight),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GlorovCustomIcons.cart(size: 18, color: Colors.white),
            const SizedBox(width: 8),
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
      ),
    );

    final buyNowBtn = SizedBox(
      height: buttonHeight,
      child: ElevatedButton(
        onPressed:
            _isAddingToCart ? null : () => _handleAddToCart(navigateToCart: true),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFFD97706), // Warm Amber
          foregroundColor: Colors.white,
          minimumSize: const Size(0, buttonHeight),
          padding: const EdgeInsets.symmetric(horizontal: 16),
          elevation: 1,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            GlorovCustomIcons.buy(size: 17, color: Colors.white),
            const SizedBox(width: 8),
            const Flexible(
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
      ),
    );

    return Container(
      key: _inPageCartKey,
      child: Column(
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
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Component 8: Delivery Estimate Pincode Checker (Video frame 5 style)
  // ---------------------------------------------------------------------------
  Widget _buildDeliveryEstimatePincode() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Row(
          children: [
            Icon(Icons.local_shipping_outlined,
                size: 18, color: AppColors.forestDeep),
            SizedBox(width: 8),
            Text(
              'Delivery Estimate',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13.5,
                fontWeight: FontWeight.w700,
                color: Color(0xFF111827),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        // Modern single-border pincode check component (no duplicate/outer container borders)
        Container(
          height: 44,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: _isPincodeChecked
                  ? const Color(0xFF16A34A)
                  : const Color(0xFFD1D5DB),
              width: 1.2,
            ),
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
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF111827),
                  ),
                  decoration: const InputDecoration(
                    counterText: '',
                    hintText: 'Enter 6-digit Pincode',
                    hintStyle: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 12.5,
                      color: Color(0xFF94A3B8),
                      fontWeight: FontWeight.w400,
                    ),
                    border: InputBorder.none,
                    enabledBorder: InputBorder.none,
                    focusedBorder: InputBorder.none,
                    errorBorder: InputBorder.none,
                    disabledBorder: InputBorder.none,
                    focusedErrorBorder: InputBorder.none,
                    isDense: true,
                    contentPadding:
                        EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  ),
                  onSubmitted: (_) => _handleCheckPincode(),
                ),
              ),
              TapFeedback(
                onTap: _handleCheckPincode,
                effect: TapAnimationType.scale,
                scaleDown: 0.94,
                duration: GlorovInteractionConfig.durationFast,
                child: Container(
                  height: 44,
                  padding: const EdgeInsets.symmetric(horizontal: 18),
                  decoration: const BoxDecoration(
                    color: AppColors.forestDeep,
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
        const SizedBox(height: 8),
        Row(
          children: [
            Icon(
              _isPincodeChecked ? Icons.check_circle : Icons.error_outline,
              size: 15,
              color: _isPincodeChecked ? const Color(0xFF16A34A) : Colors.red,
            ),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                _deliveryEstimateText,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                  color: _isPincodeChecked
                      ? const Color(0xFF15803D)
                      : Colors.red.shade700,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component 9: Botanical Lifecycle Growing Tabs (Seeds & Plants Only)
  // ---------------------------------------------------------------------------
  Widget _buildBotanicalLifecycleTabs() {
    if (widget.product.productType == GlorovProductType.supplies ||
        widget.product.productType == GlorovProductType.accessories) {
      return const SizedBox.shrink();
    }

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
  // Component 12: Backend-Connected "You May Also Like" Related Products
  // ---------------------------------------------------------------------------
  Widget _buildYouMayAlsoLikeSection() {
    final related = _relatedProducts.isNotEmpty
        ? _relatedProducts
        : GlorovMockData.products
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
                          Navigator.pushNamed(
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
          const GlorovReviewsSkeleton(count: 3)
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
    final specs = <MapEntry<String, String>>[];

    if (widget.product.botanicalName.isNotEmpty) {
      specs.add(MapEntry('Botanical Name', widget.product.botanicalName));
    }
    specs.add(MapEntry('Category', widget.product.category));
    if (widget.product.subcategory.isNotEmpty) {
      specs.add(MapEntry('Subcategory', widget.product.subcategory));
    }

    if (widget.product.productType == GlorovProductType.seeds) {
      if (widget.product.sowingDepth != null) {
        specs.add(MapEntry('Sowing Depth', widget.product.sowingDepth!));
      }
      if (widget.product.germinationPeriod != null) {
        specs.add(MapEntry('Germination Time', widget.product.germinationPeriod!));
      }
      specs.add(MapEntry('Sunlight Requirement', widget.product.sunlightRequirement));
      specs.add(MapEntry('Watering Schedule', widget.product.wateringNeeds));
      specs.add(MapEntry('Difficulty Level', widget.product.difficultyLevel));
      if (widget.product.plantingSeason != null) {
        specs.add(MapEntry('Planting Season', widget.product.plantingSeason!));
      }
      if (widget.product.harvestTime != null) {
        specs.add(MapEntry('Days to Harvest', widget.product.harvestTime!));
      }
      if (widget.product.packContents != null) {
        specs.add(MapEntry('Pack Contents', widget.product.packContents!));
      }
    } else if (widget.product.productType == GlorovProductType.plants) {
      specs.add(MapEntry('Sunlight Requirement', widget.product.sunlightRequirement));
      specs.add(MapEntry('Watering Schedule', widget.product.wateringNeeds));
      specs.add(MapEntry('Difficulty Level', widget.product.difficultyLevel));
      if (widget.product.potSize != null) {
        specs.add(MapEntry('Recommended Pot', widget.product.potSize!));
      }
      specs.add(MapEntry('Pet Friendly', widget.product.isPetFriendly ? 'Yes' : 'No'));
    } else {
      if (widget.product.material != null) {
        specs.add(MapEntry('Material', widget.product.material!));
      }
      if (widget.product.dimensions != null) {
        specs.add(MapEntry('Dimensions', widget.product.dimensions!));
      }
      specs.add(MapEntry('Durability', 'Heavy Duty / Weatherproof'));
    }

    if (specs.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TapFeedback(
          key: const ValueKey('pdp_specs_accordion_toggle'),
          onTap: () => setState(() => _isSpecsExpanded = !_isSpecsExpanded),
          effect: TapAnimationType.scale,
          scaleDown: 0.98,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: AppColors.forestDeep, // Signature Botanical Green
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.format_list_bulleted,
                    size: 18, color: Colors.white),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Product Specifications',
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Icon(
                  _isSpecsExpanded ? Icons.remove : Icons.add,
                  color: Colors.white,
                  size: 20,
                ),
              ],
            ),
          ),
        ),
        AnimatedSize(
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeInOut,
          child: _isSpecsExpanded
              ? Container(
                  margin: const EdgeInsets.only(top: 8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF9FAF8),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFE5E7EB)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
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
                )
              : const SizedBox.shrink(),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Component: Frequently Asked Questions Accordion
  // ---------------------------------------------------------------------------
  Widget _buildFaqSection() {
    final List<MapEntry<String, String>> faqs;

    if (widget.product.productType == GlorovProductType.seeds) {
      faqs = [
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
        const MapEntry(
          'What is GLOROV\'s guarantee & replacement policy?',
          'All GLOROV botanical seeds and plants are protected by our 100% "Arrives Healthy" guarantee. In the rare event of damage or non-germination, we provide free replacement support.',
        ),
      ];
    } else if (widget.product.productType == GlorovProductType.plants) {
      faqs = [
        MapEntry(
          'What are the light requirements for ${widget.product.title}?',
          'This live plant thrives best in ${widget.product.sunlightRequirement.toLowerCase()}. Avoid harsh scorching direct sun unless acclimated.',
        ),
        MapEntry(
          'How frequently should I water this plant?',
          'Follow a ${widget.product.wateringNeeds.toLowerCase()} schedule. Allow the top 1-2 inches of potting mix to dry out between waterings to prevent root rot.',
        ),
        MapEntry(
          'Is this plant safe for pets?',
          widget.product.isPetFriendly
              ? 'Yes! ${widget.product.title} is certified non-toxic and pet-friendly for homes with dogs and cats.'
              : '${widget.product.title} is best kept out of reach of curious cats and dogs.',
        ),
        const MapEntry(
          'What should I do immediately after my plant arrives?',
          'Unbox gently, place in a shaded bright spot for 24-48 hours to acclimate after transit, and check soil moisture.',
        ),
      ];
    } else {
      faqs = [
        MapEntry(
          'What materials is ${widget.product.title} crafted from?',
          'Crafted from high-grade, durable materials (${widget.product.material ?? "heavy duty botanical grade"}) designed for long-lasting gardening use.',
        ),
        const MapEntry(
          'How do I care for and maintain this item?',
          'Wipe clean with a damp cloth after use. Store in a dry place to prevent rust or moisture degradation.',
        ),
        const MapEntry(
          'Is this suitable for both indoor and outdoor gardening?',
          'Yes, engineered for versatility across indoor pots, balcony planters, and terrace/outdoor raised beds.',
        ),
        const MapEntry(
          'What is GLOROV\'s transit guarantee?',
          'Protected by safe delivery transit packaging. If any defect or damage occurs during transit, we provide immediate free replacement.',
        ),
      ];
    }

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
                Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
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
                    if (_currentOriginalPrice != null &&
                        _currentOriginalPrice! > _currentPrice) ...[
                      const SizedBox(width: 6),
                      Text(
                        '₹${_currentOriginalPrice!.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          color: Color(0xFF9CA3AF),
                          decoration: TextDecoration.lineThrough,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ],
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
            const SizedBox(width: 12),
            // Mobile Sticky Bar Favorite Toggle
            ListenableBuilder(
              listenable: GlorovCartState.instance,
              builder: (context, _) {
                final isSaved =
                    GlorovCartState.instance.isInWishlist(widget.product.id);

                return TapFeedback(
                  onTap: () {
                    GlorovCartState.instance.toggleWishlist(widget.product.id);
                    if (isSaved) {
                      GlorovFeedback.showInfoToast(
                        context,
                        message: 'Removed from wishlist',
                      );
                    } else {
                      GlorovFeedback.showSuccessToast(
                        context,
                        message: 'Saved "${widget.product.title}" to wishlist!',
                      );
                    }
                  },
                  effect: TapAnimationType.bounce,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: isSaved
                          ? const Color(0xFFFEE2E2)
                          : const Color(0xFFF3F4F6),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: isSaved
                            ? const Color(0xFFFCA5A5)
                            : const Color(0xFFE5E7EB),
                      ),
                    ),
                    child: Icon(
                      isSaved ? Icons.favorite : Icons.favorite_border_rounded,
                      size: 20,
                      color: isSaved
                          ? const Color(0xFFE11D48)
                          : const Color(0xFF4B5563),
                    ),
                  ),
                );
              },
            ),
            const SizedBox(width: 10),
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
