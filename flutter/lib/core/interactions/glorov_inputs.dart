import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../theme/app_colors.dart';
import '../theme/app_radii.dart';
import '../theme/app_typography.dart';
import 'interaction_config.dart';

/// Unified GLOROV Form Input Field with Accessible Botanical Focus Feedback
///
/// Features:
/// - Integrated [InputFocus] elevation and soft halo without layout jump
/// - Preserves [TextEditingController], [FocusNode], validation logic, form saving
/// - Maintains standard Flutter focus traversal (Tab / Shift+Tab)
/// - Botanical aesthetic: calm sage/forest focus border, warm slate typography
class GlorovTextField extends StatefulWidget {
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String? label;
  final String? hintText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onFieldSubmitted;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final bool obscureText;
  final int maxLines;
  final bool enabled;
  final bool autofocus;
  final BorderRadius? borderRadius;
  final EdgeInsetsGeometry? contentPadding;
  final Color? fillColor;
  final bool enableFocusElevation;

  const GlorovTextField({
    super.key,
    this.controller,
    this.focusNode,
    this.label,
    this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.validator,
    this.onChanged,
    this.onFieldSubmitted,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.maxLines = 1,
    this.enabled = true,
    this.autofocus = false,
    this.borderRadius,
    this.contentPadding,
    this.fillColor,
    this.enableFocusElevation = true,
  });

  @override
  State<GlorovTextField> createState() => _GlorovTextFieldState();
}

class _GlorovTextFieldState extends State<GlorovTextField> {
  late FocusNode _effectiveFocusNode;
  bool _ownsFocusNode = false;
  bool _hasFocus = false;

  @override
  void initState() {
    super.initState();
    if (widget.focusNode != null) {
      _effectiveFocusNode = widget.focusNode!;
    } else {
      _effectiveFocusNode = FocusNode();
      _ownsFocusNode = true;
    }
    _effectiveFocusNode.addListener(_handleFocusChange);
  }

  @override
  void didUpdateWidget(GlorovTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.focusNode != oldWidget.focusNode) {
      if (_ownsFocusNode) {
        _effectiveFocusNode.removeListener(_handleFocusChange);
        _effectiveFocusNode.dispose();
        _ownsFocusNode = false;
      }
      if (widget.focusNode != null) {
        _effectiveFocusNode = widget.focusNode!;
      } else {
        _effectiveFocusNode = FocusNode();
        _ownsFocusNode = true;
      }
      _effectiveFocusNode.addListener(_handleFocusChange);
    }
  }

  @override
  void dispose() {
    _effectiveFocusNode.removeListener(_handleFocusChange);
    if (_ownsFocusNode) {
      _effectiveFocusNode.dispose();
    }
    super.dispose();
  }

  void _handleFocusChange() {
    if (mounted && _hasFocus != _effectiveFocusNode.hasFocus) {
      setState(() {
        _hasFocus = _effectiveFocusNode.hasFocus;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final effectiveRadius = widget.borderRadius ?? AppRadii.roundedMd;
    final padding = widget.contentPadding ??
        const EdgeInsets.symmetric(horizontal: 16, vertical: 14);

    final inputDecoration = InputDecoration(
      labelText: widget.label,
      hintText: widget.hintText,
      prefixIcon: widget.prefixIcon != null
          ? Padding(
              padding: const EdgeInsets.only(left: 12, right: 8),
              child: widget.prefixIcon,
            )
          : null,
      prefixIconConstraints: const BoxConstraints(minWidth: 40, minHeight: 40),
      suffixIcon: widget.suffixIcon != null
          ? Padding(
              padding: const EdgeInsets.only(right: 12),
              child: widget.suffixIcon,
            )
          : null,
      suffixIconConstraints: const BoxConstraints(minWidth: 40, minHeight: 40),
      filled: true,
      fillColor: widget.fillColor ??
          (widget.enabled
              ? (_hasFocus ? Colors.white : const Color(0xFFF8FAF7))
              : const Color(0xFFF1F5F9)),
      contentPadding: padding,
      hintStyle: const TextStyle(
        fontFamily: AppTypography.primaryFont,
        color: Color(0xFF94A3B8),
        fontSize: 14,
      ),
      labelStyle: TextStyle(
        fontFamily: AppTypography.primaryFont,
        color: _hasFocus ? AppColors.forestDeep : const Color(0xFF64748B),
        fontSize: 14,
      ),
      border: OutlineInputBorder(
        borderRadius: effectiveRadius,
        borderSide: const BorderSide(color: Color(0xFFD6DEC9), width: 1.0),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: effectiveRadius,
        borderSide: const BorderSide(color: Color(0xFFD6DEC9), width: 1.0),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: effectiveRadius,
        borderSide: const BorderSide(color: AppColors.forestDeep, width: 1.8),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: effectiveRadius,
        borderSide: const BorderSide(color: AppColors.error, width: 1.2),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: effectiveRadius,
        borderSide: const BorderSide(color: AppColors.error, width: 1.8),
      ),
    );

    final field = TextFormField(
      controller: widget.controller,
      focusNode: _effectiveFocusNode,
      validator: widget.validator,
      onChanged: widget.onChanged,
      onFieldSubmitted: widget.onFieldSubmitted,
      keyboardType: widget.keyboardType,
      textInputAction: widget.textInputAction,
      obscureText: widget.obscureText,
      maxLines: widget.maxLines,
      enabled: widget.enabled,
      autofocus: widget.autofocus,
      style: const TextStyle(
        fontFamily: AppTypography.primaryFont,
        color: Color(0xFF1E293B),
        fontSize: 14,
      ),
      decoration: inputDecoration,
    );

    if (!widget.enableFocusElevation || !GlorovInteractionConfig.enabled) {
      return field;
    }

    return InputFocus(
      borderRadius: effectiveRadius,
      scale: GlorovInteractionConfig.focusScale,
      elevation: GlorovInteractionConfig.focusElevation,
      shadowColor: AppColors.forestDeep.withValues(alpha: 0.15),
      duration: GlorovInteractionConfig.durationFast,
      child: field,
    );
  }
}
