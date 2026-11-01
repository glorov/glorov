# GLOROV — Backend Authentication & Customer Account Integration

**Document Version:** 1.0.0  
**Phase:** Step 3 of 5 — Backend Integration Sequence  
**Platform Target:** Flutter Web (with Android/iOS architecture parity)  
**Backend:** Medusa v2 (`@glorov/backend`) + PostgreSQL 16 + Redis 7  
**Contract Reference:** `apps/storefront/src/lib/customer.ts` & `apps/backend/src/api/store/`  

---

## 1. Overview & Scope

This document details the complete integration of customer authentication, profile management, and session persistence in the GLOROV Flutter Web application. 

The implementation preserves the existing GLOROV UI architecture, typography, color tokens, responsive layouts, and micro-interaction components while establishing a robust, production-grade authentication layer that seamlessly transitions between **Local Mock Mode** (for offline development and testing) and **Remote Medusa v2 Mode** (for live backend staging and production).

---

## 2. Confirmed Medusa v2 Authentication & Customer API Contract

Directly extracted from and verified against the production Medusa v2 codebase (`apps/storefront/src/lib/customer.ts` and `apps/backend/src/api/store/customers/me/password/route.ts`):

| Operation | Endpoint | Method | Headers | Request Payload | Response Data |
|---|---|---|---|---|---|
| **Customer Login** | `/auth/customer/emailpass` | `POST` | `Content-Type: application/json`, `x-publishable-api-key` | `{"email": "...", "password": "..."}` | `{"token": "jwt_session_token"}` |
| **Identity Registration** | `/auth/customer/emailpass/register` | `POST` | `Content-Type: application/json`, `x-publishable-api-key` | `{"email": "...", "password": "..."}` | `{"token": "jwt_identity_token"}` |
| **Create Store Customer** | `/store/customers` | `POST` | `Authorization: Bearer <identity_token>`, `x-publishable-api-key` | `{"email": "...", "first_name": "...", "last_name": "...", "phone": "..."}` | `{"customer": { "id": "cus_...", ... }}` |
| **Get Customer Profile** | `/store/customers/me?fields=*addresses` | `GET` | `Authorization: Bearer <session_token>`, `x-publishable-api-key` | None | `{"customer": { "id": "...", "email": "...", "first_name": "...", "last_name": "...", "addresses": [...] }}` |
| **Update Customer Profile** | `/store/customers/me` | `POST` | `Authorization: Bearer <session_token>`, `x-publishable-api-key` | `{"first_name": "...", "last_name": "...", "phone": "..."}` | `{"customer": { ... }}` |
| **Get Saved Addresses** | `/store/customers/me/addresses` | `GET` | `Authorization: Bearer <session_token>`, `x-publishable-api-key` | None | `{"addresses": [...]}` |
| **Save Address** | `/store/customers/me/addresses` | `POST` | `Authorization: Bearer <session_token>`, `x-publishable-api-key` | `{"first_name": "...", "last_name": "...", "address_1": "...", "city": "...", "postal_code": "...", ...}` | `{"address": { ... }}` |
| **Delete Address** | `/store/customers/me/addresses/:id` | `DELETE` | `Authorization: Bearer <session_token>`, `x-publishable-api-key` | None | `{"id": "addr_...", "deleted": true}` |
| **Update Password** | `/store/customers/me/password` | `POST` | `Authorization: Bearer <session_token>`, `x-publishable-api-key` | `{"password": "new_password"}` | `{"success": true}` |
| **Request Password Reset** | `/auth/customer/emailpass/reset-password` | `POST` | `Content-Type: application/json`, `x-publishable-api-key` | `{"email": "..."}` | `{"success": true}` |

---

## 3. Abstract Repository Contract (`AccountRepository`)

The abstract repository contract in `lib/repositories/contracts/account_repository.dart` defines the domain boundary, decoupling all UI widgets from network implementations:

```dart
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

  // Profile & Address Management
  Future<GlorovUserProfile> getProfile();
  Future<void> updateProfile(GlorovUserProfile profile);
  Future<List<GlorovAddress>> getAddresses();
  Future<void> saveAddress(GlorovAddress address);
  Future<void> deleteAddress(String addressId);
}
```

---

## 4. Dual Implementations

### 4.1 Mock Implementation (`LocalAccountRepository`)
Located at `lib/repositories/mock/local_account_repository.dart`:
- Persists session tokens using `GlorovLocalStorage` under key `glorov_customer_token`.
- Returns `ApiSuccess` with a dynamically generated profile for normal credentials.
- Accurately simulates error conditions:
  - `fail@test.com` or `wrong_password` -> `ApiFailure('Invalid email or password', statusCode: 401)`
  - `existing@test.com` -> `ApiFailure('An account with this email already exists', statusCode: 409)`
  - `unknown@test.com` on reset -> `ApiFailure('No account found for this email address', statusCode: 404)`
  - Password < 8 characters on update -> `ApiFailure('Password must be at least 8 characters long', statusCode: 400)`
