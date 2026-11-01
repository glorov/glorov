import 'package:flutter/material.dart';

/// Trust pill item inside the GLOROV Botanical Hero Section
class GlorovHeroTrustPill {
  final String iconKey;
  final String text;

  const GlorovHeroTrustPill({
    required this.iconKey,
    required this.text,
  });

  factory GlorovHeroTrustPill.fromJson(Map<String, dynamic> json) {
    return GlorovHeroTrustPill(
      iconKey: json['icon'] as String? ?? 'eco_outlined',
      text: json['text'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        'icon': iconKey,
        'text': text,
      };

  IconData get iconData {
    switch (iconKey) {
      case 'winter':
      case 'ac_unit_rounded':
      case 'ac_unit':
        return Icons.ac_unit_rounded;
      case 'shipping':
      case 'local_shipping_outlined':
      case 'truck':
        return Icons.local_shipping_outlined;
      case 'transit':
      case 'shield':
      case 'eco_outlined':
      default:
        return Icons.eco_outlined;
    }
  }
}

/// Data model for the GLOROV Botanical Hero Showcase
/// Can be loaded dynamically from the Medusa backend (`/store/hero`)
/// with a graceful local botanical default.
class GlorovHeroData {
  final String id;
  final String tag;
  final String headline;
  final String description;
  final String ctaText;
  final String ctaRoute;
  final String secondaryCtaText;
  final String secondaryCtaRoute;
  final String desktopImageUrl;
  final String mobileImageUrl;
  final String plantTag;
  final String plantName;
  final String plantRoute;
  final List<GlorovHeroTrustPill> trustPills;
  final bool isActive;

  const GlorovHeroData({
    required this.id,
    required this.tag,
    required this.headline,
    required this.description,
    required this.ctaText,
    required this.ctaRoute,
    required this.secondaryCtaText,
    required this.secondaryCtaRoute,
    required this.desktopImageUrl,
    required this.mobileImageUrl,
    required this.plantTag,
    required this.plantName,
    required this.plantRoute,
    required this.trustPills,
    this.isActive = true,
  });

  /// Canonical botanical defaults matching the website
  static const GlorovHeroData defaultData = GlorovHeroData(
    id: 'hero_organic_botanical',
    tag: 'ORGANIC BOTANICAL COLLECTION 2026',
    headline: 'Grow Something\nBeautiful.',
    description:
        'Certified non-GMO heirloom seeds, nursery-acclimatized houseplants, and breathable terracotta planters. Cultivate a greener sanctuary at home with verified germination and transit protection.',
    ctaText: 'Shop Seeds & Plants',
    ctaRoute: '/categories/seeds',
    secondaryCtaText: 'Explore Care Guides',
    secondaryCtaRoute: '/plant-doctor',
    desktopImageUrl: 'assets/images/monstera_deliciosa_hero.jpg',
    mobileImageUrl: 'assets/images/monstera_deliciosa_hero.jpg',
    plantTag: 'PLANT OF THE SEASON',
    plantName: 'Monstera Deliciosa • Swiss Cheese',
    plantRoute: '/categories/live-plants',
    trustPills: [
      GlorovHeroTrustPill(
        iconKey: 'ac_unit_rounded',
        text: 'Winter Botanical Special',
      ),
      GlorovHeroTrustPill(
        iconKey: 'local_shipping_outlined',
        text: 'Free Shipping > ₹999',
      ),
      GlorovHeroTrustPill(
        iconKey: 'eco_outlined',
        text: 'Safe Transit Guarantee',
      ),
    ],
    isActive: true,
  );

  factory GlorovHeroData.fromJson(Map<String, dynamic> json) {
    final pillsRaw = json['trust_pills'];
    final List<GlorovHeroTrustPill> pills = [];
    if (pillsRaw is List) {
      for (final item in pillsRaw) {
        if (item is Map<String, dynamic>) {
          pills.add(GlorovHeroTrustPill.fromJson(item));
        }
      }
    }

    return GlorovHeroData(
      id: json['id'] as String? ?? 'hero_organic_botanical',
      tag: json['tag'] as String? ?? 'ORGANIC BOTANICAL COLLECTION 2026',
      headline: json['headline'] as String? ?? 'Grow Something\nBeautiful.',
      description: json['description'] as String? ??
          'Certified non-GMO heirloom seeds, nursery-acclimatized houseplants, and breathable terracotta planters. Cultivate a greener sanctuary at home with verified germination and transit protection.',
      ctaText: json['cta_text'] as String? ?? 'Shop Seeds & Plants',
      ctaRoute: json['cta_route'] as String? ?? '/categories/seeds',
      secondaryCtaText:
          json['secondary_cta_text'] as String? ?? 'Explore Care Guides',
      secondaryCtaRoute:
          json['secondary_cta_route'] as String? ?? '/plant-doctor',
      desktopImageUrl: json['desktop_image_url'] as String? ??
          'assets/images/monstera_deliciosa_hero.jpg',
      mobileImageUrl: json['mobile_image_url'] as String? ??
          'assets/images/monstera_deliciosa_hero.jpg',
      plantTag: json['plant_tag'] as String? ?? 'PLANT OF THE SEASON',
      plantName: json['plant_name'] as String? ??
          'Monstera Deliciosa • Swiss Cheese',
      plantRoute: json['plant_route'] as String? ?? '/categories/live-plants',
      trustPills: pills.isNotEmpty ? pills : defaultData.trustPills,
      isActive: json['is_active'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'tag': tag,
        'headline': headline,
        'description': description,
        'cta_text': ctaText,
        'cta_route': ctaRoute,
        'secondary_cta_text': secondaryCtaText,
        'secondary_cta_route': secondaryCtaRoute,
        'desktop_image_url': desktopImageUrl,
        'mobile_image_url': mobileImageUrl,
        'plant_tag': plantTag,
        'plant_name': plantName,
        'plant_route': plantRoute,
        'trust_pills': trustPills.map((p) => p.toJson()).toList(),
        'is_active': isActive,
      };
}
