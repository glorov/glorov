import 'package:flutter/material.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_hero_data.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';

/// GLOROV Premium Storefront Botanical Hero Section
/// Displays the editorial botanical showcase with backend-controllable
/// headlines, CTAs, trust pills, and high-fidelity plant imagery (Monstera Deliciosa).
/// Fully optimized for both desktop web and mobile viewports with zero clipping.
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

  GlorovHeroData get _effectiveData =>
      widget.customData ?? _remoteData ?? GlorovHeroData.defaultData;

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
          _remoteData = data;
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
      decoration: BoxDecoration(
        color: AppColors.surfaceCream,
        border: const Border(
          bottom: BorderSide(color: AppColors.borderSubtle, width: 1),
        ),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            AppColors.surfaceCream,
            AppColors.mintSurface.withValues(alpha: 0.35),
            AppColors.surfaceCream,
          ],
        ),
      ),
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.lg : AppSpacing.md,
        vertical: isDesktop ? AppSpacing.xxl : 28.0,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: isDesktop
              ? _buildDesktopHero(context, data)
              : _buildMobileHero(context, data),
        ),
      ),
    );
  }

  Widget _buildDesktopHero(BuildContext context, GlorovHeroData data) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        // Left Column: Editorial Copy & CTAs (55%)
        Expanded(
          flex: 11,
          child: _buildDesktopCopy(context, data),
        ),
        const SizedBox(width: AppSpacing.xxl),
        // Right Column: Botanical Visual Showcase (45%)
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
        const SizedBox(height: AppSpacing.md),

        // Headline
        Text(
          data.headline,
          style: const TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 30,
            fontWeight: FontWeight.w900,
            height: 1.15,
            letterSpacing: -0.8,
            color: AppColors.forestDark,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Description
        Text(
          data.description,
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            height: 1.55,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Mobile Action Buttons (Full-width, clean touch-friendly layout)
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            ElevatedButton.icon(
              onPressed: () => _handlePrimaryAction(context, data),
              icon: const Icon(Icons.arrow_forward_rounded, size: 18),
              label: Text(data.ctaText),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forestDeep,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                elevation: 1,
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd,
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            OutlinedButton(
              onPressed: () => _handleSecondaryAction(context, data),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.forestDeep,
                side: const BorderSide(color: AppColors.forestDeep, width: 1.5),
                padding: const EdgeInsets.symmetric(vertical: 13),
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd,
                ),
              ),
              child: Text(data.secondaryCtaText),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),

        // Organized Trust Pills
        Wrap(
          spacing: AppSpacing.sm,
          runSpacing: AppSpacing.xs,
          children: data.trustPills
              .map((pill) => _buildTrustChip(pill, isDesktop: false))
              .toList(),
        ),
        const SizedBox(height: AppSpacing.xl),

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
        const SizedBox(height: AppSpacing.md),

        // Hero Headline
        Text(
          data.headline,
          style: const TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 44,
            fontWeight: FontWeight.w900,
            height: 1.1,
            letterSpacing: -1.0,
            color: AppColors.forestDark,
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        // Supporting Copy
        Text(
          data.description,
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 16,
            height: 1.6,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        // Action Buttons
        Wrap(
          spacing: AppSpacing.md,
          runSpacing: AppSpacing.sm,
          children: [
            ElevatedButton.icon(
              onPressed: () => _handlePrimaryAction(context, data),
              icon: const Icon(Icons.arrow_forward_rounded, size: 18),
              label: Text(data.ctaText),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forestDeep,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.xl,
                  vertical: AppSpacing.md,
                ),
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd,
                ),
              ),
            ),
            OutlinedButton(
              onPressed: () => _handleSecondaryAction(context, data),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.forestDeep,
                side: const BorderSide(color: AppColors.forestDeep, width: 1.5),
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
                shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd,
                ),
              ),
              child: Text(data.secondaryCtaText),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.xl),

        // Trust Badges
        Wrap(
          spacing: AppSpacing.lg,
          runSpacing: AppSpacing.xs,
          children: data.trustPills
              .map((pill) => _buildTrustChip(pill, isDesktop: true))
              .toList(),
        ),
      ],
    );
  }

  Widget _buildCategoryBadge(GlorovHeroData data) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.sm,
        vertical: AppSpacing.xxs + 2,
      ),
      decoration: BoxDecoration(
        color: AppColors.mintBadge,
        borderRadius: AppRadii.roundedFull,
        border: Border.all(color: AppColors.sage.withValues(alpha: 0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: AppColors.forestDeep,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 6),
          Flexible(
            child: Text(
              data.tag,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 11,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.8,
                color: AppColors.forestDeep,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustChip(GlorovHeroTrustPill pill, {required bool isDesktop}) {
    if (isDesktop) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(pill.iconData, size: 16, color: AppColors.sage),
          const SizedBox(width: 6),
          Text(
            pill.text,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      );
    }

    // Mobile organized pill chip
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5.5),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.85),
        borderRadius: AppRadii.roundedSm,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(pill.iconData, size: 14, color: AppColors.sage),
          const SizedBox(width: 5),
          Text(
            pill.text,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 11.5,
              fontWeight: FontWeight.w600,
              color: AppColors.textSecondary,
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
      height: isDesktop ? 400 : 290,
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedXl,
        boxShadow: AppShadows.card,
        border: Border.all(color: AppColors.borderSubtle),
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
            height: isDesktop ? 120 : 100,
            child: Container(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    Colors.black.withValues(alpha: 0.65),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Floating Plant Highlight Tag (Tappable Botanical Feature)
          Positioned(
            left: AppSpacing.md,
            right: isDesktop ? null : AppSpacing.md,
            bottom: AppSpacing.md,
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => _handlePlantHighlightAction(context, data),
                borderRadius: AppRadii.roundedMd,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.95),
                    borderRadius: AppRadii.roundedMd,
                    boxShadow: AppShadows.card,
                  ),
                  child: Row(
                    mainAxisSize: isDesktop ? MainAxisSize.min : MainAxisSize.max,
                    children: [
                      const Icon(
                        Icons.eco_rounded,
                        size: 20,
                        color: AppColors.forestDeep,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      if (isDesktop)
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              data.plantTag,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                                color: AppColors.sage,
                              ),
                            ),
                            Text(
                              data.plantName,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        )
                      else
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                data.plantTag,
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.5,
                                  color: AppColors.sage,
                                ),
                              ),
                              Text(
                                data.plantName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ],
                          ),
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

    return Image.asset(
      path,
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) =>
          _buildAssetOrGradientFallback(),
    );
  }

  Widget _buildAssetOrGradientFallback() {
    return Image.asset(
      'assets/images/monstera_deliciosa_hero.jpg',
      fit: BoxFit.cover,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.forestDeep,
                AppColors.forestMedium,
                AppColors.sage,
              ],
            ),
          ),
          child: const Center(
            child: Icon(
              Icons.eco,
              size: 96,
              color: Colors.white24,
            ),
          ),
        );
      },
    );
  }
}
