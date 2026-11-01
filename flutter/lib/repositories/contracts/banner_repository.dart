import '../../components/home/glorov_hero_banner_slider.dart';

/// Abstract Carousel Banner Repository Contract
/// Provides access to homepage hero banner slides from Medusa backend or local defaults.
abstract class BannerRepository {
  /// Fetches active carousel banner slides
  Future<List<GlorovBannerSlide>> fetchBanners();
}
