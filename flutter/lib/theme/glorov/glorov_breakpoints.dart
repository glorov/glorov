import 'package:flutter/material.dart';

/// GLOROV Responsive Breakpoints & Viewport Rules
class GlorovBreakpoints {
  GlorovBreakpoints._();

  static const double mobileMax = 640.0;
  static const double tabletMin = 641.0;
  static const double tabletMax = 1024.0;
  static const double desktopMin = 1025.0;

  /// Maximum content constraint for desktop web canvas
  static const double maxContentWidth = 1280.0;

  /// Breakpoint queries
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width <= mobileMax;

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= tabletMin && width <= tabletMax;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktopMin;

  /// Responsive column count for product grids
  static int getGridColumnCount(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width > 1150) return 4;
    if (width >= 640) return 3;
    return 2;
  }
}
