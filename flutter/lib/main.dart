import 'package:flutter/material.dart';
import 'package:flutter_web_plugins/url_strategy.dart';
import 'package:shop/core/theme/app_theme.dart';
import 'package:shop/core/theme/glorov_scroll_behavior.dart';
import 'package:shop/repositories/glorov_repositories.dart';
import 'package:shop/route/route_constants.dart';
import 'package:shop/route/router.dart' as router;
import 'package:shop/services/glorov_account_state.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  usePathUrlStrategy();
  
  // Optimize CanvasKit WebGL memory footprint: limit memory image cache to 100 entries / 64 MB
  PaintingBinding.instance.imageCache.maximumSize = 100;
  PaintingBinding.instance.imageCache.maximumSizeBytes = 64 << 20;

  GlorovRepositories.init();
  GlorovAccountState.instance.restoreSession();
  runApp(const MyApp());
}

/// GLOROV Application Root
class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GLOROV • Grow More. Live Greener.',
      theme: AppTheme.lightTheme(context),
      themeMode: ThemeMode.light,
      scrollBehavior: const GlorovScrollBehavior(),
      onGenerateRoute: router.generateRoute,
      initialRoute: homeScreenRoute,
      navigatorObservers: [
        router.glorovRouteObserver,
        router.GlorovNavigatorObserver(),
      ],
    );
  }
}
