import '../../models/glorov/glorov_hero_data.dart';

/// Contract for fetching and managing GLOROV Botanical Hero data
abstract class HeroRepository {
  /// Fetches the active hero showcase configuration
  Future<GlorovHeroData> fetchHeroData();
}
