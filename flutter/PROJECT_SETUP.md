# GLOROV Flutter Web Frontend - Project Setup & Toolchain Guide

## 1. Project Overview & Location
- **Project Name:** GLOROV Flutter Web Frontend
- **Brand Identity:** GLOROV • Premium Seeds, Live Houseplants & Botanical Supplies
- **Tagline:** *"Grow More. Live Greener."*
- **Upstream Repository:** [https://github.com/abuanwar072/E-commerce-Complete-Flutter-UI](https://github.com/abuanwar072/E-commerce-Complete-Flutter-UI)
- **Local Location:** `/Users/sourav/Developer/WEB/top-projects/glorov/flutter`
- **Current Target Scope:** **Web Only** (Android / iOS platforms remain in repository for future phases, but are not built or tested in this phase).

---

## 2. Licensing & Commercial Reuse Findings
- **Upstream License:** The upstream GitHub repository contains no explicit open source license file (`LICENSE` was not present; GitHub API returns `"license": null`).
- **Commercial Usage Consideration:** The upstream project is distributed as a free sample of a paid commercial UI kit sold by *The Flutter Way* on Gumroad (`https://theflutterway.gumroad.com/l/fluttershop`).
- **Commercial Reuse Guideline for GLOROV:**
  - The project structure and UI flow serve as an architectural prototype for GLOROV.
  - All original third-party branding (such as "Shoplon", "Lipsy London") and demo clothing data have been replaced with the GLOROV botanical design system, custom typographic wordmark, and realistic Indian botanical seeds & plants catalog.
  - Before public production release, all images should be served from GLOROV's secure CDN or local asset pipeline.

---

## 3. Environment & Toolchain Specifications
- **Flutter SDK:** Flutter `3.47.8` (Channel `stable`) installed at `/opt/homebrew/share/flutter` (Binary symlinked to `/opt/homebrew/bin/flutter`).
- **Dart SDK:** Dart `3.13.7` (Stable) on `macos_arm64`.
- **Supported Browser:** Google Chrome `156.0.8078.48` located at `/Applications/Google Chrome.app`.
- **Package Manager:** Homebrew `7.0.11` on macOS Darwin 27.0.1 (Apple Silicon M2).
- **Git Version:** Git `2.54.0` at `/opt/homebrew/bin/git`.

---

## 4. Web Setup & Dependency Commands

### Install Dependencies
```bash
cd flutter
flutter pub get
```

### Run Automated Test Suite
```bash
cd flutter
flutter test
```
*(Status: 13/13 tests pass, verifying cart calculations, profile validation, address book, notification center, and smoke rendering).*

### Static Analysis
```bash
cd flutter
flutter analyze --no-fatal-infos
```
*(Status: 0 errors).*

### Run the Web Application in Chrome
```bash
cd flutter
flutter run -d chrome
```

### Build Production Web Artifact
```bash
cd flutter
flutter build web
```
The output is generated in `flutter/build/web/` containing `index.html`, `main.dart.js`, `flutter_bootstrap.js`, and `assets/`.

---

## 5. Key Architecture & File Structure
```
flutter/
├── build/web/                     # Compiled production web bundle
├── web/                           # Web scaffolding (index.html, manifest.json, icons)
├── assets/                        # SVG icons, logo, illustrations, fonts
│   ├── icons/                     # UI SVG icons (Search, Bag, Bookmark, Profile)
│   └── fonts/                     # Plus Jakarta and Grandis Extended fonts
├── lib/
│   ├── main.dart                  # Application entry point with initialRoute: homeScreenRoute
│   ├── constants.dart             # Legacy fallback constants
│   ├── core/theme/                # Centralized Design Tokens System
│   │   ├── app_colors.dart        # Botanical palette tokens (Forest Deep, Sage, Mint, Earth Gold)
│   │   ├── app_typography.dart    # Plus Jakarta & Grandis Extended text scale
│   │   ├── app_spacing.dart       # 4px to 64px scale
│   │   ├── app_radii.dart         # Standardized corner radii (4px, 8px, 12px, 16px, pill)
│   │   ├── app_shadows.dart       # Elevation tokens (card, hover, header, dropdown)
│   │   ├── app_breakpoints.dart   # Responsive rules (Desktop > 1024, Tablet 641-1024, Mobile <= 640)
│   │   ├── app_motion.dart        # Durations & curves
│   │   └── app_theme.dart         # Material 3 ThemeData & AppThemeTokens extension
│   ├── components/
│   │   ├── navigation/
│   │   │   ├── glorov_announcement_bar.dart  # Top slim announcement banner
│   │   │   ├── glorov_header.dart            # Responsive header with search & live counters
│   │   │   ├── glorov_drawer.dart            # Mobile navigation drawer
│   │   │   └── glorov_footer.dart            # 4-column storefront footer
│   │   ├── home/
│   │   │   ├── glorov_hero_section.dart      # Hero botanical showcase & CTAs
│   │   │   ├── glorov_category_discovery.dart# 6 curated category cards
│   │   │   ├── glorov_featured_products.dart # Interactive category tabs & 4-col product grid
│   │   │   └── glorov_value_props.dart       # Trust guarantees & welcome offer
│   │   ├── product/
│   │   │   └── glorov_product_card.dart      # Botanical card with INR pricing & cart action
│   │   └── responsive/
│   │       └── glorov_responsive.dart        # GlorovResponsiveLayout & GlorovContainer
│   ├── models/glorov/
│   │   ├── glorov_product.dart    # Botanical domain model
│   │   └── glorov_mock_data.dart  # Curated Indian plant & heirloom seed catalog
│   ├── services/
│   │   └── glorov_cart_state.dart # Pure Flutter reactive cart & wishlist state
│   └── screens/home/views/
│       └── home_screen.dart       # Complete storefront homepage composition
├── screenshots/                   # Browser verification captures (desktop & mobile)
├── PROJECT_SETUP.md               # Toolchain and operational setup guide
└── GLOROV_UI_ARCHITECTURE.md      # Comprehensive UI/UX architecture document
```

---

## 6. Steps to Launch the Project
```bash
# 1. Navigate to the flutter project root
cd /Users/sourav/Developer/WEB/top-projects/glorov/flutter

# 2. Ensure dependencies are current
flutter pub get

# 3. Launch in Google Chrome
flutter run -d chrome
```
