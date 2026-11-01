import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart' as app_router;
import 'package:shop/screens/auth/views/login_screen.dart';
import 'package:shop/screens/auth/views/signup_screen.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/screens/checkout/glorov_checkout_screen.dart';
import 'package:shop/screens/order/glorov_orders_screen.dart';
import 'package:shop/services/glorov_account_state.dart';
import 'package:shop/services/glorov_cart_state.dart';

Widget _buildTestApp(Widget child, {String initialRoute = '/'}) {
  return MaterialApp(
    initialRoute: initialRoute,
    onGenerateRoute: app_router.generateRoute,
    home: child,
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    GlorovAccountState.instance.resetEntireDemoAccount();
    GlorovCartState.instance.resetDemoData();
  });

  group('Authentication Route Guards & Protected Routes Tests', () {
    test('Router blocks unauthenticated direct navigation to /checkout and redirects to LoginScreen', () {
      expect(GlorovAccountState.instance.isAuthenticated, isFalse);

      final route = app_router.generateRoute(
        const RouteSettings(name: checkoutScreenRoute),
      );

      expect(route, isNotNull);
      final pageRoute = route as dynamic;
      final child = pageRoute.child;

      expect(child, isA<LoginScreen>());
      final loginScreen = child as LoginScreen;
      expect(loginScreen.redirectTo, checkoutScreenRoute);
      expect(loginScreen.reason, contains('complete your checkout'));
    });

    test('Router blocks unauthenticated direct navigation to /orders and redirects to LoginScreen', () {
      expect(GlorovAccountState.instance.isAuthenticated, isFalse);

      final route = app_router.generateRoute(
        const RouteSettings(name: ordersScreenRoute),
      );

      expect(route, isNotNull);
      final pageRoute = route as dynamic;
      final child = pageRoute.child;

      expect(child, isA<LoginScreen>());
      final loginScreen = child as LoginScreen;
      expect(loginScreen.redirectTo, ordersScreenRoute);
      expect(loginScreen.reason, contains('view your orders'));
    });

    test('Router permits authenticated user to navigate to /checkout and /orders directly', () {
      GlorovAccountState.instance.setAuthenticatedForTesting(true);
      expect(GlorovAccountState.instance.isAuthenticated, isTrue);

      final checkoutRoute = app_router.generateRoute(
        const RouteSettings(name: checkoutScreenRoute),
      );
      final ordersRoute = app_router.generateRoute(
        const RouteSettings(name: ordersScreenRoute),
      );

      expect((checkoutRoute as dynamic).child, isA<GlorovCheckoutScreen>());
      expect((ordersRoute as dynamic).child, isA<GlorovOrdersScreen>());
    });

    testWidgets('GlorovCheckoutScreen renders Sign In to Checkout card when user is not logged in',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      // Add 1 item so bag isn't empty
      GlorovCartState.instance.addToCart(GlorovMockData.products.first);
      expect(GlorovAccountState.instance.isAuthenticated, isFalse);

      await tester.pumpWidget(_buildTestApp(const GlorovCheckoutScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Sign In to Checkout'), findsOneWidget);
      expect(find.text('SIGN IN TO CONTINUE'), findsOneWidget);
      expect(find.text('CREATE NEW ACCOUNT'), findsOneWidget);
      // Delivery address input fields must NOT be displayed to unauthenticated guest
      expect(find.text('Full Name *'), findsNothing);
    });

    testWidgets('GlorovOrdersScreen renders Sign In to View Orders card when user is not logged in',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      expect(GlorovAccountState.instance.isAuthenticated, isFalse);

      await tester.pumpWidget(_buildTestApp(const GlorovOrdersScreen()));
      await tester.pumpAndSettle();

      expect(find.text('Sign In to View Orders'), findsOneWidget);
      expect(find.text('SIGN IN TO CONTINUE'), findsOneWidget);
      expect(find.text('CREATE NEW ACCOUNT'), findsOneWidget);
    });

    testWidgets('LoginScreen displays checkout notice banner when redirected from checkout',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(_buildTestApp(
        const LoginScreen(
          redirectTo: checkoutScreenRoute,
          reason: 'Please sign in to complete your checkout and secure your order.',
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Please sign in to complete your checkout and secure your order.'), findsOneWidget);
      expect(find.text('Welcome back!'), findsOneWidget);
    });

    testWidgets('SignUpScreen displays checkout notice banner when redirected from checkout',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(_buildTestApp(
        const SignUpScreen(
          redirectTo: checkoutScreenRoute,
          reason: 'Create your account to complete checkout and secure your botanical order.',
        ),
      ));
      await tester.pumpAndSettle();

      expect(find.text('Create your account to complete checkout and secure your botanical order.'), findsOneWidget);
      expect(find.text('Create GLOROV Account'), findsOneWidget);
    });

    testWidgets('CartScreen checkout button intercepts guest and triggers sign-in redirection',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      GlorovCartState.instance.addToCart(GlorovMockData.products.first);
      expect(GlorovAccountState.instance.isAuthenticated, isFalse);

      await tester.pumpWidget(_buildTestApp(const GlorovCartScreen()));
      await tester.pumpAndSettle();

      final checkoutBtn = find.widgetWithText(ElevatedButton, 'PROCEED TO CHECKOUT');
      expect(checkoutBtn, findsOneWidget);

      await tester.tap(checkoutBtn);
      await tester.pumpAndSettle();

      // Intercepted: Login screen is pushed with checkout notice
      expect(find.text('Welcome back!'), findsOneWidget);
      expect(find.text('Please sign in to complete your checkout and secure your botanical order.'), findsOneWidget);
    });
  });
}
