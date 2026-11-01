import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/glorov/glorov_account_settings.dart';
import '../models/glorov/glorov_notification.dart';
import '../models/glorov/glorov_user_profile.dart';
import '../repositories/contracts/account_repository.dart';
import '../repositories/glorov_repositories.dart';
import '../repositories/remote/api_result.dart';
import 'glorov_cart_state.dart';
import 'storage/local_storage.dart';

/// Centralized Customer Account State Management for GLOROV
/// Manages user authentication, profile, notifications, account preferences, support inquiries, and demo resets.
class GlorovAccountState extends ChangeNotifier {
  static final GlorovAccountState instance = GlorovAccountState._internal();

  GlorovUserProfile _profile = GlorovUserProfile.sample;
  List<GlorovNotification> _notifications = [];
  GlorovAccountSettings _settings = GlorovAccountSettings.defaults;
  final List<Map<String, dynamic>> _supportTickets = [];

  GlorovAuthStatus _authStatus = GlorovAuthStatus.initial;
  String? _authError;

  GlorovAccountState._internal() {
    _notifications = GlorovNotification.sampleNotifications;
    _loadFromStorage();
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  GlorovUserProfile get profile => _profile;
  List<GlorovNotification> get notifications =>
      List.unmodifiable(_notifications);
  GlorovAccountSettings get settings => _settings;
  List<Map<String, dynamic>> get supportTickets =>
      List.unmodifiable(_supportTickets);

  GlorovAuthStatus get authStatus => _authStatus;
  bool get isAuthenticated => _authStatus == GlorovAuthStatus.authenticated;
  bool get isLoading => _authStatus == GlorovAuthStatus.authenticating;
  String? get authError => _authError;

  int get unreadNotificationCount =>
      _notifications.where((n) => !n.isRead).length;

  List<GlorovNotification> getNotificationsByCategory(String? categoryName) {
    if (categoryName == null || categoryName == 'All') {
      return _notifications;
    }
    return _notifications.where((n) {
      if (categoryName == 'Orders') {
        return n.category == GlorovNotificationCategory.order;
      } else if (categoryName == 'Gardening Tips') {
        return n.category == GlorovNotificationCategory.gardeningTip;
      } else if (categoryName == 'Wishlist') {
        return n.category == GlorovNotificationCategory.wishlist;
      } else if (categoryName == 'Store News') {
        return n.category == GlorovNotificationCategory.announcement;
      }
      return true;
    }).toList();
  }

  // ---------------------------------------------------------------------------
  // Authentication Actions
  // ---------------------------------------------------------------------------
  Future<ApiResult<GlorovUserProfile>> login(
      String email, String password) async {
    _authStatus = GlorovAuthStatus.authenticating;
    _authError = null;
    notifyListeners();

    final result = await GlorovRepositories.account.login(
      email: email,
      password: password,
    );

    if (result.isSuccess) {
      _profile = result.requireData;
      _authStatus = GlorovAuthStatus.authenticated;
      _authError = null;
      _saveToStorage();
      notifyListeners();
    } else {
      _authStatus = GlorovAuthStatus.error;
      _authError = result.errorOrNull ?? 'Authentication failed';
      notifyListeners();
    }

    return result;
  }

  Future<ApiResult<GlorovUserProfile>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    _authStatus = GlorovAuthStatus.authenticating;
    _authError = null;
    notifyListeners();

    final result = await GlorovRepositories.account.register(
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    );

    if (result.isSuccess) {
      _profile = result.requireData;
      _authStatus = GlorovAuthStatus.authenticated;
      _authError = null;
      _saveToStorage();
      notifyListeners();
    } else {
      _authStatus = GlorovAuthStatus.error;
      _authError = result.errorOrNull ?? 'Registration failed';
      notifyListeners();
    }

    return result;
  }

  Future<void> logout() async {
    await GlorovRepositories.account.logout();
    _authStatus = GlorovAuthStatus.unauthenticated;
    _authError = null;
    _profile = GlorovUserProfile.sample;
    _saveToStorage();
    notifyListeners();
  }

  Future<ApiResult<GlorovUserProfile>> restoreSession() async {
    final result = await GlorovRepositories.account.checkSession();
    if (result.isSuccess) {
      _profile = result.requireData;
      _authStatus = GlorovAuthStatus.authenticated;
      _authError = null;
    } else {
      _authStatus = GlorovAuthStatus.unauthenticated;
    }
    notifyListeners();
    return result;
  }

  Future<ApiResult<void>> requestPasswordReset(String email) async {
    return GlorovRepositories.account.requestPasswordReset(email: email);
  }

  Future<ApiResult<void>> updatePassword(String newPassword) async {
    return GlorovRepositories.account.updatePassword(newPassword: newPassword);
  }

