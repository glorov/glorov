#!/usr/bin/env bash
# ==============================================================================
# GLOROV — Lightweight Azure VM Backend Deployment Script
# Target: elsesourav@20.244.48.139
# Path: /var/www/glorov
# Engine: Medusa v2 on Node.js (PM2: glorov-backend)
# Database: PostgreSQL (native, low-memory profile)
# Cache: Redis (native, 64MB LRU)
# ==============================================================================
set -e

VM_USER="elsesourav"
VM_HOST="20.244.48.139"
VM_DIR="/var/www/glorov"
SSH_KEY="${HOME}/.ssh/id_ed25519"
SSH_OPTS="-o StrictHostKeyChecking=no -o BatchMode=yes -i ${SSH_KEY}"

echo "=========================================================="
echo "🌿 GLOROV: Deploying Backend to Azure VM (${VM_HOST})"
echo "=========================================================="

# 1. Test SSH Connection
echo "🔑 Verifying SSH connectivity to ${VM_USER}@${VM_HOST}..."
ssh ${SSH_OPTS} "${VM_USER}@${VM_HOST}" "uptime" || {
  echo "❌ Failed to connect to ${VM_HOST}. Verify SSH key at ${SSH_KEY}"
  exit 1
}

# 2. Build backend locally to save RAM and CPU on the VM
echo "🔨 Building backend artifacts locally..."
pnpm --filter @glorov/types build || true
pnpm --filter @glorov/backend build

# 3. Synchronize files to VM via rsync (transferring only diffs)
echo "📦 Synchronizing backend files to ${VM_DIR}..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.turbo' \
  --exclude '.git' \
  --exclude '.firebase' \
  --exclude 'apps/storefront' \
  --exclude 'flutter' \
  --exclude 'docs' \
  --exclude 'artifacts' \
  --exclude 'backups' \
  -e "ssh ${SSH_OPTS}" \
  ./ "${VM_USER}@${VM_HOST}:${VM_DIR}/"

# 4. Install production dependencies if changed
echo "📥 Ensuring backend dependencies on VM..."
ssh ${SSH_OPTS} "${VM_USER}@${VM_HOST}" "cd ${VM_DIR} && pnpm install --filter=@glorov/backend..."

# 5. Run Database Migrations
echo "🗄️ Running Medusa v2 database migrations on VM..."
ssh ${SSH_OPTS} "${VM_USER}@${VM_HOST}" "cd ${VM_DIR}/apps/backend && pnpm db:migrate"

# 6. Restart PM2 Process with memory ceiling
echo "🔄 Reloading PM2 backend service (glorov-backend)..."
ssh ${SSH_OPTS} "${VM_USER}@${VM_HOST}" "cd ${VM_DIR}/apps/backend && pm2 describe glorov-backend > /dev/null 2>&1 && pm2 restart glorov-backend || (PORT=9000 pm2 start 'npx medusa start' --name glorov-backend --node-args='--max-old-space-size=256')"
ssh ${SSH_OPTS} "${VM_USER}@${VM_HOST}" "pm2 save"

# 7. Verify Health Endpoint (polling with retry)
echo "🩺 Verifying backend health..."
RETRIES=15
HEALTH_OK=0
for ((i=1; i<=RETRIES; i++)); do
  sleep 2
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://${VM_HOST}/medusa/health" || true)
  if [[ "${STATUS}" == "200" ]]; then
    echo "✅ Medusa v2 backend is online and healthy (HTTP 200) after ${i} checks!"
    HEALTH_OK=1
    break
  else
    echo "⏳ Waiting for server to initialize... (attempt ${i}/${RETRIES}, code: ${STATUS})"
  fi
done

if [[ "${HEALTH_OK}" -ne 1 ]]; then
  echo "⚠️ Health check failed to reach HTTP 200 within timeout. Checking logs..."
  ssh ${SSH_OPTS} "${VM_USER}@${VM_HOST}" "pm2 logs glorov-backend --lines 15 --nostream"
fi

echo "=========================================================="
echo "✅ VM Backend deployment completed!"
echo "🌐 API Base URL: http://${VM_HOST}/medusa"
echo "🌐 Nginx Direct Domain: http://api.glorov.com (when DNS points to ${VM_HOST})"
echo "📊 PM2 Status on VM: run 'ssh ${VM_USER}@${VM_HOST} pm2 status'"
echo "=========================================================="
