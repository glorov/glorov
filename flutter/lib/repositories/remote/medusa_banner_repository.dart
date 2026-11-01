import 'dart:ui';
import '../../components/home/glorov_hero_banner_slider.dart';
import '../../route/route_constants.dart';
import '../contracts/banner_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa Store API Implementation of BannerRepository
/// Fetches active promotional carousel banners from `/store/banners`
/// with graceful fallback to default botanical campaign slides.
class MedusaBannerRepository implements BannerRepository {
  final MedusaHttpClient client;

  const MedusaBannerRepository(this.client);

  @override
  Future<List<GlorovBannerSlide>> fetchBanners() async {
    try {
      final result = await client.get<List<GlorovBannerSlide>>(
        MedusaEndpoints.banners,
        parser: (json) {
          if (json is Map && json['banners'] is List) {
            return (json['banners'] as List).map((item) {
              final map = item as Map<String, dynamic>;
              final ctaRoute = (map['cta_route'] as String?) ?? discoverScreenRoute;
              final desktopUrl = (map['desktop_image_url'] as String?) ?? '';
              final mobileUrl = (map['mobile_image_url'] as String?) ?? desktopUrl;

              // Convert relative /banners/... path to full endpoint if needed
              final resolvedDesktopUrl = desktopUrl.startsWith('http') || desktopUrl.startsWith('assets/')
                  ? desktopUrl
                  : 'assets/images/${desktopUrl.split('/').last}';
              final resolvedMobileUrl = mobileUrl.startsWith('http') || mobileUrl.startsWith('assets/')
                  ? mobileUrl
                  : 'assets/images/${mobileUrl.split('/').last}';

              Color parseColor(String? hex) {
                if (hex == null || hex.isEmpty) return const Color(0xFF1E3D2F);
                final clean = hex.replaceAll('#', '');
                return Color(int.parse('FF$clean', radix: 16));
              }

              return GlorovBannerSlide(
                id: map['id']?.toString() ?? 'banner_${DateTime.now().millisecondsSinceEpoch}',
                title: map['title']?.toString() ?? '',
                subtitle: map['subtitle']?.toString() ?? '',
                tag: map['tag']?.toString() ?? 'GROW WITH GLOROV',
                desktopImageUrl: resolvedDesktopUrl,
                mobileImageUrl: resolvedMobileUrl,
                ctaText: map['cta_text']?.toString() ?? 'SHOP NOW',
                ctaRoute: ctaRoute,
                ctaArguments: map['cta_arguments'],
                backgroundColor: parseColor(map['bg_color']?.toString()),
                isImageOnly: true,
              );
            }).toList();
          }
          return <GlorovBannerSlide>[];
        },
      );

      if (result.isSuccess && result.dataOrNull != null && result.dataOrNull!.isNotEmpty) {
        return result.dataOrNull!;
      }
    } catch (_) {
      // Fall through to fallback
    }

    return GlorovHeroBannerSlider.defaultBotanicalSlides;
  }
}
