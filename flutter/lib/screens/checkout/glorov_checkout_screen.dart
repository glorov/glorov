import 'package:flutter/material.dart';
import '../../components/cart/glorov_order_summary.dart';
import '../../components/navigation/glorov_footer.dart';
import '../../components/navigation/glorov_storefront_scaffold.dart';
import '../../components/responsive/glorov_responsive.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_breakpoints.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_shadows.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';
import '../../models/glorov/glorov_address.dart';
import '../../models/glorov/glorov_delivery_option.dart';
import '../../models/glorov/glorov_payment_method.dart';
import '../../repositories/glorov_repositories.dart';
import '../../route/route_constants.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';
import '../account/dialogs/address_form_dialog.dart';

/// GLOROV Simulated Checkout Page
/// Complete multi-step frontend order demonstration including address form,
/// transit speed options, demonstration payment methods, and live summary recalculation.
class GlorovCheckoutScreen extends StatefulWidget {
  const GlorovCheckoutScreen({super.key});

  @override
  State<GlorovCheckoutScreen> createState() => _GlorovCheckoutScreenState();
}

class _GlorovCheckoutScreenState extends State<GlorovCheckoutScreen> {
  final _formKey = GlobalKey<FormState>();

  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _addressController;
  late TextEditingController _cityController;
  late TextEditingController _stateController;
  late TextEditingController _pincodeController;
  late TextEditingController _landmarkController;

  GlorovPaymentMethod _selectedPayment = GlorovPaymentMethod.cod;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    final initial = GlorovCartState.instance.selectedAddress;
    final hasValidAddress = initial.isValid && initial.fullName.isNotEmpty;
    _nameController = TextEditingController(text: hasValidAddress ? initial.fullName : '');
    _phoneController = TextEditingController(text: hasValidAddress ? initial.phoneNumber : '');
    _addressController = TextEditingController(text: hasValidAddress ? initial.addressLine : '');
    _cityController = TextEditingController(text: hasValidAddress ? initial.city : '');
    _stateController = TextEditingController(text: hasValidAddress ? initial.state : '');
    _pincodeController = TextEditingController(text: hasValidAddress ? initial.pincode : '');
    _landmarkController = TextEditingController(text: hasValidAddress ? (initial.landmark ?? '') : '');
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

  void _applyAddress(GlorovAddress addr) {
    setState(() {
      _nameController.text = addr.fullName;
      _phoneController.text = addr.phoneNumber;
      _addressController.text = addr.addressLine;
      _cityController.text = addr.city;
      _stateController.text = addr.state;
      _pincodeController.text = addr.pincode;
      _landmarkController.text = addr.landmark ?? '';
    });
  }

  GlorovAddress _buildCurrentAddress() {
    return GlorovAddress(
      fullName: _nameController.text.trim(),
      phoneNumber: _phoneController.text.trim(),
      addressLine: _addressController.text.trim(),
      city: _cityController.text.trim(),
      state: _stateController.text.trim(),
      pincode: _pincodeController.text.trim(),
      landmark: _landmarkController.text.trim().isNotEmpty
          ? _landmarkController.text.trim()
          : null,
    );
  }

