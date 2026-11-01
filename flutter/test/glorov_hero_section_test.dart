import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/home/glorov_hero_section.dart';
import 'package:shop/models/glorov/glorov_hero_data.dart';
import 'package:shop/repositories/contracts/hero_repository.dart';
import 'package:shop/repositories/glorov_repositories.dart';

class MockHeroRepository implements HeroRepository {
  final GlorovHeroData data;

  const MockHeroRepository(this.data);

  @override
  Future<GlorovHeroData> fetchHeroData() async {
    return data;
  }
}

void main() {
  setUp(() {
    GlorovRepositories.resetToMockDefaults();
  });

  group('GlorovHeroSection Widget & Backend Integration Tests', () {
    testWidgets('renders default botanical hero showcase matching website',
        (tester) async {
      await tester.binding.setSurfaceSize(const Size(1280, 800));

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroSection(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify category badge
      expect(find.text('ORGANIC BOTANICAL COLLECTION 2026'), findsOneWidget);

      // Verify headline
      expect(find.text('Grow Something\nBeautiful.'), findsOneWidget);

      // Verify CTA buttons
      expect(find.text('Shop Seeds & Plants'), findsOneWidget);
      expect(find.text('Explore Care Guides'), findsOneWidget);

      // Verify trust pills
      expect(find.text('Winter Botanical Special'), findsOneWidget);
      expect(find.text('Free Shipping > ₹999'), findsOneWidget);
      expect(find.text('Safe Transit Guarantee'), findsOneWidget);

      // Verify botanical plant of the season highlight
      expect(find.text('PLANT OF THE SEASON'), findsOneWidget);
      expect(find.text('Monstera Deliciosa • Swiss Cheese'), findsOneWidget);
    });

    testWidgets('renders dynamic backend-controlled hero data correctly',
        (tester) async {
      final customData = GlorovHeroData(
        id: 'hero_custom',
        tag: 'SPECIAL SPRING SANCTUARY',
        headline: 'Create Your Green Oasis.',
        description: 'Rare botanical varieties handpicked by our master nursery team.',
        ctaText: 'Discover Collection',
        ctaRoute: '/categories/live-plants',
        secondaryCtaText: 'Plant Care 101',
        secondaryCtaRoute: '/plant-doctor',
        desktopImageUrl: 'assets/images/monstera_deliciosa_hero.jpg',
        mobileImageUrl: 'assets/images/monstera_deliciosa_hero.jpg',
        plantTag: 'SPOTLIGHT SPECIMEN',
        plantName: 'Rare Variegated Monstera',
        plantRoute: '/products/variegated-monstera',
        trustPills: const [
          GlorovHeroTrustPill(iconKey: 'winter', text: 'Nursery Direct'),
          GlorovHeroTrustPill(iconKey: 'shipping', text: 'Safe Dispatch'),
        ],
      );

      GlorovRepositories.setHeroRepository(MockHeroRepository(customData));

      await tester.binding.setSurfaceSize(const Size(1280, 800));

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroSection(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify updated content from backend repository
      expect(find.text('SPECIAL SPRING SANCTUARY'), findsOneWidget);
      expect(find.text('Create Your Green Oasis.'), findsOneWidget);
      expect(find.text('Discover Collection'), findsOneWidget);
      expect(find.text('Plant Care 101'), findsOneWidget);
      expect(find.text('SPOTLIGHT SPECIMEN'), findsOneWidget);
      expect(find.text('Rare Variegated Monstera'), findsOneWidget);
      expect(find.text('Nursery Direct'), findsOneWidget);
      expect(find.text('Safe Dispatch'), findsOneWidget);
    });

    testWidgets('renders cleanly on mobile viewport without overflow or clipping',
        (tester) async {
      FlutterErrorDetails? errorDetails;
      final oldOnError = FlutterError.onError;
      FlutterError.onError = (details) {
        errorDetails = details;
      };

      await tester.binding.setSurfaceSize(const Size(390, 844));

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroSection(),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      FlutterError.onError = oldOnError;

      if (errorDetails != null) {
        print('FULL FLUTTER ERROR: ${errorDetails!.summary}');
        print('CONTEXT: ${errorDetails!.context}');
      }

      // Mobile elements should all render
      expect(find.text('ORGANIC BOTANICAL COLLECTION 2026'), findsOneWidget);
      expect(find.text('Grow Something\nBeautiful.'), findsOneWidget);
      expect(find.text('Shop Seeds & Plants'), findsOneWidget);
      expect(find.text('Explore Care Guides'), findsOneWidget);
      expect(find.text('Monstera Deliciosa • Swiss Cheese'), findsOneWidget);

      expect(errorDetails, isNull);
    });
  });
}
