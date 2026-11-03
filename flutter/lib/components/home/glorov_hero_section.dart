import 'package:flutter/material.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_hero_data.dart';
import '../../repositories/glorov_repositories.dart';
import '../../repositories/remote/medusa_api_config.dart';
import '../../route/route_constants.dart';

/// GLOROV Premium Storefront Botanical Editorial Showcase
/// Displays the editorial botanical showcase with dark forest green background (#081C15),
/// ambient floral glow, headline, CTAs, 3 trust metrics, and high-fidelity Monstera Deliciosa
/// showcase with dual floating badges (Verified 4.9/5.0 Rating and Air-Purifying Certified).
/// Fully optimized for desktop, tablet, and mobile viewports with zero clipping.
class GlorovHeroSection extends StatefulWidget {
  final GlorovHeroData? customData;
  final VoidCallback? onShopNowPressed;
  final VoidCallback? onSecondaryPressed;

  const GlorovHeroSection({
    super.key,
    this.customData,
    this.onShopNowPressed,
    this.onSecondaryPressed,
  });

  @override
  State<GlorovHeroSection> createState() => _GlorovHeroSectionState();
}

class _GlorovHeroSectionState extends State<GlorovHeroSection> {
  GlorovHeroData? _remoteData;
  bool _isLoading = false;

  GlorovHeroData get _effectiveData {
    if (widget.customData != null) return widget.customData!;
    if (_remoteData != null &&
        _remoteData!.headline.contains('Nurture Nature')) {
      return _remoteData!;
    }
    return GlorovHeroData.defaultData;
  }

  @override
  void initState() {
    super.initState();
    if (widget.customData == null) {
      _loadRemoteData();
    }
  }

