#!/usr/bin/env bash
# Runs ON cc-arm through the existing webhook. Unchanged runtimes retain rooms.
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="games.596996.xyz"
# Explicit overrides support isolated deployment tests; defaults are production paths.
DOCROOT="${RESCUE_DEPLOY_DOCROOT:-/opt/1panel/www/sites/$DOMAIN/index}"
UNIT_DIR="${RESCUE_DEPLOY_UNIT_DIR:-$HOME/.config/systemd/user}"
PROXY_DIR="$(dirname "$DOCROOT")/proxy"
cd "$REPO_DIR"
STATE_DIR="$(git rev-parse --git-path games-deploy)"
mkdir -p "$STATE_DIR" "$UNIT_DIR"

production_dependencies() {
  node --input-type=module - "$1" <<'JS'
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const revision=process.argv[2];
const read=path=>JSON.parse(revision==='WORKTREE'?readFileSync(path):execFileSync('git',['show',`${revision}:${path}`]));
const pkg=read('package.json'),lock=read('package-lock.json');
const production=Object.entries(lock.packages??{}).filter(([path,p])=>path&&!p.dev).sort(([a],[b])=>a.localeCompare(b));
console.log(createHash('sha256').update(JSON.stringify([pkg.dependencies,pkg.optionalDependencies,pkg.overrides,production])).digest('hex'));
JS
}

runtime_fingerprint() {
  node --input-type=module - "$1" "$2" "$3" <<'JS'
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const [game,revision,dependencies]=process.argv.slice(2);
const files={
 shooter:['server.mjs','core.js','snapshot.js'],
 rescue:['server.mjs','net-codec.js','core.js','bosses.js','campaign.js','levels.js'],
 racing:['server.mjs','core.js','routes.js','contact.js','hazards.js'],
}[game];
const paths=[`deploy/${game}-coop.service`,...files.map(file=>`${game}/${file}`)];
const contents=paths.map(path=>{
 if(revision==='WORKTREE')return [path,readFileSync(path,'utf8')];
 // New games may not have a service/server in the pre-online checkout.
 const exists=execFileSync('git',['ls-tree','--name-only',revision,'--',path],{encoding:'utf8'}).trim();
 return [path,exists?execFileSync('git',['show',`${revision}:${path}`],{encoding:'utf8'}):null];
});
console.log(createHash('sha256').update(JSON.stringify([dependencies,contents])).digest('hex'));
JS
}

# Bootstrap before pulling. Each marker advances only after its own phase succeeds,
# so a later proxy failure never restarts an already-updated game on the next run.
PREVIOUS_HEAD="$(git rev-parse HEAD)"
PREVIOUS_DEPENDENCIES="$(production_dependencies "$PREVIOUS_HEAD")"
if [ ! -f "$STATE_DIR/dependencies" ]; then printf '%s\n' "$PREVIOUS_DEPENDENCIES" > "$STATE_DIR/dependencies"; fi
for GAME in shooter rescue racing; do
  if [ ! -f "$STATE_DIR/$GAME-runtime" ]; then runtime_fingerprint "$GAME" "$PREVIOUS_HEAD" "$PREVIOUS_DEPENDENCIES" > "$STATE_DIR/$GAME-runtime"; fi
done
git fetch --quiet origin main
git reset --hard --quiet origin/main
CURRENT_DEPENDENCIES="$(production_dependencies WORKTREE)"
if [ "$(cat "$STATE_DIR/dependencies")" != "$CURRENT_DEPENDENCIES" ] || [ ! -d node_modules/ws ] || [ -f "$STATE_DIR/dependencies-pending" ]; then
  touch "$STATE_DIR/dependencies-pending"
  npm ci --omit=dev --ignore-scripts --no-audit --no-fund
  printf '%s\n' "$CURRENT_DEPENDENCIES" > "$STATE_DIR/dependencies"
  rm -f "$STATE_DIR/dependencies-pending"
fi

sudo rsync -a --delete \
  --exclude '.git' --exclude 'deploy' --exclude 'README.md' --exclude '.gitignore' \
  --exclude '.agents' --exclude '.superpowers' --exclude 'openspec' --exclude 'node_modules' \
  --exclude 'shooter/server.mjs' --exclude 'rescue/server.mjs' --exclude 'racing/server.mjs' \
  --exclude 'platform' --exclude '.env' --exclude '.env.*' \
  --exclude '.user.ini' --exclude '.well-known' \
  "$REPO_DIR"/ "$DOCROOT"/
sudo chmod -R a+rX "$DOCROOT"
# Exclusions protect old receiver files from rsync --delete. Remove only legacy
# backend copies; live runtimes and database data live outside this docroot.
sudo rm -rf -- "$DOCROOT/platform"
sudo rm -f -- "$DOCROOT/shooter/server.mjs" "$DOCROOT/rescue/server.mjs" "$DOCROOT/racing/server.mjs"
sudo mkdir -p "$PROXY_DIR"

