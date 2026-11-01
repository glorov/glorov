import 'package:flutter/material.dart';
import '../../core/icons/glorov_category_svg_icons.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_typography.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/glorov_header_scroll_notifier.dart';

/// GLOROV Mobile Storefront Bottom Navigation Dock ("Footer View / Navigation")
/// Fixed bottom navigation bar for mobile storefront screens.
/// Features exactly 4 essential actions (Search removed as requested):
/// 1. Home
/// 2. Categories (opens category drawer or navigates to catalog)
/// 3. Cart (with live reactive badge count)
/// 4. Account / Profile
///
/// Dynamic Scroll Behavior (Amazon / Flipkart Model):
/// - Scrolled to top (pixels <= 8): Hidden or resting so the hero section has focus.
/// - Scrolling DOWN: Slides UP into view (appears in mobile).
/// - Scrolling UP: Slides DOWN out of view (hides in mobile).
/// - Layout height is fixed; uses GPU translation (AnimatedSlide) to prevent page viewport jumps.
///
/// Automatically hides on desktop screens (>=768px).
class GlorovMobileBottomNav extends StatelessWidget {
  final String? currentRoute;
  final bool? isVisible;

  const GlorovMobileBottomNav({
    super.key,
    this.currentRoute,
    this.isVisible,
  });

