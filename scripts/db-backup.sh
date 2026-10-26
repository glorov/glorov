#!/usr/bin/env bash

# ==============================================================================
# GLOROV Automated Database Backup Utility
# ==============================================================================
# Creates a compressed PostgreSQL database dump with SHA-256 checksum,
# enforces strict file permissions, prunes outdated local backups,
# and optionally synchronizes to offsite cloud storage (AWS S3).
#
# Usage:
#   ./scripts/db-backup.sh [database_name] [container_name]
# Defaults:
#   database_name:  glorov_medusa (or DB_NAME from env)
#   container_name: glorov-postgres
# ==============================================================================

set -euo pipefail

DB_NAME="${1:-${DB_NAME:-glorov_medusa}}"
CONTAINER_NAME="${2:-glorov-postgres}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/glorov_backup_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

# Create secure backup directory with restricted permissions (0700)
mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

echo "🌿 [GLOROV Backup] Starting backup for database: '${DB_NAME}'"
echo "📦 Target Container: '${CONTAINER_NAME}'"
echo "📂 Output Location:  '${BACKUP_FILE}'"
START_TIME=$(date +%s)

# 1. Execute pg_dump from within the Docker container and compress with gzip
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  docker exec -t "${CONTAINER_NAME}" pg_dump \
    -U "${DB_USER:-postgres}" \
    -d "${DB_NAME}" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists | gzip -9 > "${BACKUP_FILE}"
else
  # Fallback to direct pg_dump via DATABASE_URL if container is not running locally
  if [ -n "${DATABASE_URL:-}" ]; then
    echo "⚠️ Docker container '${CONTAINER_NAME}' not found. Using direct DATABASE_URL connection..."
    pg_dump "${DATABASE_URL}" \
      --no-owner \
      --no-privileges \
      --clean \
      --if-exists | gzip -9 > "${BACKUP_FILE}"
  else
    echo "❌ Error: Neither Docker container '${CONTAINER_NAME}' nor DATABASE_URL is available." >&2
    exit 1
  fi
fi

# 2. Enforce strict permissions (0600 - Owner read/write only)
chmod 600 "${BACKUP_FILE}"

# 3. Compute SHA-256 Checksum for cryptographically verified integrity
if command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
elif command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
else
  echo "⚠️ Warning: Neither shasum nor sha256sum found. Skipping checksum file generation."
fi

FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
DURATION=$(( $(date +%s) - START_TIME ))

echo "✅ [GLOROV Backup] Backup completed successfully in ${DURATION}s (${FILE_SIZE})"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "🔒 Checksum: $(cat "${CHECKSUM_FILE}")"
fi

# 4. Optional Offsite Synchronization (AWS S3)
if [ -n "${BACKUP_S3_BUCKET:-}" ]; then
  echo "☁️ Uploading encrypted backup to offsite bucket: ${BACKUP_S3_BUCKET}..."
  if command -v aws >/dev/null 2>&1; then
    aws s3 cp "${BACKUP_FILE}" "s3://${BACKUP_S3_BUCKET}/db-backups/$(basename "${BACKUP_FILE}")" --sse aws:kms
    aws s3 cp "${CHECKSUM_FILE}" "s3://${BACKUP_S3_BUCKET}/db-backups/$(basename "${CHECKSUM_FILE}")"
    echo "✅ Offsite synchronization complete."
  else
    echo "⚠️ Warning: AWS CLI not installed. Skipping offsite S3 sync."
  fi
fi

# 5. Local Backup Retention Cleanup (Prune files older than RETENTION_DAYS)
echo "🧹 Pruning local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "glorov_backup_*.sql.gz*" -type f -mtime +"${RETENTION_DAYS}" -delete
echo "✨ Backup routine finished."