  // ---------------------------------------------------------------------------
  // Profile Actions
  // ---------------------------------------------------------------------------
  void updateProfile(GlorovUserProfile newProfile) {
    _profile = newProfile;
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Notification Actions
  // ---------------------------------------------------------------------------
  void markAsRead(String id) {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1 && !_notifications[index].isRead) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
      _saveToStorage();
      notifyListeners();
    }
  }

  void markAllAsRead() {
    bool changed = false;
    for (int i = 0; i < _notifications.length; i++) {
      if (!_notifications[i].isRead) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
        changed = true;
      }
    }
    if (changed) {
      _saveToStorage();
      notifyListeners();
    }
  }

  void deleteNotification(String id) {
    _notifications.removeWhere((n) => n.id == id);
    _saveToStorage();
    notifyListeners();
  }

  void addNotification(GlorovNotification notification) {
    _notifications.insert(0, notification);
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Settings Actions
  // ---------------------------------------------------------------------------
  void updateSettings(GlorovAccountSettings newSettings) {
    _settings = newSettings;
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Customer Support Inquiries
  // ---------------------------------------------------------------------------
  String submitSupportTicket({
    required String name,
    required String email,
    required String topic,
    String? orderReference,
    required String message,
  }) {
    final ticketId =
        'GLR-SUP-${(DateTime.now().millisecondsSinceEpoch % 9000 + 1000)}';
    final ticket = {
      'id': ticketId,
      'createdAt': DateTime.now().toIso8601String(),
      'name': name,
      'email': email,
      'topic': topic,
      'orderReference': orderReference,
      'message': message,
      'status': 'Simulated - Under Review',
    };
    _supportTickets.insert(0, ticket);

    // Also add an acknowledgment notification
    addNotification(
      GlorovNotification(
        id: 'notif_ticket_${DateTime.now().millisecondsSinceEpoch}',
        title: 'Support Inquiry Acknowledged ($ticketId)',
        message:
            'Your inquiry regarding "$topic" has been received. Our horticultural advisors will review it shortly.',
        timestamp: DateTime.now(),
        category: GlorovNotificationCategory.order,
        isRead: false,
        routeDestination: 'profile',
      ),
    );

    _saveToStorage();
    notifyListeners();
    return ticketId;
  }

  // ---------------------------------------------------------------------------
  // Demo Account Reset
  // ---------------------------------------------------------------------------
  void resetEntireDemoAccount() {
    _profile = GlorovUserProfile.sample;
    _notifications = GlorovNotification.sampleNotifications;
    _settings = GlorovAccountSettings.defaults;
    _supportTickets.clear();
    _authStatus = GlorovAuthStatus.unauthenticated;
    _authError = null;

    // Reset shopping state as well
    GlorovCartState.instance.resetDemoData();

    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Local Storage Persistence
  // ---------------------------------------------------------------------------
  void _saveToStorage() {
    try {
      final storage = GlorovLocalStorage.instance;

      // 1. Profile
      storage.setItem('glorov_profile', jsonEncode(_profile.toJson()));

      // 2. Notifications
      final notifsJson = _notifications.map((n) => n.toJson()).toList();
      storage.setItem('glorov_notifications', jsonEncode(notifsJson));

      // 3. Settings
      storage.setItem('glorov_settings', jsonEncode(_settings.toJson()));

      // 4. Support Tickets
      storage.setItem('glorov_support_tickets', jsonEncode(_supportTickets));
    } catch (e) {
      debugPrint('Error saving account state to storage: $e');
    }
  }

  void _loadFromStorage() {
    try {
      final storage = GlorovLocalStorage.instance;

      // 1. Restore Profile
      final profileRaw = storage.getItem('glorov_profile');
      if (profileRaw != null && profileRaw.isNotEmpty) {
        _profile = GlorovUserProfile.fromJson(
            jsonDecode(profileRaw) as Map<String, dynamic>);
      }

      // 2. Restore Notifications
      final notifsRaw = storage.getItem('glorov_notifications');
      if (notifsRaw != null && notifsRaw.isNotEmpty) {
        final list = jsonDecode(notifsRaw) as List<dynamic>;
        _notifications = list
            .map((e) => GlorovNotification.fromJson(e as Map<String, dynamic>))
            .toList();
      }

      // 3. Restore Settings
      final settingsRaw = storage.getItem('glorov_settings');
      if (settingsRaw != null && settingsRaw.isNotEmpty) {
        _settings = GlorovAccountSettings.fromJson(
            jsonDecode(settingsRaw) as Map<String, dynamic>);
      }

      // 4. Restore Tickets
      final ticketsRaw = storage.getItem('glorov_support_tickets');
      if (ticketsRaw != null && ticketsRaw.isNotEmpty) {
        final list = jsonDecode(ticketsRaw) as List<dynamic>;
        _supportTickets.clear();
        for (final item in list) {
          if (item is Map<String, dynamic>) {
            _supportTickets.add(item);
          }
        }
      }

      // 5. Check Token
      final token = storage.getItem('glorov_customer_token');
      if (token != null && token.isNotEmpty) {
        _authStatus = GlorovAuthStatus.authenticated;
      } else {
        _authStatus = GlorovAuthStatus.unauthenticated;
      }
    } catch (e) {
      debugPrint('Error loading account state from storage: $e');
    }
  }
}
