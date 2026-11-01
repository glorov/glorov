import 'package:flutter/material.dart';
import '../../core/icons/glorov_category_svg_icons.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';

import 'sections/account_overview_section.dart';
import 'sections/profile_section.dart';
import 'sections/address_book_section.dart';
import 'sections/notifications_section.dart';
import 'sections/help_faq_section.dart';
import 'sections/support_section.dart';
import 'sections/settings_section.dart';

/// Available Sections within the GLOROV Account Hub
enum GlorovAccountSection {
  overview,
  profile,
  addresses,
  notifications,
  helpCenter,
  contactSupport,
  settings,
}

extension GlorovAccountSectionExt on GlorovAccountSection {
  String get title {
    switch (this) {
      case GlorovAccountSection.overview:
        return 'Overview';
      case GlorovAccountSection.profile:
        return 'Customer Profile';
      case GlorovAccountSection.addresses:
        return 'Delivery Addresses';
      case GlorovAccountSection.notifications:
        return 'Notifications';
      case GlorovAccountSection.helpCenter:
        return 'Help Center & FAQs';
      case GlorovAccountSection.contactSupport:
        return 'Contact Support';
      case GlorovAccountSection.settings:
        return 'Settings & Privacy';
    }
  }
}

/// Unified Customer Account Hub Screen for GLOROV Botanical E-Commerce
class GlorovAccountScreen extends StatefulWidget {
  final GlorovAccountSection initialSection;

  const GlorovAccountScreen({
    super.key,
    this.initialSection = GlorovAccountSection.overview,
  });

  @override
  State<GlorovAccountScreen> createState() => _GlorovAccountScreenState();
}

class _GlorovAccountScreenState extends State<GlorovAccountScreen> {
  late GlorovAccountSection _currentSection;

  @override
  void initState() {
    super.initState();
    _currentSection = widget.initialSection;
  }

