import '../../models/glorov/glorov_notification.dart';

/// Abstract Notification Repository Contract
abstract class NotificationRepository {
  Future<List<GlorovNotification>> getNotifications({String? category});
  Future<int> getUnreadCount();
  Future<void> markAsRead(String id);
  Future<void> markAllAsRead();
  Future<void> deleteNotification(String id);
}
