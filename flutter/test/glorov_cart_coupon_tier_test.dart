import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';
import 'package:shop/services/storage/local_storage.dart';

void main() {
  setUp(() {
    GlorovLocalStorage.instance.clear();
    GlorovCartState.instance.clearCart();
  });

  tearDown(() {
    GlorovLocalStorage.instance.clear();
    GlorovCartState.instance.clearCart();
  });

  group('Cart Screen Coupon Tier & Limit Enforcement Widget Tests', () {
    testWidgets(
      'Milestone roadmap nodes are interactive: Tapping unreached 20% displays shortfall message',
      (tester) async {
        tester.view.physicalSize = const Size(1280, 800);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        final product = GlorovMockData.products.first; // effectivePrice ~79
        GlorovCartState.instance.addToCart(product, quantity: 1); // subtotal = 79

        await tester.pumpWidget(
          const MaterialApp(
            home: GlorovCartScreen(),
          ),
        );
        await tester.pumpAndSettle();

        // Find the 20% milestone circle
        final node20 = find.text('20%');
        expect(node20, findsWidgets);

        // Tap the 20% node
        await tester.tap(node20.first);
        await tester.pumpAndSettle();

        // Should inform user how much more is needed to reach 20% (2299 - 79 = 2220)
        expect(find.textContaining('Add ₹2220 more to unlock 20% OFF'), findsOneWidget);
      },
    );

    testWidgets(
      'Reducing item quantity below 20% limit (₹2,299) automatically removes coupon and updates order summary',
      (tester) async {
        tester.view.physicalSize = const Size(1280, 900);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        final product = GlorovMockData.products.first; // ~79
        // Add 35 items so subtotal = 2765 > 2299
        GlorovCartState.instance.addToCart(product, quantity: 35);
        GlorovCartState.instance.applyCoupon('DIWALI20');

        expect(GlorovCartState.instance.appliedPromoCode, 'DIWALI20');
        expect(GlorovCartState.instance.promoDiscountAmount, closeTo(2765 * 0.20, 0.01));

        await tester.pumpWidget(
          const MaterialApp(
            home: GlorovCartScreen(),
          ),
        );
        await tester.pumpAndSettle();

        // Verify coupon discount row is initially visible in order summary
        expect(find.textContaining('DIWALI20'), findsWidgets);

        // Simulate user decreasing quantity directly below the threshold to 1
        final itemKey = GlorovCartState.instance.items.first.itemKey;
        GlorovCartState.instance.updateQuantity(itemKey, 1);
        await tester.pumpAndSettle();

        // Coupon MUST be removed automatically
        expect(GlorovCartState.instance.appliedPromoCode, isNull);
        expect(GlorovCartState.instance.promoDiscountAmount, 0.0);

        // Coupon row should no longer be present in Order Summary
        expect(find.textContaining('Coupon Discount (DIWALI20)'), findsNothing);
      },
    );

    testWidgets(
      'When 10% is applied and cart reaches ₹1,599, higher offer banner appears and can be upgraded',
      (tester) async {
        tester.view.physicalSize = const Size(1280, 900);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        final product = GlorovMockData.products.first; // ~79
        // Add 15 items so subtotal = 1185 (>= 999 for DIWALI10, but < 1599 for DIWALI15)
        GlorovCartState.instance.addToCart(product, quantity: 15);
        GlorovCartState.instance.applyCoupon('DIWALI10');

        await tester.pumpWidget(
          const MaterialApp(
            home: GlorovCartScreen(),
          ),
        );
        await tester.pumpAndSettle();

        expect(GlorovCartState.instance.appliedPromoCode, 'DIWALI10');
        // Initially no higher offer banner
        expect(find.text('15% OFF Unlocked!'), findsNothing);

        // Add 10 more items so subtotal = 25 * 79 = 1975 (>= 1599, unlocks 15%)
        final itemKey = GlorovCartState.instance.items.first.itemKey;
        GlorovCartState.instance.updateQuantity(itemKey, 25);
        await tester.pumpAndSettle();

        // Higher offer banner must appear!
        expect(find.text('15% OFF Unlocked!'), findsOneWidget);
        expect(find.text('APPLY 15% OFF'), findsOneWidget);

        // Tap "APPLY 15% OFF" button
        await tester.tap(find.text('APPLY 15% OFF'));
        await tester.pumpAndSettle();

        // Coupon must be upgraded to DIWALI15!
        expect(GlorovCartState.instance.appliedPromoCode, 'DIWALI15');
        expect(GlorovCartState.instance.promoDiscountAmount, closeTo(1975 * 0.15, 0.01));
      },
    );

    testWidgets(
      'Milestone roadmap displays all 4 goals (FREE, 10%, 15%, 20%) and FREE node is interactive',
      (tester) async {
        tester.view.physicalSize = const Size(1280, 900);
        tester.view.devicePixelRatio = 1.0;
        addTearDown(tester.view.resetPhysicalSize);
        addTearDown(tester.view.resetDevicePixelRatio);

        final product = GlorovMockData.products.first; // effectivePrice ~79
        GlorovCartState.instance.addToCart(product, quantity: 1); // subtotal = 79 (< 499)

        await tester.pumpWidget(
          const MaterialApp(
            home: GlorovCartScreen(),
          ),
        );
        await tester.pumpAndSettle();

        // Verify all 4 goals are rendered
        expect(find.text('FREE'), findsWidgets);
        expect(find.text('10%'), findsWidgets);
        expect(find.text('15%'), findsWidgets);
        expect(find.text('20%'), findsWidgets);

        // Tap FREE node when unreached (shortfall: 499 - 79 = 420)
        await tester.tap(find.text('FREE').first);
        await tester.pumpAndSettle();
        expect(
          find.textContaining('Add ₹420 more to unlock Free Express Delivery'),
          findsOneWidget,
        );

        // Now increase quantity so subtotal >= 499 (7 * 79 = 553)
        final itemKey = GlorovCartState.instance.items.first.itemKey;
        GlorovCartState.instance.updateQuantity(itemKey, 7);
        await tester.pumpAndSettle();

        // Tap FREE node when reached
        await tester.tap(find.text('FREE').first);
        await tester.pumpAndSettle();
        expect(
          find.textContaining('Free Express Delivery is unlocked for this order'),
          findsOneWidget,
        );
      },
    );
  });
}
