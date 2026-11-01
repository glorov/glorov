import 'local_storage.dart';

class InMemoryLocalStorage implements GlorovLocalStorage {
  final Map<String, String> _store = {};

  @override
  String? getItem(String key) => _store[key];

  @override
  void setItem(String key, String value) {
    _store[key] = value;
  }

  @override
  void removeItem(String key) {
    _store.remove(key);
  }

  @override
  void clear() {
    _store.clear();
  }
}

GlorovLocalStorage getLocalStorage() => InMemoryLocalStorage();
