import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_micro_interactions/flutter_micro_interactions.dart';
import 'package:shop/components/home/glorov_hero_banner_slider.dart';
import 'package:shop/components/home/glorov_hero_banner_slider_skeleton.dart';
import 'package:shop/core/interactions/glorov_skeletons.dart';

void main() {
  group('GlorovHeroBannerSliderSkeleton & Loading State Tests', () {
    testWidgets('Desktop Viewport: Renders 20:9 ratio, arrow placeholders, tag, headlines & CTA', (tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSliderSkeleton(),
            ),
          ),
        ),
      );
      await tester.pump();

      // Check SkeletonScope & LoadingSkeleton exist
      expect(find.byType(SkeletonScope), findsWidgets);
      expect(find.byType(LoadingSkeleton), findsWidgets);

      // Verify exact height matches 20:9 aspect ratio: 1440 / (20/9) = 648
      final containerFinder = find.byType(GlorovHeroBannerSliderSkeleton);
      final size = tester.getSize(containerFinder);
      expect(size.width, 1440.0);
      expect(size.height, closeTo(648.0, 1.0));

      // Verify desktop chevrons (< and >) are present
      expect(find.byIcon(Icons.chevron_left_rounded), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right_rounded), findsOneWidget);

      // Verify botanical watermark spa icon is present
      expect(find.byIcon(Icons.spa_outlined), findsOneWidget);
    });

    testWidgets('Tablet Viewport: Renders 20:9 ratio without desktop arrows', (tester) async {
      tester.view.physicalSize = const Size(768, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSliderSkeleton(),
            ),
          ),
        ),
      );
      await tester.pump();

      // Verify exact height matches 20:9 aspect ratio: 768 / (20/9) = 345.6
      final containerFinder = find.byType(GlorovHeroBannerSliderSkeleton);
      final size = tester.getSize(containerFinder);
      expect(size.width, 768.0);
      expect(size.height, closeTo(345.6, 1.0));

      // On tablet (< 992px), desktop chevron buttons are not shown
      expect(find.byIcon(Icons.chevron_left_rounded), findsNothing);
      expect(find.byIcon(Icons.chevron_right_rounded), findsNothing);
    });

    testWidgets('Mobile Viewport: Renders 5:7 ratio, centered layout, no desktop arrows', (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSliderSkeleton(),
            ),
          ),
        ),
      );
      await tester.pump();

      // Verify exact height matches 5:7 aspect ratio: 390 / (5/7) = 546.0
      final containerFinder = find.byType(GlorovHeroBannerSliderSkeleton);
      final size = tester.getSize(containerFinder);
      expect(size.width, 390.0);
      expect(size.height, closeTo(546.0, 1.0));

      // Desktop chevrons must not appear on mobile
      expect(find.byIcon(Icons.chevron_left_rounded), findsNothing);
      expect(find.byIcon(Icons.chevron_right_rounded), findsNothing);

      // Botanical watermark icon is present
      expect(find.byIcon(Icons.spa_outlined), findsOneWidget);
    });

    testWidgets('GlorovHeroBannerSlider(isLoading: true) delegates directly to skeleton', (tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSlider(isLoading: true),
            ),
          ),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovHeroBannerSliderSkeleton), findsOneWidget);
      expect(find.byType(PageView), findsNothing);
    });

    testWidgets('Zero Layout Shift (CLS = 0): Skeleton and loaded slider have identical height', (tester) async {
      // 1. Desktop Test
      tester.view.physicalSize = const Size(1200, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() => tester.view.resetPhysicalSize());

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSliderSkeleton(),
            ),
          ),
        ),
      );
      await tester.pump();
      final skeletonDesktopHeight = tester.getSize(find.byType(GlorovHeroBannerSliderSkeleton)).height;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSlider(isLoading: false),
            ),
          ),
        ),
      );
      await tester.pump();
      final loadedDesktopHeight = tester.getSize(find.byType(GlorovHeroBannerSlider)).height;

      expect(skeletonDesktopHeight, equals(loadedDesktopHeight));

      // 2. Mobile Test
      tester.view.physicalSize = const Size(400, 800);
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSliderSkeleton(),
            ),
          ),
        ),
      );
      await tester.pump();
      final skeletonMobileHeight = tester.getSize(find.byType(GlorovHeroBannerSliderSkeleton)).height;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: GlorovHeroBannerSlider(isLoading: false),
            ),
          ),
        ),
      );
      await tester.pump();
      final loadedMobileHeight = tester.getSize(find.byType(GlorovHeroBannerSlider)).height;

      expect(skeletonMobileHeight, equals(loadedMobileHeight));
    });

    testWidgets('GlorovSliderSkeleton alias resolves to GlorovHeroBannerSliderSkeleton', (tester) async {
      expect(GlorovSliderSkeleton, equals(GlorovHeroBannerSliderSkeleton));
    });
  });
}
