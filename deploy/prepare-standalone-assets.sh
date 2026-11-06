#!/usr/bin/env bash
# ==============================================================================
# GLOROV Standalone Asset Packaging Engine
# Reference: GLOROV-DEPLOY-008
# Next.js Docs: https://nextjs.org/docs/app/api-reference/config/next-config-js/output#automatically-copying-traced-files
#
# Next.js standalone output produces a minimal Node.js server bundle at:
#   apps/storefront/.next/standalone/
# Next.js intentionally excludes `public/` and `.next/static/` from traced output
# because these should ideally be served via a CDN or reverse proxy.
# When served directly by the standalone Next.js server, these directories
# MUST be copied into the expected relative location.
# ==============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STOREFRONT_DIR="${REPO_ROOT}/apps/storefront"
STANDALONE_DIR="${STOREFRONT_DIR}/.next/standalone"
STANDALONE_STOREFRONT="${STANDALONE_DIR}/apps/storefront"

echo "🔍 Validating Next.js standalone directory structure..."

if [ ! -d "${STANDALONE_DIR}" ]; then
  echo "❌ Error: Standalone build directory not found at '${STANDALONE_DIR}'."
  echo "👉 Ensure 'pnpm --filter @glorov/storefront build' completed with output: 'standalone'."
  exit 1
fi

mkdir -p "${STANDALONE_STOREFRONT}"

# 1. Copy public static assets
if [ -d "${STOREFRONT_DIR}/public" ]; then
  echo "📦 Copying 'public/' directory into standalone bundle..."
  mkdir -p "${STANDALONE_STOREFRONT}/public"
  cp -r "${STOREFRONT_DIR}/public/." "${STANDALONE_STOREFRONT}/public/"
else
  echo "⚠️ Warning: 'public/' directory not found at ${STOREFRONT_DIR}/public. Static public assets omitted."
fi

# 2. Copy compiled .next/static bundle
if [ -d "${STOREFRONT_DIR}/.next/static" ]; then
  echo "📦 Copying '.next/static/' directory into standalone bundle..."
  mkdir -p "${STANDALONE_STOREFRONT}/.next/static"
  cp -r "${STOREFRONT_DIR}/.next/static/." "${STANDALONE_STOREFRONT}/.next/static/"
else
  echo "⚠️ Warning: '.next/static/' directory not found at ${STOREFRONT_DIR}/.next/static. JS/CSS chunks may 404!"
fi

# 3. Copy production environment configuration if present
if [ -f "${STOREFRONT_DIR}/.env.production" ]; then
  echo "📄 Copying '.env.production' into standalone bundle..."
  cp "${STOREFRONT_DIR}/.env.production" "${STANDALONE_STOREFRONT}/.env"
fi

echo "✅ Standalone Next.js assets assembled and validated successfully."
