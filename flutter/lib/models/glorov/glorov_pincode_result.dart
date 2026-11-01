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
  });

  factory GlorovPincodeResult.fromJson(Map<String, dynamic> json) {
    return GlorovPincodeResult(
      pincode: json['pincode']?.toString() ?? '',
      serviceable: json['serviceable'] as bool? ?? false,
      status: json['status']?.toString() ?? 'undetermined',
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
      };
}
