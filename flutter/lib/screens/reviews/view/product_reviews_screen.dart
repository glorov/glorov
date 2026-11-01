import 'package:flutter/material.dart';
import '../../../components/navigation/glorov_footer.dart';
import '../../../components/navigation/glorov_storefront_scaffold.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_mock_data.dart';
import '../../../models/glorov/glorov_product.dart';
import '../../../models/glorov/glorov_review.dart';
import '../../../repositories/glorov_repositories.dart';
import '../../../route/route_constants.dart';

/// GLOROV Dedicated Full-Page Product Reviews Screen
/// Provides a dedicated reviews exploration experience with:
/// - Product header summary card (thumbnail, botanical name, price, rating)
/// - Aggregate ratings breakdown & interactive 5-star to 1-star filter bars
/// - "Why customers love this" AI summary card
/// - Review search & star filter pills
/// - Customer photos gallery with lightbox viewer
/// - Verified customer reviews with helpful count & seller replies
/// - Interactive "Write a Review" submission modal
class ProductReviewsScreen extends StatefulWidget {
  final GlorovProduct? product;

  const ProductReviewsScreen({super.key, this.product});

  @override
  State<ProductReviewsScreen> createState() => _ProductReviewsScreenState();
}

class _ProductReviewsScreenState extends State<ProductReviewsScreen> {
  GlorovProduct? _resolvedProduct;
  List<GlorovReview> _reviews = [];
  GlorovReviewSummary? _reviewSummary;
  bool _isLoading = true;
  String _sortBy = 'Most Recent';
  int? _starFilter;
  bool _photosOnly = false;
  final TextEditingController _searchCtrl = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _searchCtrl.addListener(() {
      setState(() {
        _searchQuery = _searchCtrl.text.trim().toLowerCase();
      });
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_resolvedProduct == null) {
      if (widget.product != null) {
        _resolvedProduct = widget.product;
      } else {
        final args = ModalRoute.of(context)?.settings.arguments;
        if (args is GlorovProduct) {
          _resolvedProduct = args;
        } else if (args is String) {
          _resolvedProduct = GlorovMockData.getProductById(args) ??
              GlorovMockData.getProductBySlug(args) ??
              GlorovMockData.products.first;
        } else {
          _resolvedProduct = GlorovMockData.products.first;
        }
      }
      _loadReviews();
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadReviews() async {
    if (_resolvedProduct == null) return;
    setState(() => _isLoading = true);
    try {
      final pid = _resolvedProduct!.id;
      final summary = await GlorovRepositories.reviews.getSummary(pid);
      final list = await GlorovRepositories.reviews.getReviews(
        pid,
        sortBy: _sortBy,
        starFilter: _starFilter,
        photosOnly: _photosOnly,
      );
      if (mounted) {
        setState(() {
          _reviewSummary = summary;
          _reviews = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  List<GlorovReview> get _filteredReviews {
    if (_searchQuery.isEmpty) return _reviews;
    return _reviews.where((r) {
      return r.author.toLowerCase().contains(_searchQuery) ||
          r.title.toLowerCase().contains(_searchQuery) ||
          r.content.toLowerCase().contains(_searchQuery);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final prod = _resolvedProduct ?? GlorovMockData.products.first;
    final avgRating = _reviewSummary?.averageRating ?? prod.rating;
    final totalCount = _reviewSummary?.totalReviews ?? prod.reviewCount;

    return GlorovStorefrontScaffold(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
            // Breadcrumbs Bar
            Container(
              width: double.infinity,
              color: const Color(0xFFF9FAFB),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              child: Row(
                children: [
                  InkWell(
                    onTap: () => Navigator.pushReplacementNamed(
                        context, homeScreenRoute),
                    child: const Text('Home',
                        style: TextStyle(
                            fontSize: 12, color: Color(0xFF6B7280))),
                  ),
                  const Text(' / ',
                      style: TextStyle(
                          fontSize: 12, color: Color(0xFF9CA3AF))),
                  InkWell(
                    onTap: () => Navigator.pushReplacementNamed(
                        context, productDetailsScreenRoute,
                        arguments: prod),
                    child: Text(
                      prod.title,
                      style: const TextStyle(
                          fontSize: 12, color: Color(0xFF6B7280)),
                    ),
                  ),
                  const Text(' / ',
                      style: TextStyle(
                          fontSize: 12, color: Color(0xFF9CA3AF))),
                  const Text('Reviews',
                      style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF111827))),
                ],
              ),
            ),

            // Main Content Area
            Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 1040),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Product Quick Banner
                      _buildProductBanner(prod, avgRating, totalCount),

                      const SizedBox(height: 24),

                      // Ratings Summary & Breakdown
                      _buildRatingsBreakdown(avgRating, totalCount),

                      const SizedBox(height: 20),

                      // "Why customers love this" AI Summary Card
                      _buildAiSummaryCard(),

                      const SizedBox(height: 20),

                      // Search & Filter Toolbar
                      _buildSearchAndFilterToolbar(),

                      const SizedBox(height: 16),

                      // Reviews List
                      if (_isLoading)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 40),
                          child: Center(
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                  AppColors.forestDeep),
                            ),
                          ),
                        )
                      else if (_filteredReviews.isEmpty)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(
                              vertical: 40, horizontal: 20),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border:
                                Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            children: [
                              const Icon(Icons.rate_review_outlined,
                                  size: 40, color: Color(0xFF9CA3AF)),
                              const SizedBox(height: 12),
                              const Text(
                                'No customer reviews found',
                                style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w700,
                                  color: Color(0xFF374151),
                                ),
                              ),
                              const SizedBox(height: 6),
                              const Text(
                                'Try clearing your search query or filters.',
                                style: TextStyle(
                                    fontSize: 12.5, color: Color(0xFF6B7280)),
                              ),
                              const SizedBox(height: 16),
                              OutlinedButton(
                                onPressed: () {
                                  setState(() {
                                    _searchCtrl.clear();
                                    _starFilter = null;
                                    _photosOnly = false;
                                  });
                                  _loadReviews();
                                },
                                child: const Text('Reset All Filters'),
                              ),
                            ],
                          ),
                        )
                      else
                        Column(
                          children: _filteredReviews
                              .map((r) => Padding(
                                    padding: const EdgeInsets.only(bottom: 14),
                                    child: _buildReviewCard(r),
                                  ))
                              .toList(),
                        ),
                    ],
                  ),
                ),
              ),
            ),

            const SizedBox(height: 40),
            const GlorovFooter(),
          ],
        ),
    );
  }

  Widget _buildProductBanner(
      GlorovProduct prod, double avgRating, int totalCount) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 80,
              height: 80,
              child: prod.primaryImage.startsWith('assets/')
                  ? Image.asset(prod.primaryImage, fit: BoxFit.cover)
                  : Image.network(
                      prod.primaryImage,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => const Icon(
                          Icons.eco_rounded,
                          size: 32,
                          color: AppColors.forestDeep),
                    ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  prod.title,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF111827),
                  ),
                ),
                if (prod.botanicalName.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    prod.botanicalName,
                    style: const TextStyle(
                      fontStyle: FontStyle.italic,
                      fontSize: 12,
                      color: Color(0xFF6B7280),
                    ),
                  ),
                ],
                const SizedBox(height: 6),
                Row(
                  children: [
                    ...List.generate(
                      5,
                      (i) => Icon(
                        i < avgRating.floor()
                            ? Icons.star_rounded
                            : Icons.star_border_rounded,
                        size: 16,
                        color: const Color(0xFFEAB308),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '${avgRating.toStringAsFixed(1)} ($totalCount reviews)',
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF374151),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: _showWriteReviewModal,
            icon: const Icon(Icons.rate_review_outlined, size: 16),
            label: const Text('Write a review',
                style:
                    TextStyle(fontWeight: FontWeight.w700, fontSize: 12.5)),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.forestDeep,
              side: const BorderSide(color: AppColors.forestDeep),
              padding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRatingsBreakdown(double avgRating, int totalCount) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Wrap(
        alignment: WrapAlignment.spaceBetween,
        crossAxisAlignment: WrapCrossAlignment.center,
        spacing: 24,
        runSpacing: 16,
        children: [
          // Big Score Card
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.baseline,
                textBaseline: TextBaseline.alphabetic,
                children: [
                  Text(
                    avgRating.toStringAsFixed(1),
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 42,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Text('/ 5',
                      style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF6B7280))),
                ],
              ),
              Row(
                children: List.generate(
                  5,
                  (i) => Icon(
                    i < avgRating.floor()
                        ? Icons.star_rounded
                        : Icons.star_border_rounded,
                    size: 22,
                    color: const Color(0xFFEAB308),
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Based on $totalCount ratings',
                style: const TextStyle(
                    fontSize: 12, color: Color(0xFF6B7280)),
              ),
            ],
          ),

          // Star Distribution Bars
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 380),
            child: Column(
              children: [5, 4, 3, 2, 1].map((star) {
                final count = _reviewSummary?.getCountForStar(star) ?? 0;
                final pct = _reviewSummary?.getPercentageForStar(star) ??
                    (star == 5 ? 0.8 : 0.1);
                final isSelected = _starFilter == star;

                return InkWell(
                  onTap: () {
                    setState(() {
                      _starFilter = _starFilter == star ? null : star;
                    });
                    _loadReviews();
                  },
                  borderRadius: BorderRadius.circular(6),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 3),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 32,
                          child: Text(
                            '$star ★',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: isSelected
                                  ? FontWeight.w800
                                  : FontWeight.w600,
                              color: isSelected
                                  ? AppColors.forestDeep
                                  : const Color(0xFF374151),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: pct,
                              minHeight: 8,
                              backgroundColor: const Color(0xFFF3F4F6),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                isSelected
                                    ? AppColors.forestDeep
                                    : const Color(0xFF16A34A),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        SizedBox(
                          width: 44,
                          child: Text(
                            count > 0 ? '$count' : '${(pct * 100).toInt()}%',
                            textAlign: TextAlign.right,
                            style: TextStyle(
                              fontSize: 11.5,
                              fontWeight: isSelected
                                  ? FontWeight.w700
                                  : FontWeight.w500,
                              color: isSelected
                                  ? AppColors.forestDeep
                                  : const Color(0xFF6B7280),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAiSummaryCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF6FF),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBFDBFE)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome,
                  size: 18, color: Color(0xFF2563EB)),
              const SizedBox(width: 8),
              Flexible(
                child: Text(
                  _reviewSummary?.aiSummaryTitle ??
                      'Why customers love this',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1E40AF),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _reviewSummary?.aiSummaryText ??
                'Customers consistently praise this botanical product for its exceptional health, reliable packaging, and vigorous performance.',
            style: const TextStyle(
              fontSize: 13,
              height: 1.5,
              color: Color(0xFF1E3A8A),
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            '✨ Summarized and selected by AI from recent customer reviews',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: Color(0xFF3B82F6),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchAndFilterToolbar() {
    return Column(
      children: [
        // Search Input
        TextField(
          controller: _searchCtrl,
          decoration: InputDecoration(
            hintText: 'Search customer reviews...',
            prefixIcon: const Icon(Icons.search, size: 20),
            suffixIcon: _searchQuery.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, size: 18),
                    onPressed: () => _searchCtrl.clear(),
                  )
                : null,
            filled: true,
            fillColor: Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
            ),
          ),
        ),

        const SizedBox(height: 12),

        // Filter Pills and Sort Row
        Wrap(
          alignment: WrapAlignment.spaceBetween,
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 10,
          runSpacing: 10,
          children: [
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: [
                _chip('All', _starFilter == null && !_photosOnly, () {
                  setState(() {
                    _starFilter = null;
                    _photosOnly = false;
                  });
                  _loadReviews();
                }),
                _chip('5 ★', _starFilter == 5, () {
                  setState(() => _starFilter = _starFilter == 5 ? null : 5);
                  _loadReviews();
                }),
                _chip('4 ★', _starFilter == 4, () {
                  setState(() => _starFilter = _starFilter == 4 ? null : 4);
                  _loadReviews();
                }),
                _chip('Photos 📷', _photosOnly, () {
                  setState(() => _photosOnly = !_photosOnly);
                  _loadReviews();
                }),
              ],
            ),
            PopupMenuButton<String>(
              initialValue: _sortBy,
              tooltip: 'Sort reviews',
              onSelected: (val) {
                setState(() => _sortBy = val);
                _loadReviews();
              },
              itemBuilder: (ctx) => const [
                PopupMenuItem(value: 'Most Recent', child: Text('Most Recent')),
                PopupMenuItem(
                    value: 'Highest Rating', child: Text('Highest Rating')),
                PopupMenuItem(
                    value: 'Lowest Rating', child: Text('Lowest Rating')),
                PopupMenuItem(
                    value: 'With Photos', child: Text('With Photos')),
              ],
              child: Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFFD1D5DB)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_sortBy,
                        style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF374151))),
                    const SizedBox(width: 4),
                    const Icon(Icons.keyboard_arrow_down, size: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _chip(String label, bool isSelected, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.forestDeep : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
              color:
                  isSelected ? AppColors.forestDeep : const Color(0xFFD1D5DB)),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
            color: isSelected ? Colors.white : const Color(0xFF374151),
          ),
        ),
      ),
    );
  }

  Widget _buildReviewCard(GlorovReview review) {
    final names = review.author.trim().split(' ');
    final initials = names.isNotEmpty
        ? (names.length > 1
            ? '${names.first[0]}${names.last[0]}'
            : names.first[0])
        : 'VB';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 16,
                      backgroundColor: const Color(0xFFE0E7FF),
                      child: Text(
                        initials.toUpperCase(),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Color(0xFF3730A3),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            review.author,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13.5,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827),
                            ),
                          ),
                          if (review.isVerified)
                            const Row(
                              children: [
                                Icon(Icons.verified,
                                    size: 13, color: Color(0xFF16A34A)),
                                SizedBox(width: 3),
                                Text(
                                  'Verified Buyer',
                                  style: TextStyle(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w600,
                                    color: Color(0xFF15803D),
                                  ),
                                ),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Text(review.date,
                  style:
                      const TextStyle(fontSize: 11.5, color: Color(0xFF9CA3AF))),
            ],
          ),

          const SizedBox(height: 10),

          // Rating & Headline
          Row(
            children: [
              ...List.generate(
                5,
                (i) => Icon(
                  i < review.rating
                      ? Icons.star_rounded
                      : Icons.star_border_rounded,
                  size: 16,
                  color: const Color(0xFF16A34A),
                ),
              ),
              const SizedBox(width: 8),
              if (review.title.isNotEmpty)
                Expanded(
                  child: Text(
                    review.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                ),
            ],
          ),

          const SizedBox(height: 8),

          // Body
          Text(
            review.content,
            style: const TextStyle(
              fontSize: 13,
              height: 1.5,
              color: Color(0xFF374151),
            ),
          ),

          // Attached Images
          if (review.hasImages) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: review.images.map((img) {
                return InkWell(
                  onTap: () => _showImageLightbox(img, review.title),
                  borderRadius: BorderRadius.circular(6),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        border: Border.all(color: const Color(0xFFE5E7EB)),
                      ),
                      child: img.startsWith('assets/')
                          ? Image.asset(img, fit: BoxFit.cover)
                          : Image.network(img, fit: BoxFit.cover),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],

          // Seller Reply
          if (review.hasSellerReply) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FAFB),
                borderRadius: BorderRadius.circular(8),
                border: const Border(
                  left: BorderSide(color: AppColors.forestDeep, width: 3),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'GLOROV Botanical Team',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDeep,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    review.sellerReply!,
                    style: const TextStyle(
                      fontSize: 12,
                      height: 1.4,
                      color: Color(0xFF4B5563),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 10),

          // Helpful Action
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              InkWell(
                onTap: () async {
                  await GlorovRepositories.reviews.markHelpful(review.id);
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Helpful vote recorded.'),
                        duration: Duration(seconds: 2),
                      ),
                    );
                    _loadReviews();
                  }
                },
                borderRadius: BorderRadius.circular(4),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Row(
                    children: [
                      Icon(
                        review.isHelpfulTapped
                            ? Icons.thumb_up_alt_rounded
                            : Icons.thumb_up_alt_outlined,
                        size: 15,
                        color: review.isHelpfulTapped
                            ? AppColors.forestDeep
                            : const Color(0xFF6B7280),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Helpful (${review.helpfulCount})',
                        style: TextStyle(
                          fontSize: 11.5,
                          fontWeight: FontWeight.w600,
                          color: review.isHelpfulTapped
                              ? AppColors.forestDeep
                              : const Color(0xFF6B7280),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showImageLightbox(String imageUrl, String title) {
    showDialog(
      context: context,
      builder: (ctx) {
        return Dialog(
          backgroundColor: Colors.black.withOpacity(0.92),
          insetPadding: const EdgeInsets.all(16),
          child: Stack(
            alignment: Alignment.center,
            children: [
              InteractiveViewer(
                minScale: 0.8,
                maxScale: 3.5,
                child: imageUrl.startsWith('assets/')
                    ? Image.asset(imageUrl, fit: BoxFit.contain)
                    : Image.network(imageUrl, fit: BoxFit.contain),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: IconButton(
                  onPressed: () => Navigator.pop(ctx),
                  icon: const Icon(Icons.close_rounded,
                      color: Colors.white, size: 28),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showWriteReviewModal() {
    int selectedRating = 5;
    final nameCtrl = TextEditingController();
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    final photoUrlCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    showDialog(
      context: context,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            return AlertDialog(
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16)),
              title: const Text('Write a Customer Review',
                  style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
              content: SizedBox(
                width: 440,
                child: SingleChildScrollView(
                  child: Form(
                    key: formKey,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Overall Rating *',
                            style: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w700)),
                        const SizedBox(height: 6),
                        Row(
                          children: List.generate(5, (idx) {
                            final star = idx + 1;
                            return InkWell(
                              onTap: () =>
                                  setDialogState(() => selectedRating = star),
                              child: Padding(
                                padding: const EdgeInsets.only(right: 4),
                                child: Icon(
                                  star <= selectedRating
                                      ? Icons.star_rounded
                                      : Icons.star_border_rounded,
                                  size: 32,
                                  color: const Color(0xFFEAB308),
                                ),
                              ),
                            );
                          }),
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: nameCtrl,
                          decoration: InputDecoration(
                            labelText: 'Your Full Name *',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Name required'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: titleCtrl,
                          decoration: InputDecoration(
                            labelText: 'Review Headline *',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                          validator: (v) => v == null || v.trim().isEmpty
                              ? 'Headline required'
                              : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: contentCtrl,
                          maxLines: 3,
                          decoration: InputDecoration(
                            labelText: 'Review Experience *',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                          validator: (v) =>
                              v == null || v.trim().length < 8
                                  ? 'Write at least 8 characters'
                                  : null,
                        ),
                        const SizedBox(height: 12),
                        TextFormField(
                          controller: photoUrlCtrl,
                          decoration: InputDecoration(
                            labelText: 'Photo Link or Asset Path (Optional)',
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(8)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: isSubmitting
                      ? null
                      : () async {
                          if (formKey.currentState?.validate() ?? false) {
                            setDialogState(() => isSubmitting = true);
                            final now = DateTime.now();
                            final dateStr =
                                '${now.day.toString().padLeft(2, '0')}/${now.month.toString().padLeft(2, '0')}/${now.year}';
                            final pid = _resolvedProduct?.id ?? 'glr-seed-01';

                            // Sanitize brand names
                            String cleanTitle = titleCtrl.text.trim();
                            String cleanContent = contentCtrl.text.trim();
                            final brandRegex = RegExp(
                                r'\b(ugaoo|trustbasket|trust\s*basket|nurserylive|nursery\s*live|amazon|flipkart|kraft\s*seeds)\b',
                                caseSensitive: false);
                            cleanTitle =
                                cleanTitle.replaceAll(brandRegex, 'GLOROV');
                            cleanContent =
                                cleanContent.replaceAll(brandRegex, 'GLOROV');

                            final newRev = GlorovReview(
                              id: 'rev_${pid}_${now.millisecondsSinceEpoch}',
                              productId: pid,
                              author: nameCtrl.text.trim(),
                              date: dateStr,
                              rating: selectedRating,
                              title: cleanTitle,
                              content: cleanContent,
                              isVerified: true,
                              helpfulCount: 0,
                              images: photoUrlCtrl.text.trim().isNotEmpty
                                  ? [photoUrlCtrl.text.trim()]
                                  : [],
                              sellerReply:
                                  'GLOROV Care Team: Thank you for sharing your experience!',
                            );

                            await GlorovRepositories.reviews.addReview(newRev);

                            if (mounted) {
                              Navigator.pop(ctx);
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Review submitted! Thank you.'),
                                  backgroundColor: AppColors.forestDeep,
                                ),
                              );
                              _loadReviews();
                            }
                          }
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDeep,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Submit Review'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
