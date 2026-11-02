import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../models/glorov/glorov_address.dart';
import '../models/glorov/glorov_delivery_option.dart';
import '../models/glorov/glorov_mock_data.dart';
import '../repositories/glorov_repositories.dart';
import '../models/glorov/glorov_order.dart';
import '../models/glorov/glorov_payment_method.dart';
import '../models/glorov/glorov_product.dart';
import 'storage/local_storage.dart';

/// Item in the user's shopping bag
class GlorovCartItem {
  final GlorovProduct product;
  final GlorovProductVariant? variant;
  int quantity;

  GlorovCartItem({
    required this.product,
    this.variant,
    this.quantity = 1,
  });

  String get itemKey =>
      variant != null ? '${product.id}_${variant!.id}' : product.id;

  double get unitPrice => variant?.effectivePrice ?? product.effectivePrice;
  double get originalUnitPrice => variant?.price ?? product.price;
  double get totalPrice => unitPrice * quantity;
  double get totalOriginalPrice => originalUnitPrice * quantity;

  Map<String, dynamic> toJson() => {
        'productId': product.id,
        'variantId': variant?.id,
        'quantity': quantity,
      };
}

/// Available Milestone Offers for GLOROV Promotional Roadmaps
class GlorovMilestoneOffer {
  final String code;
  final String title;
  final String description;
  final double minSpend;
  final double discountPercent;
  final String disclaimer;

  const GlorovMilestoneOffer({
    required this.code,
    required this.title,
    required this.description,
    required this.minSpend,
    required this.discountPercent,
    this.disclaimer = 'Not applicable on hamper products',
  });
}

/// Centralized Reactive Shopping State Management for GLOROV
/// Manages cart items, wishlist, coupon codes, delivery options, checkout, and local orders.
class GlorovCartState extends ChangeNotifier {
  static final GlorovCartState instance = GlorovCartState._internal();

  final Map<String, GlorovCartItem> _items = {};
  final Set<String> _wishlistIds = {};
  final List<GlorovOrder> _orders = [];
  List<GlorovAddress> _addresses = [];

  GlorovAddress _selectedAddress = GlorovAddress.empty;
  GlorovDeliveryOption _selectedDeliveryOption = GlorovDeliveryOption.standard;
  String? _appliedPromoCode;
  double _promoDiscountPercent = 0.0;
  bool _isFreeShippingPromo = false;
  String? _couponRevocationNotice;

  static const double freeShippingThreshold = 499.0;
  static const double standardShippingCost = 99.0;

  static const List<GlorovMilestoneOffer> milestoneOffers = [
    GlorovMilestoneOffer(
      code: 'DIWALI10',
      title: '10% OFF',
      description: 'On orders above ₹999',
      minSpend: 999.0,
      discountPercent: 10.0,
    ),
    GlorovMilestoneOffer(
      code: 'DIWALI15',
      title: '15% OFF',
      description: 'On orders above ₹1,599',
      minSpend: 1599.0,
      discountPercent: 15.0,
    ),
    GlorovMilestoneOffer(
      code: 'DIWALI20',
      title: '20% OFF',
      description: 'On orders above ₹2,299',
      minSpend: 2299.0,
      discountPercent: 20.0,
    ),
  ];

  static double getMinSpendForCoupon(String code) {
    final clean = code.trim().toUpperCase();
    switch (clean) {
      case 'DIWALI20':
        return 2299.0;
      case 'DIWALI15':
        return 1599.0;
      case 'DIWALI10':
        return 999.0;
      case 'SEEDS20':
        return 599.0;
      case 'GLOROV10':
        return 499.0;
      case 'FREESHIP':
      default:
        return 0.0;
    }
  }

  static double getDiscountPercentForCoupon(String code) {
    final clean = code.trim().toUpperCase();
    switch (clean) {
      case 'DIWALI20':
      case 'SEEDS20':
        return 20.0;
      case 'DIWALI15':
        return 15.0;
      case 'DIWALI10':
      case 'GLOROV10':
        return 10.0;
      case 'FREESHIP':
      default:
        return 0.0;
    }
  }

