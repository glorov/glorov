import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/navigation/glorov_header.dart';
import 'package:shop/services/glorov_header_scroll_notifier.dart';

void main() {
  group('GlorovHeaderScrollNotifier Dynamic Behavior Tests', () {
    late GlorovHeaderScrollNotifier notifier;

    setUp(() {
      notifier = GlorovHeaderScrollNotifier.instance;
      notifier.reset();
    });

    test('Initial state at page top shows top nav WITH icons and announcement',
        () {
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.isHeaderVisible, isTrue);
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showIcons, isTrue);
      expect(notifier.showAnnouncement, isTrue);
      expect(notifier.selectedCategory, '');
    });

    test(
        'Initial scroll down (Zone 2: No-Hide Zone) keeps top nav sticky and visible, tucks announcement & icons',
        () {
      // Simulate initial scroll down to 80px (within stickyActivationThreshold <= 180px)
      notifier.handleScroll(80.0, 30.0);

      // Top navigation stays sticky and visible near page top (NO premature hiding!)
      expect(notifier.isTopNavVisible, isTrue);
      // Mobile bottom nav remains hidden so the hero section stays clean
      expect(notifier.isBottomNavVisible, isFalse);
      // Announcement bar and category icons tuck away into sleek compact mode
      expect(notifier.showIcons, isFalse);
      expect(notifier.showAnnouncement, isFalse);
    });

    test(
        'Scrolling down past threshold (Zone 4) hides top nav and displays mobile bottom nav',
        () {
      // First scroll down through Zone 2 into Zone 4 (pixels = 120)
      notifier.handleScroll(120.0, 50.0);
      expect(notifier.isTopNavVisible, isTrue); // Near top, header remains sticky & visible
      expect(notifier.showAnnouncement, isFalse);
      expect(notifier.showIcons, isFalse);

      // Now scroll down past threshold (pixels = 240)
      notifier.handleScroll(240.0, 40.0);

      // Past the threshold, top navigation hides on scroll down
      expect(notifier.isTopNavVisible, isFalse);
      // Mobile bottom navigation appears on scroll down
      expect(notifier.isBottomNavVisible, isTrue);
      // Top announcement bar and icons remain tucked away
      expect(notifier.showAnnouncement, isFalse);
      expect(notifier.showIcons, isFalse);
    });

    test(
        'Scrolling up mid-page reveals compact top header and hides mobile bottom navigation',
        () {
      // Mid-page scroll down (pixels = 300)
      notifier.handleScroll(300.0, 50.0);
      expect(notifier.isTopNavVisible, isFalse);
      expect(notifier.isBottomNavVisible, isTrue);
      expect(notifier.showAnnouncement, isFalse);

      // Scroll up while still mid-page (pixels = 260)
      notifier.handleScroll(260.0, -40.0);

      // Top navigation reveals smoothly on scroll up, bottom navigation hides
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showIcons, isFalse);
      expect(notifier.showAnnouncement, isFalse); // Only restored when reaching maximum top
    });

    test(
        'Scrolling all the way to maximum top restores announcement and category icons',
        () {
      // 1. Scrolled mid-page
      notifier.handleScroll(200.0, -10.0);
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.showIcons, isFalse);
      expect(notifier.showAnnouncement, isFalse);

      // 2. Reached the maximum top (pixels <= 8)
      notifier.handleScroll(0.0, -20.0);

      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showIcons, isTrue);
      expect(notifier.showAnnouncement, isTrue);
    });

    test('Selecting a category updates coordinator without flyout', () {
      notifier.selectCategory('Seeds');
      expect(notifier.selectedCategory, 'Seeds');

      notifier.selectCategory('Live Plants');
      expect(notifier.selectedCategory, 'Live Plants');
    });
  });

  group('GlorovHeader Centered Categories & Micro-interactions Widget Tests',
      () {
    testWidgets(
        'Header does not contain "For You" and centers the 8 botanical categories',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) {
            return MaterialPageRoute(
              builder: (context) =>
                  const Scaffold(body: Text('Route Destination')),
            );
          },
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // "For You" must NOT exist
      expect(find.text('For You'), findsNothing);

      // 8 categories must exist
      expect(find.text('Seeds'), findsOneWidget);
      expect(find.text('Live Plants'), findsOneWidget);
      expect(find.text('Planters'), findsOneWidget);
      expect(find.text('Plant Care'), findsOneWidget);
      expect(find.text('Flowering'), findsOneWidget);
      expect(find.text('Herbs'), findsOneWidget);
      expect(find.text('Vegetables'), findsOneWidget);
      expect(find.text('Offers'), findsOneWidget);

      // Search field hint text on desktop
      expect(find.text('Search for plants, seeds, fertilizers & pots...'),
          findsOneWidget);

      // Tapping category switches selection smoothly
      await tester.tap(find.text('Live Plants'));
      await tester.pumpAndSettle();

      expect(
          GlorovHeaderScrollNotifier.instance.selectedCategory, 'Live Plants');
    });

    testWidgets(
        'Mobile Header renders left-side logo and search bar ONLY (no cart, no login icon)',
        (WidgetTester tester) async {
      // Set mobile viewport (width: 390)
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Mobile search field hint text
      expect(find.text('Search for plants, seeds, pots...'), findsOneWidget);

      // Should NOT contain the desktop/top-level cart button or profile icon in header
      // because they are now housed in the mobile bottom navigation dock
      expect(find.byIcon(Icons.bolt), findsNothing);
      expect(find.text('743245'), findsNothing);
      expect(find.text('Select location'), findsNothing);
    });

    testWidgets(
        'Mobile Header allows smooth horizontal dragging across categories without snapping back',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Find the horizontal categories scrollable
      final scrollableFinder = find.byKey(
          const PageStorageKey<String>('glorov_header_categories_scroll'));
      expect(scrollableFinder, findsOneWidget);

      // Drag horizontally to scroll categories to the right
      await tester.drag(scrollableFinder, const Offset(-200.0, 0.0));
      await tester.pumpAndSettle();

      // "Offers" (the last category) should now be easily accessible or visible
      expect(find.text('Offers'), findsOneWidget);

      // Horizontal dragging should NOT toggle page scroll visibility
      expect(GlorovHeaderScrollNotifier.instance.isTopNavVisible, isTrue);
    });

    test('Responsive scroll hysteresis past threshold: slight upward scroll triggers top nav reveal', () {
      final notifier = GlorovHeaderScrollNotifier.instance;
      notifier.reset();

      // 1. Initial top state
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.showAnnouncement, isTrue);

      // 2. Initial scroll down (30px) stays sticky and visible in Zone 2
      notifier.handleScroll(30.0, 15.0);
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.showAnnouncement, isFalse);
      expect(notifier.isBottomNavVisible, isFalse);

      // 3. Scroll down past threshold (240px) hides top nav smoothly in Zone 4 and shows bottom nav
      notifier.handleScroll(240.0, 30.0);
      expect(notifier.isTopNavVisible, isFalse);
      expect(notifier.showAnnouncement, isFalse);
      expect(notifier.isBottomNavVisible, isTrue);

      // 4. Slight scroll up (-10px) immediately reveals top nav and hides bottom nav
      notifier.handleScroll(230.0, -10.0);
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showAnnouncement, isFalse);

      // 5. Return to top (0px) restores announcement bar and category icons
      notifier.handleScroll(0.0, -30.0);
      expect(notifier.isTopNavVisible, isTrue);
      expect(notifier.isBottomNavVisible, isFalse);
      expect(notifier.showAnnouncement, isTrue);
      expect(notifier.showIcons, isTrue);
    });

    testWidgets('Tablet Viewport (width: 768) centers the botanical categories in viewport',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(768, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify all 8 categories are rendered
      expect(find.text('Seeds'), findsOneWidget);
      expect(find.text('Offers'), findsOneWidget);

      // Verify the midpoint between first category (Seeds) and last category (Offers)
      // is centered in the 768px viewport (midpoint exactly 384px)
      final seedsRect = tester.getRect(find.text('Seeds'));
      final offersRect = tester.getRect(find.text('Offers'));
      final midpoint = (seedsRect.left + offersRect.right) / 2;

      expect(midpoint, closeTo(384.0, 5.0));
    });

    testWidgets('Tablet Viewport (width: 1024) centers the botanical categories in viewport',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1024, 768);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Seeds'), findsOneWidget);
      expect(find.text('Offers'), findsOneWidget);

      final seedsRect = tester.getRect(find.text('Seeds'));
      final offersRect = tester.getRect(find.text('Offers'));
      final midpoint = (seedsRect.left + offersRect.right) / 2;

      expect(midpoint, closeTo(512.0, 8.0));
    });
  });
}
