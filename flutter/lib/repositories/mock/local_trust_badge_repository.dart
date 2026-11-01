import '../../models/glorov/glorov_trust_badge.dart';
import '../contracts/trust_badge_repository.dart';

class LocalTrustBadgeRepository implements TrustBadgeRepository {
  final List<GlorovTrustBadgeItem> _badges;
  final GlorovTrustSectionSettings _settings;

  LocalTrustBadgeRepository({
    List<GlorovTrustBadgeItem>? badges,
    GlorovTrustSectionSettings? settings,
  })  : _badges = badges ?? GlorovTrustBadgeItem.defaults,
        _settings = settings ?? const GlorovTrustSectionSettings();

  @override
  Future<GlorovTrustBadgeResponse> fetchTrustBadges() async {
    return GlorovTrustBadgeResponse(
      badges: _badges.where((b) => b.isActive).toList(),
      settings: _settings,
    );
  }
}
