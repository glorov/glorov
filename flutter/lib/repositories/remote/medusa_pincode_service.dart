import '../../models/glorov/glorov_pincode_result.dart';
import 'medusa_http_client.dart';

/// Service for checking Indian postal code delivery serviceability,
/// Shiprocket courier timelines, and live botanical transit viability.
class MedusaPincodeService {
  final MedusaHttpClient client;

  const MedusaPincodeService(this.client);

  /// Validates PIN format and queries `/store/pincode-check`
  Future<GlorovPincodeResult> checkPincode(
    String pincode, {
    bool isPerishable = false,
  }) async {
    final cleanPin = pincode.trim();

    // 1. Strict Indian PIN code regex validation
    if (!RegExp(r'^[1-9][0-9]{5}$').hasMatch(cleanPin)) {
      return GlorovPincodeResult(
        pincode: cleanPin,
        serviceable: false,
        status: 'rejected',
        prepaidEligible: false,
        codAvailable: false,
        codEligible: false,
        codRestrictionReason: 'invalid_format',
        message:
            'Invalid 6-digit Indian PIN code. Must be 6 digits and cannot start with 0.',
      );
    }

    // 2. Query Medusa Store API
    final queryParams = <String, dynamic>{
      'pincode': cleanPin,
    };
    if (isPerishable) {
      queryParams['is_perishable'] = 'true';
    }

    final result = await client.get<GlorovPincodeResult>(
      '/store/pincode-check',
      queryParameters: queryParams,
      parser: (json) {
        if (json is Map<String, dynamic>) {
          return GlorovPincodeResult.fromJson(json);
        }
        return GlorovPincodeResult(
          pincode: cleanPin,
          serviceable: false,
          status: 'undetermined',
          message: 'Malformed response from postal service',
        );
      },
    );

    if (result.isSuccess) {
      return result.requireData;
    }

    // Fallback estimation for development or temporary network disruption
    return GlorovPincodeResult(
      pincode: cleanPin,
      serviceable: true,
      status: 'serviceable_offline_estimate',
      city: 'Metro Zone',
      state: 'India',
      estimatedDays: 3,
      courierName: 'Standard Eco Transit',
      message: 'Standard botanical delivery available (3–5 business days)',
    );
  }
}
