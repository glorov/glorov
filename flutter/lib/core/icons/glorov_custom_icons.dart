import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../theme/app_colors.dart';
import '../theme/app_typography.dart';

/// Centralized bespoke custom icons for GLOROV Botanical Storefront
/// Provides consistent, high-end vector icons for Cart, Buy Now, and User Profile.
class GlorovCustomIcons {
  const GlorovCustomIcons._();

  // ---------------------------------------------------------------------------
  // 1. Bespoke Cart / Shopping Bag Icon (Clean Botanical Tote / Bag)
  // ---------------------------------------------------------------------------
  static const String _cartBagOutlineSvg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5.5 8.5h13l1.2 12.2a2 2 0 0 1-2 2.3H6.3a2 2 0 0 1-2-2.3L5.5 8.5z"/>
    <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5"/>
    <path d="M9.5 12.5a2.5 2.5 0 0 0 5 0"/>
  </svg>''';

  static const String _cartBagFilledSvg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5.5 8.5h13l1.2 12.2a2 2 0 0 1-2 2.3H6.3a2 2 0 0 1-2-2.3L5.5 8.5z" fill="currentColor" fill-opacity="0.16"/>
    <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5"/>
    <path d="M9.5 12.5a2.5 2.5 0 0 0 5 0"/>
  </svg>''';

  /// Renders the custom GLOROV botanical shopping tote/bag icon
  static Widget cart({
    double size = 21.0,
    Color color = AppColors.forestDeep,
    bool isFilled = false,
  }) {
    return SvgPicture.string(
      isFilled ? _cartBagFilledSvg : _cartBagOutlineSvg,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }

  // ---------------------------------------------------------------------------
  // 2. Bespoke Express Buy / Lightning Bolt Icon
  // ---------------------------------------------------------------------------
  static const String _buyBoltSvg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L4 13.5h6.5L9.5 22 19 10.5h-6.5L13 2z"/>
  </svg>''';

  /// Renders the custom GLOROV express buy lightning icon
  static Widget buy({
    double size = 18.0,
    Color color = Colors.white,
  }) {
    return SvgPicture.string(
      _buyBoltSvg,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Bespoke Authenticated User / Logged-in Avatar Icon
  // ---------------------------------------------------------------------------
  static const String _userVerifiedSvg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="7.5" r="4.2"/>
    <path d="M4 21c0-4.2 3.6-7.5 8-7.5 1.5 0 2.9.4 4.1 1.1"/>
    <circle cx="18" cy="18" r="4" fill="#0A4C36" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M16.5 18l1 1 2-2" stroke="#ffffff" stroke-width="1.6"/>
  </svg>''';

  /// Renders the custom GLOROV logged-in user avatar with verified badge
  static Widget loggedInUser({
    double size = 24.0,
    Color color = AppColors.forestDeep,
    String? initials,
  }) {
    if (initials != null && initials.isNotEmpty) {
      return SizedBox(
        width: size,
        height: size,
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: size,
              height: size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  colors: [Color(0xFF0A4C36), Color(0xFF166534)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                border: Border.all(color: const Color(0xFF86EFAC), width: 1.4),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1F000000),
                    blurRadius: 4,
                    offset: Offset(0, 1.5),
                  ),
                ],
              ),
              alignment: Alignment.center,
              child: Text(
                initials.toUpperCase(),
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: size * 0.44,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
            ),
            Positioned(
              right: -1,
              bottom: -1,
              child: Container(
                width: size * 0.36,
                height: size * 0.36,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFF10B981),
                  border: Border.all(color: Colors.white, width: 1.2),
                ),
                child: const Icon(
                  Icons.check,
                  size: 6.5,
                  color: Colors.white,
                ),
              ),
            ),
          ],
        ),
      );
    }

    return SvgPicture.string(
      _userVerifiedSvg,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}
