import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../route/route_constants.dart';
import '../../route/router.dart' show glorovRouteObserver;
import '../../services/glorov_header_scroll_notifier.dart';
import 'glorov_announcement_bar.dart';
import 'glorov_drawer.dart';
import 'glorov_header.dart';
import 'glorov_mobile_bottom_nav.dart';

/// Centralized Storefront Scaffold providing Amazon/Flipkart-style dynamic navigation:
/// 1. Zero Page Height Shift:
///    The scrollable content occupies a constant full-height viewport via Positioned.fill.
///    The viewport layout height NEVER changes during scroll -> ZERO layout shift or jump.
///
/// 2. Sticky Floating Top Navigation:
///    - Scrolled to maximum top (pixels <= 8): Fully open with announcement bar and category icons.
///    - Scrolling DOWN: Slides UP smoothly out of view (hides always on desktop & mobile).
///    - Scrolling UP: Slides DOWN into view (opens top navigation).
///    - Mid-page scrolling up: Announcement bar remains hidden (only shown at maximum top).
///    - Y-Scroll Pass-Through: Mouse wheel and vertical swipe anywhere over the header
///      smoothly scrolls the main page content, eliminating stuck/dead scrolling.
///
/// 3. Sticky Floating Mobile Bottom Navigation Dock:
///    - Scrolled to maximum top (pixels <= 8): Hidden so the hero section has primary focus.
///    - Scrolling DOWN: Slides UP smoothly into view (appears in mobile).
///    - Scrolling UP: Slides DOWN out of view (hides in mobile).
///    - Contains exactly 4 items: Home, Categories, Cart, Account (Search removed).
class GlorovStorefrontScaffold extends StatefulWidget {
  final Widget child;
  final String? currentRoute;
  final ValueChanged<String>? onSearchSubmitted;
  final Widget? drawer;
  final Color? backgroundColor;
  final ScrollController? scrollController;
  final bool showTopNav;
  final bool showBottomNav;
  final bool alwaysShowBottomNav;
  final bool showAnnouncement;
  final Widget? bottomNavigationBar;
  final bool isContentScrollable;

  const GlorovStorefrontScaffold({
    super.key,
    required this.child,
    this.currentRoute,
    this.onSearchSubmitted,
    this.drawer,
    this.backgroundColor,
    this.scrollController,
    this.showTopNav = true,
    this.showBottomNav = true,
    this.alwaysShowBottomNav = false,
    this.showAnnouncement = true,
    this.bottomNavigationBar,
    this.isContentScrollable = true,
  });

  @override
  State<GlorovStorefrontScaffold> createState() => _GlorovStorefrontScaffoldState();
}

