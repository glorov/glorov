import '../../models/glorov/glorov_offer.dart';
import '../contracts/offer_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa Store API Implementation of OfferRepository
/// Communicates with `/store/offers` with fallback to default botanical welcome offer.
class MedusaOfferRepository implements OfferRepository {
  final MedusaHttpClient client;

  const MedusaOfferRepository(this.client);

  @override
  Future<List<GlorovOffer>> fetchOffers() async {
    try {
      final result = await client.get<List<GlorovOffer>>(
        MedusaEndpoints.offers,
        parser: (json) {
          if (json is Map && json['offers'] is List) {
            return (json['offers'] as List).map((item) {
              return GlorovOffer.fromJson(Map<String, dynamic>.from(item as Map));
            }).toList();
          }
          return <GlorovOffer>[];
        },
      );

      if (result.isSuccess && result.dataOrNull != null) {
        return result.dataOrNull!;
      }
    } catch (_) {}

    return const <GlorovOffer>[];
  }

  @override
  Future<GlorovOffer?> fetchHighlightedOffer() async {
    try {
      final result = await client.get<GlorovOffer?>(
        MedusaEndpoints.offers,
        parser: (json) {
          if (json is Map) {
            if (json['welcome_offer'] != null && json['welcome_offer'] is Map) {
              return GlorovOffer.fromJson(
                Map<String, dynamic>.from(json['welcome_offer'] as Map),
              );
            }
            if (json['offers'] is List && (json['offers'] as List).isNotEmpty) {
              return GlorovOffer.fromJson(
                Map<String, dynamic>.from((json['offers'] as List).first as Map),
              );
            }
          }
          return null;
        },
      );

      if (result.isSuccess && result.dataOrNull != null) {
        return result.dataOrNull;
      }
    } catch (_) {}

    return null;
  }
}
