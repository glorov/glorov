import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import '../core/interactions/interactions.dart';
import '../constants.dart';

class NetworkImageWithLoader extends StatelessWidget {
  final BoxFit fit;

  const NetworkImageWithLoader(
    this.src, {
    super.key,
    this.fit = BoxFit.cover,
    this.radius = defaultPadding,
  });

  final String src;
  final double radius;

  @override
  Widget build(BuildContext context) {
    if (src.startsWith('assets/')) {
      return ClipRRect(
        borderRadius: BorderRadius.all(Radius.circular(radius)),
        child: Image.asset(
          src,
          fit: fit,
          cacheWidth: 800,
          filterQuality: FilterQuality.medium,
          errorBuilder: (context, error, stackTrace) => const Icon(Icons.error),
        ),
      );
    }
    return ClipRRect(
      borderRadius: BorderRadius.all(Radius.circular(radius)),
      child: CachedNetworkImage(
        fit: fit,
        imageUrl: src,
        memCacheWidth: 800,
        memCacheHeight: 800,
        maxWidthDiskCache: 1200,
        maxHeightDiskCache: 1200,
        filterQuality: FilterQuality.medium,
        imageBuilder: (context, imageProvider) => Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: imageProvider,
              fit: fit,
            ),
          ),
        ),
        placeholder: (context, url) => SkeletonScope(
          child: LoadingSkeleton(
            borderRadius: BorderRadius.all(Radius.circular(radius)),
          ),
        ),
        errorWidget: (context, url, error) => const Icon(Icons.error),
      ),
    );
  }
}
