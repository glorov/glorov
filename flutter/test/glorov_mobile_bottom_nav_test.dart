import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/navigation/glorov_mobile_bottom_nav.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/services/glorov_cart_state.dart';
import 'package:shop/services/glorov_header_scroll_notifier.dart';

void main() {
  group('GlorovMobileBottomNav Widget & Interaction Tests', () {
    late GlorovCartState cartState;

    setUp(() {
      cartState = GlorovCartState.instance;
      cartState.clearCart();
      GlorovHeaderScrollNotifier.instance.reset();
    });

    testWidgets(
        'Renders exactly 4 navigation items on mobile viewport (Search is removed)',
        (WidgetTester tester) async {
      // Set mobile viewport (width: 390, iPhone 14 / mobile width)
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(child: Text('Content')),
            bottomNavigationBar: GlorovMobileBottomNav(
              currentRoute: homeScreenRoute,
              isVisible: true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Check the 4 items requested
      expect(find.text('Home'), findsOneWidget);
      expect(find.text('Categories'), findsOneWidget);
      expect(find.text('Cart'), findsOneWidget);
      // Account / Sign In depending on auth state
      expect(find.text('Sign In'), findsOneWidget);

      // Verify Search item is removed as requested
      expect(find.text('Search'), findsNothing);

      // Check key icons and text
      expect(find.byIcon(Icons.home_rounded), findsOneWidget);
      expect(find.byIcon(Icons.grid_view_outlined), findsOneWidget);
      expect(find.text('Cart'), findsOneWidget);
    });

    testWidgets('Hides completely on desktop viewport (>= 768px)',
        (WidgetTester tester) async {
      // Set desktop viewport (1280 x 800)
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(child: Text('Desktop Content')),
            bottomNavigationBar: GlorovMobileBottomNav(
              currentRoute: homeScreenRoute,
              isVisible: true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Should find no mobile navigation labels on desktop
      expect(find.text('Home'), findsNothing);
      expect(find.text('Categories'), findsNothing);
      expect(find.text('Search'), findsNothing);
      expect(find.text('Cart'), findsNothing);
      expect(find.text('Account'), findsNothing);
    });

    testWidgets('Cart badge reacts dynamically when items are added to cart',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(child: Text('Content')),
            bottomNavigationBar: GlorovMobileBottomNav(
              currentRoute: homeScreenRoute,
              isVisible: true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Cart is empty -> no badge number
      expect(find.text('1'), findsNothing);

      // Add item to cart
      cartState.addToCart(GlorovMockData.products.first, quantity: 2);
      await tester.pumpAndSettle();

      // Badge '2' is now visible
      expect(find.text('2'), findsOneWidget);
    });

    testWidgets(
        'Tapping Categories navigates to category screen without opening drawer',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      String? pushedRoute;

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) {
            pushedRoute = settings.name;
            return MaterialPageRoute(
              builder: (context) => Scaffold(
                body: Text('Page: ${settings.name}'),
              ),
            );
          },
          home: const Scaffold(
            drawer: Drawer(
              child: Text('Botanical Drawer Content'),
            ),
            body: Center(child: Text('Main Page')),
            bottomNavigationBar: GlorovMobileBottomNav(
              currentRoute: homeScreenRoute,
              isVisible: true,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Drawer is initially closed
      expect(find.text('Botanical Drawer Content'), findsNothing);

      // Tap 'Categories' bottom nav item
      await tester.tap(find.text('Categories'));
      await tester.pumpAndSettle();

      // Drawer should NEVER open when tapping Categories
      expect(find.text('Botanical Drawer Content'), findsNothing);

      // Successfully pushed the dedicated category screen route
      expect(pushedRoute, equals(discoverScreenRoute));
    });

    testWidgets(
        'Dynamic scroll coordination: bottom nav appears on scroll down, hides on scroll up',
        (WidgetTester tester) async {
      final notifier = GlorovHeaderScrollNotifier.instance;
      notifier.reset();

      // Initial state at top (Zone 1: pixels <= 12):
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showAnnouncement, isTrue);

      // 1. Initial scroll down in "No-Hide Zone" (Zone 2: 12 < pixels <= 180):
      // Header stays visible in compact mode; bottom nav remains hidden so hero stays clean.
      notifier.handleScroll(100.0, 30.0);
      expect(notifier.isTopNavVisible, isTrue); // Compact header sticks and stays visible!
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showAnnouncement, isFalse);

      // 2. Scroll DOWN into deep page content past threshold (pixels > 180):
      notifier.handleScroll(240.0, 30.0);
      expect(notifier.isTopNavVisible, isFalse); // Top nav disappears on scroll down
      expect(notifier.isBottomNavVisible, isTrue); // Bottom nav appears on scroll down
      expect(notifier.showAnnouncement, isFalse);

      // 3. Scroll UP while mid-page:
      notifier.handleScroll(210.0, -30.0);
      expect(notifier.isTopNavVisible, isTrue); // Top nav appears on scroll up
      expect(notifier.isBottomNavVisible, isFalse); // Bottom nav hides on scroll up
      expect(notifier.showAnnouncement, isFalse); // Announcement stays hidden mid-page

      // 4. Scroll all the way back to maximum top (Zone 1):
      notifier.handleScroll(5.0, -20.0);
      expect(notifier.isTopNavVisible, isTrue); // Top nav open
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showAnnouncement, isTrue); // Announcement restored at top
      expect(notifier.showIcons, isTrue); // Category icons restored at top
    });
  });
}
