#!/usr/bin/env bash
# ==============================================================================
# GLOROV Zero-Downtime Safe PM2 Reload & Release Manager Script
# Location: /var/www/glorov/deploy/reload-services.sh
# Target: Azure VM (1GB RAM)
# Protects: PM2 process 0 (elsesourav-web) is never touched!
# ==============================================================================
set -e

BASE_DIR="/var/www/glorov"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"
RETENTION_COUNT=2
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
RELEASE_DIR="${RELEASES_DIR}/${TIMESTAMP}"

echo "🔄 [$(date '+%Y-%m-%d %H:%M:%S')] Starting GLOROV deployment reload for release ${TIMESTAMP}..."

# 1. Run database backup before restarting services (non-blocking)
if [ -f "${BASE_DIR}/deploy/backup-database.sh" ]; then
  echo "💾 Initiating database backup before service reload..."
  bash "${BASE_DIR}/deploy/backup-database.sh" --async || {
    echo "⚠️ Database backup encountered a non-fatal warning; continuing deployment."
  }
fi

# 2. Prepare release directory
mkdir -p "${RELEASE_DIR}"
mkdir -p "${RELEASE_DIR}/apps"

# 3. Move deployed artifacts into releases/{timestamp}/ directory
# A. Next.js Storefront standalone bundle
if [ -d "${BASE_DIR}/storefront-next" ] && [ ! -L "${BASE_DIR}/storefront-next" ]; then
  echo "📦 Moving storefront standalone artifacts to releases/${TIMESTAMP}..."
  mv "${BASE_DIR}/storefront-next" "${RELEASE_DIR}/storefront-next"
elif [ -d "${CURRENT_LINK}/storefront-next" ]; then
  echo "📦 Carrying forward storefront artifacts from previous release..."
  cp -r "${CURRENT_LINK}/storefront-next" "${RELEASE_DIR}/storefront-next" 2>/dev/null || true
fi

# B. Medusa Backend compiled bundles and configuration
if [ -d "${BASE_DIR}/apps/backend" ]; then
  echo "📦 Assembling backend artifacts into releases/${TIMESTAMP}..."
  mkdir -p "${RELEASE_DIR}/apps/backend"
  if [ -d "${BASE_DIR}/apps/backend/.medusa" ]; then
    mv "${BASE_DIR}/apps/backend/.medusa" "${RELEASE_DIR}/apps/backend/.medusa"
  elif [ -d "${CURRENT_LINK}/apps/backend/.medusa" ]; then
    cp -r "${CURRENT_LINK}/apps/backend/.medusa" "${RELEASE_DIR}/apps/backend/.medusa" 2>/dev/null || true
  fi
  [ -f "${BASE_DIR}/apps/backend/package.json" ] && cp -f "${BASE_DIR}/apps/backend/package.json" "${RELEASE_DIR}/apps/backend/"
  [ -f "${BASE_DIR}/apps/backend/medusa-config.ts" ] && cp -f "${BASE_DIR}/apps/backend/medusa-config.ts" "${RELEASE_DIR}/apps/backend/"
  [ -f "${BASE_DIR}/apps/backend/tsconfig.json" ] && cp -f "${BASE_DIR}/apps/backend/tsconfig.json" "${RELEASE_DIR}/apps/backend/"
  [ -f "${BASE_DIR}/apps/backend/.env" ] && cp -f "${BASE_DIR}/apps/backend/.env" "${RELEASE_DIR}/apps/backend/"
  if [ -d "${BASE_DIR}/apps/backend/static" ]; then
    cp -r "${BASE_DIR}/apps/backend/static" "${RELEASE_DIR}/apps/backend/" 2>/dev/null || true
  fi
  # Symlink src and node_modules so custom plugins like payment-razorpay resolve reliably
  if [ -d "${BASE_DIR}/apps/backend/src" ]; then
    ln -sfn "${BASE_DIR}/apps/backend/src" "${RELEASE_DIR}/apps/backend/src"
  fi
  if [ -d "${BASE_DIR}/apps/backend/node_modules" ]; then
    ln -sfn "${BASE_DIR}/apps/backend/node_modules" "${RELEASE_DIR}/apps/backend/node_modules"
  elif [ -d "${CURRENT_LINK}/apps/backend/node_modules" ]; then
    ln -sfn "${CURRENT_LINK}/apps/backend/node_modules" "${RELEASE_DIR}/apps/backend/node_modules"
  fi
  # Maintain reverse symlink so /var/www/glorov/apps/backend/.medusa points to current release
  ln -sfn "${RELEASE_DIR}/apps/backend/.medusa" "${BASE_DIR}/apps/backend/.medusa"
