// Non-web fallback stubs for metadata manipulation

void updateWebMeta({
  required String title,
  required String description,
  required String imageUrl,
  required String url,
  required String type,
  String? price,
}) {
  // No-op on mobile/desktop platforms
}

Future<bool> shareOnWeb({
  required String title,
  required String text,
  required String url,
}) async {
  return false;
}
