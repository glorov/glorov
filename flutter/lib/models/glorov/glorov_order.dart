import 'glorov_address.dart';
import 'glorov_delivery_option.dart';
import 'glorov_payment_method.dart';

/// Immutable Snapshot of an item purchased in a GLOROV Order
class GlorovOrderItem {
  final String productId;
  final String title;
  final String botanicalName;
  final String imageUrl;
  final String? variantName;
  final double unitPrice;
  final int quantity;
  final double lineTotal;

  const GlorovOrderItem({
    required this.productId,
    required this.title,
    required this.botanicalName,
    required this.imageUrl,
    this.variantName,
    required this.unitPrice,
    required this.quantity,
    required this.lineTotal,
  });

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'title': title,
        'botanicalName': botanicalName,
        'imageUrl': imageUrl,
        'variantName': variantName,
        'unitPrice': unitPrice,
        'quantity': quantity,
        'lineTotal': lineTotal,
      };

  factory GlorovOrderItem.fromJson(Map<String, dynamic> json) {
    return GlorovOrderItem(
      productId: json['productId'] as String? ?? '',
      title: json['title'] as String? ?? '',
      botanicalName: json['botanicalName'] as String? ?? '',
      imageUrl: json['imageUrl'] as String? ?? '',
      variantName: json['variantName'] as String?,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      quantity: json['quantity'] as int? ?? 1,
      lineTotal: (json['lineTotal'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

/// Locally Generated Mock Order Model
class GlorovOrder {
  final String id;
  final DateTime orderDate;
  final List<GlorovOrderItem> items;
  final GlorovAddress address;
  final GlorovDeliveryOption deliveryOption;
  final GlorovPaymentMethod paymentMethod;
  final double subtotal;
  final double shippingCost;
  final double discountAmount;
  final String? appliedCoupon;
  final double totalAmount;
  final String status;

  const GlorovOrder({
    required this.id,
    required this.orderDate,
    required this.items,
    required this.address,
    required this.deliveryOption,
    required this.paymentMethod,
    required this.subtotal,
    required this.shippingCost,
    required this.discountAmount,
    this.appliedCoupon,
    required this.totalAmount,
    this.status = 'Confirmed',
  });

  int get totalItemCount =>
      items.fold(0, (count, item) => count + item.quantity);

  String get formattedDate {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    final m = months[orderDate.month - 1];
    final day = orderDate.day;
    final year = orderDate.year;
    final hour = orderDate.hour.toString().padLeft(2, '0');
    final min = orderDate.minute.toString().padLeft(2, '0');
    return '$day $m $year, $hour:$min';
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderDate': orderDate.toIso8601String(),
        'items': items.map((i) => i.toJson()).toList(),
        'address': address.toJson(),
        'deliveryOption': deliveryOption.name,
        'paymentMethod': paymentMethod.name,
        'subtotal': subtotal,
        'shippingCost': shippingCost,
        'discountAmount': discountAmount,
        'appliedCoupon': appliedCoupon,
        'totalAmount': totalAmount,
        'status': status,
      };

  factory GlorovOrder.fromJson(Map<String, dynamic> json) {
    return GlorovOrder(
      id: json['id'] as String? ?? '',
      orderDate: DateTime.tryParse(json['orderDate'] as String? ?? '') ??
          DateTime.now(),
      items: (json['items'] as List<dynamic>? ?? [])
          .map((i) => GlorovOrderItem.fromJson(i as Map<String, dynamic>))
          .toList(),
      address: GlorovAddress.fromJson(
          json['address'] as Map<String, dynamic>? ?? {}),
      deliveryOption: GlorovDeliveryOption.values.firstWhere(
        (o) => o.name == json['deliveryOption'],
        orElse: () => GlorovDeliveryOption.standard,
      ),
      paymentMethod: GlorovPaymentMethod.values.firstWhere(
        (p) => p.name == json['paymentMethod'],
        orElse: () => GlorovPaymentMethod.cod,
      ),
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      shippingCost: (json['shippingCost'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      appliedCoupon: json['appliedCoupon'] as String?,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      status: json['status'] as String? ?? 'Confirmed',
    );
  }

  factory GlorovOrder.fromMedusaJson(Map<String, dynamic> json) {
    final rawItems = json['items'] as List<dynamic>? ?? [];
    final items = rawItems.map((raw) {
      final i = raw as Map<String, dynamic>;
      final meta = i['metadata'] as Map<String, dynamic>? ?? {};
      final unitPricePaise = (i['unit_price'] as num?)?.toDouble() ?? 0.0;
      final lineTotalPaise = (i['total'] as num?)?.toDouble() ??
          (unitPricePaise * (i['quantity'] as int? ?? 1));

      return GlorovOrderItem(
        productId: i['product_id'] as String? ?? i['id'] as String? ?? '',
        title: i['title'] as String? ?? 'Botanical Product',
        botanicalName: meta['botanical_name'] as String? ?? '',
        imageUrl: i['thumbnail'] as String? ?? '',
        variantName: i['variant_title'] as String?,
        unitPrice:
            unitPricePaise > 1000 ? unitPricePaise / 100.0 : unitPricePaise,
        quantity: i['quantity'] as int? ?? 1,
        lineTotal:
            lineTotalPaise > 1000 ? lineTotalPaise / 100.0 : lineTotalPaise,
      );
    }).toList();

    GlorovAddress address = GlorovAddress.sample;
    if (json['shipping_address'] is Map<String, dynamic>) {
      address = GlorovAddress.fromMedusaJson(
          json['shipping_address'] as Map<String, dynamic>);
    }

    final totalPaise = (json['total'] as num?)?.toDouble() ?? 0.0;
    final subtotalPaise = (json['subtotal'] as num?)?.toDouble() ?? totalPaise;
    final shippingPaise = (json['shipping_total'] as num?)?.toDouble() ?? 0.0;
    final discountPaise = (json['discount_total'] as num?)?.toDouble() ?? 0.0;

    final displayId =
        json['display_id'] != null ? '#GLR-${json['display_id']}' : null;
    final rawStatus = json['status'] as String? ?? 'Confirmed';
    final normalizedStatus = rawStatus == 'pending'
        ? 'Processing'
        : rawStatus == 'completed'
            ? 'Delivered'
            : rawStatus.substring(0, 1).toUpperCase() + rawStatus.substring(1);

    return GlorovOrder(
      id: displayId ?? (json['id'] as String? ?? ''),
      orderDate: DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
      items: items,
      address: address,
      deliveryOption: shippingPaise > 10000
          ? GlorovDeliveryOption.express
          : GlorovDeliveryOption.standard,
      paymentMethod: (json['payment_collections'] != null)
          ? GlorovPaymentMethod.upi
          : GlorovPaymentMethod.cod,
      subtotal: subtotalPaise > 1000 ? subtotalPaise / 100.0 : subtotalPaise,
      shippingCost:
          shippingPaise > 1000 ? shippingPaise / 100.0 : shippingPaise,
      discountAmount:
          discountPaise > 1000 ? discountPaise / 100.0 : discountPaise,
      totalAmount: totalPaise > 1000 ? totalPaise / 100.0 : totalPaise,
      status: normalizedStatus,
    );
  }
}
