import 'package:flutter/material.dart';
import '../../core/interactions/interactions.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_radii.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_typography.dart';

/// Development-Only Micro-Interactions Showcase Screen
///
/// Isolated from production customer navigation.
/// Demonstrates the verified suite of `flutter_micro_interactions` widgets
/// and GLOROV custom interaction wrappers in an interactive testbed.
class InteractionShowcaseScreen extends StatefulWidget {
  const InteractionShowcaseScreen({super.key});

  @override
  State<InteractionShowcaseScreen> createState() =>
      _InteractionShowcaseScreenState();
}

class _InteractionShowcaseScreenState extends State<InteractionShowcaseScreen> {
  // Button state controllers
  late ButtonStateController _buttonStateController;
  late AnimatedCheckController _checkController;

  // Showcase state variables
  int _badgeCount = 3;
  int _counterValue = 249;
  bool _formValid = false;
  bool _showSkeletons = false;
  int _staggerKey = 0;
  int _burstKey = 0;
  final TextEditingController _textController =
      TextEditingController(text: 'Monstera Deliciosa');

  @override
  void initState() {
    super.initState();
    _buttonStateController = ButtonStateController();
    _checkController = AnimatedCheckController();
  }

  @override
  void dispose() {
    _buttonStateController.dispose();
    _checkController.dispose();
    _textController.dispose();
    super.dispose();
  }

  void _replayStagger() {
    setState(() {
      _staggerKey++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'GLOROV Micro-Interactions Showcase [DEV]',
          style: TextStyle(
            fontFamily: AppTypography.displayFont,
            fontWeight: FontWeight.w700,
            color: AppColors.forestDark,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.forestDark),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              Navigator.of(context).pushReplacementNamed('/');
            }
          },
        ),
        actions: [
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.sage.withValues(alpha: 0.2),
              borderRadius: AppRadii.roundedFull,
              border: Border.all(color: AppColors.forestMedium, width: 1),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.developer_mode,
                    size: 14, color: AppColors.forestDark),
                SizedBox(width: 6),
                Text(
                  'DEV ROUTE ONLY',
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDark,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.xl,
          vertical: AppSpacing.lg,
        ),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 1100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildIntroBanner(),
                const SizedBox(height: AppSpacing.xl),

                // 1. Tap Feedback & Hover Glow
                _buildSectionHeader(
                  title: '1. Tactile Tap Feedback & Soft Botanical Hover Glow',
                  subtitle:
                      'TapFeedback provides subtle compression on click; HoverGlow creates organic sage ambient radiance without harsh shadows.',
                ),
                _buildTapAndHoverShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 2. Interactive Buttons & State Controller
                _buildSectionHeader(
                  title:
                      '2. Button Variants & ButtonStates Transition Controller',
                  subtitle:
                      'GlorovButton encapsulates TapFeedback, disabled guards, and accessible focus. ButtonStates handles loading, success, and error animations.',
                ),
                _buildButtonShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 3. Form Validation ShakeButton
                _buildSectionHeader(
                  title: '3. Form Validation Feedback (GlorovShakeButton)',
                  subtitle:
                      'When submitting invalid forms, the button performs a subtle horizontal shake with light haptic vibration while keeping inputs stationary.',
                ),
                _buildShakeButtonShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 4. Animated Counters & Notification Badges
                _buildSectionHeader(
                  title: '4. Animated Numerical Counter & Reactive Badges',
                  subtitle:
                      'AnimatedCounter smoothly rolls odometer digits for prices and points. AnimatedBadge scales dynamically on item increments.',
                ),
                _buildCountersAndBadgesShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 5. InputFocus Accessible Fields
                _buildSectionHeader(
                  title: '5. Accessible InputFocus Elevation Fields',
                  subtitle:
                      'GlorovTextField wraps InputFocus for soft focus halo and elevation without causing layout jumps or shifting sibling elements.',
                ),
                _buildInputsShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 6. Accessible Toast Notifications & Celebration Burst
                _buildSectionHeader(
                  title:
                      '6. Accessible Toast System & SuccessBurst Celebration',
                  subtitle:
                      'ToastNotification displays non-blocking top notifications with action callbacks. SuccessBurst emits botanical brand palette particles.',
                ),
                _buildFeedbackShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 7. Synchronized Shimmer Skeletons
                _buildSectionHeader(
                  title:
                      '7. Zero-Layout-Shift Shimmer Skeletons (SkeletonScope)',
                  subtitle:
                      'Mirrors real widget layouts. SkeletonScope synchronizes shimmer animations across multiple card placeholders to minimize GPU draw calls.',
                ),
                _buildSkeletonsShowcase(),
                const SizedBox(height: AppSpacing.xxl),

