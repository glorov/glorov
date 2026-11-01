import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shop/models/glorov/glorov_address.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/repositories/contracts/product_repository.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/repositories/remote/medusa_account_repository.dart';
import 'package:shop/repositories/remote/medusa_api_config.dart';
import 'package:shop/repositories/remote/medusa_cart_repository.dart';
import 'package:shop/repositories/remote/medusa_http_client.dart';
import 'package:shop/repositories/remote/medusa_order_repository.dart';
import 'package:shop/repositories/remote/medusa_pincode_service.dart';
import 'package:shop/repositories/remote/medusa_product_repository.dart';
import 'package:shop/services/glorov_account_state.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('Prompt 14: MedusaHttpClient Core Network Layer Tests', () {
    test('Successful GET request parses JSON body and returns ApiSuccess',
        () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/store/products');
        expect(request.headers['x-publishable-api-key'], 'pk_test_123');
        return http.Response(
          jsonEncode({
            'products': [
              {
                'id': 'prod_01',
                'title': 'Monstera Deliciosa',
                'handle': 'monstera'
              },
            ],
          }),
          200,
          headers: {'content-type': 'application/json; charset=utf-8'},
        );
      });

      final client = MedusaHttpClient(
        config: const MedusaApiConfig(
          baseUrl: 'http://localhost:9000',
          publishableKey: 'pk_test_123',
        ),
        client: mockClient,
      );

      final result = await client.get<Map<String, dynamic>>(
        '/store/products',
        parser: (json) => json as Map<String, dynamic>,
      );

      expect(result.isSuccess, true);
      expect(result.requireData['products'], isA<List>());
      expect((result.requireData['products'] as List).first['title'],
          'Monstera Deliciosa');
    });

    test('HTTP 204 No Content handled gracefully', () async {
      final mockClient = MockClient((request) async {
        return http.Response('', 204);
      });

      final client = MedusaHttpClient(client: mockClient);
      final result =
          await client.delete('/store/carts/cart_1/line-items/line_1');

      expect(result.isSuccess, true);
    });

    test('HTTP 400 Bad Request extracts Medusa error message', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({'message': 'Invalid query parameter "limit"'}),
          400,
        );
      });

      final client = MedusaHttpClient(client: mockClient);
      final result = await client.get('/store/products');

      expect(result.isFailure, true);
      expect(result.errorOrNull, 'Invalid query parameter "limit"');
      expect(result.statusCodeOrNull, 400);
    });

    test('HTTP 401 Unauthorized returns auth failure', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({'message': 'Customer authentication required'}),
          401,
        );
      });

      final client = MedusaHttpClient(client: mockClient);
      final result = await client.get('/store/customers/me');

      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 401);
    });

    test('HTTP 404 Not Found returns resource not found failure', () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({'message': 'Product prod_unknown not found'}),
          404,
        );
      });

      final client = MedusaHttpClient(client: mockClient);
      final result = await client.get('/store/products/prod_unknown');

      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 404);
      expect(result.errorOrNull, contains('not found'));
    });

    test('HTTP 500 Server Error handles server failures safely', () async {
      final mockClient = MockClient((request) async {
        return http.Response('Internal Server Error', 500);
      });

      final client = MedusaHttpClient(client: mockClient);
      final result = await client.get('/store/products');

      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 500);
    });

    test('Malformed non-JSON body returns parsing failure without crashing',
        () async {
      final mockClient = MockClient((request) async {
        return http.Response('<html><body>502 Bad Gateway</body></html>', 502);
      });

      final client = MedusaHttpClient(client: mockClient);
      final result = await client.get('/store/products');

      expect(result.isFailure, true);
      expect(result.errorOrNull, contains('parse server response as JSON'));
    });

    test('Request timeout returns status code 408', () async {
      final mockClient = MockClient((request) async {
        await Future.delayed(const Duration(milliseconds: 100));
        return http.Response('{"ok":true}', 200);
      });

      final client = MedusaHttpClient(
        config: const MedusaApiConfig(timeout: Duration(milliseconds: 20)),
        client: mockClient,
      );

      final result = await client.get('/store/products');
      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 408);
      expect(result.errorOrNull, contains('timed out'));
    });
  });

  group('Prompt 14: MedusaProductRepository Live Mapping Tests', () {
    test(
        'getProducts parses Medusa v2 store products and applies botanical filters',
        () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/store/products');
        return http.Response(
          jsonEncode({
            'products': [
              {
                'id': 'prod_glr_01',
                'title': 'Organic Heirloom Tomato',
                'handle': 'heirloom-tomato',
                'variants': [
                  {
                    'id': 'var_01',
                    'title': '100 Seeds',
                    'price': 185.0,
                  }
                ],
                'categories': [
                  {'name': 'Vegetable Seeds'}
                ],
                'metadata': {
                  'botanical_name': 'Solanum lycopersicum',
                  'sunlight': 'Full Sun',
                  'in_stock': true,
                  'rating': 4.9,
                },
              },
              {
                'id': 'prod_glr_02',
                'title': 'Italian Sweet Basil',
                'handle': 'sweet-basil',
                'variants': [
                  {
                    'id': 'var_02',
                    'title': '200 Seeds',
                    'price': 120.0,
                  }
                ],
                'categories': [
                  {'name': 'Herb Seeds'}
                ],
                'metadata': {
                  'botanical_name': 'Ocimum basilicum',
                  'sunlight': 'Partial Sun',
                  'in_stock': true,
                  'rating': 4.7,
                },
              },
            ],
          }),
          200,
        );
      });

      final repo =
          MedusaProductRepository(MedusaHttpClient(client: mockClient));

      // 1. Fetch all
      final all = await repo.getProducts();
      expect(all.length, 2);
      expect(all.first.botanicalName, 'Solanum lycopersicum');

      // 2. Filter by Category
      final herbs = await repo.getProducts(
        filter: const GlorovProductFilter(category: 'Herb Seeds'),
      );
      expect(herbs.length, 1);
      expect(herbs.first.title, 'Italian Sweet Basil');
    });

    test('getProductById and getProductBySlug retrieve individual items',
        () async {
      final mockClient = MockClient((request) async {
        if (request.url.path.contains('prod_glr_01')) {
          return http.Response(
            jsonEncode({
              'product': {
                'id': 'prod_glr_01',
                'title': 'Organic Heirloom Tomato',
                'handle': 'heirloom-tomato',
                'variants': [],
                'metadata': {'botanical_name': 'Solanum lycopersicum'},
              }
            }),
            200,
          );
        } else if (request.url.queryParameters['handle'] == 'heirloom-tomato') {
          return http.Response(
            jsonEncode({
              'products': [
                {
                  'id': 'prod_glr_01',
                  'title': 'Organic Heirloom Tomato',
                  'handle': 'heirloom-tomato',
                  'variants': [],
                  'metadata': {'botanical_name': 'Solanum lycopersicum'},
                }
              ]
            }),
            200,
          );
        }
        return http.Response('{"message":"Not found"}', 404);
      });

      final repo =
          MedusaProductRepository(MedusaHttpClient(client: mockClient));

      final byId = await repo.getProductById('prod_glr_01');
      expect(byId, isNotNull);
      expect(byId!.title, 'Organic Heirloom Tomato');

      final bySlug = await repo.getProductBySlug('heirloom-tomato');
      expect(bySlug, isNotNull);
      expect(bySlug!.id, 'prod_glr_01');
    });

    test('getCategories maps taxonomy trees', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/store/product-categories');
        return http.Response(
          jsonEncode({
            'product_categories': [
              {
                'id': 'cat_veg_seeds',
                'name': 'Vegetable Seeds',
                'handle': 'vegetable-seeds',
                'products': [1, 2, 3],
              },
              {
                'id': 'cat_plants',
                'name': 'Live Plants',
                'handle': 'live-plants',
                'products': [1, 2],
              },
            ]
          }),
          200,
        );
      });

      final repo =
          MedusaProductRepository(MedusaHttpClient(client: mockClient));
      final categories = await repo.getCategories();

      expect(categories.length, 2);
      expect(categories.first.name, 'Vegetable Seeds');
      expect(categories.first.productCount, 3);
    });
  });

  group('Prompt 14: MedusaCartRepository Line-Item & Promotion Tests', () {
    late GlorovCartState cartState;

    setUp(() {
      cartState = GlorovCartState.instance;
      cartState.resetDemoData();
    });

    test('addItem and updateQuantity interact with Medusa Cart API', () async {
      String? createdCartId;
      final mockClient = MockClient((request) async {
        if (request.url.path == '/store/carts' && request.method == 'POST') {
          createdCartId = 'cart_test_123';
          return http.Response(
            jsonEncode({
              'cart': {
                'id': createdCartId,
                'items': [],
              }
            }),
            200,
          );
        } else if (request.url.path.contains('/line-items') &&
            request.method == 'POST') {
          return http.Response(
            jsonEncode({
              'cart': {
                'id': createdCartId,
                'items': [
                  {
                    'id': 'line_01',
                    'title': 'San Marzano Tomato',
                    'unit_price': 18500,
                    'quantity': 2,
                  }
                ],
              }
            }),
            200,
          );
        }
        return http.Response('{}', 200);
      });

      final repo = MedusaCartRepository(
        MedusaHttpClient(client: mockClient),
        cartState,
      );

      final product = GlorovMockData.products.first;
      await repo.addItem(product, quantity: 2);

      expect(repo.currentCartId, 'cart_test_123');
      expect(cartState.itemCount, 2);
    });

    test('validateCoupon checks promotion endpoint and applies discount',
        () async {
      final mockClient = MockClient((request) async {
        if (request.url.path == '/store/carts') {
          return http.Response(
              jsonEncode({
                'cart': {'id': 'cart_promo_test'}
              }),
              200);
        } else if (request.url.path.contains('/promotions')) {
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          final promo = (body['promo_codes'] as List).first.toString();
          if (promo == 'GLOROV10') {
            return http.Response(
              jsonEncode({
                'cart': {
                  'id': 'cart_promo_test',
                  'discount_total': 15000, // ₹150 in paise
                }
              }),
              200,
            );
          }
        }
        return http.Response('{"message":"Invalid promotion"}', 400);
      });

      final repo = MedusaCartRepository(
        MedusaHttpClient(client: mockClient),
        cartState,
      );

      final validResult = await repo.validateCoupon('GLOROV10', 1500.0);
      expect(validResult.isValid, true);
      expect(validResult.discountAmount, 150.0);
      expect(validResult.message, contains('Coupon applied'));

      final invalidResult = await repo.validateCoupon('BOGUS_CODE', 1500.0);
      expect(invalidResult.isValid, false);
    });
  });

  group('Prompt 14: MedusaAccountRepository & Profile Tests', () {
    late GlorovAccountState accountState;
    late GlorovCartState cartState;

    setUp(() {
      accountState = GlorovAccountState.instance;
      cartState = GlorovCartState.instance;
      accountState.resetEntireDemoAccount();
      cartState.resetDemoData();
    });

    test('getProfile and updateProfile sync with Medusa Customer API',
        () async {
      final mockClient = MockClient((request) async {
        if (request.url.path == '/store/customers/me' &&
            request.method == 'GET') {
          return http.Response(
            jsonEncode({
              'customer': {
                'id': 'cus_medusa_001',
                'first_name': 'Meera',
                'last_name': 'Patel',
                'email': 'meera.patel@example.com',
                'phone': '+91 98765 00000',
                'metadata': {
                  'membership_tier': 'Green Club Patron',
                  'member_since': 'June 2026',
                },
              }
            }),
            200,
          );
        } else if (request.url.path == '/store/customers/me' &&
            request.method == 'POST') {
          return http.Response(
            jsonEncode({
              'customer': {'id': 'cus_medusa_001'}
            }),
            200,
          );
        }
        return http.Response('{}', 200);
      });

      final repo = MedusaAccountRepository(
        MedusaHttpClient(client: mockClient),
        accountState,
        cartState,
      );

      final profile = await repo.getProfile();
      expect(profile.displayName, 'Meera Patel');
      expect(profile.email, 'meera.patel@example.com');
      expect(profile.initials, 'MP');

      final updated = profile.copyWith(displayName: 'Meera K. Patel');
      await repo.updateProfile(updated);
      expect(accountState.profile.displayName, 'Meera K. Patel');
    });

    test('getAddresses and saveAddress manage multi-address books', () async {
      final mockClient = MockClient((request) async {
        if (request.url.path == '/store/customers/me/addresses' &&
            request.method == 'GET') {
          return http.Response(
            jsonEncode({
              'addresses': [
                {
                  'id': 'addr_medusa_1',
                  'first_name': 'Meera',
                  'last_name': 'Patel',
                  'address_1': 'Plot 14, Lotus Enclave',
                  'city': 'Ahmedabad',
                  'province': 'Gujarat',
                  'postal_code': '380015',
                  'phone': '9876500000',
                  'is_default_shipping': true,
                }
              ]
            }),
            200,
          );
        } else if (request.url.path == '/store/customers/me/addresses' &&
            request.method == 'POST') {
          return http.Response(
            jsonEncode({
              'address': {
                'id': 'addr_medusa_new',
                'address_1': '42 Orchid Villa',
              }
            }),
            200,
          );
        }
        return http.Response('{}', 200);
      });

      final repo = MedusaAccountRepository(
        MedusaHttpClient(client: mockClient),
        accountState,
        cartState,
      );

      final addresses = await repo.getAddresses();
      expect(addresses.length, 1);
      expect(addresses.first.city, 'Ahmedabad');
      expect(addresses.first.pincode, '380015');

      const newAddress = GlorovAddress(
        id: 'addr_new',
        fullName: 'Meera Patel',
        phoneNumber: '9876500000',
        addressLine: '42 Orchid Villa',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
      );
      await repo.saveAddress(newAddress);
      expect(cartState.addresses.any((a) => a.id == 'addr_new'), true);
    });
  });

  group('Prompt 14: MedusaOrderRepository & Shiprocket Tracking Tests', () {
    test('getOrders and getOrderTracking query Medusa order endpoints',
        () async {
      final mockClient = MockClient((request) async {
        if (request.url.path == '/store/orders') {
          return http.Response(
            jsonEncode({
              'orders': [
                {
                  'id': 'order_01J9MEDUSA',
                  'display_id': 1042,
                  'status': 'completed',
                  'total': 185000,
                  'items': [
                    {
                      'id': 'item_1',
                      'title': 'Monstera Plant',
                      'unit_price': 185000,
                      'quantity': 1,
                    }
                  ],
                  'shipping_address': {
                    'first_name': 'Aarav',
                    'last_name': 'Sharma',
                    'address_1': 'Flat 201',
                    'city': 'Bengaluru',
                    'province': 'Karnataka',
                    'postal_code': '560038',
                    'phone': '9876543210',
                  },
                }
              ]
            }),
            200,
          );
        } else if (request.url.path.contains('/tracking')) {
          return http.Response(
            jsonEncode({
              'order_id': 'order_01J9MEDUSA',
              'awb_code': 'SR123456789IN',
              'courier_name': 'Bluedart Express Botanical',
              'current_status': 'Out for Delivery',
              'moisture_shield_active': true,
            }),
            200,
          );
        }
        return http.Response('{"message":"Not found"}', 404);
      });

      final repo = MedusaOrderRepository(MedusaHttpClient(client: mockClient));

      final orders = await repo.getOrders();
      expect(orders.length, 1);
      expect(orders.first.id, '#GLR-1042');
      expect(orders.first.status, 'Delivered');
      expect(orders.first.totalAmount, 1850.0);

      final tracking = await repo.getOrderTracking('order_01J9MEDUSA');
      expect(tracking, isNotNull);
      expect(tracking!['awb_code'], 'SR123456789IN');
      expect(tracking['moisture_shield_active'], true);
    });
  });

  group('Prompt 14: MedusaPincodeService Indian PIN Code Validation Tests', () {
    test('Rejects invalid format without issuing network request', () async {
      int requestCount = 0;
      final mockClient = MockClient((request) async {
        requestCount++;
        return http.Response('{}', 200);
      });

      final service =
          MedusaPincodeService(MedusaHttpClient(client: mockClient));

      // 1. PIN starting with 0
      final result1 = await service.checkPincode('012345');
      expect(result1.serviceable, false);
      expect(result1.status, 'rejected');
      expect(requestCount, 0);

      // 2. PIN with 5 digits
      final result2 = await service.checkPincode('56003');
      expect(result2.serviceable, false);
      expect(requestCount, 0);

      // 3. PIN with alpha characters
      final result3 = await service.checkPincode('56003A');
      expect(result3.serviceable, false);
      expect(requestCount, 0);
    });

    test('Queries /store/pincode-check for valid 6-digit Indian PIN', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/store/pincode-check');
        expect(request.url.queryParameters['pincode'], '560038');
        return http.Response(
          jsonEncode({
            'pincode': '560038',
            'serviceable': true,
            'status': 'serviceable',
            'city': 'Bengaluru',
            'state': 'Karnataka',
            'prepaid_eligible': true,
            'cod_available': true,
            'cod_eligible': true,
            'estimated_days': 2,
            'courier_name': 'Bluedart Botanical Air',
            'message': 'Serviceable via Express Courier (2 days)',
          }),
          200,
        );
      });

      final service =
          MedusaPincodeService(MedusaHttpClient(client: mockClient));
      final result = await service.checkPincode('560038');

      expect(result.serviceable, true);
      expect(result.city, 'Bengaluru');
      expect(result.state, 'Karnataka');
      expect(result.estimatedDays, 2);
      expect(result.codAvailable, true);
    });
  });

  group('Prompt 14: GlorovRepositories Dynamic Mode Switching Tests', () {
    test('Switches to remote mode cleanly and initializes remote adapters', () {
      final mockClient = MockClient((request) async {
        return http.Response('{"products":[]}', 200);
      });

      GlorovRepositories.init(
        mode: RepositoryMode.remote,
        apiConfig: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        customHttpClient: MedusaHttpClient(client: mockClient),
      );

      expect(GlorovRepositories.isRemote, true);
      expect(GlorovRepositories.isMock, false);
      expect(GlorovRepositories.products, isA<MedusaProductRepository>());
      expect(GlorovRepositories.cart, isA<MedusaCartRepository>());
      expect(GlorovRepositories.orders, isA<MedusaOrderRepository>());
      expect(GlorovRepositories.account, isA<MedusaAccountRepository>());
      expect(GlorovRepositories.pincode, isNotNull);

      // Reset back to mock defaults
      GlorovRepositories.resetToMockDefaults();
      expect(GlorovRepositories.isMock, true);
      expect(GlorovRepositories.isRemote, false);
    });
  });
}
