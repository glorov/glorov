/// Canonical Medusa v2 Storefront API Endpoint Definitions
/// Directly aligned with GLOROV Medusa Backend routes (apps/backend/src/api/store/).
class MedusaEndpoints {
  MedusaEndpoints._();

  // Products & Taxonomy
  static const String products = '/store/products';
  static String productById(String id) => '/store/products/$id';
  static const String productCategories = '/store/product-categories';
  static String productCategoryById(String id) =>
      '/store/product-categories/$id';
  static const String collections = '/store/collections';
  static const String searchSuggestions = '/store/search/suggestions';
  static String searchSuggestionsWithQuery(String q) =>
      '/store/search/suggestions?q=${Uri.encodeComponent(q)}';

  // Cart & Line Items
  static const String carts = '/store/carts';
  static String cartById(String id) => '/store/carts/$id';
  static String cartLineItems(String cartId) =>
      '/store/carts/$cartId/line-items';
  static String cartLineItemById(String cartId, String lineId) =>
      '/store/carts/$cartId/line-items/$lineId';
  static String cartPromotions(String cartId) =>
      '/store/carts/$cartId/promotions';
  static String cartShippingMethods(String cartId) =>
      '/store/carts/$cartId/shipping-methods';
  static String cartPaymentSessions(String cartId) =>
      '/store/carts/$cartId/payment-sessions';
  static String completeCart(String cartId) => '/store/carts/$cartId/complete';

  // Customer & Authentication
  static const String customers = '/store/customers';
  static const String customerAuth = '/auth/customer/emailpass';
  static const String customerProfile = '/store/customers/me';
  static const String customerAddresses = '/store/customers/me/addresses';
  static String customerAddressById(String addressId) =>
      '/store/customers/me/addresses/$addressId';

  // Orders & Lifecycle
  static const String orders = '/store/orders';
  static String orderById(String id) => '/store/orders/$id';
  static String orderTracking(String id) => '/store/orders/$id/tracking';
  static String orderCancel(String id) => '/store/orders/$id/cancel';
  static String orderReturnRequest(String id) =>
      '/store/orders/$id/return-request';

  static const String banners = '/store/banners';
  static const String hero = '/store/hero';
  static const String offers = '/store/offers';
  static const String trustBadges = '/store/trust-badges';
  static const String announcements = '/store/announcements';
  static const String reviews = '/store/reviews';
  static String reviewHelpful(String reviewId) =>
      '/store/reviews/$reviewId/helpful';

  // Indian Commerce Custom Endpoints
  static const String pincodeCheck = '/store/pincode-check';
  static String pincodeCheckWithPin(String pincode) =>
      '/store/pincode-check?pincode=${Uri.encodeComponent(pincode)}';
  static const String razorpayCreateSession =
      '/store/payment/razorpay/create-session';
  static const String razorpayVerify = '/store/payment/razorpay/verify';
  static const String health = '/store/health';
}
