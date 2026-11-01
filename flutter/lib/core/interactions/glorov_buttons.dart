import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../theme/app_colors.dart';
import '../theme/app_radii.dart';
import '../theme/app_typography.dart';
import 'interaction_config.dart';

/// Button visual variant enum
enum GlorovButtonVariant {
  primary,
  secondary,
  outlined,
  destructive,
  ghost,
}

/// Button size enum
enum GlorovButtonSize {
  small,
  medium,
  large,
}

/// Unified GLOROV Botanical Button Component
///
/// Features:
/// - Tactile [TapFeedback] scaling without competing animations
/// - Preserves [onPressed] callback, disabled state, and keyboard activation
/// - Built-in [isLoading] spinner state preventing multi-click double submissions
/// - Accessible semantics and visible keyboard focus ring
/// - Strict adherence to GLOROV botanical palette & typography
class GlorovButton extends StatefulWidget {
  final VoidCallback? onPressed;
  final Widget? child;
  final String? label;
  final Widget? leadingIcon;
  final Widget? trailingIcon;
  final GlorovButtonVariant variant;
  final GlorovButtonSize size;
  final bool isLoading;
  final bool isFullWidth;
  final String? semanticLabel;
  final FocusNode? focusNode;
  final Color? customBackgroundColor;
  final Color? customForegroundColor;
  final BorderRadius? borderRadius;

  const GlorovButton({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.leadingIcon,
    this.trailingIcon,
    this.variant = GlorovButtonVariant.primary,
    this.size = GlorovButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.customBackgroundColor,
    this.customForegroundColor,
    this.borderRadius,
  }) : assert(
          child != null || label != null,
          'GlorovButton requires either child or label',
        );

  /// Primary button: Solid forest deep background with white text
  const GlorovButton.primary({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.leadingIcon,
    this.trailingIcon,
    this.size = GlorovButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.customBackgroundColor,
    this.customForegroundColor,
    this.borderRadius,
  }) : variant = GlorovButtonVariant.primary;

  /// Secondary button: Soft sage botanical tint with forest green text
  const GlorovButton.secondary({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.leadingIcon,
    this.trailingIcon,
    this.size = GlorovButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.customBackgroundColor,
    this.customForegroundColor,
    this.borderRadius,
  }) : variant = GlorovButtonVariant.secondary;

  /// Outlined button: Botanical border, transparent background, subtle hover
  const GlorovButton.outlined({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.leadingIcon,
    this.trailingIcon,
    this.size = GlorovButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.customBackgroundColor,
    this.customForegroundColor,
    this.borderRadius,
  }) : variant = GlorovButtonVariant.outlined;

  /// Destructive button: Rich burgundy / crimson for dangerous actions
  const GlorovButton.destructive({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.leadingIcon,
    this.trailingIcon,
    this.size = GlorovButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.customBackgroundColor,
    this.customForegroundColor,
    this.borderRadius,
  }) : variant = GlorovButtonVariant.destructive;

  /// Ghost button: Clean transparent text button
  const GlorovButton.ghost({
    super.key,
    required this.onPressed,
    this.child,
    this.label,
    this.leadingIcon,
    this.trailingIcon,
    this.size = GlorovButtonSize.medium,
    this.isLoading = false,
    this.isFullWidth = false,
    this.semanticLabel,
    this.focusNode,
    this.customBackgroundColor,
    this.customForegroundColor,
    this.borderRadius,
  }) : variant = GlorovButtonVariant.ghost;

  @override
  State<GlorovButton> createState() => _GlorovButtonState();
}

class _GlorovButtonState extends State<GlorovButton> {
  bool _isHovered = false;
  bool _isFocused = false;

  bool get _isEnabled => widget.onPressed != null && !widget.isLoading;

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = widget.borderRadius ?? _defaultRadius;

    // Determine colors
    final Color bgColor = _getBackgroundColor();
    final Color fgColor = _getForegroundColor();
    final Border? border = _getBorder();

