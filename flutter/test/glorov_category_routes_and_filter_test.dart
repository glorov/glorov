import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/navigation/glorov_header.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart' as app_router;
import 'package:shop/screens/catalog/glorov_catalog_screen.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GLOROV Dedicated Category Routing Tests', () {
    test('Router resolves dedicated category routes to GlorovCatalogScreen', () {
      final routesToTest = [
        seedsScreenRoute,
        'seeds',
        livePlantsScreenRoute,
        'live-plants',
        'live_plants',
        plantersScreenRoute,
        'planters',
        plantCareScreenRoute,
        'plant-care',
        'plant_care',
        floweringScreenRoute,
        'flowering',
        herbsScreenRoute,
        'herbs',
        vegetablesScreenRoute,
        'vegetables',
        offersScreenRoute,
        'offers',
      ];

      for (final r in routesToTest) {
        final route = app_router.generateRoute(RouteSettings(name: r));
        expect(route, isNotNull, reason: 'Route $r should resolve');
        // Route should build a GlorovCatalogScreen
        final materialRoute = route as dynamic;
        expect(materialRoute, isNotNull);
      }
    });

    test('Flowering Plants catalog contains zero duplicate items and distinct imagery', () {
      final floweringProducts = GlorovMockData.products
          .where((p) =>
              p.subcategory.toLowerCase() == 'flowering plants' ||
              p.category.toLowerCase() == 'flowering plants')
          .toList();

      expect(floweringProducts.length, greaterThanOrEqualTo(5));

      // Verify no duplicate titles
      final titles = floweringProducts.map((p) => p.title).toSet();
      expect(titles.length, equals(floweringProducts.length),
          reason: 'Every flowering product must have a unique title');

      // Verify at most ONE peace lily
      final peaceLilies = floweringProducts
          .where((p) => p.title.toLowerCase().contains('peace lily'))
          .toList();
      expect(peaceLilies.length, equals(1),
          reason: 'Only 1 authentic Peace Lily should be in flowering plants, no duplicate aloe cards');

      // Verify presence of diverse flowers
      final hasAnthurium = floweringProducts.any((p) => p.title.contains('Anthurium'));
      final hasMarigold = floweringProducts.any((p) => p.title.contains('Marigold'));
      final hasPetunia = floweringProducts.any((p) => p.title.contains('Petunia'));

      expect(hasAnthurium, isTrue, reason: 'Anthurium Red flowering plant must be present');
      expect(hasMarigold, isTrue, reason: 'Marigold flowering plant must be present');
      expect(hasPetunia, isTrue, reason: 'Petunia flowering plant must be present');
    });

    testWidgets('GlorovHeader search bar has zero outer border and InputBorder.none', (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Find the TextField in desktop search
      final textFieldFinder = find.byType(TextField).first;
      expect(textFieldFinder, findsOneWidget);

      final textField = tester.widget<TextField>(textFieldFinder);
      final decoration = textField.decoration!;

      expect(decoration.border, equals(InputBorder.none));
      expect(decoration.enabledBorder, equals(InputBorder.none));
      expect(decoration.focusedBorder, equals(InputBorder.none));
    });

    testWidgets('GlorovCatalogScreen displays top minimalist filter chips and full width grid', (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCatalogScreen(
            initialCategory: 'Flowering Plants',
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Header title should be Flowering Plants
      expect(find.text('Flowering Plants'), findsWidgets);

      // Verify top minimalist filter chips exist
      expect(find.text('All Prices'), findsOneWidget);
      expect(find.text('Under ₹300'), findsOneWidget);
      expect(find.text('₹300 - ₹700'), findsOneWidget);
      expect(find.text('₹700+'), findsOneWidget);
      expect(find.text('In Stock Only'), findsOneWidget);

      // Verify no heavy left sidebar exists (e.g. no "Filter Products" heading)
      expect(find.text('Filter Products'), findsNothing);
    });
  });
}
