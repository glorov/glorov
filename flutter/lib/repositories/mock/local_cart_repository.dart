import '../../models/glorov/glorov_mock_data.dart';
import '../../models/glorov/glorov_product.dart';
import '../../services/glorov_cart_state.dart';
import '../contracts/cart_repository.dart';

/// Local Storage / In-Memory implementation of CartRepository
/// Uses GlorovCartState as the underlying synchronous reactive engine.
class LocalCartRepository implements CartRepository {
  final GlorovCartState _state;

  LocalCartRepository([GlorovCartState? state])
      : _state = state ?? GlorovCartState.instance;

  @override
  Future<List<GlorovCartItem>> getCartItems() async {
    return _state.items;
  }

  @override
  Future<void> addItem(
    GlorovProduct product, {
    GlorovProductVariant? variant,
    int quantity = 1,
  }) async {
    _state.addToCart(product, variant: variant, quantity: quantity);
  }

  @override
  Future<void> updateQuantity(String itemKey, int newQuantity) async {
    _state.updateQuantity(itemKey, newQuantity);
  }

  @override
  Future<void> removeItem(String itemKey) async {
    _state.removeFromCart(itemKey);
  }

  @override
  Future<void> clearCart() async {
    _state.clearCart();
  }

  @override
  Future<GlorovCouponValidation> validateCoupon(
    String code,
    double currentSubtotal,
  ) async {
    final cleanCode = code.trim().toUpperCase();

    if (cleanCode == 'GLOROV10') {
      if (currentSubtotal < 499) {
        return const GlorovCouponValidation(
          isValid: false,
          code: 'GLOROV10',
          message: 'Minimum order value of ₹499 required for GLOROV10.',
        );
      }
      final disc = currentSubtotal * 0.10;
      return GlorovCouponValidation(
        isValid: true,
        code: cleanCode,
        discountPercent: 10.0,
        discountAmount: disc,
        message: '10% Botanical Welcome discount applied!',
      );
    } else if (cleanCode == 'SEEDS20') {
      if (currentSubtotal < 599) {
        return const GlorovCouponValidation(
          isValid: false,
          code: 'SEEDS20',
          message: 'Minimum order value of ₹599 required for SEEDS20.',
        );
      }
      final disc = currentSubtotal * 0.20;
      return GlorovCouponValidation(
        isValid: true,
        code: cleanCode,
        discountPercent: 20.0,
        discountAmount: disc,
        message: '20% Heirloom Seed festival discount applied!',
      );
    } else if (cleanCode == 'FREESHIP') {
      return const GlorovCouponValidation(
        isValid: true,
        code: 'FREESHIP',
        isFreeShipping: true,
        message: 'Free Express Transit courier fee waived!',
      );
    }

    return GlorovCouponValidation(
      isValid: false,
      code: cleanCode,
      message: 'Invalid promo code "$code". Please check the spelling.',
    );
  }

  @override
  Future<void> syncCartWithCustomer(String customerEmail) async {
    // No-op in offline mock mode
  }

  @override
  Future<void> loadRemoteCart() async {
    // In mock mode, state is already maintained locally
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
      final product = GlorovMockData.getProductById(id);
      if (product != null) {
        _state.addToCart(product);
      }
    }
  }
}