                // 8. Staggered Entrance Animations & Path-Drawn Checkmark
                _buildSectionHeader(
                  title: '8. Staggered Entrance Lists & Animated Checkmark',
                  subtitle:
                      'GlorovStaggeredItem staggers list items into view with clamped delays. GlorovAnimatedCheck draws vector checkmark paths dynamically.',
                ),
                _buildStaggeredAndCheckShowcase(),
                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Showcase Component Sections
  // ---------------------------------------------------------------------------

  Widget _buildIntroBanner() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surfaceMuted,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.forestDeep.withValues(alpha: 0.1),
              borderRadius: AppRadii.roundedMd,
            ),
            child: const Icon(Icons.touch_app,
                color: AppColors.forestDeep, size: 28),
          ),
          const SizedBox(width: AppSpacing.md),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'GLOROV Micro-Interactions System Testbed',
                  style: TextStyle(
                    fontFamily: AppTypography.displayFont,
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.forestDark,
                  ),
                ),
                SizedBox(height: 4),
                Text(
                  'Powered by package:flutter_micro_interactions 0.3.2. All components below follow GLOROV botanical tokens, organic motion curves, and strict accessibility standards.',
                  style: TextStyle(
                    fontFamily: AppTypography.primaryFont,
                    fontSize: 13,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(
      {required String title, required String subtitle}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(
            fontFamily: AppTypography.displayFont,
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.forestDark,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          subtitle,
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
          ),
        ),
        const SizedBox(height: AppSpacing.md),
      ],
    );
  }

  Widget _buildTapAndHoverShowcase() {
    return Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      children: [
        SizedBox(
          width: 320,
          child: GlorovTapCard(
            onTap: () {
              GlorovFeedback.showInfoToast(context,
                  message: 'Botanical card tapped!');
            },
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedLg,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: const Row(
                children: [
                  Icon(Icons.eco, color: AppColors.forestMedium, size: 32),
                  SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Hover Glow & Tap Card',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Hover to see soft Sage glow; click for scale compression.',
                          style: TextStyle(
                              fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        SizedBox(
          width: 320,
          child: TapFeedback(
            effect: TapAnimationType.bounce,
            scaleUp: 1.15,
            onTap: () {
              GlorovFeedback.showSuccessToast(context,
                  message: 'Bounce effect triggered!');
            },
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppRadii.roundedLg,
                border: Border.all(color: AppColors.borderSubtle),
              ),
              child: const Row(
                children: [
                  Icon(Icons.favorite, color: AppColors.error, size: 32),
                  SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Bounce Tap Feedback',
                          style: TextStyle(fontWeight: FontWeight.w700),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Used for wishlist hearts and favorite toggles.',
                          style: TextStyle(
                              fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildButtonShowcase() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: AppSpacing.md,
          runSpacing: AppSpacing.md,
          children: [
            GlorovButton.primary(
              label: 'Primary Action',
              leadingIcon: const Icon(Icons.shopping_bag_outlined, size: 18),
              onPressed: () {
                GlorovFeedback.showSuccessToast(context,
                    message: 'Primary button activated');
              },
            ),
            GlorovButton.secondary(
              label: 'Secondary Action',
              onPressed: () {
                GlorovFeedback.showInfoToast(context,
                    message: 'Secondary button activated');
              },
            ),
            GlorovButton.outlined(
              label: 'Outlined Action',
              onPressed: () {
                GlorovFeedback.showInfoToast(context,
                    message: 'Outlined button activated');
              },
            ),
            GlorovButton.destructive(
              label: 'Destructive',
              onPressed: () {
                GlorovFeedback.showWarningToast(context,
                    message: 'Destructive button activated');
              },
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.lg),
        Container(
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Interactive ButtonStates Controller:',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.md,
                runSpacing: AppSpacing.sm,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  GlorovInteractiveButton(
                    controller: _buttonStateController,
                    onPressed: () {},
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 20, vertical: 12),
                      decoration: const BoxDecoration(
                        color: AppColors.forestDeep,
                        borderRadius: AppRadii.roundedMd,
                      ),
                      child: const Text(
                        'Controlled Action Button',
                        style: TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  OutlinedButton(
                    onPressed: () => _buttonStateController.setIdle(),
                    child: const Text('Reset Idle'),
                  ),
                  OutlinedButton(
                    onPressed: () => _buttonStateController.setLoading(),
                    child: const Text('Set Loading'),
                  ),
                  OutlinedButton(
                    onPressed: () => _buttonStateController.setSuccess(),
                    child: const Text('Set Success'),
                  ),
                  OutlinedButton(
                    onPressed: () => _buttonStateController.setError(),
                    child: const Text('Set Error'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildShakeButtonShowcase() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Checkbox(
                value: _formValid,
                activeColor: AppColors.forestDeep,
                onChanged: (val) {
                  setState(() => _formValid = val ?? false);
                },
              ),
              const Text(
                'Form Valid State (toggle to test shake behavior)',
                style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.sm),
          GlorovShakeButton(
            isValid: _formValid,
            onPressed: () {
              GlorovFeedback.showSuccessToast(
                context,
                message: 'Form submitted successfully!',
              );
            },
            onInvalidPress: () {
              GlorovFeedback.showWarningToast(
                context,
                message:
                    'Form validation failed. Please check required fields.',
              );
            },
            builder: (ctx, handlePressed) {
              return GlorovButton.primary(
                label: 'Submit Verification Form',
                onPressed: handlePressed,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildCountersAndBadgesShowcase() {
    return Wrap(
      spacing: AppSpacing.lg,
      runSpacing: AppSpacing.md,
      children: [
        Container(
          width: 300,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Odometer Animated Price:',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Text('₹',
                      style:
                          TextStyle(fontSize: 24, fontWeight: FontWeight.w700)),
                  GlorovCounter(
                    value: _counterValue,
                    mode: CounterAnimationMode.slideDigits,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w700,
                      color: AppColors.forestDark,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove_circle_outline),
                    onPressed: () {
                      setState(() {
                        if (_counterValue > 50) _counterValue -= 50;
                      });
                    },
                  ),
                  IconButton(
                    icon: const Icon(Icons.add_circle_outline),
                    onPressed: () {
                      setState(() {
                        _counterValue += 50;
                      });
                    },
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text('Shift ±₹50',
                      style:
                          TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                ],
              ),
            ],
          ),
        ),
        Container(
          width: 300,
          padding: const EdgeInsets.all(AppSpacing.md),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppRadii.roundedLg,
            border: Border.all(color: AppColors.borderSubtle),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Animated Shopping Badge:',
                style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
              ),
              const SizedBox(height: 12),
              Center(
                child: GlorovBadge(
                  count: _badgeCount,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceMuted,
                      borderRadius: AppRadii.roundedMd,
                      border: Border.all(color: AppColors.borderSubtle),
                    ),
                    child: const Icon(Icons.shopping_bag_outlined,
                        size: 28, color: AppColors.forestDark),
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: () {
                      setState(() {
                        if (_badgeCount > 0) _badgeCount--;
                      });
                    },
                  ),
                  Text('Count: $_badgeCount',
                      style: const TextStyle(fontWeight: FontWeight.w600)),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: () {
                      setState(() {
                        _badgeCount++;
                      });
                    },
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildInputsShowcase() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        children: [
          GlorovTextField(
            controller: _textController,
            label: 'Botanical Variety Name',
            hintText: 'e.g. Fiddle Leaf Fig',
            prefixIcon: const Icon(Icons.search, color: AppColors.forestMedium),
          ),
          const SizedBox(height: AppSpacing.md),
          const GlorovTextField(
            label: 'Delivery Postal Code',
            hintText: 'Enter 6-digit postal code',
            prefixIcon:
                Icon(Icons.location_on_outlined, color: AppColors.forestMedium),
          ),
        ],
      ),
    );
  }

  Widget _buildFeedbackShowcase() {
    return Wrap(
      spacing: AppSpacing.md,
      runSpacing: AppSpacing.md,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        GlorovButton.secondary(
          label: 'Show Success Toast',
          leadingIcon: const Icon(Icons.check_circle_outline, size: 16),
          onPressed: () {
            GlorovFeedback.showSuccessToast(
              context,
              message: 'Rare heirloom seeds added to your bag.',
              actionLabel: 'VIEW BAG',
              onAction: () {},
            );
          },
        ),
        GlorovButton.secondary(
          label: 'Show Warning Toast',
          leadingIcon: const Icon(Icons.warning_amber_rounded, size: 16),
          onPressed: () {
            GlorovFeedback.showWarningToast(
              context,
              message: 'Limited nursery stock: Only 3 saplings remain.',
            );
          },
        ),
        GlorovButton.secondary(
          label: 'Show Error Toast',
          leadingIcon: const Icon(Icons.error_outline, size: 16),
          onPressed: () {
            GlorovFeedback.showErrorToast(
              context,
              message: 'Invalid promo code. Please check spelling.',
            );
          },
        ),
        GlorovButton.secondary(
          label: 'Show Info Toast',
          leadingIcon: const Icon(Icons.info_outline, size: 16),
          onPressed: () {
            GlorovFeedback.showInfoToast(
              context,
              message: 'Express botanical shipping active for your area.',
            );
          },
        ),
        SuccessBurst(
          key: ValueKey(_burstKey),
          colors: GlorovFeedback.botanicalBurstColors,
          child: GlorovButton.primary(
            label: 'Trigger Success Burst',
            leadingIcon: const Icon(Icons.auto_awesome, size: 16),
            onPressed: () {
              setState(() => _burstKey++);
              GlorovFeedback.showSuccessToast(
                context,
                message: 'Botanical celebration burst triggered!',
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSkeletonsShowcase() {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppRadii.roundedLg,
        border: Border.all(color: AppColors.borderSubtle),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _showSkeletons
                    ? 'Skeleton State Active'
                    : 'Loaded State Active',
                style: const TextStyle(fontWeight: FontWeight.w700),
              ),
              Switch(
                value: _showSkeletons,
                activeThumbColor: AppColors.forestDeep,
                onChanged: (val) => setState(() => _showSkeletons = val),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          GlorovSkeletonLoader(
            loading: _showSkeletons,
            skeleton: const Row(
              children: [
                SizedBox(
                  width: 200,
                  child: GlorovProductCardSkeleton(),
                ),
                SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    children: [
                      GlorovListItemSkeleton(),
                      SizedBox(height: AppSpacing.sm),
                      GlorovListItemSkeleton(),
                    ],
                  ),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 200,
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceMuted,
                    borderRadius: AppRadii.roundedLg,
                    border: Border.all(color: AppColors.borderSubtle),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 120,
                        decoration: BoxDecoration(
                          color: AppColors.forestDeep.withValues(alpha: 0.1),
                          borderRadius: AppRadii.roundedMd,
                        ),
                        child: const Center(
                          child: Icon(Icons.local_florist,
                              color: AppColors.forestDeep, size: 40),
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text('Organic Spinach Seeds',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      const Text('₹99 ₹145',
                          style: TextStyle(color: AppColors.forestMedium)),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ListTile(
                        leading: CircleAvatar(
                            backgroundColor: AppColors.forestMedium),
                        title: Text('Heirloom Tomato Order Dispatched'),
                        subtitle: Text('Tracking #GLR-ORD-2026-8812'),
                      ),
                      ListTile(
                        leading: CircleAvatar(
                            backgroundColor: AppColors.forestMedium),
                        title: Text('Monsoon Planting Advisory Released'),
                        subtitle: Text('Best practices for garden beds'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStaggeredAndCheckShowcase() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(
          flex: 2,
          child: Container(
            key: ValueKey(_staggerKey),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadii.roundedLg,
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Staggered Cards Entrance:',
                        style: TextStyle(fontWeight: FontWeight.w700)),
                    IconButton(
                      icon: const Icon(Icons.refresh, size: 20),
                      tooltip: 'Replay Stagger Animation',
                      onPressed: _replayStagger,
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                for (int i = 0; i < 3; i++)
                  GlorovStaggeredItem(
                    index: i,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.surfaceMuted,
                        borderRadius: AppRadii.roundedMd,
                        border: Border.all(color: AppColors.borderSubtle),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.spa,
                              size: 18, color: Colors.green.shade700),
                          const SizedBox(width: 8),
                          Text('Botanical Catalog Item #${i + 1}'),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: AppSpacing.lg),
        Expanded(
          flex: 1,
          child: Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppRadii.roundedLg,
              border: Border.all(color: AppColors.borderSubtle),
            ),
            child: Column(
              children: [
                const Text('Animated Draw Check:',
                    style: TextStyle(fontWeight: FontWeight.w700)),
                const SizedBox(height: AppSpacing.md),
                GlorovAnimatedCheck(
                  controller: _checkController,
                  size: 56,
                  color: AppColors.forestDeep,
                ),
                const SizedBox(height: AppSpacing.md),
                GlorovButton.secondary(
                  label: 'Replay Check',
                  onPressed: () {
                    _checkController.reset();
                    _checkController.play();
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
