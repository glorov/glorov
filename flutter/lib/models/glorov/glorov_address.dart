/// Delivery Address Model for GLOROV Botanical E-Commerce
class GlorovAddress {
  final String id;
  final String fullName;
  final String phoneNumber;
  final String addressLine;
  final String city;
  final String state;
  final String pincode;
  final String? landmark;
  final String label; // 'Home', 'Work', 'Other'
  final bool isDefault;

  const GlorovAddress({
    this.id = '',
    required this.fullName,
    required this.phoneNumber,
    required this.addressLine,
    required this.city,
    required this.state,
    required this.pincode,
    this.landmark,
    this.label = 'Home',
    this.isDefault = false,
  });

  /// Check if the address is empty/unset
  bool get isEmpty => id.isEmpty && fullName.isEmpty && addressLine.isEmpty;

  /// Check if the address is not empty
  bool get isNotEmpty => !isEmpty;

  /// Check if the address has valid, non-empty fields and correct PIN format
  bool get isValid =>
      fullName.trim().isNotEmpty &&
      phoneNumber.trim().length >= 10 &&
      addressLine.trim().isNotEmpty &&
      city.trim().isNotEmpty &&
      state.trim().isNotEmpty &&
      pincode.trim().length == 6;

  String get formattedAddress =>
      '$addressLine${landmark != null && landmark!.isNotEmpty ? ", near $landmark" : ""}, $city, $state - $pincode';

  GlorovAddress copyWith({
    String? id,
    String? fullName,
    String? phoneNumber,
    String? addressLine,
    String? city,
    String? state,
    String? pincode,
    String? landmark,
    String? label,
    bool? isDefault,
  }) {
    return GlorovAddress(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      addressLine: addressLine ?? this.addressLine,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      landmark: landmark ?? this.landmark,
      label: label ?? this.label,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'fullName': fullName,
        'phoneNumber': phoneNumber,
        'addressLine': addressLine,
        'city': city,
        'state': state,
        'pincode': pincode,
        'landmark': landmark,
        'label': label,
        'isDefault': isDefault,
      };

  factory GlorovAddress.fromJson(Map<String, dynamic> json) {
    return GlorovAddress(
      id: json['id'] as String? ??
          'addr_${DateTime.now().millisecondsSinceEpoch}',
      fullName: json['fullName'] as String? ?? '',
      phoneNumber: json['phoneNumber'] as String? ?? '',
      addressLine: json['addressLine'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['state'] as String? ?? '',
      pincode: json['pincode'] as String? ?? '',
      landmark: json['landmark'] as String?,
      label: json['label'] as String? ?? 'Home',
      isDefault: json['isDefault'] as bool? ?? false,
    );
  }

  factory GlorovAddress.fromMedusaJson(Map<String, dynamic> json) {
    final first = json['first_name'] as String? ?? '';
    final last = json['last_name'] as String? ?? '';
    final fullName = ('$first $last').trim();
    final meta = json['metadata'] as Map<String, dynamic>? ?? {};

    return GlorovAddress(
      id: json['id'] as String? ?? '',
      fullName: fullName.isNotEmpty
          ? fullName
          : (json['company'] as String? ?? 'Recipient'),
      phoneNumber: json['phone'] as String? ?? '',
      addressLine: json['address_1'] as String? ?? '',
      city: json['city'] as String? ?? '',
      state: json['province'] as String? ?? '',
      pincode: json['postal_code'] as String? ?? '',
      landmark: json['address_2'] as String?,
      label: meta['label'] as String? ?? 'Home',
      isDefault: json['is_default_shipping'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toMedusaJson() {
    final names = fullName.trim().split(RegExp(r'\s+'));
    final firstName = names.isNotEmpty ? names.first : fullName;
    final lastName = names.length > 1 ? names.sublist(1).join(' ') : '';

    return {
      'first_name': firstName,
      'last_name': lastName,
      'address_1': addressLine,
      'address_2': landmark ?? '',
      'city': city,
      'province': state,
      'postal_code': pincode,
      'phone': phoneNumber,
      'is_default_shipping': isDefault,
      'metadata': {
        'label': label,
      },
    };
  }

  /// Empty address template for clean initialization
  static const GlorovAddress empty = GlorovAddress(
    id: '',
    fullName: '',
    phoneNumber: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    landmark: null,
    label: 'Home',
    isDefault: false,
  );

  /// Default demonstration primary home address
  static const GlorovAddress sample = GlorovAddress(
    id: 'addr_sample_1',
    fullName: 'Ananya Sharma',
    phoneNumber: '9876543210',
    addressLine: 'Flat 402, Green Meadows, 12th Main',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    landmark: 'Near Botanical Garden Gate',
    label: 'Home',
    isDefault: true,
  );

  /// Secondary demonstration office address
  static const GlorovAddress sampleWork = GlorovAddress(
    id: 'addr_sample_2',
    fullName: 'Ananya Sharma',
    phoneNumber: '9876543210',
    addressLine: 'Unit 301, Brigade Tech Gardens, Brookefield',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560066',
    landmark: 'Tower B, Kundalahalli',
    label: 'Work',
    isDefault: false,
  );
}
