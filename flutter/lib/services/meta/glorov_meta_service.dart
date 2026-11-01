import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'glorov_meta_service_stub.dart'
    if (dart.library.js_interop) 'glorov_meta_service_web.dart';

/// Centralized SEO, Social Share & Document Metadata Service for GLOROV
class GlorovMetaService {
  GlorovMetaService._();
  static final GlorovMetaService _instance = GlorovMetaService._();
  static GlorovMetaService get instance => _instance;

  static const String siteName = 'GLOROV';
  static const String defaultTitle =
      'GLOROV — Premium Seeds, Live Plants & Botanical Gardening Supplies';
  static const String defaultDescription =
      'Shop authentic premium seeds with guaranteed high germination, live indoor & outdoor plants, handcrafted planters, and organic gardening supplies from GLOROV. Fast delivery across India.';
  static const String siteUrl = 'https://glorovs.web.app';
  static const String defaultOgImage = 'https://glorovs.web.app/og-image.jpg';

  /// Sets metadata for a specific product
  void setProductMeta({
    required String title,
    required String description,
    required String imageUrl,
    required String productSlugOrId,
    double? price,
  }) {
    final pageTitle = '$title • Premium Seeds & Live Plants | $siteName';
    final productUrl = '$siteUrl/product/$productSlugOrId';
    final cleanDesc = description.replaceAll(RegExp(r'\s+'), ' ').trim();
    final truncatedDesc = cleanDesc.length > 165
        ? '${cleanDesc.substring(0, 162)}...'
        : cleanDesc;

    // Update app switcher / browser title universally
    SystemChrome.setApplicationSwitcherDescription(
      ApplicationSwitcherDescription(
        label: pageTitle,
        primaryColor: 0xFF1E3A2F,
      ),
    );

    if (kIsWeb) {
      updateWebMeta(
        title: pageTitle,
        description: truncatedDesc,
        imageUrl: imageUrl.startsWith('http') ? imageUrl : '$siteUrl/$imageUrl',
        url: productUrl,
        type: 'product',
        price: price != null ? price.toStringAsFixed(2) : '49.00',
      );
    }
  }

  /// Resets metadata back to home/storefront defaults
  void resetToDefault() {
    SystemChrome.setApplicationSwitcherDescription(
      const ApplicationSwitcherDescription(
        label: defaultTitle,
        primaryColor: 0xFF1E3A2F,
      ),
    );

    if (kIsWeb) {
      updateWebMeta(
        title: defaultTitle,
        description: defaultDescription,
        imageUrl: defaultOgImage,
        url: siteUrl,
        type: 'website',
        price: null,
      );
    }
  }

  /// Triggers native web sharing sheet or copies to clipboard
  Future<bool> shareProduct({
    required String title,
    required String productSlugOrId,
  }) async {
    final productUrl = '$siteUrl/product/$productSlugOrId';
    final shareText = 'Check out $title on GLOROV:';

    if (kIsWeb) {
      final shared = await shareOnWeb(
        title: title,
        text: shareText,
        url: productUrl,
      );
      if (shared) return true;
    }

    // Fallback: Copy to clipboard
    await Clipboard.setData(ClipboardData(text: productUrl));
    return false; // Indicating clipboard copy fallback
  }
}
