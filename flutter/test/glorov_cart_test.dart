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

    test('Initial address book for first-time visitor is empty', () {
      final state = GlorovCartState.instance;
      state.resetDemoData();
      expect(state.addresses, isEmpty);
      expect(state.selectedAddress.isEmpty, isTrue);
    });

    test('Address book enforces single default address', () {
      final state = GlorovCartState.instance;
      state.setSampleAddressesForTesting();
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

    test('DIWALI20 requires minimum order of ₹2,299 and is rejected below limit', () {
      final state = GlorovCartState.instance;
      state.clearCart();

      // Add single seed packet (unit price ~119)
      final product = GlorovMockData.products.first;
      state.addToCart(product, quantity: 1);
      expect(state.subtotal < 2299, isTrue);

      final (success, msg) = state.applyCoupon('DIWALI20');
      expect(success, isFalse);
      expect(state.appliedPromoCode, isNull);
      expect(msg, contains('Add ₹'));
      expect(msg, contains('2,299'));
    });

    test('When quantity is reduced below coupon limit, offer is automatically removed', () {
      final state = GlorovCartState.instance;
      state.clearCart();

      final product = GlorovMockData.products.first;
      // Add 35 packets so subtotal exceeds 2,299 (35 * 79 = 2,765)
      state.addToCart(product, quantity: 35);
      expect(state.subtotal >= 2299, isTrue);

      // Apply 20% discount (DIWALI20)
      final (applied, _) = state.applyCoupon('DIWALI20');
      expect(applied, isTrue);
      expect(state.appliedPromoCode, 'DIWALI20');
      expect(state.promoDiscountAmount, closeTo(state.subtotal * 0.20, 0.01));

      // Reduce quantity down to 1 (subtotal ~119, below limit)
      final key = state.items.first.itemKey;
      state.updateQuantity(key, 1);

      // Coupon MUST be automatically removed
      expect(state.subtotal < 2299, isTrue);
      expect(state.appliedPromoCode, isNull);
      expect(state.promoDiscountAmount, 0.0);
      expect(state.hasPendingCouponRevocationNotice, isTrue);
      expect(state.couponRevocationNotice, contains('DIWALI20'));
      expect(state.couponRevocationNotice, contains('2299'));

      // Consuming notice clears pending notice
      final consumed = state.consumeCouponRevocationNotice();
      expect(consumed, isNotNull);
      expect(state.hasPendingCouponRevocationNotice, isFalse);
    });

    test('When 10% is applied and cart reaches higher target price, higherUnlockedOffer detects 15% and 20%', () {
      final state = GlorovCartState.instance;
      state.clearCart();

      final product = GlorovMockData.products.first;
      // Set subtotal to ~1,200 (eligible for 10% DIWALI10)
      final unitPrice = product.effectivePrice;
      final qtyFor10 = (1100 / unitPrice).ceil();
      state.addToCart(product, quantity: qtyFor10);
      expect(state.subtotal >= 999 && state.subtotal < 1599, isTrue);

      // Apply 10%
      state.applyCoupon('DIWALI10');
      expect(state.appliedPromoCode, 'DIWALI10');
      expect(state.higherUnlockedOffer, isNull); // 15% and 20% not yet unlocked

      // Add more items so subtotal reaches >= 1,599 (15% unlocked)
      final qtyFor15 = (1650 / unitPrice).ceil();
      state.updateQuantity(state.items.first.itemKey, qtyFor15);
      expect(state.subtotal >= 1599 && state.subtotal < 2299, isTrue);

      // System must detect and offer 15% (DIWALI15)
      expect(state.higherUnlockedOffer, isNotNull);
      expect(state.higherUnlockedOffer!.code, 'DIWALI15');
      expect(state.higherUnlockedOffer!.discountPercent, 15.0);

      // Add more items so subtotal reaches >= 2,299 (20% unlocked)
      final qtyFor20 = (2400 / unitPrice).ceil();
      state.updateQuantity(state.items.first.itemKey, qtyFor20);
      expect(state.subtotal >= 2299, isTrue);

      // System must now detect and offer 20% (DIWALI20)
      expect(state.higherUnlockedOffer, isNotNull);
      expect(state.higherUnlockedOffer!.code, 'DIWALI20');
      expect(state.higherUnlockedOffer!.discountPercent, 20.0);

      // Apply higher offer (DIWALI20)
      final (upgraded, _) = state.applyCoupon(state.higherUnlockedOffer!.code);
      expect(upgraded, isTrue);
      expect(state.appliedPromoCode, 'DIWALI20');
      expect(state.promoDiscountAmount, closeTo(state.subtotal * 0.20, 0.01));
      expect(state.higherUnlockedOffer, isNull); // Already at maximum
    });

    test('Removing item from cart automatically revokes coupon if below limit', () {
      final state = GlorovCartState.instance;
      state.clearCart();

      final p1 = GlorovMockData.products[0];
      final p2 = GlorovMockData.products[1];

      state.addToCart(p1, quantity: 15);
      state.addToCart(p2, quantity: 15);
      expect(state.subtotal >= 2299, isTrue);

      state.applyCoupon('DIWALI20');
      expect(state.appliedPromoCode, 'DIWALI20');

      // Remove second product so subtotal drops below 2,299
      state.updateQuantity(state.items[0].itemKey, 1);
      state.removeFromCart(state.items[1].itemKey);

      expect(state.subtotal < 2299, isTrue);
      expect(state.appliedPromoCode, isNull);
      expect(state.promoDiscountAmount, 0.0);
      expect(state.hasPendingCouponRevocationNotice, isTrue);
    });
  });
}
