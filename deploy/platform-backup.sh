#!/usr/bin/env bash
set -euo pipefail
umask 077
BACKUP_DIR="${PLATFORM_BACKUP_DIR:-$HOME/.local/share/games-platform/backups}"
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
TEMP="$(mktemp "$BACKUP_DIR/.dump.XXXXXXXX")"
trap 'rm -f "$TEMP"' EXIT
sudo -n docker exec games-platform-db pg_dump -U postgres -d games_platform --format=custom > "$TEMP"
test -s "$TEMP"
mv "$TEMP" "$BACKUP_DIR/daily-$STAMP.dump"
if [ "$(TZ=Asia/Shanghai date +%u)" = 1 ]; then cp "$BACKUP_DIR/daily-$STAMP.dump" "$BACKUP_DIR/weekly-$STAMP.dump"; fi
python3 - "$BACKUP_DIR" <<'PY'
from pathlib import Path
import sys
folder = Path(sys.argv[1])
for prefix, keep in [('daily-', 7), ('weekly-', 4)]:
    for path in sorted(folder.glob(prefix + '*.dump'), reverse=True)[keep:]:
        path.unlink()
PY
echo '[platform] local database backup complete'
