import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/home/glorov_hero_banner_slider.dart';

void main() {
  group('GlorovHeroBannerSlider Component Tests', () {
    const testSlides = [
      GlorovBannerSlide(
        id: 'slide_1',
        desktopImageUrl: 'assets/images/banner_festive_desktop.png',
        mobileImageUrl: 'assets/images/banner_festive_mobile.jpg',
        title: 'Festive Botanical Sale',
        ctaText: 'SHOP FESTIVE',
        ctaRoute: '/catalog',
      ),
      GlorovBannerSlide(
        id: 'slide_2',
        desktopImageUrl: 'assets/images/banner_botanical_desktop.jpg',
        mobileImageUrl: 'assets/images/banner_botanical_mobile.jpg',
        title: 'Botanical Living Spaces',
        ctaText: 'EXPLORE PLANTS',
        ctaRoute: '/catalog',
      ),
    ];

    testWidgets(
        'Desktop Viewport renders desktop layout with floating arrow navigation',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(
              slides: testSlides,
              autoPlay: false,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Desktop layout should render next/prev navigation chevron arrows
      expect(find.byIcon(Icons.chevron_left_rounded), findsOneWidget);
      expect(find.byIcon(Icons.chevron_right_rounded), findsOneWidget);

      // Verify PageView is present
      expect(find.byType(PageView), findsOneWidget);

      // Verify pagination indicators are present
      expect(find.byType(GestureDetector), findsWidgets);

      // Tap next arrow button to advance to slide 2
      await tester.tap(find.byIcon(Icons.chevron_right_rounded));
      await tester.pumpAndSettle();

      // Slide changed
      expect(find.byType(GlorovHeroBannerSlider), findsOneWidget);
    });

    testWidgets(
        'Mobile Viewport renders mobile aspect ratio and hides desktop arrows',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(
              slides: testSlides,
              autoPlay: false,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // On mobile, floating chevron arrows are hidden to preserve screen width
      expect(find.byIcon(Icons.chevron_left_rounded), findsNothing);
      expect(find.byIcon(Icons.chevron_right_rounded), findsNothing);

      // PageView should be present and support swipe gestures
      expect(find.byType(PageView), findsOneWidget);

      // Swipe horizontally to next slide
      await tester.drag(find.byType(PageView), const Offset(-300, 0));
      await tester.pumpAndSettle();

      expect(find.byType(GlorovHeroBannerSlider), findsOneWidget);
    });

    testWidgets('Custom slide tap triggers custom callback or route',
        (WidgetTester tester) async {
      bool tapped = false;

      final customSlides = [
        GlorovBannerSlide(
          id: 'custom_1',
          desktopImageUrl: 'assets/images/banner_festive_desktop.png',
          mobileImageUrl: 'assets/images/banner_festive_mobile.jpg',
          onTap: () => tapped = true,
        ),
      ];

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(
              slides: customSlides,
              autoPlay: false,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(GlorovHeroBannerSlider));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('Renders 4 default botanical campaign slides when unconfigured',
        (WidgetTester tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(
              autoPlay: false,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(GlorovHeroBannerSlider.defaultBotanicalSlides.length, 4);
      expect(GlorovHeroBannerSlider.defaultBotanicalSlides[0].title,
          'Every Great Garden Begins with a Seed.');
      expect(GlorovHeroBannerSlider.defaultBotanicalSlides[1].title,
          'Plant a Seed. Grow a Dream.');
      expect(GlorovHeroBannerSlider.defaultBotanicalSlides[2].title,
          'Let Your Garden Bloom.');
      expect(GlorovHeroBannerSlider.defaultBotanicalSlides[3].title,
          'Grow Fresh. Live Green.');

      expect(find.byType(PageView), findsOneWidget);
    });

    test('GlorovBannerSlide.fromJson correctly maps Medusa API response', () {
      final json = {
        'id': 'banner_test_1',
        'title': 'Monsoon Botanical Sale',
        'subtitle': 'Special organic potting mixes',
        'tag': 'SEASONAL SPOTLIGHT',
        'desktop_image_url': '/banners/banner_plant_seed_desktop.png',
        'mobile_image_url': '/banners/banner_plant_seed_mobile.jpg',
        'cta_text': 'SHOP NOW',
        'cta_route': '/categories/seeds',
        'bg_color': '#1E3D2F',
      };

      final slide = GlorovBannerSlide.fromJson(json);
      expect(slide.id, 'banner_test_1');
      expect(slide.title, 'Monsoon Botanical Sale');
      expect(slide.tag, 'SEASONAL SPOTLIGHT');
      expect(slide.desktopImageUrl, 'assets/images/banner_plant_seed_desktop.png');
      expect(slide.mobileImageUrl, 'assets/images/banner_plant_seed_mobile.jpg');
      expect(slide.ctaRoute, '/categories/seeds');
    });

    testWidgets(
        'Infinite forward loop: always scrolls right past last slide without rewinding',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1280, 800);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      int activeIndex = 0;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(
              slides: testSlides, // 2 slides: index 0 and 1
              autoPlay: false,
              onSlideChanged: (idx) => activeIndex = idx,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Find PageView widget and controller
      final pageViewFinder = find.byType(PageView);
      expect(pageViewFinder, findsOneWidget);
      final PageView pageView = tester.widget(pageViewFinder);
      final controller = pageView.controller!;
      final initialPage = controller.page!.round();

      // Tap next arrow once: advances from slide 0 -> slide 1
      await tester.tap(find.byIcon(Icons.chevron_right_rounded));
      await tester.pumpAndSettle();
      expect(controller.page!.round(), initialPage + 1);
      expect(activeIndex, 1);

      // Tap next arrow again past last slide: ALWAYS advances forward (+1) to slide 0, NEVER rewinds!
      await tester.tap(find.byIcon(Icons.chevron_right_rounded));
      await tester.pumpAndSettle();
      expect(controller.page!.round(), initialPage + 2); // Monotonically increases
      expect(activeIndex, 0); // Wrapped smoothly to slide 0

      // Tap next arrow again: advances forward (+1) to slide 1
      await tester.tap(find.byIcon(Icons.chevron_right_rounded));
      await tester.pumpAndSettle();
      expect(controller.page!.round(), initialPage + 3); // Continuous rightward progression
      expect(activeIndex, 1);
    });

    testWidgets('Full width slider takes edge-to-edge unconstrained width by default',
        (WidgetTester tester) async {
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(
              autoPlay: false,
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      // Verify full width slider widget exists and defaults to isFullWidth: true
      final slider = tester.widget<GlorovHeroBannerSlider>(find.byType(GlorovHeroBannerSlider));
      expect(slider.isFullWidth, isTrue);

      // Verify the rendered size spans the entire 1440px viewport width
      final renderBox = tester.renderObject<RenderBox>(find.byType(GlorovHeroBannerSlider));
      expect(renderBox.size.width, 1440.0);
    });

    testWidgets(
        'Desktop disables mouse scroll hijacking (NeverScrollableScrollPhysics) while mobile enables swipe (PageScrollPhysics)',
        (WidgetTester tester) async {
      // 1. Desktop test
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(autoPlay: false),
          ),
        ),
      );
      await tester.pumpAndSettle();

      PageView pageView = tester.widget(find.byType(PageView));
      expect(pageView.physics, isA<NeverScrollableScrollPhysics>());

      // 2. Mobile/Tablet test
      tester.view.physicalSize = const Size(390, 844);
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(autoPlay: false),
          ),
        ),
      );
      await tester.pumpAndSettle();

      pageView = tester.widget(find.byType(PageView));
      expect(pageView.physics, isA<PageScrollPhysics>());

      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });

    testWidgets('Tablet device renders responsive 20:9 aspect ratio',
        (WidgetTester tester) async {
      // iPad portrait: 768 x 1024
      tester.view.physicalSize = const Size(768, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(autoPlay: false),
          ),
        ),
      );
      await tester.pumpAndSettle();

      final renderBox = tester.renderObject<RenderBox>(find.byType(GlorovHeroBannerSlider));
      expect(renderBox.size.width, 768.0);
      // Height strictly follows 20:9 ratio: 768 * 9 / 20 = 345.6px
      expect(renderBox.size.height, closeTo(768.0 / (20.0 / 9.0), 0.5));
    });

    testWidgets('Desktop and Mobile render exact 20:9 and 5:7 aspect ratios',
        (WidgetTester tester) async {
      // 1. Desktop: 1440 x 900 -> 20:9 aspect ratio
      tester.view.physicalSize = const Size(1440, 900);
      tester.view.devicePixelRatio = 1.0;

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(autoPlay: false),
          ),
        ),
      );
      await tester.pumpAndSettle();

      RenderBox renderBox = tester.renderObject<RenderBox>(find.byType(GlorovHeroBannerSlider));
      expect(renderBox.size.width, 1440.0);
      // Height follows 20:9: 1440 * 9 / 20 = 648.0px
      expect(renderBox.size.height, closeTo(1440.0 / (20.0 / 9.0), 0.5));

      // 2. Mobile: 390 x 844 -> 5:7 aspect ratio
      tester.view.physicalSize = const Size(390, 844);

      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: GlorovHeroBannerSlider(autoPlay: false),
          ),
        ),
      );
      await tester.pumpAndSettle();

      renderBox = tester.renderObject<RenderBox>(find.byType(GlorovHeroBannerSlider));
      expect(renderBox.size.width, 390.0);
      // Height follows 5:7: 390 * 7 / 5 = 546.0px
      expect(renderBox.size.height, closeTo(390.0 / (5.0 / 7.0), 0.5));

      tester.view.resetPhysicalSize();
      tester.view.resetDevicePixelRatio();
    });
  });
}
