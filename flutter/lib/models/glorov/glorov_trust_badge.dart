import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// GLOROV Trust Badge Item Model
/// Aligned with Medusa Backend (`/store/trust-badges` and `/admin/trust-badges`)
class GlorovTrustBadgeItem {
  final String id;
  final String title;
  final String? subtitle;
  final String iconKey;
  final String? customIconSvg;
  final String? ctaRoute;
  final int displayOrder;
  final bool isActive;

  const GlorovTrustBadgeItem({
    required this.id,
    required this.title,
    this.subtitle,
    required this.iconKey,
    this.customIconSvg,
    this.ctaRoute,
    required this.displayOrder,
    this.isActive = true,
  });

  factory GlorovTrustBadgeItem.fromJson(Map<String, dynamic> json) {
    return GlorovTrustBadgeItem(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
      subtitle: json['subtitle'] as String?,
      iconKey: json['icon_key'] as String? ?? 'fertilized-soil',
      customIconSvg: json['custom_icon_svg'] as String?,
      ctaRoute: json['cta_route'] as String?,
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 1,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'subtitle': subtitle,
        'icon_key': iconKey,
        'custom_icon_svg': customIconSvg,
        'cta_route': ctaRoute,
        'display_order': displayOrder,
        'is_active': isActive,
      };

  /// 4 Botanical Trust Guarantee Defaults (Image 2 style with User Content)
  static const List<GlorovTrustBadgeItem> defaults = [
    GlorovTrustBadgeItem(
      id: 'badge_organic_nongmo',
      title: '100% Organic\n& Non-GMO',
      subtitle:
          'Open-pollinated, chemical-free heirloom seeds tested for 98%+ germination vigor.',
      iconKey: 'organic-shield',
      ctaRoute: '/categories/seeds',
      displayOrder: 1,
      isActive: true,
    ),
    GlorovTrustBadgeItem(
      id: 'badge_safe_transit',
      title: 'Safe Transit\nGuarantee',
      subtitle:
          'Custom ventilated botanical packaging ensures live houseplants arrive lush and shock-free.',
      iconKey: 'transit-truck',
      ctaRoute: '/policies/shipping-policy',
      displayOrder: 2,
      isActive: true,
    ),
    GlorovTrustBadgeItem(
      id: 'badge_lifetime_support',
      title: 'Lifetime Plant\nSupport',
      subtitle:
          'Our in-house botanists guide your potting, watering, and harvesting every step of the way.',
      iconKey: 'support-hand',
      ctaRoute: '/plant-doctor',
      displayOrder: 3,
      isActive: true,
    ),
    GlorovTrustBadgeItem(
      id: 'badge_eco_friendly',
      title: 'Eco-Friendly\nPhilosophy',
      subtitle:
          'Biodegradable seed sleeves, plastic-free shipping containers, and sustainable coco-coir.',
      iconKey: 'eco-leaf',
      ctaRoute: '/about',
      displayOrder: 4,
      isActive: true,
    ),
  ];
}

/// GLOROV Trust Section Theme & Appearance Settings
class GlorovTrustSectionSettings {
  final Color bgColor;
  final Color textColor;
  final Color iconBgColor;
  final Color iconColor;
  final Color dividerColor;
  final double borderRadius;
  final bool isVisible;
  final String? sectionTitle;
  final String? sectionSubtitle;

  const GlorovTrustSectionSettings({
    this.bgColor = AppColors.forestDeep,
    this.textColor = Colors.white,
    this.iconBgColor = Colors.white,
    this.iconColor = AppColors.forestDeep,
    this.dividerColor = const Color(0x3BFFFFFF),
    this.borderRadius = 20.0,
    this.isVisible = true,
    this.sectionTitle,
    this.sectionSubtitle,
  });

  factory GlorovTrustSectionSettings.fromJson(Map<String, dynamic> json) {
    Color parseHex(String? hex, Color fallback) {
      if (hex == null || hex.isEmpty) return fallback;
      try {
        final buffer = StringBuffer();
        if (hex.length == 6 || hex.length == 7) buffer.write('ff');
        buffer.write(hex.replaceFirst('#', ''));
        return Color(int.parse(buffer.toString(), radix: 16));
      } catch (_) {
        return fallback;
      }
    }

    return GlorovTrustSectionSettings(
      bgColor: parseHex(json['bg_color'] as String?, AppColors.forestDeep),
      textColor: parseHex(json['text_color'] as String?, Colors.white),
      iconBgColor: parseHex(json['icon_bg_color'] as String?, Colors.white),
      iconColor: parseHex(json['icon_color'] as String?, AppColors.forestDeep),
      dividerColor: parseHex(json['divider_color'] as String?, const Color(0x3BFFFFFF)),
      borderRadius: (json['border_radius'] as num?)?.toDouble() ?? 20.0,
      isVisible: json['is_visible'] as bool? ?? true,
      sectionTitle: json['section_title'] as String?,
      sectionSubtitle: json['section_subtitle'] as String?,
    );
  }
}
