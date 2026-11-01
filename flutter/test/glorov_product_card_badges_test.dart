import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/product/glorov_product_card.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_product.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  Widget buildTestableCard(GlorovProduct product) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child: SizedBox(
            width: 300,
            height: 400,
            child: GlorovProductCard(product: product),
          ),
        ),
      ),
    );
  }

  group('GlorovProductCard Database Badge & Tag Invariants', () {
    testWidgets('renders NO badge when product has empty badges list in database',
        (tester) async {
      const cleanProduct = GlorovProduct(
        id: 'prod_clean',
        slug: 'clean-plant',
        title: 'Peace Lily Specimen',
        botanicalName: 'Spathiphyllum',
        shortDescription: 'Clean air plant',
        description: 'Indoor plant',
        category: 'Houseplants',
        subcategory: 'Foliage',
        productType: GlorovProductType.plants,
        price: 499.0,
        discountPrice: 399.0, // Has discount, but NO badges in database
        discountPercent: 20,
        imageUrls: ['https://example.com/peace-lily.jpg'],
        badges: [], // No tags in database
      );

      await tester.pumpWidget(buildTestableCard(cleanProduct));
      await tester.pumpAndSettle();

      // Invariant: Must NOT show DIWALI SALE or BESTSELLER or any badge
      expect(find.text('DIWALI SALE'), findsNothing);
      expect(find.text('BESTSELLER'), findsNothing);
      expect(find.byIcon(Icons.bolt), findsNothing);
    });

    testWidgets('renders ONLY the tag configured in dashboard database',
        (tester) async {
      const taggedProduct = GlorovProduct(
        id: 'prod_tagged',
        slug: 'heirloom-tomato',
        title: 'Desi Heirloom Tomato',
        botanicalName: 'Solanum lycopersicum',
        shortDescription: 'High vigor seeds',
        description: 'Heirloom seeds',
        category: 'Vegetable Seeds',
        subcategory: 'Seeds',
        productType: GlorovProductType.seeds,
        price: 150.0,
        imageUrls: ['https://example.com/tomato.jpg'],
        badges: ['ORGANIC HEIRLOOM'], // Added in dashboard database
      );

      await tester.pumpWidget(buildTestableCard(taggedProduct));
      await tester.pumpAndSettle();

      // Invariant: Only the database-configured tag is shown with bolt icon
      expect(find.text('ORGANIC HEIRLOOM'), findsOneWidget);
      expect(find.byIcon(Icons.bolt), findsOneWidget);
      expect(find.text('DIWALI SALE'), findsNothing);
    });

    test('mock catalog has zero hardcoded Diwali Sale tags', () {
      final allProducts = GlorovMockData.products;
      for (final p in allProducts) {
        for (final badge in p.badges) {
          expect(badge.toLowerCase().contains('diwali'), isFalse,
              reason: 'Product ${p.id} contains unwanted fake Diwali badge: $badge');
        }
      }
    });

    test('deserializes Medusa product tags and metadata badges from database', () {
      // 1. When Medusa API returns native tags
      final medusaProductWithTags = GlorovProduct.fromMedusaJson({
        'id': 'medusa_prod_1',
        'title': 'Monstera Plant',
        'handle': 'monstera-plant',
        'tags': [
          {'id': 'tag_1', 'value': 'RARE EXOTIC'},
        ],
        'variants': [
          {'id': 'var_1', 'title': 'Default', 'price': 899.0}
        ],
      });
      expect(medusaProductWithTags.badges, contains('RARE EXOTIC'));

      // 2. When Medusa API returns no tags
      final medusaProductNoTags = GlorovProduct.fromMedusaJson({
        'id': 'medusa_prod_2',
        'title': 'Snake Plant',
        'handle': 'snake-plant',
        'tags': [],
        'metadata': {},
        'variants': [
          {'id': 'var_2', 'title': 'Default', 'price': 499.0}
        ],
      });
      expect(medusaProductNoTags.badges, isEmpty);
    });
  });
}
