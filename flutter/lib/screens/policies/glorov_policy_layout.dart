import 'package:flutter/material.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../route/route_constants.dart';

/// Available Legal & Trust Policy Tabs
enum GlorovPolicyTab {
  privacy,
  terms,
  shippingAndTrust,
}

/// Shared responsive wrapper for GLOROV Botanical legal and policy documents.
/// Adapts fluidly across mobile (<800px) and desktop (>=800px) viewports with
/// custom breadcrumbs, tab switching, and footer integration.
class GlorovPolicyScaffold extends StatelessWidget {
  final GlorovPolicyTab currentTab;
  final String title;
  final String subtitle;
  final String badgeText;
  final IconData badgeIcon;
  final List<Widget> children;

  const GlorovPolicyScaffold({
    super.key,
    required this.currentTab,
    required this.title,
    required this.subtitle,
    required this.badgeText,
    required this.badgeIcon,
    required this.children,
  });

  void _onSelectTab(BuildContext context, GlorovPolicyTab tab) {
    if (tab == currentTab) return;
    switch (tab) {
      case GlorovPolicyTab.privacy:
        Navigator.pushReplacementNamed(context, privacyPolicyScreenRoute);
        break;
      case GlorovPolicyTab.terms:
        Navigator.pushReplacementNamed(context, termsOfServicesScreenRoute);
        break;
      case GlorovPolicyTab.shippingAndTrust:
        Navigator.pushReplacementNamed(context, shippingAndTrustPolicyScreenRoute);
        break;
    }
  }

  String get _currentRouteName {
    switch (currentTab) {
      case GlorovPolicyTab.privacy:
        return privacyPolicyScreenRoute;
      case GlorovPolicyTab.terms:
        return termsOfServicesScreenRoute;
      case GlorovPolicyTab.shippingAndTrust:
        return shippingAndTrustPolicyScreenRoute;
    }
  }

