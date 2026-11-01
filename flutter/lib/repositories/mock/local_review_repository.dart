import '../../models/glorov/glorov_review.dart';
import '../../models/glorov/glorov_reviews_data.dart';
import '../contracts/review_repository.dart';

/// In-Memory & Offline Implementation of ReviewRepository
/// Powered by GlorovReviewsData, supporting instant live interaction,
/// offline browsing, and comprehensive testing.
class LocalReviewRepository implements ReviewRepository {
  final Map<String, List<GlorovReview>> _reviews = {};
  final Map<String, GlorovReviewSummary> _summaries = {};

  LocalReviewRepository() {
    _initialize();
  }

  void _initialize() {
    // Populate mutable in-memory store from static database
    for (final entry in GlorovReviewsData.reviews.entries) {
      _reviews[entry.key] = List<GlorovReview>.from(entry.value);
    }
    for (final entry in GlorovReviewsData.summaries.entries) {
      _summaries[entry.key] = entry.value;
    }
  }

  @override
  Future<List<GlorovReview>> getReviews(
    String productId, {
    String? sortBy,
    int? starFilter,
    bool photosOnly = false,
  }) async {
    final list = _reviews[productId] ?? [];
    List<GlorovReview> results = List<GlorovReview>.from(list);

    if (starFilter != null && starFilter >= 1 && starFilter <= 5) {
      results = results.where((r) => r.rating == starFilter).toList();
    }

    if (photosOnly) {
      results = results.where((r) => r.hasImages).toList();
    }

    if (sortBy != null) {
      switch (sortBy) {
        case 'Highest Rating':
          results.sort((a, b) =>
              b.rating != a.rating
                  ? b.rating.compareTo(a.rating)
                  : b.helpfulCount.compareTo(a.helpfulCount));
          break;
        case 'Lowest Rating':
          results.sort((a, b) =>
              a.rating != b.rating
                  ? a.rating.compareTo(b.rating)
                  : b.helpfulCount.compareTo(a.helpfulCount));
          break;
        case 'With Photos':
          results.sort((a, b) {
            final aHas = a.hasImages ? 1 : 0;
            final bHas = b.hasImages ? 1 : 0;
            return bHas != aHas
                ? bHas.compareTo(aHas)
                : b.helpfulCount.compareTo(a.helpfulCount);
          });
          break;
        case 'Most Recent':
        default:
          results.sort((a, b) => b.helpfulCount.compareTo(a.helpfulCount));
          break;
      }
    }

    return results;
  }

  @override
  Future<GlorovReviewSummary?> getSummary(String productId) async {
    return _summaries[productId] ?? GlorovReviewsData.summaries[productId];
  }

  @override
  Future<GlorovReview> addReview(GlorovReview review) async {
    final pid = review.productId;
    if (!_reviews.containsKey(pid)) {
      _reviews[pid] = [];
    }

    _reviews[pid]!.insert(0, review);

    // Update aggregate summary
    final existingSummary = _summaries[pid];
    if (existingSummary != null) {
      final updatedCounts = Map<int, int>.from(existingSummary.starCounts);
      updatedCounts[review.rating] = (updatedCounts[review.rating] ?? 0) + 1;
      final newTotal = existingSummary.totalReviews + 1;

      // Recalculate average
      final allRevs = _reviews[pid]!;
      final sumRating = allRevs.fold<int>(0, (sum, r) => sum + r.rating);
      final newAvg = double.parse((sumRating / allRevs.length).toStringAsFixed(1));

      _summaries[pid] = GlorovReviewSummary(
        productId: pid,
        averageRating: newAvg,
        totalReviews: newTotal,
        starCounts: updatedCounts,
        aiSummaryTitle: existingSummary.aiSummaryTitle,
        aiSummaryText: existingSummary.aiSummaryText,
      );
    } else {
      _summaries[pid] = GlorovReviewSummary(
        productId: pid,
        averageRating: review.rating.toDouble(),
        totalReviews: 1,
        starCounts: {
          5: review.rating == 5 ? 1 : 0,
          4: review.rating == 4 ? 1 : 0,
          3: review.rating == 3 ? 1 : 0,
          2: review.rating == 2 ? 1 : 0,
          1: review.rating == 1 ? 1 : 0,
        },
        aiSummaryTitle: 'Why customers love this',
        aiSummaryText: 'Consistently praised for botanical vigor and quality.',
      );
    }

    return review;
  }

  @override
  Future<bool> markHelpful(String reviewId) async {
    for (final pEntry in _reviews.entries) {
      final list = pEntry.value;
      for (int i = 0; i < list.length; i++) {
        if (list[i].id == reviewId) {
          final current = list[i];
          final updated = current.copyWith(
            helpfulCount: current.helpfulCount + 1,
            isHelpfulTapped: true,
          );
          list[i] = updated;
          return true;
        }
      }
    }
    return false;
  }
}
