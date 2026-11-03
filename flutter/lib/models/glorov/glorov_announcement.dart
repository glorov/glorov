import 'package:flutter/material.dart';

/// Announcement Bar Item model
class GlorovAnnouncementItem {
  final String id;
  final String text;
  final String? highlightText;
  final String? icon;
  final String? linkUrl;
  final int displayOrder;
  final bool isActive;
  final Color? badgeColor;
  final Color? badgeTextColor;

  const GlorovAnnouncementItem({
    required this.id,
    required this.text,
    this.highlightText,
    this.icon,
    this.linkUrl,
    this.displayOrder = 1,
    this.isActive = true,
    this.badgeColor,
    this.badgeTextColor,
  });

  static Color? _parseHexColor(String? hexString) {
    if (hexString == null) return null;
    try {
      final clean = hexString.replaceAll('#', '');
      if (clean.length == 6) {
        return Color(int.parse('FF$clean', radix: 16));
      } else if (clean.length == 8) {
        return Color(int.parse(clean, radix: 16));
      }
    } catch (_) {}
    return null;
  }

  factory GlorovAnnouncementItem.fromJson(Map<String, dynamic> json) {
    return GlorovAnnouncementItem(
      id: json['id']?.toString() ?? '',
      text: json['text']?.toString() ?? '',
      highlightText: json['highlight_text']?.toString(),
      icon: json['icon']?.toString(),
      linkUrl: json['link_url']?.toString(),
      displayOrder: (json['display_order'] as num?)?.toInt() ?? 1,
      isActive: json['is_active'] as bool? ?? true,
      badgeColor: _parseHexColor(json['badge_color']?.toString()),
      badgeTextColor: _parseHexColor(json['badge_text_color']?.toString()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'highlight_text': highlightText,
      'icon': icon,
      'link_url': linkUrl,
      'display_order': displayOrder,
      'is_active': isActive,
    };
  }

  static const List<GlorovAnnouncementItem> defaultItems = [
    GlorovAnnouncementItem(
      id: 'ann_free_shipping_499',
      text: 'Free express botanical delivery on all orders over ₹499',
      highlightText: '₹499 FREE DELIVERY',
      icon: 'local_shipping',
      linkUrl: '/store',
      displayOrder: 1,
      isActive: true,
    ),
    GlorovAnnouncementItem(
      id: 'ann_winter_sale',
      text: '❄️ Winter Botanical Sowing Sale: Flat 20% OFF with code WINTER20 • Pan-India Delivery',
      highlightText: 'WINTER SOWING SALE',
      icon: 'ac_unit',
      linkUrl: '/store',
      displayOrder: 2,
      isActive: true,
    ),
    GlorovAnnouncementItem(
      id: 'ann_grow_more',
      text: 'Grow More. Live Greener. Hand-conditioned plants & pure seeds',
      highlightText: 'GLOROV BOTANICALS',
      icon: 'spa',
      linkUrl: '/store',
      displayOrder: 2,
      isActive: true,
    ),
    GlorovAnnouncementItem(
      id: 'ann_glorov10',
      text: 'Use code GLOROV10 at checkout for an extra 10% off your order',
      highlightText: 'USE CODE GLOROV10',
      icon: 'percent',
      linkUrl: '/store',
      displayOrder: 3,
      isActive: true,
    ),
    GlorovAnnouncementItem(
      id: 'ann_organic_seeds',
      text: '100% Organic & Non-GMO certified heirloom seeds with 0% GST exemption',
      highlightText: '100% ORGANIC SEEDS',
      icon: 'verified',
      linkUrl: '/store?category=seeds',
      displayOrder: 4,
      isActive: true,
    ),
    GlorovAnnouncementItem(
      id: 'ann_pune_dispatch',
      text: 'Direct dispatch from Pune Central Nursery Hub • Mon–Thu transit guaranteed',
      highlightText: 'PUNE DISPATCH',
      icon: 'bolt',
      linkUrl: '/policies/shipping',
      displayOrder: 5,
      isActive: true,
    ),
  ];
}

/// Announcement Bar Configuration model
class GlorovAnnouncementConfig {
  final bool isEnabled;
  final int speedSeconds;
  final Color bgColor;
  final Color textColor;
  final Color highlightColor;
  final bool pauseOnHover;

  const GlorovAnnouncementConfig({
    this.isEnabled = true,
    this.speedSeconds = 30,
    this.bgColor = const Color(0xFF0C2340), // Dark Navy Blue Theme
    this.textColor = Colors.white,
    this.highlightColor = const Color(0xFFFFD51F), // Golden Yellow
    this.pauseOnHover = true,
  });

  factory GlorovAnnouncementConfig.fromJson(Map<String, dynamic> json) {
    Color parseHexColor(String? hex, Color fallback) {
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

    return GlorovAnnouncementConfig(
      isEnabled: json['is_enabled'] as bool? ?? true,
      speedSeconds: (json['speed_seconds'] as num?)?.toInt() ?? 30,
      bgColor: parseHexColor(json['bg_color']?.toString(), const Color(0xFF1B4332)),
      textColor: parseHexColor(json['text_color']?.toString(), Colors.white),
      highlightColor: parseHexColor(json['highlight_color']?.toString(), const Color(0xFFFFD51F)),
      pauseOnHover: json['pause_on_hover'] as bool? ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'is_enabled': isEnabled,
      'speed_seconds': speedSeconds,
      'bg_color': '#${bgColor.value.toRadixString(16).padLeft(8, '0').substring(2)}',
      'text_color': '#${textColor.value.toRadixString(16).padLeft(8, '0').substring(2)}',
      'highlight_color': '#${highlightColor.value.toRadixString(16).padLeft(8, '0').substring(2)}',
      'pause_on_hover': pauseOnHover,
    };
  }

  static const GlorovAnnouncementConfig defaultConfig = GlorovAnnouncementConfig();
}
