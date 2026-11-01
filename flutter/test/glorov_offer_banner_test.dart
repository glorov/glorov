import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/home/glorov_offer_banner.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/models/glorov/glorov_offer.dart';
import 'package:shop/repositories/contracts/offer_repository.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/services/glorov_cart_state.dart';

class MockDynamicOfferRepository implements OfferRepository {
  GlorovOffer? highlightedOffer;
  List<GlorovOffer> offers;

  MockDynamicOfferRepository({this.highlightedOffer, this.offers = const []});

  @override
  Future<List<GlorovOffer>> fetchOffers() async => offers;

  @override
  Future<GlorovOffer?> fetchHighlightedOffer() async => highlightedOffer;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    GlorovCartState.instance.clearCart();
    GlorovRepositories.resetToMockDefaults();
  });

  Widget buildTestableWidget(Widget child, {Size size = const Size(1200, 800)}) {
    return MaterialApp(
      home: MediaQuery(
        data: MediaQueryData(size: size),
        child: Scaffold(
          body: Center(child: child),
        ),
      ),
    );
  }

  group('GlorovOfferBanner Widget Tests', () {
    testWidgets('renders default welcome offer matching user specification',
        (tester) async {
      await tester.pumpWidget(buildTestableWidget(const GlorovOfferBanner()));
      await tester.pumpAndSettle();

      // Check eyebrow tag
      expect(find.text('SPECIAL WELCOME OFFER'), findsOneWidget);

      // Check headline description
      expect(
        find.text(
          'Use code GLOROV10 at checkout for an extra 10% off your entire botanical order.',
        ),
        findsOneWidget,
      );

      // Check coupon pill code
      expect(find.text('GLOROV10'), findsOneWidget);

      // Check copy button
      expect(find.text('COPY'), findsOneWidget);

      // Check circular gift card icon
      expect(find.byIcon(Icons.card_giftcard), findsOneWidget);
    });

    testWidgets('click-to-copy button sets clipboard and transitions to COPIED',
        (tester) async {
      // Mock clipboard system message
      final List<MethodCall> log = <MethodCall>[];
      tester.binding.defaultBinaryMessenger.setMockMethodCallHandler(
        SystemChannels.platform,
        (MethodCall methodCall) async {
          log.add(methodCall);
          return null;
        },
      );

      await tester.pumpWidget(buildTestableWidget(const GlorovOfferBanner()));
      await tester.pumpAndSettle();

      expect(find.text('COPY'), findsOneWidget);

      // Tap the copy pill
      await tester.tap(find.text('COPY'));
      await tester.pump();

      // Verify clipboard call was made
      expect(
        log.any((call) =>
            call.method == 'Clipboard.setData' &&
            call.arguments['text'] == 'GLOROV10'),
        isTrue,
      );

      // Verify button shows COPIED
      expect(find.text('COPIED'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle), findsOneWidget);

      await tester.pump(const Duration(seconds: 3));
    });

    testWidgets('auto-applies promo code to cart if cart contains items',
        (tester) async {
      final cart = GlorovCartState.instance;
      // Add test product to cart with quantity satisfying ₹499 min spend (e.g. 8 items >= ₹499)
      final product = GlorovMockData.products.first;
      cart.addToCart(product, quantity: 8);
      expect(cart.itemCount, 8);
      expect(cart.appliedPromoCode, isNull);

      await tester.pumpWidget(buildTestableWidget(const GlorovOfferBanner()));
      await tester.pumpAndSettle();

      // Tap copy
      await tester.tap(find.text('COPY'));
      await tester.pump();

      // Verify promo code GLOROV10 was auto-applied
      expect(cart.appliedPromoCode, 'GLOROV10');
      expect(cart.promoDiscountAmount, greaterThan(0));

      await tester.pump(const Duration(seconds: 3));
    });

    testWidgets('renders dynamic custom offer from repository', (tester) async {
      const customOffer = GlorovOffer(
        id: 'offer_monsoon_custom',
        code: 'MONSOON20',
        title: 'Monsoon Foliage Sale',
        tag: 'LIMITED MONSOON DEAL',
        description: 'Get 20% off all rain-conditioned nursery plants today!',
        discountBadge: '20% OFF',
        iconName: 'spa',
        bgColor: '#FFF8E1',
        accentColor: '#F57F17',
        isHighlighted: true,
        isActive: true,
      );

      GlorovRepositories.setOfferRepository(
        MockDynamicOfferRepository(highlightedOffer: customOffer),
      );

      await tester.pumpWidget(buildTestableWidget(const GlorovOfferBanner()));
      await tester.pumpAndSettle();

      expect(find.text('LIMITED MONSOON DEAL'), findsOneWidget);
      expect(
        find.text('Get 20% off all rain-conditioned nursery plants today!'),
        findsOneWidget,
      );
      expect(find.text('MONSOON20'), findsOneWidget);
      expect(find.byIcon(Icons.spa), findsOneWidget);
    });

    testWidgets('hides completely if offer is inactive or null', (tester) async {
      GlorovRepositories.setOfferRepository(
        MockDynamicOfferRepository(highlightedOffer: null),
      );

      await tester.pumpWidget(buildTestableWidget(const GlorovOfferBanner()));
      await tester.pumpAndSettle();

      // Should be invisible
      expect(find.text('SPECIAL WELCOME OFFER'), findsNothing);
      expect(find.text('GLOROV10'), findsNothing);
    });

    testWidgets('adapts smoothly to mobile viewport without layout overflow',
        (tester) async {
      await tester.pumpWidget(
        buildTestableWidget(
          const GlorovOfferBanner(),
          size: const Size(360, 640), // Typical compact mobile screen
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('SPECIAL WELCOME OFFER'), findsOneWidget);
      expect(find.text('GLOROV10'), findsOneWidget);
      expect(tester.takeException(), isNull); // No RenderFlex overflow
    });
  });
}
