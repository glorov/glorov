import '../../models/glorov/glorov_offer.dart';

/// Contract for fetching botanical promotional offers and the featured welcome offer.
abstract class OfferRepository {
  /// Fetches all active promotional offers.
  Future<List<GlorovOffer>> fetchOffers();

  /// Fetches the primary featured/highlighted offer for the homepage offer banner.
  Future<GlorovOffer?> fetchHighlightedOffer();
}
