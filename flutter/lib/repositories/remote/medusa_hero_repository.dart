import '../../models/glorov/glorov_hero_data.dart';
import '../contracts/hero_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa Store API Implementation of HeroRepository
/// Fetches active botanical hero configuration from `/store/hero`
/// with graceful fallback to default botanical data.
class MedusaHeroRepository implements HeroRepository {
  final MedusaHttpClient client;

  const MedusaHeroRepository(this.client);

  @override
  Future<GlorovHeroData> fetchHeroData() async {
    try {
      final result = await client.get<GlorovHeroData>(
        MedusaEndpoints.hero,
        parser: (json) {
          if (json is Map && json['hero'] is Map) {
            return GlorovHeroData.fromJson(
                json['hero'] as Map<String, dynamic>);
          }
          if (json is Map<String, dynamic>) {
            return GlorovHeroData.fromJson(json);
          }
          return GlorovHeroData.defaultData;
        },
      );

      if (result.isSuccess && result.dataOrNull != null) {
        return result.dataOrNull!;
      }
    } catch (_) {
      // Fall through to default
    }

    return GlorovHeroData.defaultData;
  }
}
