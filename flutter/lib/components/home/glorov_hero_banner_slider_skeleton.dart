import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';

/// GLOROV Responsive Hero Banner Slider Skeleton
///
/// Implements a production-grade, fully responsive shimmer loading state that mirrors
/// the exact geometry, aspect ratios, and controls of [GlorovHeroBannerSlider]:
///
/// - Desktop & Tablet: 20:9 aspect ratio with floating navigation arrows,
///   editorial tag, multi-tier headline bars, subtitle, and CTA button.
/// - Mobile: 5:7 aspect ratio with centered editorial headline and CTA.
/// - Pagination indicators: 4 pills with elongated active indicator.
/// - CLS (Cumulative Layout Shift) = 0: strictly locks height and boundaries
///   matching the real loaded slider.
/// - Accessible: Excluded from screen reader chatter and respects `prefers-reduced-motion`.
class GlorovHeroBannerSliderSkeleton extends StatelessWidget {
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

  const GlorovHeroBannerSliderSkeleton({
    super.key,
    this.desktopHeight,
    this.mobileHeight,
    this.desktopAspectRatio = 20.0 / 9.0,
    this.tabletAspectRatio = 20.0 / 9.0,
    this.mobileAspectRatio = 5.0 / 7.0,
    this.aspectRatio,
    this.showArrows = true,
    this.showIndicators = true,
    this.isFullWidth = true,
    this.margin,
    this.borderRadius,
  });

  double _computeHeight(BuildContext context, double width) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final isTablet = AppBreakpoints.isTablet(context);

    if (isDesktop && desktopHeight != null) {
      return desktopHeight!;
    }
    if (!isDesktop && !isTablet && mobileHeight != null) {
      return mobileHeight!;
    }

    if (isDesktop || isTablet) {
      final double targetRatio = aspectRatio ??
          (isDesktop ? desktopAspectRatio : tabletAspectRatio) ??
          (20.0 / 9.0);
      return width / targetRatio;
    } else {
      final double targetRatio = mobileAspectRatio ?? (5.0 / 7.0);
      return width / targetRatio;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);
    final isTablet = AppBreakpoints.isTablet(context);
    final isWidescreen = isDesktop || isTablet;

    const baseColor = Color(0xFFE9EFE8); // Botanical sage/bone
    const highlightColor = Color(0xFFF7FBF6); // Luminous shimmer
    const textBoneColor = Color(0xFFD6E2D4); // Subtle darker tier for copy
    const ctaBoneColor = Color(0xFFB8CEB5); // Distinct accent for CTA button

    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.hasBoundedWidth
            ? constraints.maxWidth
            : MediaQuery.of(context).size.width;
        final double sliderHeight = _computeHeight(context, width);

        final EdgeInsetsGeometry effectiveMargin = margin ??
            (isFullWidth
                ? EdgeInsets.zero
                : EdgeInsets.symmetric(
                    horizontal: isDesktop ? AppSpacing.lg : AppSpacing.sm,
                    vertical: isDesktop ? AppSpacing.md : AppSpacing.xs,
                  ));

        final BorderRadius effectiveRadius = borderRadius ??
            (isFullWidth
                ? BorderRadius.zero
                : (isDesktop ? AppRadii.roundedXl : BorderRadius.circular(12)));

