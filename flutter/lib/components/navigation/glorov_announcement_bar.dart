import 'package:flutter/material.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_announcement.dart';
import '../../repositories/glorov_repositories.dart';
import '../../services/glorov_header_scroll_notifier.dart';

/// GLOROV Infinite Horizontal Continuous Marquee Announcement Bar
///
/// Features:
/// 1. Smooth 60fps/120fps hardware-accelerated linear auto-scrolling moving right-to-left.
/// 2. Infinite seamless wrap without jumps or visual glitching.
/// 3. Dynamic backend control: driven by GlorovRepositories.announcements (Medusa API `/store/announcements`).
/// 4. Interactive: pauses smoothly on mouse hover (desktop web) and finger touch (mobile).
/// 5. High-contrast botanical luxury styling: Forest Deep background, amber/gold badges, crisp typography.
/// 6. Auto-pauses animation when header is collapsed out of view to preserve CPU and battery.
class GlorovAnnouncementBar extends StatefulWidget {
  final List<GlorovAnnouncementItem>? customItems;
  final GlorovAnnouncementConfig? customConfig;
  final bool? isAnimated;
  final ValueChanged<GlorovAnnouncementItem>? onItemTap;

  const GlorovAnnouncementBar({
    super.key,
    this.customItems,
    this.customConfig,
    this.isAnimated,
    this.onItemTap,
  });

  @override
  State<GlorovAnnouncementBar> createState() => _GlorovAnnouncementBarState();
}

