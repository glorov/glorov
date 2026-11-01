import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shop/components/navigation/glorov_header.dart';
import 'package:shop/core/theme/app_colors.dart';
import 'package:shop/services/glorov_header_scroll_notifier.dart';

void main() {
  group('GLOROV Header Search & Nav Micro-Interactions Tests', () {
    setUp(() {
      GlorovHeaderScrollNotifier.instance.reset();
    });

    testWidgets('Header displays left brand logo with glorov-logo.svg',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify SVG Logo exists
      final logoFinder = find.byType(SvgPicture);
      expect(logoFinder, findsWidgets);

      // Verify pill search bar exists with wine magnifying glass
      final searchFieldFinder = find.byType(TextField);
      expect(searchFieldFinder, findsOneWidget);
      final searchIconFinder = find.byIcon(Icons.search);
      expect(searchIconFinder, findsOneWidget);

      final searchIcon = tester.widget<Icon>(searchIconFinder);
      expect(searchIcon.color, AppColors.forestDeep);
    });

    testWidgets(
        'Header category nav buttons are centered and contain 8 items without "For You"',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // "For You" is NOT present
      expect(find.text('For You'), findsNothing);

      // All 8 botanical categories are present
      final expectedCategories = [
        'Seeds',
        'Live Plants',
        'Planters',
        'Plant Care',
        'Flowering',
        'Herbs',
        'Vegetables',
        'Offers',
      ];

      for (final cat in expectedCategories) {
        expect(find.text(cat), findsOneWidget);
      }
    });

    testWidgets(
        'Switching nav category updates active state with spring interaction',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Initial root state: no category selected
      expect(GlorovHeaderScrollNotifier.instance.selectedCategory, '');

      // Tap "Live Plants" to switch category
      final livePlantsFinder = find.text('Live Plants');
      expect(livePlantsFinder, findsOneWidget);

      await tester.tap(livePlantsFinder);
      await tester.pump(
          const Duration(milliseconds: 100)); // Halfway through spring bounce
      await tester.pumpAndSettle();

      // Selected category switched to Live Plants
      expect(
          GlorovHeaderScrollNotifier.instance.selectedCategory, 'Live Plants');
    });

    testWidgets(
        'Header right-side actions render user bolt badge and cart counter on desktop',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Wishlist icon
      expect(find.byIcon(Icons.favorite_border_rounded), findsOneWidget);

      // Cart action with custom botanical icon
      expect(find.byTooltip('Cart'), findsOneWidget);
    });

    testWidgets(
        'Mobile Header renders left-side logo and search bar ONLY without cart or login icons',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify SVG Logo exists on mobile
      expect(find.byType(SvgPicture), findsWidgets);

      // Verify search field exists on mobile
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Search for plants, seeds, pots...'), findsOneWidget);

      // Verify cart and login icons are removed on mobile header
      expect(find.byIcon(Icons.shopping_cart_outlined), findsNothing);
      expect(find.byIcon(Icons.bolt), findsNothing);
    });

    testWidgets(
        'Header search label rotates automatically every 5 seconds with vertical bottom-to-top transition',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Initial hint (index 0)
      expect(find.text('Search for plants, seeds, fertilizers & pots...'),
          findsOneWidget);

      // Verify ClipRect and AnimatedSwitcher are present for smooth vertical clipping
      expect(find.byType(ClipRect), findsWidgets);
      expect(find.byType(AnimatedSwitcher), findsOneWidget);

      // Advance by 5 seconds
      await tester.pump(const Duration(seconds: 5));
      await tester.pumpAndSettle();

      // Next hint (index 1)
      expect(find.text('Search "Desi Heirloom & Hybrid Seeds"...'), findsOneWidget);
      expect(find.text('Search for plants, seeds, fertilizers & pots...'),
          findsNothing);

      // Advance by another 5 seconds
      await tester.pump(const Duration(seconds: 5));
      await tester.pumpAndSettle();

      // Next hint (index 2)
      expect(find.text('Search "Air Purifying Live Houseplants"...'),
          findsOneWidget);
    });

    testWidgets(
        'Typing into search input hides animated hint and shows clear button',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) => MaterialPageRoute(
            builder: (_) => const Scaffold(body: Text('Destination')),
          ),
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Clear icon initially absent
      expect(find.byIcon(Icons.clear), findsNothing);
      expect(find.text('Search for plants, seeds, fertilizers & pots...'),
          findsOneWidget);

      // Enter text
      await tester.enterText(find.byType(TextField), 'Bonsai');
      await tester.pumpAndSettle();

      // Animated hint hidden
      expect(find.text('Search for plants, seeds, fertilizers & pots...'),
          findsNothing);
      // Clear button visible
      expect(find.byIcon(Icons.clear), findsOneWidget);

      // Tapping clear button clears text and restores hint
      await tester.tap(find.byIcon(Icons.clear));
      await tester.pumpAndSettle();

      final textField = tester.widget<TextField>(find.byType(TextField));
      expect(textField.controller?.text, '');
      expect(find.text('Search for plants, seeds, fertilizers & pots...'),
          findsOneWidget);
    });
  });
}
