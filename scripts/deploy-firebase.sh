#!/usr/bin/env bash
# ==============================================================================
# GLOROV — Automated Firebase Hosting Deployment Script
# Storefront: https://glorovs.web.app (site: glorovs)
# Admin:      https://glorova.web.app (site: glorova)
# Account:    elsesourav@gmail.com
# Usage:
#   ./scripts/deploy-firebase.sh              (builds & deploys both Storefront & Admin)
#   ./scripts/deploy-firebase.sh --store      (builds & deploys Storefront only)
#   ./scripts/deploy-firebase.sh --admin      (builds & deploys Admin Dashboard only)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${DIR}"

PROJECT_ID="glorov-store"
TARGET_ACCOUNT="elsesourav@gmail.com"
MEDUSA_URL="https://20.244.48.139.sslip.io/medusa"
PUBLISHABLE_KEY="pk_3e00679a810ca538ba78aedc23b336788d82631606792292cbecad4fc422316a"

MODE="all"
case "$1" in
  --store|--storefront|--store-only)
    MODE="store"
    ;;
  --admin|--admin-only)
    MODE="admin"
    ;;
  *)
    MODE="all"
    ;;
esac

MODE_UPPER=$(echo "${MODE}" | tr '[:lower:]' '[:upper:]')
echo "=========================================================="
echo "🌿 GLOROV: Deploying to Firebase Hosting [Mode: ${MODE_UPPER}]"
echo "🌐 Storefront: https://glorovs.web.app"
echo "🛡️ Admin:      https://glorova.web.app"
echo "=========================================================="

# 1. Verify Tools
if ! command -v flutter &> /dev/null; then
  echo "❌ Flutter SDK not found in PATH."
  exit 1
fi

if ! command -v firebase &> /dev/null; then
  echo "❌ Firebase CLI not found. Please install: npm install -g firebase-tools"
  exit 1
fi

# 2. Verify / Switch Firebase Account
CURRENT_ACCOUNT=$(firebase login:list 2>&1 | grep "Logged in as" | awk '{print $4}' | head -n 1)
echo "ℹ️  Active Firebase account: ${CURRENT_ACCOUNT:-None}"

if [[ "${CURRENT_ACCOUNT}" != "${TARGET_ACCOUNT}" ]]; then
  echo "🔄 Switching active Firebase account to: ${TARGET_ACCOUNT}..."
  firebase login:use "${TARGET_ACCOUNT}" || {
    echo "⚠️  Could not switch automatically. Please ensure ${TARGET_ACCOUNT} is logged in."
  }
fi

# 3. Build Medusa Admin Dashboard (if mode is all or admin)
if [[ "${MODE}" == "all" || "${MODE}" == "admin" ]]; then
  echo ""
  echo "🔨 [1/2] Compiling Medusa Admin Dashboard (.medusa/admin)..."
  (
    cd apps/backend
    ADMIN_PATH="/" MEDUSA_BACKEND_URL="${MEDUSA_URL}" npx medusa build --admin-only --no-lint
  )
  if [[ ! -f "apps/backend/.medusa/admin/index.html" ]]; then
    echo "❌ Error: Medusa admin build failed to generate apps/backend/.medusa/admin/index.html"
    exit 1
  fi
  echo "✅ Medusa Admin Dashboard compiled successfully."
fi

# 4. Build Flutter Web Release (if mode is all or store)
if [[ "${MODE}" == "all" || "${MODE}" == "store" ]]; then
  echo ""
  echo "🔨 [2/2] Compiling Flutter Web Storefront (flutter/build/web)..."

  (
    cd flutter
    flutter clean
    flutter pub get
    flutter build web --release \
      --dart-define="MEDUSA_BASE_URL=${MEDUSA_URL}" \
      --dart-define="MEDUSA_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}"
  )

  if [[ ! -f "flutter/build/web/main.dart.js" || ! -f "flutter/build/web/index.html" ]]; then
    echo "❌ Error: Flutter web build failed to generate main.dart.js or index.html"
    exit 1
  fi

  # Ensure fallback service worker cleanup script is in place
  if [[ -f "flutter/web/flutter_service_worker.js" ]]; then
    cp "flutter/web/flutter_service_worker.js" "flutter/build/web/flutter_service_worker.js"
  fi

  echo "✅ Flutter Web Storefront compiled successfully ($(ls -lh flutter/build/web/main.dart.js | awk '{print $5}'))."
fi

# 5. Deploy to Firebase Hosting
echo ""
echo "🚀 Uploading sites to Firebase project '${PROJECT_ID}'..."
rm -rf .firebase/hosting.*.cache
if [[ "${MODE}" == "store" ]]; then
  firebase deploy --only hosting:glorovs --project "${PROJECT_ID}"
elif [[ "${MODE}" == "admin" ]]; then
  firebase deploy --only hosting:glorova --project "${PROJECT_ID}"
else
  firebase deploy --only hosting --project "${PROJECT_ID}"
fi

# 6. Post-deployment live verification
echo ""
echo "🩺 Verifying live public CDN responses..."
sleep 2

if [[ "${MODE}" == "all" || "${MODE}" == "store" ]]; then
  STORE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://glorovs.web.app" || true)
  STORE_CACHE=$(curl -s -I "https://glorovs.web.app/main.dart.js" | grep -i "cache-control" | tr -d '\r' || true)
  echo "📊 Storefront (https://glorovs.web.app): HTTP ${STORE_STATUS}"
  echo "📊 main.dart.js Cache Header: ${STORE_CACHE}"
  if [[ "${STORE_STATUS}" != "200" ]]; then
    echo "⚠️ Warning: Expected HTTP 200 from https://glorovs.web.app, received ${STORE_STATUS}"
  fi
fi

if [[ "${MODE}" == "all" || "${MODE}" == "admin" ]]; then
  ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://glorova.web.app" || true)
  echo "📊 Admin Dashboard (https://glorova.web.app): HTTP ${ADMIN_STATUS}"
  if [[ "${ADMIN_STATUS}" != "200" ]]; then
    echo "⚠️ Warning: Expected HTTP 200 from https://glorova.web.app, received ${ADMIN_STATUS}"
  fi
fi

echo ""
echo "=========================================================="
echo "✅ Deployment complete!"
echo "🌐 Storefront:      https://glorovs.web.app"
echo "🛡️ Admin Dashboard: https://glorova.web.app"
echo "📊 Console: https://console.firebase.google.com/project/glorov-store/overview"
echo "=========================================================="
