import 'package:flutter/material.dart';

/// GLOROV Core Design System - Breakpoint & Responsive Rules
class AppBreakpoints {
  AppBreakpoints._();

  static const double mobileMax = 640.0;
  static const double tabletMin = 641.0;
  static const double tabletMax = 1023.0;
  static const double desktopMin = 1024.0;

  /// Maximum container width on desktop web viewports
  static const double maxContentWidth = 1280.0;

  // ---------------------------------------------------------------------------
  // Product Details Screen Breakpoints (Specification Section 2)
  // ---------------------------------------------------------------------------
  static const double productMobileMax = 767.0;
  static const double productTabletPortraitMin = 768.0;
  static const double productTabletPortraitMax = 899.0;
  static const double productTabletLandscapeMin = 900.0;
  static const double productTabletLandscapeMax = 1199.0;
  static const double productDesktopMin = 1200.0;
  static const double productLargeDesktopMin = 1600.0;
  static const double maxLargeDesktopContentWidth = 1560.0;

  static bool isProductMobile(double width) => width <= productMobileMax;
  static bool isProductTabletPortrait(double width) =>
      width >= productTabletPortraitMin && width <= productTabletPortraitMax;
  static bool isProductTabletLandscape(double width) =>
      width >= productTabletLandscapeMin && width <= productTabletLandscapeMax;
  static bool isProductDesktop(double width) =>
      width >= productDesktopMin && width < productLargeDesktopMin;
  static bool isProductLargeDesktop(double width) =>
      width >= productLargeDesktopMin;

  /// Whether the product gallery should stick to the left side
  static bool isProductStickyLayout(double width) =>
      width >= productTabletLandscapeMin;

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width <= mobileMax;

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= tabletMin && width <= tabletMax;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktopMin;

  static int getGridColumnCount(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width > 1150) return 4;
    if (width >= 640) return 3;
    return 2;
  }
}
