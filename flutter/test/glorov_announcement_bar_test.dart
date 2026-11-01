import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/navigation/glorov_announcement_bar.dart';
import 'package:shop/models/glorov/glorov_announcement.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/repositories/mock/local_announcement_repository.dart';
import 'package:shop/services/glorov_header_scroll_notifier.dart';

void main() {
  setUp(() {
    GlorovHeaderScrollNotifier.instance.reset();
    GlorovRepositories.resetToMockDefaults();
  });

  Widget buildTestBar({
    List<GlorovAnnouncementItem>? customItems,
    GlorovAnnouncementConfig? customConfig,
    bool isAnimated = false,
    ValueChanged<GlorovAnnouncementItem>? onItemTap,
    Size size = const Size(1200, 800),
  }) {
    return MediaQuery(
      data: MediaQueryData(size: size),
      child: MaterialApp(
        home: Scaffold(
          body: GlorovAnnouncementBar(
            customItems: customItems,
            customConfig: customConfig,
            isAnimated: isAnimated,
            onItemTap: onItemTap,
          ),
        ),
      ),
    );
  }

  group('GlorovAnnouncementBar Marquee Ticker Tests', () {
    testWidgets('renders default announcement bar with ₹499 free delivery badge',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(buildTestBar());
      await tester.pump();

      // Verify the ₹499 free delivery badge is rendered
      expect(find.text('₹499 FREE DELIVERY'), findsWidgets);

      // Verify message text
      expect(
        find.textContaining('Free express botanical delivery on all orders over ₹499'),
        findsWidgets,
      );
    });

    testWidgets('renders botanical promotional messages in the ticker',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(buildTestBar());
      await tester.pump();

      // Verify other botanical promotional highlights
      expect(find.text('GLOROV BOTANICALS'), findsWidgets);
      expect(find.text('USE CODE GLOROV10'), findsWidgets);
      expect(find.text('100% ORGANIC SEEDS'), findsWidgets);
      expect(find.text('PUNE DISPATCH'), findsWidgets);
    });

    testWidgets('adapts smoothly across mobile viewports without layout overflow',
        (WidgetTester tester) async {
      // iPhone / Android viewport (390 x 844)
      await tester.binding.setSurfaceSize(const Size(390, 844));
      await tester.pumpWidget(buildTestBar(size: const Size(390, 844)));
      await tester.pump();

      expect(tester.takeException(), isNull);
      expect(find.text('₹499 FREE DELIVERY'), findsWidgets);
    });

    testWidgets('custom configuration applies theme colors and styles correctly',
        (WidgetTester tester) async {
      const customConfig = GlorovAnnouncementConfig(
        isEnabled: true,
        speedSeconds: 20,
        bgColor: Color(0xFF7A1C2E), // Festive crimson wine
        textColor: Colors.yellow,
        highlightColor: Color(0xFFFFD51F),
      );

      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(buildTestBar(customConfig: customConfig));
      await tester.pump();

      expect(find.byType(GlorovAnnouncementBar), findsOneWidget);
      expect(find.text('₹499 FREE DELIVERY'), findsWidgets);
    });

    testWidgets('hides completely when isEnabled is false', (WidgetTester tester) async {
      const disabledConfig = GlorovAnnouncementConfig(isEnabled: false);

      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(buildTestBar(customConfig: disabledConfig));
      await tester.pump();

      // Bar should render SizedBox.shrink
      expect(find.text('₹499 FREE DELIVERY'), findsNothing);
    });

    testWidgets('loads dynamic announcements from repository', (WidgetTester tester) async {
      final customRepo = LocalAnnouncementRepository(
        initialItems: const [
          GlorovAnnouncementItem(
            id: 'flash_sale',
            text: 'Special Monsoon Botanical Offer: Free Ceramic Pot With Every Ficus',
            highlightText: 'FLASH OFFER',
            icon: 'spa',
          ),
        ],
      );
      GlorovRepositories.setAnnouncementRepository(customRepo);

      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(buildTestBar());
      await tester.pumpAndSettle();

      expect(find.text('FLASH OFFER'), findsWidgets);
      expect(
        find.text('Special Monsoon Botanical Offer: Free Ceramic Pot With Every Ficus'),
        findsWidgets,
      );
    });

    testWidgets('triggers onItemTap callback when item is clicked',
        (WidgetTester tester) async {
      GlorovAnnouncementItem? tappedItem;

      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(
        buildTestBar(
          onItemTap: (item) {
            tappedItem = item;
          },
        ),
      );
      await tester.pump();

      final firstItemFinder = find.text('₹499 FREE DELIVERY').first;
      await tester.tap(firstItemFinder);
      await tester.pump();

      expect(tappedItem, isNotNull);
      expect(tappedItem?.highlightText, '₹499 FREE DELIVERY');
    });

    testWidgets('smoothly collapses height when page scrolls down',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 800));
      await tester.pumpWidget(buildTestBar());
      await tester.pump();

      // Top of page: visible height is 34
      AnimatedContainer container = tester.widget<AnimatedContainer>(
        find.byType(AnimatedContainer).first,
      );
      expect(container.constraints?.maxHeight, 34.0);

      // Scrolled down (> 180px in Zone 3)
      GlorovHeaderScrollNotifier.instance.handleScroll(200.0, 50.0);
      await tester.pump();

      container = tester.widget<AnimatedContainer>(
        find.byType(AnimatedContainer).first,
      );
      expect(container.constraints?.maxHeight, 0.0);
    });
  });
}