  @override
  void didUpdateWidget(covariant GlorovHeroSection oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.customData != oldWidget.customData && widget.customData == null) {
      _loadRemoteData();
    }
  }

  Future<void> _loadRemoteData() async {
    if (_isLoading) return;
    _isLoading = true;
    try {
      final data = await GlorovRepositories.hero.fetchHeroData();
      if (mounted) {
        setState(() {
          if (data.isNotEmpty) {
            _remoteData = data;
          }
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _handlePrimaryAction(BuildContext context, GlorovHeroData data) {
    if (widget.onShopNowPressed != null) {
      widget.onShopNowPressed!();
    } else {
      Navigator.pushNamed(context, discoverScreenRoute, arguments: 'Seeds');
    }
  }

  void _handleSecondaryAction(BuildContext context, GlorovHeroData data) {
    if (widget.onSecondaryPressed != null) {
      widget.onSecondaryPressed!();
    } else {
      Navigator.pushNamed(context, discoverScreenRoute,
          arguments: 'Live Houseplants');
    }
  }

  void _handlePlantHighlightAction(BuildContext context, GlorovHeroData data) {
    Navigator.pushNamed(context, discoverScreenRoute,
        arguments: 'Live Houseplants');
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final data = _effectiveData;

    return Container(
      width: double.infinity,
      color: const Color(0xFF081C15),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Background Decorative Floral Glows
          Positioned(
            top: -60,
            left: -60,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF1B4332).withValues(alpha: 0.35),
              ),
            ),
          ),
          Positioned(
            bottom: -60,
            right: -60,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF52B788).withValues(alpha: 0.18),
              ),
            ),
          ),

          // Main Content
          Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppBreakpoints.maxContentWidth,
              ),
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: isDesktop ? AppSpacing.lg : AppSpacing.md,
                  vertical: isDesktop ? 64.0 : 36.0,
                ),
                child: isDesktop
                    ? _buildDesktopHero(context, data)
                    : _buildMobileHero(context, data),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDesktopHero(BuildContext context, GlorovHeroData data) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Left Column: Editorial Copy, CTAs & Stats (7 cols / 58%)
        Expanded(
          flex: 12,
          child: _buildDesktopCopy(context, data),
        ),
        const SizedBox(width: AppSpacing.xxl),
        // Right Column: Botanical Visual Showcase (5 cols / 42%)
        Expanded(
          flex: 9,
          child: _buildHeroVisual(context, data, isDesktop: true),
        ),
      ],
    );
  }

  Widget _buildMobileHero(BuildContext context, GlorovHeroData data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category Badge
        _buildCategoryBadge(data),
        const SizedBox(height: 14),

        // Headline
        Text(
          data.headline,
          style: const TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            height: 1.15,
            letterSpacing: -0.6,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 12),

        // Description
        Text(
          data.description,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            height: 1.55,
            color: Colors.white.withValues(alpha: 0.8),
          ),
        ),
        const SizedBox(height: 20),

        // Mobile Action Buttons (Full-width, clean touch-friendly layout)
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ElevatedButton(
              onPressed: () => _handlePrimaryAction(context, data),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF52B788),
                foregroundColor: const Color(0xFF081C15),
                padding: const EdgeInsets.symmetric(vertical: 14),
                elevation: 2,
                shape: const StadiumBorder(),
              ),
              child: Text(
                data.ctaText.toUpperCase(),
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                  letterSpacing: 0.8,
                ),
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton(
              onPressed: () => _handleSecondaryAction(context, data),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                backgroundColor: Colors.white.withValues(alpha: 0.08),
                side: BorderSide(
                  color: Colors.white.withValues(alpha: 0.25),
                  width: 1.2,
                ),
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: const StadiumBorder(),
              ),
              child: Text(
                data.secondaryCtaText.toUpperCase(),
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // 3 Trust Metrics
        _buildTrustMetricsRow(isDesktop: false),
        const SizedBox(height: 28),

        // Botanical Visual Showcase
        _buildHeroVisual(context, data, isDesktop: false),
      ],
    );
  }

  Widget _buildDesktopCopy(BuildContext context, GlorovHeroData data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Category Badge
        _buildCategoryBadge(data),
        const SizedBox(height: 16),

        // Hero Headline
        Text(
          data.headline,
          style: const TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 44,
            fontWeight: FontWeight.w900,
            height: 1.1,
            letterSpacing: -1.0,
            color: Colors.white,
          ),
        ),
        const SizedBox(height: 16),

        // Supporting Copy
        ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 540),
          child: Text(
            data.description,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 16,
              height: 1.6,
              color: Colors.white.withValues(alpha: 0.8),
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Action Buttons
        Row(
          children: [
            ElevatedButton(
              onPressed: () => _handlePrimaryAction(context, data),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF52B788),
                foregroundColor: const Color(0xFF081C15),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 15,
                ),
                elevation: 3,
                shape: const StadiumBorder(),
              ),
              child: Text(
                data.ctaText.toUpperCase(),
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontWeight: FontWeight.w800,
                  fontSize: 13,
                  letterSpacing: 0.8,
                ),
              ),
            ),
            const SizedBox(width: 14),
            OutlinedButton(
              onPressed: () => _handleSecondaryAction(context, data),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                backgroundColor: Colors.white.withValues(alpha: 0.08),
                side: BorderSide(
                  color: Colors.white.withValues(alpha: 0.25),
                  width: 1.2,
                ),
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 15,
                ),
                shape: const StadiumBorder(),
              ),
              child: Text(
                data.secondaryCtaText.toUpperCase(),
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontWeight: FontWeight.w700,
                  fontSize: 13,
                  letterSpacing: 0.8,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 32),

        // 3 Trust Metrics
        _buildTrustMetricsRow(isDesktop: true),
      ],
    );
  }

  Widget _buildCategoryBadge(GlorovHeroData data) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFF52B788),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF52B788).withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Text(
        data.tag.toUpperCase(),
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 11,
          fontWeight: FontWeight.w900,
          letterSpacing: 1.0,
          color: Color(0xFF081C15),
        ),
      ),
    );
  }

  Widget _buildTrustMetricsRow({required bool isDesktop}) {
    return Container(
      padding: const EdgeInsets.only(top: 18),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: Colors.white.withValues(alpha: 0.15),
            width: 1.0,
          ),
        ),
      ),
      child: Row(
        children: [
          _buildMetricItem(
            value: '98%+',
            label: 'Germination Vigor',
            isDesktop: isDesktop,
          ),
          const SizedBox(width: 20),
          _buildMetricItem(
            value: '100%',
            label: 'Transit Protected',
            isDesktop: isDesktop,
          ),
          const SizedBox(width: 20),
          _buildMetricItem(
            value: '50k+',
            label: 'Gardens Planted',
            isDesktop: isDesktop,
          ),
        ],
      ),
    );
  }

  Widget _buildMetricItem({
    required String value,
    required String label,
    required bool isDesktop,
  }) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: isDesktop ? 24 : 20,
              fontWeight: FontWeight.w900,
              color: const Color(0xFF52B788),
              height: 1.1,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: isDesktop ? 12 : 10.5,
              fontWeight: FontWeight.w500,
              color: Colors.white.withValues(alpha: 0.7),
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroVisual(BuildContext context, GlorovHeroData data,
      {required bool isDesktop}) {
    final imagePath =
        isDesktop ? data.desktopImageUrl : data.mobileImageUrl;

    return Container(
      height: isDesktop ? 440 : 280,
      decoration: BoxDecoration(
        color: const Color(0xFF1B4332),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.20),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 24,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Botanical Plant Image (Monstera Deliciosa) with graceful fallback
          _buildImageWidget(imagePath),

          // Gentle gradient scrim at bottom
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            height: isDesktop ? 140 : 100,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.55),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Floating Badge 1: Rating (Top-Left)
          Positioned(
            top: 14,
            left: 14,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.90),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.15),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    decoration: const BoxDecoration(
                      color: Color(0xFF16A34A),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.star_rounded,
                      color: Colors.white,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        '4.9 / 5.0 Rating',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11.5,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF0F172A),
                          height: 1.1,
                        ),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Verified Plant Parents',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 9.5,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF64748B),
                          height: 1.0,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Floating Badge 2: Air Purifying (Bottom-Right)
          Positioned(
            bottom: 14,
            right: 14,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _handlePlantHighlightAction(context, data),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: const Color(0xFF081C15).withValues(alpha: 0.90),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.20),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.3),
                        blurRadius: 10,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 26,
                        height: 26,
                        decoration: const BoxDecoration(
                          color: Color(0xFF52B788),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.eco_rounded,
                          color: Color(0xFF081C15),
                          size: 16,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            'Air-Purifying Certified',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF52B788),
                              height: 1.1,
                            ),
                          ),
                          SizedBox(height: 2),
                          Text(
                            'Naturally Absorbs Toxins',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 9.5,
                              fontWeight: FontWeight.w500,
                              color: Colors.white70,
                              height: 1.0,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageWidget(String path) {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return Image.network(
        path,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) =>
            _buildAssetOrGradientFallback(),
      );
    }

    if (path.startsWith('/')) {
      return Image.network(
        '${MedusaApiConfig.defaultBaseUrl}$path',
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) =>
            _buildAssetOrGradientFallback(),
      );
    }

    return Image.asset(
      path,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) =>
          _buildAssetOrGradientFallback(),
    );
  }

  Widget _buildAssetOrGradientFallback() {
    return Image.network(
      'monstera_deliciosa_hero.jpg',
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF081C15),
                Color(0xFF1B4332),
                Color(0xFF2D6A4F),
              ],
            ),
          ),
          child: const Center(
            child: Icon(
              Icons.eco,
              size: 80,
              color: Colors.white24,
            ),
          ),
        );
      },
    );
  }
}