    final padding = _getPadding();
    final height = _getHeight();
    final fontSize = _getFontSize();

    // Content
    Widget content;
    if (widget.isLoading) {
      content = SizedBox(
        width: fontSize + 4,
        height: fontSize + 4,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(fgColor),
        ),
      );
    } else {
      final textWidget = widget.child ??
          Text(
            widget.label!,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
              color: fgColor,
            ),
          );

      if (widget.leadingIcon != null || widget.trailingIcon != null) {
        content = Row(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            if (widget.leadingIcon != null) ...[
              IconTheme(
                data: IconThemeData(color: fgColor, size: fontSize + 2),
                child: widget.leadingIcon!,
              ),
              const SizedBox(width: 6),
            ],
            textWidget,
            if (widget.trailingIcon != null) ...[
              const SizedBox(width: 6),
              IconTheme(
                data: IconThemeData(color: fgColor, size: fontSize + 2),
                child: widget.trailingIcon!,
              ),
            ],
          ],
        );
      } else {
        content = textWidget;
      }
    }

    Widget buttonBody = AnimatedContainer(
      duration: GlorovInteractionConfig.durationFast,
      height: height,
      padding: padding,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: effectiveRadius,
        border: border,
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: AppColors.forestDeep.withValues(alpha: 0.35),
                  blurRadius: 0,
                  spreadRadius: 2.5,
                ),
              ]
            : null,
      ),
      child: content,
    );

    if (widget.isFullWidth) {
      buttonBody = SizedBox(
        width: double.infinity,
        child: buttonBody,
      );
    }

    // Wrap in FocusableActionDetector for keyboard navigation & hover
    Widget interactiveWidget = FocusableActionDetector(
      focusNode: widget.focusNode,
      enabled: _isEnabled,
      onShowFocusHighlight: (v) => setState(() => _isFocused = v),
      onShowHoverHighlight: (v) => setState(() => _isHovered = v),
      mouseCursor:
          _isEnabled ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) {
            if (_isEnabled) widget.onPressed?.call();
            return null;
          },
        ),
      },
      child: buttonBody,
    );

    // Outer TapFeedback for tactile scale press
    return Semantics(
      button: true,
      enabled: _isEnabled,
      label: widget.semanticLabel ?? widget.label,
      child: TapFeedback(
        onTap: _isEnabled ? widget.onPressed : null,
        effect: TapAnimationType.scale,
        scaleDown: GlorovInteractionConfig.buttonPressScale,
        duration: GlorovInteractionConfig.durationFast,
        enabled: _isEnabled,
        child: interactiveWidget,
      ),
    );
  }

  BorderRadius get _defaultRadius {
    switch (widget.size) {
      case GlorovButtonSize.small:
        return AppRadii.roundedMd;
      case GlorovButtonSize.medium:
        return AppRadii.roundedLg;
      case GlorovButtonSize.large:
        return AppRadii.roundedXl;
    }
  }

  double _getHeight() {
    switch (widget.size) {
      case GlorovButtonSize.small:
        return 34.0;
      case GlorovButtonSize.medium:
        return 44.0;
      case GlorovButtonSize.large:
        return 52.0;
    }
  }

  double _getFontSize() {
    switch (widget.size) {
      case GlorovButtonSize.small:
        return 12.5;
      case GlorovButtonSize.medium:
        return 14.0;
      case GlorovButtonSize.large:
        return 16.0;
    }
  }

  EdgeInsets _getPadding() {
    switch (widget.size) {
      case GlorovButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
      case GlorovButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 18, vertical: 10);
      case GlorovButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 14);
    }
  }

  Color _getBackgroundColor() {
    if (widget.customBackgroundColor != null) {
      return !_isEnabled
          ? widget.customBackgroundColor!.withValues(alpha: 0.5)
          : widget.customBackgroundColor!;
    }

    if (!_isEnabled) {
      return const Color(0xFFE2E8F0);
    }

    switch (widget.variant) {
      case GlorovButtonVariant.primary:
        return _isHovered ? const Color(0xFF163219) : AppColors.forestDeep;
      case GlorovButtonVariant.secondary:
        return _isHovered ? const Color(0xFFD6E3D8) : const Color(0xFFE8EFE9);
      case GlorovButtonVariant.outlined:
      case GlorovButtonVariant.ghost:
        return _isHovered ? AppColors.mintSurface : Colors.transparent;
      case GlorovButtonVariant.destructive:
        return _isHovered ? const Color(0xFF6B0E25) : const Color(0xFF85102F);
    }
  }

  Color _getForegroundColor() {
    if (widget.customForegroundColor != null) {
      return !_isEnabled
          ? widget.customForegroundColor!.withValues(alpha: 0.5)
          : widget.customForegroundColor!;
    }

    if (!_isEnabled) {
      return const Color(0xFF94A3B8);
    }

    switch (widget.variant) {
      case GlorovButtonVariant.primary:
      case GlorovButtonVariant.destructive:
        return Colors.white;
      case GlorovButtonVariant.secondary:
        return AppColors.forestDeep;
      case GlorovButtonVariant.outlined:
        return AppColors.forestDeep;
      case GlorovButtonVariant.ghost:
        return AppColors.forestDeep;
    }
  }

  Border? _getBorder() {
    if (widget.variant == GlorovButtonVariant.outlined) {
      final borderColor = !_isEnabled
          ? const Color(0xFFCBD5E1)
          : (_isHovered ? AppColors.forestDeep : const Color(0xFF52796F));
      return Border.all(color: borderColor, width: 1.5);
    }
    return null;
  }
}

