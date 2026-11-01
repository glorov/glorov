import '../../models/glorov/glorov_review.dart';
import '../contracts/review_repository.dart';
import '../mock/local_review_repository.dart';
import 'medusa_endpoints.dart';
import 'medusa_http_client.dart';

/// Live Medusa v2 Storefront API Implementation of ReviewRepository
/// Interacts directly with `/store/reviews` with graceful fallback to LocalReviewRepository.
class MedusaReviewRepository implements ReviewRepository {
  final MedusaHttpClient client;
  final LocalReviewRepository _fallback = LocalReviewRepository();

  MedusaReviewRepository(this.client);

  @override
  Future<List<GlorovReview>> getReviews(
    String productId, {
    String? sortBy,
    int? starFilter,
    bool photosOnly = false,
  }) async {
    final queryParams = <String, dynamic>{
      'product_id': productId,
    };
    if (sortBy != null) queryParams['sort'] = sortBy;
    if (starFilter != null) queryParams['rating'] = starFilter;

    final result = await client.get<List<GlorovReview>>(
      MedusaEndpoints.reviews,
      queryParameters: queryParams,
      parser: (json) {
        if (json is Map && json['reviews'] is List) {
          return (json['reviews'] as List)
              .map((r) => GlorovReview.fromJson(r as Map<String, dynamic>))
              .toList();
        }
        return <GlorovReview>[];
      },
    );

    if (result.isFailure || result.data == null || result.data!.isEmpty) {
      // Graceful offline fallback
      return _fallback.getReviews(
        productId,
        sortBy: sortBy,
        starFilter: starFilter,
        photosOnly: photosOnly,
      );
    }

    var list = result.requireData;
    if (photosOnly) {
      list = list.where((r) => r.hasImages).toList();
    }
    return list;
  }

  @override
  Future<GlorovReviewSummary?> getSummary(String productId) async {
    final result = await client.get<GlorovReviewSummary?>(
      MedusaEndpoints.reviews,
      queryParameters: {'product_id': productId},
      parser: (json) {
        if (json is Map && json['summary'] is Map) {
          return GlorovReviewSummary.fromJson(
              json['summary'] as Map<String, dynamic>);
        }
        return null;
      },
    );

    if (result.isFailure || result.data == null) {
      return _fallback.getSummary(productId);
    }

    return result.data;
  }

  @override
  Future<GlorovReview> addReview(GlorovReview review) async {
    final result = await client.post<GlorovReview>(
      MedusaEndpoints.reviews,
      body: review.toJson(),
      parser: (json) {
        if (json is Map && json['review'] is Map) {
          return GlorovReview.fromJson(json['review'] as Map<String, dynamic>);
        }
        return review;
      },
    );

    if (result.isFailure) {
      // Store locally on error
      return _fallback.addReview(review);
    }

    return result.data ?? review;
  }

  @override
  Future<bool> markHelpful(String reviewId) async {
    final result = await client.post<bool>(
      MedusaEndpoints.reviewHelpful(reviewId),
      parser: (json) {
        if (json is Map && json['success'] == true) {
          return true;
        }
        return false;
      },
    );

    if (result.isFailure) {
      return _fallback.markHelpful(reviewId);
    }

    return result.data ?? false;
  }
}
