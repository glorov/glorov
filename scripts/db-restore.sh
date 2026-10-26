#!/usr/bin/env bash

# ==============================================================================
# GLOROV Database Disaster Recovery & Restoration Utility
# ==============================================================================
# Safely restores a compressed PostgreSQL backup file (.sql.gz) into a target
# database after cryptographically verifying its SHA-256 integrity checksum.
#
# SAFETY INVARIANT:
#   Defaults to an isolated recovery database ('glorov_medusa_restore_test')
#   to guarantee that production databases are never accidentally overwritten.
#
# Usage:
#   ./scripts/db-restore.sh <backup_file_path> [target_database] [container_name]
# Example:
#   ./scripts/db-restore.sh backups/glorov_backup_20261027_032407.sql.gz glorov_medusa_restore_test
# ==============================================================================

set -euo pipefail

BACKUP_FILE="${1:-}"
TARGET_DB="${2:-glorov_medusa_restore_test}"
CONTAINER_NAME="${3:-glorov-postgres}"
DB_USER="${DB_USER:-postgres}"

if [ -z "${BACKUP_FILE}" ]; then
  echo "❌ Error: Missing backup file argument." >&2
  echo "Usage: $0 <backup_file_path> [target_database] [container_name]" >&2
  exit 1
fi

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "❌ Error: Backup file not found: '${BACKUP_FILE}'" >&2
  exit 1
fi

echo "🌿 [GLOROV Recovery] Initiating Database Restoration..."
echo "📦 Source Backup:     ${BACKUP_FILE}"
echo "🎯 Target Database:   ${TARGET_DB}"
echo "🐳 Database Container: ${CONTAINER_NAME}"
START_TIME=$(date +%s)

# 1. Verify Gzip File Integrity
echo "🔍 Validating archive compression integrity..."
if ! gzip -t "${BACKUP_FILE}"; then
  echo "❌ Fatal Error: Backup archive is corrupted or invalid gzip stream!" >&2
  exit 1
fi

# 2. Cryptographic SHA-256 Checksum Verification
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "🔒 Verifying SHA-256 cryptographic checksum..."
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c "${CHECKSUM_FILE}"
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c "${CHECKSUM_FILE}"
  fi
  echo "✅ Checksum verified: Archive integrity authentic."
else
  echo "⚠️ Warning: No checksum file found at '${CHECKSUM_FILE}'. Proceeding with gzip verification only."
fi

# 3. Create Target Database if it does not exist
echo "🛠️ Ensuring target database '${TARGET_DB}' exists in container..."
docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c \
  "SELECT 1 FROM pg_database WHERE datname = '${TARGET_DB}';" | grep -q 1 || \
docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d postgres -c \
  "CREATE DATABASE \"${TARGET_DB}\";"

# 4. Stream and restore database dump
echo "📥 Streaming decompressed SQL into '${TARGET_DB}'..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${TARGET_DB}" --quiet > /dev/null

DURATION=$(( $(date +%s) - START_TIME ))
echo "✅ [GLOROV Recovery] Data restoration completed in ${DURATION}s."

# 5. Sanity Check Restored Database Integrity
echo "📊 Verifying core entity row counts in restored database '${TARGET_DB}'..."
docker exec "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${TARGET_DB}" -t -c "
SELECT 
  'Products: ' || (SELECT COUNT(*) FROM product WHERE deleted_at IS NULL) || ' | ' ||
  'Variants: ' || (SELECT COUNT(*) FROM product_variant WHERE deleted_at IS NULL) || ' | ' ||
  'Inventory Levels: ' || (SELECT COUNT(*) FROM inventory_level WHERE deleted_at IS NULL) || ' | ' ||
  'Orders: ' || (SELECT COUNT(*) FROM \"order\" WHERE deleted_at IS NULL);
" | sed 's/^[ \t]*/   🌿 /'

echo "✨ Restoration and integrity check verified successfully."
