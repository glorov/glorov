#!/usr/bin/env bash
# ==============================================================================
# GLOROV — Automated Flutter Web to Firebase Hosting Deployment Script
# Account: elacesourav@gmail.com / elsesourav@gmail.com
# Project: glorov-store (https://glorov-store.web.app)
# Source: flutter/build/web
# ==============================================================================
set -e

PROJECT_ID="glorov-store"
TARGET_ACCOUNT="elsesourav@gmail.com"
MEDUSA_URL="https://20.244.48.139.sslip.io/medusa"
PUBLISHABLE_KEY="pk_3e00679a810ca538ba78aedc23b336788d82631606792292cbecad4fc422316a"

echo "=========================================================="
echo "🌿 GLOROV: Deploying Flutter Web & Admin to Firebase"
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
CURRENT_ACCOUNT=$(firebase login:list 2>&1 | grep "Logged in as" | awk '{print $4}')
echo "ℹ️  Active Firebase account: ${CURRENT_ACCOUNT:-None}"

if [[ "${CURRENT_ACCOUNT}" != "${TARGET_ACCOUNT}" ]]; then
  echo "🔄 Switching active Firebase account to: ${TARGET_ACCOUNT}..."
  firebase login:use "${TARGET_ACCOUNT}" || {
    echo "⚠️  Could not switch automatically. Please ensure ${TARGET_ACCOUNT} is logged in."
  }
fi

# 3. Build Medusa Admin Dashboard for Firebase Hosting
echo "🔨 Compiling Medusa Admin Dashboard..."
(
  cd apps/backend
  ADMIN_PATH="/" MEDUSA_BACKEND_URL="${MEDUSA_URL}" npx medusa build --admin-only --no-lint
)

# 4. Build Flutter Web Release
echo "🔨 Compiling Flutter Web release build..."
(
  cd flutter
  flutter build web --release \
    --dart-define="MEDUSA_BASE_URL=${MEDUSA_URL}" \
    --dart-define="MEDUSA_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}"
)

# 5. Deploy to Firebase Hosting
echo "🚀 Uploading sites to Firebase project '${PROJECT_ID}'..."
firebase deploy --only hosting --project "${PROJECT_ID}"

echo ""
echo "=========================================================="
echo "✅ Deployment to Firebase complete!"
echo "🌐 Storefront (Primary): https://glorov-com.web.app"
echo "🌐 Storefront (App):     https://glorov-app.web.app"
echo "🌐 Storefront (Store):   https://glorov-store.web.app"
echo "🛡️ Admin Dashboard:      https://glorov-admin.web.app"
echo "📊 Console: https://console.firebase.google.com/project/glorov-store/overview"
echo "=========================================================="
