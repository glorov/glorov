import '../../models/glorov/glorov_review.dart';

/// Abstract Contract for Customer Reviews & Ratings Data Access
abstract class ReviewRepository {
  /// Fetches reviews for a given product with optional sort, star filter, and photos-only flag.
  Future<List<GlorovReview>> getReviews(
    String productId, {
    String? sortBy,
    int? starFilter,
    bool photosOnly = false,
  });

  /// Fetches aggregate rating statistics and AI sentiment summary for a product.
  Future<GlorovReviewSummary?> getSummary(String productId);

  /// Submits a new customer review to the database.
  Future<GlorovReview> addReview(GlorovReview review);

  /// Records a helpful thumbs-up vote on a customer review.
  Future<bool> markHelpful(String reviewId);
}
