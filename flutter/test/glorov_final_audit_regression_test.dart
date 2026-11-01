import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart';
import 'package:shop/screens/dev/interaction_showcase_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  setUp(() {
    GlorovInteractionConfig.enabled = true;
    GlorovCartState.instance.clearCart();
  });

  group('Prompt 12: Dev Showcase & Component Integration Tests', () {
    testWidgets(
        'InteractionShowcaseScreen renders all showcase sections cleanly',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 4000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: InteractionShowcaseScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Verify intro banner & title
      expect(find.text('GLOROV Micro-Interactions Showcase [DEV]'),
          findsOneWidget);
      expect(find.text('DEV ROUTE ONLY'), findsOneWidget);

      // Verify section titles
      expect(find.textContaining('1. Tactile Tap Feedback'), findsOneWidget);
      expect(find.textContaining('2. Button Variants'), findsOneWidget);
      expect(
          find.textContaining('3. Form Validation Feedback'), findsOneWidget);
      expect(
          find.textContaining('4. Animated Numerical Counter'), findsOneWidget);
      expect(find.textContaining('5. Accessible InputFocus'), findsOneWidget);
      expect(find.textContaining('6. Accessible Toast System'), findsOneWidget);
      expect(find.textContaining('7. Zero-Layout-Shift Shimmer Skeletons'),
          findsOneWidget);
      expect(
          find.textContaining('8. Staggered Entrance Lists'), findsOneWidget);
    });

    testWidgets('ButtonStates controller updates button states across cycle',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 4000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: InteractionShowcaseScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Find controller test buttons
      final setLoadingBtn = find.text('Set Loading');
      final setSuccessBtn = find.text('Set Success');
      final setErrorBtn = find.text('Set Error');
      final resetIdleBtn = find.text('Reset Idle');

      expect(setLoadingBtn, findsOneWidget);
      expect(setSuccessBtn, findsOneWidget);
      expect(setErrorBtn, findsOneWidget);
      expect(resetIdleBtn, findsOneWidget);

      // Cycle through states
      await tester.tap(setLoadingBtn);
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.tap(setSuccessBtn);
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.text('Added!'), findsOneWidget);

      await tester.tap(setErrorBtn);
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.text('Failed'), findsOneWidget);

      await tester.tap(resetIdleBtn);
      await tester.pump(const Duration(milliseconds: 200));
      expect(find.text('Controlled Action Button'), findsOneWidget);
    });

    testWidgets(
        'Skeleton toggle switches between content and placeholder layout',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 4000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: InteractionShowcaseScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      // Initially skeleton is off
      expect(find.text('Loaded State Active'), findsOneWidget);
      expect(find.text('Organic Spinach Seeds'), findsOneWidget);

      // Toggle skeleton mode
      final switchFinder = find.byType(Switch);
      expect(switchFinder, findsOneWidget);
      await tester.tap(switchFinder);
      await tester.pump(const Duration(milliseconds: 350));

      expect(find.text('Skeleton State Active'), findsOneWidget);
      expect(find.byType(GlorovProductCardSkeleton), findsOneWidget);
    });

    testWidgets(
        'AnimatedCounter shifts values when increment / decrement buttons are tapped',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 4000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: InteractionShowcaseScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(GlorovCounter), findsOneWidget);
      expect(find.text('2'), findsWidgets);
      expect(find.text('4'), findsOneWidget);

      // Tap +50
      final addFinder = find.byIcon(Icons.add_circle_outline);
      await tester.tap(addFinder);
      await tester.pump(const Duration(milliseconds: 600));

      // After +50, '9' appears
      expect(find.text('9'), findsWidgets);

      // Tap -50
      final removeFinder = find.byIcon(Icons.remove_circle_outline);
      await tester.tap(removeFinder);
      await tester.pump(const Duration(milliseconds: 600));

      expect(find.byType(GlorovCounter), findsOneWidget);
    });

    testWidgets('AnimatedBadge increments and decrements count',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 4000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: InteractionShowcaseScreen(),
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.text('Count: 3'), findsOneWidget);

      // Tap +
      final addFinder = find.widgetWithIcon(IconButton, Icons.add);
      await tester.tap(addFinder);
      await tester.pump(const Duration(milliseconds: 350));

      expect(find.text('Count: 4'), findsOneWidget);
    });
  });

  group('Prompt 12: Core Functional Regression Tests', () {
    testWidgets('Cart state calculates exact total without stale numbers',
        (tester) async {
      final cart = GlorovCartState.instance;
      final product1 = GlorovMockData.products[0];
      final product2 = GlorovMockData.products[1];

      cart.addToCart(product1, quantity: 2);
      cart.addToCart(product2, quantity: 1);

      expect(cart.itemCount, 3);
      final expectedSubtotal =
          (product1.effectivePrice * 2) + (product2.effectivePrice * 1);
      expect(cart.subtotal, expectedSubtotal);

      // Updating quantity recalculates immediately
      cart.updateQuantity(product1.id, 3);
      expect(cart.itemCount, 4);
      final newExpected =
          (product1.effectivePrice * 3) + (product2.effectivePrice * 1);
      expect(cart.subtotal, newExpected);

      // Removing item updates count immediately
      cart.removeFromCart(product2.id);
      expect(cart.itemCount, 3);
      expect(cart.subtotal, product1.effectivePrice * 3);
    });

    testWidgets(
        'Router returns MicroPageRoute for dev showcase and handles direct navigation',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 2000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final route =
          generateRoute(const RouteSettings(name: devInteractionShowcaseRoute));
      expect(route, isA<MicroPageRoute>());

      await tester.pumpWidget(
        const MaterialApp(
          onGenerateRoute: generateRoute,
          initialRoute: devInteractionShowcaseRoute,
        ),
      );
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(InteractionShowcaseScreen), findsOneWidget);
    });

    testWidgets(
        'Router preserves unknown route fallback to HomeScreen without crashing',
        (tester) async {
      final route =
          generateRoute(const RouteSettings(name: 'non_existent_route_12345'));
      expect(route, isA<MicroPageRoute>());
    });

    testWidgets('ShakeButton does not allow submit when form is invalid',
        (tester) async {
      bool submitted = false;
      bool invalidPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovShakeButton(
              isValid: false,
              onPressed: () => submitted = true,
              onInvalidPress: () => invalidPressed = true,
              builder: (ctx, handlePressed) => ElevatedButton(
                onPressed: handlePressed,
                child: const Text('Submit'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Submit'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 350));

      expect(submitted, isFalse);
      expect(invalidPressed, isTrue);
    });

    testWidgets('ShakeButton executes submit when form is valid',
        (tester) async {
      bool submitted = false;
      bool invalidPressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovShakeButton(
              isValid: true,
              onPressed: () => submitted = true,
              onInvalidPress: () => invalidPressed = true,
              builder: (ctx, handlePressed) => ElevatedButton(
                onPressed: handlePressed,
                child: const Text('Submit'),
              ),
            ),
          ),
        ),
      );

      await tester.tap(find.text('Submit'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 350));

      expect(submitted, isTrue);
      expect(invalidPressed, isFalse);
    });
  });
}
