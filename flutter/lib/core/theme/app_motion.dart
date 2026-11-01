import 'package:flutter/material.dart';

/// GLOROV Core Design System - Motion & Animation Tokens
class AppMotion {
  AppMotion._();

  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 250);
  static const Duration durationSlow = Duration(milliseconds: 400);

  static const Curve curveStandard = Curves.easeInOut;
  static const Curve curveDecelerate = Curves.easeOutCubic;
  static const Curve curveAccelerate = Curves.easeInCubic;
}
