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

    return AnimatedSwitcher(
      duration: switchDuration,
      switchInCurve: Curves.easeIn,
      switchOutCurve: Curves.easeOut,
      child: loading
          ? KeyedSubtree(
              key: const ValueKey('skeleton_active'),
              child: SkeletonScope(child: skeleton),
            )
          : KeyedSubtree(
              key: const ValueKey('content_active'),
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
  final double? childAspectRatio;

  const GlorovProductGridSkeleton({
    super.key,
    this.count = 8,
    this.crossAxisCount = 4,
    this.childAspectRatio,
  });

  @override
  Widget build(BuildContext context) {
    final isMobile = crossAxisCount == 2;
    final spacing = isMobile ? 8.0 : AppSpacing.md;
    final verticalSpacing = isMobile ? 10.0 : AppSpacing.md;

    return SkeletonScope(
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: count,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          crossAxisSpacing: spacing,
          mainAxisSpacing: verticalSpacing,
          childAspectRatio:
              childAspectRatio ?? (crossAxisCount == 2 ? 0.66 : 0.72),
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

// -----------------------------------------------------------------------------
// 7. GlorovReviewsSkeleton - Customer Reviews Card Skeleton
// -----------------------------------------------------------------------------
class GlorovReviewsSkeleton extends StatelessWidget {
  final int count;
  const GlorovReviewsSkeleton({super.key, this.count = 3});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return SkeletonScope(
      child: Column(
        children: List.generate(
          count,
          (i) => Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.md),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadii.roundedMd,
              border: Border.all(color: AppColors.sage.withValues(alpha: 0.15)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    LoadingSkeleton(
                      width: 40,
                      height: 40,
                      borderRadius: BorderRadius.circular(20),
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LoadingSkeleton(
                            height: 14,
                            width: 120,
                            baseColor: baseColor,
                            highlightColor: highlightColor,
                          ),
                          SizedBox(height: 4),
                          LoadingSkeleton(
                            height: 10,
                            width: 80,
                            baseColor: baseColor,
                            highlightColor: highlightColor,
                          ),
                        ],
                      ),
                    ),
                    LoadingSkeleton(
                      height: 16,
                      width: 70,
                      borderRadius: BorderRadius.circular(8),
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Row(
                  children: List.generate(
                    5,
                    (j) => Container(
                      margin: const EdgeInsets.only(right: 4),
                      child: const LoadingSkeleton(
                        width: 14,
                        height: 14,
                        borderRadius: BorderRadius.all(Radius.circular(2)),
                        baseColor: baseColor,
                        highlightColor: highlightColor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                const LoadingSkeleton(
                  height: 13,
                  width: double.infinity,
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
                const SizedBox(height: 6),
                const LoadingSkeleton(
                  height: 13,
                  width: 260,
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 8. GlorovOrdersListSkeleton - Dedicated Orders Screen Skeleton
// -----------------------------------------------------------------------------
class GlorovOrdersListSkeleton extends StatelessWidget {
  final int count;
  const GlorovOrdersListSkeleton({super.key, this.count = 3});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return SkeletonScope(
      child: Column(
        children: List.generate(
          count,
          (i) => Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.lg),
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadii.roundedLg,
              border: Border.all(color: AppColors.sage.withValues(alpha: 0.15)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.03),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const LoadingSkeleton(
                      height: 16,
                      width: 140,
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                    LoadingSkeleton(
                      height: 24,
                      width: 80,
                      borderRadius: BorderRadius.circular(12),
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                const LoadingSkeleton(
                  height: 12,
                  width: 100,
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
                const Divider(height: 24),
                Row(
                  children: [
                    LoadingSkeleton(
                      width: 60,
                      height: 60,
                      borderRadius: BorderRadius.circular(8),
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                    const SizedBox(width: AppSpacing.md),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LoadingSkeleton(
                            height: 14,
                            width: 180,
                            baseColor: baseColor,
                            highlightColor: highlightColor,
                          ),
                          SizedBox(height: 6),
                          LoadingSkeleton(
                            height: 12,
                            width: 120,
                            baseColor: baseColor,
                            highlightColor: highlightColor,
                          ),
                        ],
                      ),
                    ),
                    const LoadingSkeleton(
                      height: 16,
                      width: 70,
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    LoadingSkeleton(
                      height: 36,
                      width: 110,
                      borderRadius: BorderRadius.circular(8),
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    LoadingSkeleton(
                      height: 36,
                      width: 110,
                      borderRadius: BorderRadius.circular(8),
                      baseColor: AppColors.forestDeep.withValues(alpha: 0.2),
                      highlightColor: highlightColor,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 9. GlorovTrackingSkeleton - Order Tracking Timeline Skeleton
// -----------------------------------------------------------------------------
class GlorovTrackingSkeleton extends StatelessWidget {
  const GlorovTrackingSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return SkeletonScope(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.mintSurface,
              borderRadius: AppRadii.roundedMd,
              border: Border.all(color: AppColors.sage.withValues(alpha: 0.3)),
            ),
            child: const Row(
              children: [
                LoadingSkeleton(
                  width: 24,
                  height: 24,
                  borderRadius: BorderRadius.all(Radius.circular(12)),
                ),
                SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      LoadingSkeleton(height: 14, width: 160),
                      SizedBox(height: 4),
                      LoadingSkeleton(height: 10, width: 100),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          ...List.generate(
            4,
            (i) => Padding(
              padding: const EdgeInsets.only(bottom: AppSpacing.md),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LoadingSkeleton(
                    width: 16,
                    height: 16,
                    borderRadius: BorderRadius.circular(8),
                    baseColor: baseColor,
                    highlightColor: highlightColor,
                  ),
                  const SizedBox(width: AppSpacing.md),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        LoadingSkeleton(height: 13, width: 140),
                        SizedBox(height: 4),
                        LoadingSkeleton(height: 10, width: 200),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 10. GlorovCategoryDiscoverySkeleton - Category Circles Discovery Skeleton
// -----------------------------------------------------------------------------
class GlorovCategoryDiscoverySkeleton extends StatelessWidget {
  const GlorovCategoryDiscoverySkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return SkeletonScope(
      child: Container(
        height: 106,
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
          itemCount: 6,
          separatorBuilder: (_, __) => const SizedBox(width: AppSpacing.md),
          itemBuilder: (_, __) => Column(
            children: [
              LoadingSkeleton(
                width: 64,
                height: 64,
                borderRadius: BorderRadius.circular(32),
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),
              const SizedBox(height: 6),
              const LoadingSkeleton(
                height: 10,
                width: 54,
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 11. GlorovValuePropsSkeleton - Value Props Trust Strip Skeleton
// -----------------------------------------------------------------------------
class GlorovValuePropsSkeleton extends StatelessWidget {
  const GlorovValuePropsSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return SkeletonScope(
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.lg,
          vertical: AppSpacing.md,
        ),
        child: Row(
          children: List.generate(
            4,
            (i) => Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 8),
                child: Row(
                  children: [
                    LoadingSkeleton(
                      width: 36,
                      height: 36,
                      borderRadius: BorderRadius.circular(18),
                      baseColor: baseColor,
                      highlightColor: highlightColor,
                    ),
                    const SizedBox(width: 8),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          LoadingSkeleton(height: 12, width: 80),
                          SizedBox(height: 4),
                          LoadingSkeleton(height: 9, width: 60),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 12. GlorovCartSkeleton - Cart Page Items & Summary Skeleton
// -----------------------------------------------------------------------------
class GlorovCartSkeleton extends StatelessWidget {
  final bool isDesktop;
  const GlorovCartSkeleton({super.key, this.isDesktop = false});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    final itemsColumn = Column(
      children: List.generate(
        3,
        (i) => Container(
          margin: const EdgeInsets.only(bottom: AppSpacing.md),
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadii.roundedMd,
            border: Border.all(color: AppColors.sage.withValues(alpha: 0.15)),
          ),
          child: Row(
            children: [
              LoadingSkeleton(
                width: 72,
                height: 72,
                borderRadius: BorderRadius.circular(10),
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),
              const SizedBox(width: AppSpacing.md),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    LoadingSkeleton(height: 14, width: 160),
                    SizedBox(height: 6),
                    LoadingSkeleton(height: 11, width: 90),
                    SizedBox(height: 8),
                    LoadingSkeleton(height: 15, width: 70),
                  ],
                ),
              ),
              LoadingSkeleton(
                width: 80,
                height: 32,
                borderRadius: BorderRadius.circular(6),
                baseColor: baseColor,
                highlightColor: highlightColor,
              ),
            ],
          ),
        ),
      ),
    );

    final summaryCard = Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.sage.withValues(alpha: 0.15)),
      ),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          LoadingSkeleton(height: 18, width: 140),
          SizedBox(height: AppSpacing.md),
          LoadingSkeleton(height: 12, width: double.infinity),
          SizedBox(height: 8),
          LoadingSkeleton(height: 12, width: double.infinity),
          SizedBox(height: 8),
          LoadingSkeleton(height: 12, width: double.infinity),
          Divider(height: 24),
          LoadingSkeleton(height: 20, width: double.infinity),
          SizedBox(height: AppSpacing.lg),
          LoadingSkeleton(
            height: 48,
            borderRadius: BorderRadius.all(Radius.circular(10)),
          ),
        ],
      ),
    );

    return SkeletonScope(
      child: isDesktop
          ? Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(flex: 7, child: itemsColumn),
                const SizedBox(width: AppSpacing.lg),
                Expanded(flex: 4, child: summaryCard),
              ],
            )
          : Column(
              children: [
                itemsColumn,
                const SizedBox(height: AppSpacing.md),
                summaryCard,
              ],
            ),
    );
  }
}

// -----------------------------------------------------------------------------
// 13. GlorovSearchSkeleton - Search Autocomplete & Live Suggestion Skeleton
// -----------------------------------------------------------------------------
class GlorovSearchSkeleton extends StatelessWidget {
  final int count;
  const GlorovSearchSkeleton({super.key, this.count = 4});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    return SkeletonScope(
      child: Column(
        children: List.generate(
          count,
          (i) => Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadii.roundedMd,
              border: Border.all(color: AppColors.sage.withValues(alpha: 0.12)),
            ),
            child: Row(
              children: [
                LoadingSkeleton(
                  width: 48,
                  height: 48,
                  borderRadius: BorderRadius.circular(8),
                  baseColor: baseColor,
                  highlightColor: highlightColor,
                ),
                const SizedBox(width: AppSpacing.md),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      LoadingSkeleton(height: 14, width: 180),
                      SizedBox(height: 4),
                      LoadingSkeleton(height: 11, width: 100),
                    ],
                  ),
                ),
                const LoadingSkeleton(height: 14, width: 50),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 14. GlorovCategoriesSkeleton - Categories Page Split Rail & Showcase Skeleton
// -----------------------------------------------------------------------------
class GlorovCategoriesSkeleton extends StatelessWidget {
  final bool isMobile;
  const GlorovCategoriesSkeleton({super.key, this.isMobile = true});

  @override
  Widget build(BuildContext context) {
    const baseColor = Color(0xFFE9EFE8);
    const highlightColor = Color(0xFFF7FBF6);

    if (isMobile) {
      return SkeletonScope(
        child: SizedBox(
          height: 600,
          child: Row(
            children: [
              Container(
                width: 90,
                color: const Color(0xFFF2F5F1),
                child: ListView.builder(
                  itemCount: 5,
                  itemBuilder: (_, __) => Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    child: Column(
                      children: [
                        LoadingSkeleton(
                          width: 44,
                          height: 44,
                          borderRadius: BorderRadius.circular(22),
                          baseColor: baseColor,
                          highlightColor: highlightColor,
                        ),
                        const SizedBox(height: 6),
                        const LoadingSkeleton(height: 8, width: 48),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: GridView.builder(
                    itemCount: 6,
                    gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: AppSpacing.sm,
                      mainAxisSpacing: AppSpacing.sm,
                      childAspectRatio: 0.85,
                    ),
                    itemBuilder: (_, __) => Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: AppRadii.roundedMd,
                        border: Border.all(
                          color: AppColors.sage.withValues(alpha: 0.15),
                        ),
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          LoadingSkeleton(
                            width: 60,
                            height: 60,
                            borderRadius: BorderRadius.all(Radius.circular(8)),
                          ),
                          SizedBox(height: 8),
                          LoadingSkeleton(height: 10, width: 64),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return SkeletonScope(
      child: Column(
        children: [
          const LoadingSkeleton(
            height: 220,
            borderRadius: BorderRadius.all(Radius.circular(16)),
          ),
          const SizedBox(height: AppSpacing.xl),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: 4,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: AppSpacing.lg,
              mainAxisSpacing: AppSpacing.lg,
              childAspectRatio: 1.4,
            ),
            itemBuilder: (_, __) => Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedLg,
                border: Border.all(
                  color: AppColors.sage.withValues(alpha: 0.15),
                ),
              ),
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  LoadingSkeleton(height: 20, width: 140),
                  SizedBox(height: 8),
                  LoadingSkeleton(height: 12, width: 220),
                  Spacer(),
                  LoadingSkeleton(
                    height: 36,
                    width: 110,
                    borderRadius: BorderRadius.all(Radius.circular(8)),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}


