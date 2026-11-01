import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/product/glorov_product_card.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  group('GlorovButton Component Suite', () {
    testWidgets(
        'Primary button renders with forest deep background and triggers tap', (
      tester,
    ) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovButton.primary(
              label: 'Proceed to Checkout',
              onPressed: () => tapped = true,
            ),
          ),
        ),
      );

      expect(find.text('Proceed to Checkout'), findsOneWidget);

      await tester.tap(find.text('Proceed to Checkout'));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('Secondary button renders with sage tint and label', (
      tester,
    ) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovButton.secondary(
              label: 'Save for Later',
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.text('Save for Later'), findsOneWidget);
    });

    testWidgets('Outlined button renders with outline border', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovButton.outlined(
              label: 'Apply Coupon',
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.text('Apply Coupon'), findsOneWidget);
    });

    testWidgets('Destructive button renders for danger actions', (
      tester,
    ) async {
      var deleted = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovButton.destructive(
              label: 'Remove Item',
              onPressed: () => deleted = true,
            ),
          ),
        ),
      );

      expect(find.text('Remove Item'), findsOneWidget);
      await tester.tap(find.text('Remove Item'));
      await tester.pumpAndSettle();

      expect(deleted, isTrue);
    });

    testWidgets('Disabled button does not invoke onPressed', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovButton(
              onPressed: null,
              label: 'Out of Stock',
            ),
          ),
        ),
      );

      expect(find.text('Out of Stock'), findsOneWidget);
      await tester.tap(find.text('Out of Stock'));
      await tester.pumpAndSettle();
    });

    testWidgets('Loading button shows progress indicator and blocks tap', (
      tester,
    ) async {
      var tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovButton.primary(
              label: 'Submitting',
              isLoading: true,
              onPressed: () => tapped = true,
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Submitting'), findsNothing);

      await tester.tap(find.byType(CircularProgressIndicator));
      await tester.pump(const Duration(milliseconds: 100));

      expect(tapped, isFalse);
    });
  });

  group('GlorovIconButton & GlorovToolbarButton', () {
    testWidgets('GlorovIconButton responds to tap and displays icon', (
      tester,
    ) async {
      var iconTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovIconButton(
              icon: const Icon(Icons.favorite),
              tooltip: 'Wishlist',
              onPressed: () => iconTapped = true,
            ),
          ),
        ),
      );

      expect(find.byIcon(Icons.favorite), findsOneWidget);

      await tester.tap(find.byIcon(Icons.favorite));
      await tester.pumpAndSettle();

      expect(iconTapped, isTrue);
    });

    testWidgets('GlorovToolbarButton renders active pill style and handles tap',
        (
      tester,
    ) async {
      var toolbarTapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovToolbarButton(
              label: 'Seeds',
              icon: const Icon(Icons.eco),
              isActive: true,
              onPressed: () => toolbarTapped = true,
            ),
          ),
        ),
      );

      expect(find.text('Seeds'), findsOneWidget);
      expect(find.byIcon(Icons.eco), findsOneWidget);

      await tester.tap(find.text('Seeds'));
      await tester.pumpAndSettle();

      expect(toolbarTapped, isTrue);
    });
  });

  group('GlorovTextField Component', () {
    testWidgets('Preserves controller text and handles onChanged input', (
      tester,
    ) async {
      final controller = TextEditingController(text: 'Initial Query');
      String? updated;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovTextField(
              controller: controller,
              label: 'Search Seeds',
              hintText: 'Enter seed variety',
              onChanged: (val) => updated = val,
            ),
          ),
        ),
      );

      expect(find.text('Initial Query'), findsOneWidget);
      expect(find.text('Search Seeds'), findsOneWidget);

      await tester.enterText(find.byType(TextFormField), 'Bonsai Ficus');
      await tester.pumpAndSettle();

      expect(controller.text, 'Bonsai Ficus');
      expect(updated, 'Bonsai Ficus');
    });

    testWidgets('Executes validator correctly on form validate', (
      tester,
    ) async {
      final formKey = GlobalKey<FormState>();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Form(
              key: formKey,
              child: GlorovTextField(
                label: 'Pincode',
                validator: (val) {
                  if (val == null || val.length != 6) {
                    return 'Please enter a valid 6-digit pincode';
                  }
                  return null;
                },
              ),
            ),
          ),
        ),
      );

      formKey.currentState!.validate();
      await tester.pumpAndSettle();

      expect(find.text('Please enter a valid 6-digit pincode'), findsOneWidget);
    });
  });

  group('GlorovProductCard Enhanced Interactions', () {
    final sampleProduct = GlorovMockData.products.first;

    testWidgets(
        'Wishlist tap toggles state and does not trigger card navigation', (
      tester,
    ) async {
      var cardNavigated = false;
      GlorovCartState.instance.clearCart();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 300,
              height: 400,
              child: GlorovProductCard(
                product: sampleProduct,
                onTap: () => cardNavigated = true,
              ),
            ),
          ),
        ),
      );

      expect(find.text(sampleProduct.title), findsOneWidget);

      // Verify wishlist icon exists
      expect(find.byType(TapFeedback), findsWidgets);
      expect(find.byIcon(Icons.favorite_border), findsOneWidget);

      // Tap wishlist
      await tester.tap(find.byIcon(Icons.favorite_border));
      await tester.pumpAndSettle();

      // Wishlist toggled in state
      expect(GlorovCartState.instance.isInWishlist(sampleProduct.id), isTrue);
      // Card navigation was NOT triggered
      expect(cardNavigated, isFalse);

      // Heart changed to filled
      expect(find.byIcon(Icons.favorite), findsOneWidget);
    });

    testWidgets(
        'Add to cart button adds item and does not trigger card navigation', (
      tester,
    ) async {
      var cardNavigated = false;
      GlorovCartState.instance.clearCart();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 300,
              height: 400,
              child: GlorovProductCard(
                product: sampleProduct,
                onTap: () => cardNavigated = true,
              ),
            ),
          ),
        ),
      );

      expect(GlorovCartState.instance.itemCount, 0);

      // Tap Add to Cart
      expect(find.text('Add To Cart'), findsOneWidget);
      await tester.tap(find.text('Add To Cart'));
      await tester.pumpAndSettle();

      // Item added to cart
      expect(GlorovCartState.instance.itemCount, 1);
      // Card navigation was NOT triggered
      expect(cardNavigated, isFalse);
    });

    testWidgets('Tapping card body invokes navigation callback', (
      tester,
    ) async {
      var cardNavigated = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 300,
              height: 400,
              child: GlorovProductCard(
                product: sampleProduct,
                onTap: () => cardNavigated = true,
              ),
            ),
          ),
        ),
      );

      // Tap title text (part of card body)
      await tester.tap(find.text(sampleProduct.title));
      await tester.pumpAndSettle();

      expect(cardNavigated, isTrue);
    });
  });
}
