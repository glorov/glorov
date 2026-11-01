import 'package:flutter/material.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/entry_point.dart';
import '../models/glorov/glorov_mock_data.dart';
import '../models/glorov/glorov_order.dart';
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
import '../services/glorov_cart_state.dart';

import 'screen_export.dart';

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
}) {
  return MicroPageRoute(
    settings: settings,
    type: type,
    duration: const Duration(milliseconds: 200),
    reverseDuration: const Duration(milliseconds: 200),
    child: child,
  );
}

Route<dynamic> generateRoute(RouteSettings settings) {
  String name = settings.name ?? '';
  if (name.startsWith('/')) {
    name = name.substring(1);
  }

  // Support direct product deep linking and query params (e.g. /product_details, /product_details?id=glr-seed-05, /product/glr-seed-01)
  if (name.startsWith('product_details') || name.startsWith('product/')) {
    final rawName = settings.name ?? '';
    final uri = Uri.tryParse(rawName.startsWith('/') ? rawName : '/$rawName');
    String? lookupId;
    if (uri != null) {
      if (uri.queryParameters.containsKey('id')) {
        lookupId = uri.queryParameters['id'];
      } else if (uri.pathSegments.length > 1) {
        lookupId = uri.pathSegments.last;
      }
    }
    GlorovProduct? product;
    if (settings.arguments is GlorovProduct) {
      product = settings.arguments as GlorovProduct;
    } else if (settings.arguments is String) {
      final argStr = settings.arguments as String;
      product = GlorovMockData.getProductById(argStr) ??
          GlorovMockData.getProductBySlug(argStr);
    } else if (lookupId != null && lookupId.isNotEmpty) {
      product = GlorovMockData.getProductById(lookupId) ??
          GlorovMockData.getProductBySlug(lookupId);
    }
    return _buildRoute(
      GlorovProductDetailsScreen(
        product: product ?? GlorovMockData.products.first,
      ),
      settings,
    );
  }

  switch (name) {
    case '':
    case homeScreenRoute:
      return _buildRoute(const HomeScreen(), settings);
    case onbordingScreenRoute:
      return MaterialPageRoute(
        builder: (context) => const OnBordingScreen(),
      );
    // case preferredLanuageScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const PreferredLanguageScreen(),
    //   );
    case logInScreenRoute:
      return _buildRoute(const LoginScreen(), settings);
    case signUpScreenRoute:
      return _buildRoute(const SignUpScreen(), settings);
    case passwordRecoveryScreenRoute:
      return _buildRoute(const PasswordRecoveryScreen(), settings);
    // case verificationMethodScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const VerificationMethodScreen(),
    //   );
    // case otpScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const OtpScreen(),
    //   );
    // case newPasswordScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const SetNewPasswordScreen(),
    //   );
    // case doneResetPasswordScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const DoneResetPasswordScreen(),
    //   );
    // case termsOfServicesScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const TermsOfServicesScreen(),
    //   );
    // case noInternetScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const NoInternetScreen(),
    //   );
    // case serverErrorScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const ServerErrorScreen(),
    //   );
    // case signUpVerificationScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const SignUpVerificationScreen(),
    //   );
    // case setupFingerprintScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const SetupFingerprintScreen(),
    //   );
    // case setupFaceIdScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const SetupFaceIdScreen(),
    //   );
    case productDetailsScreenRoute:
      GlorovProduct? product;
      if (settings.arguments is GlorovProduct) {
        product = settings.arguments as GlorovProduct;
      } else if (settings.arguments is String) {
        final argStr = settings.arguments as String;
        product = GlorovMockData.getProductById(argStr) ??
            GlorovMockData.getProductBySlug(argStr);
      }
      return _buildRoute(
        GlorovProductDetailsScreen(
          product: product ?? GlorovMockData.products.first,
        ),
        settings,
      );
    case productReviewsScreenRoute:
      GlorovProduct? reviewProduct;
      if (settings.arguments is GlorovProduct) {
        reviewProduct = settings.arguments as GlorovProduct;
      } else if (settings.arguments is String) {
        final argStr = settings.arguments as String;
        reviewProduct = GlorovMockData.getProductById(argStr) ??
            GlorovMockData.getProductBySlug(argStr);
      }
      return _buildRoute(
          ProductReviewsScreen(product: reviewProduct), settings);
    // case addReviewsScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const AddReviewScreen(),
    //   );
    // case brandScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const BrandScreen(),
    //   );
    // case discoverWithImageScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const DiscoverWithImageScreen(),
    //   );
    // case subDiscoverScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const SubDiscoverScreen(),
    //   );
    case categoriesScreenRoute:
    case discoverScreenRoute:
      if (settings.arguments is String &&
          (settings.arguments as String).trim().isNotEmpty) {
        final category = (settings.arguments as String).trim();
        return _buildRoute(
            GlorovCatalogScreen(initialCategory: category), settings);
      }
      return _buildRoute(const GlorovCategoriesScreen(), settings);
    case onSaleScreenRoute:
      return _buildRoute(const GlorovCatalogScreen(), settings);
    case kidsScreenRoute:
      return _buildRoute(const GlorovCatalogScreen(), settings);
    case searchScreenRoute:
      String? query;
      if (settings.arguments is String) {
        query = settings.arguments as String;
      }
      return GlorovSearchPageRoute(
        settings: settings,
        builder: (context) => GlorovSearchScreen(initialQuery: query),
      );
    // case searchHistoryScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const SearchHistoryScreen(),
    //   );
    case bookmarkScreenRoute:
      return _buildRoute(const GlorovWishlistScreen(), settings);
    case entryPointScreenRoute:
      return MaterialPageRoute(
        builder: (context) => const EntryPoint(),
      );
    case profileScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.overview,
        ),
        settings,
      );
    case getHelpScreenRoute:
    case faqScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.helpCenter,
        ),
        settings,
      );
    case chatScreenRoute:
    case contactSupportScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.contactSupport,
        ),
        settings,
      );
    case userInfoScreenRoute:
    case editUserInfoScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.profile,
        ),
        settings,
      );
    case notificationsScreenRoute:
    case noNotificationScreenRoute:
    case enableNotificationScreenRoute:
    case notificationOptionsScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.notifications,
        ),
        settings,
      );
    case addressesScreenRoute:
    case addNewAddressesScreenRoute:
    case noAddressScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.addresses,
        ),
        settings,
      );
    case preferencesScreenRoute:
    case selectLanguageScreenRoute:
      return _buildRoute(
        const GlorovAccountScreen(
          initialSection: GlorovAccountSection.settings,
        ),
        settings,
      );
    case ordersScreenRoute:
      return _buildRoute(const GlorovOrdersScreen(), settings);
    case orderDetailsScreenRoute:
      GlorovOrder? orderDetails;
      if (settings.arguments is GlorovOrder) {
        orderDetails = settings.arguments as GlorovOrder;
      } else if (settings.arguments is String) {
        orderDetails =
            GlorovCartState.instance.getOrderById(settings.arguments as String);
      }
      return _buildRoute(
          GlorovOrderConfirmationScreen(order: orderDetails), settings);
    // case cancleOrderScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const CancleOrderScreen(),
    //   );
    // case deliveredOrdersScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const DelivereOrdersdScreen(),
    //   );
    // case cancledOrdersScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const CancledOrdersScreen(),
    //   );
    // case emptyPaymentScreenRoute:
    //   return MaterialPageRoute(
    //     builder: (context) => const EmptyPaymentScreen(),
    //   );
    case emptyWalletScreenRoute:
      return _buildRoute(const EmptyWalletScreen(), settings);
    case walletScreenRoute:
      return _buildRoute(const WalletScreen(), settings);
    case cartScreenRoute:
      return _buildRoute(const GlorovCartScreen(), settings);
    case checkoutScreenRoute:
      return _buildRoute(const GlorovCheckoutScreen(), settings);
    case 'thanks_for_order':
    case 'order_confirmation':
    case thanksForOrderScreenRoute:
      GlorovOrder? thanksOrder;
      if (settings.arguments is GlorovOrder) {
        thanksOrder = settings.arguments as GlorovOrder;
      }
      return _buildRoute(
          GlorovOrderConfirmationScreen(order: thanksOrder), settings);
    case termsOfServicesScreenRoute:
      return _buildRoute(const TermsOfServiceScreen(), settings);
    case privacyPolicyScreenRoute:
      return _buildRoute(const PrivacyPolicyScreen(), settings);
    case shippingAndTrustPolicyScreenRoute:
      return _buildRoute(const ShippingAndTrustPolicyScreen(), settings);
    case policiesScreenRoute:
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
          GlorovPolicyHubScreen(initialTab: initialTab), settings);
    case devInteractionShowcaseRoute:
    case 'showcase':
      return _buildRoute(const InteractionShowcaseScreen(), settings);
    default:
      return _buildRoute(const HomeScreen(), settings);
  }
}
