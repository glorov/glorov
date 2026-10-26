#!/bin/sh
set -e

echo "🌿 [GLOROV Backend] Initializing production container runtime..."

# Validate required production environment variables
if [ "$NODE_ENV" = "production" ]; then
  if [ -z "$DATABASE_URL" ]; then
    echo "❌ FATAL: DATABASE_URL is required in production."
    exit 1
  fi
  if [ -z "$REDIS_URL" ]; then
    echo "❌ FATAL: REDIS_URL is required in production."
    exit 1
  fi
  if [ -z "$JWT_SECRET" ]; then
    echo "❌ FATAL: JWT_SECRET is required in production."
    exit 1
  fi
  if [ -z "$COOKIE_SECRET" ]; then
    echo "❌ FATAL: COOKIE_SECRET is required in production."
    exit 1
  fi
fi

# Optional automatic database migration on startup
if [ "$AUTO_MIGRATE" = "true" ] || [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "📦 Running database migrations..."
  pnpm --filter @glorov/backend db:migrate
  echo "✅ Database migrations applied successfully."
fi

# Optional seed for initial Indian regional data
if [ "$RUN_SEED" = "true" ]; then
  echo "🌱 Seeding Indian botanical regional configuration..."
  pnpm --filter @glorov/backend exec npx tsx src/scripts/seed-india-region.ts || true
  echo "✅ Seeding step completed."
fi

echo "🚀 Starting GLOROV Medusa v2 server process..."
exec pnpm --filter @glorov/backend start
