import 'package:flutter/material.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/glorov_horizontal_scroll_behavior.dart';
import '../common/glorov_y_scroll_pass_through.dart';

/// Reusable Production-Quality Product Gallery Component for GLOROV
/// Features:
/// 1. Stationary / Sticky support on Desktop & Landscape Tablet viewports.
/// 2. Large primary image with smooth AnimatedSwitcher cross-fade transitions.
/// 3. Overlaid promotional badges (DIWALI SALE) and botanical quick-sow pill.
/// 4. Interactive Fullscreen Zoom & Pan Preview Modal with pinch-to-zoom, double-tap,
///    navigation arrows, image counter, and thumbnail jump strip.
/// 5. Horizontal thumbnail selector with active state border & mint glow.
/// 6. Carousel dot indicator strip.
/// 7. Mouse-wheel Y-scroll pass-through delegation to parent/right column ScrollController,
///    preventing frozen/stuck scrolling when cursor is over the gallery.
/// 8. Horizontal touch swipe support to switch images on mobile and touchscreen devices.
class GlorovProductGallery extends StatefulWidget {
  final List<String> imageUrls;
  final int selectedIndex;
  final ValueChanged<int>? onImageSelected;
  final String? badgeText;
  final String? sowingAdvice;
  final ScrollController? delegateScrollController;
  final bool isSticky;
  final double? maxGalleryHeight;

  const GlorovProductGallery({
    super.key,
    required this.imageUrls,
    this.selectedIndex = 0,
    this.onImageSelected,
    this.badgeText,
    this.sowingAdvice,
    this.delegateScrollController,
    this.isSticky = false,
    this.maxGalleryHeight,
  });

  @override
  State<GlorovProductGallery> createState() => _GlorovProductGalleryState();
}

class _GlorovProductGalleryState extends State<GlorovProductGallery> {
  late int _currentIndex;

  List<String> get _safeImages {
    return widget.imageUrls.where((u) => u.trim().isNotEmpty).toList();
  }

  @override
  void initState() {
    super.initState();
    final images = _safeImages;
    _currentIndex = images.isNotEmpty
        ? widget.selectedIndex.clamp(0, images.length - 1)
        : 0;
  }

  @override
  void didUpdateWidget(covariant GlorovProductGallery oldWidget) {
    super.didUpdateWidget(oldWidget);
    final images = _safeImages;
    if (images.isNotEmpty && widget.selectedIndex != oldWidget.selectedIndex) {
      _currentIndex = widget.selectedIndex.clamp(0, images.length - 1);
    }
  }

  void _selectImage(int index) {
    final images = _safeImages;
    if (images.isEmpty) return;
    final validIndex = index.clamp(0, images.length - 1);
    if (validIndex != _currentIndex) {
      setState(() => _currentIndex = validIndex);
      widget.onImageSelected?.call(validIndex);
    }
  }

  void _nextImage() {
    final images = _safeImages;
    if (images.isNotEmpty && _currentIndex < images.length - 1) {
      _selectImage(_currentIndex + 1);
    }
  }

  void _previousImage() {
    final images = _safeImages;
    if (images.isNotEmpty && _currentIndex > 0) {
      _selectImage(_currentIndex - 1);
    }
  }

  /// Opens the interactive fullscreen preview modal with pinch-to-zoom and pan
  void _openFullscreenViewer(BuildContext context) {
    showDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.92),
      builder: (dialogContext) {
        int modalIndex = _currentIndex;
        return StatefulBuilder(
          builder: (context, setModalState) {
            final images = _safeImages;
            final currentUrl = images[modalIndex];

            return Dialog(
              backgroundColor: Colors.transparent,
              insetPadding: EdgeInsets.zero,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Dismissible background
                  GestureDetector(
                    onTap: () => Navigator.pop(dialogContext),
                    child: Container(color: Colors.transparent),
                  ),

                  // Interactive Viewer for Pinch-to-zoom and Pan
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 40.0,
                        vertical: 70.0,
                      ),
                      child: InteractiveViewer(
                        minScale: 1.0,
                        maxScale: 4.5,
                        clipBehavior: Clip.none,
                        child: AnimatedSwitcher(
                          duration: const Duration(milliseconds: 220),
                          child: currentUrl.startsWith('assets/')
                              ? Image.asset(
                                  currentUrl,
                                  key: ValueKey<String>(currentUrl),
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 320,
                                    height: 320,
                                    color: Colors.white10,
                                    child: const Icon(
                                      Icons.broken_image,
                                      color: Colors.white54,
                                      size: 64,
                                    ),
                                  ),
                                )
                              : Image.network(
                                  currentUrl,
                                  key: ValueKey<String>(currentUrl),
                                  fit: BoxFit.contain,
                                  loadingBuilder: (context, child, progress) {
                                    if (progress == null) return child;
                                    return Container(
                                      width: 320,
                                      height: 320,
                                      color: Colors.white10,
                                    );
                                  },
                                  errorBuilder: (_, __, ___) => Container(
                                    width: 320,
                                    height: 320,
                                    color: Colors.white10,
                                    child: const Icon(
                                      Icons.broken_image,
                                      color: Colors.white54,
                                      size: 64,
                                    ),
                                  ),
                                ),
                        ),
                      ),
                    ),
                  ),

