import 'package:flutter/material.dart';
import '../../../core/interactions/interactions.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_radii.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../models/glorov/glorov_address.dart';
import '../../../services/glorov_cart_state.dart';
import '../dialogs/address_form_dialog.dart';

/// Address Book Management Section
class GlorovAddressBookSection extends StatelessWidget {
  const GlorovAddressBookSection({super.key});

  void _openAddAddressDialog(BuildContext context) {
    GlorovAddressFormDialog.show(
      context,
      onSave: (newAddress) {
        GlorovCartState.instance.addAddress(newAddress);
        GlorovFeedback.showSuccessToast(
          context,
          message: 'Address added to your address book.',
        );
      },
    );
  }

  void _openEditAddressDialog(BuildContext context, GlorovAddress address) {
    GlorovAddressFormDialog.show(
      context,
      address: address,
      onSave: (updatedAddress) {
        GlorovCartState.instance.updateAddress(updatedAddress);
        GlorovFeedback.showSuccessToast(
          context,
          message: 'Address updated successfully.',
        );
      },
    );
  }

  void _confirmDeleteAddress(BuildContext context, GlorovAddress address) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: const RoundedRectangleBorder(borderRadius: AppRadii.roundedLg),
        title: const Row(
          children: [
            Icon(Icons.delete_outline, color: AppColors.error, size: 22),
            SizedBox(width: 8),
            Text(
              'Delete Address?',
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 18,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        content: Text(
          'Are you sure you want to remove "${address.label} - ${address.city}" from your delivery addresses? This action cannot be undone.',
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
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
              GlorovCartState.instance.deleteAddress(address.id);
              GlorovFeedback.showInfoToast(
                context,
                message: 'Address removed from your address book.',
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: GlorovCartState.instance,
      builder: (context, _) {
        final addresses = GlorovCartState.instance.addresses;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Row (Responsive for all device sizes)
            LayoutBuilder(
              builder: (context, constraints) {
                final isCompact = constraints.maxWidth < 540;

                final titleColumn = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Delivery Address Book',
                      style: TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                        color: AppColors.forestDark,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${addresses.length} saved destination${addresses.length == 1 ? '' : 's'} for botanical shipments.',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 12,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                );

                final addBtn = ElevatedButton.icon(
                  onPressed: () => _openAddAddressDialog(context),
                  icon: const Icon(Icons.add, size: 16),
                  label: const Text('Add New Address'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDark,
                    foregroundColor: Colors.white,
                    shape: const RoundedRectangleBorder(
                        borderRadius: AppRadii.roundedMd),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 10),
                    textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700),
                  ),
                );

                if (isCompact) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      titleColumn,
                      const SizedBox(height: AppSpacing.sm),
                      addBtn,
                    ],
                  );
                }

                return Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(child: titleColumn),
                    const SizedBox(width: AppSpacing.md),
                    addBtn,
                  ],
                );
              },
            ),

            const SizedBox(height: AppSpacing.xl),

            // Content: Empty State or Address Cards
            if (addresses.isEmpty)
              _buildEmptyState(context)
            else
              _buildAddressGrid(context, addresses),
          ],
        );
      },
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 48, horizontal: 24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderLight),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              color: AppColors.cream,
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.location_off_outlined,
              size: 40,
              color: AppColors.forestMedium,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          const Text(
            'No Saved Addresses Yet',
            style: TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 6),
          const Text(
            'Add your home or office address to enable 1-click transit selection during checkout.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          ElevatedButton.icon(
            onPressed: () => _openAddAddressDialog(context),
            icon: const Icon(Icons.add, size: 16),
            label: const Text('Add Your First Address'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDark,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                  borderRadius: AppRadii.roundedMd),
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressGrid(
      BuildContext context, List<GlorovAddress> addresses) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isTwoCol = constraints.maxWidth > 700;
        final cardWidth = isTwoCol
            ? (constraints.maxWidth - AppSpacing.lg) / 2
            : constraints.maxWidth;

        return Wrap(
          spacing: AppSpacing.lg,
          runSpacing: AppSpacing.lg,
          children: addresses.map((addr) {
            return SizedBox(
              width: cardWidth,
              child: _addressCard(context, addr),
            );
          }).toList(),
        );
      },
    );
  }

  Widget _addressCard(BuildContext context, GlorovAddress addr) {
    final isDefault = addr.isDefault;

    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(
          color: isDefault ? AppColors.forestDark : AppColors.borderLight,
          width: isDefault ? 1.5 : 1.0,
        ),
        boxShadow: const [
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Badges Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.cream,
                      borderRadius: AppRadii.roundedSm,
                      border: Border.all(color: AppColors.borderLight),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          addr.label.toLowerCase() == 'work'
                              ? Icons.work_outline
                              : Icons.home_outlined,
                          size: 13,
                          color: AppColors.forestDark,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          addr.label.toUpperCase(),
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: AppColors.forestDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isDefault) ...[
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: const BoxDecoration(
                        color: AppColors.forestDark,
                        borderRadius: AppRadii.roundedSm,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check, size: 11, color: Colors.white),
                          SizedBox(width: 4),
                          Text(
                            'DEFAULT',
                            style: TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: Colors.white,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert, size: 20),
                onSelected: (value) {
                  if (value == 'edit') {
                    _openEditAddressDialog(context, addr);
                  } else if (value == 'default') {
                    GlorovCartState.instance.setDefaultAddress(addr.id);
                  } else if (value == 'delete') {
                    _confirmDeleteAddress(context, addr);
                  }
                },
                itemBuilder: (ctx) => [
                  if (!isDefault)
                    const PopupMenuItem(
                      value: 'default',
                      child: Row(
                        children: [
                          Icon(Icons.star_outline, size: 16),
                          SizedBox(width: 8),
                          Text('Set as Default'),
                        ],
                      ),
                    ),
                  const PopupMenuItem(
                    value: 'edit',
                    child: Row(
                      children: [
                        Icon(Icons.edit_outlined, size: 16),
                        SizedBox(width: 8),
                        Text('Edit Address'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'delete',
                    child: Row(
                      children: [
                        Icon(Icons.delete_outline,
                            size: 16, color: AppColors.error),
                        SizedBox(width: 8),
                        Text('Delete',
                            style: TextStyle(color: AppColors.error)),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Recipient & Phone
          Text(
            addr.fullName,
            style: const TextStyle(
              fontFamily: AppTypography.displayFont,
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.forestDark,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '+91 ${addr.phoneNumber}',
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 12,
              color: AppColors.textSecondary,
            ),
          ),

          const SizedBox(height: AppSpacing.sm),

          // Address Line
          Text(
            addr.formattedAddress,
            style: const TextStyle(
              fontFamily: AppTypography.primaryFont,
              fontSize: 13,
              height: 1.5,
              color: AppColors.textPrimary,
            ),
          ),

          const SizedBox(height: AppSpacing.md),
          const Divider(color: AppColors.borderLight, height: 1),
          const SizedBox(height: AppSpacing.sm),

          // Footer Actions
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (!isDefault)
                TextButton(
                  onPressed: () {
                    GlorovCartState.instance.setDefaultAddress(addr.id);
                    GlorovFeedback.showSuccessToast(
                      context,
                      message: 'Default delivery address set to ${addr.label}.',
                    );
                  },
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.forestMedium,
                    padding: EdgeInsets.zero,
                  ),
                  child: const Text(
                    'Set as Default',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                )
              else
                const Text(
                  'Primary Shipping Target',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 11,
                    color: AppColors.textMuted,
                  ),
                ),
              Row(
                children: [
                  TextButton.icon(
                    onPressed: () => _openEditAddressDialog(context, addr),
                    icon: const Icon(Icons.edit_outlined, size: 14),
                    label: const Text('Edit', style: TextStyle(fontSize: 12)),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.forestDark,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => _confirmDeleteAddress(context, addr),
                    icon: const Icon(Icons.delete_outline,
                        size: 14, color: AppColors.error),
                    label: const Text('Delete',
                        style: TextStyle(fontSize: 12, color: AppColors.error)),
                    style: TextButton.styleFrom(
                      foregroundColor: AppColors.error,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
