import 'package:flutter/material.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../route/route_constants.dart';
import '../../../services/glorov_account_state.dart';
import '../../../services/glorov_logistics_service.dart';
import '../glorov_account_screen.dart';

/// Customer Account Settings & Local Preferences Section
class GlorovSettingsSection extends StatelessWidget {
  final ValueChanged<GlorovAccountSection>? onNavigateSection;

  const GlorovSettingsSection({
    super.key,
    this.onNavigateSection,
  });

  void _confirmSignOut(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
        title: const Row(
          children: [
            Icon(Icons.logout_rounded, color: AppColors.forestDark, size: 24),
            SizedBox(width: 8),
            Text(
              'Sign Out?',
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        content: const Text(
          'Are you sure you want to sign out of your GLOROV customer account? Your saved cart and orders will be preserved upon re-authenticating.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textSecondary,
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
            ),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(ctx).pop();
              await GlorovAccountState.instance.logout();
              if (context.mounted) {
                GlorovFeedback.showSuccessToast(
                  context,
                  message: 'You have been signed out.',
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDark,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final newPasswordController = TextEditingController();
    final confirmPasswordController = TextEditingController();
    bool isLoading = false;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
          title: const Row(
            children: [
              Icon(Icons.password_rounded,
                  color: AppColors.forestDark, size: 24),
              SizedBox(width: 8),
              Text(
                'Change Password',
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Enter your new password below. It must be at least 8 characters long.',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: newPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'New Password',
                    prefixIcon: Icon(Icons.lock_outline, size: 20),
                  ),
                  validator: (val) {
                    if (val == null || val.length < 8) {
                      return 'Must be at least 8 characters';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: AppSpacing.md),
                TextFormField(
                  controller: confirmPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Confirm Password',
                    prefixIcon: Icon(Icons.lock_outline, size: 20),
                  ),
                  validator: (val) {
                    if (val != newPasswordController.text) {
                      return 'Passwords do not match';
                    }
                    return null;
                  },
                ),
              ],
            ),
          ),
          actions: [
            OutlinedButton(
              onPressed: isLoading ? null : () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: isLoading
                  ? null
                  : () async {
                      if (!formKey.currentState!.validate()) return;
                      setDialogState(() => isLoading = true);

                      final result = await GlorovAccountState.instance
                          .updatePassword(newPasswordController.text);

                      if (ctx.mounted) {
                        Navigator.of(ctx).pop();
                        if (result.isSuccess) {
                          GlorovFeedback.showSuccessToast(
                            context,
                            message: 'Password updated successfully.',
                          );
                        } else {
                          GlorovFeedback.showErrorToast(
                            context,
                            message: result.errorOrNull ??
                                'Failed to update password.',
                          );
                        }
                      }
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forestDark,
                foregroundColor: Colors.white,
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: Colors.white,
                      ),
                    )
                  : const Text('Update Password'),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmResetDemoAccount(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.error, size: 24),
            SizedBox(width: 8),
            Text(
              'Reset Demonstration Data?',
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        content: const Text(
          'This will clear your local shopping cart, saved addresses, wishlist, simulated orders, and customized profile, restoring the initial GLOROV factory demo baseline.\n\nThis cannot be undone.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
        ),
        actions: [
          OutlinedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.textSecondary,
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
            ),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              GlorovAccountState.instance.resetEntireDemoAccount();
              GlorovFeedback.showWarningToast(
                context,
                message: 'Demonstration account restored to initial defaults.',
              );
              if (onNavigateSection != null) {
                onNavigateSection!(GlorovAccountSection.overview);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
            ),
            child: const Text('Reset All Data'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GlorovAccountState.instance,
      builder: (context, _) {
        final state = GlorovAccountState.instance;
        final settings = state.settings;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            const Text(
              'Account Settings & Preferences',
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDark,
              ),
            ),
            const SizedBox(height: 2),
            const Text(
              'Manage your notification channels, language, measurement units, and demo data.',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                color: AppColors.textSecondary,
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Card 1: Notifications
            _sectionCard(
              title: 'Botanical Notification Preferences',
              subtitle:
                  'Control communication channels for order status and horticultural guides.',
              children: [
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  activeThumbColor: AppColors.forestDark,
                  title: const Text(
                    'Order Status & Transit Tracking Updates',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  subtitle: const Text(
                    'Receive status alerts when seedlings are packed and transit courier is assigned.',
                    style:
                        TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  value: settings.emailNotifications,
                  onChanged: (val) {
                    state.updateSettings(
                      settings.copyWith(emailNotifications: val),
                    );
                    GlorovFeedback.showSuccessToast(
                      context,
                      message: val
                          ? 'Order transit updates enabled.'
                          : 'Order transit updates disabled.',
                    );
                  },
                ),
                const Divider(color: AppColors.borderLight),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  activeThumbColor: AppColors.forestDark,
                  title: const Text(
                    'Monsoon & Seasonal Sowing Guidance',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  subtitle: const Text(
                    'Receive monthly planting tips tailored to Indian climate seasons and rainfall.',
                    style:
                        TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  value: settings.seasonalGardeningAlerts,
                  onChanged: (val) {
                    state.updateSettings(
                      settings.copyWith(seasonalGardeningAlerts: val),
                    );
                    GlorovFeedback.showSuccessToast(
                      context,
                      message: val
                          ? 'Seasonal sowing guidance enabled.'
                          : 'Seasonal sowing guidance disabled.',
                    );
                  },
                ),
                const Divider(color: AppColors.borderLight),
                SwitchListTile(
                  contentPadding: EdgeInsets.zero,
                  activeThumbColor: AppColors.forestDark,
                  title: const Text(
                    'Exclusive Cultivar Drops & Member Offers',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  subtitle: const Text(
                    'Early notifications for rare heirloom seed launches and seasonal discounts.',
                    style:
                        TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  value: settings.promotionalAlerts,
                  onChanged: (val) {
                    state.updateSettings(
                      settings.copyWith(promotionalAlerts: val),
                    );
                    GlorovFeedback.showSuccessToast(
                      context,
                      message: val
                          ? 'Cultivar drop alerts enabled.'
                          : 'Cultivar drop alerts disabled.',
                    );
                  },
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Card 2: Language & Regional Preferences
            _sectionCard(
              title: 'Language & Measurement Standards',
              subtitle:
                  'Tailor botanical measurements and UI language preferences.',
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Preferred Language',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: settings.preferredLanguage,
                            decoration: const InputDecoration(
                              filled: true,
                              fillColor: AppColors.cream,
                              contentPadding: EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              border: OutlineInputBorder(
                                borderRadius: AppRadii.roundedMd,
                                borderSide:
                                    BorderSide(color: AppColors.borderLight),
                              ),
                            ),
                            items: ['English', 'Hindi', 'Kannada', 'Marathi']
                                .map((l) => DropdownMenuItem(
                                      value: l,
                                      child: Text(l,
                                          style: const TextStyle(fontSize: 13)),
                                    ))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) {
                                state.updateSettings(
                                  settings.copyWith(preferredLanguage: val),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.lg),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Measurement Units',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            initialValue: settings.measurementUnits,
                            decoration: const InputDecoration(
                              filled: true,
                              fillColor: AppColors.cream,
                              contentPadding: EdgeInsets.symmetric(
                                  horizontal: 14, vertical: 12),
                              border: OutlineInputBorder(
                                borderRadius: AppRadii.roundedMd,
                                borderSide:
                                    BorderSide(color: AppColors.borderLight),
                              ),
                            ),
                            items: [
                              'Metric (cm, ml, °C)',
                              'Imperial (in, oz, °F)',
                            ]
                                .map((u) => DropdownMenuItem(
                                      value: u,
                                      child: Text(u,
                                          style: const TextStyle(fontSize: 13)),
                                    ))
                                .toList(),
                            onChanged: (val) {
                              if (val != null) {
                                state.updateSettings(
                                  settings.copyWith(measurementUnits: val),
                                );
                              }
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Card 3: Privacy, Policies & Trademark
            _sectionCard(
              title: 'Legal Documents, Trust & Trademark',
              subtitle: 'Statutory compliance, DPDP 2023, and brand IP.',
              children: [
                const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.shield_outlined,
                        color: AppColors.forestMedium, size: 20),
                    SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Text(
                        'GLOROV is built on a privacy-respecting botanical foundation. All transactions, personal shipping details, and seed viability guarantees comply with Indian statutory frameworks.',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 13,
                          height: 1.5,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    borderRadius: AppRadii.roundedMd,
                    border: Border.all(color: AppColors.borderLight),
                  ),
                  child: const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.verified_outlined,
                              size: 16, color: AppColors.forestDeep),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'GLOROV™ Trademark Notice (Application Pending)',
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.forestDeep,
                              ),
                            ),
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(
                        'The GLOROV mark has been formally filed under the Trade Marks Act, 1999 (Republic of India) and is currently pending registration (Not registered ®). All brand assets, curated plant photography, and seed descriptions are proprietary.',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 11,
                          height: 1.4,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                _policyTile(
                  context,
                  title: 'Privacy Policy',
                  subtitle: 'DPDP Act 2023 compliance & zero ad data sale',
                  icon: Icons.lock_outline,
                  route: privacyPolicyScreenRoute,
                ),
                const Divider(color: AppColors.borderLight, height: 16),
                _policyTile(
                  context,
                  title: 'Terms of Service',
                  subtitle: 'Statutory 0% GST on seeds (HSN 1209) & conditions',
                  icon: Icons.gavel_outlined,
                  route: termsOfServicesScreenRoute,
                ),
                const Divider(color: AppColors.borderLight, height: 16),
                _policyTile(
                  context,
                  title: 'Shipping, Transit & Trust Policy',
                  subtitle:
                      'Safe transit packaging & 48h live arrival guarantee',
                  icon: Icons.local_shipping_outlined,
                  route: shippingAndTrustPolicyScreenRoute,
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Card 4: Customer Authentication & Session
            _sectionCard(
              title: 'Customer Authentication & Session',
              subtitle:
                  'Manage your active GLOROV account session and credentials.',
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
                      backgroundColor: state.isAuthenticated
                          ? AppColors.success.withAlpha(40)
                          : AppColors.borderLight,
                      child: Icon(
                        state.isAuthenticated
                            ? Icons.verified_user_rounded
                            : Icons.person_outline,
                        color: state.isAuthenticated
                            ? AppColors.success
                            : AppColors.textSecondary,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            state.isAuthenticated
                                ? 'Signed In (${state.profile.email})'
                                : 'Guest Session',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            state.isAuthenticated
                                ? 'Authenticated via Medusa customer authentication token.'
                                : 'Currently browsing as a guest. Sign in to access your saved orders.',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    if (state.isAuthenticated) ...[
                      OutlinedButton(
                        onPressed: () => _showChangePasswordDialog(context),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.forestDark,
                          side: const BorderSide(color: AppColors.forestMedium),
                          shape: const RoundedRectangleBorder(
                            borderRadius: AppRadii.roundedMd,
                          ),
                        ),
                        child: const Text('Change Password'),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      ElevatedButton(
                        onPressed: () => _confirmSignOut(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.forestDark,
                          foregroundColor: Colors.white,
                          shape: const RoundedRectangleBorder(
                            borderRadius: AppRadii.roundedMd,
                          ),
                        ),
                        child: const Text('Sign Out'),
                      ),
                    ] else ...[
                      ElevatedButton(
                        onPressed: () {
                          Navigator.pushNamed(context, logInScreenRoute);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.forestDark,
                          foregroundColor: Colors.white,
                          shape: const RoundedRectangleBorder(
                            borderRadius: AppRadii.roundedMd,
                          ),
                        ),
                        child: const Text('Sign In / Register'),
                      ),
                    ],
                  ],
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.lg),

            // Card 5: Logistics & Courier Dashboard Connection Status
            ListenableBuilder(
              listenable: GlorovLogisticsService.instance,
              builder: (context, _) {
                final isConnected =
                    GlorovLogisticsService.instance.isLogisticsConnected;

                return _sectionCard(
                  title: 'Logistics & Courier Dashboard Connection',
                  subtitle:
                      'Admin control for third-party courier aggregator (Shiprocket / Delhivery / Bluedart).',
                  children: [
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: isConnected
                            ? const Color(0xFFF0FDF4)
                            : const Color(0xFFFFF7ED),
                        borderRadius: AppRadii.roundedMd,
                        border: Border.all(
                          color: isConnected
                              ? const Color(0xFF86EFAC)
                              : const Color(0xFFFDBA74),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isConnected
                                ? Icons.cloud_done_outlined
                                : Icons.cloud_off_outlined,
                            size: 20,
                            color: isConnected
                                ? const Color(0xFF16A34A)
                                : const Color(0xFFEA580C),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  isConnected
                                      ? 'Logistics Service: Connected & Active'
                                      : 'Logistics Service: Not Connected in Dashboard',
                                  style: TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: isConnected
                                        ? const Color(0xFF15803D)
                                        : const Color(0xFF9A3412),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  isConnected
                                      ? 'Active air and surface courier corridors are enabled for postal delivery estimation.'
                                      : 'When disconnected, all postal code checks display: "Delivery service currently not available on this location."',
                                  style: TextStyle(
                                    fontFamily: AppTypography.primaryFont,
                                    fontSize: 12,
                                    color: isConnected
                                        ? const Color(0xFF166534)
                                        : const Color(0xFFC2410C),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    SwitchListTile(
                      contentPadding: EdgeInsets.zero,
                      activeThumbColor: AppColors.forestDark,
                      title: const Text(
                        'Connect Logistics Provider',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      subtitle: const Text(
                        'Toggle integration with courier aggregator in the store dashboard.',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      value: isConnected,
                      onChanged: (val) {
                        GlorovLogisticsService.instance
                            .setLogisticsConnected(val);
                        GlorovFeedback.showSuccessToast(
                          context,
                          message: val
                              ? 'Logistics service connected in dashboard.'
                              : 'Logistics service disconnected. Availability checks will report unserviceable.',
                        );
                      },
                    ),
                  ],
                );
              },
            ),

            const SizedBox(height: AppSpacing.lg),

            // Card 6: Danger Zone / Reset Demo
            Container(
              padding: const EdgeInsets.all(AppSpacing.xl),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedLg,
                border: Border.all(color: AppColors.error.withAlpha(80)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.error.withAlpha(20),
                      borderRadius: AppRadii.roundedMd,
                    ),
                    child: const Icon(
                      Icons.restore_page_outlined,
                      color: AppColors.error,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.lg),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Reset Demo Data & Local Storage',
                          style: TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.forestDark,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Clear all simulated orders, customized addresses, and restored cart items to start testing with a fresh state.',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () => _confirmResetDemoAccount(context),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                      foregroundColor: Colors.white,
                      shape: const RoundedRectangleBorder(
                          borderRadius: AppRadii.roundedMd),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 11),
                    ),
                    child: const Text('Reset Demo Data'),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _sectionCard({
    required String title,
    required String subtitle,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          ...children,
        ],
      ),
    );
  }

  Widget _policyTile(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required String route,
  }) {
    return InkWell(
      onTap: () => Navigator.pushNamed(context, route),
      borderRadius: AppRadii.roundedMd,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          children: [
            CircleAvatar(
              radius: 16,
              backgroundColor: AppColors.surfaceCream,
              child: Icon(icon, size: 16, color: AppColors.forestDeep),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_right,
              size: 18,
              color: AppColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}
