import 'local_storage_stub.dart'
    if (dart.library.html) 'local_storage_web.dart';

/// Cross-platform Local Storage Abstraction for GLOROV Shopping State
abstract class GlorovLocalStorage {
  static final GlorovLocalStorage instance = getLocalStorage();

  String? getItem(String key);
  void setItem(String key, String value);
  void removeItem(String key);
  void clear();
}
