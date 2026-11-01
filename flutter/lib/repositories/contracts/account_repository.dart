import '../../models/glorov/glorov_account_settings.dart';
import '../../models/glorov/glorov_address.dart';
import '../../models/glorov/glorov_user_profile.dart';
import '../remote/api_result.dart';

/// Authentication status for GLOROV customer sessions
enum GlorovAuthStatus {
  initial,
  unauthenticated,
  authenticating,
  authenticated,
  error,
}

/// Abstract Customer Account & Authentication Repository Contract
/// Decouples UI screens from authentication data sources (In-Memory Mock vs Medusa v2 Auth API).
abstract class AccountRepository {
  // Authentication & Session Management
  Future<ApiResult<GlorovUserProfile>> login({
    required String email,
    required String password,
  });

  Future<ApiResult<GlorovUserProfile>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  });

  Future<void> logout();

  Future<ApiResult<GlorovUserProfile>> checkSession();

  Future<ApiResult<void>> requestPasswordReset({required String email});

  Future<ApiResult<void>> updatePassword({required String newPassword});

  bool get isAuthenticated;

  String? get currentToken;

  // Profile Management
  Future<GlorovUserProfile> getProfile();
  Future<void> updateProfile(GlorovUserProfile profile);

  // Address Book Management
  Future<List<GlorovAddress>> getAddresses();
  Future<void> saveAddress(GlorovAddress address);
  Future<void> deleteAddress(String addressId);
  Future<void> setDefaultAddress(String addressId);

  // Preferences & Settings
  Future<GlorovAccountSettings> getSettings();
  Future<void> updateSettings(GlorovAccountSettings settings);
}
