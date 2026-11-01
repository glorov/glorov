import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// GLOROV Custom Botanical Trust Icons
/// Precision vector painters providing crisp, outline line-art icons
/// matching Image 2 reference (soil sprout, potted plant, replacement loop, WhatsApp support)
class GlorovCustomTrustIcon extends StatelessWidget {
  final String iconKey;
  final String? customSvg;
  final Color color;
  final double size;

  const GlorovCustomTrustIcon({
    super.key,
    required this.iconKey,
    this.customSvg,
    this.color = const Color(0xFF1B4332),
    this.size = 22.0,
  });

  @override
  Widget build(BuildContext context) {
    if (customSvg != null && customSvg!.isNotEmpty) {
      try {
        return SvgPicture.string(
          customSvg!,
          width: size,
          height: size,
          colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
        );
      } catch (_) {
        // Fall back to key painter if SVG fails to parse
      }
    }

    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(
        painter: _TrustIconPainter(
          iconKey: iconKey,
          color: color,
        ),
      ),
    );
  }
}

class _TrustIconPainter extends CustomPainter {
  final String iconKey;
  final Color color;

  _TrustIconPainter({
    required this.iconKey,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.7
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    final fillPaint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    switch (iconKey) {
      case 'fertilized-soil':
        _paintFertilizedSoil(canvas, size, strokePaint, fillPaint);
        break;
      case 'potted-plant':
        _paintPottedPlant(canvas, size, strokePaint);
        break;
      case 'replacement-arrows':
        _paintReplacementArrows(canvas, size, strokePaint, fillPaint);
        break;
      case 'support-chat':
        _paintSupportChat(canvas, size, strokePaint, fillPaint);
        break;
      case 'support-hand':
        _paintSupportHand(canvas, size, strokePaint);
        break;
      case 'organic-shield':
        _paintOrganicShield(canvas, size, strokePaint);
        break;
      case 'transit-truck':
        _paintTransitTruck(canvas, size, strokePaint);
        break;
      case 'eco-leaf':
        _paintEcoLeaf(canvas, size, strokePaint);
        break;
      default:
        _paintFertilizedSoil(canvas, size, strokePaint, fillPaint);
    }
  }

  /// 1. Pre-Fertilised Soil & Sprout (Reference Item 1 in Image 2)
  void _paintFertilizedSoil(
      Canvas canvas, Size size, Paint stroke, Paint fill) {
    final w = size.width;
    final h = size.height;

    // Soil container / dotted circle
    final rect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.15, h * 0.35, w * 0.7, h * 0.55),
      const Radius.circular(8),
    );
    canvas.drawRRect(rect, stroke);

    // Inner dashed/dotted soil sphere
    final dotRadius = w * 0.035;
    canvas.drawCircle(Offset(w * 0.35, h * 0.52), dotRadius, fill);
    canvas.drawCircle(Offset(w * 0.50, h * 0.52), dotRadius, fill);
    canvas.drawCircle(Offset(w * 0.65, h * 0.52), dotRadius, fill);
    canvas.drawCircle(Offset(w * 0.42, h * 0.65), dotRadius, fill);
    canvas.drawCircle(Offset(w * 0.58, h * 0.65), dotRadius, fill);
    canvas.drawCircle(Offset(w * 0.50, h * 0.78), dotRadius, fill);

    // Wavy soil top line
    final wavePath = Path()
      ..moveTo(w * 0.15, h * 0.85)
      ..quadraticBezierTo(w * 0.25, h * 0.80, w * 0.35, h * 0.85)
      ..quadraticBezierTo(w * 0.50, h * 0.90, w * 0.65, h * 0.85)
      ..quadraticBezierTo(w * 0.75, h * 0.80, w * 0.85, h * 0.85);
    canvas.drawPath(wavePath, stroke);

    // Sprout Stem
    canvas.drawLine(
        Offset(w * 0.5, h * 0.35), Offset(w * 0.5, h * 0.15), stroke);

