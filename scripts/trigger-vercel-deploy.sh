#!/usr/bin/env bash
# Trigger Vercel production deployment hook
set -e
VERCEL_HOOK="${VERCEL_DEPLOY_HOOK_URL:-https://api.vercel.com/v1/integrations/deploy/prj_hW7jKJQqYAvhMuMKp7YvbAxCVj23/w8Bl899HP2}"
echo "🚀 Triggering Vercel deployment hook..."
RESPONSE=$(curl -s -X POST "$VERCEL_HOOK")
echo "Response: $RESPONSE"
echo "✅ Vercel deployment initiated."
