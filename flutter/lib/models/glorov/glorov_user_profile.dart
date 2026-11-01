/// Customer Profile Model for GLOROV Botanical E-Commerce
class GlorovUserProfile {
  final String id;
  final String displayName;
  final String email;
  final String phoneNumber;
  final String? avatarUrl;
  final String memberSince;
  final String membershipTier;
  final bool isDemoAccount;

  const GlorovUserProfile({
    required this.id,
    required this.displayName,
    required this.email,
    required this.phoneNumber,
    this.avatarUrl,
    required this.memberSince,
    this.membershipTier = 'Botanical Patron • Green Club',
    this.isDemoAccount = true,
  });

  String get initials {
    final parts = displayName.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts[0].isEmpty) return 'G';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  static String? validateName(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter your full name';
    }
    if (value.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter an email address';
    }
    final emailRegex =
        RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Please enter your mobile number';
    }
    final clean = value.replaceAll(RegExp(r'[\s\-\+\(\)]'), '');
    final phoneRegex = RegExp(r'^[6-9]\d{9}$');
    if (!phoneRegex.hasMatch(clean)) {
      return 'Enter a valid 10-digit Indian mobile number';
    }
    return null;
  }

  GlorovUserProfile copyWith({
    String? id,
    String? displayName,
    String? email,
    String? phoneNumber,
    String? avatarUrl,
    String? memberSince,
    String? membershipTier,
    bool? isDemoAccount,
  }) {
    return GlorovUserProfile(
      id: id ?? this.id,
      displayName: displayName ?? this.displayName,
      email: email ?? this.email,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      memberSince: memberSince ?? this.memberSince,
      membershipTier: membershipTier ?? this.membershipTier,
      isDemoAccount: isDemoAccount ?? this.isDemoAccount,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'displayName': displayName,
        'email': email,
        'phoneNumber': phoneNumber,
        'avatarUrl': avatarUrl,
        'memberSince': memberSince,
        'membershipTier': membershipTier,
        'isDemoAccount': isDemoAccount,
      };

  factory GlorovUserProfile.fromJson(Map<String, dynamic> json) {
    return GlorovUserProfile(
      id: json['id'] as String? ?? 'usr_demo_01',
      displayName: json['displayName'] as String? ?? 'Ananya Sharma',
      email: json['email'] as String? ?? 'ananya.sharma@example.com',
      phoneNumber: json['phoneNumber'] as String? ?? '9876543210',
      avatarUrl: json['avatarUrl'] as String?,
      memberSince: json['memberSince'] as String? ?? 'March 2026',
      membershipTier:
          json['membershipTier'] as String? ?? 'Botanical Patron • Green Club',
      isDemoAccount: json['isDemoAccount'] as bool? ?? true,
    );
  }

  /// Deserializes a Medusa v2 Storefront Customer Object into GlorovUserProfile
  factory GlorovUserProfile.fromMedusaCustomerJson(Map<String, dynamic> json) {
    final firstName = json['first_name'] as String? ?? '';
    final lastName = json['last_name'] as String? ?? '';
    final name = ('$firstName $lastName').trim();
    final meta = json['metadata'] as Map<String, dynamic>? ?? {};

    return GlorovUserProfile(
      id: json['id'] as String? ?? '',
      displayName: name.isNotEmpty
          ? name
          : (json['email'] as String? ?? 'Botanical Patron'),
      email: json['email'] as String? ?? '',
      phoneNumber: json['phone'] as String? ?? '',
      avatarUrl: meta['avatar_url'] as String?,
      memberSince: meta['member_since'] as String? ?? 'March 2026',
      membershipTier:
          meta['membership_tier'] as String? ?? 'Botanical Patron • Green Club',
      isDemoAccount: false,
    );
  }

  /// Initial mock demonstration profile
  static const GlorovUserProfile sample = GlorovUserProfile(
    id: 'usr_demo_01',
    displayName: 'Ananya Sharma',
    email: 'ananya.sharma@example.com',
    phoneNumber: '9876543210',
    avatarUrl: null,
    memberSince: 'March 2026',
    membershipTier: 'Botanical Patron • Green Club',
    isDemoAccount: true,
  );
}
