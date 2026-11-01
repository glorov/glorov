import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/common/glorov_custom_trust_icon.dart';
import 'package:shop/components/home/glorov_value_props.dart';
import 'package:shop/core/theme/app_colors.dart';
import 'package:shop/models/glorov/glorov_trust_badge.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/repositories/mock/local_trust_badge_repository.dart';

void main() {
  setUp(() {
    GlorovRepositories.init();
  });

  group('GLOROV Botanical Trust Guarantees Ribbon (Image 2 Redesign)', () {
    testWidgets('1. Renders 4 trust guarantee pillars matching Image 2',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovValueProps(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify the 4 default trust titles from User Image
      expect(find.textContaining('100% Organic'), findsOneWidget);
      expect(find.textContaining('Safe Transit'), findsOneWidget);
      expect(find.textContaining('Lifetime Plant'), findsOneWidget);
      expect(find.textContaining('Eco-Friendly'), findsOneWidget);

      // Verify 4 custom trust icons rendered
      expect(find.byType(GlorovCustomTrustIcon), findsNWidgets(4));
    });

    testWidgets('2. Displays within rounded botanical forest green container',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovValueProps(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Find the main banner container
      final containerFinder = find.byWidgetPredicate((widget) {
        if (widget is Container && widget.decoration is BoxDecoration) {
          final box = widget.decoration as BoxDecoration;
          return box.color == AppColors.forestDeep &&
              box.borderRadius == BorderRadius.circular(20.0);
        }
        return false;
      });

      expect(containerFinder, findsOneWidget);
    });

    testWidgets('3. Renders cleanly on Mobile screen width without overflow',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(375, 812);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovValueProps(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify all 4 trust items exist and fit on mobile
      expect(find.textContaining('Safe Transit'), findsOneWidget);
      expect(find.textContaining('Eco-Friendly'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('4. Renders cleanly on Desktop screen width with subtitle hints',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovValueProps(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Open-pollinated'), findsOneWidget);
      expect(find.textContaining('shock-free'), findsOneWidget);
      expect(tester.takeException(), isNull);
    });

    testWidgets('5. Adopts custom backend settings and badges dynamically',
        (WidgetTester tester) async {
      const customColor = Color(0xFF2D6A4F);
      final customBadges = [
        const GlorovTrustBadgeItem(
          id: 'test_1',
          title: 'Direct Nursery\nDispatch',
          iconKey: 'transit-truck',
          displayOrder: 1,
        ),
        const GlorovTrustBadgeItem(
          id: 'test_2',
          title: 'Zero Chemical\nFertilizers',
          iconKey: 'eco-leaf',
          displayOrder: 2,
        ),
      ];
      const customSettings = GlorovTrustSectionSettings(
        bgColor: customColor,
        borderRadius: 24.0,
      );

      GlorovRepositories.setTrustBadgeRepository(
        LocalTrustBadgeRepository(
          badges: customBadges,
          settings: customSettings,
        ),
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovValueProps(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('Direct Nursery'), findsOneWidget);
      expect(find.textContaining('Zero Chemical'), findsOneWidget);

      final containerFinder = find.byWidgetPredicate((widget) {
        if (widget is Container && widget.decoration is BoxDecoration) {
          final box = widget.decoration as BoxDecoration;
          return box.color == customColor &&
              box.borderRadius == BorderRadius.circular(24.0);
        }
        return false;
      });

      expect(containerFinder, findsOneWidget);
    });

    testWidgets('6. Tap on item with route triggers navigation',
        (WidgetTester tester) async {
      String? navigatedRoute;

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) {
            navigatedRoute = settings.name;
            return MaterialPageRoute(
              builder: (_) => const Scaffold(body: Text('Destination')),
            );
          },
          home: const Scaffold(
            body: GlorovValueProps(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap on Safe Transit Guarantee (which links to /policies/shipping-policy)
      await tester.tap(find.textContaining('Safe Transit'));
      await tester.pumpAndSettle();

      expect(navigatedRoute, equals('/policies/shipping-policy'));
    });
  });
}
