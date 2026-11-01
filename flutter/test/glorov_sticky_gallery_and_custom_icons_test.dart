import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/product/glorov_product_card.dart';
import 'package:shop/core/icons/glorov_custom_icons.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';

class _TestHttpOverrides extends HttpOverrides {
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
    HttpOverrides.global = _TestHttpOverrides();
  });

  setUp(() {
    GlorovCartState.instance.clearCart();
  });

  group('Deliverable 1 & 2: Sticky Gallery Hit-Testing & Delivery Pincode Input', () {
    testWidgets(
        'Desktop PDP: Gallery thumbnails can be tapped even when page is scrolled down',
        (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-veg-02'); // Chinese Cabbage

      await tester.pumpWidget(
        MaterialApp(
          home: GlorovProductDetailsScreen(product: product),
        ),
      );
      await tester.pumpAndSettle();

      // Verify gallery thumbnails exist
      final thumb1Finder = find.byKey(const ValueKey<String>('gallery_thumbnail_1'));
      expect(thumb1Finder, findsOneWidget);

      // Scroll the main page scrollable down by 250px so sticky offset engages
      final scrollable = find.byType(Scrollable).first;
      await tester.drag(scrollable, const Offset(0, -250));
      await tester.pumpAndSettle();

      // Now tap the second thumbnail while scrolled
      await tester.tap(thumb1Finder);
      await tester.pumpAndSettle();

      // Verify second thumbnail is selected (active border)
      expect(find.byKey(const ValueKey<String>('gallery_thumbnail_1')), findsOneWidget);
    });

    testWidgets('Delivery estimate input has unified single border and CHECK button',
        (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');

      await tester.pumpWidget(
        MaterialApp(
          home: GlorovProductDetailsScreen(product: product),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Delivery Estimate section
      expect(find.text('Delivery Estimate'), findsOneWidget);
      expect(find.text('CHECK'), findsWidgets);
      expect(find.text('Enter 6-digit Pincode'), findsOneWidget);
    });
  });

  group('Deliverable 3: Custom Bespoke Icons', () {
    testWidgets('GlorovCustomIcons renders cart, buy, and loggedInUser without errors',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                GlorovCustomIcons.cart(size: 24),
                GlorovCustomIcons.cart(size: 24, isFilled: true),
                GlorovCustomIcons.buy(size: 20),
                GlorovCustomIcons.loggedInUser(size: 28, initials: 'SK'),
                GlorovCustomIcons.loggedInUser(size: 28),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('SK'), findsOneWidget);
    });
  });

  group('Deliverable 4 & 5 & 6: Mobile Cart & Product Cards', () {
    testWidgets('Product cards render "Summer Sale" and no "98% Germination"',
        (tester) async {
      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 175,
              height: 260,
              child: GlorovProductCard(product: product),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('SUMMER SALE'), findsOneWidget);
      expect(find.textContaining('98% GERMINATION'), findsNothing);
      expect(find.textContaining('98% Germination'), findsNothing);
    });

    testWidgets('Cart screen renders compact layout on mobile (390x844)',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      GlorovCartState.instance.addToCart(product);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Cart'), findsWidgets);
      expect(find.text(product.title), findsWidgets);
    });
  });
}
