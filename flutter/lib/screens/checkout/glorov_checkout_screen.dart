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
    _nameController = TextEditingController(text: initial.fullName);
    _phoneController = TextEditingController(text: initial.phoneNumber);
    _addressController = TextEditingController(text: initial.addressLine);
    _cityController = TextEditingController(text: initial.city);
    _stateController = TextEditingController(text: initial.state);
    _pincodeController = TextEditingController(text: initial.pincode);
    _landmarkController = TextEditingController(text: initial.landmark ?? '');
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

  void _autofillSampleAddress() {
    _applyAddress(GlorovAddress.sample);
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
              listenable: GlorovCartState.instance,
              builder: (context, _) {
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
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
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
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Shipping Information',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDeep,
                  ),
                ),
                TextButton.icon(
                  onPressed: _autofillSampleAddress,
                  icon: const Icon(Icons.flash_on, size: 14),
                  label: const Text('Use Sample Address'),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.forestMedium,
                    visualDensity: VisualDensity.compact,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),

            // Saved Addresses Selector
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
                        color:
                            isSelected ? Colors.white : AppColors.textPrimary,
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

            // Full Name & Phone Number
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _nameController,
                    decoration:
                        _inputDecoration('Full Name *', 'e.g. Ananya Sharma'),
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
                        '10-Digit Mobile Phone *', 'e.g. 9876543210'),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty)
                        return 'Enter mobile number';
                      if (val.trim().length < 10) return 'Must be 10 digits';
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
                'e.g. Flat 402, Green Meadows, 12th Main',
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
                    decoration: _inputDecoration('City *', 'e.g. Bengaluru'),
                    validator: (val) =>
                        val == null || val.trim().isEmpty ? 'Enter city' : null,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  flex: 5,
                  child: TextFormField(
                    controller: _stateController,
                    decoration: _inputDecoration('State *', 'e.g. Karnataka'),
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
                    decoration:
                        _inputDecoration('PIN Code *', 'e.g. 560038').copyWith(
                      counterText: '',
                    ),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) return 'Enter PIN';
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
                  'e.g. Near City Botanical Garden'),
            ),
          ],
        ),
      ),
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
