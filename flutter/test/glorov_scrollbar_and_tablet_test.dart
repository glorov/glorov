import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/common/glorov_scrollbar.dart';
import 'package:shop/core/theme/app_breakpoints.dart';
import 'package:shop/core/theme/app_theme.dart';
import 'package:shop/core/theme/glorov_scroll_behavior.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';

void main() {
  setUp(() {
    GlorovCartState.instance.resetDemoData();
  });

  group('GLOROV Custom Scrollbar & Theme Specs', () {
    testWidgets('AppTheme defines custom scrollbar theme with small and thin slider',
        (tester) async {
      late ThemeData extractedTheme;

      await tester.pumpWidget(
        Builder(
          builder: (context) {
            extractedTheme = AppTheme.lightTheme(context);
            return MaterialApp(
              theme: extractedTheme,
              home: const Scaffold(body: SizedBox()),
            );
          },
        ),
      );
      await tester.pumpAndSettle();

      final scrollbarTheme = extractedTheme.scrollbarTheme;

      expect(scrollbarTheme, isNotNull);
      // Small and thin slider: normal thickness is 4.0
      expect(scrollbarTheme.thickness?.resolve({}), equals(4.0));
      // Expands slightly to 6.0 on hover or drag
      expect(scrollbarTheme.thickness?.resolve({WidgetState.hovered}), equals(6.0));
      expect(scrollbarTheme.thickness?.resolve({WidgetState.dragged}), equals(6.0));
      // Radius is 8.0 rounded pill
      expect(scrollbarTheme.radius, equals(const Radius.circular(8.0)));
      // Interactive is enabled
      expect(scrollbarTheme.interactive, isTrue);
    });

    testWidgets('GlorovScrollbar renders thin custom scrollbar with child',
        (tester) async {
      final controller = ScrollController();
      addTearDown(controller.dispose);

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: GlorovScrollbar(
              controller: controller,
              thumbVisibility: true,
              child: ListView.builder(
                controller: controller,
                itemCount: 50,
                itemBuilder: (ctx, i) => ListTile(title: Text('Item $i')),
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.byType(RawScrollbar), findsOneWidget);
      final rawScrollbar = tester.widget<RawScrollbar>(find.byType(RawScrollbar));
      expect(rawScrollbar.thickness, equals(4.0));
      expect(rawScrollbar.radius, equals(const Radius.circular(8.0)));
    });

    test('GlorovScrollBehavior enables drag on all pointer devices', () {
      const behavior = GlorovScrollBehavior();
      expect(behavior.dragDevices, contains(PointerDeviceKind.touch));
      expect(behavior.dragDevices, contains(PointerDeviceKind.mouse));
      expect(behavior.dragDevices, contains(PointerDeviceKind.trackpad));
      expect(behavior.dragDevices, contains(PointerDeviceKind.stylus));
    });
  });

  group('GLOROV Tablet & Mobile Layout Responsiveness', () {
    testWidgets('Tablet Viewport (768x1024) renders 2-column layout with Order Summary in right column',
        (tester) async {
      // iPad portrait width
      tester.view.physicalSize = const Size(768, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final state = GlorovCartState.instance;
      final seed = GlorovMockData.products.first;
      state.addToCart(seed, quantity: 2);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Tablet 2-column renders the Order Summary card
      expect(find.text('ORDER SUMMARY'), findsOneWidget);
      expect(find.text('PROCEED TO CHECKOUT'), findsOneWidget);

      // On tablet, the redundant mobile bottom sticky bar is suppressed because Order Summary is present
      expect(find.text('Inclusive of all taxes'), findsNothing);
    });

    testWidgets('Mobile Viewport (390x844) renders 1-column layout with sticky bottom checkout bar',
        (tester) async {
      tester.view.physicalSize = const Size(390, 844);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      final state = GlorovCartState.instance;
      final seed = GlorovMockData.products.first;
      state.addToCart(seed, quantity: 2);

      await tester.pumpWidget(
        const MaterialApp(
          home: GlorovCartScreen(),
        ),
      );
      await tester.pumpAndSettle();

      // Mobile renders sticky checkout bar at bottom
      expect(find.text('CHECKOUT'), findsOneWidget);
      expect(find.text('Inclusive of all taxes'), findsOneWidget);
    });

    testWidgets('AppBreakpoints provides 3 columns on tablet viewport (768px)',
        (tester) async {
      tester.view.physicalSize = const Size(768, 1024);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);

      await tester.pumpWidget(
        MaterialApp(
          home: Builder(
            builder: (context) {
              final cols = AppBreakpoints.getGridColumnCount(context);
              return Scaffold(body: Text('Columns: $cols'));
            },
          ),
        ),
      );

      expect(find.text('Columns: 3'), findsOneWidget);
    });
  });
}
