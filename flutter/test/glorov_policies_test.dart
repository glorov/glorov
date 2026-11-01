import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart' as router;
import 'package:shop/screens/policies/glorov_policy_hub_screen.dart';
import 'package:shop/screens/policies/glorov_policy_layout.dart';
import 'package:shop/screens/policies/privacy_policy_screen.dart';
import 'package:shop/screens/policies/shipping_and_trust_policy_screen.dart';
import 'package:shop/screens/policies/terms_of_service_screen.dart';

void main() {
  Widget createWidgetForTesting(Widget child, {Size size = const Size(1200, 900)}) {
    return MediaQuery(
      data: MediaQueryData(size: size),
      child: MaterialApp(
        onGenerateRoute: router.generateRoute,
        home: child,
      ),
    );
  }

  group('GLOROV Botanical Policies & Legal Framework Tests', () {
    testWidgets('PrivacyPolicyScreen renders DPDP Act 2023 compliance and grievance officer',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 900));
      await tester.pumpWidget(createWidgetForTesting(const PrivacyPolicyScreen()));
      await tester.pumpAndSettle();

      // Verify Header & Badge
      expect(find.text('Privacy & Data Protection Policy'), findsWidgets);
      expect(find.text('DPDP ACT 2023 COMPLIANT'), findsOneWidget);

      // Verify Key Sections & Pledges
      expect(find.text('1. Data Collection & Strict Minimization'), findsOneWidget);
      expect(find.text('Our Zero-Sale Privacy Pledge'), findsOneWidget);
      expect(
        find.textContaining('We never sell, rent, lease, or monetize customer telephone numbers'),
        findsOneWidget,
      );

      // Verify Grievance Officer
      expect(find.text('5. Grievance Redressal & Legal Notice'), findsOneWidget);
      expect(find.textContaining('privacy@glorov.in'), findsWidgets);
    });

    testWidgets('TermsOfServiceScreen renders explicit Trademark Pending notice and 0% GST',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 2400));
      await tester.pumpWidget(createWidgetForTesting(const TermsOfServiceScreen(), size: const Size(1200, 2400)));
      await tester.pumpAndSettle();

      // Verify Title & Badge
      expect(find.text('Terms of Botanical Service'), findsWidgets);
      expect(find.text('STATUTORY COMPLIANCE & GOVERNANCE'), findsOneWidget);

      // Verify Trademark Application Pending Notice (Explicitly NOT registered)
      expect(find.text('2. Trademark Notice & Proprietary Rights'), findsOneWidget);
      expect(find.text('GLOROV™ Trademark Notice (Application Pending / Not Registered)'), findsOneWidget);
      expect(
        find.textContaining('GLOROV™ is a pending trademark for which registration application has been formally filed'),
        findsOneWidget,
      );
      expect(find.textContaining('NOT yet a registered trademark (®)'), findsOneWidget);

      // Verify 0% GST on Seeds (HSN 1209)
      expect(find.text('3. Statutory GST Compliance & 0% Seed Exemption'), findsOneWidget);
      expect(find.textContaining('0% GST on Seeds for Sowing (HSN 1209)'), findsOneWidget);

      // Verify COD Limit for living specimens
      expect(find.textContaining('₹5,000'), findsOneWidget);
    });

    testWidgets('ShippingAndTrustPolicyScreen renders dispatch protocols, 48h guarantee, and seed viability',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 2400));
      await tester.pumpWidget(createWidgetForTesting(const ShippingAndTrustPolicyScreen(), size: const Size(1200, 2400)));
      await tester.pumpAndSettle();

      // Verify Title & Dispatch Hub
      expect(find.text('Shipping, Transit & Trust Policy'), findsWidgets);
      expect(find.text('PAN-INDIA BOTANICAL LOGISTICS & TRUST'), findsOneWidget);
      expect(find.textContaining('Pune Central Nursery Hub'), findsWidgets);

      // Verify Mon-Thu Dispatch for live plants
      expect(find.text('1. Pune Nursery Dispatch Protocols'), findsOneWidget);
      expect(find.textContaining('Monday through Thursday Live Plant Dispatches'), findsOneWidget);

      // Verify 48-Hour Live Plant Arrival Guarantee & No Return
      expect(find.text('3. The 48-Hour Live Plant Arrival Guarantee'), findsOneWidget);
      expect(find.text('4. Perishable Botanical Policy (No Physical Return Required)'), findsOneWidget);
      expect(find.textContaining('returning a distressed living plant via reverse courier transit will inevitably result in the death of the specimen'), findsOneWidget);

      // Verify Seed Viability & Germination Guarantee
      expect(find.text('5. Seed Viability & Germination Warranty'), findsOneWidget);
      expect(find.textContaining('80% to 90% germination rates'), findsOneWidget);

      // Verify Shipping Rate Table
      expect(find.text('Seeds & Accessories'), findsWidgets);
      expect(find.text('Live Potted Plants'), findsWidgets);
    });

    testWidgets('Policy routes resolve correctly from router', (WidgetTester tester) async {
      final privacyRoute = router.generateRoute(const RouteSettings(name: privacyPolicyScreenRoute));
      final termsRoute = router.generateRoute(const RouteSettings(name: termsOfServicesScreenRoute));
      final shippingRoute = router.generateRoute(const RouteSettings(name: shippingAndTrustPolicyScreenRoute));

      expect(privacyRoute, isNotNull);
      expect(termsRoute, isNotNull);
      expect(shippingRoute, isNotNull);

      expect((privacyRoute as dynamic).child, isA<PrivacyPolicyScreen>());
      expect((termsRoute as dynamic).child, isA<TermsOfServiceScreen>());
      expect((shippingRoute as dynamic).child, isA<ShippingAndTrustPolicyScreen>());
    });

    testWidgets('GlorovPolicyHubScreen renders tab based on argument', (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(1200, 900));

      await tester.pumpWidget(
        MaterialApp(
          key: const ValueKey('hub_terms'),
          onGenerateRoute: router.generateRoute,
          initialRoute: policiesScreenRoute,
          routes: {
            policiesScreenRoute: (context) =>
                const GlorovPolicyHubScreen(initialTab: GlorovPolicyTab.terms),
          },
        ),
      );
      await tester.pumpAndSettle();
      expect(find.byType(TermsOfServiceScreen), findsOneWidget);
    });

    testWidgets('Responsive Mobile Viewport adapts tabs cleanly', (WidgetTester tester) async {
      // Small mobile screen 390x844
      await tester.binding.setSurfaceSize(const Size(390, 844));
      await tester.pumpWidget(createWidgetForTesting(const PrivacyPolicyScreen(), size: const Size(390, 844)));
      await tester.pumpAndSettle();

      // Mobile tabs should be visible
      expect(find.text('Privacy'), findsOneWidget);
      expect(find.text('Terms'), findsOneWidget);
      expect(find.text('Shipping & Trust'), findsOneWidget);

      // Verify compact mobile hero header renders
      expect(find.text('DPDP ACT 2023 COMPLIANT'), findsOneWidget);

      // Verify compact footer renders 2-column collections & support
      expect(find.text('Collections'), findsOneWidget);
      expect(find.text('Growing Support'), findsWidgets);
    });

    testWidgets('Ultra-narrow mobile viewport (360px width) does not overflow and preserves tabs',
        (WidgetTester tester) async {
      await tester.binding.setSurfaceSize(const Size(360, 640));
      await tester.pumpWidget(createWidgetForTesting(const ShippingAndTrustPolicyScreen(), size: const Size(360, 640)));
      await tester.pumpAndSettle();

      // All 3 tabs must fit cleanly without truncation/ellipsis
      expect(find.text('Privacy'), findsOneWidget);
      expect(find.text('Terms'), findsOneWidget);
      expect(find.text('Shipping & Trust'), findsOneWidget);

      // Verify compact table renders
      expect(find.text('Category'), findsOneWidget);
      expect(find.text('FREE Air'), findsOneWidget);
    });
  });
}
