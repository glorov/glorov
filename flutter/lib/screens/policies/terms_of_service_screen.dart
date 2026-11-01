import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import 'glorov_policy_layout.dart';
import 'privacy_policy_screen.dart';

/// Terms of Service Screen for GLOROV Botanical E-Commerce
/// Matches website terms of service, statutory GST 0% agricultural seed exemptions (HSN 1209),
/// and contains explicit trademark application pending disclosure.
class TermsOfServiceScreen extends StatelessWidget {
  const TermsOfServiceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GlorovPolicyScaffold(
      currentTab: GlorovPolicyTab.terms,
      title: 'Terms of Botanical Service',
      subtitle:
          'Statutory agricultural guidelines, trademark notice, tax exemptions, and purchase conditions.',
      badgeText: 'STATUTORY COMPLIANCE & GOVERNANCE',
      badgeIcon: Icons.gavel_outlined,
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
                'Governing Law: Republic of India (Jurisdiction: Pune, Maharashtra)',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 10.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),

        // Section 1: Overview & Botanical Scope
        const PolicySection(
          icon: Icons.eco_outlined,
          title: '1. Overview & Botanical Product Scope',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Welcome to GLOROV Botanicals ("GLOROV", "we", "us", "our"). By downloading, browsing, or placing orders through our mobile application or website, you agree to comply with and be bound by these Terms of Service.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                'GLOROV is an online horticultural destination specializing exclusively in living plants (indoor houseplants, air-purifying foliage, and outdoor specimens) and certified organic seeds (desi vegetable seeds, heirloom flower seeds, and culinary herb seeds). In accordance with our organic ethos, our catalog strictly excludes synthetic chemical pesticides, toxic chemical fertilizers, and single-use packaging plastics.',
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

        // Section 2: Trademark & Brand Notice (Explicit Trademark Applied, Not Registered)
        const PolicySection(
          icon: Icons.copyright_outlined,
          title: '2. Trademark Notice & Proprietary Rights',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Please take note of the following statutory notice regarding intellectual property and brand identification:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyCalloutBox(
                icon: Icons.verified_outlined,
                title: 'GLOROV™ Trademark Notice (Application Pending / Not Registered)',
                text:
                    'GLOROV™ is a pending trademark for which registration application has been formally filed under the Trade Marks Act, 1999 with the Trade Marks Registry (Government of India). GLOROV is currently a trademark under application and is NOT yet a registered trademark (®). All brand marks, logos, typography, botanical photography, product titles, mobile application interfaces, and packaging trade dress remain proprietary to Glorov Botanicals and are legally protected under common law trademark rights and Indian intellectual property statutes.',
              ),
              Text(
                'No user or third party is permitted to replicate, scrape, distribute, or create derivative works using our brand assets, imagery, or seed descriptions without express prior written consent from GLOROV Botanicals.',
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

        // Section 3: Statutory GST 0% on Seeds (HSN 1209) vs Live Plants (HSN 0602)
        const PolicySection(
          icon: Icons.receipt_long_outlined,
          title: '3. Statutory GST Compliance & 0% Seed Exemption',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'GLOROV operates in full compliance with the Central Goods and Services Tax (CGST), Integrated GST (IGST), and State GST (SGST) regulations of India:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: '0% GST on Seeds for Sowing (HSN 1209):',
                description:
                    'All vegetable, herb, and flower seeds sold for agricultural or garden sowing are legally exempt from Goods and Services Tax (GST @ 0.00%) under Notification No. 02/2017-Central Tax (Rate). No GST is levied on seed purchases.',
              ),
              PolicyBulletPoint(
                label: 'Live Botanical Plants (HSN 0602):',
                description:
                    'Live potted houseplants, outdoor shrubs, and vegetative cuttings are billed with applicable statutory GST already included in the displayed item price.',
              ),
              PolicyBulletPoint(
                label: 'Itemized Tax Invoices:',
                description:
                    'Every order generates an itemized electronic invoice detailing respective HSN classifications and statutory tax allocations upon dispatch from our Pune nursery.',
              ),
            ],
          ),
        ),

        // Section 4: Pricing, Orders & COD Safety
        const PolicySection(
          icon: Icons.payment_outlined,
          title: '4. Payment Terms & COD Safety Guardrails',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'All product prices in the GLOROV application are listed in Indian Rupees (INR ₹). We accept payments via UPI (Google Pay, PhonePe, Paytm, BHIM), Net Banking, Credit/Debit cards, and Cash on Delivery (COD).',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Cash on Delivery (COD) Limit:',
                description:
                    'To protect delicate living botanical specimens from transit death resulting from courier refusal or non-acceptance, COD is available for orders up to a maximum value of ₹5,000. Orders exceeding ₹5,000 require prepaid digital settlement.',
              ),
              PolicyBulletPoint(
                label: 'Order Verification:',
                description:
                    'First-time COD orders may receive an automated WhatsApp confirmation prompt before dispatch from our Pune nursery hub.',
              ),
            ],
          ),
        ),

        // Section 5: Natural Variations & Horticultural Disclaimers
        const PolicySection(
          icon: Icons.nature_people_outlined,
          title: '5. Natural Variations & Horticultural Disclaimers',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Living plants are unique biological organisms rather than factory-manufactured uniform goods. Photographs shown in our catalog represent mature, healthy specimens cultivated under optimal Pune nursery greenhouse conditions.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Botanical Variations:',
                description:
                    'Natural differences in leaf variegation, stem branching, foliage density, and seasonal bud/flowering status are normal and celebrated biological characteristics.',
              ),
              PolicyBulletPoint(
                label: 'Seed Viability & Germination:',
                description:
                    'GLOROV seeds are tested for minimum 80% to 90% germination viability. Successful germination is influenced by customer environmental variables such as soil temperature, sowing depth, sunlight, and moisture discipline. Our botanical helpdesk provides free sowing guides and personalized advice.',
              ),
            ],
          ),
        ),

        // Section 6: Governing Law & Jurisdiction
        const PolicySection(
          icon: Icons.balance_outlined,
          title: '6. Governing Law & Jurisdiction',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'These Terms of Botanical Service are governed by and construed in accordance with the substantive laws of the Republic of India. Any legal dispute, claim, or controversy arising in connection with orders or app use shall be subject to the exclusive jurisdiction of the competent courts in Pune, Maharashtra.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.md),
              PolicyContactCard(
                title: 'Legal Entity & Corporate Inquiries',
                entity: 'GLOROV Botanicals',
                address: 'Pune Central Nursery Hub, Maharashtra 411001, India',
                email: 'support@glorov.in',
                phone: '+91 80870 87224',
              ),
            ],
          ),
        ),
      ],
    );
  }
}
