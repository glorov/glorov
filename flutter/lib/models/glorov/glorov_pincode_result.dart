/// Typed domain model representing the result of an Indian PIN code delivery lookup
/// against the Medusa backend (`/store/pincode-check`).
class GlorovPincodeResult {
  final String pincode;
  final bool serviceable;
  final String status;
  final String? city;
  final String? state;
  final bool prepaidEligible;
  final bool codAvailable;
  final bool codEligible;
  final String? codRestrictionReason;
  final int? estimatedDays;
  final String? courierName;
  final double? rateInr;
  final String message;
  final String? detailedMessage;
  final bool isLogisticsConnected;

  const GlorovPincodeResult({
    required this.pincode,
    required this.serviceable,
    required this.status,
    this.city,
    this.state,
    this.prepaidEligible = true,
    this.codAvailable = true,
    this.codEligible = true,
    this.codRestrictionReason,
    this.estimatedDays,
    this.courierName,
    this.rateInr,
    required this.message,
    this.detailedMessage,
    this.isLogisticsConnected = true,
  });

  bool get isLogisticsDisconnected =>
      !isLogisticsConnected || status == 'logistics_not_connected';

  /// Standard factory for when logistics partner is not connected in the dashboard
  factory GlorovPincodeResult.logisticsNotConnected({
    required String pincode,
    String? message,
    String? detailedMessage,
  }) {
    return GlorovPincodeResult(
      pincode: pincode.trim(),
      serviceable: false,
      status: 'logistics_not_connected',
      isLogisticsConnected: false,
      prepaidEligible: false,
      codAvailable: false,
      codEligible: false,
      codRestrictionReason: 'logistics_not_connected',
      message: message ??
          'Delivery service currently not available on this location.',
      detailedMessage: detailedMessage ??
          'Our courier and logistics network is not connected for this area. Please try an alternate PIN code or contact nursery support.',
    );
  }

  factory GlorovPincodeResult.fromJson(Map<String, dynamic> json) {
    final status = json['status']?.toString() ?? 'undetermined';
    final isLogisticsConnected = json['is_logistics_connected'] as bool? ??
        (status != 'logistics_not_connected');

    return GlorovPincodeResult(
      pincode: json['pincode']?.toString() ?? '',
      serviceable: json['serviceable'] as bool? ?? false,
      status: status,
      city: json['city']?.toString(),
      state: json['state']?.toString(),
      prepaidEligible: json['prepaid_eligible'] as bool? ?? false,
      codAvailable: json['cod_available'] as bool? ?? false,
      codEligible: json['cod_eligible'] as bool? ?? false,
      codRestrictionReason: json['cod_restriction_reason']?.toString(),
      estimatedDays: (json['estimated_days'] as num?)?.toInt(),
      courierName: json['courier_name']?.toString(),
      rateInr: (json['rate_inr'] as num?)?.toDouble(),
      message: json['message']?.toString() ?? '',
      detailedMessage: json['detailed_message']?.toString(),
      isLogisticsConnected: isLogisticsConnected,
    );
  }

  Map<String, dynamic> toJson() => {
        'pincode': pincode,
        'serviceable': serviceable,
        'status': status,
        'city': city,
        'state': state,
        'prepaid_eligible': prepaidEligible,
        'cod_available': codAvailable,
        'cod_eligible': codEligible,
        'cod_restriction_reason': codRestrictionReason,
        'estimated_days': estimatedDays,
        'courier_name': courierName,
        'rate_inr': rateInr,
        'message': message,
        'detailed_message': detailedMessage,
        'is_logistics_connected': isLogisticsConnected,
      };
}
