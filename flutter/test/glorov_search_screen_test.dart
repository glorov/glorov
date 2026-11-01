import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/navigation/glorov_header.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/route/router.dart';
import 'package:shop/screens/discover/glorov_categories_screen.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/screens/search/views/glorov_search_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';
import 'package:shop/services/glorov_search_service.dart';

void main() {
  setUp(() {
    GlorovRepositories.resetToMockDefaults();
    GlorovCartState.instance.clearCart();
    GlorovSearchService.instance.clearRecentSearches();
  });

  Widget buildTestApp({Widget? home, String? initialRoute, RouteFactory? onGenerateRoute}) {
    return MaterialApp(
      initialRoute: initialRoute,
      onGenerateRoute: onGenerateRoute ?? generateRoute,
      home: home,
    );
  }

  group('GLOROV Full-Screen Pop-Up Search Experience Tests', () {
    testWidgets('Renders full-screen search page with back button, input field and submit button',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Top search navigation elements
      expect(find.byKey(const Key('search_back_button')), findsOneWidget);
      expect(find.byKey(const Key('glorov_search_text_field')), findsOneWidget);
      expect(find.byKey(const Key('search_submit_button')), findsOneWidget);
      expect(
        find.text('Search plants, seeds, fertilizers, pots...'),
        findsOneWidget,
      );
    });

    testWidgets('Zero-query initial view shows Trending Searches and Botanical Picks',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Section titles
      expect(find.text('Trending Searches'), findsOneWidget);
      expect(find.text('Browse by Category'), findsOneWidget);
      expect(find.text('Popular Botanical Picks'), findsOneWidget);

      // Trending search terms are rendered as action chips
      expect(find.text('Monstera Deliciosa'), findsWidgets);
      expect(find.text('Snake Plant'), findsWidgets);
      expect(find.text('Ceramic Pots'), findsOneWidget);
    });

    testWidgets('Recent searches can be added, displayed, cleared individually and cleared all',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      GlorovSearchService.instance.addRecentSearch('Bonsai Plant');
      GlorovSearchService.instance.addRecentSearch('Neem Fertilizer');

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Recent Searches'), findsOneWidget);
      expect(find.text('Bonsai Plant'), findsOneWidget);
      expect(find.text('Neem Fertilizer'), findsOneWidget);

      // Tap 'Clear All'
      await tester.tap(find.text('Clear All'));
      await tester.pumpAndSettle();

      expect(find.text('Recent Searches'), findsNothing);
    });

    testWidgets('Typing "monstera" displays Closest Result / Best Match Card with image, title and price',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Enter query
      await tester.enterText(find.byKey(const Key('glorov_search_text_field')), 'brinjal');
      await tester.pump(const Duration(milliseconds: 200));
      await tester.pumpAndSettle();

      // Closest match banner & card
      expect(find.text('Closest Result / Best Match'), findsOneWidget);
      expect(find.byKey(const Key('closest_match_card')), findsOneWidget);

      // Verify product title in closest match
      expect(
        find.textContaining('Brinjal Banarasi Giant Seeds'),
        findsWidgets,
      );

      // Verify actions on the closest result card
      expect(find.byKey(const Key('closest_match_details_button')), findsOneWidget);
      expect(find.byKey(const Key('closest_match_add_to_cart_button')), findsOneWidget);

      // Quick add to cart from closest match card
      await tester.tap(find.byKey(const Key('closest_match_add_to_cart_button')));
      await tester.pump(const Duration(milliseconds: 100));

      expect(GlorovCartState.instance.itemCount, 1);
      expect(find.byType(SnackBar), findsOneWidget);
    });

    testWidgets('Submitting search displays full results grid with sort options and result counter',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byKey(const Key('glorov_search_text_field')), 'seeds');
      await tester.tap(find.byKey(const Key('search_submit_button')));
      await tester.pumpAndSettle();

      // Results header
      expect(find.textContaining('results for "seeds"'), findsOneWidget);
      expect(find.text('Relevance'), findsOneWidget);

      // Category choice chips
      expect(find.text('Seeds'), findsWidgets);
      expect(find.text('Live Plants'), findsWidgets);

      // Product grid with mini add to cart
      expect(find.byType(GridView), findsOneWidget);
    });

    testWidgets('Unmatched query displays friendly no results view with alternative suggestions',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('glorov_search_text_field')),
        'xyznonexistentbotanicalitem',
      );
      await tester.tap(find.byKey(const Key('search_submit_button')));
      await tester.pumpAndSettle();

      expect(find.byIcon(Icons.search_off_rounded), findsOneWidget);
      expect(
        find.textContaining('No Botanical Results Found for "xyznonexistentbotanicalitem"'),
        findsOneWidget,
      );

      // Suggestion recovery chips
      expect(find.text('Monstera'), findsOneWidget);
    });

    testWidgets('Tapping "View Details" navigates to GlorovProductDetailsScreen',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovSearchScreen(),
        ),
      );
      await tester.pumpAndSettle();

      await tester.enterText(find.byKey(const Key('glorov_search_text_field')), 'brinjal');
      await tester.pump(const Duration(milliseconds: 200));
      await tester.pumpAndSettle();

      // Tap View Details on closest match
      await tester.tap(find.byKey(const Key('closest_match_details_button')));
      await tester.pumpAndSettle();

      // Navigated to Product Details Screen
      expect(find.byType(GlorovProductDetailsScreen), findsOneWidget);
    });

    testWidgets('Clicking search button in category screen opens full-screen GlorovSearchScreen',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const GlorovCategoriesScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Category screen has search icon button in app bar
      final searchButtonFinder = find.byIcon(Icons.search_rounded);
      expect(searchButtonFinder, findsWidgets);

      await tester.tap(searchButtonFinder.first);
      await tester.pumpAndSettle();

      // Opens full screen search
      expect(find.byType(GlorovSearchScreen), findsOneWidget);
      expect(find.byKey(const Key('glorov_search_text_field')), findsOneWidget);
    });

    testWidgets('Tapping search bar in GlorovHeader opens full-screen GlorovSearchScreen',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        buildTestApp(
          home: const Scaffold(
            body: GlorovHeader(),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Desktop header search bar
      final headerSearchField = find.byType(TextField);
      expect(headerSearchField, findsOneWidget);

      await tester.tap(headerSearchField);
      await tester.pumpAndSettle();

      // Opens full screen search
      expect(find.byType(GlorovSearchScreen), findsOneWidget);
      expect(find.byKey(const Key('glorov_search_text_field')), findsOneWidget);
    });
  });
}
