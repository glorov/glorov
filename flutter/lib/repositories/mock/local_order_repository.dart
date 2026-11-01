import '../../models/glorov/glorov_address.dart';
import '../../models/glorov/glorov_delivery_option.dart';
import '../../models/glorov/glorov_order.dart';
import '../../models/glorov/glorov_payment_method.dart';
import '../../services/glorov_cart_state.dart';
import '../contracts/order_repository.dart';
import '../remote/api_result.dart';

/// Local Storage / In-Memory implementation of OrderRepository
class LocalOrderRepository implements OrderRepository {
  final GlorovCartState _state;

  LocalOrderRepository([GlorovCartState? state])
      : _state = state ?? GlorovCartState.instance;

  @override
  Future<List<GlorovOrder>> getOrders() async {
    return _state.orders;
  }

  @override
  Future<GlorovOrder?> getOrderById(String orderId) async {
    try {
      return _state.orders.firstWhere((o) => o.id == orderId);
    } catch (_) {
      return null;
    }
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
    final year = DateTime.now().year;
    final randomNum = (DateTime.now().millisecondsSinceEpoch % 90000 + 10000);
    final orderId = 'GLR-ORD-$year-$randomNum';

    final orderItems = items.map((ci) {
      return GlorovOrderItem(
        productId: ci.product.id,
        title: ci.product.title,
        botanicalName: ci.product.botanicalName,
        imageUrl: ci.product.primaryImage,
        variantName: ci.variant?.name,
        unitPrice: ci.unitPrice,
        quantity: ci.quantity,
        lineTotal: ci.totalPrice,
      );
    }).toList();

    final order = GlorovOrder(
      id: orderId,
      orderDate: DateTime.now(),
      items: orderItems,
      address: address,
      deliveryOption: deliveryOption,
      paymentMethod: paymentMethod,
      subtotal: subtotal,
      shippingCost: shippingCost,
      discountAmount: discountAmount,
      appliedCoupon: appliedCoupon,
      totalAmount: totalAmount,
      status: 'Confirmed',
    );

    _state.addOrder(order);
    _state.clearCart();

    return order;
  }

  @override
  Future<Map<String, dynamic>?> getOrderTracking(String orderId) async {
    return {
      'order_id': orderId,
      'courier': 'Shiprocket Botanical Express',
      'awb_code': 'SR-GLR-${orderId.hashCode.abs() % 1000000}',
      'status': 'In Transit',
      'current_location': 'Bengaluru Central Fulfillment Nursery',
      'moisture_shield_active': true,
      'estimated_delivery':
          DateTime.now().add(const Duration(days: 2)).toIso8601String(),
      'scans': [
        {
          'activity': 'Seedling inspected and potted in breathable coco-peat',
          'location': 'GLOROV Polyhouse 4, Pune',
          'date': DateTime.now()
              .subtract(const Duration(hours: 12))
              .toIso8601String(),
        },
        {
          'activity':
              'Package handed over to courier partner with Moisture Guard',
          'location': 'Pune Hub',
          'date': DateTime.now()
              .subtract(const Duration(hours: 6))
              .toIso8601String(),
        },
        {
          'activity': 'In transit to destination delivery center',
          'location': 'Bengaluru Hub',
          'date': DateTime.now()
              .subtract(const Duration(hours: 1))
              .toIso8601String(),
        },
      ],
    };
  }

  @override
  Future<ApiResult<void>> cancelOrder(String orderId, {String? reason}) async {
    final existing = await getOrderById(orderId);
    if (existing == null) {
      return const ApiFailure('Order not found', statusCode: 404);
    }
    if (existing.status == 'Delivered' || existing.status == 'Cancelled') {
      return ApiFailure(
        'Order cannot be cancelled in its current state (${existing.status})',
        statusCode: 400,
      );
    }

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
    return const ApiSuccess(null);
  }

  @override
  Future<ApiResult<void>> submitReturnRequest(
    String orderId, {
    required String reason,
    required List<String> itemIds,
    String? notes,
  }) async {
    final existing = await getOrderById(orderId);
    if (existing == null) {
      return const ApiFailure('Order not found', statusCode: 404);
    }

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
    return const ApiSuccess(null);
  }
}
