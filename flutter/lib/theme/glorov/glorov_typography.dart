import 'package:flutter/material.dart';
import 'glorov_colors.dart';

/// GLOROV Typography Scale & TextTheme
class GlorovTypography {
  GlorovTypography._();

  static const String primaryFont = 'Plus Jakarta';
  static const String displayFont = 'Fraunces';
  static const String serifFont = 'Fraunces';

  static TextTheme textTheme(Color textColor) {
    return TextTheme(
      displayLarge: TextStyle(
        fontFamily: displayFont,
        fontSize: 36,
        fontWeight: FontWeight.w700,
        height: 1.2,
        letterSpacing: -0.5,
        color: textColor,
      ),
      displayMedium: TextStyle(
        fontFamily: displayFont,
        fontSize: 28,
        fontWeight: FontWeight.w700,
        height: 1.25,
        letterSpacing: -0.3,
        color: textColor,
      ),
      displaySmall: TextStyle(
        fontFamily: displayFont,
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.3,
        letterSpacing: -0.2,
        color: textColor,
      ),
      headlineMedium: TextStyle(
        fontFamily: primaryFont,
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: textColor,
      ),
      headlineSmall: TextStyle(
        fontFamily: primaryFont,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.4,
        color: textColor,
      ),
      titleLarge: TextStyle(
        fontFamily: primaryFont,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.45,
        color: textColor,
      ),
      titleMedium: TextStyle(
        fontFamily: primaryFont,
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.45,
        color: textColor,
      ),
      titleSmall: TextStyle(
        fontFamily: primaryFont,
        fontSize: 13,
        fontWeight: FontWeight.w500,
        height: 1.45,
        color: textColor,
      ),
      bodyLarge: TextStyle(
        fontFamily: primaryFont,
        fontSize: 15,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: textColor,
      ),
      bodyMedium: const TextStyle(
        fontFamily: primaryFont,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: GlorovColors.textSecondary,
      ),
      bodySmall: const TextStyle(
        fontFamily: primaryFont,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: GlorovColors.textMuted,
      ),
      labelLarge: TextStyle(
        fontFamily: primaryFont,
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.1,
        color: textColor,
      ),
      labelMedium: const TextStyle(
        fontFamily: primaryFont,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.2,
        color: GlorovColors.textSecondary,
      ),
      labelSmall: const TextStyle(
        fontFamily: primaryFont,
        fontSize: 10,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        color: GlorovColors.textMuted,
      ),
    );
  }
}
