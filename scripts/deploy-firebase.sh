#!/usr/bin/env bash
# ==============================================================================
# GLOROV — Automated Firebase Hosting Deployment Script
# Account: elacesourav@gmail.com / elsesourav@gmail.com
# Project: glorov-store (https://glorov-store.web.app)
# ==============================================================================
set -e

PROJECT_ID="glorov-store"
TARGET_ACCOUNT="elsesourav@gmail.com"

echo "=========================================================="
echo "🌿 GLOROV: Deploying to Firebase Hosting"
echo "=========================================================="

# 1. Verify Firebase CLI
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
    echo "⚠️  Could not switch automatically. Please ensure ${TARGET_ACCOUNT} is logged in via 'firebase login'."
  }
fi

# 3. Ensure .firebaserc and firebase.json are configured
cat << 'EOF' > .firebaserc
{
  "projects": {
    "default": "glorov-store"
  }
}
EOF

cat << 'EOF' > firebase.json
{
  "hosting": {
    "site": "glorov-store",
    "public": "apps/storefront/public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|svg|png|jpg|jpeg|webp|woff2|ico)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          }
        ]
      }
    ]
  }
}
EOF

# 4. Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase project '${PROJECT_ID}'..."
firebase deploy --only hosting --project "${PROJECT_ID}"

echo ""
echo "=========================================================="
echo "✅ Firebase Hosting deployment complete!"
echo "🌐 Live URL: https://glorov-store.web.app"
echo "🌐 Alternative URL: https://glorov-store.firebaseapp.com"
echo "📊 Console: https://console.firebase.google.com/project/glorov-store/overview"
echo "=========================================================="
