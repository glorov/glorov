import '../../models/glorov/glorov_announcement.dart';

/// Contract for fetching announcement bar settings and marquee ticker messages.
abstract class AnnouncementRepository {
  /// Fetches all active announcement ticker items.
  Future<List<GlorovAnnouncementItem>> fetchAnnouncements();

  /// Fetches global announcement bar configuration (enabled, speed, colors).
  Future<GlorovAnnouncementConfig> fetchConfig();
}