// -----------------------------------------------------------------------------
// GlorovIconButton - Accessible, Tactile Icon Button
// -----------------------------------------------------------------------------
class GlorovIconButton extends StatefulWidget {
  final Widget icon;
  final VoidCallback? onPressed;
  final String? tooltip;
  final double size;
  final Color? backgroundColor;
  final Color? iconColor;
  final Color? hoverColor;
  final bool isCircle;
  final FocusNode? focusNode;

  const GlorovIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
    this.tooltip,
    this.size = 40.0,
    this.backgroundColor,
    this.iconColor,
    this.hoverColor,
    this.isCircle = true,
    this.focusNode,
  });

  @override
  State<GlorovIconButton> createState() => _GlorovIconButtonState();
}

class _GlorovIconButtonState extends State<GlorovIconButton> {
  bool _isHovered = false;
  bool _isFocused = false;

  bool get _isEnabled => widget.onPressed != null;

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = widget.isCircle
        ? BorderRadius.circular(widget.size / 2)
        : AppRadii.roundedMd;

    final bg = widget.backgroundColor ??
        (_isHovered
            ? (widget.hoverColor ?? AppColors.mintSurface)
            : Colors.transparent);

    final fg = widget.iconColor ??
        (!_isEnabled ? const Color(0xFF94A3B8) : AppColors.forestDeep);

