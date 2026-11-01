import 'package:flutter/material.dart';

/// GLOROV Core Design System - Shadows & Elevation Tokens
class AppShadows {
  AppShadows._();

  /// Subtle elevation for product cards and surface elements
  static const List<BoxShadow> card = [
    BoxShadow(
      color: Color(0x0A000000),
      offset: Offset(0, 2),
      blurRadius: 8,
      spreadRadius: 0,
    ),
  ];

  /// Elevated shadow for hover states and active cards
  static const List<BoxShadow> cardHover = [
    BoxShadow(
      color: Color(0x14000000),
      offset: Offset(0, 8),
      blurRadius: 20,
      spreadRadius: 0,
    ),
  ];

  /// Elevation for sticky site header
  static const List<BoxShadow> header = [
    BoxShadow(
      color: Color(0x08000000),
      offset: Offset(0, 2),
      blurRadius: 6,
      spreadRadius: 0,
    ),
  ];

  /// Floating element / modal / dropdown shadow
  static const List<BoxShadow> dropdown = [
    BoxShadow(
      color: Color(0x1F000000),
      offset: Offset(0, 10),
      blurRadius: 28,
      spreadRadius: 0,
    ),
  ];
}
