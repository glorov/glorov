#!/usr/bin/env bash
# ==============================================================================
# GLOROV — Custom Domain Direct VM Deployment (Without Firebase)
# Domains:
#   - Storefront: https://glorov.tech & https://www.glorov.tech
#   - Admin:      https://admin.glorov.tech
#   - API:        https://api.glorov.tech
# Usage:
#   ./scripts/deploy-custom-domain.sh              (builds & deploys both Storefront & Admin)
#   ./scripts/deploy-custom-domain.sh --store      (builds & deploys Storefront only)
#   ./scripts/deploy-custom-domain.sh --admin      (builds & deploys Admin Dashboard only)
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${DIR}"

HOST="20.244.48.139"
USER="elsesourav"
SSH_KEY="$HOME/.ssh/id_ed25519"
SSH_CMD="ssh -o BatchMode=yes -o StrictHostKeyChecking=no -i ${SSH_KEY}"

MEDUSA_URL="https://api.glorov.tech/medusa"
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
echo "🌿 GLOROV: Deploying to Custom Domain [Mode: ${MODE_UPPER}]"
echo "🌐 Storefront: https://glorov.tech (and www.glorov.tech)"
echo "🛡️ Admin:      https://admin.glorov.tech"
echo "⚙️  API:        https://api.glorov.tech"
echo "=========================================================="

# 1. Verify SSH
if ! ${SSH_CMD} "${USER}@${HOST}" "echo 'SSH_OK'" &> /dev/null; then
  echo "❌ Error: Cannot connect to ${USER}@${HOST} via SSH."
  exit 1
fi
echo "✅ SSH connection verified."

# 2. Build Medusa Admin Dashboard (if mode is all or admin)
if [[ "${MODE}" == "all" || "${MODE}" == "admin" ]]; then
  echo ""
  echo "🔨 [1/2] Compiling Medusa Admin Dashboard for admin.glorov.tech..."
  (
    cd apps/backend
    ADMIN_PATH="/" ADMIN_AUTH_TYPE="jwt" MEDUSA_BACKEND_URL="${MEDUSA_URL}" npx medusa build --admin-only --no-lint
  )
  if [[ ! -f "apps/backend/.medusa/admin/index.html" ]]; then
    echo "❌ Error: Medusa admin build failed to generate apps/backend/.medusa/admin/index.html"
    exit 1
  fi
  echo "✅ Medusa Admin Dashboard compiled successfully."

  echo "📦 Syncing Admin Dashboard to /var/www/glorov/admin on Azure VM..."
  rsync -avz --delete -e "${SSH_CMD}" apps/backend/.medusa/admin/ "${USER}@${HOST}:/var/www/glorov/admin/"
  echo "✅ Admin Dashboard synced."
fi

# 3. Build Flutter Web Release (if mode is all or store)
if [[ "${MODE}" == "all" || "${MODE}" == "store" ]]; then
  echo ""
  echo "🔨 [2/2] Compiling Flutter Web Storefront with WebAssembly (Wasm + O4)..."
  (
    cd flutter
    flutter clean
    flutter pub get
    flutter build web --wasm --release -O4 \
      --dart-define="MEDUSA_BASE_URL=${MEDUSA_URL}" \
      --dart-define="MEDUSA_PUBLISHABLE_KEY=${PUBLISHABLE_KEY}"
  )

  if [[ ! -f "flutter/build/web/main.dart.wasm" || ! -f "flutter/build/web/index.html" ]]; then
    echo "❌ Error: Flutter web build failed to generate main.dart.wasm or index.html"
    exit 1
  fi

  # Copy high-res Open Graph banner image
  if [[ -f "flutter/web/og-image.jpg" ]]; then
    cp "flutter/web/og-image.jpg" "flutter/build/web/og-image.jpg"
  fi

  # Dynamically pre-render product metadata & Open Graph tags for social crawlers
  echo ""
  echo "🌿 Pre-rendering dynamic product metadata & social share OG tags for glorov.tech..."
  SITE_URL="https://glorov.tech" MEDUSA_HOST="api.glorov.tech" node scripts/generate-product-metadata.js

  echo "📦 Syncing Storefront to /var/www/glorov/storefront on Azure VM..."
  rsync -avz --delete -e "${SSH_CMD}" flutter/build/web/ "${USER}@${HOST}:/var/www/glorov/storefront/"
  echo "✅ Storefront synced."
fi

# 4. Post-deployment live verification
echo ""
echo "🩺 Verifying live HTTPS CDN responses on glorov.tech..."
sleep 2

if [[ "${MODE}" == "all" || "${MODE}" == "store" ]]; then
  STORE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://glorov.tech" || true)
  STORE_WASM=$(curl -s -o /dev/null -w "%{http_code}" "https://glorov.tech/main.dart.wasm" || true)
  echo "📊 Storefront (https://glorov.tech): HTTP ${STORE_STATUS}"
  echo "📊 main.dart.wasm: HTTP ${STORE_WASM}"
fi

if [[ "${MODE}" == "all" || "${MODE}" == "admin" ]]; then
  ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://admin.glorov.tech" || true)
  echo "📊 Admin Dashboard (https://admin.glorov.tech): HTTP ${ADMIN_STATUS}"
fi

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://api.glorov.tech/store/products?limit=1" -H "x-publishable-api-key: ${PUBLISHABLE_KEY}" || true)
echo "📊 Backend API (https://api.glorov.tech): HTTP ${API_STATUS}"

echo ""
echo "=========================================================="
echo "✅ Direct VM Deployment Complete (No Firebase needed)!"
echo "🌐 Storefront:      https://glorov.tech"
echo "🌐 Storefront (www):https://www.glorov.tech"
echo "🛡️ Admin Dashboard: https://admin.glorov.tech"
echo "⚙️  Backend API:     https://api.glorov.tech"
echo "=========================================================="