  String? get couponRevocationNotice => _couponRevocationNotice;
  bool get hasPendingCouponRevocationNotice => _couponRevocationNotice != null;

  String? consumeCouponRevocationNotice() {
    final notice = _couponRevocationNotice;
    _couponRevocationNotice = null;
    return notice;
  }

  /// Automatically validates whether the currently applied coupon meets its minimum spend limit.
  /// If the cart subtotal has dropped below the threshold, automatically removes the coupon.
  bool _validateAppliedCoupon() {
    if (_appliedPromoCode == null) return false;
    final minSpend = getMinSpendForCoupon(_appliedPromoCode!);
    if (subtotal < minSpend) {
      final code = _appliedPromoCode!;
      _appliedPromoCode = null;
      _promoDiscountPercent = 0.0;
      _isFreeShippingPromo = false;
      _couponRevocationNotice =
          'Coupon $code removed: Minimum order of ₹${minSpend.toStringAsFixed(0)} required.';
      return true;
    }
    return false;
  }

  /// Returns the highest milestone offer that is currently eligible for the cart subtotal.
  GlorovMilestoneOffer? get highestEligibleOffer {
    if (subtotal <= 0) return null;
    for (final offer in milestoneOffers.reversed) {
      if (subtotal >= offer.minSpend) {
        return offer;
      }
    }
    return null;
  }

  /// Returns a milestone offer that has been unlocked (target price reached)
  /// and provides a higher discount percentage than what is currently applied.
  GlorovMilestoneOffer? get higherUnlockedOffer {
    if (subtotal <= 0 || _appliedPromoCode == null) return null;
    for (final offer in milestoneOffers.reversed) {
      if (subtotal >= offer.minSpend &&
          offer.discountPercent > _promoDiscountPercent) {
        return offer;
      }
    }
    return null;
  }

