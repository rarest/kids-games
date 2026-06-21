#!/usr/bin/env bash
# Runs ON cc-arm. Pulls latest main and mirrors the site files into the
# 1Panel static-site docroot, then reloads OpenResty.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="games.596996.xyz"
DOCROOT="/opt/1panel/www/sites/$DOMAIN/index"

cd "$REPO_DIR"
git fetch --quiet origin main
git reset --hard --quiet origin/main

sudo rsync -a --delete \
  --exclude '.git' --exclude 'deploy' --exclude 'README.md' --exclude '.gitignore' \
  --exclude '.user.ini' --exclude '.well-known' \
  "$REPO_DIR"/ "$DOCROOT"/
sudo chmod -R a+rX "$DOCROOT"

C=$(sudo docker ps --format '{{.Names}}' | grep -i openresty | head -1)
[ -n "$C" ] && sudo docker exec "$C" openresty -s reload 2>/dev/null || true

echo "deployed $(git rev-parse --short HEAD) -> https://$DOMAIN"
