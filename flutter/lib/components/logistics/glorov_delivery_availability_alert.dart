import 'package:flutter/material.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_pincode_result.dart';

/// Reusable Botanical Delivery Availability Alert Component.
///
/// Clearly communicates delivery serviceability, courier connectivity status,
/// and recovery paths across Product Details, Cart, and Checkout screens.
class GlorovDeliveryAvailabilityAlert extends StatelessWidget {
  final GlorovPincodeResult? result;
  final bool isLoading;
  final VoidCallback? onTryAnother;
  final VoidCallback? onContactSupport;
  final EdgeInsetsGeometry margin;

  const GlorovDeliveryAvailabilityAlert({
    super.key,
    required this.result,
    this.isLoading = false,
    this.onTryAnother,
    this.onContactSupport,
    this.margin = const EdgeInsets.only(top: 10),
  });

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Container(
        margin: margin,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF8FAFC),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        child: Row(
          children: const [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF0F3E2E)),
              ),
            ),
            SizedBox(width: 10),
            Text(
              'Verifying courier network serviceability...',
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 12.5,
                fontWeight: FontWeight.w500,
                color: Color(0xFF475569),
              ),
            ),
          ],
        ),
      );
    }

    if (result == null) {
      return const SizedBox.shrink();
    }

    final isServiceable = result!.serviceable;
    final isLogisticsNotConnected = result!.isLogisticsDisconnected;

    if (isServiceable) {
      return Container(
        margin: margin,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: const Color(0xFF86EFAC), width: 1.1),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(
              Icons.check_circle_rounded,
              size: 20,
              color: Color(0xFF16A34A),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    result!.message,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF15803D),
                    ),
                  ),
                  if (result!.detailedMessage != null &&
                      result!.detailedMessage!.isNotEmpty) ...[
                    const SizedBox(height: 3),
                    Text(
                      result!.detailedMessage!,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: Color(0xFF166534),
                        height: 1.35,
                      ),
                    ),
                  ],
                  if (result!.courierName != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.local_shipping_outlined,
                          size: 13,
                          color: Color(0xFF15803D),
                        ),
                        const SizedBox(width: 4),
                        Flexible(
                          child: Text(
                            result!.courierName!,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11.5,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF15803D),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      );
    }

    // Unserviceable / Logistics Not Connected Alert
    final Color bgColor = isLogisticsNotConnected
        ? const Color(0xFFFFF7ED) // Warm botanical amber
        : const Color(0xFFFEF2F2); // Soft warm red for invalid/rejected
    final Color borderColor = isLogisticsNotConnected
        ? const Color(0xFFFDBA74)
        : const Color(0xFFFECACA);
    final Color iconColor = isLogisticsNotConnected
        ? const Color(0xFFEA580C)
        : const Color(0xFFDC2626);
    final Color titleColor = isLogisticsNotConnected
        ? const Color(0xFF9A3412)
        : const Color(0xFF991B1B);
    final Color bodyColor = isLogisticsNotConnected
        ? const Color(0xFFC2410C)
        : const Color(0xFFB91C1C);

    return Container(
      margin: margin,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: borderColor, width: 1.1),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(
                isLogisticsNotConnected
                    ? Icons.location_off_outlined
                    : Icons.error_outline_rounded,
                size: 20,
                color: iconColor,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      result!.message,
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: titleColor,
                        height: 1.3,
                      ),
                    ),
                    if (result!.detailedMessage != null &&
                        result!.detailedMessage!.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(
                        result!.detailedMessage!,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          color: bodyColor,
                          height: 1.35,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
          if (onTryAnother != null || onContactSupport != null) ...[
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 4,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                if (onTryAnother != null)
                  InkWell(
                    onTap: onTryAnother,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: 3,
                        horizontal: 4,
                      ),
                      child: Text(
                        'Change PIN',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
                if (onTryAnother != null && onContactSupport != null)
                  Text(
                    '•',
                    style: TextStyle(
                      fontSize: 12,
                      color: titleColor.withValues(alpha: 0.5),
                    ),
                  ),
                if (onContactSupport != null)
                  InkWell(
                    onTap: onContactSupport,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        vertical: 3,
                        horizontal: 4,
                      ),
                      child: Text(
                        'Contact Support',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: titleColor,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