PROXY_CHANGED=false
if [ -f "$STATE_DIR/proxy-pending" ]; then PROXY_CHANGED=true; fi
for GAME in shooter rescue racing; do
  UNIT_CHANGED=false
  if [ -f "$STATE_DIR/$GAME-unit-pending" ] || ! cmp -s "deploy/$GAME-coop.service" "$UNIT_DIR/$GAME-coop.service"; then
    touch "$STATE_DIR/$GAME-unit-pending"
    cp "deploy/$GAME-coop.service" "$UNIT_DIR/$GAME-coop.service"
    systemctl --user daemon-reload
    UNIT_CHANGED=true
  fi
  CURRENT_RUNTIME="$(runtime_fingerprint "$GAME" WORKTREE "$CURRENT_DEPENDENCIES")"
  if ! systemctl --user is-enabled --quiet "$GAME-coop.service"; then systemctl --user enable "$GAME-coop.service"; fi
  if ! systemctl --user is-active --quiet "$GAME-coop.service"; then
    systemctl --user start "$GAME-coop.service"
  elif $UNIT_CHANGED || [ "$(cat "$STATE_DIR/$GAME-runtime")" != "$CURRENT_RUNTIME" ]; then
    systemctl --user restart "$GAME-coop.service"
  fi
  printf '%s\n' "$CURRENT_RUNTIME" > "$STATE_DIR/$GAME-runtime"
  rm -f "$STATE_DIR/$GAME-unit-pending"
  if ! cmp -s "deploy/$GAME-coop.conf" "$PROXY_DIR/$GAME-coop.conf"; then
    touch "$STATE_DIR/proxy-pending"
    sudo install -m 644 "deploy/$GAME-coop.conf" "$PROXY_DIR/$GAME-coop.conf"
    PROXY_CHANGED=true
  fi
done

# Platform dependencies are isolated: a platform update must preserve game rooms.
if [ -f deploy/games-platform.service ] && [ -f platform/package-lock.json ]; then
  PLATFORM_CONFIG="${PLATFORM_DEPLOY_CONFIG:-$HOME/.config/games-platform/app.env}"
  if [ ! -f "$PLATFORM_CONFIG" ]; then echo 'Platform configuration missing outside docroot' >&2; exit 1; fi
  PLATFORM_DEPENDENCIES="$(sha256sum platform/package.json platform/package-lock.json | sha256sum | cut -d' ' -f1)"
  if [ ! -f "$STATE_DIR/platform-dependencies" ] || [ "$(cat "$STATE_DIR/platform-dependencies")" != "$PLATFORM_DEPENDENCIES" ] || [ ! -d platform/node_modules/pg ]; then
    npm ci --prefix platform --omit=dev --ignore-scripts --no-audit --no-fund
    printf '%s\n' "$PLATFORM_DEPENDENCIES" > "$STATE_DIR/platform-dependencies"
  fi
  PLATFORM_RUNTIME="$(sha256sum deploy/games-platform.service platform/server.mjs platform/store.mjs platform/periods.mjs platform/migrations/*.sql | sha256sum | cut -d' ' -f1)"
  PLATFORM_UNIT_CHANGED=false
  for UNIT in games-platform.service games-platform-backup.service games-platform-backup.timer; do
    if ! cmp -s "deploy/$UNIT" "$UNIT_DIR/$UNIT"; then
      cp "deploy/$UNIT" "$UNIT_DIR/$UNIT"
      systemctl --user daemon-reload
      if [ "$UNIT" = games-platform.service ]; then PLATFORM_UNIT_CHANGED=true; fi
    fi
  done
  systemctl --user enable games-platform.service games-platform-backup.timer
  if ! systemctl --user is-active --quiet games-platform.service; then
    systemctl --user start games-platform.service
  elif $PLATFORM_UNIT_CHANGED || [ ! -f "$STATE_DIR/platform-runtime" ] || [ "$(cat "$STATE_DIR/platform-runtime")" != "$PLATFORM_RUNTIME:$PLATFORM_DEPENDENCIES" ]; then
    systemctl --user restart games-platform.service
  fi
  printf '%s\n' "$PLATFORM_RUNTIME:$PLATFORM_DEPENDENCIES" > "$STATE_DIR/platform-runtime"
  systemctl --user start games-platform-backup.timer
  if ! cmp -s deploy/games-platform.conf "$PROXY_DIR/games-platform.conf"; then
    touch "$STATE_DIR/proxy-pending"
    sudo install -m 644 deploy/games-platform.conf "$PROXY_DIR/games-platform.conf"
    PROXY_CHANGED=true
  fi
fi

# Install all routes before validating; static-only deploys do not disrupt sockets.
if $PROXY_CHANGED; then
  CONTAINER=$(sudo docker ps --format '{{.Names}}' | awk 'tolower($0) ~ /openresty/ {print; exit}')
  if [ -z "$CONTAINER" ]; then echo 'OpenResty container unavailable' >&2; exit 1; fi
  sudo docker exec "$CONTAINER" openresty -t
  sudo docker exec "$CONTAINER" openresty -s reload
  rm -f "$STATE_DIR/proxy-pending"
fi

echo "deployed $(git rev-parse --short HEAD) -> https://$DOMAIN"
