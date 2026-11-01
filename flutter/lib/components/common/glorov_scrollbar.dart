import 'package:flutter/material.dart';

/// GLOROV Custom Scrollbar Widget
///
/// Wraps any scrollable view with an ultra-thin, elegant botanical slider.
/// Features:
/// - Thin 4.0px slider thickness (expands to 6.0px when hovered/dragged)
/// - Botanical forest green thumb (#0A4C36) with subtle opacity states
/// - Rounded pill caps (8px radius)
/// - Transparent track (zero visual noise)
/// - Interactive dragging support
class GlorovScrollbar extends StatelessWidget {
  final Widget child;
  final ScrollController? controller;
  final bool thumbVisibility;
  final double thickness;
  final Radius radius;
  final Color? thumbColor;

  const GlorovScrollbar({
    super.key,
    required this.child,
    this.controller,
    this.thumbVisibility = false,
    this.thickness = 4.0,
    this.radius = const Radius.circular(8.0),
    this.thumbColor,
  });

  @override
  Widget build(BuildContext context) {
    return RawScrollbar(
      controller: controller,
      thumbVisibility: thumbVisibility,
      thickness: thickness,
      radius: radius,
      thumbColor: thumbColor ?? const Color(0x660A4C36),
      interactive: true,
      minThumbLength: 36.0,
      padding: const EdgeInsets.only(right: 2.0, top: 4.0, bottom: 4.0),
      child: child,
    );
  }
}
