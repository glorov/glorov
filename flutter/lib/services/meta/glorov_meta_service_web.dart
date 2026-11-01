import 'dart:js_interop';
import 'package:web/web.dart' as web;

/// Web implementation for dynamically mutating document title, Open Graph tags, and social share
void updateWebMeta({
  required String title,
  required String description,
  required String imageUrl,
  required String url,
  required String type,
  String? price,
}) {
  try {
    // 1. Update Title
    web.document.title = title;

    // 2. Helper to set or create meta elements
    void setMeta(String attr, String name, String content) {
      var el = web.document.querySelector('meta[$attr="$name"]') as web.HTMLMetaElement?;
      if (el == null) {
        el = web.document.createElement('meta') as web.HTMLMetaElement;
        el.setAttribute(attr, name);
        web.document.head?.appendChild(el);
      }
      el.content = content;
    }

    // 3. Primary SEO tags
    setMeta('name', 'description', description);
    setMeta('name', 'title', title);

    // 4. Open Graph tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:secure_url', imageUrl);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);

    if (price != null) {
      setMeta('property', 'og:price:amount', price);
      setMeta('property', 'og:price:currency', 'INR');
      setMeta('property', 'product:price:amount', price);
      setMeta('property', 'product:price:currency', 'INR');
      setMeta('property', 'product:availability', 'in stock');
    }

    // 5. Twitter Card tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    // 6. Canonical link
    var canonical = web.document.querySelector('link[rel="canonical"]') as web.HTMLLinkElement?;
    if (canonical == null) {
      canonical = web.document.createElement('link') as web.HTMLLinkElement;
      canonical.rel = 'canonical';
      web.document.head?.appendChild(canonical);
    }
    canonical.href = url;
  } catch (e) {
    // Fail safely if DOM manipulation fails in non-standard web view
  }
}

/// Triggers Web Share API if supported
Future<bool> shareOnWeb({
  required String title,
  required String text,
  required String url,
}) async {
  try {
    final nav = web.window.navigator;
    // Check if navigator.share exists
    final hasShare = nav.canShare(web.ShareData(url: url));
    if (hasShare) {
      await nav.share(web.ShareData(title: title, text: text, url: url)).toDart;
      return true;
    }
  } catch (_) {
    // Web Share API aborted by user or not supported
  }
  return false;
}
