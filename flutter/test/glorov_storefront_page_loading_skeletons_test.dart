import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shop/components/home/glorov_category_discovery.dart';
import 'package:shop/components/home/glorov_featured_products.dart';
import 'package:shop/components/network_image_with_loader.dart';
import 'package:shop/core/interactions/interactions.dart';
import 'package:shop/models/glorov/glorov_mock_data.dart';
import 'package:shop/screens/cart/glorov_cart_screen.dart';
import 'package:shop/screens/catalog/glorov_catalog_screen.dart';
import 'package:shop/screens/discover/glorov_categories_screen.dart';
import 'package:shop/screens/home/views/home_screen.dart';
import 'package:shop/screens/order/glorov_orders_screen.dart';
import 'package:shop/screens/product/glorov_product_details_screen.dart';
import 'package:shop/screens/reviews/view/product_reviews_screen.dart';
import 'package:shop/screens/wishlist/glorov_wishlist_screen.dart';
import 'package:shop/services/glorov_cart_state.dart';

Widget _buildTestApp(Widget child, {Size physicalSize = const Size(1280, 900)}) {
  return MaterialApp(
    home: MediaQuery(
      data: MediaQueryData(size: physicalSize),
      child: child,
    ),
  );
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('GLOROV Storefront Page Loading & Skeleton Suite Tests', () {
    testWidgets('GlorovReviewsSkeleton renders card placeholders with avatar & rating lines',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: SingleChildScrollView(
              child: GlorovReviewsSkeleton(count: 3),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovReviewsSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovOrdersListSkeleton renders order cards with tracking milestones',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: SingleChildScrollView(
              child: GlorovOrdersListSkeleton(count: 2),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovOrdersListSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovTrackingSkeleton renders delivery node timeline', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: SingleChildScrollView(
              child: GlorovTrackingSkeleton(),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovTrackingSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovCategoryDiscoverySkeleton renders circular category cards',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: GlorovCategoryDiscoverySkeleton(),
          ),
        ),
      );

      expect(find.byType(GlorovCategoryDiscoverySkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovSearchSkeleton renders autocomplete suggestion tiles',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: SingleChildScrollView(
              child: GlorovSearchSkeleton(count: 4),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovSearchSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovCartSkeleton renders items column and summary card',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: SingleChildScrollView(
              child: GlorovCartSkeleton(isDesktop: true),
            ),
          ),
        ),
      );

      expect(find.byType(GlorovCartSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovCategoriesSkeleton renders mobile dual rail and desktop showcase',
        (tester) async {
      // Mobile variant
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: GlorovCategoriesSkeleton(isMobile: true),
          ),
          physicalSize: const Size(400, 800),
        ),
      );
      expect(find.byType(GlorovCategoriesSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);

      // Desktop variant
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: SingleChildScrollView(
              child: GlorovCategoriesSkeleton(isMobile: false),
            ),
          ),
          physicalSize: const Size(1280, 900),
        ),
      );
      expect(find.byType(GlorovCategoriesSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovValuePropsSkeleton renders 4 trust pillars', (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: GlorovValuePropsSkeleton(),
          ),
        ),
      );

      expect(find.byType(GlorovValuePropsSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });
  });

  group('GLOROV Screen-Level Loading Skeletons Tests', () {
    testWidgets('HomeScreen(isLoading: true) renders coordinated skeletons',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        _buildTestApp(
          const HomeScreen(isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(HomeScreen), findsOneWidget);
      expect(find.byType(GlorovCategoryDiscovery), findsOneWidget);
      expect(find.byType(GlorovFeaturedProducts), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('GlorovCatalogScreen(isLoading: true) renders GlorovProductGridSkeleton',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        _buildTestApp(
          const GlorovCatalogScreen(isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovCatalogScreen), findsOneWidget);
      expect(find.byType(GlorovProductGridSkeleton), findsOneWidget);
    });

    testWidgets('GlorovProductDetailsScreen(isLoading: true) renders GlorovProductDetailsSkeleton',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final product = GlorovMockData.products.first;

      await tester.pumpWidget(
        _buildTestApp(
          GlorovProductDetailsScreen(product: product, isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovProductDetailsSkeleton), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsWidgets);
    });

    testWidgets('ProductReviewsScreen renders GlorovReviewsSkeleton when fetching',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      final product = GlorovMockData.products.first;

      await tester.pumpWidget(
        _buildTestApp(
          ProductReviewsScreen(product: product, isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(ProductReviewsScreen), findsOneWidget);
      expect(find.byType(GlorovReviewsSkeleton), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('GlorovOrdersScreen renders GlorovOrdersListSkeleton when loading with empty list',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      GlorovCartState.instance.setOrders([]);

      await tester.pumpWidget(
        _buildTestApp(
          const GlorovOrdersScreen(isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovOrdersScreen), findsOneWidget);
      expect(find.byType(GlorovOrdersListSkeleton), findsOneWidget);
      expect(find.byType(CircularProgressIndicator), findsNothing);
    });

    testWidgets('GlorovCartScreen(isLoading: true) renders GlorovCartSkeleton',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        _buildTestApp(
          const GlorovCartScreen(isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovCartScreen), findsOneWidget);
      expect(find.byType(GlorovCartSkeleton), findsOneWidget);
    });

    testWidgets('GlorovWishlistScreen(isLoading: true) renders GlorovProductGridSkeleton',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        _buildTestApp(
          const GlorovWishlistScreen(isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovWishlistScreen), findsOneWidget);
      expect(find.byType(GlorovProductGridSkeleton), findsOneWidget);
    });

    testWidgets('GlorovCategoriesScreen(isLoading: true) renders GlorovCategoriesSkeleton',
        (tester) async {
      tester.view.physicalSize = const Size(1280, 900);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(() {
        tester.view.resetPhysicalSize();
        tester.view.resetDevicePixelRatio();
      });

      await tester.pumpWidget(
        _buildTestApp(
          const GlorovCategoriesScreen(isLoading: true),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovCategoriesScreen), findsOneWidget);
      expect(find.byType(GlorovCategoriesSkeleton), findsOneWidget);
    });

    testWidgets('NetworkImageWithLoader renders LoadingSkeleton in placeholder state',
        (tester) async {
      await tester.pumpWidget(
        _buildTestApp(
          const Scaffold(
            body: NetworkImageWithLoader(
              'https://images.unsplash.com/photo-1545241047-6083a3684587',
              radius: 12,
            ),
          ),
        ),
      );
      await tester.pump();

      expect(find.byType(NetworkImageWithLoader), findsOneWidget);
      expect(find.byType(LoadingSkeleton), findsOneWidget);
    });

    testWidgets('Reduced motion: Skeletons render static placeholders without throwing',
        (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: MediaQuery(
            data: const MediaQueryData(
              disableAnimations: true,
              size: Size(1280, 900),
            ),
            child: const Scaffold(
              body: SingleChildScrollView(
                child: Column(
                  children: [
                    GlorovReviewsSkeleton(count: 2),
                    GlorovOrdersListSkeleton(count: 2),
                    GlorovCartSkeleton(isDesktop: false),
                  ],
                ),
              ),
            ),
          ),
        ),
      );
      await tester.pump();

      expect(find.byType(GlorovReviewsSkeleton), findsOneWidget);
      expect(find.byType(GlorovOrdersListSkeleton), findsOneWidget);
      expect(find.byType(GlorovCartSkeleton), findsOneWidget);
    });
  });
}
