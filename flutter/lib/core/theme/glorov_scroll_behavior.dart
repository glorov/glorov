import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

/// GLOROV Custom Scroll Behavior
///
/// Provides:
/// 1. Thin, elegant botanical scrollbar slider for vertical scroll views.
/// 2. Drag support across mouse, touch, trackpad, and stylus.
/// 3. Suppresses horizontal scrollbars on carousels to prevent clutter.
/// 4. Seamless mouse wheel and trackpad coordination.
class GlorovScrollBehavior extends MaterialScrollBehavior {
  const GlorovScrollBehavior();

  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.mouse,
        PointerDeviceKind.trackpad,
        PointerDeviceKind.stylus,
      };

  @override
  Widget buildScrollbar(
    BuildContext context,
    Widget child,
    ScrollableDetails details,
  ) {
    // Only vertical scroll views receive scrollbars; horizontal carousels stay clean
    if (axisDirectionToAxis(details.direction) == Axis.vertical) {
      return Scrollbar(
        controller: details.controller,
        child: child,
      );
    }
    return child;
  }
}
