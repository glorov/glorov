import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../constants.dart';
import '../../../../core/theme/app_colors.dart';

class SignUpForm extends StatefulWidget {
  const SignUpForm({
    super.key,
    required this.formKey,
    this.firstNameController,
    this.lastNameController,
    this.emailController,
    this.phoneController,
    this.passwordController,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController? firstNameController;
  final TextEditingController? lastNameController;
  final TextEditingController? emailController;
  final TextEditingController? phoneController;
  final TextEditingController? passwordController;

  @override
  State<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  bool _obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Form(
      key: widget.formKey,
      child: Column(
        children: [
          // First Name & Last Name Row
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: widget.firstNameController,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Required';
                    }
                    return null;
                  },
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    hintText: "First name",
                    prefixIcon: Padding(
                      padding: EdgeInsets.symmetric(
                          vertical: defaultPadding * 0.75),
                      child: Icon(
                        Icons.person_outline_rounded,
                        size: 20,
                        color: AppColors.forestMedium,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: defaultPadding / 2),
              Expanded(
                child: TextFormField(
                  controller: widget.lastNameController,
                  validator: (val) {
                    if (val == null || val.trim().isEmpty) {
                      return 'Required';
                    }
                    return null;
                  },
                  textInputAction: TextInputAction.next,
                  decoration: const InputDecoration(
                    hintText: "Last name",
                    prefixIcon: Padding(
                      padding: EdgeInsets.symmetric(
                          vertical: defaultPadding * 0.75),
                      child: Icon(
                        Icons.badge_outlined,
                        size: 20,
                        color: AppColors.forestMedium,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: defaultPadding),

          // Email Address
          TextFormField(
            controller: widget.emailController,
            validator: emaildValidator.call,
            textInputAction: TextInputAction.next,
            keyboardType: TextInputType.emailAddress,
            decoration: InputDecoration(
              hintText: "Email address",
              prefixIcon: Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: defaultPadding * 0.75),
                child: SvgPicture.asset(
                  "assets/icons/Message.svg",
                  height: 20,
                  width: 20,
                  colorFilter: ColorFilter.mode(
                    AppColors.forestMedium.withValues(alpha: 0.7),
                    BlendMode.srcIn,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: defaultPadding),

          // Phone Number (Optional)
          TextFormField(
            controller: widget.phoneController,
            textInputAction: TextInputAction.next,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              hintText: "Phone number (optional)",
              prefixIcon: Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: defaultPadding * 0.75),
                child: Icon(
                  Icons.phone_outlined,
                  size: 20,
                  color: AppColors.forestMedium,
                ),
              ),
            ),
          ),
          const SizedBox(height: defaultPadding),

          // Password
          TextFormField(
            controller: widget.passwordController,
            validator: passwordValidator.call,
            obscureText: _obscurePassword,
            textInputAction: TextInputAction.done,
            decoration: InputDecoration(
              hintText: "Password (min 8 chars, 1 special)",
              prefixIcon: Padding(
                padding:
                    const EdgeInsets.symmetric(vertical: defaultPadding * 0.75),
                child: SvgPicture.asset(
                  "assets/icons/Lock.svg",
                  height: 20,
                  width: 20,
                  colorFilter: ColorFilter.mode(
                    AppColors.forestMedium.withValues(alpha: 0.7),
                    BlendMode.srcIn,
                  ),
                ),
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscurePassword
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  size: 20,
                  color: AppColors.textMuted,
                ),
                onPressed: () {
                  setState(() => _obscurePassword = !_obscurePassword);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
