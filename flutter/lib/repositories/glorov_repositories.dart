import 'contracts/account_repository.dart';
import 'contracts/announcement_repository.dart';
import 'contracts/banner_repository.dart';
import 'contracts/cart_repository.dart';
import 'contracts/hero_repository.dart';
import 'contracts/notification_repository.dart';
import 'contracts/offer_repository.dart';
import 'contracts/order_repository.dart';
import 'contracts/product_repository.dart';
import 'contracts/review_repository.dart';
import 'contracts/support_repository.dart';
import 'contracts/trust_badge_repository.dart';
import 'mock/local_account_repository.dart';
import 'mock/local_announcement_repository.dart';
import 'mock/local_banner_repository.dart';
import 'mock/local_cart_repository.dart';
import 'mock/local_hero_repository.dart';
import 'mock/local_notification_repository.dart';
import 'mock/local_offer_repository.dart';
import 'mock/local_order_repository.dart';
import 'mock/local_review_repository.dart';
import 'mock/local_support_repository.dart';
import 'mock/local_trust_badge_repository.dart';
import 'mock/mock_product_repository.dart';
import 'remote/medusa_account_repository.dart';
import 'remote/medusa_announcement_repository.dart';
import 'remote/medusa_api_config.dart';
import 'remote/medusa_banner_repository.dart';
import 'remote/medusa_cart_repository.dart';
import 'remote/medusa_hero_repository.dart';
import 'remote/medusa_http_client.dart';
import 'remote/medusa_offer_repository.dart';
import 'remote/medusa_order_repository.dart';
import 'remote/medusa_pincode_service.dart';
import 'remote/medusa_product_repository.dart';
import 'remote/medusa_review_repository.dart';
import 'remote/medusa_trust_badge_repository.dart';

enum RepositoryMode {
  mock,
  remote,
}

/// Central Service Locator & Data Access Boundary Registry for GLOROV
///
/// Decouples UI screens and state stores from raw data implementations.
/// Allows zero-touch switching between in-memory mock data (for development & offline testing)
/// and live Medusa v2 Store API integrations (for production deployments).
class GlorovRepositories {
  GlorovRepositories._();

  static final GlorovRepositories _instance = GlorovRepositories._();
  static GlorovRepositories get instance => _instance;

  static const String _defaultApiMode = String.fromEnvironment(
    'GLOROV_API_MODE',
    defaultValue: 'mock',
  );

  RepositoryMode _mode =
      _defaultApiMode == 'remote' ? RepositoryMode.remote : RepositoryMode.mock;
  MedusaApiConfig _apiConfig = MedusaApiConfig.local;
  MedusaHttpClient? _httpClient;
  MedusaPincodeService? _pincodeService;

  ProductRepository _productRepository = const MockProductRepository();
  CartRepository _cartRepository = LocalCartRepository();
  OrderRepository _orderRepository = LocalOrderRepository();
  AccountRepository _accountRepository = LocalAccountRepository();
  NotificationRepository _notificationRepository =
      LocalNotificationRepository();
  SupportRepository _supportRepository = LocalSupportRepository();
  BannerRepository _bannerRepository = const LocalBannerRepository();
  HeroRepository _heroRepository = const LocalHeroRepository();
  OfferRepository _offerRepository = LocalOfferRepository();
  TrustBadgeRepository _trustBadgeRepository = LocalTrustBadgeRepository();
  AnnouncementRepository _announcementRepository = LocalAnnouncementRepository();
  ReviewRepository _reviewRepository = LocalReviewRepository();

  RepositoryMode get mode => _mode;
  MedusaApiConfig get apiConfig => _apiConfig;
  MedusaHttpClient? get httpClient => _httpClient;
  MedusaPincodeService? get pincodeService => _pincodeService;

  ProductRepository get productRepository => _productRepository;
  CartRepository get cartRepository => _cartRepository;
  OrderRepository get orderRepository => _orderRepository;
  AccountRepository get accountRepository => _accountRepository;
  NotificationRepository get notificationRepository => _notificationRepository;
  SupportRepository get supportRepository => _supportRepository;
  BannerRepository get bannerRepository => _bannerRepository;
  HeroRepository get heroRepository => _heroRepository;
  OfferRepository get offerRepository => _offerRepository;
  TrustBadgeRepository get trustBadgeRepository => _trustBadgeRepository;
  AnnouncementRepository get announcementRepository => _announcementRepository;
  ReviewRepository get reviewRepository => _reviewRepository;

  // Static convenience accessors
  static ProductRepository get products => _instance._productRepository;
  static CartRepository get cart => _instance._cartRepository;
  static OrderRepository get orders => _instance._orderRepository;
  static AccountRepository get account => _instance._accountRepository;
  static NotificationRepository get notifications =>
      _instance._notificationRepository;
  static SupportRepository get support => _instance._supportRepository;
  static BannerRepository get banners => _instance._bannerRepository;
  static HeroRepository get hero => _instance._heroRepository;
  static OfferRepository get offers => _instance._offerRepository;
  static TrustBadgeRepository get trustBadges => _instance._trustBadgeRepository;
  static AnnouncementRepository get announcements => _instance._announcementRepository;
  static ReviewRepository get reviews => _instance._reviewRepository;
  static MedusaPincodeService? get pincode => _instance._pincodeService;

