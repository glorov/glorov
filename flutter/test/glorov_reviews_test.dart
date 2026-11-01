import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_review.dart';
import 'package:shop/models/glorov/glorov_reviews_data.dart';
import 'package:shop/repositories/contracts/review_repository.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/repositories/mock/local_review_repository.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/screens/reviews/view/product_reviews_screen.dart';

void main() {
  setUp(() {
    GlorovRepositories.init(mode: RepositoryMode.mock);
  });

  group('GlorovReview & Summary Domain Models', () {
    test('GlorovReview JSON serialization & deserialization', () {
      final review = GlorovReview(
        id: 'rev_test_01',
        productId: 'glr-seed-01',
        author: 'Priya Sharma',
        date: '28/10/2026',
        rating: 5,
        title: 'Outstanding Germination',
        content: 'Seeds germinated in 3 days. Healthy vigorous plants.',
        isVerified: true,
        helpfulCount: 14,
        images: ['assets/images/products/vegetable-seeds/brinjal-banarshi-giant-seeds-1.jpg'],
        sellerReply: 'GLOROV Care Team: Thank you for growing with us!',
      );

      final json = review.toJson();
      expect(json['id'], 'rev_test_01');
      expect(json['productId'], 'glr-seed-01');
      expect(json['author'], 'Priya Sharma');
      expect(json['rating'], 5);
      expect(json['helpfulCount'], 14);
      expect(json['images'].length, 1);

      final parsed = GlorovReview.fromJson(json);
      expect(parsed.id, review.id);
      expect(parsed.author, review.author);
      expect(parsed.rating, 5);
      expect(parsed.hasImages, true);
      expect(parsed.hasSellerReply, true);
      expect(parsed.isVerified, true);
    });

    test('GlorovReviewSummary calculations and percentages', () {
      const summary = GlorovReviewSummary(
        productId: 'glr-veg-01',
        averageRating: 4.8,
        totalReviews: 100,
        starCounts: {5: 80, 4: 15, 3: 3, 2: 1, 1: 1},
        aiSummaryTitle: 'Why customers love this',
        aiSummaryText: 'Vigorous growth and heavy yields.',
      );

      expect(summary.getCountForStar(5), 80);
      expect(summary.getCountForStar(4), 15);
      expect(summary.getPercentageForStar(5), 0.8);
      expect(summary.getPercentageForStar(4), 0.15);
      expect(summary.getPercentageForStar(1), 0.01);

      final json = summary.toJson();
      final parsed = GlorovReviewSummary.fromJson(json);
      expect(parsed.averageRating, 4.8);
      expect(parsed.totalReviews, 100);
      expect(parsed.getCountForStar(5), 80);
    });
  });

  group('LocalReviewRepository Data Access', () {
    late ReviewRepository repo;

    setUp(() {
      repo = LocalReviewRepository();
    });

    test('Loads reviews and summaries for catalog products', () async {
      final reviews = await repo.getReviews('glr-seed-01');
      expect(reviews.isNotEmpty, true);
      expect(reviews.length >= 3, true);

      final summary = await repo.getSummary('glr-seed-01');
      expect(summary, isNotNull);
      expect(summary!.averageRating >= 4.0, true);
      expect(summary.totalReviews > 0, true);
    });

    test('Filters reviews by star rating', () async {
      final fiveStar = await repo.getReviews('glr-seed-01', starFilter: 5);
      for (final r in fiveStar) {
        expect(r.rating, 5);
      }
    });

    test('Sorts reviews by rating and photos', () async {
      final sortedHigh = await repo.getReviews('glr-seed-01', sortBy: 'Highest Rating');
      for (int i = 0; i < sortedHigh.length - 1; i++) {
        expect(sortedHigh[i].rating >= sortedHigh[i + 1].rating, true);
      }

      final withPhotos = await repo.getReviews('glr-seed-01', photosOnly: true);
      for (final r in withPhotos) {
        expect(r.hasImages, true);
      }
    });

    test('Submits a new review and updates live summary', () async {
      const newReview = GlorovReview(
        id: 'rev_custom_999',
        productId: 'glr-seed-01',
        author: 'Arun Test',
        date: '01/11/2026',
        rating: 5,
        title: 'Terrific seeds',
        content: 'Very happy with the prompt sprouting and foliage.',
        isVerified: true,
      );

      final added = await repo.addReview(newReview);
      expect(added.id, 'rev_custom_999');

      final updatedReviews = await repo.getReviews('glr-seed-01');
      expect(updatedReviews.first.id, 'rev_custom_999');

      final summary = await repo.getSummary('glr-seed-01');
      expect(summary!.starCounts[5]! > 0, true);
    });

    test('Increments helpful votes on reviews', () async {
      final reviews = await repo.getReviews('glr-seed-01');
      final first = reviews.first;
      final initialHelpful = first.helpfulCount;

      final success = await repo.markHelpful(first.id);
      expect(success, true);

      final refreshed = await repo.getReviews('glr-seed-01');
      expect(refreshed.first.helpfulCount, initialHelpful + 1);
    });
  });

  group('GlorovReviewsData Brand Sanitization Audit', () {
    test('Verifies 0 competitor brand names exist in any review or summary', () {
      final forbidden = [
        'ugaoo',
        'trustbasket',
        'trust basket',
        'nurserylive',
        'nursery live',
        'amazon',
        'flipkart',
        'kraft seeds',
        'bombay greens',
        'iffco',
      ];

      for (final pReviews in GlorovReviewsData.reviews.values) {
        for (final r in pReviews) {
          final text = '${r.title} ${r.content} ${r.author} ${r.sellerReply ?? ''}'.toLowerCase();
          for (final brand in forbidden) {
            expect(
              text.contains(brand),
              false,
              reason: 'Found forbidden brand "$brand" in review ${r.id}: "${r.content}"',
            );
          }
        }
      }

      for (final summary in GlorovReviewsData.summaries.values) {
        final text = '${summary.aiSummaryTitle} ${summary.aiSummaryText}'.toLowerCase();
        for (final brand in forbidden) {
          expect(
            text.contains(brand),
            false,
            reason: 'Found forbidden brand "$brand" in summary for ${summary.productId}',
          );
        }
      }
    });

    test('Verifies all 67 products have reviews and summaries', () {
      expect(GlorovReviewsData.reviews.length, 67);
      expect(GlorovReviewsData.summaries.length, 67);

      for (final p in GlorovMockData.products) {
        expect(GlorovReviewsData.reviews.containsKey(p.id), true,
            reason: 'Product ${p.id} (${p.title}) missing reviews');
        expect(GlorovReviewsData.summaries.containsKey(p.id), true,
            reason: 'Product ${p.id} (${p.title}) missing summary');
      }
    });
  });

  group('Product Reviews Widget UI Integration', () {
    testWidgets('GlorovProductDetailsScreen renders database-connected reviews section',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final product = GlorovMockData.products.first;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovProductDetailsScreen(product: product),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Verify "Ratings & Reviews" header rendered
      expect(find.text('Ratings & Reviews'), findsOneWidget);
      expect(find.text('Write a review'), findsOneWidget);

      // Verify "Why customers love this" AI summary card rendered
      expect(find.textContaining('Why customers love'), findsOneWidget);

      // Verify star rating filters rendered
      expect(find.text('All'), findsOneWidget);
      expect(find.text('5 ★'), findsWidgets);
      expect(find.text('4 ★'), findsWidgets);

      // Verify Verified Buyer badge rendered
      expect(find.text('Verified Buyer'), findsWidgets);

      // Verify Helpful button rendered
      expect(find.textContaining('Helpful ('), findsWidgets);

      // Verify View all verified reviews link rendered
      expect(find.textContaining('View all'), findsOneWidget);
    });

    testWidgets('Tapping Write a review opens submission dialog', (tester) async {
      tester.view.physicalSize = const Size(1280, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final product = GlorovMockData.products.first;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovProductDetailsScreen(product: product),
          ),
        ),
      );

      await tester.pumpAndSettle();

      // Scroll down until "Write a review" button is visible
      final writeBtnFinder = find.widgetWithText(OutlinedButton, 'Write a review').first;
      await tester.scrollUntilVisible(
        writeBtnFinder,
        500,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.pumpAndSettle();

      // Tap "Write a review"
      await tester.tap(writeBtnFinder);
      await tester.pumpAndSettle();

      // Verify dialog opened
      expect(find.textContaining('Review'), findsWidgets);
      expect(find.text('Your Overall Rating *'), findsOneWidget);
      expect(find.text('Your Full Name *'), findsOneWidget);
      expect(find.text('Review Headline *'), findsOneWidget);
      expect(find.text('Submit Review'), findsOneWidget);

      // Cancel dialog
      await tester.tap(find.text('Cancel'));
      await tester.pumpAndSettle();
    });

    testWidgets('ProductReviewsScreen renders full-screen reviews browsing experience',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      final product = GlorovMockData.products.first;

      await tester.pumpWidget(
        MaterialApp(
          home: ProductReviewsScreen(product: product),
        ),
      );

      await tester.pumpAndSettle();

      // Verify product banner & breadcrumb title rendered
      expect(find.text(product.title), findsWidgets);

      // Verify search input
      expect(find.byType(TextField), findsWidgets);
      expect(find.text('Search customer reviews...'), findsOneWidget);

      // Verify reviews list rendered
      expect(find.text('Verified Buyer'), findsWidgets);
      expect(find.textContaining('Helpful ('), findsWidgets);
    });
  });
}