    // Left leaf
    final leftLeaf = Path()
      ..moveTo(w * 0.5, h * 0.25)
      ..cubicTo(w * 0.40, h * 0.20, w * 0.28, h * 0.18, w * 0.32, h * 0.10)
      ..cubicTo(w * 0.45, h * 0.10, w * 0.50, h * 0.18, w * 0.5, h * 0.25);
    canvas.drawPath(leftLeaf, stroke);

    // Right leaf
    final rightLeaf = Path()
      ..moveTo(w * 0.5, h * 0.20)
      ..cubicTo(w * 0.60, h * 0.16, w * 0.72, h * 0.14, w * 0.68, h * 0.06)
      ..cubicTo(w * 0.55, h * 0.06, w * 0.50, h * 0.14, w * 0.5, h * 0.20);
    canvas.drawPath(rightLeaf, stroke);
  }

  /// 2. Potted Plant (Reference Item 2 in Image 2: "Arrives Healthy")
  void _paintPottedPlant(Canvas canvas, Size size, Paint stroke) {
    final w = size.width;
    final h = size.height;

    // Pot Rim
    final rimRect = RRect.fromRectAndRadius(
      Rect.fromLTWH(w * 0.22, h * 0.54, w * 0.56, h * 0.10),
      const Radius.circular(2),
    );
    canvas.drawRRect(rimRect, stroke);

    // Pot Body (tapered trapezoid)
    final potPath = Path()
      ..moveTo(w * 0.26, h * 0.64)
      ..lineTo(w * 0.33, h * 0.92)
      ..lineTo(w * 0.67, h * 0.92)
      ..lineTo(w * 0.74, h * 0.64);
    canvas.drawPath(potPath, stroke);

    // Plant Stem
    canvas.drawLine(
        Offset(w * 0.5, h * 0.54), Offset(w * 0.5, h * 0.28), stroke);

    // Left Plant Leaf
    final leftLeaf = Path()
      ..moveTo(w * 0.5, h * 0.42)
      ..cubicTo(w * 0.35, h * 0.40, w * 0.22, h * 0.32, w * 0.28, h * 0.22)
      ..cubicTo(w * 0.42, h * 0.22, w * 0.48, h * 0.34, w * 0.5, h * 0.42);
    canvas.drawPath(leftLeaf, stroke);

    // Right Plant Leaf
    final rightLeaf = Path()
      ..moveTo(w * 0.5, h * 0.34)
      ..cubicTo(w * 0.62, h * 0.30, w * 0.76, h * 0.24, w * 0.72, h * 0.14)
      ..cubicTo(w * 0.58, h * 0.14, w * 0.52, h * 0.26, w * 0.5, h * 0.34);
    canvas.drawPath(rightLeaf, stroke);

    // Top Leaf Tip
    final topLeaf = Path()
      ..moveTo(w * 0.5, h * 0.28)
      ..cubicTo(w * 0.45, h * 0.18, w * 0.50, h * 0.08, w * 0.50, h * 0.08)
      ..cubicTo(w * 0.52, h * 0.16, w * 0.55, h * 0.24, w * 0.5, h * 0.28);
    canvas.drawPath(topLeaf, stroke);
  }

  /// 3. Free Replacement Loop Arrows (Reference Item 3 in Image 2)
  void _paintReplacementArrows(
      Canvas canvas, Size size, Paint stroke, Paint fill) {
    final w = size.width;
    final h = size.height;
    final center = Offset(w * 0.5, h * 0.5);
    final radius = w * 0.36;

    // Top-Right arc (from ~195 deg to ~25 deg)
    final arc1 = Path()
      ..addArc(
        Rect.fromCircle(center: center, radius: radius),
        math.pi * 1.05,
        math.pi * 0.75,
      );
    canvas.drawPath(arc1, stroke);

    // Top Arrow Head
    final arrow1 = Path()
      ..moveTo(w * 0.82, h * 0.38)
      ..lineTo(w * 0.85, h * 0.24)
      ..lineTo(w * 0.71, h * 0.27);
    canvas.drawPath(arrow1, stroke);

    // Bottom-Left arc
    final arc2 = Path()
      ..addArc(
        Rect.fromCircle(center: center, radius: radius),
        math.pi * 0.05,
        math.pi * 0.75,
      );
    canvas.drawPath(arc2, stroke);

    // Bottom Arrow Head
    final arrow2 = Path()
      ..moveTo(w * 0.18, h * 0.62)
      ..lineTo(w * 0.15, h * 0.76)
      ..lineTo(w * 0.29, h * 0.73);
    canvas.drawPath(arrow2, stroke);
  }

  /// 4. WhatsApp / Plant Care Support
  void _paintSupportChat(
      Canvas canvas, Size size, Paint stroke, Paint fill) {
    final w = size.width;
    final h = size.height;

    // Speech Bubble with bottom-left pointer
    final bubble = Path()
      ..moveTo(w * 0.5, h * 0.10)
      ..cubicTo(w * 0.78, h * 0.10, w * 0.90, h * 0.26, w * 0.90, h * 0.48)
      ..cubicTo(w * 0.90, h * 0.68, w * 0.74, h * 0.84, w * 0.52, h * 0.84)
      ..cubicTo(w * 0.44, h * 0.84, w * 0.36, h * 0.82, w * 0.30, h * 0.78)
      ..lineTo(w * 0.14, h * 0.88)
      ..lineTo(w * 0.20, h * 0.72)
      ..cubicTo(w * 0.13, h * 0.64, w * 0.10, h * 0.56, w * 0.10, h * 0.48)
      ..cubicTo(w * 0.10, h * 0.26, w * 0.22, h * 0.10, w * 0.5, h * 0.10)
      ..close();
    canvas.drawPath(bubble, stroke);

    // Inside phone handset
    final phone = Path()
      ..moveTo(w * 0.36, h * 0.40)
      ..cubicTo(w * 0.36, h * 0.55, w * 0.45, h * 0.64, w * 0.60, h * 0.64)
      ..lineTo(w * 0.65, h * 0.58)
      ..cubicTo(w * 0.66, h * 0.56, w * 0.65, h * 0.54, w * 0.63, h * 0.52)
      ..lineTo(w * 0.55, h * 0.49)
      ..lineTo(w * 0.51, h * 0.53)
      ..cubicTo(w * 0.46, h * 0.50, w * 0.44, h * 0.46, w * 0.42, h * 0.42)
      ..lineTo(w * 0.46, h * 0.38)
      ..lineTo(w * 0.43, h * 0.30)
      ..cubicTo(w * 0.41, h * 0.28, w * 0.39, h * 0.28, w * 0.37, h * 0.30)
      ..close();
    canvas.drawPath(phone, stroke);
  }

  /// 4b. Botanist Caring Hand with Sprout (Item 3 in User Reference Image)
  void _paintSupportHand(Canvas canvas, Size size, Paint stroke) {
    final w = size.width;
    final h = size.height;

    // Open caring palm
    final palm = Path()
      ..moveTo(w * 0.12, h * 0.70)
      ..lineTo(w * 0.36, h * 0.70)
      ..lineTo(w * 0.54, h * 0.80)
      ..cubicTo(w * 0.66, h * 0.84, w * 0.78, h * 0.76, w * 0.82, h * 0.64)
      ..lineTo(w * 0.88, h * 0.48)
      ..cubicTo(w * 0.90, h * 0.42, w * 0.82, h * 0.38, w * 0.76, h * 0.44)
      ..lineTo(w * 0.66, h * 0.56);
    canvas.drawPath(palm, stroke);

    // Sprout rising from hand
    final sprout = Path()
      ..moveTo(w * 0.42, h * 0.62)
      ..lineTo(w * 0.42, h * 0.26);
    canvas.drawPath(sprout, stroke);

    // Left Leaf
    final leftLeaf = Path()
      ..moveTo(w * 0.42, h * 0.38)
      ..cubicTo(w * 0.30, h * 0.34, w * 0.18, h * 0.20, w * 0.26, h * 0.12)
      ..cubicTo(w * 0.38, h * 0.12, w * 0.42, h * 0.24, w * 0.42, h * 0.38);
    canvas.drawPath(leftLeaf, stroke);

    // Right Leaf
    final rightLeaf = Path()
      ..moveTo(w * 0.42, h * 0.30)
      ..cubicTo(w * 0.54, h * 0.26, w * 0.66, h * 0.16, w * 0.60, h * 0.08)
      ..cubicTo(w * 0.48, h * 0.08, w * 0.42, h * 0.20, w * 0.42, h * 0.30);
    canvas.drawPath(rightLeaf, stroke);
  }

  /// 5. Organic Shield
  void _paintOrganicShield(Canvas canvas, Size size, Paint stroke) {
    final w = size.width;
    final h = size.height;

    final shield = Path()
      ..moveTo(w * 0.5, h * 0.10)
      ..lineTo(w * 0.85, h * 0.22)
      ..cubicTo(w * 0.85, h * 0.60, w * 0.65, h * 0.82, w * 0.5, h * 0.90)
      ..cubicTo(w * 0.35, h * 0.82, w * 0.15, h * 0.60, w * 0.15, h * 0.22)
      ..close();
    canvas.drawPath(shield, stroke);

    // Checkmark inside shield
    final check = Path()
      ..moveTo(w * 0.35, h * 0.48)
      ..lineTo(w * 0.46, h * 0.60)
      ..lineTo(w * 0.66, h * 0.38);
    canvas.drawPath(check, stroke);
  }

  /// 6. Transit Truck
  void _paintTransitTruck(Canvas canvas, Size size, Paint stroke) {
    final w = size.width;
    final h = size.height;

    final cab = Path()
      ..moveTo(w * 0.10, h * 0.30)
      ..lineTo(w * 0.60, h * 0.30)
      ..lineTo(w * 0.60, h * 0.70)
      ..lineTo(w * 0.10, h * 0.70)
      ..close();
    canvas.drawPath(cab, stroke);

    final hood = Path()
      ..moveTo(w * 0.60, h * 0.44)
      ..lineTo(w * 0.75, h * 0.44)
      ..lineTo(w * 0.88, h * 0.56)
      ..lineTo(w * 0.88, h * 0.70)
      ..lineTo(w * 0.60, h * 0.70);
    canvas.drawPath(hood, stroke);

    canvas.drawCircle(Offset(w * 0.26, h * 0.76), w * 0.08, stroke);
    canvas.drawCircle(Offset(w * 0.74, h * 0.76), w * 0.08, stroke);
  }

  /// 7. Eco Leaf
  void _paintEcoLeaf(Canvas canvas, Size size, Paint stroke) {
    final w = size.width;
    final h = size.height;

    final leaf = Path()
      ..moveTo(w * 0.20, h * 0.80)
      ..cubicTo(w * 0.20, h * 0.30, w * 0.50, h * 0.10, w * 0.80, h * 0.10)
      ..cubicTo(w * 0.80, h * 0.40, w * 0.70, h * 0.80, w * 0.20, h * 0.80)
      ..close();
    canvas.drawPath(leaf, stroke);

    canvas.drawLine(
        Offset(w * 0.20, h * 0.80), Offset(w * 0.65, h * 0.35), stroke);
  }

  @override
  bool shouldRepaint(covariant _TrustIconPainter oldDelegate) {
    return oldDelegate.iconKey != iconKey || oldDelegate.color != color;
  }
}
