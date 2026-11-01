// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;
import 'local_storage.dart';

class WebLocalStorage implements GlorovLocalStorage {
  @override
  String? getItem(String key) {
    try {
      return html.window.localStorage[key];
    } catch (_) {
      return null;
    }
  }

  @override
  void setItem(String key, String value) {
    try {
      html.window.localStorage[key] = value;
    } catch (_) {}
  }

  @override
  void removeItem(String key) {
    try {
      html.window.localStorage.remove(key);
    } catch (_) {}
  }

  @override
  void clear() {
    try {
      html.window.localStorage.clear();
    } catch (_) {}
  }
}

GlorovLocalStorage getLocalStorage() => WebLocalStorage();
