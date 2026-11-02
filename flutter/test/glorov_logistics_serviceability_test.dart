import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/logistics/glorov_delivery_availability_alert.dart';
import 'package:shop/models/glorov/glorov_address.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_pincode_result.dart';
import 'package:shop/models/glorov/glorov_product.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/screens/checkout/glorov_checkout_screen.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/services/glorov_account_state.dart';
import 'package:shop/services/glorov_cart_state.dart';
import 'package:shop/services/glorov_logistics_service.dart';

void main() {
  setUp(() {
    GlorovRepositories.init(mode: RepositoryMode.mock);
    GlorovAccountState.instance.setAuthenticatedForTesting(true);
    GlorovCartState.instance.clearCart();
    GlorovLogisticsService.instance.setLogisticsConnectedForTesting(false);
  });

  group('1. GlorovLogisticsService Domain Logic Tests', () {
    test('Rejects invalid format PIN codes with informative guidance', () async {
      final service = GlorovLogisticsService.instance;

      // Too short
      final shortRes = await service.checkPincode('41100');
      expect(shortRes.serviceable, isFalse);
      expect(shortRes.status, 'rejected');
      expect(shortRes.message, contains('Please enter a valid 6-digit Indian PIN code'));

      // Starts with zero
      final zeroRes = await service.checkPincode('011001');
      expect(zeroRes.serviceable, isFalse);
      expect(zeroRes.status, 'rejected');

      // Alpha characters
      final alphaRes = await service.checkPincode('41100A');
      expect(alphaRes.serviceable, isFalse);
      expect(alphaRes.status, 'rejected');
    });

    test(
        'When logistics is not connected in dashboard, always returns unserviceable with standard message',
        () async {
      final service = GlorovLogisticsService.instance;
      service.setLogisticsConnectedForTesting(false);
      expect(service.isLogisticsConnected, isFalse);

      final res = await service.checkPincode('411001');
      expect(res.serviceable, isFalse);
      expect(res.isLogisticsConnected, isFalse);
      expect(res.isLogisticsDisconnected, isTrue);
      expect(res.status, 'logistics_not_connected');
      expect(res.message,
          'Delivery service currently not available on this location.');
      expect(res.detailedMessage,
          contains('Our courier and logistics network is not connected for this area'));
    });

    test(
        'When logistics IS connected in dashboard, valid PIN returns estimated delivery and courier',
        () async {
      final service = GlorovLogisticsService.instance;
      service.setLogisticsConnectedForTesting(true);
      expect(service.isLogisticsConnected, isTrue);

      final res = await service.checkPincode('411001');
      expect(res.serviceable, isTrue);
      expect(res.isLogisticsConnected, isTrue);
      expect(res.status, 'confirmed');
      expect(res.city, 'Pune');
      expect(res.estimatedDays, isNotNull);
      expect(res.courierName, isNotNull);
      expect(res.message, contains('Delivered by:'));
    });

    test('When logistics IS connected, remote unserved PIN (999xxx) returns unserviceable',
        () async {
      final service = GlorovLogisticsService.instance;
      service.setLogisticsConnectedForTesting(true);

      final res = await service.checkPincode('999123');
      expect(res.serviceable, isFalse);
      expect(res.status, 'rejected');
      expect(res.message,
          'Delivery service currently not available on this location.');
    });

    test('Toggling logistics connectivity notifies listeners', () async {
      final service = GlorovLogisticsService.instance;
      service.setLogisticsConnectedForTesting(false);

      bool notified = false;
      void listener() => notified = true;
      service.addListener(listener);

      await service.setLogisticsConnected(true);
      expect(service.isLogisticsConnected, isTrue);
      expect(notified, isTrue);

      service.removeListener(listener);
    });
  });

  group('2. GlorovDeliveryAvailabilityAlert Widget Tests', () {
    testWidgets('Renders loading spinner when verifying serviceability',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovDeliveryAvailabilityAlert(
              result: null,
              isLoading: true,
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Verifying courier network serviceability...'),
          findsOneWidget);
    });

    testWidgets(
        'Renders unserviceable alert when logistics is not connected',
        (tester) async {
      bool tryAnotherTapped = false;
      bool contactSupportTapped = false;

      final result = GlorovPincodeResult.logisticsNotConnected(
        pincode: '411001',
      );

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovDeliveryAvailabilityAlert(
              result: result,
              onTryAnother: () => tryAnotherTapped = true,
              onContactSupport: () => contactSupportTapped = true,
            ),
          ),
        ),
      );

      expect(find.text('Delivery service currently not available on this location.'),
          findsOneWidget);
      expect(
          find.textContaining('Our courier and logistics network is not connected'),
          findsOneWidget);
      expect(find.byIcon(Icons.location_off_outlined), findsOneWidget);
      expect(find.text('Change PIN'), findsOneWidget);
      expect(find.text('Contact Support'), findsOneWidget);

      await tester.tap(find.text('Change PIN'));
      expect(tryAnotherTapped, isTrue);

      await tester.tap(find.text('Contact Support'));
      expect(contactSupportTapped, isTrue);
    });

    testWidgets('Renders success card when serviceable', (tester) async {
      const result = GlorovPincodeResult(
        pincode: '411001',
        serviceable: true,
        status: 'confirmed',
        city: 'Pune',
        message: 'Delivery available by Fri, 7 Nov',
        detailedMessage: 'Express Botanical Air Corridor (2 business days)',
        courierName: 'Shiprocket Botanical Air Express',
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovDeliveryAvailabilityAlert(
              result: result,
            ),
          ),
        ),
      );

      expect(find.text('Delivery available by Fri, 7 Nov'), findsOneWidget);
      expect(
          find.text('Express Botanical Air Corridor (2 business days)'),
          findsOneWidget);
      expect(find.text('Shiprocket Botanical Air Express'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle_rounded), findsOneWidget);
    });
  });

  group('3. Product Details Page (PDP) Pincode Checker Integration', () {
    testWidgets(
        'PDP checks PIN code and displays delivery unavailable alert when logistics is not connected',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      GlorovLogisticsService.instance.setLogisticsConnectedForTesting(false);

      final product = GlorovMockData.products.firstWhere(
        (p) => p.productType == GlorovProductType.plants,
        orElse: () => GlorovMockData.products.first,
      );

      await tester.pumpWidget(
        MaterialApp(
          home: GlorovProductDetailsScreen(product: product),
        ),
      );
      await tester.pumpAndSettle();

      // Find pincode text field and enter 411001
      final pinField = find.widgetWithText(TextField, 'Enter 6-digit Pincode');
      expect(pinField, findsOneWidget);
      await tester.enterText(pinField, '411001');
      await tester.pumpAndSettle();

      // Tap CHECK button
      final checkBtn = find.text('CHECK').first;
      await tester.tap(checkBtn);
      await tester.pumpAndSettle();

      // Expect the unserviceable message to appear
      expect(
          find.text('Delivery service currently not available on this location.'),
          findsOneWidget);
      expect(
          find.textContaining('Our courier and logistics network is not connected'),
          findsOneWidget);
    });
  });

  group('4. Cart Screen Pincode Check Integration', () {
    testWidgets(
        'Cart screen checks PIN and renders unavailable alert when logistics is not connected',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      GlorovLogisticsService.instance.setLogisticsConnectedForTesting(false);

      final product = GlorovMockData.products.first;
      GlorovCartState.instance.addToCart(product, quantity: 1);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tap "Change" to expand pincode field
      final changeBtn = find.text('Change');
      if (changeBtn.evaluate().isNotEmpty) {
        await tester.tap(changeBtn);
        await tester.pumpAndSettle();
      }

      final pinField = find.widgetWithText(TextField, 'Enter 6-digit Pincode');
      if (pinField.evaluate().isNotEmpty) {
        await tester.enterText(pinField, '411001');
        await tester.pumpAndSettle();

        final checkBtn = find.text('CHECK');
        await tester.tap(checkBtn);
        await tester.pumpAndSettle();

        expect(
            find.text('Delivery service currently not available on this location.'),
            findsWidgets);
      }
    });
  });

  group('5. Checkout Screen Delivery Address & Order Guard Integration', () {
    testWidgets(
        'Checkout shows delivery unavailable alert and blocks order placement when logistics is not connected',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      GlorovLogisticsService.instance.setLogisticsConnectedForTesting(false);

      final product = GlorovMockData.products.first;
      GlorovCartState.instance.addToCart(product, quantity: 1);

      // Pre-seed address with 411001
      GlorovCartState.instance.setAddress(
        const GlorovAddress(
          fullName: 'Aarav Sharma',
          phoneNumber: '9876543210',
          addressLine: 'Flat 402, Green Meadows',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001',
        ),
      );

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCheckoutScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Check that the delivery unavailable alert is displayed on the address card
      expect(
          find.text('Delivery service currently not available on this location.'),
          findsWidgets);

      // Attempt to place order
      final placeOrderBtn = find.text('CONFIRM & PLACE ORDER').first;
      await tester.tap(placeOrderBtn);
      await tester.pumpAndSettle();

      // Cart should NOT be cleared because order placement was blocked by logistics guard!
      expect(GlorovCartState.instance.items.length, 1);
    });
  });
}
