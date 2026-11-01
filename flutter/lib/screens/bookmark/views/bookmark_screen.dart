import 'package:flutter/material.dart';
import '../../wishlist/glorov_wishlist_screen.dart';

/// Legacy export wrapper mapping to GLOROV Storefront Wishlist
class BookmarkScreen extends StatelessWidget {
  const BookmarkScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovWishlistScreen();
  }
}
