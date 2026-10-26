#!/usr/bin/env bash

# ==============================================================================
# GLOROV Automated Backup Integrity & Restoration Verification
# ==============================================================================
# Tests the latest database backup by restoring it into an ephemeral isolated
# PostgreSQL database, verifying entity row counts, and tearing down the
# temporary database.
#
# Usage:
#   ./scripts/db-backup-verify.sh [backup_file_path] [container_name]
# If backup_file_path is omitted, automatically verifies the latest backup in backups/.
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-backups}"
CONTAINER_NAME="${2:-glorov-postgres}"
TMP_DB="glorov_medusa_verify_tmp_$(date +%s)"
DB_USER="${DB_USER:-postgres}"

# Find latest backup if not supplied
if [ -n "${1:-}" ]; then
  BACKUP_FILE="$1"
else
  BACKUP_FILE=$(find "${BACKUP_DIR}" -name "glorov_backup_*.sql.gz" -type f | sort -r | head -1)
fi

if [ -z "${BACKUP_FILE}" ] || [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: No valid backup file found to verify in '${BACKUP_DIR}'." >&2
  exit 1
fi

echo "🌿 [GLOROV Backup Verify] Verifying backup: ${BACKUP_FILE}"
echo "🧪 Isolated Test Database: ${TMP_DB}"
START_TIME=$(date +%s)

# Function to ensure cleanup of temporary database on exit
cleanup() {
  echo "🧹 Tearing down ephemeral database '${TMP_DB}'..."
  docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c \
    "DROP DATABASE IF EXISTS \"${TMP_DB}\";" >/dev/null 2>&1 || true
}
trap cleanup EXIT

# 1. Run safe restoration into ephemeral database
./scripts/db-restore.sh "${BACKUP_FILE}" "${TMP_DB}" "${CONTAINER_NAME}"

# 2. Assert minimum entity thresholds
PRODUCT_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${TMP_DB}" -t -c \
  "SELECT COUNT(*) FROM product WHERE deleted_at IS NULL;" | tr -d '[:space:]')

ORDER_COUNT=$(docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${TMP_DB}" -t -c \
  "SELECT COUNT(*) FROM \"order\" WHERE deleted_at IS NULL;" | tr -d '[:space:]')

if [ "${PRODUCT_COUNT}" -eq 0 ]; then
  echo "❌ Verification Failed: Restored database contains 0 products!" >&2
  exit 1
fi

DURATION=$(( $(date +%s) - START_TIME ))
echo "🎉 [GLOROV Backup Verify] SUCCESS! Backup verified valid in ${DURATION}s."
echo "   - Verified Products: ${PRODUCT_COUNT}"
echo "   - Verified Orders:   ${ORDER_COUNT}"
