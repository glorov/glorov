import '../../models/glorov/glorov_offer.dart';
import '../contracts/offer_repository.dart';

/// Local in-memory / mock implementation of OfferRepository
class LocalOfferRepository implements OfferRepository {
  final List<GlorovOffer> _offers;

  LocalOfferRepository([List<GlorovOffer>? initialOffers])
      : _offers = initialOffers ??
            [
              GlorovOffer.defaultWelcomeOffer,
              const GlorovOffer(
                id: 'offer_winter_sale_20',
                code: 'WINTER20',
                title: 'Winter Sowing & Planting Fest',
                tag: 'WINTER BOTANICAL SALE',
                description:
                    'Enjoy Flat 20% OFF on all cold-hardy winter seeds, flowering blooms, and indoor greenery.',
                discountBadge: '20% OFF',
                discountType: 'percentage',
                discountValue: 20.0,
                minSpend: 799.0,
                minSpendText: 'Min Order: ₹799',
                expiryText: 'Winter Planting Special',
                category: 'seasonal',
                bgColor: '#EAF2F8',
                textColor: '#143528',
                accentColor: '#1B5E20',
                iconName: 'ac_unit',
                isHighlighted: false,
                isActive: true,
                displayOrder: 2,
              ),
              const GlorovOffer(
                id: 'offer_monsoon_thunder15',
                code: 'THUNDER15',
                title: 'Monsoon Thunder Sale',
                tag: 'LIMITED TIME OFFER',
                description:
                    'Flat 15% discount across all conditioned indoor plants and heirloom seed collections.',
                discountBadge: '15% OFF',
                discountType: 'percentage',
                discountValue: 15.0,
                minSpend: 1199.0,
                minSpendText: 'Min Order: ₹1,199',
                expiryText: 'Expires in 4 days',
                category: 'sitewide',
                bgColor: '#E8F5E9',
                textColor: '#1B3B2B',
                accentColor: '#2E7D32',
                iconName: 'auto_awesome',
                isHighlighted: false,
                isActive: true,
                displayOrder: 2,
              ),
              const GlorovOffer(
                id: 'offer_seeds_heirloom20',
                code: 'HEIRLOOM20',
                title: 'Desi Heirloom Seed Fest',
                tag: '0% GST SEED SPECIAL',
                description:
                    'Extra 20% savings on pure desi vegetable, culinary herb, and festive flower seed packets.',
                discountBadge: '20% OFF',
                discountType: 'percentage',
                discountValue: 20.0,
                minSpend: 499.0,
                minSpendText: 'Min Order: ₹499',
                expiryText: 'Seasonal planting special',
                category: 'seeds',
                bgColor: '#FFF8E1',
                textColor: '#5D4037',
                accentColor: '#F57F17',
                iconName: 'spa',
                isHighlighted: false,
                isActive: true,
                displayOrder: 3,
              ),
              const GlorovOffer(
                id: 'offer_shipping_freeship',
                code: 'FREESHIP',
                title: 'Free Express Botanical Courier',
                tag: 'FREE DELIVERY',
                description:
                    'Free moisture-conditioned nursery express courier across India on orders over ₹999.',
                discountBadge: 'FREE DELIVERY',
                discountType: 'free_shipping',
                discountValue: 0.0,
                minSpend: 999.0,
                minSpendText: 'Min Order: ₹999',
                expiryText: 'Pan-India delivery',
                category: 'sitewide',
                bgColor: '#E1F5FE',
                textColor: '#01579B',
                accentColor: '#0288D1',
                iconName: 'local_shipping',
                isHighlighted: false,
                isActive: true,
                displayOrder: 4,
              ),
            ];

  @override
  Future<List<GlorovOffer>> fetchOffers() async {
    return _offers.where((o) => o.isActive).toList()
      ..sort((a, b) => a.displayOrder.compareTo(b.displayOrder));
  }

  @override
  Future<GlorovOffer?> fetchHighlightedOffer() async {
    final active = await fetchOffers();
    final highlighted = active.where((o) => o.isHighlighted).toList();
    if (highlighted.isNotEmpty) return highlighted.first;
    return active.isNotEmpty ? active.first : GlorovOffer.defaultWelcomeOffer;
  }
}
