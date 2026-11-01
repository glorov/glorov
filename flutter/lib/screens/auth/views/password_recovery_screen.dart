import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:shop/constants.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/core/theme/app_colors.dart';
import 'package:shop/core/theme/app_radii.dart';
import 'package:shop/core/theme/app_spacing.dart';
import 'package:shop/core/theme/app_typography.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/services/glorov_account_state.dart';

class PasswordRecoveryScreen extends StatefulWidget {
  const PasswordRecoveryScreen({super.key});

  @override
  State<PasswordRecoveryScreen> createState() => _PasswordRecoveryScreenState();
}

class _PasswordRecoveryScreenState extends State<PasswordRecoveryScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();

  bool _isLoading = false;
  bool _isSuccess = false;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handlePasswordReset() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final email = _emailController.text.trim();
    final result =
        await GlorovAccountState.instance.requestPasswordReset(email);

    if (!mounted) return;

    setState(() {
      _isLoading = false;
    });

    if (result.isSuccess) {
      setState(() {
        _isSuccess = true;
      });
      GlorovFeedback.showSuccessToast(
        context,
        message: 'Password reset link sent to your email.',
      );
    } else {
      setState(() {
        _errorMessage = result.errorOrNull ?? 'Failed to send reset link.';
      });
      GlorovFeedback.showErrorToast(
        context,
        message: _errorMessage!,
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
              Navigator.pushReplacementNamed(context, logInScreenRoute);
            }
          },
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          child: ConstrainedBox(
            constraints: BoxConstraints(
              maxWidth: isWide ? 460 : double.infinity,
            ),
            child: Card(
              elevation: isWide ? 4 : 0,
              color: Colors.white,
              shadowColor: Colors.black.withAlpha(20),
              shape: RoundedRectangleBorder(
                borderRadius: isWide ? AppRadii.roundedLg : BorderRadius.zero,
                side: isWide
                    ? const BorderSide(color: AppColors.borderLight)
                    : BorderSide.none,
              ),
              margin: EdgeInsets.symmetric(
                horizontal: isWide ? AppSpacing.lg : 0,
                vertical: isWide ? AppSpacing.xl : 0,
              ),
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: _isSuccess ? _buildSuccessView() : _buildFormView(),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFormView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Botanical Icon
        Container(
          padding: const EdgeInsets.all(12),
          decoration: const BoxDecoration(
            color: AppColors.cream,
            borderRadius: AppRadii.roundedMd,
          ),
          child: const Icon(
            Icons.lock_reset_rounded,
            size: 32,
            color: AppColors.forestDark,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        Text(
          "Reset Your Password",
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontFamily: AppTypography.displayFont,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDark,
              ),
        ),
        const SizedBox(height: AppSpacing.xs),
        const Text(
          "Enter the email associated with your GLOROV account and we will send you instructions to reset your password.",
          style: TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.4,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),

        // Error Banner
        if (_errorMessage != null) ...[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            margin: const EdgeInsets.only(bottom: AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.error.withAlpha(20),
              borderRadius: AppRadii.roundedMd,
              border: Border.all(color: AppColors.error.withAlpha(80)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline,
                    color: AppColors.error, size: 20),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: Text(
                    _errorMessage!,
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

        Form(
          key: _formKey,
          child: TextFormField(
            controller: _emailController,
            validator: emaildValidator.call,
            textInputAction: TextInputAction.done,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              hintText: "Email address",
              prefixIcon: Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: defaultPadding * 0.75),
                child: SvgPicture.asset(
                  "assets/icons/Message.svg",
                  height: 22,
                  width: 22,
                  colorFilter: ColorFilter.mode(
                    AppColors.forestMedium.withAlpha(160),
                    BlendMode.srcIn,
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xl),

        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handlePasswordReset,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDark,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                borderRadius: AppRadii.roundedMd,
              ),
            ),
            child: _isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    "Send Reset Instructions",
                    style: TextStyle(
                      fontFamily: AppTypography.primaryFont,
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        Center(
          child: TextButton.icon(
            onPressed: () {
              Navigator.pushReplacementNamed(context, logInScreenRoute);
            },
            icon: const Icon(Icons.arrow_back,
                size: 16, color: AppColors.forestMedium),
            label: const Text(
              "Back to Sign In",
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontWeight: FontWeight.w600,
                color: AppColors.forestMedium,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.success.withAlpha(30),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.mark_email_read_outlined,
            size: 48,
            color: AppColors.success,
          ),
        ),
        const SizedBox(height: AppSpacing.lg),
        Text(
          "Reset Instructions Sent",
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                fontFamily: AppTypography.displayFont,
                fontWeight: FontWeight.w700,
                color: AppColors.forestDark,
              ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.sm),
        Text(
          "We've sent a password reset link to ${_emailController.text.trim()}. Please follow the instructions in the email to set a new password.",
          style: const TextStyle(
            fontFamily: AppTypography.primaryFont,
            fontSize: 13,
            color: AppColors.textSecondary,
            height: 1.5,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: AppSpacing.xl),
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: () {
              Navigator.pushReplacementNamed(context, logInScreenRoute);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.forestDark,
              foregroundColor: Colors.white,
              shape: const RoundedRectangleBorder(
                borderRadius: AppRadii.roundedMd,
              ),
            ),
            child: const Text(
              "Return to Sign In",
              style: TextStyle(
                fontFamily: AppTypography.primaryFont,
                fontSize: 15,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
