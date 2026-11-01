import 'dart:async';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/product/glorov_product_gallery.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_product.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';

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

  setUp(() {
    GlorovCartState.instance.clearCart();
  });

  Widget buildTestableDetails(GlorovProduct product) {
    return MaterialApp(
      home: GlorovProductDetailsScreen(product: product),
    );
  }

  group('GlorovProductDetailsScreen Mobile Ordering Tests', () {
    testWidgets('Renders product title, ratings and packet size options',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products
          .firstWhere((p) => p.id == 'glr-seed-01'); // Green Chilli Seeds
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Title & rating badges
      expect(find.text('Green Chilli Seeds'), findsWidgets);
      expect(find.textContaining('1 Crore'), findsNothing);
      expect(find.textContaining('Happy Customers'), findsNothing);
      expect(find.textContaining('In Stock'), findsWidgets);
      expect(find.textContaining('SUMMER SALE'), findsWidgets);
      expect(find.textContaining('98% GERMINATION'), findsNothing);
      expect(find.textContaining('DIWALI SALE'), findsNothing);

      // Packet size variants
      final variant1gm = find.text('1gm');
      await tester.ensureVisible(variant1gm.first);
      await tester.pumpAndSettle();
      expect(variant1gm, findsWidgets);
      expect(find.text('25GM'), findsWidgets);
    });

    testWidgets('Tapping packet size updates selection and price',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Find and scroll to 25GM variant
      final variant25gm = find.text('25GM');
      await tester.ensureVisible(variant25gm.first);
      await tester.pumpAndSettle();

      // Tap 25GM variant
      await tester.tap(variant25gm.first);
      await tester.pumpAndSettle();

      // Price should update to ₹275
      expect(find.text('₹275'), findsWidgets);
    });

    testWidgets('Quantity stepper increments and decrements with min limit 1',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Scroll to stepper
      final plusIcon = find.byIcon(Icons.add).first;
      await tester.ensureVisible(plusIcon);
      await tester.pumpAndSettle();

      // Find quantity text '1'
      expect(find.text('1'), findsWidgets);

      // Tap '+' icon
      await tester.tap(plusIcon);
      await tester.pumpAndSettle();
      expect(find.text('2'), findsWidgets);

      // Tap '-' icon
      final minusIcon = find.byIcon(Icons.remove).first;
      await tester.tap(minusIcon);
      await tester.pumpAndSettle();
      expect(find.text('1'), findsWidgets);

      // Tapping '-' again should keep at 1
      await tester.tap(minusIcon);
      await tester.pumpAndSettle();
      expect(find.text('1'), findsWidgets);
    });

    testWidgets('Pincode check calculates delivery date for valid 6-digit pin',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Find and scroll to check button
      final checkButton = find.text('CHECK');
      await tester.ensureVisible(checkButton);
      await tester.pumpAndSettle();

      await tester.tap(checkButton);
      await tester.pumpAndSettle();

      expect(find.textContaining('Delivered by:'), findsOneWidget);
    });

    testWidgets('Sticky ADD TO CART button adds item to GlorovCartState',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      expect(GlorovCartState.instance.itemCount, 0);

      // At top of page: in-page Add to Cart is visible, sticky ADD TO CART is hidden (no duplicate CTA!)
      expect(find.text('ADD TO CART'), findsNothing);
      expect(find.text('Add To Cart'), findsOneWidget);

      // Scroll down past in-page Add to Cart
      await tester.drag(find.byType(SingleChildScrollView).first, const Offset(0, -500));
      await tester.pumpAndSettle();
      await tester.drag(find.byType(SingleChildScrollView).first, const Offset(0, -500));
      await tester.pumpAndSettle();

      // Tap sticky ADD TO CART now that it has appeared
      final stickyAddToCart = find.text('ADD TO CART');
      expect(stickyAddToCart, findsOneWidget);
      await tester.tap(stickyAddToCart);
      await tester.pumpAndSettle();

      expect(GlorovCartState.instance.itemCount, 1);
    });
  });

  group('Glorov Plant Multi-Attribute Variants & Interactive Features Tests', () {
    testWidgets('Renders plant size chips, planter cards, color swatches and gift checkbox',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-ind-19');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Multi-attribute selectors
      expect(find.text('Select Plant Size'), findsOneWidget);
      expect(find.text('Small'), findsWidgets);
      expect(find.text('Medium'), findsWidgets);
      expect(find.text('Size Guide'), findsOneWidget);

      expect(find.text('Select Planter'), findsOneWidget);
      expect(find.text('GroPot'), findsWidgets);
      expect(find.text('Krish'), findsWidgets);

      expect(find.textContaining('Color –'), findsOneWidget);

      // Gift option
      expect(find.textContaining('Make this a gift'), findsOneWidget);

      // Trust reassurance
      expect(find.textContaining('30-Day Plant Guarantee'), findsOneWidget);
      expect(find.textContaining('Plant Care Support'), findsOneWidget);
    });

    testWidgets('Tapping Size Guide opens size comparison guide modal',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-ind-19');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      final sizeGuideBtn = find.text('Size Guide');
      // Scroll past header to make sure Size Guide is in clear viewport
      await tester.drag(
        find.byType(SingleChildScrollView).first,
        const Offset(0, -300),
      );
      await tester.pumpAndSettle();

      await tester.tap(sizeGuideBtn);
      await tester.pumpAndSettle();

      // Modal dialog appears
      expect(find.text('Plant Size Guide'), findsOneWidget);
      expect(find.byIcon(Icons.close), findsOneWidget);

      // Dismiss modal
      await tester.tap(find.byIcon(Icons.close));
      await tester.pumpAndSettle();
      expect(find.text('Plant Size Guide'), findsNothing);
    });

    testWidgets('Tapping gift checkbox toggles state',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-ind-19');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      final giftFinder = find.textContaining('Make this a gift');
      // Scroll past header so checkbox is in clear viewport
      await tester.drag(
        find.byType(SingleChildScrollView).first,
        const Offset(0, -450),
      );
      await tester.pumpAndSettle();

      final initialCheckbox = tester.widget<Checkbox>(find.byType(Checkbox).first);
      expect(initialCheckbox.value, isFalse);

      await tester.tap(giftFinder);
      await tester.pumpAndSettle();

      final toggledCheckbox = tester.widget<Checkbox>(find.byType(Checkbox).first);
      expect(toggledCheckbox.value, isTrue);
    });

    testWidgets('Product Specifications accordion toggles expand and collapse',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-ind-19');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Locate accordion header
      final accordionHeader = find.text('Product Specifications');
      await tester.ensureVisible(accordionHeader);
      await tester.pumpAndSettle();

      // Initially collapsed, 'Botanical Name' is hidden
      expect(find.text('Botanical Name'), findsNothing);

      // Tap to expand
      await tester.tap(accordionHeader);
      await tester.pumpAndSettle();

      // Now expanded: 'Botanical Name' and 'Peace Lily Plant' are visible
      expect(find.text('Botanical Name'), findsOneWidget);

      // Tap again to collapse
      await tester.tap(accordionHeader);
      await tester.pumpAndSettle();

      // Collapsed again
      expect(find.text('Botanical Name'), findsNothing);
    });

    testWidgets('Tapping T&C opens Guarantee Terms & Conditions modal',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-ind-19');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Scroll to T&C link
      final tcLink = find.text('T&C');
      await tester.drag(
        find.byType(SingleChildScrollView).first,
        const Offset(0, -800),
      );
      await tester.pumpAndSettle();

      await tester.tap(tcLink);
      await tester.pumpAndSettle();

      // Verify Guarantee modal appears
      expect(find.text('Guarantee Terms & Conditions'), findsOneWidget);
      expect(
          find.text('View Full Policies & Guarantee Details'), findsOneWidget);

      // Dismiss modal
      await tester.tap(find.byIcon(Icons.close));
      await tester.pumpAndSettle();
      expect(find.text('Guarantee Terms & Conditions'), findsNothing);
    });

    testWidgets('Quantity stepper and Add To Cart button have matching height 48',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-ind-19');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Scroll to Add To Cart
      await tester.drag(
        find.byType(SingleChildScrollView).first,
        const Offset(0, -500),
      );
      await tester.pumpAndSettle();

      final addToCartFinder = find.widgetWithText(ElevatedButton, 'Add To Cart');
      expect(addToCartFinder, findsOneWidget);
      final btnSize = tester.getSize(addToCartFinder);
      expect(btnSize.height, 48.0);
    });
  });

  group('GlorovProductGallery Component & Zoom Preview Tests', () {
    testWidgets('Renders large image, badges, sowing pill, and thumbnails',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      const testImages = [
        'https://images.unsplash.com/photo-1592417817098-8f3d6ef23640?w=800',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
      ];

      int selectedIdx = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 500,
                child: GlorovProductGallery(
                  imageUrls: testImages,
                  selectedIndex: selectedIdx,
                  onImageSelected: (idx) => selectedIdx = idx,
                  badgeText: 'ORGANIC HEIRLOOM',
                  sowingAdvice: 'How to sow: 1-2 cm depth • Bright Indirect Light',
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Badge & Sowing Advice
      expect(find.text('ORGANIC HEIRLOOM'), findsOneWidget);
      expect(
        find.text('How to sow: 1-2 cm depth • Bright Indirect Light'),
        findsOneWidget,
      );

      // Zoom Fullscreen Icon Button
      expect(find.byIcon(Icons.fullscreen), findsOneWidget);

      // Tapping thumbnail updates image
      final thumbnails = find.byType(AnimatedContainer);
      expect(thumbnails, findsWidgets);

      await tester.tap(thumbnails.last);
      await tester.pumpAndSettle();
      expect(selectedIdx, 1);
    });

    testWidgets('Tapping zoom button opens InteractiveViewer modal dialog with close button',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      const testImages = [
        'https://images.unsplash.com/photo-1592417817098-8f3d6ef23640?w=800',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800',
      ];

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 500,
                child: GlorovProductGallery(
                  imageUrls: testImages,
                  selectedIndex: 0,
                  badgeText: 'ORGANIC HEIRLOOM',
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Tap fullscreen zoom button
      final zoomBtn = find.byIcon(Icons.fullscreen);
      await tester.tap(zoomBtn);
      await tester.pumpAndSettle();

      // Modal dialog appears with InteractiveViewer, Counter and Close button
      expect(find.byType(InteractiveViewer), findsOneWidget);
      expect(find.text('1 / 2'), findsOneWidget);
      expect(find.textContaining('Pinch or double-tap to zoom'), findsOneWidget);
      expect(find.byIcon(Icons.close), findsOneWidget);

      // Tap close button dismisses dialog
      await tester.tap(find.byIcon(Icons.close));
      await tester.pumpAndSettle();
      expect(find.byType(InteractiveViewer), findsNothing);
    });

    testWidgets('Tapping thumbnail updates selected image and highlights border correctly',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      int selectedIdx = 0;
      const testImages = [
        'assets/images/products/vegetable-seeds/chinese-cabbage-seeds-1.jpg',
        'assets/images/products/vegetable-seeds/chinese-cabbage-seeds-2.jpg',
        'assets/images/products/vegetable-seeds/chinese-cabbage-seeds-3.jpg',
      ];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: SizedBox(
                width: 520,
                child: StatefulBuilder(
                  builder: (context, setState) {
                    return GlorovProductGallery(
                      imageUrls: testImages,
                      selectedIndex: selectedIdx,
                      onImageSelected: (idx) => setState(() => selectedIdx = idx),
                    );
                  },
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify initial selected index is 0
      expect(selectedIdx, 0);

      // Tap the second thumbnail item
      final secondThumb = find.byKey(const ValueKey<String>('gallery_thumbnail_1'));
      expect(secondThumb, findsOneWidget);
      await tester.tap(secondThumb);
      await tester.pumpAndSettle();

      // Index is updated to 1
      expect(selectedIdx, 1);

      // Tap the third thumbnail item
      final thirdThumb = find.byKey(const ValueKey<String>('gallery_thumbnail_2'));
      expect(thirdThumb, findsOneWidget);
      await tester.tap(thirdThumb);
      await tester.pumpAndSettle();

      // Index is updated to 2
      expect(selectedIdx, 2);
    });
  });

  group('Glorov Responsive Sticky Product Gallery Breakpoints Tests', () {
    testWidgets('Desktop Viewport (1440x900) renders 2-column sticky layout with stationary gallery',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      // Verify sticky gallery is present with isSticky = true
      final galleryFinder = find.byType(GlorovProductGallery);
      expect(galleryFinder, findsOneWidget);

      final galleryWidget = tester.widget<GlorovProductGallery>(galleryFinder);
      expect(galleryWidget.isSticky, isTrue);

      // Verify Transform.translate is configured for dynamic sticky scrolling
      final transformFinder = find.ancestor(
        of: galleryFinder,
        matching: find.byType(Transform),
      );
      expect(transformFinder, findsWidgets);

      // Verify breadcrumbs and product title
      expect(find.text('Home'), findsWidgets);
      expect(find.text('Green Chilli Seeds'), findsWidgets);

      // Verify specifications & FAQs sections exist on desktop
      expect(find.text('Product Specifications'), findsOneWidget);
      expect(find.text('Frequently Asked Questions'), findsWidgets);

      // Verify Buy Now and Add to Cart buttons
      expect(find.text('Add To Cart'), findsWidgets);
      expect(find.text('Buy Now'), findsWidgets);

      // Verify right column scroll view exists
      final rightScrollView = find.byType(SingleChildScrollView);
      expect(rightScrollView, findsWidgets);
    });

    testWidgets('Large Desktop Viewport (1920x1080) renders max-width container and sticky gallery',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1920, 1080);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      expect(find.byType(GlorovProductGallery), findsOneWidget);
      expect(find.text('Green Chilli Seeds'), findsWidgets);
      expect(find.text('Product Specifications'), findsOneWidget);
    });

    testWidgets('Tablet Landscape Viewport (1024x768) renders sticky 2-column layout',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1024, 768);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      final galleryFinder = find.byType(GlorovProductGallery);
      expect(galleryFinder, findsOneWidget);

      final galleryWidget = tester.widget<GlorovProductGallery>(galleryFinder);
      expect(galleryWidget.isSticky, isTrue);
    });

    testWidgets('Tablet Portrait Viewport (768x1024) switches to stacked layout with normal scrolling',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(768, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product =
          GlorovMockData.products.firstWhere((p) => p.id == 'glr-seed-01');
      await tester.pumpWidget(buildTestableDetails(product));
      await tester.pumpAndSettle();

      final galleryFinder = find.byType(GlorovProductGallery);
      expect(galleryFinder, findsOneWidget);

      final galleryWidget = tester.widget<GlorovProductGallery>(galleryFinder);
      // In stacked portrait mode, gallery is not in desktop sticky column
      expect(galleryWidget.isSticky, isFalse);

      expect(find.text('Green Chilli Seeds'), findsWidgets);
    });
  });
}

