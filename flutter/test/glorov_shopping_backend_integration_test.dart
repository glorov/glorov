import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shop/models/glorov/glorov_address.dart';
import 'package:shop/models/glorov/glorov_delivery_option.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_payment_method.dart';
import 'package:shop/repositories/mock/local_cart_repository.dart';
import 'package:shop/repositories/mock/local_order_repository.dart';
import 'package:shop/repositories/remote/medusa_api_config.dart';
import 'package:shop/repositories/remote/medusa_cart_repository.dart';
import 'package:shop/repositories/remote/medusa_http_client.dart';
import 'package:shop/repositories/remote/medusa_order_repository.dart';
import 'package:shop/services/glorov_cart_state.dart';
import 'package:shop/services/storage/local_storage.dart';

void main() {
  group('Prompt 5: GLOROV Cart & Order Complete Backend Integration Tests', () {
    late GlorovCartState cartState;

    setUp(() {
      GlorovLocalStorage.instance.clear();
      cartState = GlorovCartState.instance;
      cartState.clearCart();
    });

    test('LocalCartRepository adds, updates quantities, and calculates totals',
        () async {
      final repo = LocalCartRepository(cartState);
      final product = GlorovMockData.products.first;

      await repo.addItem(product, quantity: 2);
      expect(cartState.itemCount, 2);

      final items = await repo.getCartItems();
      expect(items.length, 1);
      expect(items.first.quantity, 2);

      await repo.updateQuantity(items.first.itemKey, 3);
      expect(cartState.itemCount, 3);

      final couponResult = await repo.validateCoupon('GLOROV10', 500.0);
      expect(couponResult.isValid, true);

      await repo.clearCart();
      expect(cartState.itemCount, 0);
    });

    test(
        'LocalOrderRepository places order, retrieves history, and tracks shipment',
        () async {
      final repo = LocalOrderRepository(cartState);
      final product = GlorovMockData.products.first;

      cartState.addToCart(product, quantity: 1);

      final order = await repo.placeOrder(
        items: cartState.items,
        address: GlorovAddress.sample,
        deliveryOption: GlorovDeliveryOption.standard,
        paymentMethod: GlorovPaymentMethod.cod,
        subtotal: cartState.subtotal,
        shippingCost: cartState.shippingCost,
        discountAmount: cartState.promoDiscountAmount,
        totalAmount: cartState.total,
      );

      expect(order.id, startsWith('GLR-ORD-'));
      expect(order.status, 'Confirmed');

      final orders = await repo.getOrders();
      expect(orders.any((o) => o.id == order.id), true);

      final tracking = await repo.getOrderTracking(order.id);
      expect(tracking, isNotNull);
      expect(tracking!['courier'], contains('Shiprocket'));

      final cancelRes =
          await repo.cancelOrder(order.id, reason: 'Duplicate order');
      expect(cancelRes.isSuccess, true);

      final returnRes = await repo.submitReturnRequest(
        order.id,
        reason: 'Plant damaged',
        itemIds: ['item_1'],
        notes: 'Leaves crushed in transit',
      );
      expect(returnRes.isSuccess, true);
    });

    test('MedusaCartRepository interacts with Medusa v2 /store/carts endpoints',
        () async {
      final mockHttp = MockClient((request) async {
        if (request.method == 'POST' && request.url.path == '/store/carts') {
          return http.Response(
            jsonEncode({
              'cart': {
                'id': 'cart_test_123',
                'items': [],
                'total': 0,
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            request.url.path == '/store/carts/cart_test_123/line-items') {
          return http.Response(
            jsonEncode({
              'cart': {
                'id': 'cart_test_123',
                'items': [
                  {
                    'id': 'item_1',
                    'title': 'Monstera Deliciosa',
                    'quantity': 1,
                    'unit_price': 59900,
                  }
                ],
                'total': 59900,
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            request.url.path == '/store/carts/cart_test_123/promotions') {
          return http.Response(
            jsonEncode({
              'cart': {
                'id': 'cart_test_123',
                'discount_total': 5990,
                'promotions': [
                  {'code': 'GLOROV10'}
                ],
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('{"error": "Not found"}', 404);
      });

      final client = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockHttp,
      );
      final repo = MedusaCartRepository(client, cartState);

      final product = GlorovMockData.products.first;
      await repo.addItem(product, quantity: 1);
      expect(cartState.itemCount, 1);

      final couponRes = await repo.validateCoupon('GLOROV10', 599.0);
      expect(couponRes.isValid, true);
    });

    test(
        'MedusaOrderRepository creates order via /store/carts/:id/complete and handles tracking',
        () async {
      final mockHttp = MockClient((request) async {
        final path = request.url.path;
        if (request.method == 'POST' && path == '/store/carts') {
          return http.Response(
            jsonEncode({
              'cart': {'id': 'cart_ord_999'}
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            path == '/store/carts/cart_ord_999/line-items') {
          return http.Response(
            jsonEncode({
              'cart': {'id': 'cart_ord_999'}
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            path == '/store/carts/cart_ord_999') {
          return http.Response(
            jsonEncode({
              'cart': {'id': 'cart_ord_999'}
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            path == '/store/carts/cart_ord_999/shipping-methods') {
          return http.Response(
            jsonEncode({
              'cart': {'id': 'cart_ord_999'}
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            path == '/store/carts/cart_ord_999/payment-sessions') {
          return http.Response(
            jsonEncode({
              'cart': {'id': 'cart_ord_999'}
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'POST' &&
            path == '/store/carts/cart_ord_999/complete') {
          return http.Response(
            jsonEncode({
              'type': 'order',
              'order': {
                'id': 'order_medusa_456',
                'status': 'pending',
                'created_at': DateTime.now().toIso8601String(),
                'total': 129800,
                'subtotal': 119900,
                'shipping_total': 9900,
                'discount_total': 0,
                'shipping_address': {
                  'first_name': 'Sourav',
                  'last_name': 'M',
                  'address_1': 'Green Villa, Botanical Lane',
                  'city': 'Kolkata',
                  'province': 'West Bengal',
                  'postal_code': '700001',
                  'phone': '+91 9876543210',
                },
                'items': [
                  {
                    'id': 'line_1',
                    'title': 'Monstera Deliciosa',
                    'quantity': 1,
                    'unit_price': 119900,
                  }
                ],
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        } else if (request.method == 'GET' &&
            path == '/store/orders/order_medusa_456/tracking') {
          return http.Response(
            jsonEncode({
              'tracking': {
                'tracking_number': 'SR-GLR-987654',
                'carrier': 'Shiprocket',
                'status': 'In Transit',
                'estimated_delivery': '2-3 Business Days',
                'checkpoints': [
                  {
                    'time': 'Today, 10:00 AM',
                    'location': 'Kolkata Botanical Hub',
                    'status': 'Out for Delivery',
                  }
                ],
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }
        return http.Response('{"error": "Path not found: $path"}', 404);
      });

      final client = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockHttp,
      );
      final repo = MedusaOrderRepository(client, cartState);

      final product = GlorovMockData.products.first;
      final order = await repo.placeOrder(
        items: [GlorovCartItem(product: product, quantity: 1)],
        address: GlorovAddress.sample,
        deliveryOption: GlorovDeliveryOption.standard,
        paymentMethod: GlorovPaymentMethod.cod,
        subtotal: 1199.0,
        shippingCost: 99.0,
        discountAmount: 0.0,
        totalAmount: 1298.0,
      );

      expect(order.id, 'order_medusa_456');
      expect(order.totalAmount, 1298.0); // 129800 minor units = 1298.0 rupees

      final tracking = await repo.getOrderTracking('order_medusa_456');
      expect(tracking, isNotNull);
      expect(tracking!['tracking']['carrier'], 'Shiprocket');
    });
  });
}
