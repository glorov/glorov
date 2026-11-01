import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  setUp(() {
    GlorovCartState.instance.resetDemoData();
  });

  group('GlorovCartScreen UI Goal & Hierarchy Enhancements', () {
    testWidgets('Subtotal >= 999 shows direct APPLY button and tapping directly applies coupon',
        (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final state = GlorovCartState.instance;
      // Add items to reach subtotal >= 999
      final seed = GlorovMockData.products.first; // e.g. price 79 or 119
      state.addToCart(seed, quantity: 20); // subtotal > 1500
      expect(state.subtotal, greaterThanOrEqualTo(999.0));
      expect(state.appliedPromoCode, isNull);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Find the direct APPLY button in the coupon voucher card
      final applyButton = find.text('APPLY');
      await tester.ensureVisible(applyButton);
      expect(applyButton, findsOneWidget);

      // Verify the coupon code is advertised directly in the card title
      expect(find.textContaining('DIWALI'), findsWidgets);

      // Tap APPLY directly
      await tester.tap(applyButton);
      await tester.pumpAndSettle();

      // Coupon should be directly applied
      expect(state.appliedPromoCode, isNotNull);
      expect(state.appliedPromoCode, startsWith('DIWALI'));

      // Modal should NOT have been opened
      expect(find.text('Available Offers'), findsNothing);

      // Card should now show Remove button
      final removeBtn = find.text('Remove');
      await tester.ensureVisible(removeBtn);
      expect(removeBtn, findsOneWidget);
    });

    testWidgets('Subtotal < 999 does NOT show APPLY button and shows shortfall hint',
        (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final state = GlorovCartState.instance;
      // Add a single item with price < 999
      final seed = GlorovMockData.products.firstWhere((p) => p.effectivePrice < 500);
      state.addToCart(seed, quantity: 1);
      expect(state.subtotal, lessThan(999.0));
      expect(state.appliedPromoCode, isNull);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Invariant: APPLY button must NOT be present when no coupon is applicable
      expect(find.text('APPLY'), findsNothing);

      // Shortfall hint text is shown
      expect(find.textContaining('more to unlock 10% OFF'), findsOneWidget);

      // Tapping "View all available coupons" opens the modal
      final viewAll = find.text('View all available coupons');
      await tester.ensureVisible(viewAll);
      expect(viewAll, findsOneWidget);
      await tester.tap(viewAll);
      await tester.pumpAndSettle();

      // Modal "Available Offers" is now open
      expect(find.text('Available Offers'), findsOneWidget);
    });

    testWidgets('Recommended Products section is displayed prominently above coupon and pincode box',
        (tester) async {
      tester.view.physicalSize = const Size(800, 1400);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final state = GlorovCartState.instance;
      final seed = GlorovMockData.products.first;
      state.addToCart(seed, quantity: 2);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Verify Recommended Products heading is present
      expect(find.text('Recommended Products'), findsOneWidget);

      // Verify delivery pincode box is present in the lower section
      expect(find.textContaining('Deliver to', findRichText: true), findsWidgets);
    });
  });
}
