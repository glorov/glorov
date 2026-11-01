import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../route/route_constants.dart';

/// GLOROV Premium Storefront Footer
class GlorovFooter extends StatelessWidget {
  const GlorovFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isDesktop = constraints.maxWidth >= 900.0;
        final verticalPadding = isDesktop ? AppSpacing.xxl : 16.0;
        final horizontalPadding = isDesktop ? AppSpacing.xl : 16.0;

        return Container(
          width: double.infinity,
          color: AppColors.forestDark,
          padding: EdgeInsets.symmetric(
            horizontal: horizontalPadding,
            vertical: verticalPadding,
          ),
          child: Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(
                maxWidth: AppBreakpoints.maxContentWidth,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Main Footer Content
                  if (isDesktop)
                    _buildDesktopFooter(context)
                  else
                    _buildMobileFooter(context),

                  SizedBox(height: isDesktop ? AppSpacing.xxl : 14.0),
                  const Divider(color: Colors.white12, height: 1),
                  SizedBox(height: isDesktop ? AppSpacing.lg : 10.0),

                  // Bottom Bar
                  if (isDesktop)
                    _buildDesktopBottomBar(context)
                  else
                    _buildMobileBottomBar(context),

                  // Safe bottom clearance on mobile to prevent bottom nav overlap
                  if (!isDesktop) const SizedBox(height: 52),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildDesktopBottomBar(BuildContext context) {
    return Wrap(
      alignment: WrapAlignment.spaceBetween,
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.sm,
      children: [
        const Text(
          '© 2026 GLOROV Botanical E-Commerce. All rights reserved.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 12,
            color: Colors.white54,
          ),
        ),
        Wrap(
          spacing: AppSpacing.md,
          children: [
            _footerLink(
                context, 'Privacy Policy', privacyPolicyScreenRoute),
            _footerLink(
                context, 'Terms & Conditions', termsOfServicesScreenRoute),
            _footerLink(context, 'Shipping & Transit Policy',
                shippingAndTrustPolicyScreenRoute),
          ],
        ),
      ],
    );
  }

  Widget _buildMobileBottomBar(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Wrap(
          alignment: WrapAlignment.center,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 6,
          runSpacing: 4,
          children: [
            _footerLink(
                context, 'Privacy Policy', privacyPolicyScreenRoute),
            const Text('•',
                style: TextStyle(color: Colors.white24, fontSize: 10)),
            _footerLink(
                context, 'Terms & Conditions', termsOfServicesScreenRoute),
            const Text('•',
                style: TextStyle(color: Colors.white24, fontSize: 10)),
            _footerLink(context, 'Shipping & Transit Policy',
                shippingAndTrustPolicyScreenRoute),
          ],
        ),
        const SizedBox(height: 6),
        const Text(
          '© 2026 GLOROV Botanical E-Commerce. All rights reserved.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 10.5,
            color: Colors.white38,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildDesktopFooter(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Brand & Mission Column (35%)
        Expanded(
          flex: 4,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SvgPicture.asset(
                'assets/logo/glorov-logo.svg',
                height: 32,
                colorFilter: const ColorFilter.mode(
                  Colors.white,
                  BlendMode.srcIn,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const Text(
                'Grow More. Live Greener.\nGLOROV is an organic seed sanctuary and live plant nursery dedicated to bringing vibrant botanical sanctuaries into homes and gardens across India.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.6,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              const Row(
                children: [
                  Icon(Icons.shield_outlined, color: AppColors.sage, size: 18),
                  SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      'Certified Organic • 100% Non-GMO',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.xl),

        // Categories Column
        Expanded(
          flex: 2,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _columnHeader('Collections'),
              const SizedBox(height: AppSpacing.md),
              _footerNavLink(context, 'Vegetable Seeds', discoverScreenRoute),
              _footerNavLink(
                  context, 'Heirloom Flower Seeds', discoverScreenRoute),
              _footerNavLink(
                  context, 'Indoor Houseplants', discoverScreenRoute),
              _footerNavLink(
                  context, 'Culinary Herb Seeds', discoverScreenRoute),
              _footerNavLink(
                  context, 'Terracotta Planters', discoverScreenRoute),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.lg),

        // Support Column
        Expanded(
          flex: 2,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _columnHeader('Growing Support'),
              const SizedBox(height: AppSpacing.md),
              _footerNavLink(
                  context, 'Frequently Asked Questions', faqScreenRoute),
              _footerNavLink(context, 'Seed Sowing Guides', faqScreenRoute),
              _footerNavLink(
                  context, 'Plant Care & Transit Shield', shippingAndTrustPolicyScreenRoute),
              _footerNavLink(
                  context, 'Track Plant Delivery', ordersScreenRoute),
              _footerNavLink(
                  context, 'Contact Support', contactSupportScreenRoute),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.lg),

        // Newsletter Column
        Expanded(
          flex: 3,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _columnHeader('Join the Growing Club'),
              const SizedBox(height: AppSpacing.sm),
              const Text(
                'Receive weekly botanical care guides, seasonal planting calendars, and member-exclusive cultivar launches.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 12,
                  height: 1.5,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  const Expanded(
                    child: SizedBox(
                      height: 40,
                      child: TextField(
                        style: TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'Enter your email',
                          hintStyle: TextStyle(
                            color: Colors.white38,
                            fontSize: 12,
                          ),
                          filled: true,
                          fillColor: Colors.white12,
                          contentPadding: EdgeInsets.symmetric(horizontal: 12),
                          border: OutlineInputBorder(
                            borderRadius: AppRadii.roundedMd,
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                              'Thank you for joining the GLOROV Growing Club!'),
                          behavior: SnackBarBehavior.floating,
                          backgroundColor: AppColors.forestDeep,
                        ),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.sage,
                      foregroundColor: AppColors.forestDark,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      minimumSize: const Size(40, 40),
                      shape: const RoundedRectangleBorder(
                        borderRadius: AppRadii.roundedMd,
                      ),
                    ),
                    child: const Text(
                      'Join',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMobileFooter(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Brand Header (Compact Row with Logo & Slogan)
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SvgPicture.asset(
              'assets/logo/glorov-logo.svg',
              height: 20,
              colorFilter: const ColorFilter.mode(
                Colors.white,
                BlendMode.srcIn,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 5,
              height: 5,
              decoration: const BoxDecoration(
                color: AppColors.sage,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            const Expanded(
              child: Text(
                'Grow More. Live Greener.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.sage,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        const SizedBox(height: 5),
        const Text(
          'Certified organic seeds & safe live plant delivery across India.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 11,
            height: 1.35,
            color: Colors.white70,
          ),
        ),

        const SizedBox(height: 12),

        // Compact 2-Column Links Grid (Takes half vertical space)
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Column 1: Popular Collections
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _columnHeader('Collections', fontSize: 12.0),
                  const SizedBox(height: 4),
                  _footerNavLink(
                      context, 'Vegetable Seeds', discoverScreenRoute,
                      fontSize: 11.5),
                  _footerNavLink(
                      context, 'Flower Seeds', discoverScreenRoute,
                      fontSize: 11.5),
                  _footerNavLink(
                      context, 'Live Houseplants', discoverScreenRoute,
                      fontSize: 11.5),
                  _footerNavLink(
                      context, 'Gardening Care', discoverScreenRoute,
                      fontSize: 11.5),
                ],
              ),
            ),
            const SizedBox(width: 14),
            // Column 2: Growing Support
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _columnHeader('Growing Support', fontSize: 12.0),
                  const SizedBox(height: 4),
                  _footerNavLink(
                      context, 'Help & FAQs', faqScreenRoute,
                      fontSize: 11.5),
                  _footerNavLink(context, 'Plant Care & Transit',
                      shippingAndTrustPolicyScreenRoute,
                      fontSize: 11.5),
                  _footerNavLink(
                      context, 'Track Delivery', ordersScreenRoute,
                      fontSize: 11.5),
                  _footerNavLink(
                      context, 'Contact Support', contactSupportScreenRoute,
                      fontSize: 11.5),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _columnHeader(String title, {double fontSize = 14.0}) {
    return Text(
      title,
      style: TextStyle(
        fontFamily: AppTypography.primaryFont,
        fontSize: fontSize,
        fontWeight: FontWeight.w700,
        letterSpacing: 0.4,
        color: Colors.white,
      ),
    );
  }

  Widget _footerNavLink(BuildContext context, String title, String route,
      {double fontSize = 13.0}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.5),
      child: InkWell(
        onTap: () => Navigator.pushNamed(context, route),
        child: Text(
          title,
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: fontSize,
            color: Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _footerLink(BuildContext context, String title, String route) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, route),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: Text(
          title,
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 11,
            color: Colors.white70,
            decoration: TextDecoration.underline,
            decorationColor: Colors.white24,
          ),
        ),
      ),
    );
  }
}
