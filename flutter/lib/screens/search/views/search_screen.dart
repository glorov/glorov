import 'package:flutter/material.dart';
import 'glorov_search_screen.dart';

export 'glorov_search_screen.dart';

/// Legacy SearchScreen alias pointing to the production GlorovSearchScreen
class SearchScreen extends StatelessWidget {
  final String? initialQuery;

  const SearchScreen({
    super.key,
    this.initialQuery,
  });

  @override
  Widget build(BuildContext context) {
    return GlorovSearchScreen(initialQuery: initialQuery);
  }
}
