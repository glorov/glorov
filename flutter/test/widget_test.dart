import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/main.dart';

void main() {
  testWidgets('GLOROV Storefront App Smoke Test', (WidgetTester tester) async {
    // Provide a standard desktop browser viewport
    tester.view.physicalSize = const Size(1280, 900);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    // Build the GLOROV web app and trigger a frame
    await tester.pumpWidget(const MyApp());
    await tester.pump();

    // Verify GLOROV brand logo SVG / icon is present
    expect(find.byType(SvgPicture), findsWidgets);
  });
}
