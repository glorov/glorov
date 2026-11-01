import 'package:flutter/material.dart';
import 'glorov_colors.dart';
import 'glorov_radii.dart';
import 'glorov_spacing.dart';
import 'glorov_typography.dart';

/// Centralized GLOROV Theme Extension for custom brand tokens
@immutable
class GlorovThemeTokens extends ThemeExtension<GlorovThemeTokens> {
  final Color forestDeep;
  final Color sage;
  final Color mintBadge;
  final Color earthGold;
  final Color surfaceCream;
  final Color borderSubtle;

  const GlorovThemeTokens({
    required this.forestDeep,
    required this.sage,
    required this.mintBadge,
    required this.earthGold,
    required this.surfaceCream,
    required this.borderSubtle,
  });

  @override
  GlorovThemeTokens copyWith({
    Color? forestDeep,
    Color? sage,
    Color? mintBadge,
    Color? earthGold,
    Color? surfaceCream,
    Color? borderSubtle,
  }) {
    return GlorovThemeTokens(
      forestDeep: forestDeep ?? this.forestDeep,
      sage: sage ?? this.sage,
      mintBadge: mintBadge ?? this.mintBadge,
      earthGold: earthGold ?? this.earthGold,
      surfaceCream: surfaceCream ?? this.surfaceCream,
      borderSubtle: borderSubtle ?? this.borderSubtle,
    );
  }

  @override
  GlorovThemeTokens lerp(ThemeExtension<GlorovThemeTokens>? other, double t) {
    if (other is! GlorovThemeTokens) return this;
    return GlorovThemeTokens(
      forestDeep: Color.lerp(forestDeep, other.forestDeep, t)!,
      sage: Color.lerp(sage, other.sage, t)!,
      mintBadge: Color.lerp(mintBadge, other.mintBadge, t)!,
      earthGold: Color.lerp(earthGold, other.earthGold, t)!,
      surfaceCream: Color.lerp(surfaceCream, other.surfaceCream, t)!,
      borderSubtle: Color.lerp(borderSubtle, other.borderSubtle, t)!,
    );
  }
}

/// Centralized GLOROV Theme Definition
class GlorovTheme {
  GlorovTheme._();

  static const GlorovThemeTokens tokens = GlorovThemeTokens(
    forestDeep: GlorovColors.forestDeep,
    sage: GlorovColors.sage,
    mintBadge: GlorovColors.mintBadge,
    earthGold: GlorovColors.earthGold,
    surfaceCream: GlorovColors.surfaceCream,
    borderSubtle: GlorovColors.borderSubtle,
  );

  static ThemeData lightTheme(BuildContext context) {
    final colorScheme = ColorScheme.fromSwatch(
      primarySwatch: GlorovColors.primarySwatch,
      backgroundColor: GlorovColors.surfaceCream,
      errorColor: GlorovColors.error,
      brightness: Brightness.light,
    ).copyWith(
      primary: GlorovColors.forestDeep,
      onPrimary: GlorovColors.textOnPrimary,
      secondary: GlorovColors.sage,
      onSecondary: Colors.white,
      surface: GlorovColors.surfacePure,
      onSurface: GlorovColors.textPrimary,
      outline: GlorovColors.borderSubtle,
    );

    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: GlorovColors.forestDeep,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: GlorovColors.surfaceCream,
      fontFamily: GlorovTypography.primaryFont,
      textTheme: GlorovTypography.textTheme(GlorovColors.textPrimary),
      appBarTheme: const AppBarTheme(
        backgroundColor: GlorovColors.surfacePure,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        centerTitle: false,
        iconTheme: IconThemeData(color: GlorovColors.textPrimary),
        titleTextStyle: TextStyle(
          fontFamily: GlorovTypography.primaryFont,
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: GlorovColors.textPrimary,
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: GlorovColors.forestDeep,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(
            horizontal: GlorovSpacing.lg,
            vertical: GlorovSpacing.md,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: GlorovRadii.roundedMd,
          ),
          textStyle: const TextStyle(
            fontFamily: GlorovTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          elevation: 0,
          foregroundColor: GlorovColors.forestDeep,
          side: const BorderSide(color: GlorovColors.borderMedium, width: 1.2),
          padding: const EdgeInsets.symmetric(
            horizontal: GlorovSpacing.md,
            vertical: GlorovSpacing.sm,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: GlorovRadii.roundedMd,
          ),
          textStyle: const TextStyle(
            fontFamily: GlorovTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: GlorovColors.forestDeep,
          padding: const EdgeInsets.symmetric(horizontal: GlorovSpacing.sm),
          textStyle: const TextStyle(
            fontFamily: GlorovTypography.primaryFont,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: GlorovColors.surfacePure,
        contentPadding: EdgeInsets.symmetric(
          horizontal: GlorovSpacing.md,
          vertical: GlorovSpacing.sm + 2,
        ),
        hintStyle: TextStyle(
          color: GlorovColors.textMuted,
          fontSize: 14,
        ),
        border: OutlineInputBorder(
          borderRadius: GlorovRadii.roundedMd,
          borderSide: BorderSide(color: GlorovColors.borderSubtle),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: GlorovRadii.roundedMd,
          borderSide: BorderSide(color: GlorovColors.borderSubtle),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: GlorovRadii.roundedMd,
          borderSide: BorderSide(color: GlorovColors.forestDeep, width: 1.5),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: GlorovRadii.roundedMd,
          borderSide: BorderSide(color: GlorovColors.error),
        ),
      ),
      cardTheme: const CardThemeData(
        color: GlorovColors.surfacePure,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: GlorovRadii.roundedMd,
          side: BorderSide(color: GlorovColors.borderSubtle, width: 1),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: GlorovColors.borderSubtle,
        thickness: 1,
        space: 1,
      ),
      extensions: const <ThemeExtension<dynamic>>[
        tokens,
      ],
    );
  }
}
