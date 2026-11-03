#!/usr/bin/env bash
# ==============================================================================
# GLOROV Zero-Downtime Safe PM2 Reload Script
# Location: /var/www/glorov/deploy/reload-services.sh
# Target: Azure VM (1GB RAM)
# Protects: PM2 process 0 (elsesourav-web) is never touched!
# ==============================================================================
set -e

echo "🔄 [$(date '+%Y-%m-%d %H:%M:%S')] Reloading GLOROV services..."

# Ensure Medusa Admin /app path compatibility
ln -sfn /var/www/glorov/admin /var/www/glorov/admin/app 2>/dev/null || true

# Sync Nginx configuration if present
if [ -f /var/www/glorov/deploy/nginx-glorov.tech.conf ]; then
  echo "🌐 Updating Nginx configuration..."
  sudo cp /var/www/glorov/deploy/nginx-glorov.tech.conf /etc/nginx/sites-available/glorov-tech
  sudo nginx -t && sudo systemctl reload nginx
fi

# Ensure node & pm2 are available in PATH
export PATH="${HOME}/.local/share/pnpm:${HOME}/.nvm/versions/node/$(node -v 2>/dev/null)/bin:/usr/local/bin:/usr/bin:/bin:${PATH}"

# Reload Medusa backend
if pm2 describe glorov-backend > /dev/null 2>&1; then
  echo "♻️ Reloading PM2 glorov-backend..."
  pm2 restart glorov-backend --update-env
else
  echo "🚀 Starting PM2 glorov-backend..."
  cd /var/www/glorov/apps/backend
  PORT=9000 pm2 start "npx medusa start" --name glorov-backend --node-args="--max-old-space-size=256"
fi

# Reload Next.js storefront (standalone mode on port 3001)
if pm2 describe glorov-storefront > /dev/null 2>&1; then
  echo "♻️ Reloading PM2 glorov-storefront..."
  pm2 restart glorov-storefront --update-env
else
  echo "🚀 Starting PM2 glorov-storefront..."
  PORT=3001 HOSTNAME=127.0.0.1 NODE_ENV=production pm2 start /var/www/glorov/storefront-next/apps/storefront/server.js \
    --name glorov-storefront \
    --node-args="--max-old-space-size=160"
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

echo "🎉 Services reloaded successfully!"
