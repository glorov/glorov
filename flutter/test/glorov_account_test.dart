import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_user_profile.dart';
import 'package:shop/services/glorov_account_state.dart';

void main() {
  setUp(() {
    GlorovAccountState.instance.resetEntireDemoAccount();
  });

  group('GlorovAccountState & Profile Validation', () {
    test('Profile validation catches invalid inputs correctly', () {
      expect(GlorovUserProfile.validateName(''), isNotNull);
      expect(GlorovUserProfile.validateName('A'), isNotNull);
      expect(GlorovUserProfile.validateName('Ananya'), isNull);

      expect(GlorovUserProfile.validateEmail('invalid-email'), isNotNull);
      expect(GlorovUserProfile.validateEmail('ananya@example'), isNotNull);
      expect(GlorovUserProfile.validateEmail('ananya@example.com'), isNull);

      expect(GlorovUserProfile.validatePhone('123'), isNotNull);
      expect(GlorovUserProfile.validatePhone('1234567890'),
          isNotNull); // doesn't start with 6-9
      expect(GlorovUserProfile.validatePhone('9876543210'), isNull);
    });

    test('Updating profile persists to state', () {
      final state = GlorovAccountState.instance;
      final updated = state.profile.copyWith(
        displayName: 'Vikram Mehta',
        email: 'vikram.mehta@example.com',
      );

      state.updateProfile(updated);
      expect(state.profile.displayName, 'Vikram Mehta');
      expect(state.profile.email, 'vikram.mehta@example.com');
      expect(state.profile.initials, 'VM');
    });

    test('Notification center marks as read and computes unread count', () {
      final state = GlorovAccountState.instance;
      expect(state.notifications, isNotEmpty);
      final initialUnread = state.unreadNotificationCount;
      expect(initialUnread > 0, isTrue);

      final unreadId = state.notifications.firstWhere((n) => !n.isRead).id;
      state.markAsRead(unreadId);
      expect(state.unreadNotificationCount, initialUnread - 1);

      state.markAllAsRead();
      expect(state.unreadNotificationCount, 0);
    });

    test('Support ticket submission generates reference ID and posts alert',
        () {
      final state = GlorovAccountState.instance;
      final beforeTickets = state.supportTickets.length;

      final ticketId = state.submitSupportTicket(
        name: 'Ananya Sharma',
        email: 'ananya@example.com',
        topic: 'Live Plant Health & Care Advice',
        orderReference: 'GLR-ORD-2026-8812',
        message: 'My Monstera leaves have slight yellowing after transit.',
      );

      expect(ticketId, startsWith('GLR-SUP-'));
      expect(state.supportTickets.length, beforeTickets + 1);

      // Notification should be added
      expect(
          state.notifications.any((n) => n.title.contains(ticketId)), isTrue);
    });
  });
}
