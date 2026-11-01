import 'dart:async';
import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Centralized feedback utilities for user actions across the GLOROV application.
/// Provides consistent, accessible, compact toast notifications, haptic cues, and celebrations.
class GlorovFeedback {
  GlorovFeedback._();

  static OverlayEntry? _activeToast;
  static Timer? _toastTimer;

  static bool get _isInTest =>
      WidgetsBinding.instance.runtimeType.toString().contains('Test');

  /// Dismisses any currently visible botanical toast
  static void dismissActiveToast() {
    _toastTimer?.cancel();
    _toastTimer = null;
    _activeToast?.remove();
    _activeToast = null;
  }

  /// Displays a clean, compact botanical success toast (e.g. "Added to cart", "Coupon applied").
  static void showSuccessToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(milliseconds: 2600),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    _showBotanicalToast(
      context,
      message: (title != null && title.isNotEmpty) ? '$title: $message' : message,
      icon: Icons.check_circle_rounded,
      iconColor: const Color(0xFF34D399),
      backgroundColor: const Color(0xFF0A4C36),
      duration: duration,
      onAction: onAction,
      actionLabel: actionLabel,
    );
  }

  /// Displays an accessible, compact error toast (e.g. "Invalid pincode", "Item out of stock").
  static void showErrorToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(milliseconds: 3200),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    _showBotanicalToast(
      context,
      message: (title != null && title.isNotEmpty) ? '$title: $message' : message,
      icon: Icons.error_rounded,
      iconColor: const Color(0xFFF87171),
      backgroundColor: const Color(0xFF7F1D1D),
      duration: duration,
      onAction: onAction,
      actionLabel: actionLabel,
    );
  }

  /// Displays an informational compact toast (e.g. "Moved to wishlist", "Link copied").
  static void showInfoToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(milliseconds: 2600),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    _showBotanicalToast(
      context,
      message: (title != null && title.isNotEmpty) ? '$title: $message' : message,
      icon: Icons.info_rounded,
      iconColor: const Color(0xFF60A5FA),
      backgroundColor: const Color(0xFF1E293B),
      duration: duration,
      onAction: onAction,
      actionLabel: actionLabel,
    );
  }

  /// Displays a warning compact toast (e.g. "Only 2 seed packets remaining").
  static void showWarningToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(milliseconds: 2800),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    _showBotanicalToast(
      context,
      message: (title != null && title.isNotEmpty) ? '$title: $message' : message,
      icon: Icons.warning_rounded,
      iconColor: const Color(0xFFFBBF24),
      backgroundColor: const Color(0xFF78350F),
      duration: duration,
      onAction: onAction,
      actionLabel: actionLabel,
    );
  }

  static void _showBotanicalToast(
    BuildContext context, {
    required String message,
    required IconData icon,
    required Color iconColor,
    required Color backgroundColor,
    required Duration duration,
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    if (!context.mounted) return;

    dismissActiveToast();

    final overlay = Overlay.maybeOf(context, rootOverlay: true);
    if (overlay == null) {
      final messenger = ScaffoldMessenger.maybeOf(context);
      if (messenger != null) {
        messenger.hideCurrentSnackBar();
        messenger.showSnackBar(
          SnackBar(
            behavior: SnackBarBehavior.floating,
            backgroundColor: backgroundColor,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            content: Row(
              children: [
                Icon(icon, color: iconColor, size: 16),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    message,
                    style: const TextStyle(fontSize: 12, color: Colors.white, fontWeight: FontWeight.w600),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (actionLabel != null && onAction != null) ...[
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: () {
                      messenger.hideCurrentSnackBar();
                      onAction();
                    },
                    child: Text(actionLabel, style: TextStyle(color: iconColor, fontWeight: FontWeight.w800, fontSize: 11)),
                  ),
                ],
              ],
            ),
          ),
        );
      }
      return;
    }

    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (ctx) {
        final screenWidth = MediaQuery.of(ctx).size.width;
        final topPadding = MediaQuery.of(ctx).padding.top;
        final isMobile = screenWidth < 600;

        return Positioned(
          top: topPadding + (isMobile ? 12.0 : 20.0),
          left: 16.0,
          right: 16.0,
          child: Center(
            child: Material(
              color: Colors.transparent,
              child: Container(
                constraints: BoxConstraints(
                  maxWidth: isMobile ? screenWidth - 32 : 440,
                ),
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                decoration: BoxDecoration(
                  color: backgroundColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x33000000),
                      blurRadius: 16,
                      offset: Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(icon, color: iconColor, size: 15),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        message,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 0.1,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (actionLabel != null && onAction != null) ...[
                      const SizedBox(width: 10),
                      InkWell(
                        onTap: () {
                          dismissActiveToast();
                          onAction();
                        },
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.18),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            actionLabel,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.3,
                            ),
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(width: 6),
                    InkWell(
                      onTap: dismissActiveToast,
                      borderRadius: BorderRadius.circular(10),
                      child: const Padding(
                        padding: EdgeInsets.all(2.0),
                        child: Icon(Icons.close_rounded, color: Colors.white70, size: 14),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );

    _activeToast = entry;
    overlay.insert(entry);

    if (!_isInTest) {
      _toastTimer = Timer(duration, () {
        if (_activeToast == entry) {
          dismissActiveToast();
        }
      });
    }
  }

  /// Botanical particle color palette for [SuccessBurst] celebrations
  static const List<Color> botanicalBurstColors = [
    AppColors.forestDeep, // #1E3F20
    AppColors.sage, // #52796F
    Color(0xFF2E7D32), // Emerald
    Color(0xFFEAB308), // Gold pollen
    AppColors.terracotta, // Terracotta bloom
  ];
}
