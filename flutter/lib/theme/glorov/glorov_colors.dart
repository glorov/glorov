import 'package:flutter/material.dart';

/// GLOROV Brand & Semantic Color Tokens
/// A restrained, nature-inspired palette tailored for premium seeds, plants, and gardening.
class GlorovColors {
  GlorovColors._();

  // Primary Brand Colors (Deep Botanical Greens)
  static const Color forestDeep = Color(0xFF1B4332);
  static const Color forestMedium = Color(0xFF2D6A4F);
  static const Color forestDark = Color(0xFF081C15);

  // Secondary & Accent Greens
  static const Color sage = Color(0xFF52B788);
  static const Color sageLight = Color(0xFF74C69D);
  static const Color mint = Color(0xFFB7E4C7);
  static const Color mintSurface = Color(0xFFE8F5E9);
  static const Color mintBadge = Color(0xFFD8F3DC);

  // Botanical Earth & Warm Accents
  static const Color earthGold = Color(0xFFDDA15E);
  static const Color terracotta = Color(0xFFBC6C25);
  static const Color earthWarm = Color(0xFF606C38);
  static const Color sunAmber = Color(0xFFF4A261);

  // Surfaces & Backgrounds
  static const Color surfacePure = Colors.white;
  static const Color surfaceCream = Color(0xFFF9FAF8);
  static const Color surfaceMuted = Color(0xFFF3F4F1);
  static const Color surfaceCard = Colors.white;

  // Neutral Borders & Dividers
  static const Color borderSubtle = Color(0xFFE5E7EB);
  static const Color borderMedium = Color(0xFFD1D5DB);
  static const Color borderLight = Color(0xFFF3F4F6);

  // Typography / Content Roles
  static const Color textPrimary = Color(0xFF111827);
  static const Color textSecondary = Color(0xFF374151);
  static const Color textMuted = Color(0xFF6B7280);
  static const Color textDisabled = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Colors.white;

  // Semantic Status Roles
  static const Color error = Color(0xFFEF4444);
  static const Color errorSurface = Color(0xFFFEF2F2);
  static const Color success = Color(0xFF10B981);
  static const Color successSurface = Color(0xFFECFDF5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningSurface = Color(0xFFFFFBEB);
  static const Color info = Color(0xFF3B82F6);

  // MaterialColor Swatch for Flutter Theme integration
  static const MaterialColor primarySwatch =
      MaterialColor(0xFF1B4332, <int, Color>{
    50: Color(0xFFE8F5E9),
    100: Color(0xFFC8E6C9),
    200: Color(0xFFA5D6A7),
    300: Color(0xFF81C784),
    400: Color(0xFF4CAF50),
    500: Color(0xFF2D6A4F),
    600: Color(0xFF1B4332),
    700: Color(0xFF163628),
    800: Color(0xFF0F251C),
    900: Color(0xFF081C15),
  });
}