class _GlorovStorefrontScaffoldState extends State<GlorovStorefrontScaffold>
    with RouteAware {
  ScrollController? _internalScrollController;

  ScrollController get _effectiveScrollController =>
      widget.scrollController ?? (_internalScrollController ??= ScrollController());

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final modalRoute = ModalRoute.of(context);
    if (modalRoute != null) {
      glorovRouteObserver.subscribe(this, modalRoute);
    }
  }

  @override
  void didPopNext() {
    super.didPopNext();
    final isHome = widget.currentRoute == homeScreenRoute ||
        widget.currentRoute == '/' ||
        widget.currentRoute == '' ||
        widget.currentRoute == '/home';
    if (isHome) {
      GlorovHeaderScrollNotifier.instance.clearCategory();
    }
  }

  @override
  void initState() {
    super.initState();
    if (widget.showTopNav) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          final isHome = widget.currentRoute == homeScreenRoute ||
              widget.currentRoute == '/' ||
              widget.currentRoute == '' ||
              widget.currentRoute == '/home';
          GlorovHeaderScrollNotifier.instance.reset(
            clearCategory: isHome,
          );
        }
      });
    }
  }

  @override
  void didUpdateWidget(covariant GlorovStorefrontScaffold oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.currentRoute != oldWidget.currentRoute ||
        (widget.showTopNav && !oldWidget.showTopNav)) {
      if (widget.showTopNav) {
        final isHome = widget.currentRoute == homeScreenRoute ||
            widget.currentRoute == '/' ||
            widget.currentRoute == '' ||
            widget.currentRoute == '/home';
        GlorovHeaderScrollNotifier.instance.reset(
          clearCategory: isHome,
        );
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            GlorovHeaderScrollNotifier.instance.reset(
              clearCategory: isHome,
            );
          }
        });
      }
    }
  }

  @override
  void dispose() {
    glorovRouteObserver.unsubscribe(this);
    _internalScrollController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);

    // Constant layout padding so content starts right below header at scroll 0,
    // and ends cleanly above mobile dock at scroll bottom.
    // Constant padding ensures ZERO layout height shifts or viewport resize jumps!
    // Full header height with announcement bar: Desktop 166px (132 + 34), Tablet/Mobile 158px (124 + 34).
    final double topNavOffset = widget.showTopNav
        ? (isDesktop ? 166.0 : 158.0)
        : 0.0;
    final double bottomNavOffset = (!isDesktop && widget.showBottomNav && widget.bottomNavigationBar == null)
        ? 68.0
        : 0.0;

    return Scaffold(
      backgroundColor: widget.backgroundColor ?? AppColors.surfaceCream,
      drawer: widget.drawer ?? const GlorovDrawer(),
      bottomNavigationBar: widget.bottomNavigationBar,
      body: NotificationListener<ScrollNotification>(
        onNotification: (notification) {
          // Process vertical scroll notifications for dynamic header slide
          // when page content is scrollable (depth == 0)
          if (widget.isContentScrollable &&
              notification is ScrollUpdateNotification &&
              notification.metrics.axis == Axis.vertical &&
              notification.depth == 0) {
            GlorovHeaderScrollNotifier.instance.handleScroll(
              notification.metrics.pixels,
              notification.scrollDelta,
              notification.metrics.maxScrollExtent,
            );
          }
          return false;
        },
        child: Stack(
          children: [
            // 1. Full-Height Content Area (CONSTANT viewport height)
            Positioned.fill(
              child: widget.isContentScrollable
                  ? SingleChildScrollView(
                      controller: _effectiveScrollController,
                      padding: EdgeInsets.only(
                        top: topNavOffset,
                        bottom: bottomNavOffset,
                      ),
                      child: widget.child,
                    )
                  : Padding(
                      padding: EdgeInsets.only(
                        top: topNavOffset,
                        bottom: bottomNavOffset,
                      ),
                      child: widget.child,
                    ),
            ),

            // 2. Fixed/Sticky Floating Top Navigation
            // Slides UP and hides when scrolling down; slides DOWN into view when scrolling up
            // Equipped with Y-scroll pass-through so vertical mouse wheel and touch gestures over the header
            // seamlessly scroll the page content without hijacking.
            if (widget.showTopNav)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Listener(
                  behavior: HitTestBehavior.translucent,
                  onPointerSignal: (pointerSignal) {
                    if (pointerSignal is PointerScrollEvent &&
                        pointerSignal.scrollDelta.dy != 0) {
                      if (_effectiveScrollController.hasClients) {
                        _effectiveScrollController.position
                            .pointerScroll(pointerSignal.scrollDelta.dy);
                      }
                    }
                  },
                  child: GestureDetector(
                    behavior: HitTestBehavior.translucent,
                    onVerticalDragUpdate: (details) {
                      if (_effectiveScrollController.hasClients &&
                          details.primaryDelta != null) {
                        final newOffset = (_effectiveScrollController.offset -
                                details.primaryDelta!)
                            .clamp(
                                0.0,
                                _effectiveScrollController
                                    .position.maxScrollExtent);
                        _effectiveScrollController.jumpTo(newOffset);
                      }
                    },
                    child: ListenableBuilder(
                      listenable: GlorovHeaderScrollNotifier.instance,
                      builder: (context, _) {
                        final isAtTop = !_effectiveScrollController.hasClients ||
                            _effectiveScrollController.offset <=
                                GlorovHeaderScrollNotifier.topThreshold;
                        final isTopVisible = isAtTop ||
                            GlorovHeaderScrollNotifier.instance.isTopNavVisible;

                        return IgnorePointer(
                          ignoring: !isTopVisible,
                          child: AnimatedSlide(
                            offset: isTopVisible
                                ? Offset.zero
                                : const Offset(0, -1.0),
                            duration: const Duration(milliseconds: 240),
                            curve: Curves.easeOutCubic,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                if (widget.showAnnouncement)
                                  const GlorovAnnouncementBar(),
                                GlorovHeader(
                                  currentRoute: widget.currentRoute,
                                  onSearchSubmitted: widget.onSearchSubmitted,
                                  pageScrollController:
                                      _effectiveScrollController,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
              ),

            // 3. Fixed/Sticky Floating Mobile Bottom Navigation Dock
            // Always visible on Category, Cart, Account / Profile, and Policy screens (or when alwaysShowBottomNav is true)
            if (!isDesktop && widget.showBottomNav && widget.bottomNavigationBar == null)
              Positioned(
                bottom: 0,
                left: 0,
                right: 0,
                child: GlorovMobileBottomNav(
                  currentRoute: widget.currentRoute,
                  isVisible: (widget.alwaysShowBottomNav ||
                          widget.currentRoute == discoverScreenRoute ||
                          widget.currentRoute == cartScreenRoute ||
                          widget.currentRoute == profileScreenRoute ||
                          widget.currentRoute == privacyPolicyScreenRoute ||
                          widget.currentRoute == termsOfServicesScreenRoute ||
                          widget.currentRoute ==
                              shippingAndTrustPolicyScreenRoute ||
                          widget.currentRoute == policiesScreenRoute)
                      ? true
                      : null,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