                  // Top Control Bar: Title, Zoom Hint, Counter and Close Button
                  Positioned(
                    top: 16,
                    left: 20,
                    right: 20,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Image Counter Badge & Zoom Hint
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.65),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: Colors.white24),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                '${modalIndex + 1} / ${images.length}',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Text(
                                '•  Pinch or double-tap to zoom',
                                style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Close Modal Button
                        Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () => Navigator.pop(dialogContext),
                            borderRadius: BorderRadius.circular(24),
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.65),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white24),
                              ),
                              child: const Icon(
                                Icons.close,
                                color: Colors.white,
                                size: 24,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Previous Image Arrow Button
                  if (modalIndex > 0)
                    Positioned(
                      left: 16,
                      top: 0,
                      bottom: 0,
                      child: Center(
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              setModalState(() => modalIndex--);
                              _selectImage(modalIndex);
                            },
                            borderRadius: BorderRadius.circular(28),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.65),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white24),
                              ),
                              child: const Icon(
                                Icons.chevron_left,
                                color: Colors.white,
                                size: 32,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                  // Next Image Arrow Button
                  if (modalIndex < images.length - 1)
                    Positioned(
                      right: 16,
                      top: 0,
                      bottom: 0,
                      child: Center(
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              setModalState(() => modalIndex++);
                              _selectImage(modalIndex);
                            },
                            borderRadius: BorderRadius.circular(28),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.65),
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white24),
                              ),
                              child: const Icon(
                                Icons.chevron_right,
                                color: Colors.white,
                                size: 32,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),

                  // Bottom Modal Thumbnail Strip
                  if (images.length > 1)
                    Positioned(
                      bottom: 20,
                      left: 20,
                      right: 20,
                      child: Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.70),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: Colors.white24),
                          ),
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: List.generate(images.length, (idx) {
                                final isSel = idx == modalIndex;
                                return GestureDetector(
                                  onTap: () {
                                    setModalState(() => modalIndex = idx);
                                    _selectImage(idx);
                                  },
                                  child: Container(
                                    margin: const EdgeInsets.symmetric(
                                      horizontal: 5,
                                    ),
                                    width: 48,
                                    height: 48,
                                    padding: const EdgeInsets.all(2.0),
                                    decoration: BoxDecoration(
                                      color: Colors.black,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(
                                        color: isSel
                                            ? const Color(0xFF52B788)
                                            : Colors.white30,
                                        width: 2.0,
                                      ),
                                    ),
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(5),
                                      child: images[idx].startsWith('assets/')
                                          ? Image.asset(
                                              images[idx],
                                              fit: BoxFit.cover,
                                              cacheWidth: 100,
                                              cacheHeight: 100,
                                              filterQuality: FilterQuality.medium,
                                              errorBuilder: (_, __, ___) => Container(
                                                color: Colors.white10,
                                                child: const Icon(
                                                  Icons.image,
                                                  size: 20,
                                                  color: Colors.white54,
                                                ),
                                              ),
                                            )
                                          : Image.network(
                                              images[idx],
                                              fit: BoxFit.cover,
                                              cacheWidth: 100,
                                              cacheHeight: 100,
                                              filterQuality: FilterQuality.medium,
                                              errorBuilder: (_, __, ___) => Container(
                                                color: Colors.white10,
                                                child: const Icon(
                                                  Icons.image,
                                                  size: 20,
                                                  color: Colors.white54,
                                                ),
                                              ),
                                            ),
                                    ),
                                  ),
                                );
                              }),
                            ),
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final images = _safeImages;
    if (images.isEmpty) {
      return Container(
        height: 320,
        decoration: BoxDecoration(
          color: AppColors.surfaceSubtle,
          borderRadius: BorderRadius.circular(16),
        ),
        alignment: Alignment.center,
        child: const Icon(
          Icons.eco_outlined,
          size: 48,
          color: AppColors.sage,
        ),
      );
    }
    final currentImg = images[_currentIndex.clamp(0, images.length - 1)];
    final isDesktop = AppBreakpoints.isDesktop(context);

    // Main Gallery Column
    Widget galleryContent = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 1. Primary Image Frame with Overlays
        GestureDetector(
          onHorizontalDragEnd: (details) {
            final delta = details.primaryVelocity ?? 0.0;
            if (delta < -200) {
              _nextImage();
            } else if (delta > 200) {
              _previousImage();
            }
          },
          child: LayoutBuilder(
            builder: (context, constraints) {
              final double maxH = widget.maxGalleryHeight ??
                  (constraints.maxHeight.isFinite
                      ? (constraints.maxHeight - 80).clamp(240.0, 560.0)
                      : 520.0);

              return ConstrainedBox(
                constraints: BoxConstraints(maxHeight: maxH),
                child: AspectRatio(
                  aspectRatio: 1.05,
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF9FAF8),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE5E7EB)),
                      boxShadow: const [
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
                        // Main Image with AnimatedSwitcher cross-fade
                        AnimatedSwitcher(
                          duration: const Duration(milliseconds: 240),
                          switchInCurve: Curves.easeIn,
                          switchOutCurve: Curves.easeOut,
                          child: currentImg.startsWith('assets/')
                              ? Image.asset(
                                  currentImg,
                                  key: ValueKey<String>(currentImg),
                                  fit: BoxFit.cover,
                                  cacheWidth: 1000,
                                  cacheHeight: 1000,
                                  filterQuality: FilterQuality.medium,
                                  width: double.infinity,
                                  height: double.infinity,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: AppColors.mintSurface,
                                      child: const Center(
                                        child: Icon(
                                          Icons.spa,
                                          size: 48,
                                          color: AppColors.sage,
                                        ),
                                      ),
                                    );
                                  },
                                )
                              : Image.network(
                                  currentImg,
                                  key: ValueKey<String>(currentImg),
                                  fit: BoxFit.cover,
                                  cacheWidth: 1000,
                                  cacheHeight: 1000,
                                  filterQuality: FilterQuality.medium,
                                  width: double.infinity,
                                  height: double.infinity,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      color: AppColors.mintSurface,
                                      child: const Center(
                                        child: Icon(
                                          Icons.spa,
                                          size: 48,
                                          color: AppColors.sage,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                        ),

                        // Top-Left Docked Badge (e.g. ⚡ DIWALI SALE)
                        if (widget.badgeText != null &&
                            widget.badgeText!.isNotEmpty)
                          Positioned(
                            top: 0,
                            left: 0,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 11,
                                vertical: 6,
                              ),
                              decoration: const BoxDecoration(
                                color: AppColors.tagDarkBlue, // Theme dark blue #0c2340
                                borderRadius: BorderRadius.only(
                                  topLeft: Radius.circular(16),
                                  bottomRight: Radius.circular(14),
                                  topRight: Radius.circular(14),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.bolt,
                                    size: 14,
                                    color: Color(0xFFFACC15),
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    widget.badgeText!,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w800,
                                      letterSpacing: 0.6,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),

                        // Top-Right Floating Zoom / Fullscreen Button
                        Positioned(
                          top: 10,
                          right: 10,
                          child: Tooltip(
                            message: 'Click for Fullscreen Zoom Preview',
                            child: TapFeedback(
                              onTap: () => _openFullscreenViewer(context),
                              effect: TapAnimationType.scale,
                              scaleDown: 0.90,
                              child: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(alpha: 0.88),
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                      color: const Color(0xFFE5E7EB)),
                                  boxShadow: const [
                                    BoxShadow(
                                      color: Color(0x1F000000),
                                      blurRadius: 6,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: const Icon(
                                  Icons.fullscreen,
                                  size: 20,
                                  color: AppColors.forestDeep,
                                ),
                              ),
                            ),
                          ),
                        ),

                        // Bottom Quick Sow Pill Overlay
                        if (widget.sowingAdvice != null &&
                            widget.sowingAdvice!.isNotEmpty)
                          Positioned(
                            left: 10,
                            right: 10,
                            bottom: 10,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 11,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.black.withValues(alpha: 0.68),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.yard,
                                    size: 14,
                                    color: Color(0xFF74C69D),
                                  ),
                                  const SizedBox(width: 5),
                                  Flexible(
                                    child: Text(
                                      widget.sowingAdvice!,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 11,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // 2. Carousel Dot Indicators
        if (images.length > 1) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(images.length, (idx) {
              final isSel = idx == _currentIndex;
              return TapFeedback(
                onTap: () => _selectImage(idx),
                effect: TapAnimationType.scale,
                scaleDown: 0.90,
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: isSel ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color:
                        isSel ? AppColors.forestDeep : const Color(0xFFD1D5DB),
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
              );
            }),
          ),
        ],

        // 3. Thumbnails Selector Row
        if (images.length > 1) ...[
          const SizedBox(height: 10),
          GlorovYScrollPassThrough(
            parentScrollController: widget.delegateScrollController,
            child: SizedBox(
              height: isDesktop ? 56 : 48,
              child: ScrollConfiguration(
                behavior: const GlorovHorizontalScrollBehavior(),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(images.length, (idx) {
                      final isSel = idx == _currentIndex;
                      final thumbSize = isDesktop ? 58.0 : 48.0;

                      return GlorovYScrollPassThrough(
                        parentScrollController: widget.delegateScrollController,
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 5),
                          child: _GalleryThumbnailItem(
                            key: ValueKey<String>('gallery_thumbnail_$idx'),
                            imageUrl: images[idx],
                            isSelected: isSel,
                            size: thumbSize,
                            onTap: () => _selectImage(idx),
                          ),
                        ),
                      );
                    }),
                  ),
                ),
              ),
            ),
          ),
        ],
      ],
    );

    // If delegateScrollController is provided and gallery is sticky,
    // intercept vertical mouse-wheel events and pass them smoothly to the right-column scroll view.
    if (widget.isSticky && widget.delegateScrollController != null) {
      return GlorovYScrollPassThrough(
        parentScrollController: widget.delegateScrollController,
        child: galleryContent,
      );
    }

    return GlorovYScrollPassThrough(child: galleryContent);
  }
}

