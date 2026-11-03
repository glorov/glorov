import '../../models/glorov/glorov_trust_badge.dart';
import '../contracts/trust_badge_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Fetches active trust badges and green theme settings from Medusa backend (`/store/trust-badges`)
class MedusaTrustBadgeRepository implements TrustBadgeRepository {
  final MedusaHttpClient client;

  const MedusaTrustBadgeRepository(this.client);

  @override
  Future<GlorovTrustBadgeResponse> fetchTrustBadges() async {
    try {
      final res = await client.get(
        MedusaEndpoints.trustBadges,
        parser: (json) {
          if (json is Map<String, dynamic>) {
            final rawBadges = json['badges'] as List<dynamic>? ?? [];
            final rawSettings = json['settings'] as Map<String, dynamic>? ?? {};

            final badges = rawBadges
                .map((item) =>
                    GlorovTrustBadgeItem.fromJson(item as Map<String, dynamic>))
                .toList();

            final settings = GlorovTrustSectionSettings.fromJson(rawSettings);

            return GlorovTrustBadgeResponse(badges: badges, settings: settings);
          }
          return const GlorovTrustBadgeResponse(
            badges: [],
            settings: GlorovTrustSectionSettings(),
          );
        },
      );

      if (res.isSuccess && res.data != null) {
        return res.data!;
      }
    } catch (_) {
      // Empty fallback
    }

    return const GlorovTrustBadgeResponse(
      badges: [],
      settings: GlorovTrustSectionSettings(),
    );
  }
}
