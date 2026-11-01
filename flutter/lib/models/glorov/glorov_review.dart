/// GLOROV Production-Grade Review Domain Models
/// Encapsulates individual verified customer reviews, ratings breakdown,
/// customer uploaded photos, and AI-summarized sentiment consensus.

class GlorovReview {
  final String id;
  final String productId;
  final String author;
  final String? avatarUrl;
  final String date;
  final int rating;
  final String title;
  final String content;
  final bool isVerified;
  final int helpfulCount;
  final List<String> images;
  final String? sellerReply;
  final bool isHelpfulTapped;

  const GlorovReview({
    required this.id,
    required this.productId,
    required this.author,
    this.avatarUrl,
    required this.date,
    required this.rating,
    required this.title,
    required this.content,
    this.isVerified = true,
    this.helpfulCount = 0,
    this.images = const [],
    this.sellerReply,
    this.isHelpfulTapped = false,
  });

  bool get hasImages => images.isNotEmpty;
  bool get hasSellerReply => sellerReply != null && sellerReply!.trim().isNotEmpty;

  GlorovReview copyWith({
    String? id,
    String? productId,
    String? author,
    String? avatarUrl,
    String? date,
    int? rating,
    String? title,
    String? content,
    bool? isVerified,
    int? helpfulCount,
    List<String>? images,
    String? sellerReply,
    bool? isHelpfulTapped,
  }) {
    return GlorovReview(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      author: author ?? this.author,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      date: date ?? this.date,
      rating: rating ?? this.rating,
      title: title ?? this.title,
      content: content ?? this.content,
      isVerified: isVerified ?? this.isVerified,
      helpfulCount: helpfulCount ?? this.helpfulCount,
      images: images ?? this.images,
      sellerReply: sellerReply ?? this.sellerReply,
      isHelpfulTapped: isHelpfulTapped ?? this.isHelpfulTapped,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'productId': productId,
        'author': author,
        'avatarUrl': avatarUrl,
        'date': date,
        'rating': rating,
        'title': title,
        'content': content,
        'isVerified': isVerified,
        'helpfulCount': helpfulCount,
        'images': images,
        'sellerReply': sellerReply,
      };

  factory GlorovReview.fromJson(Map<String, dynamic> json) {
    return GlorovReview(
      id: json['id'] as String? ?? '',
      productId: json['productId'] as String? ?? json['product_id'] as String? ?? '',
      author: json['author'] as String? ?? 'Verified Buyer',
      avatarUrl: json['avatarUrl'] as String? ?? json['avatar_url'] as String?,
      date: json['date'] as String? ?? '',
      rating: (json['rating'] as num?)?.toInt() ?? 5,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? json['reviewText'] as String? ?? '',
      isVerified: json['isVerified'] as bool? ?? json['is_verified'] as bool? ?? true,
      helpfulCount: (json['helpfulCount'] as num?)?.toInt() ??
          (json['helpful_count'] as num?)?.toInt() ??
          0,
      images: (json['images'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
      sellerReply: json['sellerReply'] as String? ?? json['seller_reply'] as String?,
      isHelpfulTapped: false,
    );
  }
}

class GlorovReviewSummary {
  final String productId;
  final double averageRating;
  final int totalReviews;
  final Map<int, int> starCounts; // e.g. {5: 80, 4: 15, 3: 3, 2: 1, 1: 0}
  final String aiSummaryTitle;
  final String aiSummaryText;

  const GlorovReviewSummary({
    required this.productId,
    required this.averageRating,
    required this.totalReviews,
    required this.starCounts,
    required this.aiSummaryTitle,
    required this.aiSummaryText,
  });

  int getCountForStar(int star) => starCounts[star] ?? 0;

  double getPercentageForStar(int star) {
    if (totalReviews <= 0) return 0.0;
    final count = getCountForStar(star);
    return (count / totalReviews).clamp(0.0, 1.0);
  }

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'averageRating': averageRating,
        'totalReviews': totalReviews,
        'starCounts': starCounts.map((k, v) => MapEntry(k.toString(), v)),
        'aiSummaryTitle': aiSummaryTitle,
        'aiSummaryText': aiSummaryText,
      };

  factory GlorovReviewSummary.fromJson(Map<String, dynamic> json) {
    final rawCounts = json['starCounts'] as Map<String, dynamic>? ??
        json['star_counts'] as Map<String, dynamic>? ??
        {};
    final Map<int, int> stars = {};
    for (int i = 1; i <= 5; i++) {
      final val = rawCounts[i.toString()] ?? rawCounts[i];
      stars[i] = (val as num?)?.toInt() ?? 0;
    }

    return GlorovReviewSummary(
      productId: json['productId'] as String? ?? json['product_id'] as String? ?? '',
      averageRating: (json['averageRating'] as num?)?.toDouble() ??
          (json['average_rating'] as num?)?.toDouble() ??
          4.8,
      totalReviews: (json['totalReviews'] as num?)?.toInt() ??
          (json['total_reviews'] as num?)?.toInt() ??
          0,
      starCounts: stars,
      aiSummaryTitle: json['aiSummaryTitle'] as String? ??
          json['ai_summary_title'] as String? ??
          'Why customers love this',
      aiSummaryText: json['aiSummaryText'] as String? ??
          json['ai_summary_text'] as String? ??
          '',
    );
  }
}
