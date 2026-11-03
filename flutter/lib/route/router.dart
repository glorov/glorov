import 'package:flutter/material.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/entry_point.dart';
import '../models/glorov/glorov_order.dart';
import '../models/glorov/glorov_mock_data.dart';
import '../models/glorov/glorov_product.dart';
import '../screens/cart/glorov_cart_screen.dart';
import '../screens/catalog/glorov_catalog_screen.dart';
import '../screens/checkout/glorov_checkout_screen.dart';
import '../screens/checkout/glorov_order_confirmation_screen.dart';
import '../screens/order/glorov_orders_screen.dart';
import '../screens/product/glorov_product_details_screen.dart';
import '../screens/wishlist/glorov_wishlist_screen.dart';
import '../screens/account/glorov_account_screen.dart';
import '../screens/dev/interaction_showcase_screen.dart';
import '../screens/discover/glorov_categories_screen.dart';
import '../services/glorov_account_state.dart';
import '../services/glorov_cart_state.dart';
import '../services/glorov_header_scroll_notifier.dart';
import 'route_constants.dart';

import 'screen_export.dart';

/// Global RouteObserver for screen lifecycle listening
final RouteObserver<ModalRoute<void>> glorovRouteObserver =
    RouteObserver<ModalRoute<void>>();

/// NavigatorObserver that synchronizes top category bar state with route transitions
class GlorovNavigatorObserver extends NavigatorObserver {
  void _syncCategory(String? routeName) {
    if (routeName == null ||
        routeName == homeScreenRoute ||
        routeName == '/' ||
        routeName == '' ||
        routeName == '/home') {
      GlorovHeaderScrollNotifier.instance.clearCategory();
    }
  }

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPop(route, previousRoute);
    _syncCategory(previousRoute?.settings.name);
  }

  @override
  void didPush(Route<dynamic> route, Route<dynamic>? previousRoute) {
    super.didPush(route, previousRoute);
    _syncCategory(route.settings.name);
  }

  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    super.didReplace(newRoute: newRoute, oldRoute: oldRoute);
    _syncCategory(newRoute?.settings.name);
  }
}

// Yuo will get 50+ screens and more once you have the full template
// 🔗 Full template: https://theflutterway.gumroad.com/l/fluttershop

// NotificationPermissionScreen()
// PreferredLanguageScreen()
// SelectLanguageScreen()
// SignUpVerificationScreen()
// ProfileSetupScreen()
// VerificationMethodScreen()
// OtpScreen()
// SetNewPasswordScreen()
// DoneResetPasswordScreen()
// TermsOfServicesScreen()
// SetupFingerprintScreen()
// SetupFingerprintScreen()
// SetupFingerprintScreen()
// SetupFingerprintScreen()
// SetupFaceIdScreen()
// OnSaleScreen()
// BannerLStyle2()
// BannerLStyle3()
// BannerLStyle4()
// SearchScreen()
// SearchHistoryScreen()
// NotificationsScreen()
// EnableNotificationScreen()
// NoNotificationScreen()
// NotificationOptionsScreen()
// ProductInfoScreen()
// ShippingMethodsScreen()
// ProductReviewsScreen()
// SizeGuideScreen()
// BrandScreen()
// CartScreen()
// EmptyCartScreen()
// PaymentMethodScreen()
// ThanksForOrderScreen()
// CurrentPasswordScreen()
// EditUserInfoScreen()
// OrdersScreen()
// OrderProcessingScreen()
// OrderDetailsScreen()
// CancleOrderScreen()
// DelivereOrdersdScreen()
// AddressesScreen()
// NoAddressScreen()
// AddNewAddressScreen()
// ServerErrorScreen()
// NoInternetScreen()
// ChatScreen()
// DiscoverWithImageScreen()
// SubDiscoverScreen()
// AddNewCardScreen()
// EmptyPaymentScreen()
// GetHelpScreen()

// ℹ️ All the comments screen are included in the full template
// 🔗 Full template: https://theflutterway.gumroad.com/l/fluttershop

Route<dynamic> _buildRoute(
  Widget child,
  RouteSettings settings, {
  MicroTransitionType type = MicroTransitionType.fade,
  String? overrideRouteName,
}) {
  final rawName = overrideRouteName ?? settings.name ?? '';
  final normalizedName = rawName.isEmpty
      ? '/'
      : (rawName.startsWith('/') ? rawName : '/$rawName');
  final effectiveSettings = RouteSettings(
    name: normalizedName,
    arguments: settings.arguments,
  );
  return MicroPageRoute(
    settings: effectiveSettings,
    type: type,
    duration: const Duration(milliseconds: 200),
    reverseDuration: const Duration(milliseconds: 200),
    child: child,
  );
}