  @override
  Widget build(BuildContext context) {
    // Only render on mobile / tablet screens; desktop uses the full top header
    if (AppBreakpoints.isDesktop(context)) {
      return const SizedBox.shrink();
    }

    final activeRoute = currentRoute ??
        ModalRoute.of(context)?.settings.name ??
        homeScreenRoute;

    return ListenableBuilder(
      listenable: GlorovHeaderScrollNotifier.instance,
      builder: (context, _) {
        final effectiveVisible = isVisible ??
            GlorovHeaderScrollNotifier.instance.isBottomNavVisible;

        return IgnorePointer(
          ignoring: !effectiveVisible,
          child: AnimatedSlide(
            offset: effectiveVisible ? Offset.zero : const Offset(0, 1.2),
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeOutCubic,
            child: Container(
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(
                top: BorderSide(color: Color(0xFFE5E7EB), width: 1.0),
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0x14000000),
                  blurRadius: 14,
                  offset: Offset(0, -3),
                ),
              ],
            ),
            child: SafeArea(
              top: false,
              child: Container(
                height: 60.0,
                padding:
                    const EdgeInsets.symmetric(horizontal: 10.0, vertical: 4.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    // 1. Home
                    _BottomNavItem(
                      icon: Icons.home_outlined,
                      activeIcon: Icons.home_rounded,
                      label: 'Home',
                      isActive: activeRoute == homeScreenRoute ||
                          activeRoute == '/' ||
                          activeRoute == '',
                      onTap: () {
                        if (activeRoute != homeScreenRoute &&
                            activeRoute != '/' &&
                            activeRoute != '') {
                          if (Navigator.canPop(context)) {
                            Navigator.popUntil(context, (route) => route.isFirst);
                          } else {
                            Navigator.pushReplacementNamed(context, homeScreenRoute);
                          }
                        }
                      },
                    ),

                    // 2. Categories (Full Page Category Section)
                    _BottomNavItem(
                      icon: Icons.grid_view_outlined,
                      activeIcon: Icons.grid_view_rounded,
                      label: 'Categories',
                      isActive: activeRoute == discoverScreenRoute,
                      onTap: () {
                        if (activeRoute != discoverScreenRoute) {
                          Navigator.pushNamed(context, discoverScreenRoute);
                        }
                      },
                    ),

                    // 3. Cart (with live reactive badge count)
                    ListenableBuilder(
                      listenable: GlorovCartState.instance,
                      builder: (context, _) {
                        final count = GlorovCartState.instance.itemCount;
                        return _BottomNavItem(
                          icon: Icons.shopping_bag_outlined,
                          activeIcon: Icons.shopping_bag_rounded,
                          label: 'Cart',
                          isActive: activeRoute == cartScreenRoute,
                          badgeCount: count,
                          onTap: () {
                            if (activeRoute != cartScreenRoute) {
                              Navigator.pushNamed(context, cartScreenRoute);
                            }
                          },
                        );
                      },
                    ),

                    // 4. Account / Profile: Dynamic based on authentication status
                    ListenableBuilder(
                      listenable: GlorovAccountState.instance,
                      builder: (context, _) {
                        final accountState = GlorovAccountState.instance;
                        final isAuthenticated = accountState.isAuthenticated;
                        final profile = accountState.profile;

                        if (isAuthenticated) {
                          return _BottomNavItem(
                            customIcon: Container(
                              width: 22,
                              height: 22,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.forestDark,
                                border: Border.all(
                                  color: AppColors.sage,
                                  width: 1.2,
                                ),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                profile.initials,
                                style: const TextStyle(
                                  fontFamily: AppTypography.displayFont,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                            label: 'Account',
                            isActive: activeRoute == profileScreenRoute,
                            onTap: () {
                              if (activeRoute != profileScreenRoute) {
                                Navigator.pushNamed(context, profileScreenRoute);
                              }
                            },
                          );
                        }

                        // Not Logged In: Guest Custom SVG Icon
                        return _BottomNavItem(
                          customIcon: GlorovCategorySvgIcons.buildSvgIcon(
                            GlorovCategorySvgIcons.guestUser,
                            size: 20,
                            color: activeRoute == profileScreenRoute
                                ? AppColors.forestDeep
                                : const Color(0xFF6B7280),
                          ),
                          label: 'Sign In',
                          isActive: activeRoute == logInScreenRoute,
                          onTap: () {
                            if (activeRoute != logInScreenRoute) {
                              Navigator.pushNamed(context, logInScreenRoute);
                            }
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
      },
    );
  }
}

// -----------------------------------------------------------------------------
// Interactive Mobile Bottom Nav Item with Botanical Spring Micro-Interactions
// -----------------------------------------------------------------------------
class _BottomNavItem extends StatefulWidget {
  final IconData? icon;
  final IconData? activeIcon;
  final Widget? customIcon;
  final Widget? customActiveIcon;
  final String label;
  final bool isActive;
  final int badgeCount;
  final VoidCallback onTap;

  const _BottomNavItem({
    this.icon,
    this.activeIcon,
    this.customIcon,
    this.customActiveIcon,
    required this.label,
    required this.isActive,
    this.badgeCount = 0,
    required this.onTap,
  }) : assert(icon != null || customIcon != null);

  @override
  State<_BottomNavItem> createState() => _BottomNavItemState();
}

class _BottomNavItemState extends State<_BottomNavItem>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 260),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.0, end: 1.15)
            .chain(CurveTween(curve: Curves.easeOutCubic)),
        weight: 40,
      ),
      TweenSequenceItem(
        tween: Tween<double>(begin: 1.15, end: 1.0)
            .chain(CurveTween(curve: Curves.elasticOut)),
        weight: 60,
      ),
    ]).animate(_controller);

    if (widget.isActive) {
      _controller.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(covariant _BottomNavItem oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.isActive && widget.isActive) {
      _controller.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isActive = widget.isActive;
    final color = isActive ? AppColors.forestDeep : const Color(0xFF6B7280);

    return Expanded(
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _isPressed = true),
        onTapUp: (_) => setState(() => _isPressed = false),
        onTapCancel: () => setState(() => _isPressed = false),
        onTap: widget.onTap,
        child: AnimatedScale(
          scale: _isPressed ? 0.90 : 1.0,
          duration: const Duration(milliseconds: 140),
          curve: Curves.easeOutCubic,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Icon with active mint pill wash and badge support
              Stack(
                clipBehavior: Clip.none,
                alignment: Alignment.center,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOutCubic,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: isActive
                          ? const Color(
                              0xFFD8F3DC) // Mint active pill highlight
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: AnimatedBuilder(
                      animation: _scaleAnimation,
                      builder: (context, child) {
                        final renderedWidget = (isActive
                                ? widget.customActiveIcon ?? widget.customIcon
                                : widget.customIcon) ??
                            Icon(
                              isActive
                                  ? (widget.activeIcon ?? widget.icon!)
                                  : widget.icon!,
                              size: 22,
                              color: color,
                            );

                        return Transform.scale(
                          scale: isActive ? _scaleAnimation.value : 1.0,
                          child: renderedWidget,
                        );
                      },
                    ),
                  ),

                  // Cart / Item Count Badge
                  if (widget.badgeCount > 0)
                    Positioned(
                      top: -2,
                      right: 4,
                      child: AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        transitionBuilder: (child, anim) =>
                            ScaleTransition(scale: anim, child: child),
                        child: Container(
                          key: ValueKey<int>(widget.badgeCount),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 5,
                            vertical: 1.5,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.forestDeep, // Match GLOROV theme
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.white, width: 1.2),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x33000000),
                                blurRadius: 3,
                                offset: Offset(0, 1),
                              ),
                            ],
                          ),
                          constraints: const BoxConstraints(
                            minWidth: 16,
                            minHeight: 16,
                          ),
                          child: Center(
                            child: Text(
                              widget.badgeCount > 99
                                  ? '99+'
                                  : '${widget.badgeCount}',
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                height: 1.0,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),

              const SizedBox(height: 2),

              // Label Text
              Text(
                widget.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 10.5,
                  fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                  color: color,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
