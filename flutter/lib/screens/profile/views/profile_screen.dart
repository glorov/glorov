import 'package:flutter/material.dart';
import '../../account/glorov_account_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovAccountScreen(
      initialSection: GlorovAccountSection.overview,
    );
  }
}
