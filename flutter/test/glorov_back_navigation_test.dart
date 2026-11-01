import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart' as router;
import 'package:shop/screens/catalog/glorov_catalog_screen.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';

void main() {
  setUpAll(() {
    GlorovRepositories.init();
  });

  Widget buildApp({String initialRoute = '/'}) {
    return MaterialApp(
      initialRoute: initialRoute,
      onGenerateRoute: router.generateRoute,
    );
  }

  Future<void> step(WidgetTester tester, [int ms = 300]) async {
    await tester.pump();
    await tester.pump(Duration(milliseconds: ms));
  }

  group('GLOROV Web Back Navigation & History Stack Tests', () {
    testWidgets('Navigating Home -> Category -> Product Details maintains proper back stack',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(buildApp());
      await step(tester);

      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // Verify at root
      expect(navigator.canPop(), isFalse);

      // 1. Navigate to Flowering category
      navigator.pushNamed(floweringScreenRoute);
      await step(tester);
      expect(find.byType(GlorovCatalogScreen), findsOneWidget);
      expect(navigator.canPop(), isTrue);

      // 2. Navigate to a Product Details screen
      final testProduct = GlorovMockData.products.first;
      navigator.pushNamed(productDetailsScreenRoute, arguments: testProduct);
      await step(tester);
      expect(find.byType(GlorovProductDetailsScreen), findsOneWidget);
      expect(navigator.canPop(), isTrue);

      // 3. Trigger Back from Product Details: Should return to Flowering catalog
      final pdpBackFinder = find.byKey(const Key('pdp_back_button'));
      expect(pdpBackFinder, findsOneWidget);
      await tester.tap(pdpBackFinder, warnIfMissed: false);
      await step(tester);

      expect(find.byType(GlorovProductDetailsScreen), findsNothing);
      expect(find.byType(GlorovCatalogScreen), findsOneWidget);
      expect(navigator.canPop(), isTrue);

      // 4. Trigger Back from Catalog: Should return to Home
      final catalogBackFinder = find.byKey(const Key('catalog_back_button'));
      expect(catalogBackFinder, findsOneWidget);
      await tester.tap(catalogBackFinder, warnIfMissed: false);
      await step(tester);

      expect(find.byType(GlorovCatalogScreen), findsNothing);
      expect(navigator.canPop(), isFalse);
    });

    testWidgets('Tapping Cart back button returns to immediately previous screen',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(buildApp());
      await step(tester);

      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      // Push seeds category
      navigator.pushNamed(seedsScreenRoute);
      await step(tester);
      expect(find.byType(GlorovCatalogScreen), findsOneWidget);

      // Push cart
      navigator.pushNamed(cartScreenRoute);
      await step(tester);
      expect(navigator.canPop(), isTrue);

      // Tap back in Cart screen
      final cartBackFinder = find.byKey(const Key('cart_back_button'));
      expect(cartBackFinder, findsOneWidget);
      await tester.tap(cartBackFinder, warnIfMissed: false);
      await step(tester);

      // Should be back on seeds catalog screen
      expect(find.byType(GlorovCatalogScreen), findsOneWidget);
      expect(navigator.canPop(), isTrue);
    });

    testWidgets('Tapping related product pushes on top of stack rather than replacing',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(buildApp());
      await step(tester);

      final navigator = tester.state<NavigatorState>(find.byType(Navigator));

      final p1 = GlorovMockData.products[0];
      final p2 = GlorovMockData.products[1];

      // Navigate to product 1
      navigator.pushNamed(productDetailsScreenRoute, arguments: p1);
      await step(tester);

      // Navigate to product 2
      navigator.pushNamed(productDetailsScreenRoute, arguments: p2);
      await step(tester);

      // Pop product 2 -> should return to product 1
      navigator.pop();
      await step(tester);

      expect(find.text(p1.title), findsWidgets);
    });
  });
}
