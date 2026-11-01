import 'package:flutter/material.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_notification.dart';
import '../../../services/glorov_account_state.dart';

/// Notifications Center Section
class GlorovNotificationsSection extends StatefulWidget {
  final bool isLoading;
  const GlorovNotificationsSection({super.key, this.isLoading = false});

  @override
  State<GlorovNotificationsSection> createState() =>
      _GlorovNotificationsSectionState();
}

class _GlorovNotificationsSectionState
    extends State<GlorovNotificationsSection> {
  String _selectedCategory = 'All';

  final List<String> _categories = [
    'All',
    'Orders',
    'Gardening Tips',
    'Wishlist',
    'Store News',
  ];

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GlorovAccountState.instance,
      builder: (context, _) {
        final accountState = GlorovAccountState.instance;
        final unreadCount = accountState.unreadNotificationCount;
        final notifications =
            accountState.getNotificationsByCategory(_selectedCategory);

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Text(
                            'Notification Center',
                            style: TextStyle(
                              fontFamily: AppTypography.displayFont,
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDark,
                            ),
                          ),
                          if (unreadCount > 0) ...[
                            const SizedBox(width: AppSpacing.sm),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 8, vertical: 2),
                              decoration: const BoxDecoration(
                                color: AppColors.forestMedium,
                                borderRadius: AppRadii.roundedFull,
                              ),
                              child: Text(
                                '$unreadCount new',
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      const SizedBox(height: 2),
                      const Text(
                        'Demonstration alerts for plant care, transit milestones, and restock notifications.',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (unreadCount > 0) ...[
                  const SizedBox(width: AppSpacing.md),
                  TextButton.icon(
                    onPressed: () {
                      accountState.markAllAsRead();
                      GlorovFeedback.showSuccessToast(
                        context,
                        message: 'All notifications marked as read.',
                      );
                    },
                    icon: const Icon(Icons.done_all, size: 16),
                    label: const Text('Mark All as Read'),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.forestMedium,
                      textStyle: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Category Filter Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _categories.map((cat) {
                  final isSelected = _selectedCategory == cat;
                  final count =
                      accountState.getNotificationsByCategory(cat).length;

                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text('$cat ($count)'),
                      selected: isSelected,
                      selectedColor: AppColors.forestDark,
                      backgroundColor: Colors.white,
                      labelStyle: TextStyle(
                        color:
                            isSelected ? Colors.white : AppColors.textPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _selectedCategory = cat);
                      },
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: AppSpacing.lg),

            // Notification List or Empty State
            if (widget.isLoading)
              Column(
                children: List.generate(
                  4,
                  (_) => const GlorovListItemSkeleton(hasAvatar: true),
                ),
              )
            else if (notifications.isEmpty)
              _buildEmptyState()
            else
              ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: notifications.length,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: AppSpacing.sm),
                itemBuilder: (context, index) {
                  final notif = notifications[index];
                  return GlorovStaggeredItem(
                    index: index,
                    child: _notificationCard(context, notif, accountState),
                  );
                },
              ),
          ],
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.cream,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.notifications_none_outlined,
              size: 40,
              color: AppColors.forestMedium,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            _selectedCategory == 'All'
                ? 'No Notifications'
                : 'No $_selectedCategory Notifications',
            style: const TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'All demonstration notifications have been cleared or read.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _notificationCard(BuildContext context, GlorovNotification notif,
      GlorovAccountState state) {
    IconData icon;
    Color iconColor;
    switch (notif.category) {
      case GlorovNotificationCategory.order:
        icon = Icons.local_shipping_outlined;
        iconColor = AppColors.forestMedium;
        break;
      case GlorovNotificationCategory.gardeningTip:
        icon = Icons.eco_outlined;
        iconColor = const Color(0xFF2D6A4F);
        break;
      case GlorovNotificationCategory.wishlist:
        icon = Icons.favorite_border;
        iconColor = const Color(0xFFE63946);
        break;
      case GlorovNotificationCategory.announcement:
        icon = Icons.campaign_outlined;
        iconColor = const Color(0xFFE3A857);
        break;
    }

    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: notif.isRead ? Colors.white : AppColors.cream.withAlpha(80),
        borderRadius: AppRadii.roundedMd,
        border: Border.all(
          color: notif.isRead
              ? AppColors.borderLight
              : AppColors.forestMedium.withAlpha(90),
          width: notif.isRead ? 1.0 : 1.5,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon Container
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: iconColor.withAlpha(25),
              borderRadius: AppRadii.roundedMd,
            ),
            child: Icon(icon, color: iconColor, size: 20),
          ),
          const SizedBox(width: AppSpacing.md),

          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          notif.title,
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 14,
                            fontWeight: notif.isRead
                                ? FontWeight.w600
                                : FontWeight.w700,
                            color: AppColors.forestDark,
                          ),
                        ),
                        if (!notif.isRead) ...[
                          const SizedBox(width: 8),
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.forestMedium,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      notif.timeAgo,
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  notif.message,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    height: 1.4,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    if (!notif.isRead)
                      TextButton(
                        onPressed: () {
                          state.markAsRead(notif.id);
                          GlorovFeedback.showInfoToast(
                            context,
                            message: 'Notification marked as read.',
                          );
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.forestMedium,
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(0, 0),
                        ),
                        child: const Text(
                          'Mark as Read',
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    if (notif.routeDestination != null) ...[
                      if (!notif.isRead) const SizedBox(width: 16),
                      TextButton(
                        onPressed: () {
                          state.markAsRead(notif.id);
                          Navigator.pushNamed(context, notif.routeDestination!);
                        },
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.forestDark,
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(0, 0),
                        ),
                        child: const Text(
                          'View Details →',
                          style: TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close, size: 16),
                      color: AppColors.textMuted,
                      tooltip: 'Dismiss alert',
                      onPressed: () {
                        state.deleteNotification(notif.id);
                        GlorovFeedback.showInfoToast(
                          context,
                          message: 'Alert dismissed.',
                        );
                      },
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
}
