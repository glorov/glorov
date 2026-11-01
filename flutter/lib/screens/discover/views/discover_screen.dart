import 'package:flutter/material.dart';
import '../glorov_categories_screen.dart';

export '../glorov_categories_screen.dart';

/// Legacy DiscoverScreen alias redirecting to production GlorovCategoriesScreen
class DiscoverScreen extends StatelessWidget {
  const DiscoverScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovCategoriesScreen();
  }
}