  static bool get isRemote => _instance._mode == RepositoryMode.remote;
  static bool get isMock => _instance._mode == RepositoryMode.mock;

  static void registerProducts(ProductRepository repo) =>
      _instance._productRepository = repo;

  /// Initializes repositories with the desired operation mode
  static void init({
    RepositoryMode? mode,
    MedusaApiConfig? apiConfig,
    MedusaHttpClient? customHttpClient,
    ProductRepository? customProductRepository,
    CartRepository? customCartRepository,
    OrderRepository? customOrderRepository,
    AccountRepository? customAccountRepository,
    NotificationRepository? customNotificationRepository,
    SupportRepository? customSupportRepository,
    BannerRepository? customBannerRepository,
    HeroRepository? customHeroRepository,
    OfferRepository? customOfferRepository,
    TrustBadgeRepository? customTrustBadgeRepository,
    AnnouncementRepository? customAnnouncementRepository,
    ReviewRepository? customReviewRepository,
  }) {
    final reg = _instance;
    final resolvedMode = mode ??
        (_defaultApiMode == 'remote'
            ? RepositoryMode.remote
            : RepositoryMode.mock);
    reg._mode = resolvedMode;

    if (apiConfig != null) {
      reg._apiConfig = apiConfig;
    }

    final client = customHttpClient ??
        (resolvedMode == RepositoryMode.remote
            ? MedusaHttpClient(config: reg._apiConfig)
            : null);
    reg._httpClient = client;

    if (client != null) {
      reg._pincodeService = MedusaPincodeService(client);
    }

    if (resolvedMode == RepositoryMode.remote && client != null) {
      reg._productRepository =
          customProductRepository ?? MedusaProductRepository(client);
      reg._cartRepository =
          customCartRepository ?? MedusaCartRepository(client);
      reg._orderRepository =
          customOrderRepository ?? MedusaOrderRepository(client);
      reg._accountRepository =
          customAccountRepository ?? MedusaAccountRepository(client);
      reg._notificationRepository =
          customNotificationRepository ?? LocalNotificationRepository();
      reg._supportRepository =
          customSupportRepository ?? LocalSupportRepository();
      reg._bannerRepository =
          customBannerRepository ?? MedusaBannerRepository(client);
      reg._heroRepository =
          customHeroRepository ?? MedusaHeroRepository(client);
      reg._offerRepository =
          customOfferRepository ?? MedusaOfferRepository(client);
      reg._trustBadgeRepository =
          customTrustBadgeRepository ?? MedusaTrustBadgeRepository(client);
      reg._announcementRepository =
          customAnnouncementRepository ?? MedusaAnnouncementRepository(client);
      reg._reviewRepository =
          customReviewRepository ?? MedusaReviewRepository(client);
    } else {
      reg._productRepository =
          customProductRepository ?? const MockProductRepository();
      reg._cartRepository = customCartRepository ?? LocalCartRepository();
      reg._orderRepository = customOrderRepository ?? LocalOrderRepository();
      reg._accountRepository =
          customAccountRepository ?? LocalAccountRepository();
      reg._notificationRepository =
          customNotificationRepository ?? LocalNotificationRepository();
      reg._supportRepository =
          customSupportRepository ?? LocalSupportRepository();
      reg._bannerRepository =
          customBannerRepository ?? const LocalBannerRepository();
      reg._heroRepository =
          customHeroRepository ?? const LocalHeroRepository();
      reg._offerRepository =
          customOfferRepository ?? LocalOfferRepository();
      reg._trustBadgeRepository =
          customTrustBadgeRepository ?? LocalTrustBadgeRepository();
      reg._announcementRepository =
          customAnnouncementRepository ?? LocalAnnouncementRepository();
      reg._reviewRepository =
          customReviewRepository ?? LocalReviewRepository();
    }
  }

  /// Override helpers for testing
  static void setProductRepository(ProductRepository repo) =>
      _instance._productRepository = repo;

  static void setReviewRepository(ReviewRepository repo) =>
      _instance._reviewRepository = repo;

  static void setCartRepository(CartRepository repo) =>
      _instance._cartRepository = repo;

  static void setOrderRepository(OrderRepository repo) =>
      _instance._orderRepository = repo;

  static void setAccountRepository(AccountRepository repo) =>
      _instance._accountRepository = repo;

  static void setNotificationRepository(NotificationRepository repo) =>
      _instance._notificationRepository = repo;

  static void setSupportRepository(SupportRepository repo) =>
      _instance._supportRepository = repo;

  static void setHeroRepository(HeroRepository repo) =>
      _instance._heroRepository = repo;

  static void setOfferRepository(OfferRepository repo) =>
      _instance._offerRepository = repo;

  static void setTrustBadgeRepository(TrustBadgeRepository repo) =>
      _instance._trustBadgeRepository = repo;

  static void setAnnouncementRepository(AnnouncementRepository repo) =>
      _instance._announcementRepository = repo;

  /// Resets repositories back to default mock implementations
  static void resetToMockDefaults() {
    init(mode: RepositoryMode.mock);
  }
}
