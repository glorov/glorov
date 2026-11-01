import 'package:flutter/material.dart';
import '../../account/glorov_account_screen.dart';

class PreferencesScreen extends StatelessWidget {
  const PreferencesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovAccountScreen(
      initialSection: GlorovAccountSection.settings,
    );
  }
}
