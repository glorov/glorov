import 'package:flutter/material.dart';
import 'glorov_policy_layout.dart';
import 'privacy_policy_screen.dart';
import 'shipping_and_trust_policy_screen.dart';
import 'terms_of_service_screen.dart';

/// Unified Policy Hub for GLOROV Botanical E-Commerce
/// Allows deep linking to specific legal policies or tabbed browsing.
class GlorovPolicyHubScreen extends StatelessWidget {
  final GlorovPolicyTab initialTab;

  const GlorovPolicyHubScreen({
    super.key,
    this.initialTab = GlorovPolicyTab.privacy,
  });

  @override
  Widget build(BuildContext context) {
    switch (initialTab) {
      case GlorovPolicyTab.privacy:
        return const PrivacyPolicyScreen();
      case GlorovPolicyTab.terms:
        return const TermsOfServiceScreen();
      case GlorovPolicyTab.shippingAndTrust:
        return const ShippingAndTrustPolicyScreen();
    }
  }
}