  GlorovCartState._internal() {
    _loadFromStorage();
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  List<GlorovCartItem> get items => _items.values.toList();
  int get itemCount =>
      _items.values.fold(0, (sum, item) => sum + item.quantity);
  Set<String> get wishlistIds => Set.unmodifiable(_wishlistIds);
  List<GlorovOrder> get orders => List.unmodifiable(_orders);
  List<GlorovAddress> get addresses => List.unmodifiable(_addresses);
  GlorovAddress get selectedAddress => _selectedAddress;
  GlorovDeliveryOption get selectedDeliveryOption => _selectedDeliveryOption;
  String? get appliedPromoCode => _appliedPromoCode;
  double get promoDiscountPercent => _promoDiscountPercent;

  double get subtotal =>
      _items.values.fold(0.0, (sum, item) => sum + item.totalPrice);

  double get compareSubtotal =>
      _items.values.fold(0.0, (sum, item) => sum + item.totalOriginalPrice);

  int get overallDiscountPercent {
    if (compareSubtotal <= 0 || compareSubtotal <= total) return 0;
    return (((compareSubtotal - total) / compareSubtotal) * 100).round();
  }

  (String prefix, String highlight) get milestoneHeadlineInfo {
    if (subtotal == 0) {
      return ('Add ₹499 more to unlock ', 'free delivery');
    }
    if (subtotal < freeShippingThreshold) {
      final diff = freeShippingThreshold - subtotal;
      return ('Add ₹${diff.toStringAsFixed(0)} more to unlock ', 'free delivery');
    }
    if (subtotal < 999.0) {
      final diff = 999.0 - subtotal;
      return ('Add ₹${diff.toStringAsFixed(0)} more to unlock ', '10% off');
    }
    if (subtotal < 1599.0) {
      final diff = 1599.0 - subtotal;
      return ('Add ₹${diff.toStringAsFixed(0)} more to unlock ', '15% off');
    }
    if (subtotal < 2299.0) {
      final diff = 2299.0 - subtotal;
      return ('Add ₹${diff.toStringAsFixed(0)} more to unlock ', '20% off');
    }
    return ('🎉 Maximum discount unlocked! ', '20% off');
  }

  double get milestoneProgressFraction {
    if (subtotal <= 0) return 0.0;
    if (subtotal < 999.0) {
      return (subtotal / 999.0) * 0.33;
    } else if (subtotal < 1599.0) {
      return 0.33 + ((subtotal - 999.0) / (1599.0 - 999.0)) * 0.33;
    } else if (subtotal < 2299.0) {
      return 0.66 + ((subtotal - 1599.0) / (2299.0 - 1599.0)) * 0.34;
    }
    return 1.0;
  }

  bool get isFreeShippingEligible =>
      _isFreeShippingPromo || subtotal >= freeShippingThreshold;

  double get shippingCost {
    if (subtotal == 0) return 0.0;
    if (_isFreeShippingPromo || isFreeShippingEligible) return 0.0;
    return _selectedDeliveryOption.calculateCost(subtotal);
  }

  double get promoDiscountAmount => subtotal * (_promoDiscountPercent / 100);

  double get total => (subtotal - promoDiscountAmount + shippingCost)
      .clamp(0.0, double.infinity);

  // ---------------------------------------------------------------------------
  // Cart Actions
  // ---------------------------------------------------------------------------
  void addToCart(
    GlorovProduct product, {
    GlorovProductVariant? variant,
    int quantity = 1,
  }) {
    final key = variant != null ? '${product.id}_${variant.id}' : product.id;
    if (_items.containsKey(key)) {
      _items[key]!.quantity += quantity;
    } else {
      _items[key] = GlorovCartItem(
        product: product,
        variant: variant,
        quantity: quantity,
      );
    }
    _saveToStorage();
    notifyListeners();
  }

  void updateQuantity(String key, int newQuantity) {
    if (!_items.containsKey(key)) return;
    if (newQuantity <= 0) {
      _items.remove(key);
    } else {
      _items[key]!.quantity = newQuantity;
    }
    _validateAppliedCoupon();
    _saveToStorage();
    notifyListeners();
  }

  void removeFromCart(String key) {
    if (!_items.containsKey(key)) return;
    _items.remove(key);
    _validateAppliedCoupon();
    _saveToStorage();
    notifyListeners();
  }

  void moveToWishlist(String key) {
    if (!_items.containsKey(key)) return;
    final item = _items.remove(key)!;
    _wishlistIds.add(item.product.id);
    _validateAppliedCoupon();
    _saveToStorage();
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    _appliedPromoCode = null;
    _promoDiscountPercent = 0.0;
    _isFreeShippingPromo = false;
    _couponRevocationNotice = null;
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Coupon Actions
  // ---------------------------------------------------------------------------
  (bool success, String message) applyCoupon(String code) {
    final clean = code.trim().toUpperCase();

    if (clean.isEmpty) {
      return (false, 'Please enter a coupon code.');
    }

    if (subtotal == 0) {
      return (false, 'Cannot apply coupon to an empty cart.');
    }

    if (clean == 'DIWALI10') {
      if (subtotal < 999) {
        final needed = (999 - subtotal).toStringAsFixed(0);
        return (false, 'Add ₹$needed more to apply DIWALI10 (10% off above ₹999).');
      }
      _appliedPromoCode = 'DIWALI10';
      _promoDiscountPercent = 10.0;
      _isFreeShippingPromo = false;
      _couponRevocationNotice = null;
      _saveToStorage();
      notifyListeners();
      return (true, 'Coupon DIWALI10 applied! 10% discount added.');
    } else if (clean == 'DIWALI15') {
      if (subtotal < 1599) {
        final needed = (1599 - subtotal).toStringAsFixed(0);
        return (false, 'Add ₹$needed more to apply DIWALI15 (15% off above ₹1,599).');
      }
      _appliedPromoCode = 'DIWALI15';
      _promoDiscountPercent = 15.0;
      _isFreeShippingPromo = false;
      _couponRevocationNotice = null;
      _saveToStorage();
      notifyListeners();
      return (true, 'Coupon DIWALI15 applied! 15% discount added.');
    } else if (clean == 'DIWALI20') {
      if (subtotal < 2299) {
        final needed = (2299 - subtotal).toStringAsFixed(0);
        return (false, 'Add ₹$needed more to apply DIWALI20 (20% off above ₹2,299).');
      }
      _appliedPromoCode = 'DIWALI20';
      _promoDiscountPercent = 20.0;
      _isFreeShippingPromo = false;
      _couponRevocationNotice = null;
      _saveToStorage();
      notifyListeners();
      return (true, 'Coupon DIWALI20 applied! 20% discount added.');
    } else if (clean == 'GLOROV10') {
      if (subtotal < 499) {
        return (false, 'GLOROV10 requires a minimum order of ₹499.');
      }
      _appliedPromoCode = 'GLOROV10';
      _promoDiscountPercent = 10.0;
      _isFreeShippingPromo = false;
      _couponRevocationNotice = null;
      _saveToStorage();
      notifyListeners();
      return (true, 'Coupon GLOROV10 applied! You saved 10% on your cart.');
    } else if (clean == 'SEEDS20') {
      if (subtotal < 599) {
        return (false, 'SEEDS20 requires a minimum order of ₹599.');
      }
      _appliedPromoCode = 'SEEDS20';
      _promoDiscountPercent = 20.0;
      _isFreeShippingPromo = false;
      _couponRevocationNotice = null;
      _saveToStorage();
      notifyListeners();
      return (true, 'Coupon SEEDS20 applied! You saved 20% on your order.');
    } else if (clean == 'FREESHIP') {
      _appliedPromoCode = 'FREESHIP';
      _promoDiscountPercent = 0.0;
      _isFreeShippingPromo = true;
      _couponRevocationNotice = null;
      _saveToStorage();
      notifyListeners();
      return (true, 'Coupon FREESHIP applied! Free delivery unlocked.');
    }

    return (false, 'Invalid coupon code. Try GLOROV10 or SEEDS20.');
  }

  void removeCoupon() {
    _appliedPromoCode = null;
    _promoDiscountPercent = 0.0;
    _isFreeShippingPromo = false;
    _couponRevocationNotice = null;
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Wishlist Actions
  // ---------------------------------------------------------------------------
  bool isInWishlist(String productId) => _wishlistIds.contains(productId);
  bool isWishlisted(String productId) => isInWishlist(productId);

  void toggleWishlist(String productId) {
    if (_wishlistIds.contains(productId)) {
      _wishlistIds.remove(productId);
    } else {
      _wishlistIds.add(productId);
    }
    _saveToStorage();
    notifyListeners();
  }

  void removeFromWishlist(String productId) {
    _wishlistIds.remove(productId);
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Address Book Management
  // ---------------------------------------------------------------------------
  void addAddress(GlorovAddress address) {
    var newAddress = address;
    if (newAddress.id.isEmpty) {
      newAddress = newAddress.copyWith(
        id: 'addr_${DateTime.now().millisecondsSinceEpoch}',
      );
    }
    if (newAddress.isDefault || _addresses.isEmpty) {
      _addresses = _addresses.map((a) => a.copyWith(isDefault: false)).toList();
      newAddress = newAddress.copyWith(isDefault: true);
      _selectedAddress = newAddress;
    }
    _addresses.add(newAddress);
    _saveToStorage();
    notifyListeners();
  }

  void updateAddress(GlorovAddress address) {
    final index = _addresses.indexWhere((a) => a.id == address.id);
    if (index != -1) {
      if (address.isDefault) {
        _addresses =
            _addresses.map((a) => a.copyWith(isDefault: false)).toList();
        _selectedAddress = address;
      }
      _addresses[index] = address;
      if (_selectedAddress.id == address.id) {
        _selectedAddress = address;
      }
      _saveToStorage();
      notifyListeners();
    }
  }

  void deleteAddress(String id) {
    _addresses.removeWhere((a) => a.id == id);
    if (_addresses.isNotEmpty) {
      if (_selectedAddress.id == id) {
        _selectedAddress = _addresses.firstWhere((a) => a.isDefault,
            orElse: () => _addresses.first);
      }
    } else {
      _selectedAddress = GlorovAddress.empty;
    }
    _saveToStorage();
    notifyListeners();
  }

  void setDefaultAddress(String id) {
    _addresses =
        _addresses.map((a) => a.copyWith(isDefault: a.id == id)).toList();
    try {
      _selectedAddress = _addresses.firstWhere((a) => a.id == id);
    } catch (_) {}
    _saveToStorage();
    notifyListeners();
  }

  void resetDemoData() {
    _items.clear();
    _wishlistIds.clear();
    _orders.clear();
    _addresses = [];
    _selectedAddress = GlorovAddress.empty;
    _appliedPromoCode = null;
    _promoDiscountPercent = 0.0;
    _isFreeShippingPromo = false;
    _saveToStorage();
    notifyListeners();
  }

  @visibleForTesting
  void setSampleAddressesForTesting() {
    _addresses = [
      GlorovAddress.sample,
      GlorovAddress.sampleWork,
    ];
    _selectedAddress = GlorovAddress.sample;
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Checkout & Order Placement
  // ---------------------------------------------------------------------------
  void setAddress(GlorovAddress address) {
    _selectedAddress = address;
    _saveToStorage();
    notifyListeners();
  }

  void setDeliveryOption(GlorovDeliveryOption option) {
    _selectedDeliveryOption = option;
    notifyListeners();
  }

  GlorovOrder placeOrder({
    required GlorovAddress address,
    required GlorovPaymentMethod paymentMethod,
    required GlorovDeliveryOption deliveryOption,
  }) {
    final orderId =
        'GLR-ORD-${DateTime.now().year}-${(DateTime.now().millisecondsSinceEpoch % 90000 + 10000)}';

    final orderItems = _items.values.map((item) {
      return GlorovOrderItem(
        productId: item.product.id,
        title: item.product.title,
        botanicalName: item.product.botanicalName,
        imageUrl: item.product.primaryImage,
        variantName: item.variant?.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.totalPrice,
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
      discountAmount: promoDiscountAmount,
      appliedCoupon: _appliedPromoCode,
      totalAmount: total,
      status: 'Confirmed',
    );

    _orders.insert(0, order);
    _selectedAddress = address;

    // Clear cart and coupon after successful simulated checkout
    _items.clear();
    _appliedPromoCode = null;
    _promoDiscountPercent = 0.0;
    _isFreeShippingPromo = false;

    _saveToStorage();
    notifyListeners();

    return order;
  }

  GlorovOrder? getOrderById(String id) {
    try {
      return _orders.firstWhere((o) => o.id == id);
    } catch (_) {
      return null;
    }
  }

  void addOrder(GlorovOrder order) {
    _orders.insert(0, order);
    _saveToStorage();
    notifyListeners();
  }

  void updateOrder(GlorovOrder order) {
    final index = _orders.indexWhere((o) => o.id == order.id);
    if (index != -1) {
      _orders[index] = order;
      _saveToStorage();
      notifyListeners();
    }
  }

  void setOrders(List<GlorovOrder> newOrders) {
    _orders.clear();
    _orders.addAll(newOrders);
    _saveToStorage();
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Local Persistence
  // ---------------------------------------------------------------------------
  void _saveToStorage() {
    try {
      final storage = GlorovLocalStorage.instance;

      // 1. Cart Items
      final cartJson = _items.values.map((i) => i.toJson()).toList();
      storage.setItem('glorov_cart_items', jsonEncode(cartJson));

      // 2. Wishlist
      storage.setItem('glorov_wishlist', jsonEncode(_wishlistIds.toList()));

      // 3. Address
      if (_selectedAddress.isValid) {
        storage.setItem('glorov_address', jsonEncode(_selectedAddress.toJson()));
      } else {
        storage.removeItem('glorov_address');
      }

      // 4. Address Book
      if (_addresses.isNotEmpty) {
        final addressesJson = _addresses.map((a) => a.toJson()).toList();
        storage.setItem('glorov_address_book', jsonEncode(addressesJson));
      } else {
        storage.removeItem('glorov_address_book');
      }

      // 5. Orders
      final ordersJson = _orders.map((o) => o.toJson()).toList();
      storage.setItem('glorov_orders', jsonEncode(ordersJson));

      // 6. Active Promo Code
      if (_appliedPromoCode != null) {
        storage.setItem('glorov_promo_code', _appliedPromoCode!);
      } else {
        storage.removeItem('glorov_promo_code');
      }
    } catch (e) {
      debugPrint('Error saving to local storage: $e');
    }
  }

  void _loadFromStorage() {
    try {
      final storage = GlorovLocalStorage.instance;

      // 1. Restore Wishlist
      final wishlistRaw = storage.getItem('glorov_wishlist');
      if (wishlistRaw != null && wishlistRaw.isNotEmpty) {
        final list = jsonDecode(wishlistRaw) as List<dynamic>;
        _wishlistIds.addAll(list.map((e) => e.toString()));
      }

      // 2. Restore Address & Address Book
      final addressBookRaw = storage.getItem('glorov_address_book');
      if (addressBookRaw != null && addressBookRaw.isNotEmpty) {
        final list = jsonDecode(addressBookRaw) as List<dynamic>;
        _addresses = list
            .map((e) => GlorovAddress.fromJson(e as Map<String, dynamic>))
            .toList();
      } else {
        _addresses = [];
      }

      final addressRaw = storage.getItem('glorov_address');
      if (addressRaw != null && addressRaw.isNotEmpty) {
        _selectedAddress = GlorovAddress.fromJson(
            jsonDecode(addressRaw) as Map<String, dynamic>);
      } else if (_addresses.isNotEmpty) {
        _selectedAddress = _addresses.firstWhere((a) => a.isDefault,
            orElse: () => _addresses.first);
      } else {
        _selectedAddress = GlorovAddress.empty;
      }

      // 3. Restore Orders
      final ordersRaw = storage.getItem('glorov_orders');
      if (ordersRaw != null && ordersRaw.isNotEmpty) {
        final list = jsonDecode(ordersRaw) as List<dynamic>;
        _orders.addAll(list
            .map((e) => GlorovOrder.fromJson(e as Map<String, dynamic>))
            .toList());
      }

      // 4. Restore Cart Items
      final cartRaw = storage.getItem('glorov_cart_items');
      if (cartRaw != null && cartRaw.isNotEmpty) {
        final list = jsonDecode(cartRaw) as List<dynamic>;
        for (final entry in list) {
          final pid = entry['productId'] as String?;
          final vid = entry['variantId'] as String?;
          final qty = entry['quantity'] as int? ?? 1;

          if (pid != null) {
            GlorovProduct? product = GlorovProductCache.get(pid);
            if (product == null) {
              try {
                product = GlorovMockData.getProductById(pid);
              } catch (_) {}
            }

            if (product != null) {
              GlorovProductVariant? variant;
              if (vid != null) {
                try {
                  variant = product.variants.firstWhere((v) => v.id == vid);
                } catch (_) {}
              }
              final key =
                  variant != null ? '${product.id}_${variant.id}' : product.id;
              _items[key] = GlorovCartItem(
                product: product,
                variant: variant,
                quantity: qty,
              );
            } else {
              Future.microtask(() {
                GlorovRepositories.products.getProductById(pid).then((p) {
                  if (p != null) {
                    GlorovProductVariant? variant;
                    if (vid != null) {
                      try {
                        variant = p.variants.firstWhere((v) => v.id == vid);
                      } catch (_) {}
                    }
                    final key =
                        variant != null ? '${p.id}_${variant.id}' : p.id;
                    _items[key] = GlorovCartItem(
                      product: p,
                      variant: variant,
                      quantity: qty,
                    );
                    _validateAppliedCoupon();
                    notifyListeners();
                  }
                });
              });
            }
          }
        }
      }
      // 5. Restore Active Promo Code
      final promoRaw = storage.getItem('glorov_promo_code');
      if (promoRaw != null && promoRaw.isNotEmpty) {
        applyCoupon(promoRaw);
        _validateAppliedCoupon();
      }
    } catch (e) {
      debugPrint('Error loading from local storage: $e');
    }
  }
}
