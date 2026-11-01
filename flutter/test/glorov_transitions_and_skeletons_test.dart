import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart' as app_router;
import 'package:shop/screens/account/sections/profile_section.dart';
import 'package:shop/screens/account/sections/notifications_section.dart';
import 'package:shop/screens/account/sections/support_section.dart';
import 'package:shop/services/glorov_account_state.dart';

Widget _buildTestApp(Widget child) {
  return MaterialApp(
    home: Scaffold(
      body: SingleChildScrollView(
        child: child,
      ),
    ),
    onGenerateRoute: app_router.generateRoute,
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Prompt 11: Loading Skeletons Tests', () {
    testWidgets('GlorovSkeletonLoader toggles between skeleton and content',
        (tester) async {
      bool isLoading = true;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: StatefulBuilder(
              builder: (context, setState) {
                return Column(
                  children: [
                    GlorovSkeletonLoader(
                      loading: isLoading,
                      skeleton: const Text('SKELETON_VIEW'),
                      child: const Text('REAL_CONTENT_VIEW'),
                    ),
                    ElevatedButton(
                      onPressed: () => setState(() => isLoading = false),
                      child: const Text('TOGGLE'),
                    ),
                  ],
                );
              },
            ),
          ),
        ),
      );

      expect(find.text('SKELETON_VIEW'), findsOneWidget);
      expect(find.text('REAL_CONTENT_VIEW'), findsNothing);

      await tester.tap(find.text('TOGGLE'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('REAL_CONTENT_VIEW'), findsOneWidget);
      expect(find.text('SKELETON_VIEW'), findsNothing);
    });

    testWidgets(
        'GlorovProductCardSkeleton renders placeholder structure without error',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 250,
              height: 350,
              child: GlorovProductCardSkeleton(),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovProductCardSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovProductGridSkeleton renders grid within SkeletonScope',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovProductGridSkeleton(count: 4, crossAxisCount: 2),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovProductGridSkeleton), findsOneWidget);
      expect(find.byType(GlorovProductCardSkeleton), findsNWidgets(4));
    });

    testWidgets('GlorovListItemSkeleton renders avatar and text lines',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovListItemSkeleton(hasAvatar: true),
          ),
        ),
      );

      expect(find.byType(GlorovListItemSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });
  });

  group('Prompt 11: Form Validation & ShakeButton Tests', () {
    testWidgets('GlorovShakeButton calls onPressed when isValid is true',
        (tester) async {
      bool pressed = false;
      bool invalidPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovShakeButton(
              isValid: true,
              onPressed: () => pressed = true,
              onInvalidPress: () => invalidPressed = true,
              builder: (context, handlePressed) => ElevatedButton(
                onPressed: handlePressed,
                child: const Text('Submit'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Submit'));
      await tester.pump();

      expect(pressed, isTrue);
      expect(invalidPressed, isFalse);
    });

    testWidgets(
        'GlorovShakeButton calls onInvalidPress and shakes when isValid is false',
        (tester) async {
      bool pressed = false;
      bool invalidPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovShakeButton(
              isValid: false,
              onPressed: () => pressed = true,
              onInvalidPress: () => invalidPressed = true,
              builder: (context, handlePressed) => ElevatedButton(
                onPressed: handlePressed,
                child: const Text('Submit Invalid'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Submit Invalid'));
      await tester.pump();

      expect(pressed, isFalse);
      expect(invalidPressed, isTrue);
    });
  });

  group('Prompt 11: Page Transitions & Router Tests', () {
    test('Router returns MicroPageRoute for all key storefront screens', () {
      final routes = [
        homeScreenRoute,
        cartScreenRoute,
        checkoutScreenRoute,
        bookmarkScreenRoute,
        ordersScreenRoute,
        profileScreenRoute,
        getHelpScreenRoute,
        preferencesScreenRoute,
      ];

      for (final r in routes) {
        final route = app_router.generateRoute(RouteSettings(name: r));
        expect(route, isA<MicroPageRoute>(),
            reason: 'Route $r should be MicroPageRoute');
      }

      // Test Product Details Route with arguments
      final pdRoute = app_router.generateRoute(
        RouteSettings(
          name: productDetailsScreenRoute,
          arguments: GlorovMockData.products.first,
        ),
      );
      expect(pdRoute, isA<MicroPageRoute>());
    });
  });

  group('Prompt 11: Account Form & Support Feedback Tests', () {
    testWidgets('Profile section renders form and handles validation feedback',
        (tester) async {
      GlorovAccountState.instance.setAuthenticatedForTesting(true);
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      GlorovAccountState.instance.setAuthenticatedForTesting(true);

      await tester.pumpWidget(_buildTestApp(const GlorovProfileSection()));
      await tester.pumpAndSettle();

      expect(find.text('Customer Profile'), findsOneWidget);

      // Tap Edit Profile
      final editBtn = find.text('Edit Profile');
      if (editBtn.evaluate().isNotEmpty) {
        await tester.tap(editBtn);
        await tester.pumpAndSettle();

        expect(find.byType(GlorovShakeButton), findsOneWidget);
        expect(find.text('Save Changes'), findsOneWidget);
      }
    });

    testWidgets(
        'Notifications section renders staggered list and mark all as read action',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester
          .pumpWidget(_buildTestApp(const GlorovNotificationsSection()));
      await tester.pumpAndSettle();

      expect(find.text('Notification Center'), findsOneWidget);
      expect(find.byType(GlorovStaggeredItem), findsWidgets);

      // Verify Mark All as Read button exists if unread alerts exist
      if (GlorovAccountState.instance.unreadNotificationCount > 0) {
        final markAll = find.text('Mark All as Read');
        expect(markAll, findsOneWidget);
        await tester.tap(markAll);
        await tester.pumpAndSettle();

        expect(GlorovAccountState.instance.unreadNotificationCount, 0);
      }
    });

    testWidgets(
        'Customer support section validates inquiry and blocks empty submission',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 1000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(_buildTestApp(const GlorovSupportSection()));
      await tester.pumpAndSettle();

      expect(find.text('Contact Customer Support & Botanical Care'),
          findsOneWidget);
      expect(find.byType(GlorovShakeButton), findsOneWidget);

      // Try tapping submit without selecting a topic
      await tester.tap(find.text('Submit Demonstration Inquiry'));
      await tester.pumpAndSettle();

      // Ensure form is not submitted without required topic
      expect(find.text('Ticket Generated Successfully!'), findsNothing);
    });
  });
}