- `logout()` removes `glorov_customer_token` and resets state to guest defaults.

### 4.2 Remote Medusa Implementation (`MedusaAccountRepository`)
Located at `lib/repositories/remote/medusa_account_repository.dart`:
- Uses `MedusaHttpClient` configured with `MedusaApiConfig` (`baseUrl`, `publishableKey`).
- **3-Step Registration Sequence**:
  1. Issues `POST /auth/customer/emailpass/register` to create the auth identity, receiving an identity token.
  2. Issues `POST /store/customers` with `Authorization: Bearer <identity_token>` to establish the Medusa store customer record.
  3. Issues `POST /auth/customer/emailpass` to obtain the persistent session token, then fetches `/store/customers/me`.
- **Login Flow**:
  1. Issues `POST /auth/customer/emailpass` with `{email, password}`.
  2. Stores session token in `glorov_customer_token`.
  3. Attaches `Authorization: Bearer <token>` to all subsequent requests.
  4. Retrieves fresh customer record from `/store/customers/me?fields=*addresses`.
- **Session Restoration**:
  1. Reads `glorov_customer_token` from browser storage.
  2. Validates token via `GET /store/customers/me`.
  3. If token is expired (401), automatically clears storage and invokes `logout()`.

---

## 5. Reactive State Management (`GlorovAccountState`)

Located at `lib/services/glorov_account_state.dart`:
- Exposes authentication state via `GlorovAuthStatus`:
  - `initial`: App initializing.
  - `unauthenticated`: Browsing as guest.
  - `authenticating`: Login/register request in flight (drives button spinners and disabled states).
  - `authenticated`: Active customer session.
  - `error`: Failed operation with user-facing error message in `authError`.
- Automatically synchronizes with `GlorovLocalStorage` to persist customer profile and settings.
- Integrated `restoreSession()` called during app launch in `main.dart`.

---

## 6. UI Screens & Interactive Features

### 6.1 `LoginScreen` (`lib/screens/auth/views/login_screen.dart`)
- Integrated with `LogInForm`, binding `_emailController` and `_passwordController`.
- Form validation for email format and password length.
- Displays inline error banner when `GlorovAccountState.authError` is present.
- Displays responsive progress indicator inside the primary button during authentication.
- Shows success toast on login and navigates to `profileScreenRoute`.
- Provides "Forgot password?" navigation and "Sign up" toggle.

### 6.2 `SignUpScreen` & `SignUpForm` (`lib/screens/auth/views/signup_screen.dart`, `components/sign_up_form.dart`)
- Complete registration fields: First Name, Last Name, Email, Phone Number (optional), and Password.
- Interactive Terms of Service agreement checkbox.
- Connects directly to `GlorovAccountState.register()`.
- Responsive container (centered 480px card on desktop, full-width on mobile) preventing flex overflows on narrow devices.

### 6.3 `PasswordRecoveryScreen` (`lib/screens/auth/views/password_recovery_screen.dart`)
- Completely replaced previous placeholder kit with a functional GLOROV password recovery workflow.
- Clean email input with validation.
- Calls `GlorovAccountState.requestPasswordReset(email)`.
- Seamlessly transitions to a botanical success card with confirmation and "Return to Sign In" CTA.

### 6.4 Customer Account & Session Management (`GlorovSettingsSection` & `GlorovAccountScreen`)
- Added **Customer Authentication & Session** card in Account Settings:
  - Displays authenticated email with a verified badge, or "Guest Session" indicator.
  - "Change Password" dialog modal validating and submitting to `GlorovAccountState.updatePassword()`.
  - "Sign Out" action with confirmation alert dialog.
- Added "Sign Out" / "Sign In" actions in desktop sidebar and mobile menu.
- Updated Account Overview card badge from hardcoded `'DEMO'` to dynamic `'VERIFIED'` / `'DEMO'`.

---

## 7. Verification & Quality Assurance

### 7.1 Unit & Widget Test Suite
A dedicated test suite was implemented in `flutter/test/glorov_authentication_test.dart` covering 18 comprehensive test cases:
1. `LocalAccountRepository`: Login success, 401 invalid credentials, register success, 409 conflict, session restoration, logout cleanup, password reset, password length validation.
2. `MedusaAccountRepository`: Login flow with bearer token injection, 401 error propagation, 3-step registration sequence, password reset endpoint call, password update with Authorization header.
3. `GlorovAccountState`: Reactive state transitions, profile synchronization, logout reset.
4. Widget Tests: `LoginScreen` validation and render, `SignUpScreen` inputs and terms checkbox, `PasswordRecoveryScreen` submission and success view transition.

### 7.2 Full Test Suite Regression Results
```
00:06 +126: All tests passed!
```
- **126 / 126 tests passing** across all 11 project test files.
- Zero failures, zero warnings, and zero regressions.

### 7.3 Flutter Web Release Compilation
```
Compiling lib/main.dart for the Web...                             25.1s
✓ Built build/web
```
- Clean release build with tree-shaking enabled.
