import 'dart:async';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../common/glorov_y_scroll_pass_through.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';

/// Data model for a promotional coupon tag inside a banner slide
class GlorovBannerCoupon {
  final String discount;
  final String minSpend;
  final String code;

  const GlorovBannerCoupon({
    required this.discount,
    required this.minSpend,
    required this.code,
  });
}

/// Data model for a responsive hero banner slide with distinct desktop and mobile images
class GlorovBannerSlide {
  final String id;

  /// Landscape wide banner image for desktop viewports (~2.75:1 ratio)
  /// Supports asset paths ('assets/images/...') or remote HTTP URLs
  final String desktopImageUrl;

  /// Portrait or square tall banner image for mobile viewports (~3:4 ratio)
  /// If null, automatically falls back to [desktopImageUrl]
  final String? mobileImageUrl;

  /// Optional promotional badge/tag (e.g. "GROW WITH GLOROV")
  final String? tag;

  /// Optional headline/title
  final String? title;

  /// Optional subtitle/description
  final String? subtitle;

  /// CTA button text (default: 'SHOP NOW')
  final String ctaText;

  /// Route to push when banner or CTA is tapped (default: discoverScreenRoute)
  final String ctaRoute;

  /// Arguments passed with [ctaRoute]
  final Object? ctaArguments;

  /// Custom CTA tap callback (overrides [ctaRoute] navigation if provided)
  final VoidCallback? onCtaPressed;

  /// Custom full slide tap callback
  final VoidCallback? onTap;

  /// Background fallback color while image loads or if transparent
  final Color backgroundColor;

  /// Button styling
  final Color ctaBackgroundColor;
  final Color ctaForegroundColor;

  /// Promotional coupon codes to display
  final List<GlorovBannerCoupon>? coupons;

  /// If true, the image itself contains the full artwork/typography.
  /// If false, an editorial Flutter text overlay with badge, headline, and CTA is rendered.
  final bool isImageOnly;

  const GlorovBannerSlide({
    required this.id,
    required this.desktopImageUrl,
    this.mobileImageUrl,
    this.tag,
    this.title,
    this.subtitle,
    this.ctaText = 'SHOP NOW',
    this.ctaRoute = discoverScreenRoute,
    this.ctaArguments,
    this.onCtaPressed,
    this.onTap,
    this.backgroundColor = const Color(0xFF1E3D2F),
    this.ctaBackgroundColor = const Color(0xFF1E3D2F),
    this.ctaForegroundColor = Colors.white,
    this.coupons,
    this.isImageOnly = true,
  });

  /// Factory from Medusa Backend JSON
  factory GlorovBannerSlide.fromJson(Map<String, dynamic> json) {
    Color parseHex(String? hex) {
      if (hex == null || hex.isEmpty) return const Color(0xFF1E3D2F);
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    }

    final desktop = json['desktop_image_url'] as String? ?? '';
    final mobile = json['mobile_image_url'] as String? ?? desktop;

    final resolvedDesktop = desktop.startsWith('http') || desktop.startsWith('assets/')
        ? desktop
        : 'assets/images/${desktop.split('/').last}';
    final resolvedMobile = mobile.startsWith('http') || mobile.startsWith('assets/')
        ? mobile
        : 'assets/images/${mobile.split('/').last}';

    return GlorovBannerSlide(
      id: json['id'] as String? ?? 'slide_${DateTime.now().millisecondsSinceEpoch}',
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String? ?? '',
      tag: json['tag'] as String? ?? 'GROW WITH GLOROV',
      desktopImageUrl: resolvedDesktop,
      mobileImageUrl: resolvedMobile,
      ctaText: json['cta_text'] as String? ?? 'SHOP NOW',
      ctaRoute: json['cta_route'] as String? ?? discoverScreenRoute,
      ctaArguments: json['cta_arguments'],
      backgroundColor: parseHex(json['bg_color'] as String?),
      isImageOnly: true,
    );
  }
}

