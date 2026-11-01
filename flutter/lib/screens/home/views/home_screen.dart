import 'package:flutter/material.dart';
import '../../../components/home/glorov_category_discovery.dart';
import '../../../components/home/glorov_featured_products.dart';
import '../../../components/home/glorov_hero_banner_slider.dart';
import '../../../components/home/glorov_hero_section.dart';
import '../../../components/home/glorov_value_props.dart';
import '../../../components/navigation/glorov_footer.dart';
import '../../../components/navigation/glorov_storefront_scaffold.dart';
import '../../../core/theme/app_colors.dart';
import '../../../route/route_constants.dart';

/// GLOROV Storefront Homepage
/// Premium seed, plant, and garden storefront featuring announcement bar,
/// true fixed/sticky floating header (slides up on scroll down, opens on scroll up),
/// promotional hero banner slider (distinct mobile & desktop image assets),
/// botanical value props, category discovery, featured products,
/// comprehensive footer, and 4-item mobile bottom navigation dock.
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovStorefrontScaffold(
      currentRoute: homeScreenRoute,
      backgroundColor: AppColors.surfaceCream,
      child: Column(
        children: [
          // 1. Multi-device Hero Banner Slider (Distinct Desktop/Mobile Images)
          GlorovHeroBannerSlider(),

          // 2. Trust Badges & Botanical Value Props
          GlorovValueProps(),

          // 3. Category Discovery
          GlorovCategoryDiscovery(),

          // 4. Featured Botanical Products (with live cart & wishlist actions)
          GlorovFeaturedProducts(),

          // 5. Editorial Botanical Showcase
          GlorovHeroSection(),

          // 6. Storefront Footer
          GlorovFooter(),
        ],
      ),
    );
  }
}
