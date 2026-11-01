import 'package:flutter/material.dart';
import 'app_colors.dart';

/// GLOROV Core Design System - Typography Tokens
class AppTypography {
  AppTypography._();

  static const String primaryFont = 'Plus Jakarta';
  static const String displayFont = 'Fraunces';
  static const String serifFont = 'Fraunces';

  static const List<String> primaryFontFallback = [
    'Grandis Extended',
    'Fraunces',
    'Roboto',
    'Noto Sans',
    'Arial',
    'sans-serif',
  ];

  static const List<String> displayFontFallback = [
    'Grandis Extended',
    'Plus Jakarta',
    'Roboto',
    'Noto Sans',
    'serif',
  ];

  static TextTheme textTheme(Color textColor) {
    return TextTheme(
      displayLarge: TextStyle(
        fontFamily: displayFont,
        fontFamilyFallback: displayFontFallback,
        fontSize: 38,
        fontWeight: FontWeight.w700,
        height: 1.15,
        letterSpacing: -0.6,
        color: textColor,
      ),
      displayMedium: TextStyle(
        fontFamily: displayFont,
        fontFamilyFallback: displayFontFallback,
        fontSize: 30,
        fontWeight: FontWeight.w700,
        height: 1.2,
        letterSpacing: -0.4,
        color: textColor,
      ),
      displaySmall: TextStyle(
        fontFamily: displayFont,
        fontFamilyFallback: displayFontFallback,
        fontSize: 24,
        fontWeight: FontWeight.w700,
        height: 1.25,
        letterSpacing: -0.2,
        color: textColor,
      ),
      headlineLarge: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 22,
        fontWeight: FontWeight.w700,
        height: 1.3,
        color: textColor,
      ),
      headlineMedium: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 20,
        fontWeight: FontWeight.w600,
        height: 1.35,
        color: textColor,
      ),
      headlineSmall: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        height: 1.4,
        color: textColor,
      ),
      titleLarge: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 16,
        fontWeight: FontWeight.w600,
        height: 1.45,
        color: textColor,
      ),
      titleMedium: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 14,
        fontWeight: FontWeight.w600,
        height: 1.45,
        color: textColor,
      ),
      titleSmall: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 13,
        fontWeight: FontWeight.w500,
        height: 1.45,
        color: textColor,
      ),
      bodyLarge: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 15,
        fontWeight: FontWeight.w400,
        height: 1.55,
        color: textColor,
      ),
      bodyMedium: const TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 14,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: AppColors.textSecondary,
      ),
      bodySmall: const TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        height: 1.5,
        color: AppColors.textMuted,
      ),
      labelLarge: TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 14,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.2,
        color: textColor,
      ),
      labelMedium: const TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 12,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.25,
        color: AppColors.textSecondary,
      ),
      labelSmall: const TextStyle(
        fontFamily: primaryFont,
        fontFamilyFallback: primaryFontFallback,
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.4,
        color: AppColors.textMuted,
      ),
    );
  }
}
