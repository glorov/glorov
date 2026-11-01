import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';

/// Promotional Offer Model for GLOROV Botanical Storefront
/// Directly maps to Medusa `/store/offers` and Medusa Admin `/admin/offers` endpoints.
class GlorovOffer {
  final String id;
  final String code;
  final String title;
  final String tag;
  final String description;
  final String discountBadge;
  final String discountType; // percentage, fixed, free_shipping
  final double discountValue;
  final double? minSpend;
  final String? minSpendText;
  final String? expiryText;
  final String category;
  final String? bgColor;
  final String? textColor;
  final String? accentColor;
  final String iconName;
  final bool isHighlighted;
  final bool isActive;
  final int displayOrder;

  const GlorovOffer({
    required this.id,
    required this.code,
    required this.title,
    required this.tag,
    required this.description,
    required this.discountBadge,
    this.discountType = 'percentage',
    this.discountValue = 10.0,
    this.minSpend = 499.0,
    this.minSpendText = 'Min Order: ₹499',
    this.expiryText = 'Valid on botanical orders',
    this.category = 'welcome',
    this.bgColor = '#EAF4EE',
    this.textColor = '#1B3B2B',
    this.accentColor = '#1E3D2F',
    this.iconName = 'card_giftcard',
    this.isHighlighted = true,
    this.isActive = true,
    this.displayOrder = 1,
  });

  /// Factory from Medusa API JSON payload
  factory GlorovOffer.fromJson(Map<String, dynamic> json) {
    return GlorovOffer(
      id: json['id']?.toString() ?? 'offer_${DateTime.now().millisecondsSinceEpoch}',
      code: (json['code']?.toString() ?? 'GLOROV10').toUpperCase().trim(),
      title: json['title']?.toString() ?? 'Special Welcome Offer',
      tag: json['tag']?.toString() ?? 'SPECIAL WELCOME OFFER',
      description: json['description']?.toString() ??
          'Use code GLOROV10 at checkout for an extra 10% off your entire botanical order.',
      discountBadge: json['discount_badge']?.toString() ?? '10% OFF',
      discountType: json['discount_type']?.toString() ?? 'percentage',
      discountValue: (json['discount_value'] is num)
          ? (json['discount_value'] as num).toDouble()
          : 10.0,
      minSpend: (json['min_spend'] is num)
          ? (json['min_spend'] as num).toDouble()
          : 499.0,
      minSpendText: json['min_spend_text']?.toString() ?? 'Min Order: ₹499',
      expiryText: json['expiry_text']?.toString(),
      category: json['category']?.toString() ?? 'welcome',
      bgColor: json['bg_color']?.toString() ?? '#EAF4EE',
      textColor: json['text_color']?.toString() ?? '#1B3B2B',
      accentColor: json['accent_color']?.toString() ?? '#1E3D2F',
      iconName: json['icon']?.toString() ?? 'card_giftcard',
      isHighlighted: json['is_highlighted'] == true,
      isActive: json['is_active'] != false,
      displayOrder: (json['display_order'] is num)
          ? (json['display_order'] as num).toInt()
          : 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'title': title,
      'tag': tag,
      'description': description,
      'discount_badge': discountBadge,
      'discount_type': discountType,
      'discount_value': discountValue,
      'min_spend': minSpend,
      'min_spend_text': minSpendText,
      'expiry_text': expiryText,
      'category': category,
      'bg_color': bgColor,
      'text_color': textColor,
      'accent_color': accentColor,
      'icon': iconName,
      'is_highlighted': isHighlighted,
      'is_active': isActive,
      'display_order': displayOrder,
    };
  }

  /// Resolve color hex safely
  static Color parseHex(String? hex, Color fallback) {
    if (hex == null || hex.isEmpty) return fallback;
    try {
      final clean = hex.replaceAll('#', '').trim();
      if (clean.length == 6) {
        return Color(int.parse('FF$clean', radix: 16));
      } else if (clean.length == 8) {
        return Color(int.parse(clean, radix: 16));
      }
    } catch (_) {}
    return fallback;
  }

  Color get backgroundColorValue => parseHex(bgColor, AppColors.mintSurface);
  Color get textColorValue => parseHex(textColor, AppColors.textPrimary);
  Color get accentColorValue => parseHex(accentColor, AppColors.forestDeep);

  /// Resolved Material Icon
  IconData get iconData {
    switch (iconName) {
      case 'card_giftcard':
        return Icons.card_giftcard;
      case 'auto_awesome':
        return Icons.auto_awesome;
      case 'spa':
        return Icons.spa;
      case 'ac_unit':
        return Icons.ac_unit;
      case 'local_shipping':
        return Icons.local_shipping;
      case 'percent':
        return Icons.percent;
      case 'local_offer':
      default:
        return Icons.local_offer;
    }
  }

  /// Canonical fallback welcome offer matching the user's uploaded image exactly
  static const GlorovOffer defaultWelcomeOffer = GlorovOffer(
    id: 'offer_welcome_glorov10',
    code: 'GLOROV10',
    title: 'Special Welcome Offer',
    tag: 'SPECIAL WELCOME OFFER',
    description:
        'Use code GLOROV10 at checkout for an extra 10% off your entire botanical order.',
    discountBadge: '10% OFF',
    discountType: 'percentage',
    discountValue: 10.0,
    minSpend: 499.0,
    minSpendText: 'Min Order: ₹499',
    expiryText: 'Valid on first botanical order',
    category: 'welcome',
    bgColor: '#EAF4EE',
    textColor: '#1B3B2B',
    accentColor: '#1E3D2F',
    iconName: 'card_giftcard',
    isHighlighted: true,
    isActive: true,
    displayOrder: 1,
  );
}
