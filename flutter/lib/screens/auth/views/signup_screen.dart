import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/core/theme/app_colors.dart';
import 'package:shop/core/theme/app_radii.dart';
import 'package:shop/core/theme/app_spacing.dart';
import 'package:shop/core/theme/app_typography.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/screens/auth/views/components/sign_up_form.dart';
import 'package:shop/services/glorov_account_state.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final TextEditingController _firstNameController = TextEditingController();
  final TextEditingController _lastNameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _agreeToTerms = true;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;

    if (!_agreeToTerms) {
      GlorovFeedback.showWarningToast(
        context,
        message: 'Please accept the Terms of Service to create an account.',
      );
      return;
    }

    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final phone = _phoneController.text.trim().isNotEmpty
        ? _phoneController.text.trim()
        : null;

    final result = await GlorovAccountState.instance.register(
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
    );

    if (!mounted) return;

    if (result.isSuccess) {
      GlorovFeedback.showSuccessToast(
        context,
        message:
            'Account created! Welcome to GLOROV, ${result.requireData.displayName}.',
      );
      Navigator.pushNamedAndRemoveUntil(
        context,
        profileScreenRoute,
        ModalRoute.withName(entryPointScreenRoute),
      );
    } else {
      GlorovFeedback.showErrorToast(
        context,
        message: result.errorOrNull ?? 'Failed to register account.',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.of(context).size;
    final isWide = size.width > 600;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new,
              size: 18, color: AppColors.forestDark),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              Navigator.pushReplacementNamed(context, entryPointScreenRoute);
            }
          },
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(
            horizontal: isWide ? AppSpacing.lg : AppSpacing.md,
            vertical: isWide ? AppSpacing.xl : AppSpacing.sm,
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: 460,
            ),
            child: Card(
              elevation: isWide ? 4 : 0,
              color: Colors.white,
              shadowColor: Colors.black.withValues(alpha: 0.06),
              shape: RoundedRectangleBorder(
                borderRadius: AppRadii.roundedLg,
                side: const BorderSide(color: AppColors.borderLight),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Botanical Header Branding (Matches Website)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(
                      vertical: 20,
                      horizontal: AppSpacing.lg,
                    ),
                    decoration: const BoxDecoration(
                      color: AppColors.cream,
                      borderRadius: BorderRadius.vertical(
                        top: Radius.circular(16),
                      ),
                      border: Border(
                        bottom: BorderSide(color: AppColors.borderLight),
                      ),
                    ),
                    child: Column(
                      children: [
                        SvgPicture.asset(
                          "assets/logo/glorov-logo.svg",
                          height: 34,
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.forestDark.withValues(alpha: 0.08),
                            borderRadius: AppRadii.roundedFull,
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.eco,
                                  size: 12, color: AppColors.forestDark),
                              SizedBox(width: 4),
                              Text(
                                "JOIN GLOROV COMMUNITY",
                                style: TextStyle(
                                  fontFamily: AppTypography.primaryFont,
                                  fontSize: 10,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.8,
                                  color: AppColors.forestDark,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Form Body
                  Padding(
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: ListenableBuilder(
                      listenable: GlorovAccountState.instance,
                      builder: (context, _) {
                        final accountState = GlorovAccountState.instance;
                        final isLoading = accountState.isLoading;

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              "Create GLOROV Account",
                              style: Theme.of(context)
                                  .textTheme
                                  .headlineSmall
                                  ?.copyWith(
                                    fontFamily: AppTypography.displayFont,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.forestDark,
                                    fontSize: 22,
                                  ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              "Join the GLOROV gardening community to receive tailored plant care advice, track orders, and build your urban jungle.",
                              style: TextStyle(
                                fontFamily: AppTypography.primaryFont,
                                fontSize: 13,
                                color: AppColors.textSecondary,
                                height: 1.4,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.lg),

                            // Error Banner
                            if (accountState.authError != null) ...[
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(AppSpacing.md),
                                margin: const EdgeInsets.only(
                                    bottom: AppSpacing.md),
                                decoration: BoxDecoration(
                                  color: AppColors.error.withValues(alpha: 0.1),
                                  borderRadius: AppRadii.roundedMd,
                                  border: Border.all(
                                      color: AppColors.error
                                          .withValues(alpha: 0.4)),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(Icons.error_outline,
                                        color: AppColors.error, size: 20),
                                    const SizedBox(width: AppSpacing.sm),
                                    Expanded(
                                      child: Text(
                                        accountState.authError!,
                                        style: const TextStyle(
                                          fontFamily: AppTypography.primaryFont,
                                          fontSize: 13,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.error,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],

                            SignUpForm(
                              formKey: _formKey,
                              firstNameController: _firstNameController,
                              lastNameController: _lastNameController,
                              emailController: _emailController,
                              phoneController: _phoneController,
                              passwordController: _passwordController,
                            ),
                            const SizedBox(height: AppSpacing.md),

                            // Terms Agreement Row
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.center,
                              children: [
                                SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: Checkbox(
                                    activeColor: AppColors.forestDark,
                                    value: _agreeToTerms,
                                    onChanged: (value) {
                                      setState(() {
                                        _agreeToTerms = value ?? false;
                                      });
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text.rich(
                                    TextSpan(
                                      text: "I agree with the ",
                                      style: const TextStyle(
                                        fontFamily: AppTypography.primaryFont,
                                        fontSize: 12,
                                        color: AppColors.textSecondary,
                                      ),
                                      children: [
                                        TextSpan(
                                          recognizer: TapGestureRecognizer()
                                            ..onTap = () {
                                              Navigator.pushNamed(context,
                                                  termsOfServicesScreenRoute);
                                            },
                                          text: "Terms of service ",
                                          style: const TextStyle(
                                            color: AppColors.forestMedium,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const TextSpan(
                                          text: "& ",
                                        ),
                                        TextSpan(
                                          recognizer: TapGestureRecognizer()
                                            ..onTap = () {
                                              Navigator.pushNamed(context,
                                                  privacyPolicyScreenRoute);
                                            },
                                          text: "privacy policy.",
                                          style: const TextStyle(
                                            color: AppColors.forestMedium,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.lg),

                            // Submit Button
                            SizedBox(
                              width: double.infinity,
                              height: 48,
                              child: ElevatedButton(
                                onPressed: isLoading ? null : _handleSignUp,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppColors.forestDark,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: const RoundedRectangleBorder(
                                    borderRadius: AppRadii.roundedMd,
                                  ),
                                ),
                                child: isLoading
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            "Create Account",
                                            style: TextStyle(
                                              fontFamily:
                                                  AppTypography.primaryFont,
                                              fontSize: 15,
                                              fontWeight: FontWeight.w700,
                                            ),
                                          ),
                                          SizedBox(width: 8),
                                          Icon(Icons.arrow_forward_rounded,
                                              size: 16),
                                        ],
                                      ),
                              ),
                            ),
                            const SizedBox(height: AppSpacing.md),

                            // Footer
                            Center(
                              child: Wrap(
                                alignment: WrapAlignment.center,
                                crossAxisAlignment: WrapCrossAlignment.center,
                                children: [
                                  const Text(
                                    "Already have an account? ",
                                    style: TextStyle(
                                      fontFamily: AppTypography.primaryFont,
                                      fontSize: 13,
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      Navigator.pushReplacementNamed(
                                          context, logInScreenRoute);
                                    },
                                    child: const Text(
                                      "Log in",
                                      style: TextStyle(
                                        fontFamily: AppTypography.primaryFont,
                                        fontWeight: FontWeight.w700,
                                        color: AppColors.forestMedium,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
