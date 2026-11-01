import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

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
  String? _selectedCategory;
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
  String get selectedCategory => _selectedCategory ?? '';
  bool get hasSelectedCategory =>
      _selectedCategory != null && _selectedCategory!.isNotEmpty;
  double get lastPixels => _lastPixels;

  void _safeNotifyListeners() {
    if (WidgetsBinding.instance.schedulerPhase ==
        SchedulerPhase.persistentCallbacks) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        notifyListeners();
      });
    } else {
      notifyListeners();
    }
  }

  void selectCategory(String? category) {
    final newCat =
        (category == null || category.trim().isEmpty) ? null : category.trim();
    if (_selectedCategory != newCat) {
      _selectedCategory = newCat;
      _safeNotifyListeners();
    }
  }

  /// Clears any active category selection (e.g. when on Home/root page)
  void clearCategory() {
    if (_selectedCategory != null) {
      _selectedCategory = null;
      _safeNotifyListeners();
    }
  }

  /// Sets bottom navigation visibility directly (useful for tests or route changes)
  void setBottomNavVisible(bool visible) {
    if (_isBottomNavVisible != visible) {
      _isBottomNavVisible = visible;
      _safeNotifyListeners();
    }
  }

  /// Sets top navigation visibility directly
  void setTopNavVisible(bool visible) {
    if (_isTopNavVisible != visible) {
      _isTopNavVisible = visible;
      _safeNotifyListeners();
    }
  }

  /// Handles scroll updates from NotificationListener<ScrollNotification>
  void handleScroll(double pixels, double? delta,
      [double maxScrollExtent = double.infinity]) {
    // 1. Zone 1: Maximum Top of the page (scroll offset <= 12px):
    // Full header is open with announcement bar and category icons.
    // Mobile bottom navigation is hidden so the hero section stays clean.
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
        _safeNotifyListeners();
      }
      _lastPixels = pixels;
      return;
    }

    // 2. Zone 2: Initial Page Scroll / "No-Hide Zone" (12px < pixels <= 180px):
    // "when I scroll in the top site after some time, automatically sticky that."
    // Near top of page, header remains sticky & VISIBLE!
    // Announcement bar and category icons tuck away into sleek compact mode.
    // Header NEVER hides prematurely on initial scroll down.
    // Mobile bottom navigation remains hidden so the hero section stays clean.
    if (pixels <= stickyActivationThreshold) {
      _accumulatedDelta = 0.0;
      if (!_isTopNavVisible ||
          _showAnnouncement ||
          _showIcons ||
          _isBottomNavVisible) {
        _isTopNavVisible = true;
        _showAnnouncement = false;
        _showIcons = false;
        _isBottomNavVisible = false;
        _safeNotifyListeners();
      }
      _lastPixels = pixels;
      return;
    }

    // 3. Zone 3: Bottom of Page / Footer Zone:
    // When the user scrolls near or reaches the bottom (footer section):
    // The mobile bottom nav MUST remain docked and visible so users can easily navigate
    // without experiencing blank gaps or sudden disappearances.
    if (maxScrollExtent.isFinite &&
        maxScrollExtent > stickyActivationThreshold &&
        pixels >= maxScrollExtent - 240.0) {
      _accumulatedDelta = 0.0;
      if (!_isBottomNavVisible) {
        _isBottomNavVisible = true;
        _safeNotifyListeners();
      }
      _lastPixels = pixels;
      return;
    }

    // 4. Zone 4: Content Browsing / Dynamic Sticky (pixels > 180px):
    // "When up scrolling, then scrolling when down, the whole top navigation disappears.
    // That is the one part. And for the mobile screen, when I scroll up, hide the bottom nav,
    // and when I scroll down, again show the bottom navbar."
    final effectiveDelta = delta ?? (pixels - _lastPixels);

    // Track direction and accumulate delta to prevent jitter from 1-2px tremors
    if ((effectiveDelta > 0 && _accumulatedDelta < 0) ||
        (effectiveDelta < 0 && _accumulatedDelta > 0)) {
      _accumulatedDelta = effectiveDelta;
    } else {
      _accumulatedDelta += effectiveDelta;
    }

    // Scrolling DOWN past tolerance -> hide header, show mobile bottom navigation
    if (_accumulatedDelta > downTolerance) {
      if (_isTopNavVisible ||
          !_isBottomNavVisible ||
          _showAnnouncement ||
          _showIcons) {
        _isTopNavVisible = false;
        _isBottomNavVisible = true;
        _showAnnouncement = false;
        _showIcons = false;
        _safeNotifyListeners();
      }
      _accumulatedDelta = 0.0;
      _lastPixels = pixels;
      return;
    }

    // Scrolling UP past tolerance -> reveal compact header, hide mobile bottom navigation
    if (_accumulatedDelta < -upTolerance) {
      if (!_isTopNavVisible ||
          _isBottomNavVisible ||
          _showAnnouncement ||
          _showIcons) {
        _isTopNavVisible = true;
        _isBottomNavVisible = false;
        _showAnnouncement = false;
        _showIcons = false;
        _safeNotifyListeners();
      }
      _accumulatedDelta = 0.0;
      _lastPixels = pixels;
      return;
    }

    _lastPixels = pixels;
  }

  /// Resets header to default top state.
  /// If [clearCategory] or [resetCategory] is true, clears any selected category so nothing is highlighted.
  void reset({bool resetCategory = false, bool clearCategory = false}) {
    final bool shouldClear = clearCategory || resetCategory;
    final bool changed = !_isTopNavVisible ||
        _isBottomNavVisible ||
        !_showIcons ||
        !_showAnnouncement ||
        (shouldClear && _selectedCategory != null) ||
        _lastPixels != 0.0 ||
        _accumulatedDelta != 0.0;

    _isTopNavVisible = true;
    _isBottomNavVisible = false;
    _showIcons = true;
    _showAnnouncement = true;
    if (shouldClear) {
      _selectedCategory = null;
    }
    _lastPixels = 0.0;
    _accumulatedDelta = 0.0;

    if (changed) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        notifyListeners();
      });
    }
  }
}
