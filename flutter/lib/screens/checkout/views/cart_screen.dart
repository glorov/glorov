import 'package:flutter/material.dart';
import '../../cart/glorov_cart_screen.dart';

/// Legacy export wrapper mapping to GLOROV Storefront Cart
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const GlorovCartScreen();
  }
}
