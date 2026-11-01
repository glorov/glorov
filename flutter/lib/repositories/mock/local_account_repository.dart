import '../../models/glorov/glorov_account_settings.dart';
import '../../models/glorov/glorov_address.dart';
import '../../models/glorov/glorov_user_profile.dart';
import '../../services/glorov_account_state.dart';
import '../../services/glorov_cart_state.dart';
import '../../services/storage/local_storage.dart';
import '../contracts/account_repository.dart';
import '../remote/api_result.dart';

/// Local Storage / In-Memory Mock implementation of AccountRepository
/// Supports offline customer authentication and demo testing.
class LocalAccountRepository implements AccountRepository {
  final GlorovAccountState _accountState;
  final GlorovCartState _cartState;
  final GlorovLocalStorage _storage;

  bool _isAuthenticated = false;
  String? _token;

  LocalAccountRepository([
    GlorovAccountState? accountState,
    GlorovCartState? cartState,
    GlorovLocalStorage? storage,
  ])  : _accountState = accountState ?? GlorovAccountState.instance,
        _cartState = cartState ?? GlorovCartState.instance,
        _storage = storage ?? GlorovLocalStorage.instance {
    _restoreLocalSession();
  }

  void _restoreLocalSession() {
    final storedToken = _storage.getItem('glorov_customer_token');
    if (storedToken != null && storedToken.isNotEmpty) {
      _token = storedToken;
      _isAuthenticated = true;
    }
  }

  @override
  bool get isAuthenticated => _isAuthenticated;

  @override
  String? get currentToken => _token;

  @override
  Future<ApiResult<GlorovUserProfile>> login({
    required String email,
    required String password,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    if (cleanEmail == 'fail@test.com' || password == 'wrong_password') {
      return const ApiFailure('Invalid email or password', statusCode: 401);
    }

    _token = 'mock_jwt_customer_${cleanEmail.hashCode.abs()}';
    _isAuthenticated = true;
    _storage.setItem('glorov_customer_token', _token!);

    // If logging in with a specific name, update profile
    final names = cleanEmail.split('@').first.split('.');
    final firstName = names.first[0].toUpperCase() + names.first.substring(1);
    final lastName = names.length > 1
        ? names.last[0].toUpperCase() + names.last.substring(1)
        : 'Botanist';

    final profile = _accountState.profile.copyWith(
      displayName: '$firstName $lastName',
      email: cleanEmail,
      isDemoAccount: false,
    );
    _accountState.updateProfile(profile);

    return ApiSuccess(profile);
  }

  @override
  Future<ApiResult<GlorovUserProfile>> register({
    required String email,
    required String password,
    required String firstName,
    required String lastName,
    String? phone,
  }) async {
    final cleanEmail = email.trim().toLowerCase();
    if (cleanEmail == 'existing@test.com') {
      return const ApiFailure('An account with this email already exists',
          statusCode: 409);
    }

    _token = 'mock_jwt_customer_${cleanEmail.hashCode.abs()}';
    _isAuthenticated = true;
    _storage.setItem('glorov_customer_token', _token!);

    final fullName = ('${firstName.trim()} ${lastName.trim()}').trim();
    final profile = GlorovUserProfile(
      id: 'cus_mock_${DateTime.now().millisecondsSinceEpoch}',
      displayName: fullName.isNotEmpty ? fullName : cleanEmail,
      email: cleanEmail,
      phoneNumber: phone?.trim() ?? '9876543210',
      memberSince: 'October 2026',
      membershipTier: 'Botanical Patron • Green Club',
      isDemoAccount: false,
    );
    _accountState.updateProfile(profile);

    return ApiSuccess(profile);
  }

  @override
  Future<void> logout() async {
    _token = null;
    _isAuthenticated = false;
    _storage.removeItem('glorov_customer_token');
    _accountState.resetEntireDemoAccount();
  }

  @override
  Future<ApiResult<GlorovUserProfile>> checkSession() async {
    final storedToken = _storage.getItem('glorov_customer_token');
    if (storedToken != null && storedToken.isNotEmpty) {
      _token = storedToken;
      _isAuthenticated = true;
      return ApiSuccess(_accountState.profile);
    }
    _token = null;
    _isAuthenticated = false;
    return const ApiFailure('No active customer session', statusCode: 401);
  }

  @override
  Future<ApiResult<void>> requestPasswordReset({required String email}) async {
    final cleanEmail = email.trim().toLowerCase();
    if (cleanEmail == 'unknown@test.com') {
      return const ApiFailure('No account found for this email address',
          statusCode: 404);
    }
    return const ApiSuccess(null);
  }

  @override
  Future<ApiResult<void>> updatePassword({required String newPassword}) async {
    if (newPassword.length < 8) {
      return const ApiFailure('Password must be at least 8 characters long',
          statusCode: 400);
    }
    return const ApiSuccess(null);
  }

  @override
  Future<GlorovUserProfile> getProfile() async {
    return _accountState.profile;
  }

  @override
  Future<void> updateProfile(GlorovUserProfile profile) async {
    _accountState.updateProfile(profile);
  }

  @override
  Future<List<GlorovAddress>> getAddresses() async {
    return _cartState.addresses;
  }

  @override
  Future<void> saveAddress(GlorovAddress address) async {
    final exists = _cartState.addresses
        .any((a) => a.id == address.id && address.id.isNotEmpty);
    if (exists) {
      _cartState.updateAddress(address);
    } else {
      _cartState.addAddress(address);
    }
  }

  @override
  Future<void> deleteAddress(String addressId) async {
    _cartState.deleteAddress(addressId);
  }

  @override
  Future<void> setDefaultAddress(String addressId) async {
    _cartState.setDefaultAddress(addressId);
  }

  @override
  Future<GlorovAccountSettings> getSettings() async {
    return _accountState.settings;
  }

  @override
  Future<void> updateSettings(GlorovAccountSettings settings) async {
    _accountState.updateSettings(settings);
  }
}
