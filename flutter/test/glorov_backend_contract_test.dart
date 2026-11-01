import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_address.dart';
import 'package:shop/models/glorov/glorov_delivery_option.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_payment_method.dart';
import 'package:shop/models/glorov/glorov_product.dart';
import 'package:shop/models/glorov/glorov_user_profile.dart';
import 'package:shop/repositories/contracts/account_repository.dart';
import 'package:shop/repositories/contracts/cart_repository.dart';
import 'package:shop/repositories/contracts/notification_repository.dart';
import 'package:shop/repositories/contracts/order_repository.dart';
import 'package:shop/repositories/contracts/product_repository.dart';
import 'package:shop/repositories/contracts/support_repository.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/repositories/mock/local_account_repository.dart';
import 'package:shop/repositories/mock/local_cart_repository.dart';
import 'package:shop/repositories/mock/local_notification_repository.dart';
import 'package:shop/repositories/mock/local_order_repository.dart';
import 'package:shop/repositories/mock/local_support_repository.dart';
import 'package:shop/repositories/mock/mock_product_repository.dart';
import 'package:shop/repositories/remote/api_result.dart';
import 'package:shop/repositories/remote/medusa_api_config.dart';
import 'package:shop/repositories/remote/medusa_endpoints.dart';
import 'package:shop/services/glorov_account_state.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Prompt 13: Medusa API Models & Serialization Tests', () {
    test(
        'GlorovProduct.fromMedusaJson maps Medusa v2 store response with botanical metadata',
        () {
      final medusaJson = {
        'id': 'prod_glr_medusa_001',
        'title': 'Organic Heirloom San Marzano Tomato Seeds',
        'subtitle': 'Non-hybrid heritage cultivar for terrace gardens',
        'description':
            'Prized indeterminate Italian plum tomato renowned for rich sauces.',
        'handle': 'organic-san-marzano-tomato-seeds',
        'thumbnail':
            'https://images.unsplash.com/photo-1592841200221-a6898f307baa',
        'images': [
          {
            'url':
                'https://images.unsplash.com/photo-1592841200221-a6898f307baa'
          },
          {
            'url':
                'https://images.unsplash.com/photo-1508615039623-a25605d2b022'
          },
        ],
        'variants': [
          {
            'id': 'var_seed_100',
            'title': '100 Seeds Pack',
            'price': 220.0,
            'metadata': {
              'discount_price': 185.0,
            },
          },
          {
            'id': 'var_seed_250',
            'title': '250 Seeds Nursery Pack',
            'price': 450.0,
            'metadata': {
              'discount_price': 380.0,
            },
          },
        ],
        'categories': [
          {'name': 'Vegetable Seeds'},
        ],
        'tags': [
          {'value': 'Heirloom'},
          {'value': 'Non-GMO'},
        ],
        'metadata': {
          'botanical_name': 'Solanum lycopersicum var. San Marzano',
          'germination_time_range': '6–10 days',
          'sowing_depth': '0.5 cm',
          'sunlight': 'Full Sun (6+ hrs direct)',
          'watering': 'Regular, deep at roots',
          'season': 'Summer & Monsoon',
          'difficulty': 'Moderate',
          'is_pet_friendly': false,
          'in_stock': true,
          'rating': 4.9,
          'review_count': 128,
        },
      };

      final product = GlorovProduct.fromMedusaJson(medusaJson);

      expect(product.id, 'prod_glr_medusa_001');
      expect(product.title, 'Organic Heirloom San Marzano Tomato Seeds');
      expect(product.slug, 'organic-san-marzano-tomato-seeds');
      expect(product.botanicalName, 'Solanum lycopersicum var. San Marzano');
      expect(product.category, 'Vegetable Seeds');
      expect(
          product.primaryImage, contains('photo-1592841200221-a6898f307baa'));
      expect(product.imageUrls.length, 2);
      expect(product.variants.length, 2);
      expect(product.price, 220.0);
      expect(product.effectivePrice, 185.0);
      expect(product.germinationPeriod, '6–10 days');
      expect(product.sowingDepth, '0.5 cm');
      expect(product.sunlightRequirement, 'Full Sun (6+ hrs direct)');
      expect(product.rating, 4.9);
      expect(product.reviewCount, 128);
      expect(product.inStock, true);
    });

    test('GlorovProduct toJson and fromJson roundtrip preserves all fields',
        () {
      final sample = GlorovMockData.products.first;
      final json = sample.toJson();
      final restored = GlorovProduct.fromJson(json);

      expect(restored.id, sample.id);
      expect(restored.title, sample.title);
      expect(restored.botanicalName, sample.botanicalName);
      expect(restored.category, sample.category);
      expect(restored.effectivePrice, sample.effectivePrice);
      expect(restored.price, sample.price);
      expect(restored.inStock, sample.inStock);
      expect(restored.variants.length, sample.variants.length);
    });

    test('GlorovUserProfile.fromMedusaCustomerJson maps customer attributes',
        () {
      final customerJson = {
        'id': 'cus_01J9MEDUSA001',
        'first_name': 'Aarav',
        'last_name': 'Sharma',
        'email': 'aarav.gardener@glorov.com',
        'phone': '9876543210',
        'metadata': {
          'member_since': 'October 2026',
          'membership_tier': 'Master Botanist Club',
        },
      };

      final profile = GlorovUserProfile.fromMedusaCustomerJson(customerJson);

      expect(profile.id, 'cus_01J9MEDUSA001');
      expect(profile.displayName, 'Aarav Sharma');
      expect(profile.email, 'aarav.gardener@glorov.com');
      expect(profile.phoneNumber, '9876543210');
      expect(profile.memberSince, 'October 2026');
      expect(profile.membershipTier, 'Master Botanist Club');
      expect(profile.initials, 'AS');
    });
  });

  group('Prompt 13: Repository Contracts & Mock Implementations Tests', () {
    late MockProductRepository productRepo;
    late GlorovCartState cartState;
    late GlorovAccountState accountState;
    late LocalCartRepository cartRepo;
    late LocalOrderRepository orderRepo;
    late LocalAccountRepository accountRepo;
    late LocalNotificationRepository notifRepo;
    late LocalSupportRepository supportRepo;

    setUp(() {
      productRepo = const MockProductRepository();
      cartState = GlorovCartState.instance;
      accountState = GlorovAccountState.instance;
      cartState.resetDemoData();
      accountState.resetEntireDemoAccount();

      cartRepo = LocalCartRepository(cartState);
      orderRepo = LocalOrderRepository(cartState);
      accountRepo = LocalAccountRepository(accountState, cartState);
      notifRepo = LocalNotificationRepository(accountState);
      supportRepo = LocalSupportRepository(accountState);
    });

    test('MockProductRepository retrieves all products and filters by category',
        () async {
      final all = await productRepo.getProducts();
      expect(all.isNotEmpty, true);

      final veg = await productRepo.getProducts(
        filter: const GlorovProductFilter(category: 'Vegetable Seeds'),
      );
      expect(veg.isNotEmpty, true);
      expect(
          veg.every((p) =>
              p.category.toLowerCase() == 'vegetable seeds' ||
              p.subcategory.toLowerCase() == 'vegetable seeds'),
          true);
    });

    test('MockProductRepository filters by search query and botanical name',
        () async {
      final searchResults = await productRepo.getProducts(
        filter: const GlorovProductFilter(searchQuery: 'Basil'),
      );
      expect(searchResults.isNotEmpty, true);
      expect(
        searchResults.any((p) =>
            p.title.toLowerCase().contains('basil') ||
            p.botanicalName.toLowerCase().contains('basil')),
        true,
      );
    });

    test('MockProductRepository gets product by ID and slug', () async {
      final first = GlorovMockData.products.first;
      final byId = await productRepo.getProductById(first.id);
      expect(byId, isNotNull);
      expect(byId!.id, first.id);

      final bySlug = await productRepo.getProductBySlug(first.slug);
      expect(bySlug, isNotNull);
      expect(bySlug!.slug, first.slug);
    });

    test('MockProductRepository gets categories with non-zero counts',
        () async {
      final categories = await productRepo.getCategories();
      expect(categories.isNotEmpty, true);
      expect(categories.first.productCount, greaterThan(0));
    });

    test('MockProductRepository gets featured products', () async {
      final featured = await productRepo.getFeaturedProducts();
      expect(featured.isNotEmpty, true);
      expect(featured.every((p) => p.isFeatured || p.isBestSeller), true);
    });

    test(
        'LocalCartRepository handles add, quantity update, coupon validation and wishlist',
        () async {
      // Clear cart
      await cartRepo.clearCart();
      expect((await cartRepo.getCartItems()).isEmpty, true);

      final product = GlorovMockData.products.first;
      await cartRepo.addItem(product, quantity: 2);

      final items = await cartRepo.getCartItems();
      expect(items.length, 1);
      expect(items.first.quantity, 2);

      // Coupon Validation
      final validCoupon = await cartRepo.validateCoupon('GLOROV10', 1000.0);
      expect(validCoupon.isValid, true);
      expect(validCoupon.discountPercent, 10.0);

      final invalidCoupon = await cartRepo.validateCoupon('BOGUS_CODE', 1000.0);
      expect(invalidCoupon.isValid, false);

      // Wishlist
      expect((await cartRepo.getWishlistIds()).contains(product.id), false);
      await cartRepo.toggleWishlist(product.id);
      expect((await cartRepo.getWishlistIds()).contains(product.id), true);
    });

    test('LocalOrderRepository places order and updates history', () async {
      await cartRepo.clearCart();
      final product = GlorovMockData.products.first;
      await cartRepo.addItem(product, quantity: 1);

      final order = await orderRepo.placeOrder(
        items: await cartRepo.getCartItems(),
        address: GlorovAddress.sample,
        deliveryOption: GlorovDeliveryOption.standard,
        paymentMethod: GlorovPaymentMethod.upi,
        subtotal: product.effectivePrice,
        shippingCost: 0,
        discountAmount: 0,
        totalAmount: product.effectivePrice,
      );

      expect(order.id, startsWith('GLR-ORD-'));
      expect(order.status, 'Confirmed');

      final orderList = await orderRepo.getOrders();
      expect(orderList.any((o) => o.id == order.id), true);

      final fetched = await orderRepo.getOrderById(order.id);
      expect(fetched, isNotNull);
      expect(fetched!.id, order.id);
    });

    test('LocalAccountRepository manages profile and address book', () async {
      final initialProfile = await accountRepo.getProfile();
      // First visit starts with guest profile and empty address book
      expect(accountRepo.isAuthenticated, false);
      expect(await accountRepo.getAddresses(), isEmpty);

      final updatedProfile =
          initialProfile.copyWith(displayName: 'Sourav Botanical Master');
      await accountRepo.updateProfile(updatedProfile);

      final fetched = await accountRepo.getProfile();
      expect(fetched.displayName, 'Sourav Botanical Master');

      const newAddr = GlorovAddress(
        id: 'addr_new_test',
        fullName: 'Test Gardener',
        phoneNumber: '9876543210',
        addressLine: '42 Orchid Villa',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      );
      await accountRepo.saveAddress(newAddr);
      final afterAdd = await accountRepo.getAddresses();
      expect(afterAdd.any((a) => a.id == 'addr_new_test'), true);
    });

    test('LocalNotificationRepository marks items as read', () async {
      // First visit has no unread notifications
      expect(await notifRepo.getUnreadCount(), 0);

      accountState.seedSampleNotificationsForTesting();
      final notifs = await notifRepo.getNotifications();
      expect(notifs.isNotEmpty, true);

      final first = notifs.first;
      await notifRepo.markAsRead(first.id);

      final refreshed = await notifRepo.getNotifications();
      expect(refreshed.firstWhere((n) => n.id == first.id).isRead, true);

      await notifRepo.markAllAsRead();
      final allRefreshed = await notifRepo.getNotifications();
      expect(allRefreshed.every((n) => n.isRead), true);
    });

    test('LocalSupportRepository submits inquiry and fetches FAQs', () async {
      final faqs = await supportRepo.getFaqs();
      expect(faqs.isNotEmpty, true);

      const inquiry = SupportTicketSubmission(
        name: 'Botanical Fan',
        email: 'fan@glorov.com',
        topic: 'Live Plant Care',
        orderReference: 'GLR-ORD-2026-1234',
        message: 'How should I repot the Peace Lily after arrival?',
      );

      final ticketId = await supportRepo.submitInquiry(inquiry);
      expect(ticketId, startsWith('GLR-SUP-'));
    });
  });

  group('Prompt 13: Service Locator & Remote Boundaries Tests', () {
    test('GlorovRepositories initializes default mock repositories', () {
      GlorovRepositories.init();

      expect(GlorovRepositories.products, isA<ProductRepository>());
      expect(GlorovRepositories.cart, isA<CartRepository>());
      expect(GlorovRepositories.orders, isA<OrderRepository>());
      expect(GlorovRepositories.account, isA<AccountRepository>());
      expect(GlorovRepositories.notifications, isA<NotificationRepository>());
      expect(GlorovRepositories.support, isA<SupportRepository>());
    });

    test('GlorovRepositories allows overriding individual repositories', () {
      GlorovRepositories.init();
      const customProductRepo = MockProductRepository();
      GlorovRepositories.registerProducts(customProductRepo);

      expect(identical(GlorovRepositories.products, customProductRepo), true);
    });

    test('MedusaApiConfig defaults and endpoint generation', () {
      expect(MedusaApiConfig.local.baseUrl, contains('9000'));
      expect(MedusaApiConfig.local.defaultHeaders['Content-Type'],
          'application/json');

      expect(MedusaEndpoints.products, '/store/products');
      expect(MedusaEndpoints.productById('prod_1'), '/store/products/prod_1');
      expect(MedusaEndpoints.cartById('cart_123'), '/store/carts/cart_123');
      expect(MedusaEndpoints.customerProfile, '/store/customers/me');
      expect(MedusaEndpoints.pincodeCheck, '/store/pincode-check');
    });

    test('ApiResult wraps success and failure cleanly', () {
      final success = ApiResult.success('Botanical payload');
      expect(success.isSuccess, true);
      expect(success.isFailure, false);
      expect(success.dataOrNull, 'Botanical payload');

      final failure =
          ApiResult<String>.failure('Network timeout', statusCode: 504);
      expect(failure.isSuccess, false);
      expect(failure.isFailure, true);
      expect(failure.errorOrNull, 'Network timeout');
      expect((failure as ApiFailure).statusCode, 504);
    });
  });
}
