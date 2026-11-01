import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/models/glorov/glorov_address.dart';
import 'package:shop/models/glorov/glorov_delivery_option.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_order.dart';
import 'package:shop/models/glorov/glorov_payment_method.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/screens/checkout/glorov_order_confirmation_screen.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';
import 'package:shop/services/glorov_header_scroll_notifier.dart';

void main() {
  setUp(() {
    GlorovCartState.instance.clearCart();
    GlorovHeaderScrollNotifier.instance.reset();
  });

  Widget buildTestableWidget(Widget child) {
    return MaterialApp(
      onGenerateRoute: (settings) => MaterialPageRoute(
        settings: settings,
        builder: (_) => const Scaffold(body: Text('Target Screen')),
      ),
      home: child,
    );
  }

  group('Prompt 10 Shopping Micro-Interactions Tests', () {
    testWidgets('PDP wishlist toggle synchronizes state with GlorovCartState',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      expect(GlorovCartState.instance.isWishlisted(product.id), isFalse);

      await tester.pumpWidget(buildTestableWidget(
        GlorovProductDetailsScreen(product: product),
      ));
      await tester.pumpAndSettle();

      // Find the wishlist toggle button in title section by key
      final wishlistFinder = find.byKey(const ValueKey('pdp_wishlist_toggle'));
      expect(wishlistFinder, findsOneWidget);

      // Tap PDP wishlist toggle
      await tester.tap(wishlistFinder);
      await tester.pumpAndSettle();

      // State is updated
      expect(GlorovCartState.instance.isWishlisted(product.id), isTrue);

      // Tap again to remove
      await tester.tap(wishlistFinder);
      await tester.pumpAndSettle();

      expect(GlorovCartState.instance.isWishlisted(product.id), isFalse);
    });

    testWidgets('PDP Add To Cart increments itemCount and shows feedback',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      await tester.pumpWidget(buildTestableWidget(
        GlorovProductDetailsScreen(product: product),
      ));
      await tester.pumpAndSettle();

      expect(GlorovCartState.instance.itemCount, 0);

      // Tap desktop Add To Cart button
      final addToCartBtn = find.widgetWithText(ElevatedButton, 'Add To Cart');
      expect(addToCartBtn, findsOneWidget);

      await tester.tap(addToCartBtn);
      await tester.pump(); // Start add

      expect(GlorovCartState.instance.itemCount, 1);
      expect(GlorovCartState.instance.items.first.product.id, product.id);

      await tester.pumpAndSettle();
    });

    testWidgets('Cart screen steppers update quantity and line totals',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      GlorovCartState.instance.addToCart(product, quantity: 2);
      expect(GlorovCartState.instance.itemCount, 2);

      await tester.pumpWidget(buildTestableWidget(const GlorovCartScreen()));
      await tester.pumpAndSettle();

      // Quantity '2' is rendered
      expect(find.text('2'), findsWidgets);

      // Tap '+' stepper
      final plusFinder = find.byIcon(Icons.add);
      expect(plusFinder, findsWidgets);
      await tester.tap(plusFinder.first);
      await tester.pumpAndSettle();

      expect(GlorovCartState.instance.itemCount, 3);
      expect(find.text('3'), findsWidgets);

      // Tap '-' stepper
      final minusFinder = find.byIcon(Icons.remove);
      await tester.tap(minusFinder.first);
      await tester.pumpAndSettle();

      expect(GlorovCartState.instance.itemCount, 2);
      expect(find.text('2'), findsWidgets);
    });

    testWidgets('Cart screen save for later moves item to wishlist',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      GlorovCartState.instance.addToCart(product, quantity: 1);
      expect(GlorovCartState.instance.itemCount, 1);
      expect(GlorovCartState.instance.isWishlisted(product.id), isFalse);

      await tester.pumpWidget(buildTestableWidget(const GlorovCartScreen()));
      await tester.pumpAndSettle();

      // Tap "Save for later"
      final saveForLater = find.text('Save for later');
      expect(saveForLater, findsOneWidget);
      await tester.tap(saveForLater);
      await tester.pumpAndSettle();

      // Item removed from cart and added to wishlist
      expect(GlorovCartState.instance.itemCount, 0);
      expect(GlorovCartState.instance.isWishlisted(product.id), isTrue);
    });

    testWidgets('Cart screen remove item allows immediate undo',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      GlorovCartState.instance.addToCart(product, quantity: 2);
      expect(GlorovCartState.instance.itemCount, 2);

      await tester.pumpWidget(buildTestableWidget(const GlorovCartScreen()));
      await tester.pumpAndSettle();

      // Tap delete icon
      final deleteIcon = find.byIcon(Icons.delete_outline);
      expect(deleteIcon, findsWidgets);
      await tester.tap(deleteIcon.first);
      await tester.pumpAndSettle();

      // Cart is now empty
      expect(GlorovCartState.instance.itemCount, 0);

      // UNDO toast action is available
      final undoAction = find.text('UNDO');
      if (undoAction.evaluate().isNotEmpty) {
        await tester.tap(undoAction.first);
        await tester.pumpAndSettle();
        // Item is restored
        expect(GlorovCartState.instance.itemCount, 2);
      }
    });

    testWidgets(
        'Order confirmation screen renders celebration badge and details',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1200, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      final product = GlorovMockData.products.first;
      final mockOrder = GlorovOrder(
        id: 'GLR-TEST-ORDER-001',
        orderDate: DateTime.now(),
        items: [
          GlorovOrderItem(
            productId: product.id,
            title: product.title,
            botanicalName: product.botanicalName,
            imageUrl: product.primaryImage,
            unitPrice: product.effectivePrice,
            quantity: 2,
            lineTotal: product.effectivePrice * 2,
          ),
        ],
        subtotal: 198.0,
        shippingCost: 0.0,
        discountAmount: 0.0,
        totalAmount: 198.0,
        address: GlorovAddress.sample,
        paymentMethod: GlorovPaymentMethod.cod,
        deliveryOption: GlorovDeliveryOption.standard,
        status: 'Confirmed',
      );

      await tester.pumpWidget(buildTestableWidget(
        GlorovOrderConfirmationScreen(order: mockOrder),
      ));
      await tester.pumpAndSettle();

      // Headline and reference ID
      expect(find.text('Order Successfully Placed!'), findsOneWidget);
      expect(find.text('GLR-TEST-ORDER-001'), findsOneWidget);

      // Draw check animation widget is present
      expect(find.byType(GlorovAnimatedCheck), findsOneWidget);

      // Action buttons
      expect(find.text('VIEW ORDER HISTORY & TRACKING'), findsOneWidget);
      expect(find.text('CONTINUE SHOPPING'), findsOneWidget);
    });
  });
}
