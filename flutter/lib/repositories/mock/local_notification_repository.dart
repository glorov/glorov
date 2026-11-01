import '../../models/glorov/glorov_notification.dart';
import '../../services/glorov_account_state.dart';
import '../contracts/notification_repository.dart';

/// Local Storage / In-Memory implementation of NotificationRepository
class LocalNotificationRepository implements NotificationRepository {
  final GlorovAccountState _accountState;

  LocalNotificationRepository([GlorovAccountState? accountState])
      : _accountState = accountState ?? GlorovAccountState.instance;

  @override
  Future<List<GlorovNotification>> getNotifications({String? category}) async {
    return _accountState.getNotificationsByCategory(category);
  }

  @override
  Future<int> getUnreadCount() async {
    return _accountState.unreadNotificationCount;
  }

  @override
  Future<void> markAsRead(String id) async {
    _accountState.markAsRead(id);
  }

  @override
  Future<void> markAllAsRead() async {
    _accountState.markAllAsRead();
  }

  @override
  Future<void> deleteNotification(String id) async {
    _accountState.deleteNotification(id);
  }
}
