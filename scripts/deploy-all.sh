#!/usr/bin/env bash
# ==============================================================================
# GLOROV — Master Automated Deployment Pipeline
# 1. Pushes code changes to GitHub (elsesourav/glorov.com)
# 2. Deploys Backend to Azure VM (20.244.48.139)
# 3. Deploys Frontend to Firebase Hosting (glorov-store.web.app)
# ==============================================================================
set -e

COMMIT_MSG="${1:-chore(deploy): sync project updates across GitHub, VM, and Firebase}"

echo "=========================================================="
echo "🚀 GLOROV: Starting Master Deployment Pipeline"
echo "=========================================================="

# Step 1: Git commit & push
echo ""
echo "=== Step 1: Pushing changes to GitHub (glorov.com) ==="
git add -A
if ! git diff-index --quiet HEAD --; then
  git commit -m "${COMMIT_MSG}"
fi
git push -u origin main
echo "✅ Pushed to GitHub: https://github.com/elsesourav/glorov.com"

# Step 2: Deploy Backend to VM
echo ""
echo "=== Step 2: Deploying Backend to Azure VM ==="
./scripts/deploy-vm.sh

# Step 3: Deploy Frontend to Firebase
echo ""
echo "=== Step 3: Deploying Frontend to Firebase Hosting ==="
./scripts/deploy-firebase.sh

echo ""
echo "=========================================================="
echo "🎉 ALL DEPLOYMENTS COMPLETED SUCCESSFULLY!"
echo "• GitHub Repo:      https://github.com/elsesourav/glorov.com"
echo "• Firebase Hosting: https://glorov-store.web.app"
echo "• VM Backend API:   http://20.244.48.139/medusa"
echo "=========================================================="
