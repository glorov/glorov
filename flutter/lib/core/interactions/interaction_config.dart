import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../theme/app_colors.dart';
import '../theme/app_motion.dart';

/// Centralized configuration and motion principles for GLOROV Micro-Interactions.
/// Ensures restrained, premium animations appropriate for a botanical storefront:
/// - Subtle scale transitions (0.97 - 1.02)
/// - Soft atmospheric glows rather than harsh neon bursts
/// - Built-in OS and browser reduced-motion accessibility
/// - Fast response times that never hinder the shopping experience
class GlorovInteractionConfig {
  GlorovInteractionConfig._();

  /// Global master switch for micro-interactions
  static bool enabled = true;

  // ---------------------------------------------------------------------------
  // Motion Presets (aligned with AppMotion)
  // ---------------------------------------------------------------------------
  static const Duration durationFast = AppMotion.durationFast; // 150ms
  static const Duration durationNormal = AppMotion.durationNormal; // 250ms
  static const Duration durationSlow = AppMotion.durationSlow; // 400ms

  static const Curve curveStandard = AppMotion.curveStandard; // easeInOut
  static const Curve curveDecelerate =
      AppMotion.curveDecelerate; // easeOutCubic
  static const Curve curveAccelerate = AppMotion.curveAccelerate; // easeInCubic
  static const Curve curveSpring = Curves.easeOutBack;

  // ---------------------------------------------------------------------------
  // Restrained Scale & Glow Tokens
  // ---------------------------------------------------------------------------
  /// Subtle press scale for interactive cards and controls (restrained, non-jarring)
  static const double cardPressScale = 0.98;

  /// Subtle press scale for buttons
  static const double buttonPressScale = 0.96;

  /// Gentle hover scale for desktop pointer feedback
  static const double hoverScale = 1.02;

  /// Soft atmospheric glow settings for cards on hover
  static const double glowRadius = 10.0;
  static const double glowSpread = 2.0;
  static const double glowOpacity = 0.22;
  static const Color defaultGlowColor = AppColors.sage;

  /// Focused input field elevation
  static const double focusElevation = 2.0;
  static const double focusScale = 1.01;

  // ---------------------------------------------------------------------------
  // Accessibility & Reduced Motion
  // ---------------------------------------------------------------------------
  /// Evaluates whether animations should run or resolve instantly based on:
  /// 1. Global config switch [enabled]
  /// 2. User OS / browser accessibility setting (reduced motion)
  static bool shouldReduceMotion(BuildContext context) {
    if (!enabled) return true;
    return MicroMotion.isReduced(context);
  }

  /// Returns [duration] when animations are allowed, or [Duration.zero]
  /// when reduced motion is requested.
  static Duration effectiveDuration(BuildContext context, Duration duration) {
    return shouldReduceMotion(context) ? Duration.zero : duration;
  }
}
