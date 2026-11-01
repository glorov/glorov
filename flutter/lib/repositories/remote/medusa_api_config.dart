/// Configuration parameters for connecting to the GLOROV Medusa v2 Backend
class MedusaApiConfig {
  final String baseUrl;
  final String? publishableKey;
  final String? customerAuthToken;
  final Duration timeout;

  const MedusaApiConfig({
    this.baseUrl = defaultBaseUrl,
    this.publishableKey = defaultPublishableKey,
    this.customerAuthToken,
    this.timeout = const Duration(seconds: 15),
  });

  /// Compile-time environment configuration defaults
  static const String defaultBaseUrl = String.fromEnvironment(
    'MEDUSA_BASE_URL',
    defaultValue: 'http://localhost:9000',
  );

  static const String defaultPublishableKey = String.fromEnvironment(
    'MEDUSA_PUBLISHABLE_KEY',
    defaultValue: '',
  );

  /// Local development configuration
  static const MedusaApiConfig local = MedusaApiConfig(
    baseUrl: defaultBaseUrl,
    publishableKey: defaultPublishableKey,
  );

  /// Request headers with required Medusa v2 publishable key and auth tokens
  Map<String, String> get defaultHeaders {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    final key = publishableKey;
    if (key != null && key.isNotEmpty) {
      headers['x-publishable-api-key'] = key;
    }

    final token = customerAuthToken;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  MedusaApiConfig copyWith({
    String? baseUrl,
    String? publishableKey,
    String? customerAuthToken,
    Duration? timeout,
  }) {
    return MedusaApiConfig(
      baseUrl: baseUrl ?? this.baseUrl,
      publishableKey: publishableKey ?? this.publishableKey,
      customerAuthToken: customerAuthToken ?? this.customerAuthToken,
      timeout: timeout ?? this.timeout,
    );
  }
}
