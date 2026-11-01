import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../route/route_constants.dart';
import 'glorov_policy_layout.dart';

/// Privacy Policy Screen for GLOROV Botanical E-Commerce
/// Compliant with the Indian Digital Personal Data Protection Act, 2023 (DPDP).
/// Matches website privacy documentation with zero ad retargeting and strict botanical data minimization.
class PrivacyPolicyScreen extends StatelessWidget {
  const PrivacyPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GlorovPolicyScaffold(
      currentTab: GlorovPolicyTab.privacy,
      title: 'Privacy & Data Protection Policy',
      subtitle:
          'How GLOROV protects your personal information, delivery data, and botanical order privacy.',
      badgeText: 'DPDP ACT 2023 COMPLIANT',
      badgeIcon: Icons.lock_outline,
      children: [
        // Meta Information Bar
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(
            horizontal: 10,
            vertical: 6,
          ),
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: AppColors.surfaceCream,
            borderRadius: AppRadii.roundedMd,
            border: Border.all(color: AppColors.borderLight),
          ),
          child: const Wrap(
            alignment: WrapAlignment.spaceBetween,
            spacing: AppSpacing.md,
            runSpacing: 4,
            children: [
              Text(
                'Last Updated: October 2026',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: AppColors.forestDeep,
                ),
              ),
              Text(
                'Compliance: Indian Digital Personal Data Protection Act (DPDP), 2023',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 10.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),

        // Section 1: Data Collection & Strict Minimization
        const PolicySection(
          icon: Icons.verified_user_outlined,
          title: '1. Data Collection & Strict Minimization',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'GLOROV Botanicals adheres strictly to the principles of purpose limitation and data minimization under the Digital Personal Data Protection Act, 2023 (DPDP). We collect only data strictly necessary to fulfill living plant and organic seed orders:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Contact & Delivery Details:',
                description:
                    'Full name, delivery shipping address, 6-digit Indian PIN code, mobile phone number, and email address for courier Air Waybill (AWB) generation and SMS shipment tracking.',
              ),
              PolicyBulletPoint(
                label: 'Account Authentication:',
                description:
                    'Salted and securely hashed authentication credentials when you choose to create a GLOROV customer account.',
              ),
              PolicyBulletPoint(
                label: 'Payment Information:',
                description:
                    'Payment card details, UPI Virtual Payment Addresses (VPAs), and net banking credentials are never stored on our servers. All financial transactions are processed directly via PCI-DSS compliant gateways (Razorpay).',
              ),
            ],
          ),
        ),

        // Callout: Zero Ad Sale Pledge
        const PolicyCalloutBox(
          icon: Icons.shield_outlined,
          title: 'Our Zero-Sale Privacy Pledge',
          text:
              'We never sell, rent, lease, or monetize customer telephone numbers, email addresses, or delivery addresses to third-party marketing brokers or ad networks. Your details are used strictly for delivering healthy living plants and seeds to your doorstep.',
        ),

        // Section 2: Authorized Purposes
        const PolicySection(
          icon: Icons.settings_suggest_outlined,
          title: '2. Authorized Purposes of Processing',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'We process your personal information exclusively for the following lawful botanical and fulfillment purposes:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Logistics Fulfillment:',
                description:
                    'Generating courier shipping labels with our logistics partners (Delhivery, Bluedart, and Shiprocket).',
              ),
              PolicyBulletPoint(
                label: 'Transactional Notifications:',
                description:
                    'Sending order confirmation messages, delivery tracking SMS, and WhatsApp plant transit updates.',
              ),
              PolicyBulletPoint(
                label: 'Botanical Care Support:',
                description:
                    'Providing personalized seedling germination advice and botanical transit replacement claim assistance via our Pune nursery desk.',
              ),
              PolicyBulletPoint(
                label: 'Fraud Prevention:',
                description:
                    'Preventing payment fraud and enforcing Cash on Delivery safety thresholds for perishable botanical consignments.',
              ),
            ],
          ),
        ),

        // Section 3: Encryption & Security
        const PolicySection(
          icon: Icons.enhanced_encryption_outlined,
          title: '3. Encryption & App Security Standards',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'All network communication between the GLOROV application and our backend infrastructure is encrypted using Transport Layer Security (TLS 1.3) with modern cryptographic forward secrecy.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                'Customer authentication tokens are secured with cryptographically signed tokens. Saved local preferences (wishlist, shopping bag, offline address book) remain encrypted within sandboxed application storage.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),

        // Section 4: Data Rights & Erasure
        PolicySection(
          icon: Icons.manage_accounts_outlined,
          title: '4. Your Data Rights & Erasure Requests',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Under the DPDP Act 2023, you have full control and fundamental rights over your personal data:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              const PolicyBulletPoint(
                label: 'Address Book Management:',
                description:
                    'You can review, edit, or delete saved delivery addresses at any time directly in your Account Hub.',
              ),
              const PolicyBulletPoint(
                label: 'Right to Erasure:',
                description:
                    'To request complete deletion of your customer profile, order history, and contact details, write to privacy@glorov.in or support@glorov.in with the subject line "Data Erasure Request". All erasure requests are fulfilled within 7 business days.',
              ),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton.icon(
                onPressed: () {
                  Navigator.pushNamed(context, profileScreenRoute);
                },
                icon: const Icon(Icons.person_outline, size: 16),
                label: const Text('Manage Account & Addresses'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.forestDeep,
                  side: const BorderSide(color: AppColors.forestDeep),
                  shape: const RoundedRectangleBorder(
                    borderRadius: AppRadii.roundedMd,
                  ),
                ),
              ),
            ],
          ),
        ),

        // Section 5: Grievance Officer & Contact
        const PolicySection(
          icon: Icons.contact_support_outlined,
          title: '5. Grievance Redressal & Legal Notice',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'In accordance with the Digital Personal Data Protection Act, 2023 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, grievances may be directed to our Grievance Officer:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.md),
              PolicyContactCard(
                title: 'Grievance Officer: Data Protection & Horticultural Operations',
                entity: 'GLOROV Botanicals',
                address: 'Pune Central Nursery Hub, Maharashtra 411001, India',
                email: 'privacy@glorov.in / support@glorov.in',
                phone: '+91 80870 87224',
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// Contact details card helper
class PolicyContactCard extends StatelessWidget {
  final String title;
  final String entity;
  final String address;
  final String email;
  final String phone;

  const PolicyContactCard({
    super.key,
    required this.title,
    required this.entity,
    required this.address,
    required this.email,
    required this.phone,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.surfaceCream,
        borderRadius: AppRadii.roundedMd,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 5),
          _row(Icons.business_outlined, entity),
          const SizedBox(height: 3),
          _row(Icons.location_on_outlined, address),
          const SizedBox(height: 3),
          _row(Icons.email_outlined, email),
          const SizedBox(height: 3),
          _row(Icons.phone_outlined, phone),
        ],
      ),
    );
  }

  Widget _row(IconData icon, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 13, color: AppColors.forestMedium),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 11.5,
              color: AppColors.textSecondary,
            ),
          ),
        ),
      ],
    );
  }
}
