/// Type-safe Result wrapper for asynchronous API boundary operations
sealed class ApiResult<T> {
  const ApiResult();

  factory ApiResult.success(T data) = ApiSuccess<T>;
  factory ApiResult.failure(String message, {int? statusCode, dynamic error}) =
      ApiFailure<T>;

  bool get isSuccess => this is ApiSuccess<T>;
  bool get isFailure => this is ApiFailure<T>;

  T? get data => dataOrNull;
  T? get dataOrNull => isSuccess ? (this as ApiSuccess<T>).data : null;
  String? get errorOrNull => isFailure ? (this as ApiFailure<T>).message : null;
  int? get statusCodeOrNull =>
      isFailure ? (this as ApiFailure<T>).statusCode : null;

  T get requireData {
    if (this is ApiSuccess<T>) {
      return (this as ApiSuccess<T>).data;
    }
    throw StateError('Cannot retrieve data from ApiFailure: $errorOrNull');
  }

  R fold<R>({
    required R Function(T data) onSuccess,
    required R Function(String message, int? statusCode) onFailure,
  }) {
    if (this is ApiSuccess<T>) {
      return onSuccess((this as ApiSuccess<T>).data);
    } else {
      final fail = this as ApiFailure<T>;
      return onFailure(fail.message, fail.statusCode);
    }
  }
}

class ApiSuccess<T> extends ApiResult<T> {
  final T data;
  const ApiSuccess(this.data);
}

class ApiFailure<T> extends ApiResult<T> {
  final String message;
  final int? statusCode;
  final dynamic error;

  const ApiFailure(this.message, {this.statusCode, this.error});

  factory ApiFailure.badRequest([String message = 'Bad request']) =>
      ApiFailure(message, statusCode: 400);

  factory ApiFailure.unauthorized([String message = 'Unauthorized session']) =>
      ApiFailure(message, statusCode: 401);

  factory ApiFailure.forbidden([String message = 'Access forbidden']) =>
      ApiFailure(message, statusCode: 403);

  factory ApiFailure.notFound([String message = 'Resource not found']) =>
      ApiFailure(message, statusCode: 404);

  factory ApiFailure.serverError([String message = 'Server error occurred']) =>
      ApiFailure(message, statusCode: 500);

  factory ApiFailure.networkError(
          [String message = 'Network connectivity error']) =>
      ApiFailure(message, statusCode: null);

  factory ApiFailure.timeout([String message = 'Request timed out']) =>
      ApiFailure(message, statusCode: 408);
}
