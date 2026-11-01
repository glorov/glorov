import 'package:flutter/material.dart';
import '../../../core/icons/glorov_category_svg_icons.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../route/route_constants.dart';
import '../../../services/glorov_account_state.dart';
import '../../../services/glorov_cart_state.dart';
import '../glorov_account_screen.dart';

/// Clean & Compact Account Overview Dashboard Section
class GlorovAccountOverviewSection extends StatelessWidget {
  final ValueChanged<GlorovAccountSection> onNavigateSection;

  const GlorovAccountOverviewSection({
    super.key,
    required this.onNavigateSection,
  });

  void _confirmSignOut(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: AppColors.forestDark, size: 22),
            SizedBox(width: 8),
            Text(
              'Sign Out?',
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        content: const Text(
          'Are you sure you want to sign out of your GLOROV account? Your saved cart and orders will be preserved upon re-authenticating.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.4,
          ),
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              await GlorovAccountState.instance.logout();
              if (context.mounted) {
                GlorovFeedback.showSuccessToast(
                  context,
                  message: 'You have been signed out.',
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDark,
              foregroundColor: Colors.white,
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: Listenable.merge([
        GlorovAccountState.instance,
        GlorovCartState.instance,
      ]),
      builder: (context, _) {
        final profile = GlorovAccountState.instance.profile;
        final cartState = GlorovCartState.instance;
        final accountState = GlorovAccountState.instance;

        // If unauthenticated, render the clean guest overview landing
        if (!accountState.isAuthenticated) {
          return _buildGuestOverview(context);
        }

        final ordersCount = cartState.orders.length;
        final wishlistCount = cartState.wishlistIds.length;
        final addressCount = cartState.addresses.length;

        final displayName = profile.displayName.trim().isNotEmpty
            ? profile.displayName.trim()
            : (profile.email.isNotEmpty
                ? profile.email.split('@').first
                : 'Gardener');

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. User Header Card (Compact & Simple)
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: AppSpacing.md,
              ),
              decoration: const BoxDecoration(
                color: AppColors.forestDark,
                borderRadius: AppRadii.roundedLg,
                boxShadow: [
                  BoxShadow(
                    color: Color(0x14000000),
                    blurRadius: 10,
                    offset: Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Avatar Initials
                  CircleAvatar(
                    radius: 26,
                    backgroundColor: AppColors.sage,
                    child: Text(
                      profile.initials,
                      style: const TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: AppColors.forestDark,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),

                  // Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                displayName,
                                style: const TextStyle(
                                  fontFamily: AppTypography.displayFont,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                                overflow: TextOverflow.ellipsis,
                                maxLines: 1,
                              ),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.15),
                                borderRadius: AppRadii.roundedFull,
                              ),
                              child: const Text(
                                'VERIFIED',
                                style: TextStyle(
                                  fontSize: 9,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.sage,
                                  letterSpacing: 0.5,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          profile.email,
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            color: Colors.white70,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.eco,
                                color: AppColors.sage, size: 13),
                            const SizedBox(width: 4),
                            Flexible(
                              child: Text(
                                profile.membershipTier,
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 11,
                                  color: AppColors.sage,
                                  fontWeight: FontWeight.w500,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Compact Edit Action
                  IconButton(
                    tooltip: 'Edit Profile',
                    onPressed: () =>
                        onNavigateSection(GlorovAccountSection.profile),
                    icon: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.12),
                        borderRadius: AppRadii.roundedFull,
                      ),
                      child: const Icon(
                        Icons.edit_outlined,
                        color: Colors.white,
                        size: 16,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // 2. Key Metrics Row (Compact 3-Column on mobile, Wide on desktop)
            LayoutBuilder(
              builder: (context, constraints) {
                final isWide = constraints.maxWidth >= 640;

                if (!isWide) {
                  // Mobile: Compact 3-Column Grid
                  return Row(
                    children: [
                      Expanded(
                        child: _compactMetricCard(
                          icon: Icons.local_shipping_outlined,
                          count: ordersCount,
                          label: 'Orders',
                          onTap: () =>
                              Navigator.pushNamed(context, ordersScreenRoute),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: _compactMetricCard(
                          icon: Icons.location_on_outlined,
                          count: addressCount,
                          label: 'Addresses',
                          onTap: () =>
                              onNavigateSection(GlorovAccountSection.addresses),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: _compactMetricCard(
                          icon: Icons.favorite_border,
                          count: wishlistCount,
                          label: 'Wishlist',
                          onTap: () =>
                              Navigator.pushNamed(context, bookmarkScreenRoute),
                        ),
                      ),
                    ],
                  );
                }

                // Desktop / Tablet: Wide Cards
                final cardWidth =
                    (constraints.maxWidth - AppSpacing.md * 2) / 3;

                return Row(
                  children: [
                    SizedBox(
                      width: cardWidth,
                      child: _wideMetricCard(
                        title: 'Total Orders',
                        value: '$ordersCount',
                        subtitle: ordersCount > 0
                            ? 'Latest: ${cartState.orders.first.status}'
                            : 'No orders yet',
                        icon: Icons.local_shipping_outlined,
                        actionLabel: 'View Orders',
                        onTap: () =>
                            Navigator.pushNamed(context, ordersScreenRoute),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    SizedBox(
                      width: cardWidth,
                      child: _wideMetricCard(
                        title: 'Saved Addresses',
                        value: '$addressCount',
                        subtitle: '${cartState.selectedAddress.city} (Default)',
                        icon: Icons.location_on_outlined,
                        actionLabel: 'Manage Addresses',
                        onTap: () =>
                            onNavigateSection(GlorovAccountSection.addresses),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    SizedBox(
                      width: cardWidth,
                      child: _wideMetricCard(
                        title: 'Botanical Wishlist',
                        value: '$wishlistCount',
                        subtitle: '$wishlistCount saved seeds & plants',
                        icon: Icons.favorite_border,
                        actionLabel: 'View Wishlist',
                        onTap: () =>
                            Navigator.pushNamed(context, bookmarkScreenRoute),
                      ),
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: AppSpacing.md),

            // 3. Primary Delivery Address Card (Clean, Single-Layer & Compact)
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedMd,
                border: Border.all(color: AppColors.borderLight),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x04000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.location_on,
                              color: AppColors.forestDark, size: 17),
                          SizedBox(width: 6),
                          Text(
                            'Primary Delivery Address',
                            style: TextStyle(
                              fontFamily: AppTypography.displayFont,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDark,
                            ),
                          ),
                        ],
                      ),
                      InkWell(
                        onTap: () =>
                            onNavigateSection(GlorovAccountSection.addresses),
                        borderRadius: AppRadii.roundedSm,
                        child: const Padding(
                          padding:
                              EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.edit_location_alt_outlined,
                                  size: 13, color: AppColors.forestMedium),
                              SizedBox(width: 3),
                              Text(
                                'Manage',
                                style: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.forestMedium,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(
                          color: AppColors.cream,
                          borderRadius: AppRadii.roundedSm,
                        ),
                        child: const Icon(Icons.home_work_outlined,
                            color: AppColors.forestMedium, size: 18),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Flexible(
                                  child: Text(
                                    cartState.selectedAddress.fullName.isNotEmpty
                                        ? cartState.selectedAddress.fullName
                                        : displayName,
                                    style: const TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 13,
                                      color: AppColors.forestDark,
                                    ),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 6, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: AppColors.forestDark,
                                    borderRadius: AppRadii.roundedFull,
                                  ),
                                  child: const Text(
                                    'DEFAULT',
                                    style: TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.w800,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              '${cartState.selectedAddress.addressLine}, ${cartState.selectedAddress.city}, ${cartState.selectedAddress.state} — ${cartState.selectedAddress.pincode}',
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12,
                                color: AppColors.textPrimary,
                                height: 1.3,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            if (cartState.selectedAddress.phoneNumber.isNotEmpty) ...[
                              const SizedBox(height: 2),
                              Text(
                                'Mobile: +91 ${cartState.selectedAddress.phoneNumber}',
                                style: const TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 11,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.md),

            // 4. Account Services & Actions (Unified, Non-Redundant & Compact)
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedMd,
                border: Border.all(color: AppColors.borderLight),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x04000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.fromLTRB(14, 12, 14, 6),
                    child: Row(
                      children: [
                        Icon(Icons.eco, color: AppColors.forestDark, size: 16),
                        SizedBox(width: 6),
                        Text(
                          'Account & Services',
                          style: TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: AppColors.forestDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _serviceTile(
                    icon: Icons.local_shipping_outlined,
                    title: 'My Orders & Live Tracking',
                    subtitle: 'Track active parcels & view order history',
                    onTap: () =>
                        Navigator.pushNamed(context, ordersScreenRoute),
                  ),
                  const Divider(color: AppColors.borderLight, height: 1),
                  _serviceTile(
                    icon: Icons.location_on_outlined,
                    title: 'Delivery Addresses',
                    subtitle: 'Manage shipping destinations & default address',
                    onTap: () =>
                        onNavigateSection(GlorovAccountSection.addresses),
                  ),
                  const Divider(color: AppColors.borderLight, height: 1),
                  _serviceTile(
                    icon: Icons.person_outline,
                    title: 'Customer Profile Settings',
                    subtitle: 'Update your name, mobile & credentials',
                    onTap: () =>
                        onNavigateSection(GlorovAccountSection.profile),
                  ),
                  const Divider(color: AppColors.borderLight, height: 1),
                  _serviceTile(
                    icon: Icons.favorite_border,
                    title: 'Saved Botanical Wishlist',
                    subtitle: 'View saved seeds, indoor plants & planters',
                    onTap: () =>
                        Navigator.pushNamed(context, bookmarkScreenRoute),
                  ),
                  const Divider(color: AppColors.borderLight, height: 1),
                  _serviceTile(
                    icon: Icons.support_agent_outlined,
                    title: 'Customer Care & Advisory',
                    subtitle: 'Horticultural help & WhatsApp support desk',
                    onTap: () =>
                        onNavigateSection(GlorovAccountSection.contactSupport),
                  ),
                  const Divider(color: AppColors.borderLight, height: 1),
                  _serviceTile(
                    icon: accountState.isAuthenticated
                        ? Icons.logout
                        : Icons.login,
                    title: accountState.isAuthenticated
                        ? 'Sign Out'
                        : 'Sign In / Register',
                    subtitle: accountState.isAuthenticated
                        ? 'Log out of your customer profile safely'
                        : 'Access orders, wishlist & addresses',
                    isDestructive: accountState.isAuthenticated,
                    onTap: () {
                      if (accountState.isAuthenticated) {
                        _confirmSignOut(context);
                      } else {
                        Navigator.pushNamed(context, logInScreenRoute);
                      }
                    },
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _compactMetricCard({
    required IconData icon,
    required int count,
    required String label,
    required VoidCallback onTap,
  }) {
    return GlorovTapCard(
      onTap: onTap,
      borderRadius: AppRadii.roundedMd,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 11),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadii.roundedMd,
          border: Border.all(color: AppColors.borderLight),
          boxShadow: const [
            BoxShadow(
              color: Color(0x04000000),
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(icon, size: 14, color: AppColors.forestMedium),
                const SizedBox(width: 4),
                Text(
                  label,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 5),
            GlorovCounter(
              value: count,
              style: const TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.forestDark,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _wideMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required String actionLabel,
    required VoidCallback onTap,
  }) {
    final numVal = num.tryParse(value) ?? 0;

    return GlorovTapCard(
      onTap: onTap,
      borderRadius: AppRadii.roundedMd,
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppRadii.roundedMd,
          border: Border.all(color: AppColors.borderLight),
          boxShadow: const [
            BoxShadow(
              color: Color(0x04000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                Icon(icon, size: 18, color: AppColors.forestMedium),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            GlorovCounter(
              value: numVal,
              style: const TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 24,
                fontWeight: FontWeight.w800,
                color: AppColors.forestDark,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 11,
                color: AppColors.textMuted,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Text(
                  actionLabel,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestMedium,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.arrow_forward_ios,
                  size: 10,
                  color: AppColors.forestMedium,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _serviceTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isDestructive
                    ? AppColors.error.withValues(alpha: 0.1)
                    : AppColors.cream,
                borderRadius: AppRadii.roundedSm,
              ),
              child: Icon(
                icon,
                color: isDestructive ? AppColors.error : AppColors.forestDark,
                size: 18,
              ),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDestructive
                          ? AppColors.error
                          : AppColors.forestDark,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11,
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_right,
              color: isDestructive ? AppColors.error : AppColors.textMuted,
              size: 18,
            ),
          ],
        ),
      ),
    );
  }
}