  @override
  void didUpdateWidget(covariant GlorovAccountScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialSection != widget.initialSection) {
      setState(() => _currentSection = widget.initialSection);
    }
  }

  void _navigateToSection(GlorovAccountSection section) {
    setState(() => _currentSection = section);
  }

  void _confirmSignOut(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: AppColors.forestDark, size: 24),
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
          'Are you sure you want to sign out of your GLOROV customer account? Your saved cart and orders will be preserved upon re-authenticating.',
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
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              await GlorovAccountState.instance.logout();
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('You have been signed out.')),
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
    final isDesktop = AppBreakpoints.isDesktop(context);

    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.background,
      currentRoute: profileScreenRoute,
      showTopNav: false,
      showBottomNav: true,
      alwaysShowBottomNav: true,
      child: Column(
        children: [
          // Main Content Area
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: isDesktop ? AppSpacing.xl : AppSpacing.md,
              vertical: AppSpacing.lg,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: AppBreakpoints.maxContentWidth,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Breadcrumb Bar
                    _buildBreadcrumbs(context, isDesktop),

                    const SizedBox(height: AppSpacing.lg),

                    // Layout: Desktop 2-Column Split or Mobile Stack
                    if (isDesktop)
                      _buildDesktopLayout()
                    else
                      _buildMobileLayout(),
                  ],
                ),
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildBreadcrumbs(BuildContext context, bool isDesktop) {
    return Row(
      children: [
        InkWell(
          onTap: () => Navigator.pushNamed(context, homeScreenRoute),
          child: const Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.arrow_back_ios, size: 12, color: AppColors.forestDark),
              SizedBox(width: 4),
              Text(
                'Back to Store',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.forestDark,
                ),
              ),
            ],
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 8),
          child: Text('/',
              style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ),
        InkWell(
          onTap: () =>
              setState(() => _currentSection = GlorovAccountSection.overview),
          child: Text(
            'My Account',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              fontWeight: _currentSection == GlorovAccountSection.overview
                  ? FontWeight.w700
                  : FontWeight.w500,
              color: _currentSection == GlorovAccountSection.overview
                  ? AppColors.forestDark
                  : AppColors.textSecondary,
            ),
          ),
        ),
        if (_currentSection != GlorovAccountSection.overview) ...[
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 8),
            child: Text('/',
                style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
          ),
          Flexible(
            child: Text(
              _currentSection.title,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDark,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildDesktopLayout() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left Navigation Sidebar
        SizedBox(
          width: 280,
          child: _buildSidebar(),
        ),

        const SizedBox(width: AppSpacing.xxl),

        // Right Active Content Pane
        Expanded(
          child: _buildActiveSection(),
        ),
      ],
    );
  }

  Widget _buildMobileLayout() {
    // If on a sub-section on mobile, show a Back Button to Overview
    if (_currentSection != GlorovAccountSection.overview) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          InkWell(
            onTap: () =>
                setState(() => _currentSection = GlorovAccountSection.overview),
            borderRadius: AppRadii.roundedMd,
            child: const Padding(
              padding: EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.arrow_back_ios,
                      size: 14, color: AppColors.forestMedium),
                  SizedBox(width: 4),
                  Text(
                    'Back to Account Dashboard',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.forestMedium,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          _buildActiveSection(),
        ],
      );
    }

    // On mobile overview, show the dashboard with section shortcuts
    return GlorovAccountOverviewSection(onNavigateSection: _navigateToSection);
  }

  Widget _buildSidebar() {
    return ListenableBuilder(
      listenable: Listenable.merge([
        GlorovAccountState.instance,
        GlorovCartState.instance,
      ]),
      builder: (context, _) {
        final profile = GlorovAccountState.instance.profile;
        final cartState = GlorovCartState.instance;
        final accountState = GlorovAccountState.instance;

        final unreadNotifs = accountState.unreadNotificationCount;
        final ordersCount = cartState.orders.length;
        final addressCount = cartState.addresses.length;
        final wishlistCount = cartState.wishlistIds.length;

        return Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderLight),
            boxShadow: const [
              BoxShadow(
                color: Color(0x08000000),
                blurRadius: 10,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // User Mini Header: Dynamic based on auth status
              if (accountState.isAuthenticated) ...[
                Row(
                  children: [
                    CircleAvatar(
                      radius: 22,
                      backgroundColor: AppColors.sage,
                      child: Text(
                        profile.initials,
                        style: const TextStyle(
                          fontFamily: AppTypography.displayFont,
                          fontSize: 14,
                          fontWeight: FontWeight.w800,
                          color: AppColors.forestDark,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile.displayName,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDark,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            profile.email,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              color: AppColors.textMuted,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ] else ...[
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppColors.sage.withAlpha(40),
                        border: Border.all(color: AppColors.sage, width: 1.2),
                      ),
                      alignment: Alignment.center,
                      child: GlorovCategorySvgIcons.buildSvgIcon(
                        GlorovCategorySvgIcons.guestUser,
                        size: 22,
                        color: AppColors.forestDark,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Guest Customer',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDark,
                            ),
                          ),
                          Text(
                            'Sign in to access your orders',
                            style: TextStyle(
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
              ],

              const SizedBox(height: AppSpacing.lg),
              const Divider(color: AppColors.borderLight),
              const SizedBox(height: AppSpacing.sm),

              // Account Navigation Items
              _sidebarItem(
                section: GlorovAccountSection.overview,
                icon: Icons.dashboard_outlined,
                label: 'Account Overview',
              ),
              if (accountState.isAuthenticated) ...[
                _sidebarItem(
                  section: GlorovAccountSection.profile,
                  icon: Icons.person_outline,
                  label: 'Customer Profile',
                ),
                _sidebarItem(
                  section: GlorovAccountSection.addresses,
                  icon: Icons.location_on_outlined,
                  label: 'Delivery Addresses',
                  badgeText: '$addressCount',
                ),
                _sidebarActionItem(
                  icon: Icons.local_shipping_outlined,
                  label: 'Order History & Tracking',
                  badgeText: '$ordersCount',
                  onTap: () => Navigator.pushNamed(context, ordersScreenRoute),
                ),
                _sidebarActionItem(
                  icon: Icons.favorite_border,
                  label: 'Saved Wishlist',
                  badgeText: '$wishlistCount',
                  onTap: () =>
                      Navigator.pushNamed(context, bookmarkScreenRoute),
                ),
              ] else ...[
                _sidebarActionItem(
                  icon: Icons.local_shipping_outlined,
                  label: 'Order Live Tracking',
                  onTap: () => Navigator.pushNamed(context, ordersScreenRoute),
                ),
                _sidebarItem(
                  section: GlorovAccountSection.helpCenter,
                  icon: Icons.help_outline,
                  label: 'Help Center & FAQs',
                ),
              ],
              _sidebarItem(
                section: GlorovAccountSection.contactSupport,
                icon: Icons.support_agent_outlined,
                label: 'Customer Care & Support',
              ),

              const SizedBox(height: AppSpacing.sm),
              const Divider(color: AppColors.borderLight),
              const SizedBox(height: AppSpacing.sm),

              _sidebarActionItem(
                icon: accountState.isAuthenticated ? Icons.logout : Icons.login,
                label: accountState.isAuthenticated
                    ? 'Sign Out'
                    : 'Sign In / Register',
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
        );
      },
    );
  }

  Widget _sidebarItem({
    required GlorovAccountSection section,
    required IconData icon,
    required String label,
    String? badgeText,
    bool isBadgeHighlight = false,
  }) {
    final isSelected = _currentSection == section;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: InkWell(
        onTap: () => _navigateToSection(section),
        borderRadius: AppRadii.roundedMd,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.cream : Colors.transparent,
            borderRadius: AppRadii.roundedMd,
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color:
                    isSelected ? AppColors.forestDark : AppColors.textSecondary,
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected
                        ? AppColors.forestDark
                        : AppColors.textPrimary,
                  ),
                ),
              ),
              if (badgeText != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: isBadgeHighlight
                        ? AppColors.forestMedium
                        : AppColors.borderLight,
                    borderRadius: AppRadii.roundedFull,
                  ),
                  child: Text(
                    badgeText,
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: isBadgeHighlight
                          ? Colors.white
                          : AppColors.textSecondary,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sidebarActionItem({
    required IconData icon,
    required String label,
    String? badgeText,
    required VoidCallback onTap,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: InkWell(
        onTap: onTap,
        borderRadius: AppRadii.roundedMd,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Icon(icon, size: 18, color: AppColors.textSecondary),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  label,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              if (badgeText != null)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: const BoxDecoration(
                    color: AppColors.borderLight,
                    borderRadius: AppRadii.roundedFull,
                  ),
                  child: Text(
                    badgeText,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
              const SizedBox(width: 4),
              const Icon(Icons.arrow_outward,
                  size: 12, color: AppColors.textMuted),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActiveSection() {
    switch (_currentSection) {
      case GlorovAccountSection.overview:
        return GlorovAccountOverviewSection(
          onNavigateSection: _navigateToSection,
        );
      case GlorovAccountSection.profile:
        return const GlorovProfileSection();
      case GlorovAccountSection.addresses:
        return const GlorovAddressBookSection();
      case GlorovAccountSection.notifications:
        return const GlorovNotificationsSection();
      case GlorovAccountSection.helpCenter:
        return GlorovHelpFaqSection(
          onNavigateSection: _navigateToSection,
        );
      case GlorovAccountSection.contactSupport:
        return GlorovSupportSection(
          onNavigateSection: _navigateToSection,
        );
      case GlorovAccountSection.settings:
        return GlorovSettingsSection(
          onNavigateSection: _navigateToSection,
        );
    }
  }
}
