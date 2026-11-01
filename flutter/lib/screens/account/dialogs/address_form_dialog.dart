import 'package:flutter/material.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_address.dart';

/// Reusable Botanical Address Form Dialog for Adding & Editing Delivery Addresses
class GlorovAddressFormDialog extends StatefulWidget {
  final GlorovAddress? initialAddress;
  final ValueChanged<GlorovAddress> onSave;

  const GlorovAddressFormDialog({
    super.key,
    this.initialAddress,
    required this.onSave,
  });

  static Future<GlorovAddress?> show(
    BuildContext context, {
    GlorovAddress? address,
    required ValueChanged<GlorovAddress> onSave,
  }) {
    return showDialog<GlorovAddress>(
      context: context,
      barrierDismissible: false,
      builder: (context) => GlorovAddressFormDialog(
        initialAddress: address,
        onSave: onSave,
      ),
    );
  }

  @override
  State<GlorovAddressFormDialog> createState() =>
      _GlorovAddressFormDialogState();
}

class _GlorovAddressFormDialogState extends State<GlorovAddressFormDialog> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _pincodeController;
  late TextEditingController _landmarkController;

  String _label = 'Home';
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    final addr = widget.initialAddress;
    _nameController = TextEditingController(text: addr?.fullName ?? '');
    _phoneController = TextEditingController(text: addr?.phoneNumber ?? '');
    _addressController = TextEditingController(text: addr?.addressLine ?? '');
    _cityController = TextEditingController(text: addr?.city ?? '');
    _stateController = TextEditingController(text: addr?.state ?? '');
    _pincodeController = TextEditingController(text: addr?.pincode ?? '');
    _landmarkController = TextEditingController(text: addr?.landmark ?? '');
    _label = addr?.label ?? 'Home';
    _isDefault = addr?.isDefault ?? false;
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _pincodeController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  void _autofillSample() {
    setState(() {
      _nameController.text = GlorovAddress.sample.fullName;
      _phoneController.text = GlorovAddress.sample.phoneNumber;
      _addressController.text = GlorovAddress.sample.addressLine;
      _cityController.text = GlorovAddress.sample.city;
      _stateController.text = GlorovAddress.sample.state;
      _pincodeController.text = GlorovAddress.sample.pincode;
      _landmarkController.text = GlorovAddress.sample.landmark ?? '';
      _label = 'Home';
    });
  }

  void _submit() {
    if (_formKey.currentState?.validate() ?? false) {
      final address = GlorovAddress(
        id: widget.initialAddress?.id ??
            'addr_${DateTime.now().millisecondsSinceEpoch}',
        fullName: _nameController.text.trim(),
        phoneNumber: _phoneController.text.trim(),
        addressLine: _addressController.text.trim(),
        city: _cityController.text.trim(),
        state: _stateController.text.trim(),
        pincode: _pincodeController.text.trim(),
        landmark: _landmarkController.text.trim().isNotEmpty
            ? _landmarkController.text.trim()
            : null,
        label: _label,
        isDefault: _isDefault,
      );

      widget.onSave(address);
      Navigator.of(context).pop(address);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEditing = widget.initialAddress != null;

    return Dialog(
      shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
      elevation: 8,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 540),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppColors.sage.withAlpha(50),
                            borderRadius: AppRadii.roundedSm,
                          ),
                          child: const Icon(
                            Icons.location_on_outlined,
                            color: AppColors.forestDark,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Text(
                          isEditing
                              ? 'Edit Delivery Address'
                              : 'Add New Address',
                          style: const TextStyle(
                            fontFamily: AppTypography.displayFont,
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                            color: AppColors.forestDark,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                      color: AppColors.textSecondary,
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.sm),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Ensure PIN code and phone number are accurate for transit.',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (!isEditing)
                      TextButton.icon(
                        onPressed: _autofillSample,
                        icon: const Icon(Icons.flash_on, size: 14),
                        label: const Text('Autofill Sample',
                            style: TextStyle(fontSize: 11)),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.forestMedium,
                          padding: EdgeInsets.zero,
                        ),
                      ),
                  ],
                ),

                const SizedBox(height: AppSpacing.lg),

                // Address Label Selector (Home / Work / Other)
                const Text(
                  'Address Label',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.xs),
                Wrap(
                  spacing: AppSpacing.sm,
                  children: ['Home', 'Work', 'Other'].map((lbl) {
                    final isSelected = _label == lbl;
                    return ChoiceChip(
                      label: Text(lbl),
                      selected: isSelected,
                      selectedColor: AppColors.forestDark,
                      backgroundColor: AppColors.cream,
                      labelStyle: TextStyle(
                        color:
                            isSelected ? Colors.white : AppColors.textPrimary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _label = lbl);
                      },
                    );
                  }).toList(),
                ),

                const SizedBox(height: AppSpacing.md),

                // Recipient Name & Phone
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 6,
                      child: _buildTextField(
                        controller: _nameController,
                        label: 'Recipient Full Name *',
                        hint: 'Ananya Sharma',
                        validator: (v) => v == null || v.trim().isEmpty
                            ? 'Name is required'
                            : null,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      flex: 5,
                      child: _buildTextField(
                        controller: _phoneController,
                        label: '10-Digit Mobile *',
                        hint: '9876543210',
                        keyboardType: TextInputType.phone,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'Phone is required';
                          }
                          final clean = v.replaceAll(RegExp(r'\D'), '');
                          if (clean.length < 10) {
                            return 'Enter 10-digit number';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                // Street Address Line
                _buildTextField(
                  controller: _addressController,
                  label: 'Flat / House No. / Street Address *',
                  hint: 'Flat 402, Green Meadows, 12th Main Road',
                  validator: (v) => v == null || v.trim().isEmpty
                      ? 'Street address is required'
                      : null,
                ),

                const SizedBox(height: AppSpacing.md),

                // Landmark (Optional)
                _buildTextField(
                  controller: _landmarkController,
                  label: 'Nearby Landmark (Optional)',
                  hint: 'Near Botanical Garden Gate / Metro Pillar 24',
                ),

                const SizedBox(height: AppSpacing.md),

                // City, State, PIN code
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      flex: 4,
                      child: _buildTextField(
                        controller: _cityController,
                        label: 'City *',
                        hint: 'Bengaluru',
                        validator: (v) => v == null || v.trim().isEmpty
                            ? 'City is required'
                            : null,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      flex: 4,
                      child: _buildTextField(
                        controller: _stateController,
                        label: 'State *',
                        hint: 'Karnataka',
                        validator: (v) => v == null || v.trim().isEmpty
                            ? 'State is required'
                            : null,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      flex: 3,
                      child: _buildTextField(
                        controller: _pincodeController,
                        label: 'PIN Code *',
                        hint: '560038',
                        keyboardType: TextInputType.number,
                        validator: (v) {
                          if (v == null || v.trim().isEmpty) {
                            return 'PIN required';
                          }
                          if (v.trim().length != 6) {
                            return '6 digits';
                          }
                          return null;
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: AppSpacing.md),

                // Default Address Checkbox
                CheckboxListTile(
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  activeColor: AppColors.forestDark,
                  title: const Text(
                    'Make this my default delivery address',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  value: _isDefault,
                  onChanged: (val) => setState(() => _isDefault = val ?? false),
                ),

                const SizedBox(height: AppSpacing.lg),

                // Action Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    GlorovButton.outlined(
                      label: 'Cancel',
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    GlorovShakeButton(
                      isValid: _formKey.currentState?.validate() ?? false,
                      onPressed: _submit,
                      onInvalidPress: () => GlorovFeedback.showWarningToast(
                        context,
                        message: 'Please fill in all required address fields.',
                      ),
                      builder: (context, handlePressed) => GlorovButton.primary(
                        label: isEditing ? 'Save Changes' : 'Add Address',
                        onPressed: handlePressed,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
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
        const SizedBox(height: 4),
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
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
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
