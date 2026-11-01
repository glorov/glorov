import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../../components/home/glorov_hero_banner_slider_skeleton.dart';
import '../theme/app_colors.dart';
import '../theme/app_radii.dart';
import '../theme/app_spacing.dart';

/// Centralized Botanical Skeleton Suite for GLOROV
///
/// Implements restrained, accessible loading states that mirror real layouts,
/// preventing layout shift when asynchronous operations resolve.
/// Uses [SkeletonScope] to share a single shimmer ticker across multiple items.

// -----------------------------------------------------------------------------
// 1. GlorovSkeletonLoader - Cross-fades real content and skeleton placeholder
// -----------------------------------------------------------------------------
class GlorovSkeletonLoader extends StatelessWidget {
  final bool loading;
  final Widget skeleton;
  final Widget child;
  final Duration switchDuration;

  const GlorovSkeletonLoader({
    super.key,
    required this.loading,
    required this.skeleton,
    required this.child,
    this.switchDuration = const Duration(milliseconds: 250),
  });

  @override
  Widget build(BuildContext context) {
    if (MicroMotion.isReduced(context)) {
      return loading ? skeleton : child;
    }

    return SkeletonScope(
      child: SkeletonLoader(
        loading: loading,
        skeleton: skeleton,
        switchDuration: switchDuration,
        switchInCurve: Curves.easeIn,
        switchOutCurve: Curves.easeOut,
        child: child,
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 2. GlorovProductCardSkeleton - Matches GlorovProductCard dimensions
// -----------------------------------------------------------------------------
class GlorovProductCardSkeleton extends StatelessWidget {
  const GlorovProductCardSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.sage.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image Aspect Ratio Placeholder
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Stack(
              children: [
                const AspectRatio(
                  aspectRatio: 1.0,
                  child: LoadingSkeleton(
                    baseColor: baseColor,
                    highlightColor: highlightColor,
                  ),
                ),
                // Mock sale badge
                Positioned(
                  top: 10,
                  left: 10,
                  child: LoadingSkeleton(
                    width: 72,
                    height: 20,
                    borderRadius: AppRadii.roundedSm,
                    baseColor: AppColors.forestDeep.withValues(alpha: 0.2),
                  ),
                ),
                // Mock rating pill
                const Positioned(
                  bottom: 8,
                  left: 8,
                  child: LoadingSkeleton(
                    width: 54,
                    height: 18,
                    borderRadius: BorderRadius.all(Radius.circular(10)),
                    baseColor: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.sm,
              vertical: 6,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                // Product Title Skeleton
                const LoadingSkeleton(
                  height: 14,
                  width: 140,
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
                const SizedBox(height: 4),
                // Botanical Name Skeleton
                LoadingSkeleton(
                  height: 11,
                  width: 100,
                  baseColor: baseColor.withValues(alpha: 0.8),
                  highlightColor: highlightColor,
                ),
                const SizedBox(height: 8),
                // Price & Add to Cart button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const LoadingSkeleton(
                      height: 18,
                      width: 64,
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                    LoadingSkeleton(
                      width: 36,
                      height: 36,
                      borderRadius: BorderRadius.circular(18),
                      baseColor: AppColors.forestDeep.withValues(alpha: 0.25),
                      highlightColor: highlightColor,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 3. GlorovProductGridSkeleton - Shared Grid Skeleton
// -----------------------------------------------------------------------------
class GlorovProductGridSkeleton extends StatelessWidget {
  final int count;
  final int crossAxisCount;

  const GlorovProductGridSkeleton({
    super.key,
    this.count = 8,
    this.crossAxisCount = 4,
  });

  @override
  Widget build(BuildContext context) {
    return SkeletonScope(
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: count,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: AppSpacing.md,
          mainAxisSpacing: AppSpacing.md,
          childAspectRatio: 0.72,
        ),
        itemBuilder: (_, __) => const GlorovProductCardSkeleton(),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 4. GlorovListItemSkeleton - List tile skeleton for Notifications & Orders
// -----------------------------------------------------------------------------
class GlorovListItemSkeleton extends StatelessWidget {
  final bool hasAvatar;
  final double avatarSize;

  const GlorovListItemSkeleton({
    super.key,
    this.hasAvatar = true,
    this.avatarSize = 44.0,
  });

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedMd,
        border: Border.all(color: AppColors.sage.withValues(alpha: 0.15)),
      ),
      child: Row(
        children: [
          if (hasAvatar) ...[
            LoadingSkeleton(
              width: avatarSize,
              height: avatarSize,
              borderRadius: BorderRadius.circular(avatarSize / 2),
              baseColor: baseColor,
              highlightColor: highlightColor,
            ),
            const SizedBox(width: AppSpacing.md),
          ],
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                LoadingSkeleton(
                  height: 16,
                  width: 220,
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
                SizedBox(height: 8),
                LoadingSkeleton(
                  height: 12,
                  width: 150,
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
              ],
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          const LoadingSkeleton(
            height: 20,
            width: 48,
            baseColor: baseColor,
            highlightColor: highlightColor,
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 5. GlorovProductDetailsSkeleton - Detailed skeleton for PDP
// -----------------------------------------------------------------------------
class GlorovProductDetailsSkeleton extends StatelessWidget {
  final bool isMobile;

  const GlorovProductDetailsSkeleton({
    super.key,
    this.isMobile = false,
  });

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    final gallery = Column(
      children: [
        const AspectRatio(
          aspectRatio: 1.0,
          child: LoadingSkeleton(
            borderRadius: BorderRadius.all(Radius.circular(16)),
            baseColor: baseColor,
            highlightColor: highlightColor,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            4,
            (i) => Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              child: const LoadingSkeleton(
                width: 64,
                height: 64,
                borderRadius: BorderRadius.all(Radius.circular(8)),
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),
            ),
          ),
        ),
      ],
    );

    final info = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const LoadingSkeleton(
          height: 28,
          width: 320,
          baseColor: baseColor,
          highlightColor: highlightColor,
        ),
        const SizedBox(height: AppSpacing.sm),
        const LoadingSkeleton(
          height: 16,
          width: 180,
          baseColor: baseColor,
          highlightColor: highlightColor,
        ),
        const SizedBox(height: AppSpacing.lg),
        const LoadingSkeleton(
          height: 24,
          width: 140,
          baseColor: baseColor,
          highlightColor: highlightColor,
        ),
        const SizedBox(height: AppSpacing.md),
        Row(
          children: List.generate(
            3,
            (i) => Container(
              margin: const EdgeInsets.only(right: 8),
              child: const LoadingSkeleton(
                width: 80,
                height: 36,
                borderRadius: BorderRadius.all(Radius.circular(8)),
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),
        const LoadingSkeleton(
          height: 48,
          borderRadius: BorderRadius.all(Radius.circular(12)),
          baseColor: baseColor,
          highlightColor: highlightColor,
        ),
      ],
    );

    return SkeletonScope(
      child: isMobile
          ? Column(
              children: [gallery, const SizedBox(height: AppSpacing.lg), info])
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: 5, child: gallery),
                const SizedBox(width: AppSpacing.xl),
                Expanded(flex: 6, child: info),
              ],
            ),
    );
  }
}

// -----------------------------------------------------------------------------
// 6. GlorovSliderSkeleton - Responsive Hero Banner / Carousel Skeleton
// -----------------------------------------------------------------------------
typedef GlorovSliderSkeleton = GlorovHeroBannerSliderSkeleton;

