import 'package:flutter/material.dart';
import '../../account/glorov_account_screen.dart';

class EnableNotificationScreen extends StatelessWidget {
  const EnableNotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovAccountScreen(
      initialSection: GlorovAccountSection.notifications,
    );
  }
}
