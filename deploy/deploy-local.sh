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
  --exclude '.agents' --exclude 'openspec' --exclude 'node_modules' --exclude 'shooter/server.mjs' \
  --exclude '.user.ini' --exclude '.well-known' \
  "$REPO_DIR"/ "$DOCROOT"/
sudo chmod -R a+rX "$DOCROOT"

# The cooperative service shares the checked-in simulation with the browser.
if [ -f shooter/server.mjs ]; then
  npm ci --omit=dev --ignore-scripts --no-audit --no-fund
  mkdir -p "$HOME/.config/systemd/user"
  cp deploy/shooter-coop.service "$HOME/.config/systemd/user/shooter-coop.service"
  systemctl --user daemon-reload
  systemctl --user enable --now shooter-coop.service
  systemctl --user restart shooter-coop.service
  sudo install -m 644 deploy/shooter-coop.conf "/opt/1panel/www/sites/$DOMAIN/proxy/shooter-coop.conf"
fi

C=$(sudo docker ps --format '{{.Names}}' | grep -i openresty | head -1)
if [ -n "$C" ]; then
  sudo docker exec "$C" openresty -t
  sudo docker exec "$C" openresty -s reload
fi

echo "deployed $(git rev-parse --short HEAD) -> https://$DOMAIN"