  Future<void> _handlePlaceOrder() async {
    if (_isSubmitting) return;

    final cartState = GlorovCartState.instance;

    if (cartState.items.isEmpty) {
      GlorovFeedback.showWarningToast(
        context,
        message: 'Cannot checkout with an empty bag.',
      );
      return;
    }

    if (!_formKey.currentState!.validate()) {
      GlorovFeedback.showErrorToast(
        context,
        message: 'Please correct the errors in the delivery address.',
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final address = _buildCurrentAddress();
      final deliveryOption = cartState.selectedDeliveryOption;

      final order = await GlorovRepositories.orders.placeOrder(
        items: cartState.items,
        address: address,
        deliveryOption: deliveryOption,
        paymentMethod: _selectedPayment,
        subtotal: cartState.subtotal,
        shippingCost: cartState.shippingCost,
        discountAmount: cartState.promoDiscountAmount,
        appliedCoupon: cartState.appliedPromoCode,
        totalAmount: cartState.total,
      );

      if (mounted) {
        setState(() => _isSubmitting = false);
        Navigator.pushReplacementNamed(
          context,
          thanksForOrderScreenRoute,
          arguments: order,
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitting = false);
        final errorMsg = e.toString().replaceAll('Exception: ', '');
        GlorovFeedback.showErrorToast(
          context,
          message: 'Failed to complete order: $errorMsg',
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDesktop = AppBreakpoints.isDesktop(context);

    return GlorovStorefrontScaffold(
      backgroundColor: AppColors.surfaceCream,
      currentRoute: checkoutScreenRoute,
      showBottomNav: false,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildBreadcrumbs(context),
          GlorovContainer(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.lg,
            ),
            child: ListenableBuilder(
              listenable: Listenable.merge([
                GlorovCartState.instance,
                GlorovAccountState.instance,
              ]),
              builder: (context, _) {
                if (!GlorovAccountState.instance.isAuthenticated) {
                  return _buildAuthRequiredState(context);
                }

                final items = GlorovCartState.instance.items;

                if (items.isEmpty && !_isSubmitting) {
                  return _buildEmptyState(context);
                }

                return isDesktop
                    ? _buildDesktopLayout(context)
                    : _buildMobileLayout(context);
              },
            ),
          ),
          const SizedBox(height: AppSpacing.xxl),
          const GlorovFooter(),
        ],
      ),
    );
  }

  Widget _buildBreadcrumbs(BuildContext context) {
    return Container(
      width: double.infinity,
      color: AppColors.surfacePure,
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.lg,
        vertical: AppSpacing.sm,
      ),
      child: GlorovContainer(
        padding: EdgeInsets.zero,
        child: Row(
          children: [
            InkWell(
              onTap: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  Navigator.pushReplacementNamed(context, cartScreenRoute);
                }
              },
              borderRadius: BorderRadius.circular(4),
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.arrow_back_ios,
                        size: 11, color: AppColors.forestDark),
                    SizedBox(width: 4),
                    Text(
                      'Back',
                      style: TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: AppColors.forestDark,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 8),
              child: Text(
                '|',
                style: TextStyle(
                  color: AppColors.borderSubtle,
                  fontSize: 13,
                ),
              ),
            ),
            InkWell(
              onTap: () {
                if (Navigator.canPop(context)) {
                  Navigator.popUntil(context, (route) => route.isFirst);
                } else {
                  Navigator.pushReplacementNamed(context, homeScreenRoute);
                }
              },
              child: const Text('Home',
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
            ),
            const Icon(Icons.chevron_right,
                size: 14, color: AppColors.textMuted),
            InkWell(
              onTap: () {
                if (Navigator.canPop(context)) {
                  Navigator.pop(context);
                } else {
                  Navigator.pushReplacementNamed(context, cartScreenRoute);
                }
              },
              child: const Text('Shopping Bag',
                  style: TextStyle(fontSize: 13, color: AppColors.textMuted)),
            ),
            const Icon(Icons.chevron_right,
                size: 14, color: AppColors.textMuted),
            const Text(
              'Checkout',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.forestDeep,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDesktopLayout(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Left Column: Forms & Options (62%)
        Expanded(
          flex: 13,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStepTitle('1. Delivery Address'),
              _buildAddressForm(),
              const SizedBox(height: AppSpacing.xl),
              _buildStepTitle('2. Delivery Speed & Packaging'),
              _buildDeliveryOptions(),
              const SizedBox(height: AppSpacing.xl),
              _buildStepTitle('3. Payment Method (Demonstration)'),
              _buildPaymentOptions(),
              const SizedBox(height: AppSpacing.xl),
              _buildStepTitle('4. Review Items in Bag'),
              _buildOrderItemsReview(),
            ],
          ),
        ),

        const SizedBox(width: AppSpacing.xl),

        // Right Column: Order Summary (38%)
        Expanded(
          flex: 8,
          child: GlorovOrderSummary(
            isCheckoutScreen: true,
            checkoutButtonText:
                _isSubmitting ? 'CONFIRMING ORDER...' : 'CONFIRM & PLACE ORDER',
            onCheckoutPressed: _isSubmitting ? null : _handlePlaceOrder,
          ),
        ),
      ],
    );
  }

