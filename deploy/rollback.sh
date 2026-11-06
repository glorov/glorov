#!/usr/bin/env bash
# ==============================================================================
# GLOROV Deployment Rollback Engine
# Location: /var/www/glorov/deploy/rollback.sh
# Target: Azure VM (1GB RAM)
# Protects: PM2 process 0 (elsesourav-web) is never touched!
#
# USAGE:
#   bash /var/www/glorov/deploy/rollback.sh           # Interactive with confirmation
#   bash /var/www/glorov/deploy/rollback.sh -y        # Non-interactive confirmation
# ==============================================================================
set -e

BASE_DIR="/var/www/glorov"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"
RETENTION_COUNT=2

echo "=========================================================="
echo "⏪ GLOROV Deployment Rollback Engine [$(date '+%Y-%m-%d %H:%M:%S')]"
echo "=========================================================="

if [ ! -d "${RELEASES_DIR}" ]; then
  echo "❌ Error: Releases directory ${RELEASES_DIR} does not exist. No releases available for rollback."
  exit 1
fi

# Detect current active release from symlink
CURRENT_ACTIVE_RELEASE=""
if [ -L "${CURRENT_LINK}" ]; then
  CURRENT_TARGET=$(readlink "${CURRENT_LINK}" 2>/dev/null || true)
  CURRENT_ACTIVE_RELEASE=$(basename "${CURRENT_TARGET}")
fi

# Collect all available releases sorted newest to oldest
AVAILABLE_RELEASES=()
while IFS= read -r rel; do
  [ -n "$rel" ] && AVAILABLE_RELEASES+=("$rel")
done < <(find "${RELEASES_DIR}" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort -r)

