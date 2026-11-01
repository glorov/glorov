import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../route/route_constants.dart';
import 'glorov_policy_layout.dart';
import 'privacy_policy_screen.dart';

/// Shipping, Safe Transit & Botanical Trust Policy Screen
/// Combines safe transit protocols, 48-hour live arrival guarantee,
/// perishable non-return rules, and certified seed germination viability warranty.
class ShippingAndTrustPolicyScreen extends StatelessWidget {
  const ShippingAndTrustPolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return GlorovPolicyScaffold(
      currentTab: GlorovPolicyTab.shippingAndTrust,
      title: 'Shipping, Transit & Trust Policy',
      subtitle:
          'Safe botanical transit protocols, 48-hour live plant guarantee, and certified seed germination warranty.',
      badgeText: 'PAN-INDIA BOTANICAL LOGISTICS & TRUST',
      badgeIcon: Icons.local_shipping_outlined,
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
                'Dispatch Hub: Pune Central Nursery Hub, Maharashtra (PIN 411001)',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 10.5,
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),

        // Section 1: Pune Nursery Dispatch Protocols
        const PolicySection(
          icon: Icons.yard_outlined,
          title: '1. Pune Nursery Dispatch Protocols',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'At GLOROV, living botanicals and organic seeds require synchronized climate preparation before shipping. Unlike inert manufactured goods, living plants must never remain stranded in transit facilities:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Monday through Thursday Live Plant Dispatches:',
                description:
                    'Living potted houseplants and outdoor plants are dispatched exclusively Monday through Thursday. This guarantees specimens do not linger in weekend transit courier sorting hubs.',
              ),
              PolicyBulletPoint(
                label: '24–48 Hour Nursery Conditioning:',
                description:
                    'Every specimen undergoes root saturation, foliar health inspection, and organic pest screening before custom packaging at our Pune nursery hub (PIN 411001).',
              ),
              PolicyBulletPoint(
                label: 'Seeds Dispatches (Monday–Saturday):',
                description:
                    'Organic vegetable, flower, and herb seeds are dispatched 6 days a week within 24 hours of order confirmation.',
              ),
            ],
          ),
        ),

        // Callout: Moisture-Shield Packaging
        const PolicyCalloutBox(
          icon: Icons.water_drop_outlined,
          title: 'Moisture-Shield & Root Hydration Packaging',
          text:
              'Every living specimen is packed using coco-peat moisture retention wraps that lock in hydration for up to 7 days, encased in ventilated corrugated cartons that permit foliage respiration while preventing courier impact damage.',
        ),

        // Section 2: Shipping Rates & Delivery SLAs
        PolicySection(
          icon: Icons.timer_outlined,
          title: '2. Shipping Rates & Delivery Timeframes',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'We partner with premier express logistics carriers (Delhivery, Bluedart Air, and Shiprocket) to provide swift, temperature-conscious delivery across India:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              _buildShippingTable(),
            ],
          ),
        ),

        // Section 3: The 48-Hour Live Plant Arrival Guarantee
        const PolicySection(
          icon: Icons.verified_user_outlined,
          title: '3. The 48-Hour Live Plant Arrival Guarantee',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'We take deep pride in cultivating vibrant specimens. However, live plants can occasionally suffer thermal distress or branch breakage during transit.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                'If your plant arrives dead on arrival (DOA), suffering severe stem fracture, or irreversible root damage, you are protected under our unconditional 48-Hour Live Arrival Guarantee:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Free Immediate Replacement:',
                description:
                    'We dispatch a healthy replacement specimen directly from our Pune nursery at zero extra plant or courier charge.',
              ),
              PolicyBulletPoint(
                label: '100% Refund / Store Credit:',
                description:
                    'If the seasonal plant cultivar is out of stock, an immediate full refund is processed to your original payment method.',
              ),
            ],
          ),
        ),

        // Callout: Simple 2-photo WhatsApp claim
        const PolicyCalloutBox(
          icon: Icons.camera_alt_outlined,
          title: 'How to Submit a Botanical Replacement Claim in 4 Hours:',
          text:
              'Within 48 hours of delivery, take 2 clear photographs of the damaged plant and outer courier packaging label. Send them via WhatsApp to +91 80870 87224 or email support@glorov.in with your Order ID. Our horticulturists verify and approve claims within 4 business hours.',
        ),

        // Section 4: Perishable Policy (No Reverse Shipping Required)
        const PolicySection(
          icon: Icons.sentiment_satisfied_alt_outlined,
          title: '4. Perishable Botanical Policy (No Physical Return Required)',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Unlike electronics or clothing, returning a distressed living plant via reverse courier transit will inevitably result in the death of the specimen due to prolonged darkness and double handling.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                'Therefore, GLOROV does NOT require you to package and return the living plant. Once your photo claim is verified, we process your replacement or refund immediately.',
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

        // Section 5: Seed Viability & Germination Guarantee
        const PolicySection(
          icon: Icons.spa_outlined,
          title: '5. Seed Viability & Germination Warranty',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'All GLOROV seeds are indigenous (desi), open-pollinated, 100% non-GMO, and tested for minimum 80% to 90% germination rates under standard horticultural moisture conditions:',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              PolicyBulletPoint(
                label: 'Hermetically Sealed Foil Packaging:',
                description:
                    'Seeds are triple-layer aluminum hermetically packed to protect botanical embryo viability from atmospheric humidity and light.',
              ),
              PolicyBulletPoint(
                label: 'Germination Shield Guarantee:',
                description:
                    'If you follow our included sowing instructions and experience zero germination within the specified timeframe (typically 7–14 days), notify our nursery team for free replacement seeds and customized soil guidance.',
              ),
            ],
          ),
        ),

        // Section 6: Order Cancellation & Refund Timelines
        const PolicySection(
          icon: Icons.currency_rupee_outlined,
          title: '6. Order Cancellation & Refund Timelines',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'You may cancel any order before it is packed and assigned an Air Waybill (AWB) at our Pune nursery hub for a 100% immediate refund with zero cancellation fee.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.sm),
              Text(
                'Once handed over to the air courier, live shipments cannot be halted mid-transit, and are fully protected under our 48-Hour Live Plant Arrival Guarantee upon receipt.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              SizedBox(height: AppSpacing.md),
              PolicyBulletPoint(
                label: 'UPI & Net Banking Refunds:',
                description:
                    'Credited to your bank account within 24 to 48 hours.',
              ),
              PolicyBulletPoint(
                label: 'Credit & Debit Cards:',
                description:
                    'Settled in 3 to 5 business days according to your card-issuing bank.',
              ),
              PolicyBulletPoint(
                label: 'Cash on Delivery (COD) Refunds:',
                description:
                    'Transferred via instant UPI or NEFT upon customer providing payment details.',
              ),
            ],
          ),
        ),

        // Section 7: Live Tracking & Support Links
        PolicySection(
          icon: Icons.track_changes_outlined,
          title: '7. Live Order Tracking & Support',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'As soon as your parcel is dispatched from our Pune nursery, you will receive real-time SMS and email alerts containing your courier Air Waybill (AWB) number and direct live tracking link.',
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  height: 1.5,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Wrap(
                spacing: AppSpacing.md,
                runSpacing: AppSpacing.sm,
                children: [
                  ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pushNamed(context, ordersScreenRoute);
                    },
                    icon: const Icon(Icons.local_shipping_outlined, size: 16),
                    label: const Text('Track My Plant Shipment'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.forestDeep,
                      foregroundColor: Colors.white,
                      shape: const RoundedRectangleBorder(
                        borderRadius: AppRadii.roundedMd,
                      ),
                    ),
                  ),
                  OutlinedButton.icon(
                    onPressed: () {
                      Navigator.pushNamed(context, contactSupportScreenRoute);
                    },
                    icon: const Icon(Icons.headset_mic_outlined, size: 16),
                    label: const Text('Contact Nursery Support Desk'),
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
              const SizedBox(height: AppSpacing.lg),
              const PolicyContactCard(
                title: 'Horticultural Dispatch & Claims Desk',
                entity: 'GLOROV Botanicals',
                address: 'Pune Central Nursery Hub, Maharashtra 411001, India',
                email: 'support@glorov.in',
                phone: '+91 80870 87224 (WhatsApp & Voice)',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildShippingTable() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedMd,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
            color: AppColors.forestDark,
            child: const Row(
              children: [
                Expanded(
                  flex: 3,
                  child: Text(
                    'Category',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Order Value',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                Expanded(
                  flex: 2,
                  child: Text(
                    'Shipping',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
                Expanded(
                  flex: 3,
                  child: Text(
                    'Estimated Transit',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
          _tableRow(
            category: 'Seeds & Accessories',
            orderValue: 'Above ₹499',
            shipping: 'FREE',
            shippingColor: AppColors.success,
            transit: '2–4 Business Days',
            isAlt: false,
          ),
          const Divider(height: 1, color: AppColors.borderLight),
          _tableRow(
            category: 'Seeds & Accessories',
            orderValue: 'Below ₹499',
            shipping: '₹49 Flat',
            shippingColor: AppColors.textPrimary,
            transit: '2–4 Business Days',
            isAlt: true,
          ),
          const Divider(height: 1, color: AppColors.borderLight),
          _tableRow(
            category: 'Live Potted Plants',
            orderValue: 'Orders > ₹999',
            shipping: 'FREE Air',
            shippingColor: AppColors.success,
            transit: '2–3 Business Days',
            isAlt: false,
          ),
          const Divider(height: 1, color: AppColors.borderLight),
          _tableRow(
            category: 'Live Potted Plants',
            orderValue: 'Standard',
            shipping: '₹99 Express',
            shippingColor: AppColors.textPrimary,
            transit: '2–3 Business Days',
            isAlt: true,
          ),
        ],
      ),
    );
  }

  Widget _tableRow({
    required String category,
    required String orderValue,
    required String shipping,
    required Color shippingColor,
    required String transit,
    required bool isAlt,
  }) {
    return Container(
      color: isAlt ? AppColors.surfaceCream : Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: Text(
              category,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 10.5,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              orderValue,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 10.5,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Expanded(
            flex: 2,
            child: Text(
              shipping,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 10.5,
                fontWeight: FontWeight.w700,
                color: shippingColor,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              transit,
              style: const TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 10.5,
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
