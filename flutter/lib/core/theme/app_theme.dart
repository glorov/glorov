import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_radii.dart';
import 'app_shadows.dart';
import 'app_spacing.dart';
import 'app_typography.dart';

/// GLOROV Custom Theme Tokens Extension
@immutable
class AppThemeTokens extends ThemeExtension<AppThemeTokens> {
  final Color forestDeep;
  final Color sage;
  final Color mintBadge;
  final Color earthGold;
  final Color surfaceCream;
  final Color borderSubtle;
  final List<BoxShadow> cardShadow;

  const AppThemeTokens({
    required this.forestDeep,
    required this.sage,
    required this.mintBadge,
    required this.earthGold,
    required this.surfaceCream,
    required this.borderSubtle,
    required this.cardShadow,
  });

  @override
  AppThemeTokens copyWith({
    Color? forestDeep,
    Color? sage,
    Color? mintBadge,
    Color? earthGold,
    Color? surfaceCream,
    Color? borderSubtle,
    List<BoxShadow>? cardShadow,
  }) {
    return AppThemeTokens(
      forestDeep: forestDeep ?? this.forestDeep,
      sage: sage ?? this.sage,
      mintBadge: mintBadge ?? this.mintBadge,
      earthGold: earthGold ?? this.earthGold,
      surfaceCream: surfaceCream ?? this.surfaceCream,
      borderSubtle: borderSubtle ?? this.borderSubtle,
      cardShadow: cardShadow ?? this.cardShadow,
    );
  }

  @override
  AppThemeTokens lerp(ThemeExtension<AppThemeTokens>? other, double t) {
    if (other is! AppThemeTokens) return this;
    return AppThemeTokens(
      forestDeep: Color.lerp(forestDeep, other.forestDeep, t)!,
      sage: Color.lerp(sage, other.sage, t)!,
      mintBadge: Color.lerp(mintBadge, other.mintBadge, t)!,
      earthGold: Color.lerp(earthGold, other.earthGold, t)!,
      surfaceCream: Color.lerp(surfaceCream, other.surfaceCream, t)!,
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t)!,
      cardShadow: cardShadow,
    );
  }
}

/// GLOROV Unified Theme Definition
class AppTheme {
  AppTheme._();

  static const AppThemeTokens tokens = AppThemeTokens(
    forestDeep: AppColors.forestDeep,
    sage: AppColors.sage,
    mintBadge: AppColors.mintBadge,
    earthGold: AppColors.earthGold,
    surfaceCream: AppColors.surfaceCream,
    borderSubtle: AppColors.borderSubtle,
    cardShadow: AppShadows.card,
  );

  static ThemeData lightTheme(BuildContext context) {
    final colorScheme = ColorScheme.fromSwatch(
      primarySwatch: AppColors.primarySwatch,
      backgroundColor: AppColors.surfaceCream,
      errorColor: AppColors.error,
      brightness: Brightness.light,
    ).copyWith(
      primary: AppColors.forestDeep,
      onPrimary: AppColors.textOnPrimary,
      secondary: AppColors.sage,
      onSecondary: Colors.white,
      surface: AppColors.surfacePure,
      onSurface: AppColors.textPrimary,
      outline: AppColors.borderSubtle,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.forestDeep,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: AppColors.surfaceCream,
      fontFamily: AppTypography.primaryFont,
      textTheme: AppTypography.textTheme(AppColors.textPrimary),
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.surfacePure,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        iconTheme: IconThemeData(color: AppColors.textPrimary),
        titleTextStyle: TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: AppColors.forestDeep,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadii.roundedMd,
          ),
          textStyle: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          foregroundColor: AppColors.forestDeep,
          side: const BorderSide(color: AppColors.borderMedium, width: 1.2),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: AppRadii.roundedMd,
          ),
          textStyle: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: AppColors.forestDeep,
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.sm),
          textStyle: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: AppColors.surfacePure,
        contentPadding: EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.sm + 2,
        ),
        hintStyle: TextStyle(
          color: AppColors.textMuted,
          fontSize: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: AppRadii.roundedMd,
          borderSide: BorderSide(color: AppColors.borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: AppRadii.roundedMd,
          borderSide: BorderSide(color: AppColors.borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: AppRadii.roundedMd,
          borderSide: BorderSide(color: AppColors.forestDeep, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: AppRadii.roundedMd,
          borderSide: BorderSide(color: AppColors.error),
        ),
      ),
      cardTheme: const CardThemeData(
        color: AppColors.surfacePure,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadii.roundedMd,
          side: BorderSide(color: AppColors.borderSubtle, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: AppColors.borderSubtle,
        thickness: 1,
        space: 1,
      ),
      extensions: const <ThemeExtension<dynamic>>[
        tokens,
      ],
    );
  }
}
