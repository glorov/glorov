import '../../models/glorov/glorov_trust_badge.dart';

class GlorovTrustBadgeResponse {
  final List<GlorovTrustBadgeItem> badges;
  final GlorovTrustSectionSettings settings;

  const GlorovTrustBadgeResponse({
    required this.badges,
    required this.settings,
  });
}

abstract class TrustBadgeRepository {
  Future<GlorovTrustBadgeResponse> fetchTrustBadges();
}
