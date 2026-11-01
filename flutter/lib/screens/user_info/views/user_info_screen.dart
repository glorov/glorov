import 'package:flutter/material.dart';
import '../../account/glorov_account_screen.dart';

class UserInfoScreen extends StatelessWidget {
  const UserInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovAccountScreen(
      initialSection: GlorovAccountSection.profile,
    );
  }
}