/// GLOROV Responsive Hero Banner Slider
/// Provides multi-device banner support:
/// 1. Different image assets for Mobile (portrait ~3:4) and Desktop (landscape ~2.75:1).
/// 2. Smooth auto-play with visible progress countdown in the active indicator pill.
/// 3. Pauses on mouse hover (desktop) and touch down (mobile), resuming smoothly without surprise jumps.
/// 4. Circular floating left/right navigation arrows on desktop (`<` and `>`).
/// 5. Direct tap navigation on indicator pills.
/// 6. Cross-device drag/swipe gestures for touchscreens and mouse/trackpad web.
class GlorovHeroBannerSlider extends StatefulWidget {
  final List<GlorovBannerSlide>? slides;
  final bool autoPlay;
  final Duration autoPlayDuration;
  final Duration transitionDuration;
  final Curve transitionCurve;
  final double? desktopHeight;
  final double? mobileHeight;
  final double? desktopAspectRatio;
  final double? tabletAspectRatio;
  final double? mobileAspectRatio;
  final double? aspectRatio;
  final bool showArrows;
  final bool showIndicators;
  final bool isFullWidth;
  final EdgeInsetsGeometry? margin;
  final BorderRadius? borderRadius;
  final ValueChanged<int>? onSlideChanged;

  const GlorovHeroBannerSlider({
    super.key,
    this.slides,
    this.autoPlay = true,
    this.autoPlayDuration = const Duration(seconds: 6),
    this.transitionDuration = const Duration(milliseconds: 500),
    this.transitionCurve = Curves.easeInOutCubic,
    this.desktopHeight,
    this.mobileHeight,
    this.desktopAspectRatio = 20.0 / 9.0, // 20:9 Desktop
    this.tabletAspectRatio = 20.0 / 9.0,  // 20:9 Tablet
    this.mobileAspectRatio = 5.0 / 7.0,   // 5:7 Mobile
    this.aspectRatio,
    this.showArrows = true,
    this.showIndicators = true,
    this.isFullWidth = true,
    this.margin,
    this.borderRadius,
    this.onSlideChanged,
  });

  /// Canonical Default Promotional Botanical Slides
  static const List<GlorovBannerSlide> defaultBotanicalSlides = [
    // Slide 1: Every Great Garden Begins with a Seed
    GlorovBannerSlide(
      id: 'banner_garden_begins',
      desktopImageUrl: 'assets/images/banner_garden_begins_desktop.png',
      mobileImageUrl: 'assets/images/banner_garden_begins_mobile.jpg',
      tag: 'GROW WITH GLOROV',
      title: 'Every Great Garden Begins with a Seed.',
      subtitle: 'Discover the joy of growing something beautiful.',
      ctaText: 'EXPLORE SEEDS & PLANTS',
      ctaRoute: discoverScreenRoute,
      ctaArguments: 'Seeds & Live Plants',
      backgroundColor: Color(0xFF1E3D2F),
      ctaBackgroundColor: Color(0xFF1E3D2F),
      isImageOnly: true,
    ),

    // Slide 2: Plant a Seed. Grow a Dream.
    GlorovBannerSlide(
      id: 'banner_plant_seed',
      desktopImageUrl: 'assets/images/banner_plant_seed_desktop.png',
      mobileImageUrl: 'assets/images/banner_plant_seed_mobile.jpg',
      tag: 'START SOMETHING BEAUTIFUL',
      title: 'Plant a Seed. Grow a Dream.',
      subtitle: 'A greener tomorrow begins with what you plant today.',
      ctaText: 'START YOUR GARDEN',
      ctaRoute: discoverScreenRoute,
      ctaArguments: 'Live Houseplants',
      backgroundColor: Color(0xFF2D5A27),
      ctaBackgroundColor: Color(0xFF2D5A27),
      isImageOnly: true,
    ),

    // Slide 3: Let Your Garden Bloom.
    GlorovBannerSlide(
      id: 'banner_garden_bloom',
      desktopImageUrl: 'assets/images/banner_garden_bloom_desktop.png',
      mobileImageUrl: 'assets/images/banner_garden_bloom_mobile.jpg',
      tag: 'A LITTLE MORE NATURE',
      title: 'Let Your Garden Bloom.',
      subtitle: 'Bring home the colors, calm, and beauty of nature.',
      ctaText: 'DISCOVER FLOWER SEEDS',
      ctaRoute: discoverScreenRoute,
      ctaArguments: 'Flowering Plants & Seeds',
      backgroundColor: AppColors.forestDeep,
      ctaBackgroundColor: AppColors.forestDeep,
      isImageOnly: true,
    ),

    // Slide 4: Grow Fresh. Live Green.
    GlorovBannerSlide(
      id: 'banner_grow_fresh',
      desktopImageUrl: 'assets/images/banner_grow_fresh_desktop.png',
      mobileImageUrl: 'assets/images/banner_grow_fresh_mobile.jpg',
      tag: 'GROW YOUR OWN',
      title: 'Grow Fresh. Live Green.',
      subtitle: 'Turn your little space into a garden full of life.',
      ctaText: 'SHOP VEGETABLE SEEDS',
      ctaRoute: discoverScreenRoute,
      ctaArguments: 'Kitchen Garden Seeds',
      backgroundColor: Color(0xFF183B28),
      ctaBackgroundColor: Color(0xFF183B28),
      isImageOnly: true,
    ),
  ];

