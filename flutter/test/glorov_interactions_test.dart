import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/core/theme/app_colors.dart';

void main() {
  group('GlorovInteractionConfig', () {
    test('provides restrained botanical motion tokens', () {
      expect(GlorovInteractionConfig.enabled, isTrue);
      expect(GlorovInteractionConfig.cardPressScale, 0.98);
      expect(GlorovInteractionConfig.buttonPressScale, 0.96);
      expect(GlorovInteractionConfig.focusScale, 1.01);
      expect(GlorovInteractionConfig.focusElevation, 2.0);
      expect(GlorovInteractionConfig.glowRadius, 10.0);
      expect(GlorovInteractionConfig.defaultGlowColor, AppColors.sage);
    });
  });

  group('GlorovFeedback', () {
    test('provides botanical burst palette', () {
      expect(GlorovFeedback.botanicalBurstColors.length, 5);
      expect(
        GlorovFeedback.botanicalBurstColors.contains(AppColors.forestDeep),
        isTrue,
      );
      expect(
        GlorovFeedback.botanicalBurstColors.contains(AppColors.sage),
        isTrue,
      );
    });
  });

  group('GlorovTapCard Widget', () {
    testWidgets('renders child and triggers onTap callback', (tester) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovTapCard(
              onTap: () => tapped = true,
              child: const Text('Plant Seeds'),
            ),
          ),
        ),
      );

      expect(find.text('Plant Seeds'), findsOneWidget);

      await tester.tap(find.text('Plant Seeds'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });
  });

  group('GlorovInteractiveButton Widget', () {
    testWidgets('renders idle child and triggers tap', (tester) async {
      var pressed = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovInteractiveButton(
              onPressed: () => pressed = true,
              child: const Text('Add to Cart'),
            ),
          ),
        ),
      );

      expect(find.text('Add to Cart'), findsOneWidget);

      await tester.tap(find.text('Add to Cart'));
      await tester.pumpAndSettle();

      expect(pressed, isTrue);
    });

    testWidgets('transitions states with ButtonStateController',
        (tester) async {
      final controller = ButtonStateController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovInteractiveButton(
              controller: controller,
              child: const Text('Buy Now'),
            ),
          ),
        ),
      );

      expect(find.text('Buy Now'), findsOneWidget);

      controller.setLoading();
      await tester.pump(const Duration(milliseconds: 350));
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      controller.setSuccess();
      await tester.pumpAndSettle();
      expect(find.text('Added!'), findsOneWidget);

      controller.setError();
      await tester.pumpAndSettle();
      expect(find.text('Failed'), findsOneWidget);

      controller.setIdle();
      await tester.pumpAndSettle();
      expect(find.text('Buy Now'), findsOneWidget);
    });
  });

  group('GlorovCounter Widget', () {
    testWidgets('renders numeric value in count mode', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovCounter(
              value: 149,
              mode: CounterAnimationMode.count,
              prefix: '₹',
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      expect(find.byType(GlorovCounter), findsOneWidget);
      expect(find.text('₹149'), findsOneWidget);
    });

    testWidgets('renders numeric value in slideDigits mode', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovCounter(
              value: 149,
              mode: CounterAnimationMode.slideDigits,
              prefix: '₹',
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      expect(find.byType(GlorovCounter), findsOneWidget);
      expect(find.text('₹'), findsOneWidget);
      expect(find.text('1'), findsOneWidget);
      expect(find.text('4'), findsOneWidget);
      expect(find.text('9'), findsOneWidget);
    });
  });

  group('GlorovBadge Widget', () {
    testWidgets('displays count and hides on zero when showZero is false', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovBadge(
              count: 3,
              child: Icon(Icons.shopping_bag),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      expect(find.byType(Icon), findsOneWidget);
      expect(find.text('3'), findsOneWidget);

      // Rebuild with count 0
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovBadge(
              count: 0,
              showZero: false,
              child: Icon(Icons.shopping_bag),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      expect(find.text('0'), findsNothing);
    });
  });

  group('GlorovStaggeredItem Widget', () {
    testWidgets('renders child content properly', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovStaggeredItem(
              index: 0,
              child: Text('Card Item 0'),
            ),
          ),
        ),
      );

      await tester.pumpAndSettle();
      expect(find.text('Card Item 0'), findsOneWidget);
    });
  });
}
