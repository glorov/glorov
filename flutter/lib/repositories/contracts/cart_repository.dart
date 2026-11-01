import '../../models/glorov/glorov_product.dart';
import '../../services/glorov_cart_state.dart';

/// Coupon validation result entity
class GlorovCouponValidation {
  final bool isValid;
  final String code;
  final double discountPercent;
  final double discountAmount;
  final bool isFreeShipping;
  final String? message;

  const GlorovCouponValidation({
    required this.isValid,
    required this.code,
    this.discountPercent = 0.0,
    this.discountAmount = 0.0,
    this.isFreeShipping = false,
    this.message,
  });
}

/// Abstract Cart & Wishlist Repository Contract
abstract class CartRepository {
  Future<List<GlorovCartItem>> getCartItems();
  Future<void> addItem(GlorovProduct product,
      {GlorovProductVariant? variant, int quantity = 1});
  Future<void> updateQuantity(String itemKey, int newQuantity);
  Future<void> removeItem(String itemKey);
  Future<void> clearCart();
  Future<GlorovCouponValidation> validateCoupon(
      String code, double currentSubtotal);
  Future<void> syncCartWithCustomer(String customerEmail);
  Future<void> loadRemoteCart();

  // Synchronized Wishlist methods
  Future<Set<String>> getWishlistIds();
  Future<void> toggleWishlist(String productId);
  Future<void> moveToWishlist(String itemKey);
  Future<void> addAllWishlistToCart();
}