  @override
  State<GlorovHeroBannerSlider> createState() => _GlorovHeroBannerSliderState();
}

class _GlorovHeroBannerSliderState extends State<GlorovHeroBannerSlider>
    with SingleTickerProviderStateMixin {
  static const int _kLoopFactor = 10000;

  late final PageController _pageController;
  late final AnimationController _progressController;
  int _currentIndex = 0;
  bool _isInteracting = false;
  List<GlorovBannerSlide>? _dynamicSlides;

  List<GlorovBannerSlide> get _activeSlides =>
      widget.slides ?? _dynamicSlides ?? GlorovHeroBannerSlider.defaultBotanicalSlides;

  int get _initialPage {
    if (_activeSlides.length <= 1) return 0;
    return (_kLoopFactor ~/ 2) * _activeSlides.length;
  }

  @override
  void initState() {
    super.initState();
    final initial = _activeSlides.length > 1
        ? (_kLoopFactor ~/ 2) * _activeSlides.length
        : 0;
    _pageController = PageController(initialPage: initial);

    _progressController = AnimationController(
      vsync: this,
      duration: widget.autoPlayDuration,
    );

    _progressController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        if (!_isInteracting && mounted && _pageController.hasClients) {
          _goToNext();
        }
      }
    });

    _loadRemoteBanners();

    if (widget.autoPlay) {
      _progressController.forward();
    }
  }

  Future<void> _loadRemoteBanners() async {
    if (widget.slides != null) return;
    try {
      final remote = await GlorovRepositories.banners.fetchBanners();
      if (mounted && remote.isNotEmpty) {
        setState(() {
          _dynamicSlides = remote;
          _currentIndex = 0;
        });
        if (_pageController.hasClients) {
          _pageController.jumpToPage(_initialPage);
        }
      }
    } catch (_) {
      // Retain default slides
    }
  }

  @override
  void dispose() {
    _progressController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _pauseAutoScroll() {
    setState(() => _isInteracting = true);
    if (_progressController.isAnimating) {
      _progressController.stop();
    }
  }

  void _resumeAutoScroll() {
    setState(() => _isInteracting = false);
    if (widget.autoPlay && mounted && !_progressController.isAnimating) {
      _progressController.forward();
    }
  }

  /// Always scrolls to the LEFT in a continuous loop
  void _goToPrevious() {
    if (!_pageController.hasClients || _activeSlides.isEmpty) return;
    if (_activeSlides.length == 1) return;
    final currentVirtual = _pageController.page?.round() ?? _initialPage;
    _pageController.animateToPage(
      currentVirtual - 1,
      duration: widget.transitionDuration,
      curve: widget.transitionCurve,
    );
    _restartProgress();
  }

  /// ALWAYS scrolls to the RIGHT in an endless forward loop (never rewinds)
  void _goToNext() {
    if (!_pageController.hasClients || _activeSlides.isEmpty) return;
    if (_activeSlides.length == 1) return;
    final currentVirtual = _pageController.page?.round() ?? _initialPage;
    _pageController.animateToPage(
      currentVirtual + 1,
      duration: widget.transitionDuration,
      curve: widget.transitionCurve,
    );
    _restartProgress();
  }

  /// Navigates to a specific slide pill using the shortest continuous step
  void _goToSlide(int targetRealIndex) {
    if (!_pageController.hasClients || _activeSlides.isEmpty) return;
    if (_activeSlides.length == 1) return;
    final currentVirtual = _pageController.page?.round() ?? _initialPage;
    final currentReal = currentVirtual % _activeSlides.length;
    var diff = targetRealIndex - currentReal;
    if (diff > _activeSlides.length ~/ 2) {
      diff -= _activeSlides.length;
    } else if (diff < -(_activeSlides.length ~/ 2)) {
      diff += _activeSlides.length;
    }
    _pageController.animateToPage(
      currentVirtual + diff,
      duration: widget.transitionDuration,
      curve: widget.transitionCurve,
    );
    _restartProgress();
  }

  void _restartProgress() {
    if (!widget.autoPlay) return;
    _progressController.reset();
    if (!_isInteracting) {
      _progressController.forward();
    }
  }

  /// Responsively calculates slider height based on 20:9 (desktop & tablet) and 5:7 (mobile)
  /// aspect ratios as specified.
  double _computeSliderHeight(BuildContext context, [double? containerWidth]) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final isTablet = AppBreakpoints.isTablet(context);
    final width = containerWidth ?? MediaQuery.of(context).size.width;

    // Explicit overrides if passed
    if (isDesktop && widget.desktopHeight != null) {
      return widget.desktopHeight!;
    }
    if (!isDesktop && !isTablet && widget.mobileHeight != null) {
      return widget.mobileHeight!;
    }

    if (isDesktop || isTablet) {
      // Desktop and Tablet ratio: 20:9 (20.0 / 9.0 ≈ 2.222:1)
      final double targetRatio = widget.aspectRatio ??
          (isDesktop ? widget.desktopAspectRatio : widget.tabletAspectRatio) ??
          (20.0 / 9.0);
      return width / targetRatio;
    } else {
      // Mobile ratio: 5:7 (5.0 / 7.0 ≈ 0.714:1)
      final double targetRatio = widget.mobileAspectRatio ?? (5.0 / 7.0);
      return width / targetRatio;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final isTablet = AppBreakpoints.isTablet(context);
    final isWidescreen = isDesktop || isTablet;
    final slides = _activeSlides;
    final bool fullWidth = widget.isFullWidth;

    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.hasBoundedWidth
            ? constraints.maxWidth
            : MediaQuery.of(context).size.width;
        final double sliderHeight = _computeSliderHeight(context, width);

        final EdgeInsetsGeometry effectiveMargin = widget.margin ??
            (fullWidth
                ? EdgeInsets.zero
                : EdgeInsets.symmetric(
                    horizontal: isDesktop ? AppSpacing.lg : AppSpacing.sm,
                    vertical: isDesktop ? AppSpacing.md : AppSpacing.xs,
                  ));

        final BorderRadius effectiveRadius = widget.borderRadius ??
            (fullWidth
                ? BorderRadius.zero
                : (isDesktop ? AppRadii.roundedXl : BorderRadius.circular(12)));

        final int totalItemCount = slides.length <= 1
            ? slides.length
            : slides.length * _kLoopFactor;

        Widget sliderContent = GlorovYScrollPassThrough(
          child: SizedBox(
            width: double.infinity,
            height: sliderHeight,
            child: Stack(
              children: [
              // 1. PageView Slider (Infinite rightward looping)
              // On desktop: NeverScrollableScrollPhysics passes mouse wheel through to page scroll (NO hijacking)
              // On mobile/tablet: PageScrollPhysics enables natural touch swiping
              ClipRRect(
                borderRadius: effectiveRadius,
                child: ScrollConfiguration(
                  behavior: const GlorovHorizontalScrollBehavior(),
                  child: PageView.builder(
                    controller: _pageController,
                    physics: isDesktop
                        ? const NeverScrollableScrollPhysics()
                        : const PageScrollPhysics(),
                    itemCount: totalItemCount,
                    onPageChanged: (virtualIndex) {
                      final realIndex =
                          slides.isEmpty ? 0 : virtualIndex % slides.length;
                      setState(() => _currentIndex = realIndex);
                      _restartProgress();
                      widget.onSlideChanged?.call(realIndex);
                    },
                    itemBuilder: (context, virtualIndex) {
                      final realIndex =
                          slides.isEmpty ? 0 : virtualIndex % slides.length;
                      final slide = slides[realIndex];
                      return _buildSlideCard(
                        context,
                        slide: slide,
                        isWidescreen: isWidescreen,
                        height: sliderHeight,
                      );
                    },
                  ),
                ),
              ),

              // 2. Desktop Floating Circular Navigation Arrows (< and >)
              if (isDesktop && widget.showArrows && slides.length > 1) ...[
                // Left Arrow
                Positioned(
                  left: 24,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: _SliderArrowButton(
                      icon: Icons.chevron_left_rounded,
                      onTap: _goToPrevious,
                      tooltip: 'Previous Slide',
                    ),
                  ),
                ),
                // Right Arrow (Scrolls Right)
                Positioned(
                  right: 24,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: _SliderArrowButton(
                      icon: Icons.chevron_right_rounded,
                      onTap: _goToNext,
                      tooltip: 'Next Slide',
                    ),
                  ),
                ),
              ],

              // 3. Bottom Animated Pagination Indicator Pills with Progress Bar
              if (widget.showIndicators && slides.length > 1)
                Positioned(
                  bottom: 20,
                  left: 0,
                  right: 0,
                  child: AnimatedBuilder(
                    animation: _progressController,
                    builder: (context, _) {
                      final progress = _progressController.value;
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(slides.length, (i) {
                          final isActive = i == _currentIndex;
                          return GestureDetector(
                            onTap: () => _goToSlide(i),
                            behavior: HitTestBehavior.opaque,
                            child: Container(
                              margin: const EdgeInsets.symmetric(horizontal: 4),
                              width: isActive ? 34 : 8,
                              height: 6,
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.40),
                                borderRadius: BorderRadius.circular(4),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.35),
                                    blurRadius: 4,
                                    offset: const Offset(0, 1.5),
                                  ),
                                ],
                              ),
                              child: isActive
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(4),
                                      child: FractionallySizedBox(
                                        alignment: Alignment.centerLeft,
                                        widthFactor: progress.clamp(0.0, 1.0),
                                        child: Container(
                                          color: Colors.white,
                                        ),
                                      ),
                                    )
                                  : null,
                            ),
                          );
                        }),
                      );
                    },
                  ),
                ),
            ],
          ),
        ),
      );

        if (!fullWidth) {
          sliderContent = Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppBreakpoints.maxContentWidth,
              ),
              child: sliderContent,
            ),
          );
        }

        return Container(
          width: double.infinity,
          margin: effectiveMargin,
          child: MouseRegion(
            onEnter: (_) => _pauseAutoScroll(),
            onExit: (_) => _resumeAutoScroll(),
            child: Listener(
              onPointerDown: (_) => _pauseAutoScroll(),
              onPointerUp: (_) => _resumeAutoScroll(),
              onPointerCancel: (_) => _resumeAutoScroll(),
              child: sliderContent,
            ),
          ),
        );
      },
    );
  }

  /// Builds a responsive slide card using either the mobile or desktop image
  Widget _buildSlideCard(
    BuildContext context, {
    required GlorovBannerSlide slide,
    required bool isWidescreen,
    required double height,
  }) {
    final activeImageUrl = isWidescreen
        ? slide.desktopImageUrl
        : (slide.mobileImageUrl ?? slide.desktopImageUrl);

    return GlorovYScrollPassThrough(
      child: GestureDetector(
        onTap: () {
          if (slide.onTap != null) {
            slide.onTap!();
          } else if (slide.onCtaPressed != null) {
            slide.onCtaPressed!();
          } else {
            Navigator.pushNamed(
              context,
              slide.ctaRoute,
              arguments: slide.ctaArguments,
            );
          }
        },
        child: Container(
          height: height,
          width: double.infinity,
          decoration: BoxDecoration(
            color: slide.backgroundColor,
            boxShadow: AppShadows.card,
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            fit: StackFit.expand,
            children: [
              _buildResponsiveImage(
                activeImageUrl,
                alignment: isWidescreen ? Alignment.centerLeft : Alignment.topCenter,
              ),
              if (!slide.isImageOnly)
                _buildEditorialOverlay(context, slide: slide, isDesktop: isWidescreen),
            ],
          ),
        ),
      ),
    );
  }

  /// Renders either a local asset or network image with shimmer placeholder and high filter quality
  Widget _buildResponsiveImage(String pathOrUrl, {Alignment alignment = Alignment.center}) {
    if (pathOrUrl.startsWith('assets/')) {
      return Image.asset(
        pathOrUrl,
        fit: BoxFit.cover,
        alignment: alignment,
        filterQuality: FilterQuality.high,
        errorBuilder: (_, __, ___) => _buildFallback(),
      );
    }

    return Image.network(
      pathOrUrl,
      fit: BoxFit.cover,
      alignment: alignment,
      filterQuality: FilterQuality.high,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return _buildShimmerLoading();
      },
      errorBuilder: (_, __, ___) => _buildFallback(),
    );
  }

  Widget _buildEditorialOverlay(
    BuildContext context, {
    required GlorovBannerSlide slide,
    required bool isDesktop,
  }) {
    return Positioned.fill(
      child: Container(
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? AppSpacing.xl * 1.5 : AppSpacing.md,
          vertical: isDesktop ? AppSpacing.xl : AppSpacing.md,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.centerLeft,
            end: Alignment.centerRight,
            colors: [
              Colors.black.withValues(alpha: 0.65),
              Colors.black.withValues(alpha: 0.35),
              Colors.transparent,
            ],
            stops: const [0.0, 0.55, 1.0],
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (slide.tag != null)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.20),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: Colors.white.withValues(alpha: 0.35),
                  ),
                ),
                child: Text(
                  slide.tag!,
                  style: AppTypography.textTheme(Colors.white).labelSmall?.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.1,
                  ),
                ),
              ),
            if (slide.title != null)
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: isDesktop ? 600 : double.infinity,
                ),
                child: Text(
                  slide.title!,
                  style: isDesktop
                      ? AppTypography.textTheme(Colors.white).displayMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          height: 1.1,
                        )
                      : AppTypography.textTheme(Colors.white).headlineLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w800,
                          height: 1.15,
                        ),
                ),
              ),
            if (slide.subtitle != null) ...[
              const SizedBox(height: 10),
              ConstrainedBox(
                constraints: BoxConstraints(
                  maxWidth: isDesktop ? 520 : double.infinity,
                ),
                child: Text(
                  slide.subtitle!,
                  style: AppTypography.textTheme(Colors.white).bodyMedium?.copyWith(
                    color: Colors.white.withValues(alpha: 0.90),
                    height: 1.4,
                  ),
                  maxLines: isDesktop ? 3 : 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
            const SizedBox(height: 18),
            ElevatedButton(
              onPressed: () {
                if (slide.onCtaPressed != null) {
                  slide.onCtaPressed!();
                } else {
                  Navigator.pushNamed(
                    context,
                    slide.ctaRoute,
                    arguments: slide.ctaArguments,
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: slide.ctaBackgroundColor,
                foregroundColor: slide.ctaForegroundColor,
                padding: EdgeInsets.symmetric(
                  horizontal: isDesktop ? 24 : 18,
                  vertical: isDesktop ? 14 : 10,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 3,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    slide.ctaText,
                    style: AppTypography.textTheme(Colors.white).labelLarge?.copyWith(
                      color: slide.ctaForegroundColor,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_rounded, size: 16),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return Container(
      color: AppColors.mintSurface.withValues(alpha: 0.3),
      child: const Center(
        child: SizedBox(
          width: 32,
          height: 32,
          child: CircularProgressIndicator(
            strokeWidth: 2.5,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.forestDeep),
          ),
        ),
      ),
    );
  }

  Widget _buildFallback() {
    return Container(
      color: AppColors.mintSurface,
      child: const Center(
        child: Icon(
          Icons.spa_outlined,
          color: AppColors.forestDeep,
          size: 48,
        ),
      ),
    );
  }
}

/// Circular Floating Navigation Arrow Button for Desktop Slider
class _SliderArrowButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback onTap;
  final String tooltip;

  const _SliderArrowButton({
    required this.icon,
    required this.onTap,
    required this.tooltip,
  });

  @override
  State<_SliderArrowButton> createState() => _SliderArrowButtonState();
}

class _SliderArrowButtonState extends State<_SliderArrowButton> {
  bool _isHovered = false;
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip,
      child: MouseRegion(
        onEnter: (_) => setState(() => _isHovered = true),
        onExit: (_) => setState(() => _isHovered = false),
        cursor: SystemMouseCursors.click,
        child: GestureDetector(
          onTapDown: (_) => setState(() => _isPressed = true),
          onTapUp: (_) => setState(() => _isPressed = false),
          onTapCancel: () => setState(() => _isPressed = false),
          onTap: widget.onTap,
          child: AnimatedScale(
            scale: _isPressed ? 0.92 : (_isHovered ? 1.08 : 1.0),
            duration: const Duration(milliseconds: 160),
            curve: Curves.easeOutCubic,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFF1E3D2F), // Forest green brand accent
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.28),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Center(
                child: Icon(
                  widget.icon,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