/// Refined Interactive Gallery Thumbnail with crisp 2px border ring,
/// inset image mount, and smooth interactive hover & selection transitions.
class _GalleryThumbnailItem extends StatefulWidget {
  final String imageUrl;
  final bool isSelected;
  final double size;
  final VoidCallback onTap;

  const _GalleryThumbnailItem({
    super.key,
    required this.imageUrl,
    required this.isSelected,
    required this.size,
    required this.onTap,
  });

  @override
  State<_GalleryThumbnailItem> createState() => _GalleryThumbnailItemState();
}

class _GalleryThumbnailItemState extends State<_GalleryThumbnailItem> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final borderColor = widget.isSelected
        ? AppColors.forestDeep
        : (_isHovered ? const Color(0xFF9CA3AF) : const Color(0xFFE5E7EB));

    return MouseRegion(
      cursor: SystemMouseCursors.click,
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: TapFeedback(
        onTap: widget.onTap,
        effect: TapAnimationType.scale,
        scaleDown: 0.94,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeOutCubic,
          width: widget.size,
          height: widget.size,
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: borderColor,
              width: 2.0, // Fixed 2.0px width - zero resize twitch!
            ),
            boxShadow: widget.isSelected
                ? [
                    BoxShadow(
                      color: AppColors.forestDeep.withValues(alpha: 0.22),
                      blurRadius: 8,
                      spreadRadius: 0.5,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: const Color(0x0A000000),
                      blurRadius: _isHovered ? 6 : 4,
                      offset: const Offset(0, 1),
                    ),
                  ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: widget.imageUrl.startsWith('assets/')
                ? Image.asset(
                    widget.imageUrl,
                    fit: BoxFit.cover,
                    cacheWidth: 120,
                    cacheHeight: 120,
                    filterQuality: FilterQuality.medium,
                    errorBuilder: (_, __, ___) => Container(
                      color: const Color(0xFFF3F4F6),
                      child: const Icon(
                        Icons.image,
                        size: 20,
                        color: Colors.grey,
                      ),
                    ),
                  )
                : Image.network(
                    widget.imageUrl,
                    fit: BoxFit.cover,
                    cacheWidth: 120,
                    cacheHeight: 120,
                    filterQuality: FilterQuality.medium,
                    errorBuilder: (_, __, ___) => Container(
                      color: const Color(0xFFF3F4F6),
                      child: const Icon(
                        Icons.image,
                        size: 20,
                        color: Colors.grey,
                      ),
                    ),
                  ),
          ),
        ),
      ),
    );
  }
}
