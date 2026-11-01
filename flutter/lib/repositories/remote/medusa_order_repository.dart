import '../../models/glorov/glorov_address.dart';
import '../../models/glorov/glorov_delivery_option.dart';
import '../../models/glorov/glorov_order.dart';
import '../../models/glorov/glorov_payment_method.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/storage/local_storage.dart';
import '../contracts/order_repository.dart';
import 'api_result.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa v2 Storefront API Implementation of OrderRepository
/// Integrates with `/store/orders`, `/store/carts/:id/complete`,
/// and Indian logistics tracking/cancellation endpoints.
class MedusaOrderRepository implements OrderRepository {
  final MedusaHttpClient client;
  final GlorovCartState _state;
  final GlorovLocalStorage _storage;

  MedusaOrderRepository(
    this.client, [
    GlorovCartState? state,
    GlorovLocalStorage? storage,
  ])  : _state = state ?? GlorovCartState.instance,
        _storage = storage ?? GlorovLocalStorage.instance;

  @override
  Future<List<GlorovOrder>> getOrders() async {
    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.get<List<GlorovOrder>>(
      '${MedusaEndpoints.orders}?fields=*items,*items.variant,*shipping_address,*shipping_methods,*summary,*payment_collections',
      headers: headers,
      parser: (json) {
        if (json is Map && json['orders'] is List) {
          return (json['orders'] as List)
              .map((o) => GlorovOrder.fromMedusaJson(o as Map<String, dynamic>))
              .toList();
        }
        return <GlorovOrder>[];
      },
    );

    if (result.isSuccess && result.requireData.isNotEmpty) {
      _state.setOrders(result.requireData);
      return result.requireData;
    }
    return _state.orders;
  }

  @override
  Future<GlorovOrder?> getOrderById(String orderId) async {
    final cleanId =
        orderId.replaceFirst('#GLR-', '').replaceFirst('GLR-ORD-', '');
    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.get<GlorovOrder?>(
      '${MedusaEndpoints.orderById(cleanId)}?fields=*items,*items.variant,*shipping_address,*shipping_methods,*summary,*payment_collections',
      headers: headers,
      parser: (json) {
        if (json is Map && json['order'] is Map) {
          return GlorovOrder.fromMedusaJson(
              json['order'] as Map<String, dynamic>);
        }
        return null;
      },
    );

    if (result.isSuccess && result.dataOrNull != null) {
      return result.dataOrNull;
    }
    return _state.getOrderById(orderId);
  }

  @override
  Future<GlorovOrder> placeOrder({
    required List<GlorovCartItem> items,
    required GlorovAddress address,
    required GlorovDeliveryOption deliveryOption,
    required GlorovPaymentMethod paymentMethod,
    required double subtotal,
    required double shippingCost,
    required double discountAmount,
    String? appliedCoupon,
    required double totalAmount,
  }) async {
    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    // 1. Resolve or create active Medusa cart
    String? cartId = _storage.getItem('glorov_cart_id');
    if (cartId == null || cartId.isEmpty) {
      final createRes = await client.post<String?>(
        MedusaEndpoints.carts,
        headers: headers,
        body: {'currency_code': 'inr'},
        parser: (json) {
          if (json is Map && json['cart'] is Map) {
            return json['cart']['id']?.toString();
          }
          return null;
        },
      );
      if (createRes.isSuccess && createRes.requireData != null) {
        cartId = createRes.requireData!;
        _storage.setItem('glorov_cart_id', cartId);

        // Add items to newly created cart
        for (final item in items) {
          final variantId = item.variant?.id.isNotEmpty == true
              ? item.variant!.id
              : (item.product.variants.isNotEmpty
                  ? item.product.variants.first.id
                  : 'variant_01M5TY5X6NG1JSFXP50NNKS3J8');

          await client.post(
            MedusaEndpoints.cartLineItems(cartId),
            headers: headers,
            body: {
              'variant_id': variantId,
              'quantity': item.quantity,
            },
          );
        }
      }
    }

    if (cartId == null) {
      throw Exception('Could not initialize cart on backend');
    }

    // 2. Resolve customer email
    final accountEmail = GlorovAccountState.instance.profile.email;
    final customerEmail = accountEmail.isNotEmpty && accountEmail.contains('@')
        ? accountEmail
        : 'customer@glorov.com';

    // 3. Split customer name into first & last
    final nameParts = address.fullName.trim().split(' ');
    final firstName = nameParts.first;
    final lastName =
        nameParts.length > 1 ? nameParts.sublist(1).join(' ') : 'Customer';

    // 4. Update cart with email and Indian shipping/billing address
    final addressRes = await client.post(
      MedusaEndpoints.cartById(cartId),
      headers: headers,
      body: {
        'email': customerEmail,
        'shipping_address': {
          'first_name': firstName,
          'last_name': lastName,
          'address_1': address.addressLine,
          'address_2': address.landmark ?? '',
          'city': address.city,
          'province': address.state,
          'postal_code': address.pincode,
          'phone': address.phoneNumber,
          'country_code': 'in',
        },
        'billing_address': {
          'first_name': firstName,
          'last_name': lastName,
          'address_1': address.addressLine,
          'address_2': address.landmark ?? '',
          'city': address.city,
          'province': address.state,
          'postal_code': address.pincode,
          'phone': address.phoneNumber,
          'country_code': 'in',
        },
      },
    );

    if (addressRes.isFailure) {
      throw Exception(
        addressRes.errorOrNull ?? 'Failed to update shipping address on cart',
      );
    }

    // 5. Add shipping method
    final shippingOptionId = deliveryOption == GlorovDeliveryOption.express
        ? 'so_express_shiprocket'
        : 'so_standard_shiprocket';

    await client.post(
      MedusaEndpoints.cartShippingMethods(cartId),
      headers: headers,
      body: {'option_id': shippingOptionId},
    );

    // 6. Initiate payment session
    final providerId = paymentMethod == GlorovPaymentMethod.cod
        ? 'pp_cod_cod'
        : 'pp_razorpay_razorpay';

    await client.post(
      MedusaEndpoints.cartPaymentSessions(cartId),
      headers: headers,
      body: {'provider_id': providerId},
    );

    // 7. Complete cart checkout
    final completeRes = await client.post<GlorovOrder?>(
      MedusaEndpoints.completeCart(cartId),
      headers: headers,
      parser: (json) {
        if (json is Map) {
          if (json['type'] == 'order' && json['order'] is Map) {
            return GlorovOrder.fromMedusaJson(
                json['order'] as Map<String, dynamic>);
          }
        }
        return null;
      },
    );

    if (completeRes.isSuccess && completeRes.requireData != null) {
      final order = completeRes.requireData!;
      _state.addOrder(order);
      _state.clearCart();
      _storage.removeItem('glorov_cart_id');
      return order;
    }

    // If Medusa complete returned an error or unfinalized cart
    throw Exception(
      completeRes.errorOrNull ??
          'Could not complete checkout. Please verify inventory and payment details.',
    );
  }

