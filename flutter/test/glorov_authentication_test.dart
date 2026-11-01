import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shop/repositories/contracts/account_repository.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/repositories/mock/local_account_repository.dart';
import 'package:shop/repositories/remote/medusa_account_repository.dart';
import 'package:shop/repositories/remote/medusa_api_config.dart';
import 'package:shop/repositories/remote/medusa_endpoints.dart';
import 'package:shop/repositories/remote/medusa_http_client.dart';
import 'package:shop/screens/auth/views/login_screen.dart';
import 'package:shop/screens/auth/views/password_recovery_screen.dart';
import 'package:shop/screens/auth/views/signup_screen.dart';
import 'package:shop/services/glorov_account_state.dart';
import 'package:shop/services/storage/local_storage.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    GlorovRepositories.resetToMockDefaults();
    GlorovLocalStorage.instance.clear();
  });

  group('1. LocalAccountRepository (Mock Mode) Authentication Tests', () {
    test(
        'Successful login sets token, marks authenticated, and returns profile',
        () async {
      final repo = LocalAccountRepository();
      expect(repo.isAuthenticated, false);
      expect(repo.currentToken, isNull);

      final result = await repo.login(
        email: 'priya.sharma@example.com',
        password: 'ValidPassword123!',
      );

      expect(result.isSuccess, true);
      final profile = result.requireData;
      expect(profile.email, 'priya.sharma@example.com');
      expect(repo.isAuthenticated, true);
      expect(repo.currentToken, isNotNull);
      expect(GlorovLocalStorage.instance.getItem('glorov_customer_token'),
          repo.currentToken);
    });

    test('Login with invalid credentials returns 401 ApiFailure', () async {
      final repo = LocalAccountRepository();

      final result = await repo.login(
        email: 'fail@test.com',
        password: 'any_password',
      );

      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 401);
      expect(result.errorOrNull, contains('Invalid email or password'));
      expect(repo.isAuthenticated, false);
      expect(repo.currentToken, isNull);
    });

    test('Successful registration returns new customer profile and token',
        () async {
      final repo = LocalAccountRepository();

      final result = await repo.register(
        email: 'new.gardener@example.com',
        password: 'Password@2026',
        firstName: 'Aarav',
        lastName: 'Patel',
        phone: '9876543210',
      );

      expect(result.isSuccess, true);
      final profile = result.requireData;
      expect(profile.displayName, 'Aarav Patel');
      expect(profile.email, 'new.gardener@example.com');
      expect(profile.phoneNumber, '9876543210');
      expect(repo.isAuthenticated, true);
      expect(repo.currentToken, isNotNull);
    });

    test('Registration with existing email returns 409 conflict', () async {
      final repo = LocalAccountRepository();

      final result = await repo.register(
        email: 'existing@test.com',
        password: 'Password@2026',
        firstName: 'Test',
        lastName: 'User',
      );

      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 409);
      expect(result.errorOrNull, contains('already exists'));
    });

    test('Session restoration succeeds when token is saved, fails when empty',
        () async {
      final repo = LocalAccountRepository();

      // Initially no session
      final initialCheck = await repo.checkSession();
      expect(initialCheck.isFailure, true);
      expect(initialCheck.statusCodeOrNull, 401);

      // Save a valid token
      GlorovLocalStorage.instance
          .setItem('glorov_customer_token', 'mock_token_abc123');
      final restoredCheck = await repo.checkSession();
      expect(restoredCheck.isSuccess, true);
      expect(repo.isAuthenticated, true);
      expect(repo.currentToken, 'mock_token_abc123');
    });

    test(
        'Logout clears storage token, current token, and resets authentication',
        () async {
      final repo = LocalAccountRepository();
      await repo.login(email: 'user@example.com', password: 'Password@123');
      expect(repo.isAuthenticated, true);
      expect(GlorovLocalStorage.instance.getItem('glorov_customer_token'),
          isNotNull);

      await repo.logout();
      expect(repo.isAuthenticated, false);
      expect(repo.currentToken, isNull);
      expect(
          GlorovLocalStorage.instance.getItem('glorov_customer_token'), isNull);
    });

    test('Password reset request returns success or 404 for unknown email',
        () async {
      final repo = LocalAccountRepository();

      final successResult =
          await repo.requestPasswordReset(email: 'valid@example.com');
      expect(successResult.isSuccess, true);

      final notFoundResult =
          await repo.requestPasswordReset(email: 'unknown@test.com');
      expect(notFoundResult.isFailure, true);
      expect(notFoundResult.statusCodeOrNull, 404);
    });

    test('Password update validates minimum length', () async {
      final repo = LocalAccountRepository();

      final failResult = await repo.updatePassword(newPassword: 'short');
      expect(failResult.isFailure, true);
      expect(failResult.statusCodeOrNull, 400);

      final successResult =
          await repo.updatePassword(newPassword: 'ValidPassword123!');
      expect(successResult.isSuccess, true);
    });
  });

  group('2. MedusaAccountRepository (Remote Medusa v2 Contract) Tests', () {
    test(
        'Login calls POST /auth/customer/emailpass, stores token, and fetches /store/customers/me',
        () async {
      final mockClient = MockClient((request) async {
        if (request.url.path == MedusaEndpoints.customerAuth &&
            request.method == 'POST') {
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['email'], 'customer@medusa.test');
          expect(body['password'], 'Secret123!');
          return http.Response(
            jsonEncode({'token': 'jwt_medusa_session_token_xyz'}),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        if (request.url.path == MedusaEndpoints.customerProfile &&
            request.method == 'GET') {
          expect(request.headers['Authorization'],
              'Bearer jwt_medusa_session_token_xyz');
          return http.Response(
            jsonEncode({
              'customer': {
                'id': 'cus_medusa_001',
                'email': 'customer@medusa.test',
                'first_name': 'Horticultural',
                'last_name': 'Explorer',
                'phone': '+91 9988776655',
                'created_at': '2026-10-29T00:00:00.000Z',
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        return http.Response('Not Found', 404);
      });

      final httpClient = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockClient,
      );

      final repo = MedusaAccountRepository(httpClient);
      final result = await repo.login(
        email: 'customer@medusa.test',
        password: 'Secret123!',
      );

      expect(result.isSuccess, true);
      final profile = result.requireData;
      expect(profile.id, 'cus_medusa_001');
      expect(profile.displayName, 'Horticultural Explorer');
      expect(profile.email, 'customer@medusa.test');
      expect(repo.currentToken, 'jwt_medusa_session_token_xyz');
      expect(repo.isAuthenticated, true);
    });

    test(
        'Login with 401 invalid credentials returns ApiFailure with backend message',
        () async {
      final mockClient = MockClient((request) async {
        return http.Response(
          jsonEncode({'message': 'Invalid email or password'}),
          401,
          headers: {'content-type': 'application/json'},
        );
      });

      final httpClient = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockClient,
      );

      final repo = MedusaAccountRepository(httpClient);
      final result = await repo.login(
        email: 'wrong@medusa.test',
        password: 'wrong_password',
      );

      expect(result.isFailure, true);
      expect(result.statusCodeOrNull, 401);
      expect(result.errorOrNull, contains('Invalid email or password'));
      expect(repo.isAuthenticated, false);
      expect(repo.currentToken, isNull);
    });

    test(
        'Register completes 3-step sequence: register auth -> create customer -> authenticate',
        () async {
      int step = 0;
      final mockClient = MockClient((request) async {
        if (request.url.path == '${MedusaEndpoints.customerAuth}/register' &&
            request.method == 'POST') {
          step++;
          expect(step, 1);
          return http.Response(
            jsonEncode({'token': 'jwt_identity_token_step1'}),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        if (request.url.path == MedusaEndpoints.customers &&
            request.method == 'POST') {
          step++;
          expect(step, 2);
          expect(request.headers['Authorization'],
              'Bearer jwt_identity_token_step1');
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['email'], 'new@medusa.test');
          expect(body['first_name'], 'Sneha');
          expect(body['last_name'], 'Rao');
          return http.Response(
            jsonEncode({
              'customer': {
                'id': 'cus_new_123',
                'email': 'new@medusa.test',
                'first_name': 'Sneha',
                'last_name': 'Rao',
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        if (request.url.path == MedusaEndpoints.customerAuth &&
            request.method == 'POST') {
          step++;
          expect(step, 3);
          return http.Response(
            jsonEncode({'token': 'jwt_final_session_token_step3'}),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        if (request.url.path == MedusaEndpoints.customerProfile &&
            request.method == 'GET') {
          expect(request.headers['Authorization'],
              'Bearer jwt_final_session_token_step3');
          return http.Response(
            jsonEncode({
              'customer': {
                'id': 'cus_new_123',
                'email': 'new@medusa.test',
                'first_name': 'Sneha',
                'last_name': 'Rao',
              }
            }),
            200,
            headers: {'content-type': 'application/json'},
          );
        }

        return http.Response('Not Found', 404);
      });

      final httpClient = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockClient,
      );

      final repo = MedusaAccountRepository(httpClient);
      final result = await repo.register(
        email: 'new@medusa.test',
        password: 'Password@2026',
        firstName: 'Sneha',
        lastName: 'Rao',
      );

      expect(result.isSuccess, true);
      expect(result.requireData.displayName, 'Sneha Rao');
      expect(repo.currentToken, 'jwt_final_session_token_step3');
      expect(repo.isAuthenticated, true);
    });

    test('Password reset calls POST /auth/customer/emailpass/reset-password',
        () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/auth/customer/emailpass/reset-password');
        expect(request.method, 'POST');
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['email'], 'reset@medusa.test');
        return http.Response(jsonEncode({'success': true}), 200,
            headers: {'content-type': 'application/json'});
      });

      final httpClient = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockClient,
      );

      final repo = MedusaAccountRepository(httpClient);
      final result =
          await repo.requestPasswordReset(email: 'reset@medusa.test');
      expect(result.isSuccess, true);
    });

    test(
        'Password update sends Bearer token to POST /store/customers/me/password',
        () async {
      final mockClient = MockClient((request) async {
        expect(request.url.path, '/store/customers/me/password');
        expect(request.method, 'POST');
        expect(request.headers['Authorization'], 'Bearer jwt_test_auth');
        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['password'], 'NewSecret@2026');
        return http.Response(jsonEncode({'success': true}), 200,
            headers: {'content-type': 'application/json'});
      });

      final httpClient = MedusaHttpClient(
        config: const MedusaApiConfig(baseUrl: 'http://localhost:9000'),
        client: mockClient,
      );

      GlorovLocalStorage.instance
          .setItem('glorov_customer_token', 'jwt_test_auth');
      final repo = MedusaAccountRepository(httpClient);

      final result = await repo.updatePassword(newPassword: 'NewSecret@2026');
      expect(result.isSuccess, true);
    });
  });

  group('3. GlorovAccountState Integration Tests', () {
    test('State reflects login, auth error, and successful logout cycle',
        () async {
      final state = GlorovAccountState.instance;

      // Unauthenticated state initially
      await state.logout();
      expect(state.isAuthenticated, false);
      expect(state.isLoading, false);

      // Attempt login with invalid credentials
      final failResult = await state.login('fail@test.com', 'wrong_pass');
      expect(failResult.isFailure, true);
      expect(state.isAuthenticated, false);
      expect(state.authError, isNotNull);
      expect(state.authStatus, GlorovAuthStatus.error);

      // Attempt successful login
      final successResult =
          await state.login('flora.botanist@glorov.com', 'PlantCare#2026');
      expect(successResult.isSuccess, true);
      expect(state.isAuthenticated, true);
      expect(state.authError, isNull);
      expect(state.authStatus, GlorovAuthStatus.authenticated);
      expect(state.profile.email, 'flora.botanist@glorov.com');

      // Logout
      await state.logout();
      expect(state.isAuthenticated, false);
      expect(state.authStatus, GlorovAuthStatus.unauthenticated);
      expect(GlorovRepositories.account.isAuthenticated, false);
    });

    test('State register flow sets authenticated status and updates profile',
        () async {
      final state = GlorovAccountState.instance;
      await state.logout();

      final result = await state.register(
        email: 'priya.green@glorov.com',
        password: 'Pass#12345',
        firstName: 'Priya',
        lastName: 'Green',
      );

      expect(result.isSuccess, true);
      expect(state.isAuthenticated, true);
      expect(state.profile.displayName, 'Priya Green');
      expect(state.profile.email, 'priya.green@glorov.com');
    });
  });

  group('4. Authentication UI Screens Widget Tests', () {
    Widget buildTestableWidget(Widget child) {
      return MaterialApp(
        onGenerateRoute: (settings) => MaterialPageRoute(
          settings: settings,
          builder: (_) => const Scaffold(body: Text('Target Screen')),
        ),
        home: child,
      );
    }

    testWidgets(
        'LoginScreen renders fields, login button, and handles validation',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(buildTestableWidget(const LoginScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Welcome back!'), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Log in'), findsOneWidget);
      expect(find.text('Forgot password?'), findsOneWidget);
      expect(find.text('Sign up'), findsOneWidget);

      // Tap Login with empty fields triggers validation error
      await tester.tap(find.widgetWithText(ElevatedButton, 'Log in'));
      await tester.pumpAndSettle();

      expect(find.text('Email is required'), findsOneWidget);
    });

    testWidgets('SignUpScreen renders fields and terms checkbox',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(buildTestableWidget(const SignUpScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Create GLOROV Account'), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Create Account'),
          findsOneWidget);
      expect(find.byType(Checkbox), findsOneWidget);
      expect(find.text('Log in'), findsOneWidget);
    });

    testWidgets(
        'PasswordRecoveryScreen renders and switches to success on submit',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester
          .pumpWidget(buildTestableWidget(const PasswordRecoveryScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Reset Your Password'), findsOneWidget);
      expect(find.widgetWithText(ElevatedButton, 'Send Reset Instructions'),
          findsOneWidget);

      // Enter valid email
      await tester.enterText(find.byType(TextFormField), 'gardener@glorov.com');
      await tester
          .tap(find.widgetWithText(ElevatedButton, 'Send Reset Instructions'));
      await tester.pumpAndSettle();

      // Should show success view
      expect(find.text('Reset Instructions Sent'), findsOneWidget);
      expect(find.text('Return to Sign In'), findsOneWidget);
    });
  });
}
