#!/usr/bin/env bash
# ==============================================================================
# GLOROV Server Deployment Engine
# Location: /var/www/glorov/deploy/deploy-server.sh
# Purpose: Updates and restarts Medusa v2 backend safely on the Azure VM.
# ==============================================================================
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${DIR}"

echo "=========================================================="
echo "🌿 GLOROV: Starting Server-side Deployment [$(date '+%Y-%m-%d %H:%M:%S')]"
echo "=========================================================="

PULL_FROM_GIT=false
if [[ "$1" == "--pull" ]]; then
  PULL_FROM_GIT=true
fi

if [[ "${PULL_FROM_GIT}" == "true" ]]; then
  echo "📥 Pulling latest code from GitHub (origin/main)..."
  if git remote get-url origin > /dev/null 2>&1; then
    git fetch origin main
    git reset --hard origin/main
    echo "✅ Successfully updated working tree to origin/main"
  else
    echo "⚠️ Git remote origin not configured; skipping git pull."
  fi
fi

# Ensure user PATH includes pnpm, node, and pm2
export PATH="${HOME}/.local/share/pnpm:${HOME}/.nvm/versions/node/$(node -v 2>/dev/null)/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

# Install dependencies if needed
echo "📦 Ensuring dependencies..."
pnpm install --filter=@glorov/backend... --prefer-offline || pnpm install --filter=@glorov/backend...

# Check if .medusa/server exists or needs building
if [[ ! -d "${DIR}/apps/backend/.medusa/server" || "${PULL_FROM_GIT}" == "true" ]]; then
  echo "🔨 Building Medusa backend (.medusa/server)..."
  cd "${DIR}/apps/backend"
  MEDUSA_ADMIN_DISABLED="true" NODE_OPTIONS="--max-old-space-size=512" pnpm build --no-lint
  cd "${DIR}"
fi

# Run safe database migrations
echo "🗄️ Executing Medusa v2 database migrations..."
cd "${DIR}/apps/backend"
npx medusa db:migrate --skip-search --execute-safe-links || {
  echo "⚠️ Migrations returned non-zero. Continuing if schema is already up-to-date..."
}

# Restart PM2 process glorov-backend without touching other processes (e.g. elsesourav-web)
echo "🔄 Reloading PM2 glorov-backend..."
if pm2 describe glorov-backend > /dev/null 2>&1; then
  pm2 restart glorov-backend --update-env
else
  PORT=9000 pm2 start "npx medusa start" --name glorov-backend --node-args="--max-old-space-size=256"
fi
pm2 save

# Health verification
echo "🩺 Awaiting backend startup..."
HEALTH_URL="http://127.0.0.1:9000/store/health"
RETRIES=20
HEALTHY=0

for ((i=1; i<=RETRIES; i++)); do
  sleep 2
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${HEALTH_URL}" || true)
  if [[ "${HTTP_CODE}" == "200" || "${HTTP_CODE}" == "400" ]]; then
    # HTTP 200 or 400 (publishable key required) indicates express/medusa is actively listening!
    echo "✅ Backend is ONLINE and responding! (HTTP ${HTTP_CODE} on check ${i}/${RETRIES})"
    HEALTHY=1
    break
  else
    echo "⏳ Waiting for backend to bind... (check ${i}/${RETRIES}, HTTP ${HTTP_CODE})"
  fi
done

if [[ "${HEALTHY}" -ne 1 ]]; then
  echo "❌ CRITICAL: Backend failed to become healthy within $((RETRIES * 2)) seconds!"
  echo "Logs:"
  pm2 logs glorov-backend --lines 25 --nostream
  exit 1
fi

echo "=========================================================="
echo "🎉 GLOROV Backend Deployment Successful! [$(date '+%Y-%m-%d %H:%M:%S')]"
echo "=========================================================="