  @override
  Future<Map<String, dynamic>?> getOrderTracking(String orderId) async {
    final cleanId =
        orderId.replaceFirst('#GLR-', '').replaceFirst('GLR-ORD-', '');
    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.get<Map<String, dynamic>?>(
      MedusaEndpoints.orderTracking(cleanId),
      headers: headers,
      parser: (json) {
        if (json is Map<String, dynamic>) {
          return json;
        }
        return null;
      },
    );

    return result.dataOrNull;
  }

  @override
  Future<ApiResult<void>> cancelOrder(String orderId, {String? reason}) async {
    final cleanId =
        orderId.replaceFirst('#GLR-', '').replaceFirst('GLR-ORD-', '');
    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.post(
      MedusaEndpoints.orderCancel(cleanId),
      headers: headers,
      body: {
        'reason': reason ?? 'Customer requested cancellation',
      },
    );

    if (result.isSuccess) {
      final existing = _state.getOrderById(orderId);
      if (existing != null) {
        final updated = GlorovOrder(
          id: existing.id,
          orderDate: existing.orderDate,
          items: existing.items,
          address: existing.address,
          deliveryOption: existing.deliveryOption,
          paymentMethod: existing.paymentMethod,
          subtotal: existing.subtotal,
          shippingCost: existing.shippingCost,
          discountAmount: existing.discountAmount,
          appliedCoupon: existing.appliedCoupon,
          totalAmount: existing.totalAmount,
          status: 'Cancelled',
        );
        _state.updateOrder(updated);
      }
      return const ApiSuccess(null);
    }

    return ApiResult.failure(
      result.errorOrNull ?? 'Failed to cancel order',
      statusCode: result.statusCodeOrNull,
    );
  }

  @override
  Future<ApiResult<void>> submitReturnRequest(
    String orderId, {
    required String reason,
    required List<String> itemIds,
    String? notes,
  }) async {
    final cleanId =
        orderId.replaceFirst('#GLR-', '').replaceFirst('GLR-ORD-', '');
    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.post(
      MedusaEndpoints.orderReturnRequest(cleanId),
      headers: headers,
      body: {
        'reason': reason,
        'item_ids': itemIds,
        if (notes != null) 'notes': notes,
      },
    );

    if (result.isSuccess) {
      final existing = _state.getOrderById(orderId);
      if (existing != null) {
        final updated = GlorovOrder(
          id: existing.id,
          orderDate: existing.orderDate,
          items: existing.items,
          address: existing.address,
          deliveryOption: existing.deliveryOption,
          paymentMethod: existing.paymentMethod,
          subtotal: existing.subtotal,
          shippingCost: existing.shippingCost,
          discountAmount: existing.discountAmount,
          appliedCoupon: existing.appliedCoupon,
          totalAmount: existing.totalAmount,
          status: 'Return Requested',
        );
        _state.updateOrder(updated);
      }
      return const ApiSuccess(null);
    }

    return ApiResult.failure(
      result.errorOrNull ?? 'Failed to submit return request',
      statusCode: result.statusCodeOrNull,
    );
  }
}
