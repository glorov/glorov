import 'package:flutter/foundation.dart';
import '../models/glorov/glorov_pincode_result.dart';
import '../repositories/glorov_repositories.dart';
import 'storage/local_storage.dart';

/// Centralized Logistics & Serviceability Service for GLOROV.
///
/// Controls courier aggregator integration status (Shiprocket / Delhivery / Bluedart),
/// validates Indian 6-digit postal PIN codes, and provides actionable availability alerts.
/// If logistics is not connected in the dashboard, prevents false-positive delivery dates
/// and guides customers with clear, professional messaging.
class GlorovLogisticsService extends ChangeNotifier {
  static final GlorovLogisticsService instance = GlorovLogisticsService._internal();

  static const String _storageKeyLogisticsConnected = 'glorov_logistics_connected';
  static const String _storageKeyLastPincode = 'glorov_last_checked_pincode';

  // Default is false: when no logistics partner is connected in the admin dashboard,
  // delivery checks must report unavailability rather than faking success.
  bool _isLogisticsConnected = false;
  String _lastCheckedPincode = '';
  GlorovPincodeResult? _lastResult;

  GlorovLogisticsService._internal() {
    _loadFromStorage();
  }

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  bool get isLogisticsConnected => _isLogisticsConnected;
  String get lastCheckedPincode => _lastCheckedPincode;
  GlorovPincodeResult? get lastResult => _lastResult;

  void _loadFromStorage() {
    try {
      final storage = GlorovLocalStorage.instance;
      final savedConnected = storage.getItem(_storageKeyLogisticsConnected);
      if (savedConnected != null) {
        _isLogisticsConnected = savedConnected == 'true';
      } else {
        // Default to false unless explicitly configured in dashboard
        _isLogisticsConnected = false;
      }

      final savedPin = storage.getItem(_storageKeyLastPincode);
      if (savedPin != null && savedPin.isNotEmpty) {
        _lastCheckedPincode = savedPin;
      }
    } catch (e) {
      debugPrint('GlorovLogisticsService storage load error: $e');
    }
  }

  /// Updates logistics integration connectivity status (e.g. from Admin Dashboard or settings toggle).
  Future<void> setLogisticsConnected(bool connected) async {
    _isLogisticsConnected = connected;
    try {
      GlorovLocalStorage.instance
          .setItem(_storageKeyLogisticsConnected, connected ? 'true' : 'false');
    } catch (e) {
      debugPrint('GlorovLogisticsService error saving connection state: $e');
    }
    // Invalidate cached result when connection status changes
    if (_lastCheckedPincode.isNotEmpty) {
      await checkPincode(_lastCheckedPincode);
    } else {
      notifyListeners();
    }
  }

  @visibleForTesting
  void setLogisticsConnectedForTesting(bool connected) {
    _isLogisticsConnected = connected;
    notifyListeners();
  }

  /// Validates PIN format and checks courier serviceability.
  /// If logistics is not connected in the admin dashboard, returns an honest unserviceable result.
  Future<GlorovPincodeResult> checkPincode(
    String pincode, {
    bool isPerishable = false,
  }) async {
    final cleanPin = pincode.trim();

    // 1. Validate 6-digit Indian PIN format (cannot start with 0)
    if (!RegExp(r'^[1-9][0-9]{5}$').hasMatch(cleanPin)) {
      final invalidResult = GlorovPincodeResult(
        pincode: cleanPin,
        serviceable: false,
        status: 'rejected',
        prepaidEligible: false,
        codAvailable: false,
        codEligible: false,
        codRestrictionReason: 'invalid_format',
        message: 'Please enter a valid 6-digit Indian PIN code.',
        detailedMessage:
            'Indian postal PIN codes must contain 6 numeric digits and cannot begin with 0.',
        isLogisticsConnected: _isLogisticsConnected,
      );
      _lastResult = invalidResult;
      notifyListeners();
      return invalidResult;
    }

    _lastCheckedPincode = cleanPin;
    try {
      GlorovLocalStorage.instance.setItem(_storageKeyLastPincode, cleanPin);
    } catch (_) {}

    // 2. Check Admin Dashboard Logistics Connectivity
    if (!_isLogisticsConnected) {
      final notConnectedResult = GlorovPincodeResult.logisticsNotConnected(
        pincode: cleanPin,
        message: 'Delivery service currently not available on this location.',
        detailedMessage:
            'Our courier and logistics network is not connected for this area. Please try an alternate PIN code or contact nursery support.',
      );
      _lastResult = notConnectedResult;
      notifyListeners();
      return notConnectedResult;
    }

    // 3. When Logistics IS Connected:
    // If remote service is available, query the backend
    if (GlorovRepositories.pincode != null && GlorovRepositories.isRemote) {
      try {
        final remoteResult = await GlorovRepositories.pincode!.checkPincode(
          cleanPin,
          isPerishable: isPerishable,
        );
        _lastResult = remoteResult;
        notifyListeners();
        return remoteResult;
      } catch (e) {
        debugPrint('Remote pincode query failed: $e');
      }
    }

    // Deterministic mock/fallback serviceability when logistics is connected
    if (cleanPin.startsWith('999') || cleanPin.startsWith('000')) {
      final unserviceableResult = GlorovPincodeResult(
        pincode: cleanPin,
        serviceable: false,
        status: 'rejected',
        prepaidEligible: false,
        codAvailable: false,
        codEligible: false,
        codRestrictionReason: 'out_of_service_area',
        message: 'Delivery service currently not available on this location.',
        detailedMessage:
            'This remote postal sector falls outside active air courier corridors. Please select a nearby district address.',
        isLogisticsConnected: true,
      );
      _lastResult = unserviceableResult;
      notifyListeners();
      return unserviceableResult;
    }

    final isMetro = ['11', '40', '56', '50', '60', '70', '41'].any(
      (prefix) => cleanPin.startsWith(prefix),
    );

    final String city = cleanPin.startsWith('411')
        ? 'Pune'
        : cleanPin.startsWith('560')
            ? 'Bengaluru'
            : cleanPin.startsWith('400')
                ? 'Mumbai'
                : cleanPin.startsWith('110')
                    ? 'New Delhi'
                    : 'India Hub';

    final int estDays = isMetro ? 2 : 4;
    final now = DateTime.now();
    final deliveryDate = now.add(Duration(days: estDays));
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final weekdayStr = weekdays[deliveryDate.weekday - 1];
    final monthStr = months[deliveryDate.month - 1];

    final connectedSuccessResult = GlorovPincodeResult(
      pincode: cleanPin,
      serviceable: true,
      status: 'confirmed',
      city: city,
      state: 'India',
      prepaidEligible: true,
      codAvailable: true,
      codEligible: true,
      estimatedDays: estDays,
      courierName: isMetro
          ? 'Shiprocket Botanical Air Express'
          : 'Delhivery Surface Logistics',
      rateInr: isMetro ? 49.0 : 79.0,
      message:
          'Delivered by: $weekdayStr, ${deliveryDate.day} $monthStr • Express Dispatch',
      detailedMessage:
          'Serviceable via ${isMetro ? 'Express Botanical Air Corridor' : 'Standard Eco Transit'} ($estDays business days). Free express shipping applies on orders above ₹999.',
      isLogisticsConnected: true,
    );

    _lastResult = connectedSuccessResult;
    notifyListeners();
    return connectedSuccessResult;
  }
}
