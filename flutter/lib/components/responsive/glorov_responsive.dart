import 'package:flutter/material.dart';
import '../../theme/glorov/glorov_breakpoints.dart';
import '../../theme/glorov/glorov_spacing.dart';

/// Reusable Responsive Layout Builder for GLOROV Web
class GlorovResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget desktop;

  const GlorovResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    required this.desktop,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= GlorovBreakpoints.desktopMin) {
          return desktop;
        } else if (constraints.maxWidth >= GlorovBreakpoints.tabletMin) {
          return tablet ?? desktop;
        } else {
          return mobile;
        }
      },
    );
  }
}

/// Reusable Content Container that enforces desktop max-width constraints
class GlorovContainer extends StatelessWidget {
  final Widget child;
  final double maxWidth;
  final EdgeInsetsGeometry padding;

  const GlorovContainer({
    super.key,
    required this.child,
    this.maxWidth = GlorovBreakpoints.maxContentWidth,
    this.padding = GlorovSpacing.horizontalMd,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
