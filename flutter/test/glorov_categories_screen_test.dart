import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/screens/discover/glorov_categories_screen.dart';

class TestHttpOverrides extends HttpOverrides {
  @override
  HttpClient createHttpClient(SecurityContext? context) {
    return _MockHttpClient();
  }
}

class _MockHttpClient extends Fake implements HttpClient {
  @override
  bool autoUncompress = true;

  @override
  Duration? connectionTimeout;

  @override
  Duration idleTimeout = const Duration(seconds: 15);

  @override
  int? maxConnectionsPerHost;

  @override
  String? userAgent;

  @override
  Future<HttpClientRequest> getUrl(Uri url) async => _MockHttpClientRequest();
}

class _MockHttpClientRequest extends Fake implements HttpClientRequest {
  @override
  final HttpHeaders headers = _MockHttpHeaders();

  @override
  Future<HttpClientResponse> close() async => _MockHttpClientResponse();
}

class _MockHttpHeaders extends Fake implements HttpHeaders {
  @override
  void add(String name, Object value, {bool preserveHeaderCase = false}) {}

  @override
  void set(String name, Object value, {bool preserveHeaderCase = false}) {}
}

class _MockHttpClientResponse extends Fake implements HttpClientResponse {
  @override
  int get statusCode => 200;

  @override
  int get contentLength => 68;

  @override
  HttpClientResponseCompressionState get compressionState =>
      HttpClientResponseCompressionState.notCompressed;

  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int> event)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) {
    // 1x1 transparent PNG bytes
    const pngBytes = [
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
    ];
    return Stream<List<int>>.value(pngBytes).listen(
      onData,
      onError: onError,
      onDone: onDone,
      cancelOnError: cancelOnError,
    );
  }
}

void main() {
  setUpAll(() {
    HttpOverrides.global = TestHttpOverrides();
  });

  group('GlorovCategoriesScreen Mobile Dual-Column Layout Tests', () {
    testWidgets('Mobile Viewport (< 800px) renders Flipkart-style split rail layout',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCategoriesScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Top AppBar title
      expect(find.text('All Categories'), findsOneWidget);

      // Left rail contains strictly the seeded categories
      expect(find.text('For You'), findsOneWidget);
      expect(find.text('Seeds'), findsOneWidget);
      expect(find.text('Live Plants'), findsOneWidget);
      expect(find.text('Planters & Pots'), findsOneWidget);
      expect(find.text('Plant Care & Soil'), findsOneWidget);

      // Right area default section header
      expect(find.text('Popular Collections'), findsOneWidget);
      expect(find.text('New & Upcoming Launches'), findsOneWidget);

      // Subcategory and launch items are rendered
      expect(find.text('Vegetable Seeds'), findsOneWidget);
      expect(find.text('Indoor Plants'), findsOneWidget);
      expect(find.text('BUY NOW'), findsWidgets);
    });

    testWidgets('Tapping category on left rail updates right subcategory content',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCategoriesScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Seeds' on the left rail
      await tester.tap(find.text('Seeds'));
      await tester.pumpAndSettle();

      // Right area header updates to Seeds Collections
      expect(find.text('Seeds Collections'), findsOneWidget);
      expect(find.text('Top Seeded Varieties'), findsOneWidget);

      // Subcategories under seeds are visible
      expect(find.text('Flower Seeds'), findsOneWidget);
      expect(find.text('Herb Seeds'), findsOneWidget);
    });

    testWidgets('Tapping subcategory card on mobile navigates to catalog',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      Object? pushedArgs;

      await tester.pumpWidget(
        MaterialApp(
          onGenerateRoute: (settings) {
            pushedArgs = settings.arguments;
            return MaterialPageRoute(
              builder: (context) => Scaffold(
                body: Text('Catalog: ${settings.arguments}'),
              ),
            );
          },
          home: const GlorovCategoriesScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Vegetable Seeds' subcategory card
      final vegFinder = find.text('Vegetable Seeds');
      expect(vegFinder, findsOneWidget);
      await tester.tap(vegFinder);
      await tester.pumpAndSettle();

      expect(pushedArgs, equals('Vegetable Seeds'));
    });
  });

  group('GlorovCategoriesScreen Desktop Layout Tests', () {
    testWidgets('Desktop Viewport (>= 800px) renders expansive layout with hero and cards',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCategoriesScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Desktop hero banner
      expect(find.text('Explore Botanical Categories'), findsOneWidget);
      expect(find.text('PUNE CENTRAL NURSERY DIRECTORY'), findsOneWidget);

      // Search box and category filter chips
      expect(find.byKey(const Key('category_search_field')), findsOneWidget);
      expect(find.text('All Categories'), findsOneWidget);

      // Seeded categories cards on desktop
      expect(find.text('Seeds'), findsWidgets);
      expect(find.text('Live Plants'), findsWidgets);
      expect(find.text('Planters & Pots'), findsWidgets);
      expect(find.text('Plant Care & Soil'), findsWidgets);
    });
  });
}
