import 'package:flutter/material.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_user_profile.dart';
import '../../../services/glorov_account_state.dart';

/// Customer Profile Management Section
class GlorovProfileSection extends StatefulWidget {
  const GlorovProfileSection({super.key});

  @override
  State<GlorovProfileSection> createState() => _GlorovProfileSectionState();
}

class _GlorovProfileSectionState extends State<GlorovProfileSection> {
  bool _isEditing = false;
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;

  @override
  void initState() {
    super.initState();
    final profile = GlorovAccountState.instance.profile;
    _nameController = TextEditingController(text: profile.displayName);
    _emailController = TextEditingController(text: profile.email);
    _phoneController = TextEditingController(text: profile.phoneNumber);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _startEditing() {
    final profile = GlorovAccountState.instance.profile;
    _nameController.text = profile.displayName;
    _emailController.text = profile.email;
    _phoneController.text = profile.phoneNumber;
    setState(() => _isEditing = true);
  }

  void _cancelEditing() {
    setState(() => _isEditing = false);
  }

  void _saveProfile() {
    if (_formKey.currentState?.validate() ?? false) {
      final current = GlorovAccountState.instance.profile;
      final updated = current.copyWith(
        displayName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        phoneNumber: _phoneController.text.trim(),
      );

      GlorovAccountState.instance.updateProfile(updated);
      setState(() => _isEditing = false);

      GlorovFeedback.showSuccessToast(
        context,
        message: 'Demonstration profile updated successfully!',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GlorovAccountState.instance,
      builder: (context, _) {
        final profile = GlorovAccountState.instance.profile;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Title & Status (Responsive)
            LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 480;

                final titleColumn = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Customer Profile',
                      style: TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.forestDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    const Text(
                      'Manage your personal botanical club information and contact details.',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                );

                final editBtn = !_isEditing
                    ? ElevatedButton.icon(
                        onPressed: _startEditing,
                        icon: const Icon(Icons.edit, size: 14),
                        label: const Text('Edit Profile'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.forestDark,
                          foregroundColor: Colors.white,
                          shape: const RoundedRectangleBorder(
                              borderRadius: AppRadii.roundedMd),
                          padding: const EdgeInsets.symmetric(
                              horizontal: 14, vertical: 9),
                          textStyle: const TextStyle(
                              fontSize: 12, fontWeight: FontWeight.w700),
                        ),
                      )
                    : const SizedBox.shrink();

                if (isCompact) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      titleColumn,
                      if (!_isEditing) ...[
                        const SizedBox(height: AppSpacing.sm),
                        editBtn,
                      ],
                    ],
                  );
                }

                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: titleColumn),
                    if (!_isEditing) ...[
                      const SizedBox(width: AppSpacing.md),
                      editBtn,
                    ],
                  ],
                );
              },
            ),

            const SizedBox(height: AppSpacing.lg),

            // Demo Badge Notice
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.sage.withAlpha(25),
                borderRadius: AppRadii.roundedMd,
                border: Border.all(color: AppColors.sage.withAlpha(70)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.verified_user_outlined,
                      color: AppColors.forestMedium, size: 20),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: RichText(
                      text: const TextSpan(
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          color: AppColors.forestDark,
                          height: 1.4,
                        ),
                        children: [
                          TextSpan(
                            text: 'Demonstration Account: ',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          TextSpan(
                            text:
                                'This profile is preconfigured for frontend evaluation. Form edits persist in your browser localStorage without requiring SMS OTP or external auth servers.',
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: AppSpacing.xl),

            // Main Card (View or Edit)
            Container(
              padding: const EdgeInsets.all(AppSpacing.xl),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedLg,
                border: Border.all(color: AppColors.borderLight),
              ),
              child: _isEditing ? _buildEditForm() : _buildProfileView(profile),
            ),
          ],
        );
      },
    );
  }

  Widget _buildProfileView(GlorovUserProfile profile) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Avatar Header
        Row(
          children: [
            CircleAvatar(
              radius: 36,
              backgroundColor: AppColors.sage,
              child: Text(
                profile.initials,
                style: const TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: AppColors.forestDark,
                ),
              ),
            ),
            const SizedBox(width: AppSpacing.lg),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  profile.displayName,
                  style: const TextStyle(
                    fontFamily: AppTypography.displayFont,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDark,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.forestDark.withAlpha(15),
                    borderRadius: AppRadii.roundedFull,
                  ),
                  child: Text(
                    profile.membershipTier,
                    style: const TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.forestDark,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),

        const SizedBox(height: AppSpacing.xl),
        const Divider(color: AppColors.borderLight),
        const SizedBox(height: AppSpacing.lg),

        // Field Grid
        _infoRow(
          label: 'Full Name',
          value: profile.displayName,
          icon: Icons.person_outline,
        ),
        const SizedBox(height: AppSpacing.md),
        _infoRow(
          label: 'Email Address',
          value: profile.email,
          icon: Icons.email_outlined,
        ),
        const SizedBox(height: AppSpacing.md),
        _infoRow(
          label: 'Mobile Phone',
          value: '+91 ${profile.phoneNumber}',
          icon: Icons.phone_android_outlined,
        ),
        const SizedBox(height: AppSpacing.md),
        _infoRow(
          label: 'Member Since',
          value: profile.memberSince,
          icon: Icons.calendar_today_outlined,
        ),
        const SizedBox(height: AppSpacing.md),
        _infoRow(
          label: 'Account Status',
          value: 'Demo Verified • Complete Local Access',
          icon: Icons.check_circle_outline,
          isHighlight: true,
        ),
      ],
    );
  }

  Widget _buildEditForm() {
    return Form(
      key: _formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Edit Profile Information',
            style: TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),

          // Name field
          _buildTextField(
            controller: _nameController,
            label: 'Display Name *',
            hint: 'Ananya Sharma',
            icon: Icons.person_outline,
            validator: GlorovUserProfile.validateName,
          ),

          const SizedBox(height: AppSpacing.md),

          // Email field
          _buildTextField(
            controller: _emailController,
            label: 'Email Address *',
            hint: 'ananya.sharma@example.com',
            icon: Icons.email_outlined,
            keyboardType: TextInputType.emailAddress,
            validator: GlorovUserProfile.validateEmail,
          ),

          const SizedBox(height: AppSpacing.md),

          // Phone field
          _buildTextField(
            controller: _phoneController,
            label: 'Mobile Phone (10 Digits) *',
            hint: '9876543210',
            icon: Icons.phone_android_outlined,
            keyboardType: TextInputType.phone,
            validator: GlorovUserProfile.validatePhone,
          ),

          const SizedBox(height: AppSpacing.xl),

          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              GlorovButton.outlined(
                label: 'Cancel',
                onPressed: _cancelEditing,
              ),
              const SizedBox(width: AppSpacing.md),
              GlorovShakeButton(
                isValid: _formKey.currentState?.validate() ?? false,
                onPressed: _saveProfile,
                onInvalidPress: () => GlorovFeedback.showWarningToast(
                  context,
                  message: 'Please review the errors in your profile details.',
                ),
                builder: (context, handlePressed) => GlorovButton.primary(
                  label: 'Save Changes',
                  leadingIcon: const Icon(Icons.check, size: 16),
                  onPressed: handlePressed,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _infoRow({
    required String label,
    required String value,
    required IconData icon,
    bool isHighlight = false,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: AppColors.forestMedium),
        const SizedBox(width: AppSpacing.md),
        SizedBox(
          width: 140,
          child: Text(
            label,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: AppColors.textSecondary,
            ),
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isHighlight ? AppColors.forestDark : AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 6),
        InputFocus(
          borderRadius: AppRadii.roundedMd,
          scale: GlorovInteractionConfig.focusScale,
          elevation: GlorovInteractionConfig.focusElevation,
          shadowColor: AppColors.forestDeep.withValues(alpha: 0.12),
          duration: GlorovInteractionConfig.durationFast,
          child: TextFormField(
            controller: controller,
            keyboardType: keyboardType,
            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
            decoration: InputDecoration(
              hintText: hint,
              prefixIcon: Icon(icon, size: 18, color: AppColors.forestMedium),
              filled: true,
              fillColor: AppColors.cream,
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: const OutlineInputBorder(
                borderRadius: AppRadii.roundedMd,
                borderSide: BorderSide(color: AppColors.borderLight),
              ),
              enabledBorder: const OutlineInputBorder(
                borderRadius: AppRadii.roundedMd,
                borderSide: BorderSide(color: AppColors.borderLight),
              ),
              focusedBorder: const OutlineInputBorder(
                borderRadius: AppRadii.roundedMd,
                borderSide: BorderSide(color: AppColors.forestDark, width: 1.5),
              ),
            ),
            validator: validator,
          ),
        ),
      ],
    );
  }
}
