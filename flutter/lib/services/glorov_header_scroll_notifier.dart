import 'package:flutter/material.dart';

/// Centralized Scroll Coordinator for the GLOROV Storefront Navigation
/// Controls smart sticky & dynamic navigation behavior based on modern e-commerce standards (Amazon, Flipkart, Shopify, Medium):
///
/// 1. Zone 1 - Absolute Top (pixels <= 12):
///    - Full header open with announcement bar and centered category icons.
///    - Mobile bottom navigation is hidden.
///
/// 2. Zone 2 - Initial Scroll / "No-Hide Zone" (12 < pixels <= 180):
///    - Header remains sticky and VISIBLE at the top of the viewport.
///    - Announcement bar and category icons tuck away into sleek compact mode.
///    - Header DOES NOT hide prematurely on initial scroll down.
///    - Mobile bottom navigation remains hidden so top hero stays clean.
///
/// 3. Zone 3 - Content Browsing / Dynamic Sticky (pixels > 180):
///    - Scrolling DOWN: Top header slides UP smoothly out of view; mobile bottom nav appears.
///    - Scrolling UP: Top header slides DOWN into view (compact mode); mobile bottom nav hides.
///
/// 4. Zero Page Height Shift:
///    - Top and bottom navigation float as overlays via Stack + GPU translation (AnimatedSlide).
///    - Layout height of scroll view remains constant, preventing any page height jump.
class GlorovHeaderScrollNotifier extends ChangeNotifier {
  static final GlorovHeaderScrollNotifier instance =
      GlorovHeaderScrollNotifier._();

  GlorovHeaderScrollNotifier._();

  bool _isTopNavVisible = true;
  bool _isBottomNavVisible = false;
  bool _showIcons = true;
  bool _showAnnouncement = true;
  String _selectedCategory = 'Seeds';
  double _lastPixels = 0.0;
  double _accumulatedDelta = 0.0;

  // Maximum top threshold: Announcement bar and category icons are visible
  static const double topThreshold = 12.0;

  // Sticky activation threshold (The "No-Hide Zone"):
  // During initial scroll down through the top section (pixels <= 180.0),
  // the header remains sticky and visible at the top!
  // Only after scrolling past 180.0 does the smart hide-on-scroll-down kick in.
  static const double stickyActivationThreshold = 180.0;

  // Responsive scroll sensitivity (delta threshold):
  // Minimum continuous movement in one direction before toggling state
  static const double downTolerance = 14.0;
  static const double upTolerance = 8.0;

  bool get isTopNavVisible => _isTopNavVisible;
  bool get isHeaderVisible => _isTopNavVisible; // backward-compatibility alias
  bool get isBottomNavVisible => _isBottomNavVisible;
  bool get showIcons => _showIcons;
  bool get showAnnouncement => _showAnnouncement;
  bool get isAtTop => _showAnnouncement;
  String get selectedCategory => _selectedCategory;
  double get lastPixels => _lastPixels;

  void selectCategory(String category) {
    if (_selectedCategory != category) {
      _selectedCategory = category;
      notifyListeners();
    }
  }

  /// Sets bottom navigation visibility directly (useful for tests or route changes)
  void setBottomNavVisible(bool visible) {
    if (_isBottomNavVisible != visible) {
      _isBottomNavVisible = visible;
      notifyListeners();
    }
  }

  /// Sets top navigation visibility directly
  void setTopNavVisible(bool visible) {
    if (_isTopNavVisible != visible) {
      _isTopNavVisible = visible;
      notifyListeners();
    }
  }

  /// Handles scroll updates from NotificationListener<ScrollNotification>
  void handleScroll(double pixels, double? delta,
      [double maxScrollExtent = double.infinity]) {
    // 1. Zone 1: Maximum Top of the page (scroll offset <= 12px):
    // Full header is open with announcement bar and category icons.
    // Mobile bottom navigation is hidden.
    if (pixels <= topThreshold) {
      _accumulatedDelta = 0.0;
      if (!_isTopNavVisible ||
          !_showAnnouncement ||
          !_showIcons ||
          _isBottomNavVisible) {
        _isTopNavVisible = true;
        _showIcons = true;
        _showAnnouncement = true;
        _isBottomNavVisible = false;
        notifyListeners();
      }
      _lastPixels = pixels;
      return;
    }

    // 2. Zone 2: Scrolled down (pixels > 12px):
    // - Header remains STICKY and visible at the top ("I want it to stick when I scroll ... that is the top part stick").
    // - Top announcement bar smoothly collapses from 34px to 0px ("Move the top part when I scroll").
    // - Category icons tuck away into sleek compact header mode.
    // - Mobile bottom navigation dock is not stuck on standard screens ("the scroll doesn't stick in the bottom part").
    _accumulatedDelta = 0.0;
    if (!_isTopNavVisible ||
        _showAnnouncement ||
        _showIcons ||
        _isBottomNavVisible) {
      _isTopNavVisible = true;
      _showAnnouncement = false;
      _showIcons = false;
      _isBottomNavVisible = false;
      notifyListeners();
    }
    _lastPixels = pixels;
  }

  /// Resets header to default top state
  void reset() {
    _isTopNavVisible = true;
    _isBottomNavVisible = false;
    _showIcons = true;
    _showAnnouncement = true;
    _selectedCategory = 'Seeds';
    _lastPixels = 0.0;
    _accumulatedDelta = 0.0;
    notifyListeners();
  }
}
