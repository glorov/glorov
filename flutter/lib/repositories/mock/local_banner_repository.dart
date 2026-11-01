import '../../components/home/glorov_hero_banner_slider.dart';
import '../contracts/banner_repository.dart';

/// Local Fallback Implementation of BannerRepository
/// Returns the default 4 botanical campaign carousel slides.
class LocalBannerRepository implements BannerRepository {
  const LocalBannerRepository();

  @override
  Future<List<GlorovBannerSlide>> fetchBanners() async {
    return GlorovHeroBannerSlider.defaultBotanicalSlides;
  }
}
