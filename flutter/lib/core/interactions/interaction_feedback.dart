import 'package:flutter/material.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import '../theme/app_colors.dart';

/// Centralized feedback utilities for user actions across the GLOROV application.
/// Provides consistent, accessible toast notifications, haptic cues, and success bursts.
class GlorovFeedback {
  GlorovFeedback._();

  /// Displays an accessible success toast notification (e.g. "Added to cart", "Coupon applied").
  static void showSuccessToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(seconds: 3),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    if (!context.mounted) return;

    final displayMessage =
        (title != null && title.isNotEmpty) ? '$title\n$message' : message;

    ToastNotification.show(
      context: context,
      message: displayMessage,
      type: ToastType.success,
      position: ToastPosition.top,
      duration: duration,
      dismissOnTap: true,
      swipeToDismiss: true,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }

  /// Displays an accessible error toast notification (e.g. "Invalid pincode", "Item out of stock").
  static void showErrorToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(seconds: 4),
  }) {
    if (!context.mounted) return;

    final displayMessage =
        (title != null && title.isNotEmpty) ? '$title\n$message' : message;

    ToastNotification.show(
      context: context,
      message: displayMessage,
      type: ToastType.error,
      position: ToastPosition.top,
      duration: duration,
      dismissOnTap: true,
      swipeToDismiss: true,
    );
  }

  /// Displays an informational toast (e.g. "Order tracking link copied").
  static void showInfoToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(seconds: 3),
    VoidCallback? onAction,
    String? actionLabel,
  }) {
    if (!context.mounted) return;

    final displayMessage =
        (title != null && title.isNotEmpty) ? '$title\n$message' : message;

    ToastNotification.show(
      context: context,
      message: displayMessage,
      type: ToastType.info,
      position: ToastPosition.top,
      duration: duration,
      dismissOnTap: true,
      swipeToDismiss: true,
      actionLabel: actionLabel,
      onAction: onAction,
    );
  }

  /// Displays a warning toast (e.g. "Only 2 seed packets remaining").
  static void showWarningToast(
    BuildContext context, {
    required String message,
    String? title,
    Duration duration = const Duration(seconds: 3),
  }) {
    if (!context.mounted) return;

    final displayMessage =
        (title != null && title.isNotEmpty) ? '$title\n$message' : message;

    ToastNotification.show(
      context: context,
      message: displayMessage,
      type: ToastType.warning,
      position: ToastPosition.top,
      duration: duration,
      dismissOnTap: true,
      swipeToDismiss: true,
    );
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
