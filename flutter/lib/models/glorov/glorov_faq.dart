/// FAQ and Support Topics Model for GLOROV Botanical Help Center
class GlorovFaqItem {
  final String id;
  final String category;
  final String question;
  final String answer;

  const GlorovFaqItem({
    required this.id,
    required this.category,
    required this.question,
    required this.answer,
  });
}

class GlorovFaqRepository {
  static const List<String> categories = [
    'All Topics',
    'Seeds & Sowing',
    'Live Plant Care',
    'Orders & Tracking',
    'Transit & Guarantee',
    'Account & Shopping',
  ];

  static const List<GlorovFaqItem> faqItems = [
    GlorovFaqItem(
      id: 'faq_01',
      category: 'Seeds & Sowing',
      question:
          'How do I find suitable seeds for my balcony or terrace garden?',
      answer:
          'Use our Catalog filters to browse by Sunlight Requirement (Full Sun, Bright Indirect, or Low Light) and Product Type. Balcony gardens with 4–6 hours of direct sunlight excel with Heirloom Cherry Tomatoes and Italian Genovese Basil. For shaded areas, look for culinary herbs and microgreens.',
    ),
    GlorovFaqItem(
      id: 'faq_02',
      category: 'Seeds & Sowing',
      question: 'How do I sow heirloom vegetable and herb seeds correctly?',
      answer:
          'Sow seeds at a depth approximately twice their diameter (typically 0.5 cm for herbs, 1 cm for tomatoes). Use a light, well-draining seed-starting mix of cocopeat, perlite, and vermicompost. Maintain consistent moisture using a fine mist sprayer until germination occurs (usually 5–10 days).',
    ),
    GlorovFaqItem(
      id: 'faq_03',
      category: 'Seeds & Sowing',
      question: 'How often should I water new seedlings?',
      answer:
          'Seedlings require evenly moist—never waterlogged—soil. Check the top 0.5 cm daily; if it feels dry to touch, mist gently. Avoid overhead heavy watering which can dislodge delicate root systems or cause damping-off.',
    ),
    GlorovFaqItem(
      id: 'faq_04',
      category: 'Live Plant Care',
      question: 'How do I care for my live plant immediately after unboxing?',
      answer:
          'Give your plant a gentle drink of room-temperature water and place it in a bright spot with indirect natural light. Avoid repotting or direct harsh afternoon sunlight for the first 3–5 days while it acclimates to your home environment.',
    ),
    GlorovFaqItem(
      id: 'faq_05',
      category: 'Orders & Tracking',
      question: 'How do I track a demonstration plant order?',
      answer:
          'Navigate to Account > Orders to view your order history. Each active order displays a 4-checkpoint botanical tracking timeline: Order Placed, Nursery Preparation & Root Wrap, Botanical Transit Shield, and Out for Delivery. Note that tracking is simulated for demonstration purposes.',
    ),
    GlorovFaqItem(
      id: 'faq_06',
      category: 'Account & Shopping',
      question: 'How do I update or add a new delivery address?',
      answer:
          'Open Account > Address Book. You can add multiple delivery addresses with recipient names, 10-digit mobile numbers, and 6-digit PIN codes. Designate any address as your Default Address, and it will automatically populate your checkout screen.',
    ),
    GlorovFaqItem(
      id: 'faq_07',
      category: 'Account & Shopping',
      question: 'How do I use the Wishlist and move items to my bag?',
      answer:
          'Click the heart icon on any product card or detail page to save it to your Wishlist. You can review all saved botanicals on the Wishlist screen and click "Move to Bag" or "Add All to Bag" to transfer items directly into your shopping cart.',
    ),
    GlorovFaqItem(
      id: 'faq_08',
      category: 'Account & Shopping',
      question: 'How do I remove an item or change quantities in my cart?',
      answer:
          'On the Cart screen, use the plus (+) and minus (-) stepper controls to adjust quantities between 1 and 10 units. To remove an item completely, click the trash icon or select "Save for Later" to transfer it to your Wishlist without losing track of it.',
    ),
    GlorovFaqItem(
      id: 'faq_09',
      category: 'Transit & Guarantee',
      question: 'What is the GLOROV Botanical Transit Shield Guarantee?',
      answer:
          'Every live houseplant is shipped in custom-engineered honeycomb aeration crates with cocopeat moisture root wraps to prevent soil displacement and stress. If a plant arrives damaged or unhealthy, report it within 7 days for a free replacement under our transit guarantee.',
    ),
    GlorovFaqItem(
      id: 'faq_10',
      category: 'Transit & Guarantee',
      question: 'Are GLOROV seeds organic and non-GMO?',
      answer:
          'Yes. All GLOROV seeds are 100% open-pollinated, non-hybrid heirloom varieties sourced from certified organic regenerative seed farms across India. They are untreated with chemical fungicides and can be seed-saved season after season.',
    ),
    GlorovFaqItem(
      id: 'faq_11',
      category: 'Account & Shopping',
      question: 'How do I contact customer support or botanical advisors?',
      answer:
          'Visit Account > Help & Support > Contact Support to send an inquiry regarding orders, plant health, or delivery. Our horticultural advisors respond within 24 hours. (In demo mode, submissions simulate the support workflow locally).',
    ),
  ];

  static List<GlorovFaqItem> search(String query, {String? category}) {
    final cleanQuery = query.trim().toLowerCase();
    return faqItems.where((item) {
      final matchesCategory = category == null ||
          category == 'All Topics' ||
          item.category.toLowerCase() == category.toLowerCase();
      if (!matchesCategory) return false;
      if (cleanQuery.isEmpty) return true;
      return item.question.toLowerCase().contains(cleanQuery) ||
          item.answer.toLowerCase().contains(cleanQuery) ||
          item.category.toLowerCase().contains(cleanQuery);
    }).toList();
  }
}
