import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_faq.dart';
import '../glorov_account_screen.dart';

/// Searchable Help Center & FAQ Section
class GlorovHelpFaqSection extends StatefulWidget {
  final ValueChanged<GlorovAccountSection>? onNavigateSection;

  const GlorovHelpFaqSection({
    super.key,
    this.onNavigateSection,
  });

  @override
  State<GlorovHelpFaqSection> createState() => _GlorovHelpFaqSectionState();
}

class _GlorovHelpFaqSectionState extends State<GlorovHelpFaqSection> {
  final TextEditingController _searchController = TextEditingController();
  String _selectedCategory = 'All Topics';
  String _searchQuery = '';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _clearSearch() {
    setState(() {
      _searchController.clear();
      _searchQuery = '';
      _selectedCategory = 'All Topics';
    });
  }

  @override
  Widget build(BuildContext context) {
    final filteredFaqs = GlorovFaqRepository.search(
      _searchQuery,
      category: _selectedCategory,
    );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        const Text(
          'Botanical Help Center & FAQs',
          style: TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.forestDark,
          ),
        ),
        const SizedBox(height: 2),
        const Text(
          'Answers to common questions regarding organic seeds, plant care, transit, and account management.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Search Bar
        TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val),
          style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
          decoration: InputDecoration(
            hintText:
                'Search gardening guides, order tracking, returns, seed germination...',
            hintStyle:
                const TextStyle(color: AppColors.textMuted, fontSize: 13),
            prefixIcon: const Icon(Icons.search, color: AppColors.forestMedium),
            suffixIcon: _searchQuery.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, size: 18),
                    onPressed: () {
                      _searchController.clear();
                      setState(() => _searchQuery = '');
                    },
                  )
                : null,
            filled: true,
            fillColor: Colors.white,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: const OutlineInputBorder(
              borderRadius: AppRadii.roundedMd,
              borderSide: BorderSide(color: AppColors.borderLight),
            ),
            enabledBorder: const OutlineInputBorder(
              borderRadius: AppRadii.roundedMd,
              borderSide: BorderSide(color: AppColors.borderLight),
            ),
            focusedBorder: const OutlineInputBorder(
              borderRadius: AppRadii.roundedMd,
              borderSide: BorderSide(color: AppColors.forestDark, width: 1.5),
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.md),

        // Category Filter Chips
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: GlorovFaqRepository.categories.map((cat) {
              final isSelected = _selectedCategory == cat;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(cat),
                  selected: isSelected,
                  selectedColor: AppColors.forestDark,
                  backgroundColor: Colors.white,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : AppColors.textPrimary,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                  onSelected: (val) {
                    if (val) setState(() => _selectedCategory = cat);
                  },
                ),
              );
            }).toList(),
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Results or Empty State
        if (filteredFaqs.isEmpty)
          _buildEmptyResults()
        else
          Column(
            children: filteredFaqs.map((item) => _faqTile(item)).toList(),
          ),

        const SizedBox(height: AppSpacing.xxl),

        // Need More Help Banner
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.cream,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderLight),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.support_agent,
                  color: AppColors.forestDark,
                  size: 24,
                ),
              ),
              const SizedBox(width: AppSpacing.lg),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Still have questions about your plants or seeds?',
                      style: TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.forestDark,
                      ),
                    ),
                    SizedBox(height: 2),
                    Text(
                      'Our horticulturists are available to guide your seed-starting and potting journey.',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              if (widget.onNavigateSection != null)
                ElevatedButton(
                  onPressed: () => widget
                      .onNavigateSection!(GlorovAccountSection.contactSupport),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDark,
                    foregroundColor: Colors.white,
                    shape: const RoundedRectangleBorder(
                        borderRadius: AppRadii.roundedMd),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 10),
                  ),
                  child: const Text('Contact Support'),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildEmptyResults() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.cream,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.search_off_outlined,
              size: 40,
              color: AppColors.forestMedium,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'No Answers Found for "$_searchQuery"',
            style: const TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Try searching for simpler keywords like "seeds", "watering", "address", or "orders".',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          OutlinedButton.icon(
            onPressed: _clearSearch,
            icon: const Icon(Icons.refresh, size: 16),
            label: const Text('Reset Search & View All Topics'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.forestDark,
              side: const BorderSide(color: AppColors.forestDark),
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
            ),
          ),
        ],
      ),
    );
  }

  Widget _faqTile(GlorovFaqItem item) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedMd,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          tilePadding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.lg, vertical: 4),
          leading: Container(
            padding: const EdgeInsets.all(6),
            decoration: const BoxDecoration(
              color: AppColors.cream,
              borderRadius: AppRadii.roundedSm,
            ),
            child: const Icon(Icons.help_outline,
                size: 18, color: AppColors.forestDark),
          ),
          title: Text(
            item.question,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppColors.forestDark,
            ),
          ),
          subtitle: Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Text(
              item.category.toUpperCase(),
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: AppColors.forestMedium,
                letterSpacing: 0.5,
              ),
            ),
          ),
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(
                AppSpacing.lg,
                0,
                AppSpacing.lg,
                AppSpacing.lg,
              ),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  item.answer,
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    height: 1.6,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