  @override
  Widget build(BuildContext context) {
    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.surfaceCream,
      currentRoute: _currentRouteName,
      alwaysShowBottomNav: true,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final isDesktop = constraints.maxWidth >= 850.0;
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Breadcrumb Bar
              _buildBreadcrumbs(context, isDesktop: isDesktop),

              // 2. Hero Header Banner (Compact & clean on mobile)
              _buildHeroHeader(context, isDesktop: isDesktop),

              // 3. Main Policy Layout
              Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: AppBreakpoints.maxContentWidth,
                  ),
                  child: Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: isDesktop ? AppSpacing.md : 12.0,
                      vertical: isDesktop ? AppSpacing.xl : 12.0,
                    ),
                    child: isDesktop
                        ? Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Left Sticky Policy Navigation Sidebar
                              SizedBox(
                                width: 260,
                                child: _buildNavigationCard(context),
                              ),
                              const SizedBox(width: AppSpacing.xl),
                              // Right Main Document Content
                              Expanded(
                                child: _buildDocumentArticle(context, isDesktop: true),
                              ),
                            ],
                          )
                        : Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Mobile Policy Tab Selector
                              _buildMobileTabs(context),
                              const SizedBox(height: 10),
                              // Main Document Content
                              _buildDocumentArticle(context, isDesktop: false),
                            ],
                          ),
                  ),
                ),
              ),

              // 4. Footer
              const GlorovFooter(),
            ],
          );
        },
      ),
    );
  }

  Widget _buildBreadcrumbs(BuildContext context, {required bool isDesktop}) {
    return Container(
      width: double.infinity,
      color: Colors.white,
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.md : 12.0,
        vertical: isDesktop ? AppSpacing.sm : 6.0,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Row(
            children: [
              InkWell(
                onTap: () => Navigator.pushNamed(context, homeScreenRoute),
                child: const Text(
                  'Home',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11.5,
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 5),
                child: Text(
                  '/',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: AppColors.borderSubtle,
                  ),
                ),
              ),
              const Text(
                'Policies & Trust',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 11.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 5),
                child: Text(
                  '/',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: AppColors.borderSubtle,
                  ),
                ),
              ),
              Flexible(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11.5,
                    fontWeight: FontWeight.w600,
                    color: AppColors.forestDeep,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeroHeader(BuildContext context, {required bool isDesktop}) {
    return Container(
      width: double.infinity,
      color: AppColors.forestDark,
      padding: EdgeInsets.symmetric(
        horizontal: isDesktop ? AppSpacing.md : 14.0,
        vertical: isDesktop ? AppSpacing.xl : 14.0,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            maxWidth: AppBreakpoints.maxContentWidth,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Badge Pill
              Container(
                padding: EdgeInsets.symmetric(
                  horizontal: isDesktop ? 10 : 8,
                  vertical: isDesktop ? 4 : 3,
                ),
                decoration: BoxDecoration(
                  color: AppColors.sage.withAlpha(50),
                  borderRadius: AppRadii.roundedFull,
                  border: Border.all(
                    color: AppColors.sage.withAlpha(100),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(badgeIcon, size: isDesktop ? 14 : 12, color: AppColors.sage),
                    const SizedBox(width: 5),
                    Flexible(
                      child: Text(
                        badgeText,
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: isDesktop ? 11 : 9.5,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.4,
                          color: Colors.white,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              SizedBox(height: isDesktop ? AppSpacing.sm : 6.0),
              // Main Title
              Text(
                title,
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: isDesktop ? 26 : 18.0,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                  letterSpacing: 0.3,
                  height: 1.25,
                ),
              ),
              SizedBox(height: isDesktop ? AppSpacing.xs : 4.0),
              // Subtitle
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 680),
                child: Text(
                  subtitle,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: isDesktop ? 13.5 : 11.5,
                    height: 1.35,
                    color: Colors.white70,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'GLOROV POLICIES',
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 1.0,
              color: AppColors.textMuted,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          const Divider(color: AppColors.borderLight, height: 1),
          const SizedBox(height: AppSpacing.sm),
          _navItem(
            context,
            tab: GlorovPolicyTab.privacy,
            title: 'Privacy & Data Policy',
            subtitle: 'DPDP 2023 compliance & privacy',
            icon: Icons.lock_outline,
          ),
          const SizedBox(height: 6),
          _navItem(
            context,
            tab: GlorovPolicyTab.terms,
            title: 'Terms of Service',
            subtitle: 'Statutory GST 0% & trademark',
            icon: Icons.gavel_outlined,
          ),
          const SizedBox(height: 6),
          _navItem(
            context,
            tab: GlorovPolicyTab.shippingAndTrust,
            title: 'Shipping & Trust Policy',
            subtitle: 'Safe transit & 48h live guarantee',
            icon: Icons.local_shipping_outlined,
          ),
          const SizedBox(height: AppSpacing.md),
          const Divider(color: AppColors.borderLight, height: 1),
          const SizedBox(height: AppSpacing.md),
          // Botanical Trust Summary Box
          Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: const BoxDecoration(
              color: AppColors.surfaceMuted,
              borderRadius: AppRadii.roundedMd,
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.shield_outlined,
                        size: 16, color: AppColors.forestDeep),
                    SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Live Arrival Guarantee',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.forestDeep,
                        ),
                      ),
                    ),
                  ],
                ),
                SizedBox(height: 4),
                Text(
                  '100% moisture-shield packaging dispatched fresh from Pune Nursery.',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    height: 1.4,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _navItem(
    BuildContext context, {
    required GlorovPolicyTab tab,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    final isSelected = tab == currentTab;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _onSelectTab(context, tab),
        borderRadius: AppRadii.roundedMd,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
          decoration: BoxDecoration(
            color: isSelected
                ? AppColors.forestDeep.withAlpha(15)
                : Colors.transparent,
            borderRadius: AppRadii.roundedMd,
            border: Border.all(
              color: isSelected ? AppColors.forestDeep : Colors.transparent,
              width: 1,
            ),
          ),
          child: Row(
            children: [
              Icon(
                icon,
                size: 18,
                color:
                    isSelected ? AppColors.forestDeep : AppColors.textSecondary,
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
                        fontWeight:
                            isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected
                            ? AppColors.forestDeep
                            : AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 10,
                        color: isSelected
                            ? AppColors.forestMedium
                            : AppColors.textMuted,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMobileTabs(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedMd,
        border: Border.all(color: AppColors.borderLight),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        children: [
          _mobileTabButton(
            context,
            tab: GlorovPolicyTab.privacy,
            label: 'Privacy',
            icon: Icons.lock_outline,
          ),
          _mobileTabButton(
            context,
            tab: GlorovPolicyTab.terms,
            label: 'Terms',
            icon: Icons.gavel_outlined,
          ),
          _mobileTabButton(
            context,
            tab: GlorovPolicyTab.shippingAndTrust,
            label: 'Shipping & Trust',
            icon: Icons.local_shipping_outlined,
          ),
        ],
      ),
    );
  }

  Widget _mobileTabButton(
    BuildContext context, {
    required GlorovPolicyTab tab,
    required String label,
    required IconData icon,
  }) {
    final isSelected = tab == currentTab;
    return Expanded(
      child: GestureDetector(
        onTap: () => _onSelectTab(context, tab),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 2),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.forestDeep : Colors.transparent,
            borderRadius: AppRadii.roundedSm,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 12,
                color: isSelected ? Colors.white : AppColors.textSecondary,
              ),
              const SizedBox(width: 3),
              Flexible(
                child: Text(
                  label,
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 10.5,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDocumentArticle(BuildContext context, {required bool isDesktop}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: isDesktop ? AppRadii.roundedLg : AppRadii.roundedMd,
        border: Border.all(color: AppColors.borderLight),
      ),
      padding: EdgeInsets.all(isDesktop ? AppSpacing.xl : 14.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }
}

/// Reusable Section Card within a Policy Document
class PolicySection extends StatelessWidget {
  final IconData icon;
  final String title;
  final Widget child;

  const PolicySection({
    super.key,
    required this.icon,
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 17, color: AppColors.forestDeep),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDark,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 5),
          child,
        ],
      ),
    );
  }
}

/// Reusable Highlight Callout Box
class PolicyCalloutBox extends StatelessWidget {
  final String title;
  final String text;
  final IconData? icon;

  const PolicyCalloutBox({
    super.key,
    required this.title,
    required this.text,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12.0),
      padding: const EdgeInsets.all(10.0),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F7F4), // subtle soft sage green background
        borderRadius: AppRadii.roundedMd,
        border: Border.all(color: const Color(0xFFD1E3D8)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon ?? Icons.eco,
                size: 15,
                color: AppColors.forestDeep,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            text,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 11.5,
              height: 1.4,
              color: Color(0xFF234433),
            ),
          ),
        ],
      ),
    );
  }
}

/// Bullet list with rich bold prefixes
class PolicyBulletPoint extends StatelessWidget {
  final String label;
  final String description;

  const PolicyBulletPoint({
    super.key,
    required this.label,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            margin: const EdgeInsets.only(top: 5, right: 8),
            width: 4.5,
            height: 4.5,
            decoration: const BoxDecoration(
              color: AppColors.forestDeep,
              shape: BoxShape.circle,
            ),
          ),
          Expanded(
            child: Text.rich(
              TextSpan(
                style: const TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12,
                  height: 1.45,
                  color: AppColors.textSecondary,
                ),
                children: [
                  TextSpan(
                    text: '$label ',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  TextSpan(text: description),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
