import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/common/glorov_y_scroll_pass_through.dart';
import 'package:shop/core/theme/glorov_horizontal_scroll_behavior.dart';

void main() {
  group('GlorovYScrollPassThrough Comprehensive Tests', () {
    testWidgets(
        '1. Pure vertical mouse-wheel over carousel passes through to vertical page scroll',
        (WidgetTester tester) async {
      final pageController = PageController();
      final pageScrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              controller: pageScrollController,
              child: Column(
                children: [
                  GlorovYScrollPassThrough(
                    child: SizedBox(
                      height: 320,
                      child: ScrollConfiguration(
                        behavior: const GlorovHorizontalScrollBehavior(),
                        child: PageView.builder(
                          controller: pageController,
                          itemCount: 4,
                          itemBuilder: (context, idx) => GlorovYScrollPassThrough(
                            child: Container(
                              color: idx.isEven ? Colors.green : Colors.teal,
                              child: Center(child: Text('Banner Slide $idx')),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(height: 2500, color: Colors.amber),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(pageScrollController.offset, 0.0);
      expect(pageController.offset, 0.0);

      final center = tester.getCenter(find.text('Banner Slide 0'));
      final scrollEvent = PointerScrollEvent(
        position: center,
        scrollDelta: const Offset(0.0, 120.0),
      );

      await tester.sendEventToBinding(scrollEvent);
      await tester.pump();

      // Page scrolled vertically by 120px; carousel stayed at 0px
      expect(pageScrollController.offset, 120.0);
      expect(pageController.offset, 0.0);
    });

    testWidgets(
        '2. Trackpad two-finger scroll with slight diagonal drift (|dy| > |dx|) passes through to vertical page scroll',
        (WidgetTester tester) async {
      final pageController = PageController();
      final pageScrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              controller: pageScrollController,
              child: Column(
                children: [
                  GlorovYScrollPassThrough(
                    child: SizedBox(
                      height: 320,
                      child: ScrollConfiguration(
                        behavior: const GlorovHorizontalScrollBehavior(),
                        child: PageView.builder(
                          controller: pageController,
                          itemCount: 4,
                          itemBuilder: (context, idx) => GlorovYScrollPassThrough(
                            child: Container(
                              color: idx.isEven ? Colors.green : Colors.teal,
                              child: Center(child: Text('Banner Slide $idx')),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(height: 2500, color: Colors.amber),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(pageScrollController.offset, 0.0);
      expect(pageController.offset, 0.0);

      // Real-world Mac trackpad scroll event (e.g. dy = 95.0, minor wobble dx = 3.2)
      final center = tester.getCenter(find.text('Banner Slide 0'));
      final scrollEvent = PointerScrollEvent(
        position: center,
        scrollDelta: const Offset(3.2, 95.0),
      );

      await tester.sendEventToBinding(scrollEvent);
      await tester.pump();

      // Page scrolled vertically by 95px; carousel stayed at 0px
      expect(pageScrollController.offset, 95.0);
      expect(pageController.offset, 0.0);
    });

    testWidgets(
        '3. Intentional horizontal scroll (|dx| > |dy|) moves carousel and does NOT scroll page',
        (WidgetTester tester) async {
      final pageController = PageController();
      final pageScrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              controller: pageScrollController,
              child: Column(
                children: [
                  GlorovYScrollPassThrough(
                    child: SizedBox(
                      height: 320,
                      child: ScrollConfiguration(
                        behavior: const GlorovHorizontalScrollBehavior(),
                        child: PageView.builder(
                          controller: pageController,
                          itemCount: 4,
                          itemBuilder: (context, idx) => GlorovYScrollPassThrough(
                            child: Container(
                              color: idx.isEven ? Colors.green : Colors.teal,
                              child: Center(child: Text('Banner Slide $idx')),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(height: 2500, color: Colors.amber),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(pageScrollController.offset, 0.0);
      expect(pageController.offset, 0.0);

      // Horizontal swipe or scroll (dx = 70.0, dy = 1.5)
      final center = tester.getCenter(find.text('Banner Slide 0'));
      final scrollEvent = PointerScrollEvent(
        position: center,
        scrollDelta: const Offset(70.0, 1.5),
      );

      await tester.sendEventToBinding(scrollEvent);
      await tester.pump();

      // Carousel moved horizontally by 70px; page remained at 0px
      expect(pageScrollController.offset, 0.0);
      expect(pageController.offset, 70.0);
    });

    testWidgets(
        '4. Horizontal ListView (Offers coupons & product cards) scrolls vertical page on dy',
        (WidgetTester tester) async {
      final listScrollController = ScrollController();
      final pageScrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              controller: pageScrollController,
              child: Column(
                children: [
                  GlorovYScrollPassThrough(
                    child: SizedBox(
                      height: 180,
                      child: ScrollConfiguration(
                        behavior: const GlorovHorizontalScrollBehavior(),
                        child: ListView.builder(
                          controller: listScrollController,
                          scrollDirection: Axis.horizontal,
                          itemCount: 8,
                          itemBuilder: (context, idx) => GlorovYScrollPassThrough(
                            child: Container(
                              width: 140,
                              margin: const EdgeInsets.all(8),
                              color: Colors.deepPurple,
                              child: Center(child: Text('Coupon $idx')),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(height: 2500, color: Colors.blue),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(pageScrollController.offset, 0.0);
      expect(listScrollController.offset, 0.0);

      final center = tester.getCenter(find.text('Coupon 0'));
      final scrollEvent = PointerScrollEvent(
        position: center,
        scrollDelta: const Offset(2.0, 110.0),
      );

      await tester.sendEventToBinding(scrollEvent);
      await tester.pump();

      expect(pageScrollController.offset, 110.0);
      expect(listScrollController.offset, 0.0);
    });

    testWidgets(
        '5. Horizontal SingleChildScrollView (Category chips & gallery thumbnails) scrolls vertical page on dy',
        (WidgetTester tester) async {
      final chipScrollController = ScrollController();
      final pageScrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              controller: pageScrollController,
              child: Column(
                children: [
                  GlorovYScrollPassThrough(
                    child: SizedBox(
                      height: 48,
                      child: ScrollConfiguration(
                        behavior: const GlorovHorizontalScrollBehavior(),
                        child: SingleChildScrollView(
                          controller: chipScrollController,
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: List.generate(
                              12,
                              (idx) => GlorovYScrollPassThrough(
                                child: Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 6),
                                  child: Chip(label: Text('Chip $idx')),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  Container(height: 2500, color: Colors.orange),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(pageScrollController.offset, 0.0);
      expect(chipScrollController.offset, 0.0);

      final center = tester.getCenter(find.text('Chip 0'));
      final scrollEvent = PointerScrollEvent(
        position: center,
        scrollDelta: const Offset(1.5, 80.0),
      );

      await tester.sendEventToBinding(scrollEvent);
      await tester.pump();

      expect(pageScrollController.offset, 80.0);
      expect(chipScrollController.offset, 0.0);
    });

    testWidgets(
        '6. Explicit parentScrollController delegates vertical wheel scroll directly',
        (WidgetTester tester) async {
      final customScrollController = ScrollController();

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Stack(
              children: [
                GlorovYScrollPassThrough(
                  parentScrollController: customScrollController,
                  child: Container(
                    width: 300,
                    height: 300,
                    color: Colors.green,
                    child: const Center(child: Text('Delegated Area')),
                  ),
                ),
                SingleChildScrollView(
                  controller: customScrollController,
                  child: Container(height: 2000),
                ),
              ],
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(customScrollController.offset, 0.0);

      final center = tester.getCenter(find.text('Delegated Area'));
      final scrollEvent = PointerScrollEvent(
        position: center,
        scrollDelta: const Offset(0.0, 150.0),
      );

      await tester.sendEventToBinding(scrollEvent);
      await tester.pump();

      expect(customScrollController.offset, 150.0);
    });
  });
}