        Widget skeletonContent = Container(
          width: double.infinity,
          height: sliderHeight,
          decoration: BoxDecoration(
            borderRadius: effectiveRadius,
            boxShadow: isFullWidth ? null : const [
              BoxShadow(
                color: Color(0x0A000000),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Stack(
            fit: StackFit.expand,
            children: [
              // 1. Full-bleed Background Shimmer Canvas
              const LoadingSkeleton(
                width: double.infinity,
                height: double.infinity,
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),

              // 2. Botanical Watermark Icon in background
              Center(
                child: Icon(
                  Icons.spa_outlined,
                  size: isWidescreen ? 64 : 48,
                  color: AppColors.forestDeep.withValues(alpha: 0.12),
                ),
              ),

              // 3. Simulated Editorial Typography & CTA Content
              Positioned.fill(
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: isWidescreen
                        ? AppSpacing.xl * 1.5
                        : AppSpacing.lg,
                    vertical: isWidescreen ? AppSpacing.xl : AppSpacing.md,
                  ),
                  child: isWidescreen
                      ? _buildWidescreenContent(textBoneColor, ctaBoneColor)
                      : _buildMobileContent(textBoneColor, ctaBoneColor),
                ),
              ),

              // 4. Desktop Floating Navigation Chevron Skeletons (< and >)
              if (isDesktop && showArrows) ...[
                // Left Arrow Skeleton
                Positioned(
                  left: 24,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.70),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Icon(
                          Icons.chevron_left_rounded,
                          color: AppColors.forestDeep.withValues(alpha: 0.4),
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ),
                // Right Arrow Skeleton
                Positioned(
                  right: 24,
                  top: 0,
                  bottom: 0,
                  child: Center(
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.70),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.08),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Icon(
                          Icons.chevron_right_rounded,
                          color: AppColors.forestDeep.withValues(alpha: 0.4),
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                ),
              ],

              // 5. Bottom Pagination Dots Skeleton
              if (showIndicators)
                Positioned(
                  bottom: isWidescreen ? 20 : 16,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Active indicator pill skeleton
                      Container(
                        width: isWidescreen ? 36 : 28,
                        height: 6,
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.85),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      ),
                      // Inactive indicator dots skeleton
                      for (int i = 0; i < 3; i++)
                        Container(
                          width: 6,
                          height: 6,
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.45),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        ),
                    ],
                  ),
                ),
            ],
          ),
        );

        if (!isFullWidth) {
          skeletonContent = Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppBreakpoints.maxContentWidth,
              ),
              child: skeletonContent,
            ),
          );
        }

        return SkeletonScope(
          duration: const Duration(milliseconds: 1600),
          child: Container(
            width: double.infinity,
            margin: effectiveMargin,
            child: skeletonContent,
          ),
        );
      },
    );
  }

  Widget _buildWidescreenContent(Color textColor, Color ctaColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Tag Pill Skeleton
        Container(
          width: 140,
          height: 22,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.60),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha: 0.4)),
          ),
        ),

        // Headline Line 1
        LoadingSkeleton(
          width: 380,
          height: 32,
          borderRadius: BorderRadius.circular(6),
          baseColor: textColor,
        ),
        const SizedBox(height: 10),

        // Headline Line 2
        LoadingSkeleton(
          width: 270,
          height: 32,
          borderRadius: BorderRadius.circular(6),
          baseColor: textColor,
        ),
        const SizedBox(height: 14),

        // Subtitle Line
        LoadingSkeleton(
          width: 320,
          height: 16,
          borderRadius: BorderRadius.circular(4),
          baseColor: textColor.withValues(alpha: 0.8),
        ),
        const SizedBox(height: 22),

        // CTA Pill Button Skeleton
        LoadingSkeleton(
          width: 170,
          height: 44,
          borderRadius: BorderRadius.circular(22),
          baseColor: ctaColor,
        ),
      ],
    );
  }

  Widget _buildMobileContent(Color textColor, Color ctaColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.start,
      children: [
        const SizedBox(height: AppSpacing.sm),
        // Centered Tag Pill Skeleton
        Container(
          width: 120,
          height: 20,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.60),
            borderRadius: BorderRadius.circular(20),
          ),
        ),

        // Centered Headline Line 1
        LoadingSkeleton(
          width: 250,
          height: 26,
          borderRadius: BorderRadius.circular(6),
          baseColor: textColor,
        ),
        const SizedBox(height: 8),

        // Centered Headline Line 2
        LoadingSkeleton(
          width: 180,
          height: 26,
          borderRadius: BorderRadius.circular(6),
          baseColor: textColor,
        ),
        const SizedBox(height: 12),

        // Subtitle Line
        LoadingSkeleton(
          width: 220,
          height: 14,
          borderRadius: BorderRadius.circular(4),
          baseColor: textColor.withValues(alpha: 0.75),
        ),
        const SizedBox(height: 20),

        // CTA Pill Button Skeleton
        LoadingSkeleton(
          width: 150,
          height: 40,
          borderRadius: BorderRadius.circular(20),
          baseColor: ctaColor,
        ),
      ],
    );
  }
}
