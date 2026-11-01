import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/interactions/interaction_feedback.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_trust_badge.dart';
import '../../repositories/glorov_repositories.dart';
import '../common/glorov_custom_trust_icon.dart';
import 'glorov_offer_banner.dart';

/// Legacy ValuePropItem alias for backwards compatibility
class ValuePropItem {
  final IconData icon;
  final String title;
  final String description;

  const ValuePropItem({
    required this.icon,
    required this.title,
    required this.description,
  });
}

/// GLOROV Botanical Trust Guarantees Ribbon
/// Redesigned to match Image 2 reference:
/// - Unified horizontal banner with rounded corners
/// - Signature GLOROV botanical green theme
/// - 4 trust guarantee pillars separated by vertical dividers
/// - Circular white icon badges with custom line-art botanical icons
/// - Fully responsive across Mobile and Desktop
/// - Dynamic backend synchronization via Medusa Admin (/admin/trust-badges)
class GlorovValueProps extends StatefulWidget {
  final List<GlorovTrustBadgeItem>? initialBadges;
  final GlorovTrustSectionSettings? initialSettings;

  const GlorovValueProps({
    super.key,
    this.initialBadges,
    this.initialSettings,
  });

  /// Static items accessor for backward-compatibility with tests
  static const List<ValuePropItem> items = [
    ValuePropItem(
      icon: Icons.verified_outlined,
      title: '90-Day Pre-Fertilised Soil',
      description:
          'Open-pollinated, chemical-free heirloom seeds tested for 98%+ germination vigor.',
    ),
    ValuePropItem(
      icon: Icons.local_shipping_outlined,
      title: 'Arrives Healthy',
      description:
          'Custom ventilated botanical packaging ensures live houseplants arrive lush and shock-free.',
    ),
    ValuePropItem(
      icon: Icons.volunteer_activism_outlined,
      title: 'Free Replacement',
      description:
          'Our in-house botanists guide your potting, watering, and harvesting every step of the way.',
    ),
    ValuePropItem(
      icon: Icons.recycling_outlined,
      title: 'Free Plant Care Support',
      description:
          'Biodegradable seed sleeves, plastic-free shipping containers, and sustainable coco-coir.',
    ),
  ];

  @override
  State<GlorovValueProps> createState() => _GlorovValuePropsState();
}

class _GlorovValuePropsState extends State<GlorovValueProps>
    with WidgetsBindingObserver {
  List<GlorovTrustBadgeItem> _badges = GlorovTrustBadgeItem.defaults;
  GlorovTrustSectionSettings _settings = const GlorovTrustSectionSettings();
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.initialBadges != null) {
      _badges = widget.initialBadges!;
      _settings = widget.initialSettings ?? const GlorovTrustSectionSettings();
      _isLoading = false;
    } else {
      _loadBadges();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && mounted && widget.initialBadges == null) {
      _loadBadges();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  Future<void> _loadBadges() async {
    try {
      final res = await GlorovRepositories.trustBadges.fetchTrustBadges();
      if (mounted) {
        setState(() {
          if (res.badges.isNotEmpty) {
            _badges = res.badges;
          }
          _settings = res.settings;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _badges = GlorovTrustBadgeItem.defaults;
          _settings = const GlorovTrustSectionSettings();
          _isLoading = false;
        });
      }
    }
  }

  void _handleItemTap(GlorovTrustBadgeItem item) {
    if (item.ctaRoute != null && item.ctaRoute!.isNotEmpty) {
      HapticFeedback.lightImpact();
      Navigator.of(context).pushNamed(item.ctaRoute!);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_settings.isVisible && !_isLoading) {
      return const SizedBox.shrink();
    }

    final isDesktop = AppBreakpoints.isDesktop(context);
    final width = MediaQuery.of(context).size.width;

    return Container(
      width: double.infinity,
      color: AppColors.surfacePure,
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.lg : AppSpacing.sm + 2,
        vertical: isDesktop ? AppSpacing.xxl : 10.0,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // 1. Dynamic Botanical Offer Welcome Banner
              Padding(
                padding: EdgeInsets.only(bottom: isDesktop ? AppSpacing.lg : 10.0),
                child: const GlorovOfferBanner(),
              ),

              // 2. The Unified Trust Ribbon Bar (Image 2 style with Green Theme)
              _buildTrustRibbonBar(context, isDesktop, width),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTrustRibbonBar(
      BuildContext context, bool isDesktop, double screenWidth) {
    final activeBadges = _badges.where((b) => b.isActive).toList();
    if (activeBadges.isEmpty) {
      return const SizedBox.shrink();
    }

    final isNarrowMobile = screenWidth < 380;
    final iconCircleSize = isDesktop ? 50.0 : (isNarrowMobile ? 38.0 : 44.0);
    final iconInnerSize = isDesktop ? 26.0 : (isNarrowMobile ? 18.0 : 21.0);
    final textFontSize = isDesktop ? 14.0 : (isNarrowMobile ? 10.0 : 11.5);
    final dividerHeight = isDesktop ? 46.0 : 36.0;

    return Semantics(
      label: 'GLOROV botanical trust guarantees and policies',
      container: true,
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: _settings.bgColor,
          borderRadius: BorderRadius.circular(_settings.borderRadius),
          boxShadow: [
            BoxShadow(
              color: _settings.bgColor.withValues(alpha: 0.18),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        padding: EdgeInsets.symmetric(
          horizontal: isDesktop ? AppSpacing.xl : AppSpacing.sm,
          vertical: isDesktop ? 22.0 : 14.0,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            for (int i = 0; i < activeBadges.length; i++) ...[
              if (i > 0)
                Container(
                  width: 1,
                  height: dividerHeight,
                  margin: EdgeInsets.symmetric(
                    horizontal: isDesktop ? AppSpacing.md : 2.0,
                  ),
                  color: _settings.dividerColor,
                ),
              Expanded(
                child: _buildTrustItem(
                  activeBadges[i],
                  iconCircleSize,
                  iconInnerSize,
                  textFontSize,
                  isDesktop,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildTrustItem(
    GlorovTrustBadgeItem item,
    double circleSize,
    double iconSize,
    double fontSize,
    bool isDesktop,
  ) {
    final hasRoute = item.ctaRoute != null && item.ctaRoute!.isNotEmpty;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: hasRoute ? () => _handleItemTap(item) : null,
        borderRadius: BorderRadius.circular(12),
        hoverColor: Colors.white.withValues(alpha: 0.08),
        splashColor: Colors.white.withValues(alpha: 0.12),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4.0, horizontal: 2.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Circular White Badge with Custom Icon
              Container(
                width: circleSize,
                height: circleSize,
                decoration: BoxDecoration(
                  color: _settings.iconBgColor,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.08),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                alignment: Alignment.center,
                child: GlorovCustomTrustIcon(
                  iconKey: item.iconKey,
                  customSvg: item.customIconSvg,
                  color: _settings.iconColor,
                  size: iconSize,
                ),
              ),
              const SizedBox(height: 8.0),

              // Title text (Centered under circle, matching Image 2)
              Text(
                item.title,
                textAlign: TextAlign.center,
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: fontSize,
                  fontWeight: FontWeight.w600,
                  height: 1.25,
                  letterSpacing: -0.1,
                  color: _settings.textColor,
                ),
              ),

              if (isDesktop && item.subtitle != null && item.subtitle!.isNotEmpty) ...[
                const SizedBox(height: 3.0),
                Text(
                  item.subtitle!,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11.0,
                    fontWeight: FontWeight.w400,
                    color: _settings.textColor.withValues(alpha: 0.8),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