Route<dynamic> generateRoute(RouteSettings settings) {
  final rawName = settings.name ?? '';
  final uri = Uri.tryParse(rawName.startsWith('/') ? rawName : '/$rawName');
  String name = (uri != null && uri.path.isNotEmpty) ? uri.path : rawName;
  while (name.startsWith('/')) {
    name = name.substring(1);
  }
  while (name.endsWith('/')) {
    name = name.substring(0, name.length - 1);
  }

  // Support direct product deep linking and query params (e.g. /product_details, /product_details?id=glr-seed-05, /product/glr-seed-01, /products/chinese-cabbage-seeds)
  if (name.startsWith('product_details') ||
      name.startsWith('product/') ||
      name.startsWith('products/') ||
      name == 'product' ||
      name == 'products') {
    String? lookupId;
    final cleanSegments =
        uri?.pathSegments.where((s) => s.isNotEmpty).toList() ?? [];
    if (uri != null) {
      if (uri.queryParameters.containsKey('id')) {
        lookupId = uri.queryParameters['id'];
      } else if (uri.queryParameters.containsKey('slug')) {
        lookupId = uri.queryParameters['slug'];
      } else if (cleanSegments.length > 1) {
        lookupId = cleanSegments.last;
      }
    }
    GlorovProduct? product;
    String? slugOrId = lookupId;
    if (settings.arguments is GlorovProduct) {
      product = settings.arguments as GlorovProduct;
      slugOrId = product.slug.isNotEmpty ? product.slug : product.id;
    } else if (settings.arguments is String) {
      final argStr = settings.arguments as String;
      slugOrId = argStr;
      product = GlorovProductCache.get(argStr) ??
          GlorovMockData.getProductById(argStr) ??
          GlorovMockData.getProductBySlug(argStr);
    } else if (lookupId != null && lookupId.isNotEmpty) {
      product = GlorovProductCache.get(lookupId) ??
          GlorovMockData.getProductById(lookupId) ??
          GlorovMockData.getProductBySlug(lookupId);
    }

    final finalSlugOrId = slugOrId ??
        (product != null
            ? (product.slug.isNotEmpty ? product.slug : product.id)
            : lookupId ?? '');

    return _buildRoute(
      GlorovProductDetailsScreen(
        product: product,
        productIdOrSlug: finalSlugOrId,
      ),
      settings,
      overrideRouteName: '/product/$finalSlugOrId',
    );
  }

  switch (name) {
    case '':
    case 'home':
      return _buildRoute(const HomeScreen(), settings, overrideRouteName: '/');
    case 'onbording':
      return _buildRoute(const OnBordingScreen(), settings, overrideRouteName: '/onbording');
    case 'login':
      String? loginRedirect;
      String? loginReason;
      if (uri != null) {
        if (uri.queryParameters.containsKey('redirect')) {
          loginRedirect = uri.queryParameters['redirect'];
        } else if (uri.queryParameters.containsKey('from')) {
          loginRedirect = uri.queryParameters['from'];
        }
      }
      if (settings.arguments is String) {
        loginRedirect = settings.arguments as String;
      } else if (settings.arguments is Map<String, dynamic>) {
        final map = settings.arguments as Map<String, dynamic>;
        loginRedirect = map['redirectTo'] as String?;
        loginReason = map['reason'] as String?;
      }
      return _buildRoute(
        LoginScreen(
          redirectTo: loginRedirect,
          reason: loginReason,
        ),
        settings,
        overrideRouteName:
            loginRedirect != null ? '/login?redirect=$loginRedirect' : '/login',
      );
    case 'signup':
      String? signupRedirect;
      String? signupReason;
      if (uri != null) {
        if (uri.queryParameters.containsKey('redirect')) {
          signupRedirect = uri.queryParameters['redirect'];
        } else if (uri.queryParameters.containsKey('from')) {
          signupRedirect = uri.queryParameters['from'];
        }
      }
      if (settings.arguments is String) {
        signupRedirect = settings.arguments as String;
      } else if (settings.arguments is Map<String, dynamic>) {
        final map = settings.arguments as Map<String, dynamic>;
        signupRedirect = map['redirectTo'] as String?;
        signupReason = map['reason'] as String?;
      }
      return _buildRoute(
        SignUpScreen(
          redirectTo: signupRedirect,
          reason: signupReason,
        ),
        settings,
        overrideRouteName: signupRedirect != null
            ? '/signup?redirect=$signupRedirect'
            : '/signup',
      );
    case 'password_recovery':
      return _buildRoute(const PasswordRecoveryScreen(), settings, overrideRouteName: '/password_recovery');
    case 'product_reviews':
      GlorovProduct? reviewProduct;
      if (settings.arguments is GlorovProduct) {
        reviewProduct = settings.arguments as GlorovProduct;
      } else if (settings.arguments is String) {
        final argStr = settings.arguments as String;
        reviewProduct = GlorovProductCache.get(argStr);
      }
      return _buildRoute(
        ProductReviewsScreen(product: reviewProduct),
        settings,
        overrideRouteName: '/product_reviews',
      );
    case 'seeds':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Seeds',
        ),
        settings,
        overrideRouteName: '/seeds',
      );
    case 'live-plants':
    case 'live_plants':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Live Plants',
        ),
        settings,
        overrideRouteName: '/live_plants',
      );
    case 'planters':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Planters & Pots',
        ),
        settings,
        overrideRouteName: '/planters',
      );
    case 'plant-care':
    case 'plant_care':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Plant Care & Soil',
        ),
        settings,
        overrideRouteName: '/plant_care',
      );
    case 'flowering':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Flowering Plants',
        ),
        settings,
        overrideRouteName: '/flowering',
      );
    case 'herbs':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Fruit & Herb Seeds',
        ),
        settings,
        overrideRouteName: '/herbs',
      );
    case 'vegetables':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Vegetable Seeds',
        ),
        settings,
        overrideRouteName: '/vegetables',
      );
    case 'offers':
      return _buildRoute(
        GlorovCatalogScreen(
          initialCategory: settings.arguments is String
              ? settings.arguments as String
              : 'Offers',
          initialOffersOnly: true,
        ),
        settings,
        overrideRouteName: '/offers',
      );
    case 'categories':
    case 'discover':
      String? initialCatHandle;
      if (uri != null) {
        if (uri.queryParameters.containsKey('category')) {
          initialCatHandle = uri.queryParameters['category'];
        } else if (uri.queryParameters.containsKey('handle')) {
          initialCatHandle = uri.queryParameters['handle'];
        }
      }
      if (initialCatHandle != null && initialCatHandle.isNotEmpty) {
        return _buildRoute(
          GlorovCategoriesScreen(initialCategoryHandle: initialCatHandle),
          settings,
          overrideRouteName: '/categories?category=$initialCatHandle',
        );
      }
      if (settings.arguments is String &&
          (settings.arguments as String).trim().isNotEmpty) {
        final category = (settings.arguments as String).trim();
        return _buildRoute(
          GlorovCatalogScreen(initialCategory: category),
          settings,
          overrideRouteName: '/discover',
        );
      }
      return _buildRoute(
        const GlorovCategoriesScreen(),
        settings,
        overrideRouteName: '/categories',
      );
    case 'on_sale':
      return _buildRoute(
        const GlorovCatalogScreen(
          initialCategory: 'Offers',
          initialOffersOnly: true,
        ),
        settings,
        overrideRouteName: '/on_sale',
      );
    case 'kids':
      return _buildRoute(
        const GlorovCatalogScreen(),
        settings,
        overrideRouteName: '/kids',
      );
    case 'search':
      String? query;
      if (settings.arguments is String) {
        query = settings.arguments as String;
      }
      final searchSettings = RouteSettings(
        name: query != null && query.isNotEmpty ? '/search?q=$query' : '/search',
        arguments: settings.arguments,
      );
      return GlorovSearchPageRoute(
        settings: searchSettings,
        builder: (context) => GlorovSearchScreen(initialQuery: query),
      );
    case 'bookmark':
      return _buildRoute(
        const GlorovWishlistScreen(),
        settings,
        overrideRouteName: '/bookmark',
      );
    case 'entry_point':
      return _buildRoute(
        const EntryPoint(),
        settings,
        overrideRouteName: '/entry_point',
      );
    case 'profile':
      final secParam = uri?.queryParameters['section'] ?? uri?.queryParameters['tab'];
      final initialSection = secParam == 'settings'
          ? GlorovAccountSection.settings
          : secParam == 'addresses'
              ? GlorovAccountSection.addresses
              : secParam == 'profile'
                  ? GlorovAccountSection.profile
                  : GlorovAccountSection.overview;
      return _buildRoute(
        GlorovAccountScreen(
          initialSection: initialSection,
        ),
        settings,
        overrideRouteName: '/profile',
      );
    case 'get_help':
    case 'faq':
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.helpCenter,
        ),
        settings,
        overrideRouteName: '/faq',
      );
    case 'chat':
    case 'contact_support':
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.contactSupport,
        ),
        settings,
        overrideRouteName: '/contact_support',
      );
    case 'user_info':
    case 'edit_user_info':
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.profile,
        ),
        settings,
        overrideRouteName: '/user_info',
      );
    case 'notifications':
    case 'no_notification':
    case 'no_notifications':
    case 'enable_notifications':
    case 'notification_options':
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.notifications,
        ),
        settings,
        overrideRouteName: '/notifications',
      );
    case 'addresses':
    case 'add_new_addresses':
    case 'no_address':
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.addresses,
        ),
        settings,
        overrideRouteName: '/addresses',
      );
    case 'preferences':
    case 'select_language':
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.settings,
        ),
        settings,
        overrideRouteName: '/preferences',
      );
    case 'orders':
      if (!GlorovAccountState.instance.isAuthenticated) {
        return _buildRoute(
          const LoginScreen(
            redirectTo: ordersScreenRoute,
            reason:
                'Please sign in to view your orders and track live botanical shipments.',
          ),
          settings,
          overrideRouteName: '/login?redirect=/orders',
        );
      }
      return _buildRoute(
        const GlorovOrdersScreen(),
        settings,
        overrideRouteName: '/orders',
      );
    case 'order_details':
      if (!GlorovAccountState.instance.isAuthenticated) {
        return _buildRoute(
          const LoginScreen(
            redirectTo: ordersScreenRoute,
            reason:
                'Please sign in to view your order confirmation and shipment details.',
          ),
          settings,
          overrideRouteName: '/login?redirect=/orders',
        );
      }
      GlorovOrder? orderDetails;
      if (settings.arguments is GlorovOrder) {
        orderDetails = settings.arguments as GlorovOrder;
      } else if (settings.arguments is String) {
        orderDetails =
            GlorovCartState.instance.getOrderById(settings.arguments as String);
      }
      return _buildRoute(
        GlorovOrderConfirmationScreen(order: orderDetails),
        settings,
        overrideRouteName: '/order_details',
      );
    case 'empty_wallet':
      return _buildRoute(const EmptyWalletScreen(), settings, overrideRouteName: '/empty_wallet');
    case 'wallet':
      return _buildRoute(const WalletScreen(), settings, overrideRouteName: '/wallet');
    case 'cart':
      final showOffers = uri?.queryParameters['offers'] == 'true' ||
          settings.arguments == 'offers';
      return _buildRoute(
        GlorovCartScreen(initialShowOffers: showOffers),
        settings,
        overrideRouteName: '/cart',
      );
    case 'checkout':
      if (!GlorovAccountState.instance.isAuthenticated) {
        return _buildRoute(
          const LoginScreen(
            redirectTo: checkoutScreenRoute,
            reason:
                'Please sign in to complete your checkout and secure your botanical order.',
          ),
          settings,
          overrideRouteName: '/login?redirect=/checkout',
        );
      }
      return _buildRoute(const GlorovCheckoutScreen(), settings, overrideRouteName: '/checkout');
    case 'thanks_for_order':
    case 'order_confirmation':
    case 'thanks_order':
      GlorovOrder? thanksOrder;
      if (settings.arguments is GlorovOrder) {
        thanksOrder = settings.arguments as GlorovOrder;
      }
      return _buildRoute(
        GlorovOrderConfirmationScreen(order: thanksOrder),
        settings,
        overrideRouteName: '/order_confirmation',
      );
    case 'terms_of_services':
      return _buildRoute(const TermsOfServiceScreen(), settings, overrideRouteName: '/terms_of_services');
    case 'privacy_policy':
      return _buildRoute(const PrivacyPolicyScreen(), settings, overrideRouteName: '/privacy_policy');
    case 'shipping_and_trust_policy':
      return _buildRoute(const ShippingAndTrustPolicyScreen(), settings, overrideRouteName: '/shipping_and_trust_policy');
    case 'policies':
      GlorovPolicyTab initialTab = GlorovPolicyTab.privacy;
      if (settings.arguments is GlorovPolicyTab) {
        initialTab = settings.arguments as GlorovPolicyTab;
      } else if (settings.arguments is String) {
        final arg = (settings.arguments as String).toLowerCase();
        if (arg.contains('term')) {
          initialTab = GlorovPolicyTab.terms;
        } else if (arg.contains('ship') ||
            arg.contains('trust') ||
            arg.contains('refund')) {
          initialTab = GlorovPolicyTab.shippingAndTrust;
        }
      }
      return _buildRoute(
        GlorovPolicyHubScreen(initialTab: initialTab),
        settings,
        overrideRouteName: '/policies',
      );
    case 'dev_showcase':
    case 'showcase':
      return _buildRoute(const InteractionShowcaseScreen(), settings, overrideRouteName: '/dev_showcase');
    case 'slider_skeleton':
    case 'skeleton':
      return _buildRoute(const HomeScreen(isLoadingSlider: true), settings, overrideRouteName: '/slider_skeleton');
    default:
      final rawName = settings.name ?? '';
      final isSkeleton = rawName.contains('skeleton') ||
          rawName.contains('loading=true') ||
          settings.arguments == 'skeleton';
      return _buildRoute(HomeScreen(isLoadingSlider: isSkeleton), settings, overrideRouteName: '/');
  }
}