    Widget button = FocusableActionDetector(
      focusNode: widget.focusNode,
      enabled: _isEnabled,
      onShowFocusHighlight: (v) => setState(() => _isFocused = v),
      onShowHoverHighlight: (v) => setState(() => _isHovered = v),
      mouseCursor:
          _isEnabled ? SystemMouseCursors.click : SystemMouseCursors.forbidden,
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) {
            if (_isEnabled) widget.onPressed?.call();
            return null;
          },
        ),
      },
      child: AnimatedContainer(
        duration: GlorovInteractionConfig.durationFast,
        width: widget.size,
        height: widget.size,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: effectiveRadius,
          border: _isFocused
              ? Border.all(color: AppColors.forestDeep, width: 2)
              : null,
        ),
        child: IconTheme(
          data: IconThemeData(color: fg, size: widget.size * 0.52),
          child: widget.icon,
        ),
      ),
    );

    if (widget.tooltip != null) {
      button = Tooltip(message: widget.tooltip!, child: button);
    }

    return Semantics(
      button: true,
      enabled: _isEnabled,
      label: widget.tooltip,
      child: TapFeedback(
        onTap: _isEnabled ? widget.onPressed : null,
        effect: TapAnimationType.scale,
        scaleDown: GlorovInteractionConfig.buttonPressScale,
        duration: GlorovInteractionConfig.durationFast,
        enabled: _isEnabled,
        child: button,
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// GlorovToolbarButton - Compact Action Pill for Topbars & Header Menus
// -----------------------------------------------------------------------------
class GlorovToolbarButton extends StatefulWidget {
  final Widget? icon;
  final String label;
  final VoidCallback? onPressed;
  final bool isActive;
  final FocusNode? focusNode;

  const GlorovToolbarButton({
    super.key,
    this.icon,
    required this.label,
    required this.onPressed,
    this.isActive = false,
    this.focusNode,
  });

  @override
  State<GlorovToolbarButton> createState() => _GlorovToolbarButtonState();
}

class _GlorovToolbarButtonState extends State<GlorovToolbarButton> {
  bool _isHovered = false;
  bool _isFocused = false;

  @override
  Widget build(BuildContext context) {
    final fg = widget.isActive
        ? AppColors.forestDeep
        : (_isHovered ? AppColors.forestDeep : const Color(0xFF334155));

    final bg = widget.isActive
        ? const Color(0xFFD6E3D8)
        : (_isHovered ? const Color(0xFFE8EFE9) : Colors.transparent);

    return FocusableActionDetector(
      focusNode: widget.focusNode,
      enabled: widget.onPressed != null,
      onShowFocusHighlight: (v) => setState(() => _isFocused = v),
      onShowHoverHighlight: (v) => setState(() => _isHovered = v),
      mouseCursor: SystemMouseCursors.click,
      actions: {
        ActivateIntent: CallbackAction<ActivateIntent>(
          onInvoke: (_) {
            widget.onPressed?.call();
            return null;
          },
        ),
      },
      child: Semantics(
        button: true,
        label: widget.label,
        child: TapFeedback(
          onTap: widget.onPressed,
          effect: TapAnimationType.scale,
          scaleDown: 0.96,
          duration: GlorovInteractionConfig.durationFast,
          child: AnimatedContainer(
            duration: GlorovInteractionConfig.durationFast,
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: bg,
              borderRadius: BorderRadius.circular(20),
              border: _isFocused
                  ? Border.all(color: AppColors.forestDeep, width: 1.5)
                  : null,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.icon != null) ...[
                  IconTheme(
                    data: IconThemeData(color: fg, size: 16),
                    child: widget.icon!,
                  ),
                  const SizedBox(width: 5),
                ],
                Text(
                  widget.label,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    fontWeight:
                        widget.isActive ? FontWeight.w700 : FontWeight.w600,
                    color: fg,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// GlorovShakeButton - Error Feedback Shaking on Invalid Form Submission
// -----------------------------------------------------------------------------
class GlorovShakeButton extends StatelessWidget {
  final bool isValid;
  final VoidCallback? onPressed;
  final VoidCallback? onInvalidPress;
  final Widget Function(BuildContext context, VoidCallback handlePressed)
      builder;
  final double intensity;
  final Duration duration;

  const GlorovShakeButton({
    super.key,
    required this.builder,
    this.onPressed,
    this.onInvalidPress,
    this.isValid = true,
    this.intensity = 8.0,
    this.duration = const Duration(milliseconds: 350),
  });

  @override
  Widget build(BuildContext context) {
    return ShakeButton(
      isValid: isValid,
      onPressed: onPressed,
      onInvalidPress: onInvalidPress,
      intensity: intensity,
      duration: duration,
      builder: builder,
    );
  }
}
