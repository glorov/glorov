import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/home/glorov_featured_products.dart';
import 'package:shop/components/product/glorov_product_card.dart';
import 'package:shop/core/theme/app_colors.dart';
import 'package:shop/models/glorov/glorov_product.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GlorovProductCard UI Goal Enhancements', () {
    const culinaryHerbProduct = GlorovProduct(
      id: 'glr-her-14',
      slug: 'arugula-seeds-rocket-leaves',
      title: 'Arugula Seeds (Rocket Leaves)',
      botanicalName: 'Rocket Leaves',
      shortDescription: 'Peppery fast-growing salad green.',
      description: 'Heirloom Italian Rocket Arugula seeds.',
      category: 'Seeds',
      subcategory: 'Fruit & Herb Seeds',
      productType: GlorovProductType.seeds,
      price: 175.0,
      discountPrice: 119.0,
      discountPercent: 32,
      rating: 4.9,
      reviewCount: 51,
      imageUrls: ['assets/images/products/herb-seeds/arugula-seeds-1.jpg'],
      badges: ['Culinary Herb'],
    );

    testWidgets('Renders top-left capsule badge with theme dark blue, bolt icon and text',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 320,
              height: 480,
              child: GlorovProductCard(product: culinaryHerbProduct),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify tag text is CULINARY HERB
      expect(find.text('CULINARY HERB'), findsOneWidget);

      // Verify bolt icon is present
      expect(find.byIcon(Icons.bolt), findsOneWidget);

      // Verify theme dark blue background color on badge container
      final badgeContainerFinder = find.ancestor(
        of: find.text('CULINARY HERB'),
        matching: find.byType(Container),
      ).first;
      final badgeContainer = tester.widget<Container>(badgeContainerFinder);
      final decoration = badgeContainer.decoration as BoxDecoration?;
      expect(decoration?.color, equals(AppColors.tagDarkBlue));
    });

    testWidgets('Favorite heart button is NOT visible on main card by default',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 320,
              height: 480,
              child: GlorovProductCard(product: culinaryHerbProduct),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // No wishlist hearts on the card
      expect(find.byIcon(Icons.favorite_border), findsNothing);
      expect(find.byIcon(Icons.favorite), findsNothing);
    });

    testWidgets('Renders rating badge with glassy frosted effect and high contrast',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 320,
              height: 480,
              child: GlorovProductCard(product: culinaryHerbProduct),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Rating value and review count visible
      expect(find.text('4.9'), findsOneWidget);
      expect(find.text('51'), findsOneWidget);
      expect(find.byIcon(Icons.star_rounded), findsOneWidget);

      // Verify BackdropFilter with blur is present for glassy frosted effect
      expect(find.byType(BackdropFilter), findsWidgets);
      final backdrop = tester.widgetList<BackdropFilter>(find.byType(BackdropFilter)).first;
      expect(backdrop.filter, isNotNull);
    });

    testWidgets('Renders outline shopping bag icon on circular action button for compact cards',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SizedBox(
              width: 170, // Mobile compact width
              height: 295,
              child: GlorovProductCard(
                product: culinaryHerbProduct,
                forceCircularAction: true,
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify outline shopping bag icon matching reference image 1
      expect(find.byIcon(Icons.shopping_bag_outlined), findsOneWidget);

      // Verify price is ₹119 in bold sans-serif
      expect(find.text('₹119'), findsOneWidget);
      expect(find.text('₹175'), findsOneWidget);
    });
  });

  group('GlorovFeaturedProducts Homepage Simplification', () {
    testWidgets('Displays minimum 16 items in featured seeds and plants section',
        (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovFeaturedProducts(),
            ),
          ),
        ),
      );
      await tester.pump(const Duration(milliseconds: 400));
      await tester.pump(const Duration(milliseconds: 400));

      // Invariant: GridView contains at least 16 items (exactly 16 curated)
      final productCards = find.byType(GlorovProductCard);
      expect(productCards.evaluate().length, greaterThanOrEqualTo(16));
      expect(productCards.evaluate().length, equals(16));

      // Discovery exploration banner is present
      expect(find.text('Explore Full Catalog (60+)'), findsWidgets);
      expect(find.textContaining('Showing 16'), findsOneWidget);
    });
  });
}
