import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_result.dart';
import 'medusa_api_config.dart';

/// Centralized HTTP Network Client for GLOROV Medusa v2 Storefront API
///
/// Features:
/// - Base URL and path concatenation
/// - Query parameter formatting
/// - Publishable API key and customer JWT header injection
/// - Request timeout management
/// - HTTP error mapping with safe sanitized messages
/// - Resource disposal
/// - Injectable http.Client for unit testing with MockClient
class MedusaHttpClient {
  final MedusaApiConfig config;
  final http.Client _client;

  MedusaHttpClient({
    MedusaApiConfig? config,
    http.Client? client,
  })  : config = config ?? MedusaApiConfig.local,
        _client = client ?? http.Client();

  /// Resolves the absolute Uri for a path and optional query parameters
  Uri _buildUri(String path, [Map<String, dynamic>? queryParameters]) {
    final base = config.baseUrl.endsWith('/')
        ? config.baseUrl.substring(0, config.baseUrl.length - 1)
        : config.baseUrl;
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    final fullUrl = '$base$normalizedPath';

    final uri = Uri.parse(fullUrl);
    if (queryParameters == null || queryParameters.isEmpty) {
      return uri;
    }

    final queryMap = <String, dynamic>{...uri.queryParameters};
    queryParameters.forEach((key, value) {
      if (value != null) {
        if (value is Iterable) {
          queryMap[key] = value.map((e) => e.toString()).toList();
        } else {
          queryMap[key] = value.toString();
        }
      }
    });

    return uri.replace(queryParameters: queryMap);
  }

  /// Merges default headers with request-specific headers
  Map<String, String> _buildHeaders(Map<String, String>? customHeaders) {
    final headers = Map<String, String>.from(config.defaultHeaders);
    if (customHeaders != null) {
      headers.addAll(customHeaders);
    }
    return headers;
  }

  /// Parses HTTP response into typed ApiResult
  ApiResult<T> _handleResponse<T>(
    http.Response response,
    T Function(dynamic json)? parser,
  ) {
    final status = response.statusCode;

    // Handle 204 No Content
    if (status == 204) {
      if (parser != null) {
        return ApiResult.success(parser({}));
      }
      return ApiResult.success(null as T);
    }

    dynamic decodedBody;
    try {
      if (response.body.isNotEmpty) {
        decodedBody = jsonDecode(utf8.decode(response.bodyBytes));
      }
    } catch (e) {
      return ApiResult.failure(
        'Failed to parse server response as JSON',
        statusCode: status,
        error: e,
      );
    }

    if (status >= 200 && status < 300) {
      try {
        if (parser != null) {
          final parsed = parser(decodedBody);
          return ApiResult.success(parsed);
        }
        return ApiResult.success(decodedBody as T);
      } catch (e) {
        return ApiResult.failure(
          'Failed to deserialize API payload: $e',
          statusCode: status,
          error: e,
        );
      }
    }

    // Extract sanitized error message from Medusa response format
    String message = 'HTTP Request failed with status $status';
    if (decodedBody is Map) {
      final msg = decodedBody['message'] ?? decodedBody['error'];
      if (msg != null && msg.toString().isNotEmpty) {
        message = msg.toString();
      }
    }

    return ApiResult.failure(message, statusCode: status);
  }

  /// Sends a GET request
  Future<ApiResult<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final response = await _client
          .get(uri, headers: _buildHeaders(headers))
          .timeout(config.timeout);
      return _handleResponse<T>(response, parser);
    } on TimeoutException {
      return ApiResult.failure(
        'Request timed out after ${config.timeout.inSeconds} seconds',
        statusCode: 408,
      );
    } on http.ClientException catch (e) {
      return ApiResult.failure(
        'Network connection error: ${e.message}',
        error: e,
      );
    } catch (e) {
      return ApiResult.failure(
        'Unexpected network failure: $e',
        error: e,
      );
    }
  }

  /// Sends a POST request
  Future<ApiResult<T>> post<T>(
    String path, {
    Object? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final encodedBody = body != null ? jsonEncode(body) : null;
      final response = await _client
          .post(
            uri,
            headers: _buildHeaders(headers),
            body: encodedBody,
          )
          .timeout(config.timeout);
      return _handleResponse<T>(response, parser);
    } on TimeoutException {
      return ApiResult.failure(
        'Request timed out after ${config.timeout.inSeconds} seconds',
        statusCode: 408,
      );
    } on http.ClientException catch (e) {
      return ApiResult.failure(
        'Network connection error: ${e.message}',
        error: e,
      );
    } catch (e) {
      return ApiResult.failure(
        'Unexpected network failure: $e',
        error: e,
      );
    }
  }

  /// Sends a PUT request
  Future<ApiResult<T>> put<T>(
    String path, {
    Object? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final encodedBody = body != null ? jsonEncode(body) : null;
      final response = await _client
          .put(
            uri,
            headers: _buildHeaders(headers),
            body: encodedBody,
          )
          .timeout(config.timeout);
      return _handleResponse<T>(response, parser);
    } on TimeoutException {
      return ApiResult.failure(
        'Request timed out after ${config.timeout.inSeconds} seconds',
        statusCode: 408,
      );
    } on http.ClientException catch (e) {
      return ApiResult.failure(
        'Network connection error: ${e.message}',
        error: e,
      );
    } catch (e) {
      return ApiResult.failure(
        'Unexpected network failure: $e',
        error: e,
      );
    }
  }

  /// Sends a DELETE request
  Future<ApiResult<T>> delete<T>(
    String path, {
    Object? body,
    Map<String, dynamic>? queryParameters,
    Map<String, String>? headers,
    T Function(dynamic json)? parser,
  }) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final encodedBody = body != null ? jsonEncode(body) : null;
      final response = await _client
          .delete(
            uri,
            headers: _buildHeaders(headers),
            body: encodedBody,
          )
          .timeout(config.timeout);
      return _handleResponse<T>(response, parser);
    } on TimeoutException {
      return ApiResult.failure(
        'Request timed out after ${config.timeout.inSeconds} seconds',
        statusCode: 408,
      );
    } on http.ClientException catch (e) {
      return ApiResult.failure(
        'Network connection error: ${e.message}',
        error: e,
      );
    } catch (e) {
      return ApiResult.failure(
        'Unexpected network failure: $e',
        error: e,
      );
    }
  }

  /// Closes the HTTP client and releases resources
  void close() {
    _client.close();
  }
}
