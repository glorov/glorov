import '../../models/glorov/glorov_announcement.dart';
import '../contracts/announcement_repository.dart';

/// In-memory mock implementation of AnnouncementRepository for testing and offline development.
class LocalAnnouncementRepository implements AnnouncementRepository {
  final List<GlorovAnnouncementItem> _items;
  final GlorovAnnouncementConfig _config;

  LocalAnnouncementRepository({
    List<GlorovAnnouncementItem>? initialItems,
    GlorovAnnouncementConfig? initialConfig,
  })  : _items = initialItems ?? GlorovAnnouncementItem.defaultItems,
        _config = initialConfig ?? GlorovAnnouncementConfig.defaultConfig;

  @override
  Future<List<GlorovAnnouncementItem>> fetchAnnouncements() async {
    return _items.where((i) => i.isActive).toList()
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
  }

  @override
  Future<GlorovAnnouncementConfig> fetchConfig() async {
    return _config;
  }
}