TOTAL_RELEASES=${#AVAILABLE_RELEASES[@]}

if [ "${TOTAL_RELEASES}" -eq 0 ]; then
  echo "❌ Error: No release directories found in ${RELEASES_DIR}."
  exit 1
elif [ "${TOTAL_RELEASES}" -eq 1 ]; then
  echo "❌ Error: Only 1 release found (${AVAILABLE_RELEASES[0]}). Rollback requires at least 2 releases."
  exit 1
fi

# Identify the target rollback release (the most recent release that is not currently active)
TARGET_RELEASE=""
for rel in "${AVAILABLE_RELEASES[@]}"; do
  if [ "$rel" != "$CURRENT_ACTIVE_RELEASE" ]; then
    TARGET_RELEASE="$rel"
    break
  fi
done

# If current active was not detected or not in the list, choose the second most recent
if [ -z "${TARGET_RELEASE}" ] && [ "${TOTAL_RELEASES}" -ge 2 ]; then
  TARGET_RELEASE="${AVAILABLE_RELEASES[1]}"
fi

if [ -z "${TARGET_RELEASE}" ] || [ ! -d "${RELEASES_DIR}/${TARGET_RELEASE}" ]; then
  echo "❌ Error: Failed to determine valid previous release in ${RELEASES_DIR}."
  exit 1
fi

echo "Active Release      : ${CURRENT_ACTIVE_RELEASE:-'(direct / unknown)'}"
echo "Target Rollback To  : ${TARGET_RELEASE}"
echo "Target Release Path : ${RELEASES_DIR}/${TARGET_RELEASE}"
echo "All Available       : ${AVAILABLE_RELEASES[*]}"
echo "=========================================================="

# Show clear confirmation before rolling back
if [[ "$1" != "-y" && "$1" != "--yes" ]]; then
  read -r -p "⚠️  Are you sure you want to rollback to release '${TARGET_RELEASE}'? [y/N]: " CONFIRM
  if [[ ! "${CONFIRM}" =~ ^[Yy]$ ]]; then
    echo "🛑 Rollback cancelled by user."
    exit 0
  fi
fi

echo "🔗 Swapping symlink /var/www/glorov/current to ${RELEASES_DIR}/${TARGET_RELEASE}..."
ln -sfn "${RELEASES_DIR}/${TARGET_RELEASE}" "${CURRENT_LINK}"

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

# Update Nginx configuration if present in target release
if [ -f "${CURRENT_LINK}/deploy/nginx-glorov.tech.conf" ]; then
  echo "🌐 Updating Nginx configuration to target release..."
  sudo cp "${CURRENT_LINK}/deploy/nginx-glorov.tech.conf" /etc/nginx/sites-available/glorov-tech 2>/dev/null || true
  sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true
fi

# Ensure user PATH includes pnpm and node
export PATH="${HOME}/.local/share/pnpm:${HOME}/.nvm/versions/node/$(node -v 2>/dev/null)/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

# Restart Medusa backend via PM2 pointing to current release
if pm2 describe glorov-backend > /dev/null 2>&1; then
  echo "♻️ Restarting PM2 glorov-backend from rolled back release..."
  cd "${CURRENT_LINK}/apps/backend" 2>/dev/null || true
  pm2 restart glorov-backend --update-env
else
  echo "🚀 Starting PM2 glorov-backend..."
  cd "${CURRENT_LINK}/apps/backend"
  PORT=9000 pm2 start "npx medusa start" --name glorov-backend --node-args="--max-old-space-size=256"
fi

# Ensure standalone node_modules packages from .pnpm are properly linked
if [ -d "${CURRENT_LINK}/storefront-next/node_modules/.pnpm" ]; then
  echo "🔗 Linking standalone pnpm dependencies..."
  cd "${CURRENT_LINK}/storefront-next/node_modules"
  for pkg in .pnpm/*/node_modules/*; do
    [ -d "$pkg" ] && ln -sfn "$pkg" $(basename "$pkg") 2>/dev/null || true
  done
  cd - > /dev/null
fi

# Restart Next.js storefront via PM2 pointing to current release
if pm2 describe glorov-storefront > /dev/null 2>&1; then
  echo "♻️ Restarting PM2 glorov-storefront from rolled back release..."
  cd "${CURRENT_LINK}/storefront-next" 2>/dev/null || true
  pm2 restart glorov-storefront --update-env
else
  echo "🚀 Starting PM2 glorov-storefront..."
  PORT=3001 HOSTNAME=127.0.0.1 NODE_ENV=production pm2 start "${CURRENT_LINK}/storefront-next/apps/storefront/server.js" \
    --name glorov-storefront \
    --node-args="--max-old-space-size=160"
fi

pm2 save

echo "🩺 Verifying backend health post-rollback..."
BACKEND_HEALTH_URL="http://127.0.0.1:9000/health"
RETRIES=15
BACKEND_ONLINE=0

for ((i=1; i<=RETRIES; i++)); do
  sleep 2
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${BACKEND_HEALTH_URL}" || true)
  if [[ "${HTTP_CODE}" == "200" || "${HTTP_CODE}" == "400" ]]; then
    echo "✅ Backend is ONLINE post-rollback! (HTTP ${HTTP_CODE} on check ${i}/${RETRIES})"
    BACKEND_ONLINE=1
    break
  fi
done

if [[ "${BACKEND_ONLINE}" -ne 1 ]]; then
  echo "⚠️ Backend warming up slowly; inspect with 'pm2 logs glorov-backend'"
fi

STOREFRONT_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:3001/" || true)
if [[ "${STOREFRONT_CODE}" == "200" ]]; then
  echo "✅ Storefront is ONLINE on port 3001 post-rollback! (HTTP 200)"
else
  echo "⚠️ Storefront returned HTTP ${STOREFRONT_CODE}"
fi

# Retention policy: Keep the last 2 releases in /var/www/glorov/releases/
echo "🧹 Maintaining release retention (keeping last ${RETENTION_COUNT} releases)..."
cd "${RELEASES_DIR}"
ls -1dt */ 2>/dev/null | tail -n +"$((RETENTION_COUNT + 1))" | while read -r old_release; do
  old_base=$(basename "${old_release}")
  if [ "${old_base}" != "${TARGET_RELEASE}" ] && [ "${old_base}" != "${CURRENT_ACTIVE_RELEASE}" ]; then
    echo "   Removing expired release: ${old_base}"
    rm -rf "${old_release}"
  fi
done

echo "=========================================================="
echo "🎉 Rollback to release '${TARGET_RELEASE}' completed successfully!"
echo "   Active release is now: ${TARGET_RELEASE}"
echo "=========================================================="
exit 0
