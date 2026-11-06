#!/usr/bin/env bash
# ==============================================================================
# GLOROV Automated Database Backup Engine
# Location: /var/www/glorov/deploy/backup-database.sh
# Target: Azure VM (1GB RAM)
#
# SAMPLE CRONTAB ENTRY (Daily backup at 02:00 UTC / 07:30 IST):
# 0 2 * * * /var/www/glorov/deploy/backup-database.sh >> /var/www/glorov/backups/backup.log 2>&1
#
# SECURITY & COMPLIANCE:
# - NEVER hardcodes database passwords; uses PGPASSWORD / DATABASE_URL from environment.
# - Memory-optimized for 1GB RAM Azure VM (streaming pg_dump piped to gzip -1).
# - Supports background non-blocking execution via --async flag.
# ==============================================================================
set -o pipefail

# Directory paths
BACKUP_DIR="${BACKUP_DIR:-/var/www/glorov/backups}"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=7
MAX_BACKUP_COUNT=7

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

log() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $1"
  echo "$msg"
  echo "$msg" >> "${LOG_FILE}" 2>/dev/null || true
}

# Support asynchronous / non-blocking execution if requested
if [[ "$1" == "--async" || "$1" == "--background" ]]; then
  shift
  nohup "$0" "$@" >> "${LOG_FILE}" 2>&1 &
  ASYNC_PID=$!
  echo "💾 Database backup initiated in background (PID: ${ASYNC_PID})"
  exit 0
fi

log "📦 Starting GLOROV database backup..."

# Resolve database credentials securely from environment without hardcoding
# If not present in current shell environment, attempt to extract from backend .env
if [ -z "${PGPASSWORD}" ] && [ -z "${DATABASE_URL}" ]; then
  for env_file in \
    "/var/www/glorov/apps/backend/.env" \
    "/var/www/glorov/current/apps/backend/.env" \
    "$(dirname "$0")/../apps/backend/.env"; do
    if [ -f "${env_file}" ]; then
      if [ -z "${DATABASE_URL}" ]; then
        DATABASE_URL=$(grep -E "^DATABASE_URL=" "${env_file}" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
      fi
      if [ -z "${DB_PASSWORD}" ]; then
        DB_PASSWORD=$(grep -E "^DB_PASSWORD=" "${env_file}" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
      fi
      if [ -z "${DB_USER}" ]; then
        DB_USER=$(grep -E "^DB_USER=" "${env_file}" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
      fi
      if [ -z "${DB_NAME}" ]; then
        DB_NAME=$(grep -E "^DB_NAME=" "${env_file}" | cut -d '=' -f2- | tr -d '"' | tr -d "'" || true)
      fi
      [ -n "${DATABASE_URL}" ] || [ -n "${DB_PASSWORD}" ] && break
    fi
  done
fi

export PGPASSWORD="${PGPASSWORD:-${DB_PASSWORD:-}}"
DB_HOST="${DB_HOST:-${PGHOST:-127.0.0.1}}"
DB_PORT="${DB_PORT:-${PGPORT:-5432}}"
DB_USER="${DB_USER:-${PGUSER:-postgres}}"
DB_NAME="${DB_NAME:-${PGDATABASE:-glorov_medusa_prod}}"

TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="${BACKUP_DIR}/glorov_backup_${TIMESTAMP}.sql.gz"

# Execute pg_dump with streaming gzip -1 to prevent RAM spikes on 1GB Azure VM
log "💾 Streaming pg_dump to ${BACKUP_FILE}..."

DUMP_SUCCESS=0

if [ -n "${DATABASE_URL}" ] && command -v pg_dump > /dev/null 2>&1; then
  # Direct URL connection
  if pg_dump --no-owner --no-acl "${DATABASE_URL}" | gzip -1 > "${BACKUP_FILE}"; then
    DUMP_SUCCESS=1
  fi
elif command -v pg_dump > /dev/null 2>&1; then
  # Host pg_dump with host/user/db params
  if pg_dump -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" --no-owner --no-acl "${DB_NAME}" | gzip -1 > "${BACKUP_FILE}"; then
    DUMP_SUCCESS=1
  fi
elif command -v docker > /dev/null 2>&1 && docker ps --format '{{.Names}}' 2>/dev/null | grep -q "postgres"; then
  # Docker container fallback if pg_dump is not installed directly on host
  PG_CONTAINER=$(docker ps --format '{{.Names}}' | grep "postgres" | head -n 1)
  log "🐳 Using Docker container ${PG_CONTAINER} for pg_dump..."
  if docker exec -e PGPASSWORD="${PGPASSWORD}" "${PG_CONTAINER}" pg_dump -U "${DB_USER}" --no-owner --no-acl "${DB_NAME}" | gzip -1 > "${BACKUP_FILE}"; then
    DUMP_SUCCESS=1
  fi
else
  log "❌ Failed: Neither pg_dump CLI nor a running PostgreSQL container was found."
  rm -f "${BACKUP_FILE}" 2>/dev/null || true
  exit 1
fi

# Verify archive integrity and file presence
if [ "${DUMP_SUCCESS}" -eq 1 ] && [ -s "${BACKUP_FILE}" ] && gzip -t "${BACKUP_FILE}" 2>/dev/null; then
  FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  log "✅ Database backup created successfully: $(basename "${BACKUP_FILE}") (${FILE_SIZE})"
else
  log "❌ Failed: Database dump produced an empty or corrupted archive."
  rm -f "${BACKUP_FILE}" 2>/dev/null || true
  exit 1
fi

# Retention policy: Retain last 7 daily backups (delete older than 7 days or beyond 7 files)
log "🧹 Applying backup retention policy (retaining last ${RETENTION_DAYS} daily backups)..."

# 1. Delete backups older than 7 days
find "${BACKUP_DIR}" -maxdepth 1 -name "glorov_backup_*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -delete 2>/dev/null || true

# 2. Retain at most the 7 most recent backups to safeguard disk space on 1GB VM
find "${BACKUP_DIR}" -maxdepth 1 -name "glorov_backup_*.sql.gz" -type f | sort -r | tail -n +"$((MAX_BACKUP_COUNT + 1))" | while read -r old_backup; do
  if [ -f "${old_backup}" ]; then
    log "   Removing expired backup archive: $(basename "${old_backup}")"
    rm -f "${old_backup}"
  fi
done

REMAINING_COUNT=$(find "${BACKUP_DIR}" -maxdepth 1 -name "glorov_backup_*.sql.gz" -type f | wc -l | tr -d ' ')
log "📊 Backup completed. Active backup archives retained: ${REMAINING_COUNT}"
exit 0