fi

# C. Medusa Admin Dashboard static build
if [ -d "${BASE_DIR}/admin" ] && [ ! -L "${BASE_DIR}/admin" ]; then
  echo "📦 Moving Medusa Admin artifacts to releases/${TIMESTAMP}..."
  mv "${BASE_DIR}/admin" "${RELEASE_DIR}/admin"
elif [ -d "${CURRENT_LINK}/admin" ]; then
  echo "📦 Carrying forward Medusa Admin artifacts from previous release..."
  cp -r "${CURRENT_LINK}/admin" "${RELEASE_DIR}/admin" 2>/dev/null || true
fi

# D. Deployment automation scripts
if [ -d "${BASE_DIR}/deploy" ]; then
  cp -r "${BASE_DIR}/deploy" "${RELEASE_DIR}/deploy"
fi

# 4. Atomically symlink current to latest release
echo "🔗 Symlinking ${CURRENT_LINK} -> ${RELEASE_DIR}..."
ln -sfn "${RELEASE_DIR}" "${CURRENT_LINK}"
ln -sfn "${CURRENT_LINK}/storefront-next" "${BASE_DIR}/storefront-next"
ln -sfn "${CURRENT_LINK}/admin" "${BASE_DIR}/admin"

# -----------------------------------------------------------------------------
# GLOROV-DEPLOY-007: Idempotent Medusa Admin /app Symlink Handler
# -----------------------------------------------------------------------------
# Why needed: Medusa v2 Admin SPA routes under base path /app (e.g. /app/login).
# Nginx / Caddy serves the admin dashboard from root /var/www/glorov/current/admin.
# The symlink admin/app -> . ensures requests targeting /app or /app/index.html
# correctly resolve the SPA entrypoint without duplicating build artifacts.
ensure_admin_symlink() {
  local target_admin_dir="$1"
  if [ ! -d "${target_admin_dir}" ]; then
    echo "⚠️ Warning: Admin source directory '${target_admin_dir}' not found. Skipping /app symlink creation."
    return 0
  fi

  local app_link="${target_admin_dir}/app"

  # Check if symlink already exists and points to the valid current admin root
  if [ -L "${app_link}" ]; then
    local current_dest
    current_dest=$(readlink "${app_link}" 2>/dev/null || true)
    if [ "${current_dest}" = "." ] || [ "${current_dest}" = "${target_admin_dir}" ]; then
      echo "✅ Admin /app symlink is already valid (${app_link} -> ${current_dest})."
      return 0
    else
      echo "🔄 Updating stale admin /app symlink (${current_dest} -> .)..."
      rm -f "${app_link}"
    fi
  elif [ -d "${app_link}" ]; then
    echo "⚠️ Notice: ${app_link} is an existing directory; preserving without overwriting."
    return 0
  fi

  # Create idempotent relative symlink: admin/app -> .
  (cd "${target_admin_dir}" && ln -sfn . app) && {
    echo "✅ Successfully established idempotent Medusa Admin /app symlink."
  } || {
    echo "❌ Error: Failed to create admin /app symlink in ${target_admin_dir}."
  }
}

ensure_admin_symlink "${CURRENT_LINK}/admin"

# 5. Maintain release retention (keep last 2 deployment artifacts in releases/)
echo "🧹 Maintaining release retention (keeping last ${RETENTION_COUNT} releases)..."
cd "${RELEASES_DIR}"
ls -1dt */ 2>/dev/null | tail -n +"$((RETENTION_COUNT + 1))" | while read -r old_release; do
  old_base=$(basename "${old_release}")
  if [ "${old_base}" != "${TIMESTAMP}" ]; then
    echo "   Removing expired release: ${old_base}"
    rm -rf "${old_release}"
  fi
