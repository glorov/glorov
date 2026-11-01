import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/glorov_header_scroll_notifier.dart';

/// GLOROV Mobile Navigation Drawer
/// Displays botanical categories and customer shortcuts when opened from
/// the mobile header menu or the mobile bottom navigation bar.
class GlorovDrawer extends StatelessWidget {
  const GlorovDrawer({super.key});

  static const List<Map<String, dynamic>> _botanicalCategories = [
    {
      'label': 'Seeds',
      'icon': Icons.eco_outlined,
      'filter': 'Seeds',
      'route': seedsScreenRoute,
      'subtitle': 'Heirloom & organic non-GMO seeds',
    },
    {
      'label': 'Live Plants',
      'icon': Icons.yard_outlined,
      'filter': 'Live Plants',
      'route': livePlantsScreenRoute,
      'subtitle': 'Acclimatized indoor & outdoor plants',
    },
    {
      'label': 'Planters',
      'icon': Icons.inventory_2_outlined,
      'filter': 'Planters & Pots',
      'route': plantersScreenRoute,
      'subtitle': 'Ceramic, terracotta & self-watering',
    },
    {
      'label': 'Plant Care',
      'icon': Icons.water_drop_outlined,
      'filter': 'Plant Care & Soil',
      'route': plantCareScreenRoute,
      'subtitle': 'Organic fertilizers & potting mixes',
    },
    {
      'label': 'Flowering',
      'icon': Icons.local_florist_outlined,
      'filter': 'Flowering Plants',
      'route': floweringScreenRoute,
      'subtitle': 'Seasonal blooms & perennials',
    },
    {
      'label': 'Herbs',
      'icon': Icons.grass_outlined,
      'filter': 'Fruit & Herb Seeds',
      'route': herbsScreenRoute,
      'subtitle': 'Aromatic kitchen culinary herbs',
    },
    {
      'label': 'Vegetables',
      'icon': Icons.agriculture_outlined,
      'filter': 'Vegetable Seeds',
      'route': vegetablesScreenRoute,
      'subtitle': 'Farm-fresh kitchen garden staples',
    },
    {
      'label': 'Offers',
      'icon': Icons.percent_outlined,
      'filter': 'Offers',
      'route': offersScreenRoute,
      'subtitle': 'Exclusive botanical bundles & deals',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: AppColors.surfacePure,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drawer Header
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.md,
              ),
              child: Row(
                children: [
                  SvgPicture.asset(
                    'assets/logo/glorov-logo.svg',
                    height: 28,
                    fit: BoxFit.contain,
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textPrimary),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            const Divider(color: AppColors.borderSubtle, height: 1),

            // Navigation Links
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                children: [
                  _drawerItem(
                    context,
                    icon: Icons.home_outlined,
                    label: 'Storefront Home',
                    route: homeScreenRoute,
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.storefront_outlined,
                    label: 'All Products (Catalog)',
                    route: discoverScreenRoute,
                  ),

                  const Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: AppSpacing.xs,
                    ),
                    child: Divider(color: AppColors.borderSubtle),
                  ),

                  // Botanical Categories Section Header
                  const Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: 6,
                    ),
                    child: Text(
                      'BOTANICAL CATEGORIES',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                  ),

                  // 8 Categories
                  ..._botanicalCategories.map((cat) {
                    return ListTile(
                      dense: true,
                      leading: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0FDF4),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          cat['icon'] as IconData,
                          size: 18,
                          color: AppColors.forestDeep,
                        ),
                      ),
                      title: Text(
                        cat['label'] as String,
                        style: const TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13.5,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      subtitle: Text(
                        cat['subtitle'] as String,
                        style: const TextStyle(
                          fontSize: 11,
                          color: Color(0xFF9CA3AF),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      trailing: const Icon(
                        Icons.chevron_right,
                        size: 18,
                        color: Color(0xFF9CA3AF),
                      ),
                      onTap: () {
                        Navigator.pop(context);
                        GlorovHeaderScrollNotifier.instance.selectCategory(cat['label'] as String);
                        Navigator.pushNamed(
                          context,
                          cat['route'] as String,
                          arguments: cat['filter'] as String,
                        );
                      },
                    );
                  }),

                  const Padding(
                    padding: EdgeInsets.symmetric(
                      horizontal: AppSpacing.lg,
                      vertical: AppSpacing.xs,
                    ),
                    child: Divider(color: AppColors.borderSubtle),
                  ),

                  _drawerItem(
                    context,
                    icon: Icons.bookmark_border,
                    label: 'Saved Wishlist',
                    route: bookmarkScreenRoute,
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.shopping_bag_outlined,
                    label: 'Shopping Cart',
                    route: cartScreenRoute,
                    trailing: ListenableBuilder(
                      listenable: GlorovCartState.instance,
                      builder: (context, _) {
                        final count = GlorovCartState.instance.itemCount;
                        if (count == 0) return const SizedBox.shrink();
                        return Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: const BoxDecoration(
                            color: AppColors.forestDeep, // Match GLOROV theme
                            borderRadius: AppRadii.roundedFull,
                          ),
                          child: Text(
                            '$count',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.person_outline,
                    label: 'My Account',
                    route: profileScreenRoute,
                  ),
                  _drawerItem(
                    context,
                    icon: Icons.local_shipping_outlined,
                    label: 'Track Orders',
                    route: ordersScreenRoute,
                  ),
                ],
              ),
            ),

            // Drawer Footer
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              color: AppColors.surfaceMuted,
              child: const Row(
                children: [
                  Icon(Icons.shield_outlined,
                      size: 20, color: AppColors.forestDeep),
                  SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: Text(
                      '100% Guaranteed Safe Live Plant Delivery Across India',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String route,
    Widget? trailing,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textPrimary, size: 22),
      title: Text(
        label,
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: AppColors.textPrimary,
        ),
      ),
      trailing: trailing ??
          const Icon(Icons.chevron_right,
              size: 18, color: AppColors.textDisabled),
      onTap: () {
        Navigator.pop(context);
        Navigator.pushNamed(context, route);
      },
    );
  }
}
