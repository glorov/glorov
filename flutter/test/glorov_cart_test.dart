import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_address.dart';
import 'package:shop/models/glorov/glorov_delivery_option.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_payment_method.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  setUp(() {
    GlorovCartState.instance.resetDemoData();
  });

  group('GlorovCartState Core Math & Lifecycle', () {
    test('Initial cart is empty with zero subtotal and items', () {
      final state = GlorovCartState.instance;
      expect(state.items, isEmpty);
      expect(state.itemCount, 0);
      expect(state.subtotal, 0.0);
      expect(state.total, 0.0);
    });

    test('Adding product increments itemCount and subtotal accurately', () {
      final state = GlorovCartState.instance;
      final product =
          GlorovMockData.products.first; // Monstera Deliciosa (₹899)

      state.addToCart(product, quantity: 2);
      expect(state.itemCount, 2);
      expect(state.subtotal, product.effectivePrice * 2);
    });

    test('Different variants of same product create distinct line items', () {
      final state = GlorovCartState.instance;
      final product = GlorovMockData.products.first; // has variants
      final v1 = product.variants.first;
      final v2 = product.variants.last;

      state.addToCart(product, variant: v1, quantity: 1);
      state.addToCart(product, variant: v2, quantity: 1);

      expect(state.items.length, 2);
      expect(state.itemCount, 2);
    });

    test('Free shipping threshold dynamically activates at >= ₹999', () {
      final state = GlorovCartState.instance;
      final seed =
          GlorovMockData.products.firstWhere((p) => p.effectivePrice < 500);

      state.addToCart(seed, quantity: 1); // e.g. ₹249
      expect(state.subtotal < 999.0, isTrue);
      expect(state.isFreeShippingEligible, isFalse);
      expect(state.shippingCost, 99.0);

      // Add enough to cross ₹999
      state.addToCart(seed, quantity: 12);
      expect(state.subtotal >= 999.0, isTrue);
      expect(state.isFreeShippingEligible, isTrue);
      expect(state.shippingCost, 0.0);
    });

    test('Promo coupon GLOROV10 applies 10% discount', () {
      final state = GlorovCartState.instance;
      final product =
          GlorovMockData.products.firstWhere((p) => p.effectivePrice >= 500);
      state.addToCart(product, quantity: 1);

      final beforeDiscount = state.subtotal;
      final (success, _) = state.applyCoupon('GLOROV10');
      expect(success, isTrue);
      expect(state.appliedPromoCode, 'GLOROV10');
      expect(state.promoDiscountAmount, closeTo(beforeDiscount * 0.10, 0.01));
    });

    test('Wishlist toggles and tracks product IDs', () {
      final state = GlorovCartState.instance;
      const pid = 'prod_cherry_tomato';

      expect(state.isInWishlist(pid), isFalse);
      state.toggleWishlist(pid);
      expect(state.isInWishlist(pid), isTrue);
      expect(state.wishlistIds.contains(pid), isTrue);

      state.toggleWishlist(pid);
      expect(state.isInWishlist(pid), isFalse);
    });

    test('Simulated order placement records snapshot and clears cart', () {
      final state = GlorovCartState.instance;
      final product = GlorovMockData.products.first;
      state.addToCart(product, quantity: 1);
      state.applyCoupon('GLOROV10');

      final order = state.placeOrder(
        address: GlorovAddress.sample,
        paymentMethod: GlorovPaymentMethod.upi,
        deliveryOption: GlorovDeliveryOption.standard,
      );

      expect(order.id, startsWith('GLR-ORD-'));
      expect(order.items.length, 1);
      expect(state.items, isEmpty);
      expect(state.itemCount, 0);
      expect(state.appliedPromoCode, isNull);
      expect(state.orders.first.id, order.id);
    });

    test('Address book enforces single default address', () {
      final state = GlorovCartState.instance;
      expect(state.addresses.isNotEmpty, isTrue);

      const newAddr = GlorovAddress(
        id: 'addr_new_test',
        fullName: 'Test User',
        phoneNumber: '9123456789',
        addressLine: '45 Lotus Lane',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true,
      );

      state.addAddress(newAddr);
      final defaults = state.addresses.where((a) => a.isDefault).toList();
      expect(defaults.length, 1);
      expect(defaults.first.id, 'addr_new_test');
    });
  });
}