done

# 6. Sync Nginx configuration
if [ -f "${CURRENT_LINK}/deploy/nginx-glorov.tech.conf" ]; then
  echo "🌐 Updating Nginx configuration..."
  sudo cp "${CURRENT_LINK}/deploy/nginx-glorov.tech.conf" /etc/nginx/sites-available/glorov-tech
  sudo nginx -t && sudo systemctl reload nginx
fi

# 7. Ensure node & pm2 are available in PATH
export PATH="${HOME}/.local/share/pnpm:${HOME}/.nvm/versions/node/$(node -v 2>/dev/null)/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

# Ensure Redis system memory limit and eviction policy are applied on 1GB VM
if command -v redis-cli > /dev/null 2>&1; then
  echo "⚡ Applying Redis memory limits (128MB, allkeys-lru)..."
  redis-cli config set maxmemory 128mb 2>/dev/null || true
  redis-cli config set maxmemory-policy allkeys-lru 2>/dev/null || true
fi

# 8. Reload Medusa backend (zero-downtime reload)
if pm2 describe glorov-backend > /dev/null 2>&1; then
  echo "♻️ Reloading PM2 glorov-backend (zero-downtime)..."
  cd "${CURRENT_LINK}/apps/backend"
  pm2 reload glorov-backend --update-env
else
  echo "🚀 Starting PM2 glorov-backend..."
  cd "${CURRENT_LINK}/apps/backend"
  PORT=9000 pm2 start "npx medusa start" --name glorov-backend --node-args="--max-old-space-size=256"
fi

# 9. Ensure standalone node_modules packages from .pnpm are properly linked
if [ -d "${CURRENT_LINK}/storefront-next/node_modules/.pnpm" ]; then
  echo "🔗 Linking standalone pnpm dependencies..."
  cd "${CURRENT_LINK}/storefront-next/node_modules"
  for pkg in .pnpm/*/node_modules/*; do
    [ -d "$pkg" ] && ln -sfn "$pkg" $(basename "$pkg") 2>/dev/null || true
  done
  cd - > /dev/null
fi

# 10. Reload Next.js storefront (standalone mode on port 3001, zero-downtime reload)
if pm2 describe glorov-storefront > /dev/null 2>&1; then
  echo "♻️ Reloading PM2 glorov-storefront (zero-downtime)..."
  cd "${CURRENT_LINK}/storefront-next"
  pm2 reload glorov-storefront --update-env
else
  echo "🚀 Starting PM2 glorov-storefront..."
  PORT=3001 HOSTNAME=127.0.0.1 NODE_ENV=production pm2 start "${CURRENT_LINK}/storefront-next/apps/storefront/server.js" \
    --name glorov-storefront \
    --node-args="--max-old-space-size=128"
fi

pm2 save

echo "🩺 Awaiting backend startup..."
BACKEND_HEALTH_URL="http://127.0.0.1:9000/health"
RETRIES=15
BACKEND_ONLINE=0

for ((i=1; i<=RETRIES; i++)); do
  sleep 2
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_HEALTH_URL}" || true)
  if [[ "${HTTP_CODE}" == "200" || "${HTTP_CODE}" == "400" ]]; then
    echo "✅ Backend is ONLINE and responding! (HTTP ${HTTP_CODE} on check ${i}/${RETRIES})"
    BACKEND_ONLINE=1
    break
  fi
done

if [[ "${BACKEND_ONLINE}" -ne 1 ]]; then
  echo "⚠️ Backend warming up slowly; check with 'pm2 logs glorov-backend'"
fi

STOREFRONT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3001/" || true)
if [[ "${STOREFRONT_CODE}" == "200" ]]; then
  echo "✅ Storefront is ONLINE on port 3001! (HTTP 200)"
else
  echo "⚠️ Storefront returned HTTP ${STOREFRONT_CODE}"
fi

echo "🎉 Services reloaded successfully on release ${TIMESTAMP}!"
