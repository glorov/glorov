import '../../models/glorov/glorov_hero_data.dart';
import '../contracts/hero_repository.dart';

/// Local Fallback implementation of HeroRepository
/// Returns the canonical botanical hero showcase configuration.
class LocalHeroRepository implements HeroRepository {
  const LocalHeroRepository();

  @override
  Future<GlorovHeroData> fetchHeroData() async {
    return GlorovHeroData.defaultData;
  }
}
