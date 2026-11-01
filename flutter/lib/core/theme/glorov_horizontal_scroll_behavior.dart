import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Custom ScrollBehavior for horizontal components (carousels, sliders, category bars, chip rows)
///
/// Ensures:
/// 1. Horizontal scrolling accepts touch, trackpad, and Shift+Wheel gestures.
/// 2. Vertical mouse-wheel scroll (Y-scroll) is NEVER trapped or converted to horizontal scroll.
///    The page scroll flows seamlessly up and down when the cursor is over any horizontal widget.
class GlorovHorizontalScrollBehavior extends MaterialScrollBehavior {
  const GlorovHorizontalScrollBehavior();

  @override
  Set<PointerDeviceKind> get dragDevices => {
        PointerDeviceKind.touch,
        PointerDeviceKind.stylus,
        PointerDeviceKind.trackpad,
      };

  @override
  Set<LogicalKeyboardKey> get pointerAxisModifiers => {
        LogicalKeyboardKey.shiftLeft,
        LogicalKeyboardKey.shiftRight,
      };

  @override
  Widget buildScrollbar(
      BuildContext context, Widget child, ScrollableDetails details) {
    // Suppress scrollbar clutter on horizontal carousels
    return child;
  }
}
