import 'package:flutter/material.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/responsive/glorov_responsive.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_product.dart';
import '../../models/glorov/glorov_order.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';

/// GLOROV Order History & Shipment Tracking Screen
/// Displays confirmed orders, item snapshots, live botanical transit tracking,
/// order cancellation, return requests, and instant re-order actions.
class GlorovOrdersScreen extends StatefulWidget {
  final bool? isLoading;
  const GlorovOrdersScreen({super.key, this.isLoading});

  @override
  State<GlorovOrdersScreen> createState() => _GlorovOrdersScreenState();
}

class _GlorovOrdersScreenState extends State<GlorovOrdersScreen> {
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchRemoteOrders();
  }

  Future<void> _fetchRemoteOrders() async {
    setState(() => _isLoading = true);
    try {
      await GlorovRepositories.orders.getOrders();
    } catch (_) {
      // Retain existing local orders if network is unavailable
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _showLiveTrackingDialog(BuildContext context, GlorovOrder order) async {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => FutureBuilder<Map<String, dynamic>?>(
        future: GlorovRepositories.orders.getOrderTracking(order.id),
        builder: (dialogCtx, snapshot) {
          final tracking = snapshot.data;
          final courier = tracking?['courier']?.toString() ??
              'Shiprocket Botanical Express';
          final awb = tracking?['awb_code']?.toString() ??
              'AWB-${order.id.hashCode.abs() % 1000000}';
          final scans = (tracking?['scans'] as List<dynamic>?) ?? [];

          return AlertDialog(
            shape: const RoundedRectangleBorder(
              borderRadius: AppRadii.roundedLg,
            ),
            title: Row(
              children: [
                const Icon(
                  Icons.local_shipping_outlined,
                  color: AppColors.forestDeep,
                  size: 24,
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    'Tracking ${order.id}',
                    style: const TextStyle(
                      fontFamily: AppTypography.displayFont,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDeep,
                    ),
                  ),
                ),
              ],
            ),
            content: SizedBox(
              width: 480,
              child: snapshot.connectionState == ConnectionState.waiting
                  ? const GlorovTrackingSkeleton()
                  : SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: AppColors.mintSurface,
                              borderRadius: AppRadii.roundedMd,
                              border: Border.all(
                                color: AppColors.sage.withValues(alpha: 0.4),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.shield_outlined,
                                  color: AppColors.forestDeep,
                                  size: 20,
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '$courier  •  $awb',
                                        style: const TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.forestDeep,
                                        ),
                                      ),
                                      const Text(
                                        'Moisture-Lock Sealed • 48-Hour Plant Transit Guarantee',
                                        style: TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 11,
                                          color: AppColors.forestMedium,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          const Text(
                            'SHIPMENT SCAN HISTORY',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textMuted,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          if (scans.isEmpty) ...[
                            _buildScanItem(
                              title: 'Order confirmed and allocated to nursery',
                              location: 'Pune Nursery Hub',
                              isLatest: true,
                            ),
                          ] else ...[
                            for (int i = 0; i < scans.length; i++)
                              _buildScanItem(
                                title: scans[i]['activity']?.toString() ??
                                    'Transit update',
                                location: scans[i]['location']?.toString() ??
                                    'Regional Courier Hub',
                                isLatest: i == scans.length - 1,
                              ),
                          ],
                        ],
                      ),
                    ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(ctx).pop(),
                child: const Text('Close'),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildScanItem({
    required String title,
    required String location,
    required bool isLatest,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            isLatest ? Icons.check_circle : Icons.radio_button_checked,
            size: 16,
            color: isLatest ? AppColors.forestDeep : AppColors.sage,
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: isLatest ? FontWeight.w700 : FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
                Text(
                  location,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _confirmCancelOrder(BuildContext context, GlorovOrder order) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
        title: Row(
          children: [
            const Icon(Icons.cancel_outlined, color: AppColors.error, size: 24),
            const SizedBox(width: AppSpacing.sm),
            Text(
              'Cancel Order ${order.id}?',
              style: const TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        content: const Text(
          'Are you sure you want to cancel this order? Any payments will be refunded to your original payment method within 3-5 business days.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Keep Order'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              final result = await GlorovRepositories.orders
                  .cancelOrder(order.id, reason: 'Customer requested via web');
              if (context.mounted) {
                if (result.isSuccess) {
                  GlorovFeedback.showSuccessToast(
                    context,
                    message: 'Order ${order.id} has been cancelled.',
                  );
                } else {
                  GlorovFeedback.showErrorToast(
                    context,
                    message: result.errorOrNull ?? 'Failed to cancel order.',
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Yes, Cancel Order'),
          ),
        ],
      ),
    );
  }

  void _confirmReturnRequest(BuildContext context, GlorovOrder order) {
    String selectedReason = 'Plant damaged in transit';
    final notesController = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
          title: Row(
            children: [
              const Icon(Icons.assignment_return_outlined,
                  color: AppColors.forestDeep, size: 24),
              const SizedBox(width: AppSpacing.sm),
              Text(
                'Return Request for ${order.id}',
                style: const TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Select reason for return under our 48-Hour Live Plant Guarantee:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              DropdownButtonFormField<String>(
                value: selectedReason,
                decoration: const InputDecoration(
                  labelText: 'Return Reason',
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'Plant damaged in transit',
                    child: Text('Plant damaged in transit'),
                  ),
                  DropdownMenuItem(
                    value: 'Low germination rate / Defective seeds',
                    child: Text('Low germination rate / Defective seeds'),
                  ),
                  DropdownMenuItem(
                    value: 'Wrong botanical variety delivered',
                    child: Text('Wrong botanical variety delivered'),
                  ),
                  DropdownMenuItem(
                    value: 'Quality did not match description',
                    child: Text('Quality did not match description'),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setDialogState(() => selectedReason = val);
                  }
                },
              ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: notesController,
                maxLines: 2,
                decoration: const InputDecoration(
                  labelText: 'Horticultural notes / Description (optional)',
                ),
              ),
            ],
          ),
          actions: [
            OutlinedButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                Navigator.of(ctx).pop();
                final result =
                    await GlorovRepositories.orders.submitReturnRequest(
                  order.id,
                  reason: selectedReason,
                  itemIds: order.items.map((i) => i.productId).toList(),
                  notes: notesController.text.trim(),
                );
                if (context.mounted) {
                  if (result.isSuccess) {
                    GlorovFeedback.showSuccessToast(
                      context,
                      message:
                          'Return request submitted. Our botanist team will review within 24 hours.',
                    );
                  } else {
                    GlorovFeedback.showErrorToast(
                      context,
                      message: result.errorOrNull ??
                          'Failed to submit return request.',
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forestDeep,
                foregroundColor: Colors.white,
              ),
              child: const Text('Submit Return Request'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.surfaceCream,
      currentRoute: ordersScreenRoute,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildBreadcrumbs(context),
          GlorovContainer(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.lg,
            ),
            child: ListenableBuilder(
              listenable: Listenable.merge([
                GlorovCartState.instance,
                GlorovAccountState.instance,
              ]),
              builder: (context, _) {
                final orders = GlorovCartState.instance.orders;

                if ((widget.isLoading ?? _isLoading) && orders.isEmpty) {
                  return const GlorovOrdersListSkeleton(count: 3);
                }

                if (!GlorovAccountState.instance.isAuthenticated) {
                  return _buildAuthRequiredState(context);
                }

                if (orders.isEmpty) {
                  return _buildEmptyOrders(context);
                }

                return _buildOrdersList(context, orders);
              },
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          const GlorovFooter(),
        ],
      ),
    );
  }

  Widget _buildBreadcrumbs(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.surfacePure,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      child: GlorovContainer(
        padding: EdgeInsets.zero,
        child: Row(
          children: [
            InkWell(
              onTap: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  Navigator.pushReplacementNamed(context, homeScreenRoute);
                }
              },
              borderRadius: BorderRadius.circular(4),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.arrow_back_ios,
                        size: 11, color: AppColors.forestDark),
                    SizedBox(width: 4),
                    Text(
                      'Back',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.forestDark,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                '|',
                style: TextStyle(
                  color: AppColors.borderSubtle,
                  fontSize: 12,
                ),
              ),
            ),
            InkWell(
              onTap: () {
                if (Navigator.canPop(context)) {
                  Navigator.popUntil(context, (route) => route.isFirst);
                } else {
                  Navigator.pushReplacementNamed(context, homeScreenRoute);
                }
              },
              child: const Text(
                'Home',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12,
                  color: AppColors.textMuted,
                ),
              ),
            ),
            const SizedBox(width: 6),
            const Icon(Icons.chevron_right,
                size: 14, color: AppColors.textMuted),
            const SizedBox(width: 6),
            const Text(
              'My Orders',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDeep,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthRequiredState(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 40),
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.card,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.sage.withAlpha(50),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.local_shipping_outlined,
                  size: 32,
                  color: AppColors.forestDeep,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const Text(
                'Sign In to View Orders',
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.forestDeep,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              const Text(
                'Sign in to track your live plant deliveries, view order history, download tax invoices, and manage botanical returns.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      logInScreenRoute,
                      arguments: {
                        'redirectTo': ordersScreenRoute,
                        'reason':
                            'Please sign in to view your orders and track live botanical shipments.',
                      },
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDeep,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: const Text(
                    'SIGN IN TO CONTINUE',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      signUpScreenRoute,
                      arguments: {
                        'redirectTo': ordersScreenRoute,
                        'reason':
                            'Create your account to view your orders and track live botanical shipments.',
                      },
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.forestDeep,
                    side: const BorderSide(color: AppColors.forestMedium),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: const Text(
                    'CREATE NEW ACCOUNT',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyOrders(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                color: AppColors.mintSurface,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.local_shipping_outlined,
                size: 56,
                color: AppColors.forestMedium,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            const Text(
              'No Orders Placed Yet',
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDeep,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            const Text(
              'Your gardening journey awaits! Explore our premium seeds and live nursery plants.',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 14,
                color: AppColors.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.lg),
            GlorovButton.primary(
              label: 'EXPLORE BESTSELLERS',
              leadingIcon: const Icon(Icons.eco, size: 18, color: Colors.white),
              onPressed: () {
                if (Navigator.canPop(context)) {
                  Navigator.popUntil(context, (route) => route.isFirst);
                } else {
                  Navigator.pushReplacementNamed(context, homeScreenRoute);
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrdersList(BuildContext context, List<GlorovOrder> orders) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'ORDER HISTORY & SHIPMENT TRACKING',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                    color: AppColors.forestMedium,
                    letterSpacing: 1.0,
                  ),
                ),
                Text(
                  '${orders.length} ${orders.length == 1 ? "Order" : "Orders"} in your garden portfolio',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
            IconButton(
              icon: const Icon(Icons.refresh, color: AppColors.forestDeep),
              tooltip: 'Refresh Orders',
              onPressed: _fetchRemoteOrders,
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: orders.length,
          separatorBuilder: (ctx, i) => const SizedBox(height: AppSpacing.lg),
          itemBuilder: (ctx, index) => _buildOrderCard(context, orders[index]),
        ),
      ],
    );
  }

  Widget _buildOrderCard(BuildContext context, GlorovOrder order) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Order Card Header
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: const BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(AppRadii.lg),
                topRight: Radius.circular(AppRadii.lg),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order.id,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                        color: AppColors.forestDeep,
                      ),
                    ),
                    Text(
                      'Placed on ${order.formattedDate}',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: order.status == 'Cancelled'
                            ? AppColors.error.withValues(alpha: 0.15)
                            : AppColors.mintBadge,
                        borderRadius: AppRadii.roundedFull,
                      ),
                      child: Text(
                        order.status,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: order.status == 'Cancelled'
                              ? AppColors.error
                              : AppColors.forestDeep,
                        ),
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '₹${order.totalAmount.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Botanical Transit Tracking Bar
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'BOTANICAL SHIPMENT TRACKING',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: AppColors.forestMedium,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                _buildTrackingSteps(order.status),
              ],
            ),
          ),

          const Divider(height: 1, color: AppColors.borderSubtle),

          // Items Purchased
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: order.items.length,
              separatorBuilder: (ctx, i) => const SizedBox(height: 10),
              itemBuilder: (ctx, i) {
                final item = order.items[i];
                return Row(
                  children: [
                    ClipRRect(
                      borderRadius: AppRadii.roundedSm,
                      child: Image.network(
                        item.imageUrl,
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) =>
                            const Icon(Icons.yard, color: AppColors.sage),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.title,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '${item.variantName != null ? "${item.variantName}  •  " : ""}Qty: ${item.quantity}',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${item.lineTotal.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ],
                );
              },
            ),
          ),

          const Divider(height: 1, color: AppColors.borderSubtle),

          // Footer Row with Actions
          Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: 10,
            ),
            child: Wrap(
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              spacing: 8,
              runSpacing: 8,
              children: [
                Text(
                  'Delivering to ${order.address.city}, ${order.address.state}',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
                Wrap(
                  spacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    OutlinedButton.icon(
                      onPressed: () => _showLiveTrackingDialog(context, order),
                      icon: const Icon(Icons.local_shipping_outlined, size: 14),
                      label: const Text('Live Tracking'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.forestDeep,
                        visualDensity: VisualDensity.compact,
                        side: const BorderSide(color: AppColors.borderSubtle),
                      ),
                    ),
                    if (order.status == 'Confirmed' ||
                        order.status == 'Processing')
                      OutlinedButton.icon(
                        onPressed: () => _confirmCancelOrder(context, order),
                        icon: const Icon(Icons.cancel_outlined, size: 14),
                        label: const Text('Cancel'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.error,
                          visualDensity: VisualDensity.compact,
                          side: BorderSide(
                            color: AppColors.error.withValues(alpha: 0.5),
                          ),
                        ),
                      ),
                    if (order.status == 'Delivered')
                      OutlinedButton.icon(
                        onPressed: () => _confirmReturnRequest(context, order),
                        icon: const Icon(Icons.assignment_return_outlined,
                            size: 14),
                        label: const Text('Return Item'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.forestMedium,
                          visualDensity: VisualDensity.compact,
                        ),
                      ),
                    TextButton.icon(
                      onPressed: () async {
                        for (final item in order.items) {
                          final product =
                              await GlorovRepositories.products.getProductById(item.productId) ??
                              GlorovProductCache.get(item.productId);
                          if (product != null) {
                            GlorovCartState.instance.addToCart(
                              product,
                              quantity: item.quantity,
                            );
                          }
                        }
                        GlorovFeedback.showSuccessToast(
                          context,
                          message:
                              'Added all items from this order to your bag!',
                          actionLabel: 'VIEW BAG',
                          onAction: () =>
                              Navigator.pushNamed(context, cartScreenRoute),
                        );
                      },
                      icon: const Icon(Icons.refresh, size: 14),
                      label: const Text('Re-order Items'),
                      style: TextButton.styleFrom(
                        foregroundColor: AppColors.forestDeep,
                        visualDensity: VisualDensity.compact,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrackingSteps(String status) {
    final isDelivered = status == 'Delivered';
    final isCancelled = status == 'Cancelled';

    return Row(
      children: [
        _buildCheckpoint(
          icon: Icons.check,
          title: 'Order Placed',
          isActive: true,
          isDone: true,
        ),
        _buildTrackLine(isDone: !isCancelled),
        _buildCheckpoint(
          icon: Icons.eco,
          title: 'Nursery Prep',
          isActive: !isCancelled,
          isDone: !isCancelled,
        ),
        _buildTrackLine(isDone: isDelivered),
        _buildCheckpoint(
          icon: Icons.shield,
          title: 'Transit Shield',
          isActive: !isCancelled,
          isDone: isDelivered,
        ),
        _buildTrackLine(isDone: isDelivered),
        _buildCheckpoint(
          icon: Icons.home,
          title: isCancelled ? 'Cancelled' : 'Delivered',
          isActive: isDelivered || isCancelled,
          isDone: isDelivered,
        ),
      ],
    );
  }

  Widget _buildCheckpoint({
    required IconData icon,
    required String title,
    required bool isActive,
    required bool isDone,
  }) {
    return Column(
      children: [
        CircleAvatar(
          radius: 12,
          backgroundColor: isDone
              ? AppColors.forestDeep
              : (isActive ? AppColors.sage : AppColors.borderSubtle),
          child: Icon(icon, size: 12, color: Colors.white),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 10,
            fontWeight: isDone ? FontWeight.w700 : FontWeight.w500,
            color: isDone ? AppColors.forestDeep : AppColors.textMuted,
          ),
        ),
      ],
    );
  }

  Widget _buildTrackLine({required bool isDone}) {
    return Expanded(
      child: Container(
        height: 2,
        color: isDone ? AppColors.forestDeep : AppColors.borderSubtle,
        margin: const EdgeInsets.only(bottom: 16),
      ),
    );
  }
}
