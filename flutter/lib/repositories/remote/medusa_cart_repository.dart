import '../../models/glorov/glorov_product.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/storage/local_storage.dart';
import '../contracts/cart_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa v2 Storefront API Implementation of CartRepository
/// Manages cart creation, line-item additions/mutations, promotion application,
/// customer association, and synchronized wishlist actions with the backend.
class MedusaCartRepository implements CartRepository {
  final MedusaHttpClient client;
  final GlorovCartState _state;
  final GlorovLocalStorage _storage;
  String? _cartId;

  MedusaCartRepository(
    this.client, [
    GlorovCartState? state,
    GlorovLocalStorage? storage,
  ])  : _state = state ?? GlorovCartState.instance,
        _storage = storage ?? GlorovLocalStorage.instance {
    _restoreStoredCartId();
  }

  void _restoreStoredCartId() {
    final stored = _storage.getItem('glorov_cart_id');
    if (stored != null && stored.isNotEmpty) {
      _cartId = stored;
    }
  }

  String? get currentCartId => _cartId;

  /// Ensures an active cart ID exists on the backend
  Future<String?> _ensureCart() async {
    if (_cartId != null && _cartId!.isNotEmpty) {
      return _cartId;
    }

    _restoreStoredCartId();
    if (_cartId != null && _cartId!.isNotEmpty) {
      return _cartId;
    }

    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.post<String?>(
      MedusaEndpoints.carts,
      headers: headers,
      body: {
        'currency_code': 'inr',
      },
      parser: (json) {
        if (json is Map && json['cart'] is Map) {
          return json['cart']['id']?.toString();
        }
        return null;
      },
    );

    if (result.isSuccess && result.requireData != null) {
      _cartId = result.requireData;
      _storage.setItem('glorov_cart_id', _cartId!);
    }
    return _cartId;
  }

  @override
  Future<List<GlorovCartItem>> getCartItems() async {
    final cartId = _cartId ?? _storage.getItem('glorov_cart_id');
    if (cartId == null || cartId.isEmpty) {
      return _state.items;
    }

    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    final result = await client.get<List<GlorovCartItem>>(
      MedusaEndpoints.cartById(cartId),
      headers: headers,
      parser: (json) {
        if (json is Map &&
            json['cart'] is Map &&
            json['cart']['items'] is List) {
          final rawItems = json['cart']['items'] as List;
          return rawItems.map((raw) {
            final item = raw as Map<String, dynamic>;
            final unitPricePaise =
                (item['unit_price'] as num?)?.toDouble() ?? 0.0;
            final price =
                unitPricePaise > 1000 ? unitPricePaise / 100.0 : unitPricePaise;
            final quantity = item['quantity'] as int? ?? 1;

            final product = GlorovProduct(
              id: item['product_id']?.toString() ??
                  item['id']?.toString() ??
                  '',
              slug: item['handle']?.toString() ?? '',
              title: item['title']?.toString() ?? 'Botanical Plant',
              botanicalName:
                  (item['metadata'] as Map?)?['botanical_name']?.toString() ??
                      '',
              shortDescription: '',
              description: '',
              category: 'Seeds',
              subcategory: '',
              productType: GlorovProductType.seeds,
              price: price,
              imageUrls: [item['thumbnail']?.toString() ?? ''],
            );

            return GlorovCartItem(
              product: product,
              quantity: quantity,
            );
          }).toList();
        }
        return <GlorovCartItem>[];
      },
    );

    if (result.isSuccess) {
      return result.requireData;
    }
    return _state.items;
  }

  @override
  Future<void> loadRemoteCart() async {
    await getCartItems();
  }

  @override
  Future<void> syncCartWithCustomer(String customerEmail) async {
    final cartId = await _ensureCart();
    if (cartId == null) return;

    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    await client.post(
      MedusaEndpoints.cartById(cartId),
      headers: headers,
      body: {
        'email': customerEmail.trim().toLowerCase(),
      },
    );
  }

  @override
  Future<void> addItem(
    GlorovProduct product, {
    GlorovProductVariant? variant,
    int quantity = 1,
  }) async {
    // 1. Optimistic UI update in GlorovCartState
    _state.addToCart(product, variant: variant, quantity: quantity);

    // 2. Synchronize with remote Medusa cart
    final cartId = await _ensureCart();
    if (cartId == null) return;

    final variantId = variant?.id.isNotEmpty == true
        ? variant!.id
        : (product.variants.isNotEmpty ? product.variants.first.id : null);

    if (variantId != null && variantId.isNotEmpty) {
      final token = _storage.getItem('glorov_customer_token');
      final headers = (token != null && token.isNotEmpty)
          ? {'Authorization': 'Bearer $token'}
          : null;

      await client.post(
        MedusaEndpoints.cartLineItems(cartId),
        headers: headers,
        body: {
          'variant_id': variantId,
          'quantity': quantity,
        },
      );
    }
  }

