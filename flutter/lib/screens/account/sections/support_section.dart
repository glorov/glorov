import 'package:flutter/material.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_user_profile.dart';
import '../../../services/glorov_account_state.dart';
import '../glorov_account_screen.dart';

/// Customer Support Inquiries Section
class GlorovSupportSection extends StatefulWidget {
  final ValueChanged<GlorovAccountSection>? onNavigateSection;

  const GlorovSupportSection({
    super.key,
    this.onNavigateSection,
  });

  @override
  State<GlorovSupportSection> createState() => _GlorovSupportSectionState();
}

class _GlorovSupportSectionState extends State<GlorovSupportSection> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _orderRefController;
  late TextEditingController _messageController;

  String? _selectedTopic;
  bool _isSubmitting = false;
  String? _submittedTicketId;

  final List<String> _topics = [
    'Order Status & Transit Tracking',
    'Live Plant Health & Care Advice',
    'Damaged or Delayed Shipment',
    'Address or Order Change',
    'Seed Germination Inquiries',
    'Other Botanical Questions',
  ];

  @override
  void initState() {
    super.initState();
    final profile = GlorovAccountState.instance.profile;
    _nameController = TextEditingController(text: profile.displayName);
    _emailController = TextEditingController(text: profile.email);
    _orderRefController = TextEditingController();
    _messageController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _orderRefController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _submitInquiry() async {
    if (_formKey.currentState?.validate() ?? false) {
      if (_selectedTopic == null) {
        GlorovFeedback.showWarningToast(
          context,
          message: 'Please select an inquiry topic.',
        );
        return;
      }

      setState(() => _isSubmitting = true);

      // Brief local processing
      await Future.delayed(const Duration(milliseconds: 300));

      final ticketId = GlorovAccountState.instance.submitSupportTicket(
        name: _nameController.text.trim(),
        email: _emailController.text.trim(),
        topic: _selectedTopic!,
        orderReference: _orderRefController.text.trim().isNotEmpty
            ? _orderRefController.text.trim()
            : null,
        message: _messageController.text.trim(),
      );

      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _submittedTicketId = ticketId;
        });
        GlorovFeedback.showSuccessToast(
          context,
          message: 'Support Ticket #$ticketId generated successfully!',
        );
      }
    }
  }

  void _resetForm() {
    setState(() {
      _submittedTicketId = null;
      _messageController.clear();
      _orderRefController.clear();
      _selectedTopic = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        const Text(
          'Contact Customer Support & Botanical Care',
          style: TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.forestDark,
          ),
        ),
        const SizedBox(height: 2),
        const Text(
          'Have questions about your order, seed germination, or live plant acclimation? Our advisors are here to help.',
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),

        const SizedBox(height: AppSpacing.lg),

        // Demonstration Disclaimer Banner
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: AppColors.sage.withAlpha(25),
            borderRadius: AppRadii.roundedMd,
            border: Border.all(color: AppColors.sage.withAlpha(80)),
          ),
          child: const Row(
            children: [
              Icon(Icons.info_outline, color: AppColors.forestMedium, size: 20),
              SizedBox(width: AppSpacing.sm),
              Expanded(
                child: Text(
                  'Simulated Demonstration Form: GLOROV is currently operating in frontend demonstration mode. Submitting this form creates a local support ticket and adds a simulated notification to your account without sending real emails.',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 12,
                    color: AppColors.forestDark,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.xl),

        // Content: Success Card or Form
        if (_submittedTicketId != null)
          _buildSuccessCard()
        else
          _buildSupportForm(),
      ],
    );
  }

  Widget _buildSuccessCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.xxl),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 10,
            offset: Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          const GlorovAnimatedCheck(
            size: 52,
            color: AppColors.forestDark,
            autoPlay: true,
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'Inquiry Received Successfully!',
            style: TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 20,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.cream,
              borderRadius: AppRadii.roundedFull,
              border: Border.all(color: AppColors.borderLight),
            ),
            child: Text(
              'Ticket Reference: $_submittedTicketId',
              style: const TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDark,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: const Text(
              'Thank you for reaching out to the GLOROV Botanical Care Team. In production, our horticulturists reply within 24 hours. A confirmation notification has been logged to your Notification Center.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 13,
                height: 1.5,
                color: AppColors.textSecondary,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              GlorovButton.outlined(
                label: 'Submit Another Inquiry',
                onPressed: _resetForm,
              ),
              if (widget.onNavigateSection != null) ...[
                const SizedBox(width: AppSpacing.md),
                GlorovButton.primary(
                  label: 'Back to Account Overview',
                  onPressed: () =>
                      widget.onNavigateSection!(GlorovAccountSection.overview),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSupportForm() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.xl),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Row: Name and Email
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: _buildTextField(
                    controller: _nameController,
                    label: 'Full Name *',
                    hint: 'Ananya Sharma',
                    validator: GlorovUserProfile.validateName,
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  child: _buildTextField(
                    controller: _emailController,
                    label: 'Email Address *',
                    hint: 'ananya.sharma@example.com',
                    keyboardType: TextInputType.emailAddress,
                    validator: GlorovUserProfile.validateEmail,
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            // Row: Topic and Order Ref
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 6,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Inquiry Topic *',
                        style: TextStyle(
                          fontFamily: AppTypography.primaryFont,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 6),
                      DropdownButtonFormField<String>(
                        initialValue: _selectedTopic,
                        hint: const Text('Select an inquiry topic...',
                            style: TextStyle(
                                fontSize: 13, color: AppColors.textMuted)),
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
                          enabledBorder: OutlineInputBorder(
                            borderRadius: AppRadii.roundedMd,
                            borderSide:
                                BorderSide(color: AppColors.borderLight),
                          ),
                        ),
                        items: _topics.map((t) {
                          return DropdownMenuItem(
                            value: t,
                            child:
                                Text(t, style: const TextStyle(fontSize: 13)),
                          );
                        }).toList(),
                        onChanged: (val) =>
                            setState(() => _selectedTopic = val),
                        validator: (val) =>
                            val == null ? 'Please select a topic' : null,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.lg),
                Expanded(
                  flex: 5,
                  child: _buildTextField(
                    controller: _orderRefController,
                    label: 'Order Reference (Optional)',
                    hint: 'e.g. GLR-ORD-2026-8812',
                  ),
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.md),

            // Message Field with Character Counter
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Your Message or Question *',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${_messageController.text.length} / 500',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                TextFormField(
                  controller: _messageController,
                  maxLines: 5,
                  maxLength: 500,
                  buildCounter: (_,
                          {required currentLength,
                          maxLength,
                          required isFocused}) =>
                      null,
                  onChanged: (_) => setState(() {}),
                  style: const TextStyle(
                      fontSize: 13, color: AppColors.textPrimary),
                  decoration: const InputDecoration(
                    hintText:
                        'Please describe your inquiry, symptoms of plant stress, germination progress, or transit concern...',
                    hintStyle:
                        TextStyle(color: AppColors.textMuted, fontSize: 13),
                    filled: true,
                    fillColor: AppColors.cream,
                    contentPadding: EdgeInsets.all(14),
                    border: OutlineInputBorder(
                      borderRadius: AppRadii.roundedMd,
                      borderSide: BorderSide(color: AppColors.borderLight),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: AppRadii.roundedMd,
                      borderSide: BorderSide(color: AppColors.borderLight),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: AppRadii.roundedMd,
                      borderSide:
                          BorderSide(color: AppColors.forestDark, width: 1.5),
                    ),
                  ),
                  validator: (v) {
                    if (v == null || v.trim().isEmpty) {
                      return 'Message is required';
                    }
                    if (v.trim().length < 10) {
                      return 'Please provide at least 10 characters';
                    }
                    return null;
                  },
                ),
              ],
            ),

            const SizedBox(height: AppSpacing.xl),

            // Submit Button
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                GlorovShakeButton(
                  isValid: (_formKey.currentState?.validate() ?? false) &&
                      _selectedTopic != null,
                  onPressed: _submitInquiry,
                  onInvalidPress: () => GlorovFeedback.showWarningToast(
                    context,
                    message: _selectedTopic == null
                        ? 'Please select an inquiry topic.'
                        : 'Please complete all required fields.',
                  ),
                  builder: (context, handlePressed) => GlorovButton.primary(
                    onPressed: handlePressed,
                    isLoading: _isSubmitting,
                    leadingIcon: const Icon(Icons.send, size: 16),
                    label: 'Submit Demonstration Inquiry',
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
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
              hintStyle:
                  const TextStyle(color: AppColors.textMuted, fontSize: 13),
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
