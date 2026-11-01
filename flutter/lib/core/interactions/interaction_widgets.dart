import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../theme/app_colors.dart';
import '../theme/app_radii.dart';
import 'interaction_config.dart';

/// Reusable interactive wrappers tailored for the GLOROV botanical storefront.
/// Each component encapsulates `flutter_micro_interactions` widgets with
/// GLOROV design tokens, restrained motion, and automatic accessibility.

// -----------------------------------------------------------------------------
// 1. GlorovTapCard - Subtle Scale Tap Feedback & Soft Botanical Hover Glow
// -----------------------------------------------------------------------------
class GlorovTapCard extends StatelessWidget {
  final Widget child;
  final VoidCallback? onTap;
  final BorderRadius? borderRadius;
  final Color? glowColor;
  final bool enableHoverGlow;

  const GlorovTapCard({
    super.key,
    required this.child,
    this.onTap,
    this.borderRadius,
    this.glowColor,
    this.enableHoverGlow = true,
  });

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? AppRadii.roundedLg;

    Widget result = child;

    if (enableHoverGlow && GlorovInteractionConfig.enabled) {
      result = HoverGlow(
        borderRadius: radius,
        glowColor: glowColor ?? GlorovInteractionConfig.defaultGlowColor,
        glowRadius: GlorovInteractionConfig.glowRadius,
        spreadRadius: GlorovInteractionConfig.glowSpread,
        glowOpacity: GlorovInteractionConfig.glowOpacity,
        duration: GlorovInteractionConfig.durationFast,
        child: result,
      );
    }

    if (onTap != null) {
      result = TapFeedback(
        onTap: onTap,
        effect: TapAnimationType.scale,
        scaleDown: GlorovInteractionConfig.cardPressScale,
        duration: GlorovInteractionConfig.durationFast,
        child: result,
      );
    }

    return result;
  }
}

// -----------------------------------------------------------------------------
// 2. GlorovInteractiveButton - Tactile Tap Feedback with ButtonStates
// -----------------------------------------------------------------------------
class GlorovInteractiveButton extends StatelessWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final ButtonStateController? controller;
  final Widget? loadingChild;
  final Widget? successChild;
  final Widget? errorChild;

  const GlorovInteractiveButton({
    super.key,
    required this.child,
    this.onPressed,
    this.controller,
    this.loadingChild,
    this.successChild,
    this.errorChild,
  });

  @override
  Widget build(BuildContext context) {
    Widget content = child;

    if (controller != null) {
      content = ButtonStates(
        controller: controller!,
        loadingBuilder: (_) =>
            loadingChild ??
            const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
              ),
            ),
        successBuilder: (_) =>
            successChild ??
            const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle_outline, color: Colors.white, size: 18),
                SizedBox(width: 6),
                Text('Added!'),
              ],
            ),
        errorBuilder: (_) =>
            errorChild ??
            const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.error_outline, color: Colors.white, size: 18),
                SizedBox(width: 6),
                Text('Failed'),
              ],
            ),
        child: content,
      );
    }

    return TapFeedback(
      onTap: onPressed,
      effect: TapAnimationType.scale,
      scaleDown: GlorovInteractionConfig.buttonPressScale,
      duration: GlorovInteractionConfig.durationFast,
      child: content,
    );
  }
}

// -----------------------------------------------------------------------------
// 3. GlorovInputField - Restrained Focus Elevation for Text Inputs
// -----------------------------------------------------------------------------
class GlorovInputField extends StatelessWidget {
  final Widget child;
  final BorderRadius? borderRadius;
  final FocusNode? focusNode;

  const GlorovInputField({
    super.key,
    required this.child,
    this.borderRadius,
    this.focusNode,
  });

  @override
  Widget build(BuildContext context) {
    if (!GlorovInteractionConfig.enabled) {
      return child;
    }

    return InputFocus(
      focusNode: focusNode,
      borderRadius: borderRadius ?? AppRadii.roundedMd,
      scale: GlorovInteractionConfig.focusScale,
      elevation: GlorovInteractionConfig.focusElevation,
      shadowColor: AppColors.forestDeep.withValues(alpha: 0.12),
      duration: GlorovInteractionConfig.durationFast,
      child: child,
    );
  }
}

// -----------------------------------------------------------------------------
// 4. GlorovCounter - Animated Odometer for Prices and Numbers
// -----------------------------------------------------------------------------
class GlorovCounter extends StatelessWidget {
  final num value;
  final TextStyle? style;
  final String? prefix;
  final String? suffix;
  final CounterAnimationMode mode;
  final Duration? duration;

  const GlorovCounter({
    super.key,
    required this.value,
    this.style,
    this.prefix,
    this.suffix,
    this.mode = CounterAnimationMode.slideDigits,
    this.duration,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedCounter(
      value: value,
      mode: mode,
      style: style,
      prefix: prefix,
      suffix: suffix,
      duration: duration ?? GlorovInteractionConfig.durationNormal,
      curve: GlorovInteractionConfig.curveDecelerate,
    );
  }
}

// -----------------------------------------------------------------------------
// 5. GlorovBadge - Animated Badge for Cart Counters & Alerts
// -----------------------------------------------------------------------------
class GlorovBadge extends StatelessWidget {
  final Widget child;
  final int count;
  final Color? badgeColor;
  final Color? textColor;
  final bool showZero;

  const GlorovBadge({
    super.key,
    required this.child,
    required this.count,
    this.badgeColor,
    this.textColor,
    this.showZero = false,
  });

  @override
  Widget build(BuildContext context) {
    if (count <= 0 && !showZero) {
      return child;
    }

    return AnimatedBadge(
      count: count,
      showZero: showZero,
      badgeColor: badgeColor ?? AppColors.forestDeep, // Match GLOROV theme
      textColor: textColor ?? Colors.white,
      duration: GlorovInteractionConfig.durationNormal,
      curve: Curves.elasticOut,
      child: child,
    );
  }
}

// -----------------------------------------------------------------------------
// 6. GlorovAnimatedCheck - Draw-Path Success Checkmark
// -----------------------------------------------------------------------------
class GlorovAnimatedCheck extends StatelessWidget {
  final AnimatedCheckController? controller;
  final double size;
  final Color? color;
  final double strokeWidth;
  final bool autoPlay;

  const GlorovAnimatedCheck({
    super.key,
    this.controller,
    this.size = 48.0,
    this.color,
    this.strokeWidth = 3.5,
    this.autoPlay = true,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedCheck(
      controller: controller,
      size: size,
      color: color ?? AppColors.forestDeep,
      strokeWidth: strokeWidth,
      autoPlay: autoPlay,
      duration: GlorovInteractionConfig.durationNormal,
      type: AnimatedCheckType.check,
    );
  }
}

// -----------------------------------------------------------------------------
// 7. GlorovStaggeredItem - Graceful Entrance for Catalog Lists & Line Items
// -----------------------------------------------------------------------------
class GlorovStaggeredItem extends StatelessWidget {
  final int index;
  final Widget child;
  final StaggerEffect effect;
  final Duration? duration;

  const GlorovStaggeredItem({
    super.key,
    required this.index,
    required this.child,
    this.effect = StaggerEffect.fadeSlideUp,
    this.duration,
  });

  @override
  Widget build(BuildContext context) {
    if (!GlorovInteractionConfig.enabled) {
      return child;
    }

    return StaggeredItem(
      index: index,
      effect: effect,
      itemDuration: duration ?? GlorovInteractionConfig.durationNormal,
      curve: GlorovInteractionConfig.curveDecelerate,
      child: child,
    );
  }
}
