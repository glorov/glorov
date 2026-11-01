import '../../models/glorov/glorov_announcement.dart';
import '../contracts/announcement_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa Store API Implementation of AnnouncementRepository
/// Communicates with `/store/announcements` with graceful fallback to botanical defaults.
class MedusaAnnouncementRepository implements AnnouncementRepository {
  final MedusaHttpClient client;

  const MedusaAnnouncementRepository(this.client);

  @override
  Future<List<GlorovAnnouncementItem>> fetchAnnouncements() async {
    try {
      final result = await client.get<List<GlorovAnnouncementItem>>(
        MedusaEndpoints.announcements,
        parser: (json) {
          if (json is Map && json['items'] is List) {
            return (json['items'] as List).map((item) {
              return GlorovAnnouncementItem.fromJson(
                Map<String, dynamic>.from(item as Map),
              );
            }).toList();
          }
          return <GlorovAnnouncementItem>[];
        },
      );

      if (result.isSuccess && result.dataOrNull != null && result.dataOrNull!.isNotEmpty) {
        return result.dataOrNull!;
      }
    } catch (_) {}

    return GlorovAnnouncementItem.defaultItems;
  }

  @override
  Future<GlorovAnnouncementConfig> fetchConfig() async {
    try {
      final result = await client.get<GlorovAnnouncementConfig>(
        MedusaEndpoints.announcements,
        parser: (json) {
          if (json is Map && json['config'] is Map) {
            return GlorovAnnouncementConfig.fromJson(
              Map<String, dynamic>.from(json['config'] as Map),
            );
          }
          return GlorovAnnouncementConfig.defaultConfig;
        },
      );

      if (result.isSuccess && result.dataOrNull != null) {
        return result.dataOrNull!;
      }
    } catch (_) {}

    return GlorovAnnouncementConfig.defaultConfig;
  }
}