  @override
  Future<void> updateQuantity(String itemKey, int newQuantity) async {
    _state.updateQuantity(itemKey, newQuantity);

    final cartId = _cartId ?? _storage.getItem('glorov_cart_id');
    if (cartId == null) return;

    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    if (newQuantity <= 0) {
      await removeItem(itemKey);
    } else {
      await client.post(
        MedusaEndpoints.cartLineItemById(cartId, itemKey),
        headers: headers,
        body: {
          'quantity': newQuantity,
        },
      );
    }
  }

  @override
  Future<void> removeItem(String itemKey) async {
    _state.removeFromCart(itemKey);

    final cartId = _cartId ?? _storage.getItem('glorov_cart_id');
    if (cartId == null) return;

    final token = _storage.getItem('glorov_customer_token');
    final headers = (token != null && token.isNotEmpty)
        ? {'Authorization': 'Bearer $token'}
        : null;

    await client.delete(
      MedusaEndpoints.cartLineItemById(cartId, itemKey),
      headers: headers,
    );
  }

  @override
  Future<void> clearCart() async {
    _state.clearCart();
    _cartId = null;
    _storage.removeItem('glorov_cart_id');
  }

  @override
  Future<GlorovCouponValidation> validateCoupon(
    String code,
    double currentSubtotal,
  ) async {
    final cleanCode = code.trim().toUpperCase();
    if (cleanCode.isEmpty) {
      return const GlorovCouponValidation(
        isValid: false,
        code: '',
        message: 'Please enter a coupon code',
      );
    }

    final cartId = await _ensureCart();
    if (cartId != null) {
      final token = _storage.getItem('glorov_customer_token');
      final headers = (token != null && token.isNotEmpty)
          ? {'Authorization': 'Bearer $token'}
          : null;

      final result = await client.post<GlorovCouponValidation>(
        MedusaEndpoints.cartPromotions(cartId),
        headers: headers,
        body: {
          'promo_codes': [cleanCode],
        },
        parser: (json) {
          if (json is Map && json['cart'] is Map) {
            final cart = json['cart'] as Map<String, dynamic>;
            final discountPaise =
                (cart['discount_total'] as num?)?.toDouble() ?? 0.0;
            final discountInr =
                discountPaise > 1000 ? discountPaise / 100.0 : discountPaise;

            return GlorovCouponValidation(
              isValid: discountInr > 0,
              code: cleanCode,
              discountAmount: discountInr,
              discountPercent: currentSubtotal > 0
                  ? (discountInr / currentSubtotal) * 100
                  : 0.0,
              message: discountInr > 0
                  ? 'Coupon applied! Saved ₹${discountInr.toStringAsFixed(0)}'
                  : 'Coupon code not applicable to this order',
            );
          }
          return GlorovCouponValidation(
            isValid: false,
            code: cleanCode,
            message: 'Coupon code could not be verified',
          );
        },
      );

      if (result.isSuccess && result.requireData.isValid) {
        _state.applyCoupon(cleanCode);
        return result.requireData;
      }
    }

    // Local fallback promotional rules
    final localResult = _state.applyCoupon(cleanCode);
    if (localResult.$1) {
      return GlorovCouponValidation(
        isValid: true,
        code: cleanCode,
        discountPercent: cleanCode == 'GLOROV10'
            ? 10.0
            : (cleanCode == 'SEEDS20' ? 20.0 : 0.0),
        discountAmount: _state.promoDiscountAmount,
        isFreeShipping: cleanCode == 'FREESHIP',
        message: localResult.$2,
      );
    }

    return GlorovCouponValidation(
      isValid: false,
      code: cleanCode,
      message: localResult.$2,
    );
  }

  @override
  Future<Set<String>> getWishlistIds() async {
    return _state.wishlistIds;
  }

  @override
  Future<void> toggleWishlist(String productId) async {
    _state.toggleWishlist(productId);
  }

  @override
  Future<void> moveToWishlist(String itemKey) async {
    _state.moveToWishlist(itemKey);
  }

  @override
  Future<void> addAllWishlistToCart() async {
    for (final id in _state.wishlistIds) {
      final product = GlorovProductCache.get(id);
      if (product != null) {
        await addItem(product);
      }
    }
  }
}