  Widget _buildMobileLayout(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildStepTitle('1. Delivery Address'),
        _buildAddressForm(),
        const SizedBox(height: AppSpacing.lg),
        _buildStepTitle('2. Delivery Speed & Packaging'),
        _buildDeliveryOptions(),
        const SizedBox(height: AppSpacing.lg),
        _buildStepTitle('3. Payment Method (Demonstration)'),
        _buildPaymentOptions(),
        const SizedBox(height: AppSpacing.lg),
        _buildStepTitle('4. Review Items in Bag'),
        _buildOrderItemsReview(),
        const SizedBox(height: AppSpacing.xl),
        GlorovOrderSummary(
          isCheckoutScreen: true,
          checkoutButtonText:
              _isSubmitting ? 'CONFIRMING ORDER...' : 'CONFIRM & PLACE ORDER',
          onCheckoutPressed: _isSubmitting ? null : _handlePlaceOrder,
        ),
      ],
    );
  }

  Widget _buildStepTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.sm),
      child: Text(
        title,
        style: const TextStyle(
          fontFamily: AppTypography.primaryFont,
          fontSize: 18,
          fontWeight: FontWeight.w800,
          color: AppColors.forestDeep,
        ),
      ),
    );
  }

  // -------------------------------------------------------------
  // Step 1: Address Form
  // -------------------------------------------------------------
  Widget _buildAddressForm() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isMobile = constraints.maxWidth < 600;

        return Container(
          padding: EdgeInsets.all(isMobile ? AppSpacing.md : AppSpacing.lg),
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.card,
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Clean Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.location_on_outlined,
                            size: 18, color: AppColors.forestDeep),
                        SizedBox(width: 6),
                        Text(
                          'Delivery Address',
                          style: TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.forestDeep,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.sage.withAlpha(40),
                        borderRadius: AppRadii.roundedFull,
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.lock_outline,
                              size: 11, color: AppColors.forestDark),
                          SizedBox(width: 4),
                          Text(
                            'Secure Transit',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDark,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                // Saved Addresses Selector (Only shown if user actually has saved addresses)
                if (GlorovCartState.instance.addresses.isNotEmpty) ...[
                  const Text(
                    'Choose Saved Delivery Address',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.xs,
                    children: [
                      ...GlorovCartState.instance.addresses.map((addr) {
                        final isSelected = _addressController.text.trim() ==
                            addr.addressLine.trim();
                        return ChoiceChip(
                          label: Text('${addr.label} (${addr.city})'),
                          selected: isSelected,
                          selectedColor: AppColors.forestDark,
                          backgroundColor: AppColors.cream,
                          labelStyle: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : AppColors.textPrimary,
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                          ),
                          onSelected: (val) {
                            if (val) {
                              _applyAddress(addr);
                            }
                          },
                        );
                      }),
                      ActionChip(
                        avatar: const Icon(Icons.add,
                            size: 14, color: AppColors.forestDark),
                        label: const Text('+ Add New',
                            style: TextStyle(
                                fontSize: 11, fontWeight: FontWeight.w600)),
                        backgroundColor: Colors.white,
                        side: const BorderSide(color: AppColors.borderLight),
                        onPressed: () {
                          GlorovAddressFormDialog.show(
                            context,
                            onSave: (newAddr) {
                              GlorovCartState.instance.addAddress(newAddr);
                              _applyAddress(newAddr);
                            },
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  const Divider(color: AppColors.borderLight, height: 1),
                  const SizedBox(height: AppSpacing.md),
                ],

                // Form Fields: Ergonomic Single Column & 2-Col for Mobile vs Spaced for Desktop
                if (isMobile) ...[
                  // 1. Full Name (Full width on mobile)
                  TextFormField(
                    controller: _nameController,
                    textInputAction: TextInputAction.next,
                    decoration:
                        _inputDecoration('Full Name *', 'Recipient full name'),
                    validator: (val) => val == null || val.trim().isEmpty
                        ? 'Enter recipient name'
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // 2. Mobile Phone (Full width on mobile)
                  TextFormField(
                    controller: _phoneController,
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.next,
                    decoration: _inputDecoration(
                        '10-Digit Mobile Phone *', '10-digit mobile number'),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'Enter mobile number';
                      }
                      final clean = val.replaceAll(RegExp(r'\D'), '');
                      if (clean.length < 10) return 'Must be 10 digits';
                      return null;
                    },
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // 3. Street Address Line (Full width)
                  TextFormField(
                    controller: _addressController,
                    textInputAction: TextInputAction.next,
                    decoration: _inputDecoration(
                      'Flat, House No., Street Address *',
                      'House / flat no., building, street',
                    ),
                    validator: (val) => val == null || val.trim().isEmpty
                        ? 'Enter street address'
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // 4. Compact Row: PIN Code + City (fits cleanly on 375px+ phones)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 5,
                        child: TextFormField(
                          controller: _pincodeController,
                          keyboardType: TextInputType.number,
                          textInputAction: TextInputAction.next,
                          maxLength: 6,
                          decoration:
                              _inputDecoration('PIN Code *', '6-digit PIN')
                                  .copyWith(counterText: ''),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Enter PIN';
                            }
                            if (val.trim().length != 6) return '6 digits';
                            return null;
                          },
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        flex: 6,
                        child: TextFormField(
                          controller: _cityController,
                          textInputAction: TextInputAction.next,
                          decoration:
                              _inputDecoration('City *', 'City / District'),
                          validator: (val) => val == null || val.trim().isEmpty
                              ? 'Enter city'
                              : null,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),

                  // 5. Compact Row: State + Landmark (Optional)
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        flex: 5,
                        child: TextFormField(
                          controller: _stateController,
                          textInputAction: TextInputAction.next,
                          decoration: _inputDecoration('State *', 'State'),
                          validator: (val) => val == null || val.trim().isEmpty
                              ? 'Enter state'
                              : null,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        flex: 6,
                        child: TextFormField(
                          controller: _landmarkController,
                          textInputAction: TextInputAction.done,
                          decoration: _inputDecoration(
                              'Landmark (Optional)', 'Nearby landmark'),
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  // Tablet / Desktop Layout (Spacious Multi-Column)
                  Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _nameController,
                          decoration: _inputDecoration(
                              'Full Name *', 'Recipient full name'),
                          validator: (val) => val == null || val.trim().isEmpty
                              ? 'Enter recipient name'
                              : null,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        child: TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          decoration: _inputDecoration(
                              '10-Digit Mobile Phone *', '10-digit mobile number'),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Enter mobile number';
                            }
                            final clean = val.replaceAll(RegExp(r'\D'), '');
                            if (clean.length < 10) return 'Must be 10 digits';
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Street Address
                  TextFormField(
                    controller: _addressController,
                    decoration: _inputDecoration(
                      'Flat, Floor, House No., Building & Street *',
                      'Flat 402, Green Meadows, 12th Main',
                    ),
                    validator: (val) => val == null || val.trim().isEmpty
                        ? 'Enter street address'
                        : null,
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // City, State, PIN
                  Row(
                    children: [
                      Expanded(
                        flex: 5,
                        child: TextFormField(
                          controller: _cityController,
                          decoration: _inputDecoration('City *', 'City'),
                          validator: (val) => val == null || val.trim().isEmpty
                              ? 'Enter city'
                              : null,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        flex: 5,
                        child: TextFormField(
                          controller: _stateController,
                          decoration: _inputDecoration('State *', 'State'),
                          validator: (val) => val == null || val.trim().isEmpty
                              ? 'Enter state'
                              : null,
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        flex: 4,
                        child: TextFormField(
                          controller: _pincodeController,
                          keyboardType: TextInputType.number,
                          maxLength: 6,
                          decoration: _inputDecoration('PIN Code *', '6 digits')
                              .copyWith(counterText: ''),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Enter PIN';
                            }
                            if (val.trim().length != 6) return 'Must be 6 digits';
                            return null;
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),

                  // Landmark
                  TextFormField(
                    controller: _landmarkController,
                    decoration: _inputDecoration('Nearby Landmark (Optional)',
                        'Near City Botanical Garden'),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );
  }

  // -------------------------------------------------------------
  // Step 2: Delivery Options
  // -------------------------------------------------------------
  Widget _buildDeliveryOptions() {
    final currentOption = GlorovCartState.instance.selectedDeliveryOption;
    final subtotal = GlorovCartState.instance.subtotal;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        children: GlorovDeliveryOption.values.map((opt) {
          final isSelected = currentOption == opt;
          final cost = opt.calculateCost(subtotal);

          return InkWell(
            onTap: () {
              GlorovCartState.instance.setDeliveryOption(opt);
            },
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                border: opt == GlorovDeliveryOption.standard
                    ? const Border(
                        bottom: BorderSide(color: AppColors.borderSubtle))
                    : null,
                color: isSelected
                    ? AppColors.mintSurface.withValues(alpha: 0.5)
                    : null,
              ),
              child: Row(
                children: [
                  Radio<GlorovDeliveryOption>(
                    value: opt,
                    groupValue: currentOption,
                    activeColor: AppColors.forestDeep,
                    onChanged: (val) {
                      if (val != null) {
                        GlorovCartState.instance.setDeliveryOption(val);
                      }
                    },
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(
                              opt.title,
                              style: const TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.forestDeep,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              cost == 0
                                  ? 'FREE'
                                  : '₹${cost.toStringAsFixed(0)}',
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 14,
                                fontWeight: FontWeight.w800,
                                color: cost == 0
                                    ? AppColors.forestDeep
                                    : AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          opt.subtitle,
                          style: const TextStyle(
                            fontFamily: AppTypography.primaryFont,
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  // -------------------------------------------------------------
  // Step 3: Payment Options
  // -------------------------------------------------------------
  Widget _buildPaymentOptions() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        children: [
          // Simulated Demonstration Notice
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md, vertical: 8),
            decoration: const BoxDecoration(
              color: AppColors.mintBadge,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(AppRadii.lg),
                topRight: Radius.circular(AppRadii.lg),
              ),
            ),
            child: const Row(
              children: [
                Icon(Icons.info_outline, size: 14, color: AppColors.forestDeep),
                SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Simulated Demonstration: No real money, payment gateway, or credentials required.',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.forestDeep,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Payment Options
          for (final method in GlorovPaymentMethod.values) ...[
            InkWell(
              onTap: () => setState(() => _selectedPayment = method),
              child: Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  border: method != GlorovPaymentMethod.card
                      ? const Border(
                          bottom: BorderSide(color: AppColors.borderSubtle))
                      : null,
                  color: _selectedPayment == method
                      ? AppColors.mintSurface.withValues(alpha: 0.5)
                      : null,
                ),
                child: Row(
                  children: [
                    Radio<GlorovPaymentMethod>(
                      value: method,
                      groupValue: _selectedPayment,
                      activeColor: AppColors.forestDeep,
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedPayment = val);
                      },
                    ),
                    const SizedBox(width: AppSpacing.xs),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            method.title,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: AppColors.forestDeep,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            method.subtitle,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  // -------------------------------------------------------------
  // Step 4: Order Items Preview
  // -------------------------------------------------------------
  Widget _buildOrderItemsReview() {
    final items = GlorovCartState.instance.items;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surfacePure,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
        boxShadow: AppShadows.card,
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${GlorovCartState.instance.itemCount} items in Bag',
                  style: const TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
                InkWell(
                  onTap: () => Navigator.pushNamed(context, cartScreenRoute),
                  child: const Text(
                    'Modify Bag',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestMedium,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSubtle),
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            separatorBuilder: (ctx, i) =>
                const Divider(height: 1, color: AppColors.borderSubtle),
            itemBuilder: (ctx, i) {
              final item = items[i];
              return Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: 10,
                ),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius: AppRadii.roundedSm,
                      child: Image.network(
                        item.product.primaryImage,
                        width: 44,
                        height: 44,
                        fit: BoxFit.cover,
                        errorBuilder: (ctx, err, stack) =>
                            const Icon(Icons.yard, color: AppColors.sage),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.product.title,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          Text(
                            '${item.variant?.name ?? "Standard"}  •  Qty: ${item.quantity}',
                            style: const TextStyle(
                              fontFamily: AppTypography.primaryFont,
                              fontSize: 11,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      '₹${item.totalPrice.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontFamily: AppTypography.primaryFont,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.forestDeep,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAuthRequiredState(BuildContext context) {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 40),
          padding: const EdgeInsets.all(AppSpacing.xl),
          decoration: BoxDecoration(
            color: AppColors.surfacePure,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
            boxShadow: AppShadows.card,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.sage.withAlpha(50),
                ),
                alignment: Alignment.center,
                child: const Icon(
                  Icons.lock_outline_rounded,
                  size: 32,
                  color: AppColors.forestDeep,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              const Text(
                'Sign In to Checkout',
                style: TextStyle(
                  fontFamily: AppTypography.displayFont,
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.forestDeep,
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              const Text(
                'To secure your botanical seeds and ensure live transit insurance, please sign in or register before completing your order.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontFamily: AppTypography.primaryFont,
                  fontSize: 13,
                  color: AppColors.textSecondary,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: AppSpacing.lg),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      logInScreenRoute,
                      arguments: {
                        'redirectTo': checkoutScreenRoute,
                        'reason':
                            'Please sign in to complete your checkout and secure your botanical order.',
                      },
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.forestDeep,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: const Text(
                    'SIGN IN TO CONTINUE',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {
                    Navigator.pushNamed(
                      context,
                      signUpScreenRoute,
                      arguments: {
                        'redirectTo': checkoutScreenRoute,
                        'reason':
                            'Create your account to complete checkout and secure your botanical order.',
                      },
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.forestDeep,
                    side: const BorderSide(color: AppColors.forestMedium),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(24),
                    ),
                  ),
                  child: const Text(
                    'CREATE NEW ACCOUNT',
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 40),
        child: Column(
          children: [
            const Icon(Icons.remove_shopping_cart_outlined,
                size: 54, color: AppColors.sage),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Your bag is empty',
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: AppColors.forestDeep,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            const Text(
              'Please add items to your cart before proceeding to checkout.',
              style: TextStyle(color: AppColors.textMuted),
            ),
            const SizedBox(height: AppSpacing.lg),
            ElevatedButton(
              onPressed: () =>
                  Navigator.pushNamed(context, discoverScreenRoute),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.forestDeep,
                foregroundColor: Colors.white,
              ),
              child: const Text('EXPLORE CATALOG'),
            ),
          ],
        ),
      ),
    );
  }

  InputDecoration _inputDecoration(String label, String hint) {
    return InputDecoration(
      labelText: label,
      labelStyle: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
      hintText: hint,
      hintStyle: const TextStyle(fontSize: 12, color: AppColors.textMuted),
      filled: true,
      fillColor: AppColors.surfaceMuted,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: const OutlineInputBorder(
        borderRadius: AppRadii.roundedMd,
        borderSide: BorderSide(color: AppColors.borderSubtle),
      ),
      enabledBorder: const OutlineInputBorder(
        borderRadius: AppRadii.roundedMd,
        borderSide: BorderSide(color: AppColors.borderSubtle),
      ),
      focusedBorder: const OutlineInputBorder(
        borderRadius: AppRadii.roundedMd,
        borderSide: BorderSide(color: AppColors.forestDeep, width: 1.5),
      ),
    );
  }
}
