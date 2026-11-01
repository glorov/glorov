import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Premium Botanical SVG Icons for GLOROV Category Navigation
/// Matching high-craft organic e-commerce aesthetics (seeds, live plants, planters, plant care, etc.)
class GlorovCategorySvgIcons {
  const GlorovCategorySvgIcons._();

  static const String seeds = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21C12 21 6 16.5 6 11.5C6 8 8.686 5 12 5C15.314 5 18 8 18 11.5C18 16.5 12 21 12 21Z" /><path d="M12 9V17" /><path d="M12 11.5C13.8 9.8 16.2 9.5 17 10" /><path d="M12 13.5C10.2 12 7.8 12.2 7 13" /></svg>''';

  static const String livePlants = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16H17L15.8 21.5H8.2L7 16Z" /><path d="M6 16H18" /><path d="M12 16V9" /><path d="M12 11C9.5 7.5 5.5 8 5 8.5C5 12 9 12.5 12 11Z" /><path d="M12 9.5C14.5 6 18.5 6.5 19 7C19 10.5 15 11 12 9.5Z" /></svg>''';

  static const String planters = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="4.5" rx="1.5" /><path d="M6.8 8.5L8.2 18.5H15.8L17.2 8.5" /><line x1="12" y1="11.5" x2="12" y2="15.5" /><path d="M6 21H18" /></svg>''';

  static const String plantCare = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C12 3 5.5 10.5 5.5 15.5C5.5 19.1 8.4 22 12 22C15.6 22 18.5 19.1 18.5 15.5C18.5 10.5 12 3 12 3Z" /><path d="M12 11.5C13.5 13 14 15 13.5 17C12.5 17.5 10.8 17 9.8 15.5C9.2 14.5 9.8 12.8 12 11.5Z" /></svg>''';

  static const String flowering = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.8" /><circle cx="12" cy="5.8" r="2.5" /><circle cx="17.4" cy="8.9" r="2.5" /><circle cx="17.4" cy="15.1" r="2.5" /><circle cx="12" cy="18.2" r="2.5" /><circle cx="6.6" cy="15.1" r="2.5" /><circle cx="6.6" cy="8.9" r="2.5" /></svg>''';

  static const String herbs = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20H20" /><path d="M12 20C12 13 9 7 4 5C6 11 8.5 16 12 20Z" /><path d="M12 20C12 12 15 7 20 5C18 11 15.5 16 12 20Z" /><path d="M12 20V10" /></svg>''';

  static const String vegetables = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="6.5" cy="17.5" r="3.5" /><circle cx="18" cy="18" r="2" /><path d="M6.5 14V8.5H10.5L12.5 12.5H18V16" /><path d="M10 17.5H16" /><path d="M10.5 8.5V5.5H12" /><path d="M14.5 12.5V9.5H17.5V12.5" /></svg>''';

  static const String offers = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="5" x2="5" y2="19" /><circle cx="7.5" cy="7.5" r="2.5" /><circle cx="16.5" cy="16.5" r="2.5" /></svg>''';

  /// Custom Artisanal Guest User Icon (when unauthenticated / not logged in)
  static const String guestUser = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7.5" r="4"/><path d="M4 20.5a8 8 0 0 1 12.5 -6.5"/><circle cx="18" cy="18" r="3.5" fill="#f0fdf4" stroke="currentColor" stroke-width="1.6"/><path d="M18 16.2v3.6" stroke-width="1.6"/><path d="M16.2 18h3.6" stroke-width="1.6"/></svg>''';

  /// Custom Authenticated Customer Icon (with verification badge)
  static const String authenticatedUser = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7.5" r="4" fill="currentColor" fill-opacity="0.12"/><path d="M4 20.5a8 8 0 0 1 11 -7"/><circle cx="18" cy="17.5" r="4" fill="#0a4c36" stroke="#ffffff" stroke-width="1.5"/><path d="M16.5 17.5l1 1 2 -2" stroke="#ffffff" stroke-width="1.6"/></svg>''';

  /// Returns rendered SVG widget with smooth color filtration
  static Widget buildSvgIcon(
    String svgXml, {
    double size = 21.0,
    required Color color,
  }) {
    return SvgPicture.string(
      svgXml,
      width: size,
      height: size,
      colorFilter: ColorFilter.mode(color, BlendMode.srcIn),
    );
  }
}
