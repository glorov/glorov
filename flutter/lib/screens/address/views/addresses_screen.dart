import 'package:flutter/material.dart';
import '../../account/glorov_account_screen.dart';

class AddressesScreen extends StatelessWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovAccountScreen(
      initialSection: GlorovAccountSection.addresses,
    );
  }
}