class _GlorovAnnouncementBarState extends State<GlorovAnnouncementBar>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  late final AnimationController _controller;
  final GlobalKey _singleSetKey = GlobalKey();

  List<GlorovAnnouncementItem> _items = GlorovAnnouncementItem.defaultItems;
  GlorovAnnouncementConfig _config = GlorovAnnouncementConfig.defaultConfig;
  double _singleSetWidth = 1400.0;
  bool _isHovered = false;
  bool _isTouched = false;

  bool get _shouldAnimate {
    if (widget.isAnimated != null) return widget.isAnimated!;
    final inTest = WidgetsBinding.instance.runtimeType.toString().contains('Test');
    return !inTest;
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.customItems != null && widget.customItems!.isNotEmpty) {
      _items = widget.customItems!;
    }
    if (widget.customConfig != null) {
      _config = widget.customConfig!;
    }

    final durationSeconds = _config.speedSeconds > 0 ? _config.speedSeconds : 30;
    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: durationSeconds),
    );

    if (_shouldAnimate && _config.isEnabled) {
      _controller.repeat();
    }

    _loadData();
    GlorovHeaderScrollNotifier.instance.addListener(_handleScrollChange);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted && widget.customItems == null) {
      _loadData();
    }
  }

  void _handleScrollChange() {
    if (!mounted) return;
    final isVisible = GlorovHeaderScrollNotifier.instance.showAnnouncement;
    if (!isVisible && _controller.isAnimating) {
      _controller.stop(canceled: false);
    } else if (isVisible && !_controller.isAnimating && !_isHovered && !_isTouched && _shouldAnimate && _config.isEnabled) {
      _controller.repeat();
    }
  }

  Future<void> _loadData() async {
    if (widget.customItems != null && widget.customConfig != null) return;

    try {
      final items = await GlorovRepositories.announcements.fetchAnnouncements();
      final config = await GlorovRepositories.announcements.fetchConfig();

      if (mounted) {
        setState(() {
          if (widget.customItems == null && items.isNotEmpty) {
            _items = items;
          }
          if (widget.customConfig == null) {
            _config = config;
            final newDuration = Duration(seconds: _config.speedSeconds > 0 ? _config.speedSeconds : 30);
            if (_controller.duration != newDuration) {
              _controller.duration = newDuration;
              if (_shouldAnimate && _config.isEnabled && !_isHovered && !_isTouched) {
                _controller.repeat();
              }
            }
          }
        });
      }
    } catch (_) {}
  }

  void _measureSingleSetWidth() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final renderBox = _singleSetKey.currentContext?.findRenderObject() as RenderBox?;
      if (renderBox != null && renderBox.hasSize) {
        final measuredWidth = renderBox.size.width;
        if (measuredWidth > 0 && (measuredWidth - _singleSetWidth).abs() > 2.0) {
          setState(() {
            _singleSetWidth = measuredWidth;
          });
        }
      }
    });
  }

  void _pauseAnimation() {
    if (!_config.pauseOnHover) return;
    if (_controller.isAnimating) {
      _controller.stop(canceled: false);
    }
  }

  void _resumeAnimation() {
    if (!_shouldAnimate || !_config.isEnabled) return;
    if (!_isHovered && !_isTouched && mounted) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    GlorovHeaderScrollNotifier.instance.removeListener(_handleScrollChange);
    _controller.dispose();
    super.dispose();
  }

  IconData _getIconData(String? iconName) {
    switch (iconName) {
      case 'local_shipping':
      case 'truck':
        return Icons.local_shipping_outlined;
      case 'spa':
      case 'sprout':
        return Icons.eco_outlined;
      case 'bolt':
      case 'zap':
        return Icons.bolt_outlined;
      case 'percent':
        return Icons.percent_outlined;
      case 'ac_unit':
      case 'winter':
        return Icons.ac_unit_outlined;
      case 'verified':
        return Icons.verified_outlined;
      case 'shield':
        return Icons.shield_outlined;
      default:
        return Icons.auto_awesome;
    }
  }

  Widget _buildItem(GlorovAnnouncementItem item) {
    return InkWell(
      onTap: widget.onItemTap != null ? () => widget.onItemTap!(item) : null,
      splashColor: Colors.transparent,
      highlightColor: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // Icon
            Icon(
              _getIconData(item.icon),
              size: 13,
              color: _config.highlightColor,
            ),
            const SizedBox(width: 6),

            // Optional Highlight Badge (e.g. ₹499 FREE DELIVERY)
            if (item.highlightText != null && item.highlightText!.trim().isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                decoration: BoxDecoration(
                  color: _config.highlightColor,
                  borderRadius: AppRadii.roundedSm,
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x26000000),
                      blurRadius: 2,
                      offset: Offset(0, 1),
                    ),
                  ],
                ),
                child: Text(
                  item.highlightText!,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.4,
                    color: Color(0xFF111827),
                  ),
                ),
              ),
              const SizedBox(width: 7),
            ],

            // Message Text
            Text(
              item.text,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 11.5,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
                color: _config.textColor,
              ),
            ),

            const SizedBox(width: 14),

            // Botanical bullet separator
            Text(
              '•',
              style: TextStyle(
                fontSize: 12,
                color: _config.textColor.withOpacity(0.35),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildItemsRow({Key? key}) {
    return Row(
      key: key,
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: _items.map(_buildItem).toList(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (!_config.isEnabled || _items.isEmpty) {
      return const SizedBox.shrink();
    }

    _measureSingleSetWidth();

    return ListenableBuilder(
      listenable: GlorovHeaderScrollNotifier.instance,
      builder: (context, _) {
        final isVisible = GlorovHeaderScrollNotifier.instance.showAnnouncement;

        return ClipRect(
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 240),
            curve: Curves.easeInOutCubic,
            height: isVisible ? 34.0 : 0.0,
            child: AnimatedOpacity(
              duration: const Duration(milliseconds: 180),
              curve: Curves.easeInOut,
              opacity: isVisible ? 1.0 : 0.0,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: _config.bgColor,
                  border: Border(
                    bottom: BorderSide(
                      color: Colors.white.withOpacity(0.08),
                      width: 1.0,
                    ),
                  ),
                ),
                child: MouseRegion(
                  onEnter: (_) {
                    _isHovered = true;
                    _pauseAnimation();
                  },
                  onExit: (_) {
                    _isHovered = false;
                    _resumeAnimation();
                  },
                  child: GestureDetector(
                    behavior: HitTestBehavior.translucent,
                    onTapDown: (_) {
                      _isTouched = true;
                      _pauseAnimation();
                    },
                    onTapUp: (_) {
                      _isTouched = false;
                      _resumeAnimation();
                    },
                    onTapCancel: () {
                      _isTouched = false;
                      _resumeAnimation();
                    },
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        return AnimatedBuilder(
                          animation: _controller,
                          builder: (context, child) {
                            // Translate by fraction of singleSetWidth for seamless infinite cycle
                            final offset = -(_controller.value * _singleSetWidth);

                            return Transform.translate(
                              offset: Offset(offset, 0),
                              child: child,
                            );
                          },
                          // Render 3 duplicate rows side-by-side to guarantee seamless continuity
                          // across any screen width (mobile, tablet, desktop, ultra-wide)
                          child: OverflowBox(
                            minWidth: 0.0,
                            maxWidth: double.infinity,
                            alignment: Alignment.centerLeft,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                _buildItemsRow(key: _singleSetKey),
                                _buildItemsRow(),
                                _buildItemsRow(),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
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
