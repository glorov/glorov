import '../../models/glorov/glorov_address.dart';
import '../../models/glorov/glorov_delivery_option.dart';
import '../../models/glorov/glorov_order.dart';
import '../../models/glorov/glorov_payment_method.dart';
import '../../services/glorov_cart_state.dart';
import '../remote/api_result.dart';

/// Abstract Order Lifecycle Repository Contract
abstract class OrderRepository {
  Future<List<GlorovOrder>> getOrders();
  Future<GlorovOrder?> getOrderById(String orderId);
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
  });

  Future<Map<String, dynamic>?> getOrderTracking(String orderId);

  Future<ApiResult<void>> cancelOrder(String orderId, {String? reason});

  Future<ApiResult<void>> submitReturnRequest(
    String orderId, {
    required String reason,
    required List<String> itemIds,
    String? notes,
  });
}
